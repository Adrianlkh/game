import React, { useRef, useEffect, useCallback } from 'react';
import {
  AIDifficulty,
  BallState,
  BattleFormat,
  CharacterType,
  GameMode,
  MatchScore,
  Particle,
  PlayerState,
  Projectile,
  ThunderVisual,
} from '../types';
import {
  BALL_GRAVITY,
  BALL_MAX_SPEED,
  CHARACTER_META,
  COUNTDOWN_TOTAL_FRAMES,
  COURT_HEIGHT,
  COURT_WIDTH,
  GROUND_Y,
  JUMP_FORCE,
  MEWTWO_TELEPORT_CHARGE_FRAMES,
  NET_TOP_Y,
  NET_WIDTH,
  NET_X,
  PLAYER_SPEED,
  POINTS_PER_CHARACTER_3V3,
  SHURIKEN_RECHARGE_INTERVAL,
  getCharacterPowerMultiplier,
} from '../constants';
import {
  applyPlayerMovementAndGravity,
  castPikachuThunder,
  createInitialPlayerState,
  resetPlayerForNewCharacter,
  resetPlayerForServe,
  spawnParticles,
  triggerCharacterActionSkill,
  updatePlayerAnimationKinematics,
} from '../engine/physics';
import { renderBeachBackground, renderCountdownAndPointBanners } from '../rendering/backgroundRenderer';
import { renderCharacter } from '../rendering/characterRenderer';
import { renderBallAndEffects, renderParticles, renderProjectiles, renderThunderStrikes } from '../rendering/effectsRenderer';
import { audio } from '../services/audioService';

interface GameCanvasProps {
  battleFormat: BattleFormat;
  gameMode: GameMode;
  difficulty: AIDifficulty;
  targetScore: number;
  p1Char: CharacterType;
  p2Char: CharacterType;
  p1ActiveIdx: number;
  p2ActiveIdx: number;
  isPaused: boolean;
  score: MatchScore;
  onScoreUpdate: (
    newScore: MatchScore,
    scorer: 'P1' | 'P2',
    eventType: 'POINT' | 'SPIKE' | 'DIVE_SAVE' | 'DEUCE' | 'ADVANTAGE' | 'TAG_IN'
  ) => void;
  onRallyIncrement: (rally: number) => void;
  touchInput?: {
    p1Left: boolean;
    p1Right: boolean;
    p1Jump: boolean;
    p1Action: boolean;
  };
}

export const GameCanvas: React.FC<GameCanvasProps> = ({
  battleFormat,
  gameMode,
  difficulty,
  targetScore,
  p1Char,
  p2Char,
  p1ActiveIdx,
  p2ActiveIdx,
  isPaused,
  score,
  onScoreUpdate,
  onRallyIncrement,
  touchInput,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const keysPressed = useRef<{ [key: string]: boolean }>({});
  const projectiles = useRef<Projectile[]>([]);
  const activeThunderStrikes = useRef<ThunderVisual[]>([]);

  const prevP1JumpPressed = useRef<boolean>(false);
  const prevP2JumpPressed = useRef<boolean>(false);
  const screenShake = useRef<number>(0);

  const countdownTimer = useRef<number>(COUNTDOWN_TOTAL_FRAMES);
  const lastBeepStep = useRef<number | string | null>(null);
  const tagInBanner = useRef<string | null>(null);

  const p1 = useRef<PlayerState>(createInitialPlayerState('P1', p1Char));
  const p2 = useRef<PlayerState>(createInitialPlayerState('P2', p2Char));

  // Reset character state whenever active character or squad slot index changes
  useEffect(() => {
    resetPlayerForNewCharacter(p1.current, p1Char);
  }, [p1Char, p1ActiveIdx]);

  useEffect(() => {
    resetPlayerForNewCharacter(p2.current, p2Char);
  }, [p2Char, p2ActiveIdx]);

  // Full match reset when score resets to 0-0
  useEffect(() => {
    if (score.p1 === 0 && score.p2 === 0) {
      resetPlayerForNewCharacter(p1.current, p1Char);
      resetPlayerForNewCharacter(p2.current, p2Char);
      projectiles.current = [];
      activeThunderStrikes.current = [];
      tagInBanner.current = null;
      countdownTimer.current = COUNTDOWN_TOTAL_FRAMES;
      lastBeepStep.current = null;
    }
  }, [score.p1, score.p2, p1Char, p2Char]);

  const ball = useRef<BallState>({
    x: 200,
    y: 120,
    vx: 0,
    vy: 0,
    radius: 19,
    rotation: 0,
    isSuperCharged: false,
    element: 'NORMAL',
    trail: [],
    teleportWarp: null,
  });

  const particles = useRef<Particle[]>([]);
  const waveOffset = useRef<number>(0);
  const cloudOffset = useRef<number>(0);
  const rallyCount = useRef<number>(0);
  const pointResetDelay = useRef<number>(0);
  const servingSide = useRef<'P1' | 'P2'>('P1');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].includes(e.code) || ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
        e.preventDefault();
      }
      keysPressed.current[e.code] = true;
      keysPressed.current[e.key] = true;
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      keysPressed.current[e.code] = false;
      keysPressed.current[e.key] = false;
    };

    window.addEventListener('keydown', handleKeyDown, { passive: false });
    window.addEventListener('keyup', handleKeyUp, { passive: false });
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  const resetBall = useCallback(
    (server: 'P1' | 'P2') => {
      servingSide.current = server;
      rallyCount.current = 0;
      onRallyIncrement(0);

      const serveX = server === 'P1' ? 200 : 600;
      ball.current = {
        x: serveX,
        y: 120,
        vx: 0,
        vy: 0,
        radius: 19,
        rotation: 0,
        isSuperCharged: false,
        element: 'NORMAL',
        trail: [],
        teleportWarp: null,
      };

      projectiles.current = [];
      activeThunderStrikes.current = [];
      screenShake.current = 0;
      tagInBanner.current = null;

      // Save remaining skill charges across points for 1v1 or surviving 3v3 fighters,
      // while resetting positional/status flags
      const p1Charges = p1.current.skillCharges;
      const p2Charges = p2.current.skillCharges;
      const p1ShurikenTimer = p1.current.shurikenRechargeTimer;
      const p2ShurikenTimer = p2.current.shurikenRechargeTimer;

      resetPlayerForServe(p1.current);
      resetPlayerForServe(p2.current);

      p1.current.skillCharges = p1Charges;
      p2.current.skillCharges = p2Charges;
      p1.current.shurikenRechargeTimer = p1ShurikenTimer;
      p2.current.shurikenRechargeTimer = p2ShurikenTimer;

      countdownTimer.current = COUNTDOWN_TOTAL_FRAMES;
      lastBeepStep.current = null;
    },
    [onRallyIncrement]
  );

  useEffect(() => {
    let animationFrameId: number;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const setShake = (amount: number) => {
      screenShake.current = amount;
    };

    const updatePhysics = () => {
      if (isPaused) return;

      if (screenShake.current > 0) {
        screenShake.current--;
      }

      if (pointResetDelay.current > 0) {
        pointResetDelay.current--;
        if (pointResetDelay.current === 0) {
          resetBall(servingSide.current);
        }
        return;
      }

      // 3 -> 2 -> 1 -> START! Countdown Phase
      if (countdownTimer.current > 0) {
        countdownTimer.current--;

        let currentStep: 3 | 2 | 1 | 'START';
        if (countdownTimer.current > 85) {
          currentStep = 3;
        } else if (countdownTimer.current > 55) {
          currentStep = 2;
        } else if (countdownTimer.current > 25) {
          currentStep = 1;
        } else {
          currentStep = 'START';
        }

        if (lastBeepStep.current !== currentStep) {
          lastBeepStep.current = currentStep;
          audio.playCountdownBeep(currentStep);
        }

        const serveX = servingSide.current === 'P1' ? 200 : 600;
        ball.current.x = serveX;
        ball.current.y = 120 + Math.sin(Date.now() * 0.008) * 6;
        ball.current.vx = 0;
        ball.current.vy = 0;

        if (countdownTimer.current === 0) {
          ball.current.vx = servingSide.current === 'P1' ? 1.8 : -1.8;
          ball.current.vy = -1.5;
          spawnParticles(particles.current, ball.current.x, ball.current.y, '#FDE047', 10, 3, 'SPARK');
        }

        waveOffset.current += 0.04;
        cloudOffset.current += 0.15;
        return;
      }

      // Snorlax Rest & Ultra Awakening
      [p1.current, p2.current].forEach((p) => {
        if (p.isResting) {
          p.restTimer--;
          p.snoreTimer = (p.snoreTimer + 1) % 45;
          if (p.snoreTimer === 0) {
            spawnParticles(particles.current, p.x + (p.facing === 'right' ? 15 : -15), p.y - 38, '#A7F3D0', 1, 1.5, 'SNORLAX_Z');
          }
          if (p.restTimer <= 0) {
            p.isResting = false;
            p.isAwakenedUltra = true;
            audio.playSnorlaxAwaken();
            setShake(10);
            spawnParticles(particles.current, p.x, p.y - 25, '#FDE047', 28, 7, 'HYPER_BLAST');
            spawnParticles(particles.current, p.x, p.y - 25, '#10B981', 20, 6, 'HYPER_BLAST');
          }
        }
      });

      // Greninja Shuriken 10-second Auto Recharge
      [p1.current, p2.current].forEach((p) => {
        if (p.character === 'GRENINJA') {
          p.shurikenRechargeTimer--;
          if (p.shurikenRechargeTimer <= 0) {
            p.shurikenRechargeTimer = SHURIKEN_RECHARGE_INTERVAL;
            if (p.skillCharges < p.maxSkillCharges) {
              p.skillCharges++;
              spawnParticles(particles.current, p.x, p.y - 25, '#38BDF8', 8, 2.5, 'BUBBLE');
            }
          }
        }
      });

      // Stun & Hack Timers
      [p1.current, p2.current].forEach((p) => {
        if (p.stunTimer > 0) {
          p.stunTimer--;
          p.vx = 0;
          p.isFlying = false;
          p.isVoltDashing = false;
          p.expression = 'SURPRISED';
        }
        if (p.hackEffectTimer > 0) p.hackEffectTimer--;
      });

      for (let i = activeThunderStrikes.current.length - 1; i >= 0; i--) {
        activeThunderStrikes.current[i].timer--;
        if (activeThunderStrikes.current[i].timer <= 0) {
          activeThunderStrikes.current.splice(i, 1);
        }
      }

      // Projectiles (Homing Water Shuriken)
      for (let i = projectiles.current.length - 1; i >= 0; i--) {
        const pr = projectiles.current[i];
        const target = pr.owner === 'P1' ? p2.current : p1.current;

        if (pr.type === 'WATER_SHURIKEN') {
          const targetY = target.y - 26;
          const targetX = target.x;
          const angleToTarget = Math.atan2(targetY - pr.y, targetX - pr.x);
          const speed = 9.8;
          pr.vx = pr.vx * 0.85 + Math.cos(angleToTarget) * speed * 0.15;
          pr.vy = pr.vy * 0.85 + Math.sin(angleToTarget) * speed * 0.15;
        }

        pr.x += pr.vx;
        pr.y += pr.vy;
        pr.rotation += 0.35;
        pr.life++;

        spawnParticles(particles.current, pr.x, pr.y, '#38BDF8', 1, 1, 'BUBBLE');

        const distToTarget = Math.hypot(pr.x - target.x, pr.y - (target.y - 25));
        if (distToTarget < 36) {
          target.stunTimer = pr.stunDuration;
          audio.playStunHit();
          spawnParticles(particles.current, target.x, target.y - 20, '#38BDF8', 16, 5, 'SHURIKEN_SPLASH');
          projectiles.current.splice(i, 1);
          continue;
        }

        if (pr.x < 10 || pr.x > COURT_WIDTH - 10 || pr.life >= pr.maxLife) {
          projectiles.current.splice(i, 1);
        }
      }

      // ===================================
      // 1. Process P1 Input & Physics
      // ===================================
      const p1Keys = keysPressed.current;
      const p1MoveLeft = !!(p1Keys['KeyA'] || p1Keys['a'] || touchInput?.p1Left || (gameMode === '1P_VS_AI' && (p1Keys['ArrowLeft'] || p1Keys['Left'])));
      const p1MoveRight = !!(p1Keys['KeyD'] || p1Keys['d'] || touchInput?.p1Right || (gameMode === '1P_VS_AI' && (p1Keys['ArrowRight'] || p1Keys['Right'])));
      const p1JumpOrFly = !!(p1Keys['KeyW'] || p1Keys['w'] || touchInput?.p1Jump || (gameMode === '1P_VS_AI' && (p1Keys['ArrowUp'] || p1Keys['Up'])));
      const p1Action = !!(p1Keys['KeyF'] || p1Keys['f'] || p1Keys['Space'] || p1Keys[' '] || p1Keys['KeyZ'] || p1Keys['z'] || touchInput?.p1Action);

      if (p1.current.skillCooldown > 0) p1.current.skillCooldown--;
      if (p1.current.teleportCooldown > 0) p1.current.teleportCooldown--;
      if (p1.current.mewFlashTimer > 0) p1.current.mewFlashTimer--;

      const p1JumpTappedFresh = p1JumpOrFly && !prevP1JumpPressed.current;
      prevP1JumpPressed.current = p1JumpOrFly;

      if (p1Action && p1.current.stunTimer <= 0 && !p1.current.isAbilityDisabledForPoint && p1.current.skillCooldown <= 0) {
        triggerCharacterActionSkill(
          p1.current,
          p2.current,
          ball.current,
          activeThunderStrikes.current,
          projectiles.current,
          particles.current,
          setShake
        );
      }

      applyPlayerMovementAndGravity(
        p1.current,
        p1MoveLeft,
        p1MoveRight,
        p1JumpOrFly,
        p1Action,
        p1JumpTappedFresh,
        particles.current
      );

      // ===================================
      // 2. Process P2 Input or AI
      // ===================================
      const p2Keys = keysPressed.current;
      const p2CharType = p2.current.character;
      if (p2.current.skillCooldown > 0) p2.current.skillCooldown--;
      if (p2.current.teleportCooldown > 0) p2.current.teleportCooldown--;
      if (p2.current.mewFlashTimer > 0) p2.current.mewFlashTimer--;

      let p2MoveLeft = false;
      let p2MoveRight = false;
      let p2JumpOrFly = false;
      let p2Action = false;
      let p2JumpTappedFresh = false;

      if (gameMode === '1P_VS_AI') {
        const ai = p2.current;
        const b = ball.current;

        let targetX = 620;
        let aiSpeed = difficulty === 'EASY' ? PLAYER_SPEED * 0.75 : difficulty === 'NORMAL' ? PLAYER_SPEED * 0.95 : PLAYER_SPEED * 1.15;
        if (ai.isResting) aiSpeed *= 0.75;

        if (b.teleportWarp && b.teleportWarp.phase === 'CHARGING' && b.teleportWarp.toX > NET_X) {
          targetX = b.teleportWarp.toX;
        } else if (b.vx > 0 || b.x > 360) {
          targetX = b.x + (b.vx > 0 ? 10 : -10);
        } else {
          targetX = 620;
        }

        const diffX = targetX - ai.x;
        if (ai.stunTimer <= 0) {
          if (Math.abs(diffX) > 12) {
            ai.vx = diffX > 0 ? aiSpeed : -aiSpeed;
            ai.facing = 'left';
          } else {
            ai.vx = 0;
          }
        }

        // Squirtle AI Double Jump
        if (p2CharType === 'SQUIRTLE' && !ai.isGrounded && ai.airJumpCount < ai.maxAirJumps && ai.stunTimer <= 0 && b.x > NET_X + 20 && b.y < ai.y - 25) {
          if (Math.random() < 0.12) {
            p2JumpTappedFresh = true;
          }
        }

        // AI Skill Usage
        if (ai.stunTimer <= 0 && !ai.isAbilityDisabledForPoint && ai.skillCooldown <= 0 && ai.skillCharges > 0) {
          const shouldCast =
            (p2CharType === 'SNORLAX' && !ai.isResting && !ai.isAwakenedUltra && Math.random() < 0.035) ||
            (p2CharType === 'PIKACHU' && Math.random() < 0.035) ||
            (p2CharType === 'GRENINJA' && Math.random() < 0.04) ||
            (p2CharType === 'ORBIT' && rallyCount.current >= 2 && Math.random() < 0.03) ||
            (p2CharType === 'MEW' && b.x > NET_X + 25 && b.vy > 0 && b.y > 170);

          if (shouldCast) {
            triggerCharacterActionSkill(
              ai,
              p1.current,
              ball.current,
              activeThunderStrikes.current,
              projectiles.current,
              particles.current,
              setShake
            );
          }
        }

        const isBallInSpikeRange = b.x > 450 && b.x < 740 && b.y < 260 && b.y > 140;
        const isBallInCloseReach = Math.abs(b.x - ai.x) < 45 && b.y < 270;

        if (ai.stunTimer <= 0 && ai.isGrounded && isBallInCloseReach && (b.y < 240 || isBallInSpikeRange)) {
          ai.vy = JUMP_FORCE;
          ai.isGrounded = false;
          ai.isJumping = true;
          audio.playJump();
        }

        // Apply double jump & gravity for AI (using movement flags false since AI sets vx directly)
        if (p2CharType === 'SQUIRTLE' && p2JumpTappedFresh && ai.airJumpCount < ai.maxAirJumps) {
          ai.vy = JUMP_FORCE * 0.98;
          ai.airJumpCount++;
          audio.playJump();
          spawnParticles(particles.current, ai.x, ai.y + 12, '#38BDF8', 8, 3, 'BUBBLE');
        }

        ai.vy += GRAVITY;
        ai.x += ai.vx;
        ai.y += ai.vy;
        if (ai.y >= GROUND_Y) {
          ai.y = GROUND_Y;
          ai.vy = 0;
          ai.isGrounded = true;
          ai.isJumping = false;
          ai.airJumpCount = 0;
        }
        ai.squashX += (1 - ai.squashX) * 0.15;
        ai.squashY += (1 - ai.squashY) * 0.15;
        if (ai.x < NET_X + 35) ai.x = NET_X + 35;
        if (ai.x > 755) ai.x = 755;
      } else {
        // 2-Player Local Mode
        p2MoveLeft = !!(p2Keys['ArrowLeft'] || p2Keys['Left'] || p2Keys['KeyJ'] || p2Keys['j'] || p2Keys['Numpad4']);
        p2MoveRight = !!(p2Keys['ArrowRight'] || p2Keys['Right'] || p2Keys['KeyL'] || p2Keys['l'] || p2Keys['Numpad6']);
        p2JumpOrFly = !!(p2Keys['ArrowUp'] || p2Keys['Up'] || p2Keys['KeyI'] || p2Keys['i'] || p2Keys['Numpad8'] || p2Keys['Numpad5']);
        p2Action = !!(p2Keys['Enter'] || p2Keys['NumpadEnter'] || p2Keys['KeyK'] || p2Keys['k'] || p2Keys['Numpad0']);

        p2JumpTappedFresh = p2JumpOrFly && !prevP2JumpPressed.current;
        prevP2JumpPressed.current = p2JumpOrFly;

        if (p2Action && p2.current.stunTimer <= 0 && !p2.current.isAbilityDisabledForPoint && p2.current.skillCooldown <= 0) {
          triggerCharacterActionSkill(
            p2.current,
            p1.current,
            ball.current,
            activeThunderStrikes.current,
            projectiles.current,
            particles.current,
            setShake
          );
        }

        applyPlayerMovementAndGravity(
          p2.current,
          p2MoveLeft,
          p2MoveRight,
          p2JumpOrFly,
          p2Action,
          p2JumpTappedFresh,
          particles.current
        );
      }

      updatePlayerAnimationKinematics(p1.current);
      updatePlayerAnimationKinematics(p2.current);

      // ===================================
      // 3. Ball Physics & Hit Collisions
      // ===================================
      const b = ball.current;

      if (b.teleportWarp) {
        if (b.teleportWarp.phase === 'CHARGING') {
          b.teleportWarp.timer--;
          b.x = b.teleportWarp.fromX;
          b.y = b.teleportWarp.fromY;
          b.vx = 0;
          b.vy = 0;
          b.rotation += 0.25;

          if (b.teleportWarp.timer <= 0) {
            b.teleportWarp.phase = 'EMERGED';
            b.teleportWarp.timer = 18;

            b.x = b.teleportWarp.toX;
            b.y = b.teleportWarp.toY;
            b.isSuperCharged = true;
            b.element = 'PSYCHIC';

            const dir = b.teleportWarp.spikeDirection;
            b.vx = dir * 5.4;
            b.vy = 5.2;

            audio.playTeleport();
            spawnParticles(particles.current, b.x, b.y, '#C084FC', 16, 5, 'PORTAL');
          }
        } else {
          b.teleportWarp.timer--;
          if (b.teleportWarp.timer <= 0) {
            b.teleportWarp = null;
          }
          b.vy += BALL_GRAVITY;
          b.x += b.vx;
          b.y += b.vy;
          b.rotation += b.vx * 0.05;
          b.vx *= 0.996;
        }
      } else {
        b.vy += BALL_GRAVITY;
        b.x += b.vx;
        b.y += b.vy;
        b.rotation += b.vx * 0.05;
        b.vx *= 0.996;
      }

      const currentSpeed = Math.hypot(b.vx, b.vy);
      if (currentSpeed > BALL_MAX_SPEED) {
        b.vx = (b.vx / currentSpeed) * BALL_MAX_SPEED;
        b.vy = (b.vy / currentSpeed) * BALL_MAX_SPEED;
      }

      b.trail.unshift({ x: b.x, y: b.y, charged: b.isSuperCharged, element: b.element, alpha: 0.8 });
      if (b.trail.length > 8) b.trail.pop();
      b.trail.forEach((t) => (t.alpha *= 0.82));

      // Wall Collisions
      if (b.x - b.radius < 20) {
        b.x = 20 + b.radius;
        b.vx = Math.abs(b.vx) * 0.85;
        audio.playBump();
      } else if (b.x + b.radius > COURT_WIDTH - 20) {
        b.x = COURT_WIDTH - 20 - b.radius;
        b.vx = -Math.abs(b.vx) * 0.85;
        audio.playBump();
      }

      // Ceiling Collision
      if (b.y - b.radius < 20) {
        b.y = 20 + b.radius;
        b.vy = Math.abs(b.vy) * 0.8;
      }

      // Net Collisions
      const netLeft = NET_X - NET_WIDTH / 2;
      const netRight = NET_X + NET_WIDTH / 2;

      if (
        b.x > netLeft - b.radius &&
        b.x < netRight + b.radius &&
        b.y + b.radius >= NET_TOP_Y &&
        b.y - b.radius < NET_TOP_Y + 15
      ) {
        b.y = NET_TOP_Y - b.radius;
        b.vy = -Math.abs(b.vy) * 0.8;
        b.vx += b.x < NET_X ? -1.5 : 1.5;
        audio.playBump();
        spawnParticles(particles.current, NET_X, NET_TOP_Y, '#FFFFFF', 4);
      } else if (b.y + b.radius > NET_TOP_Y && b.y < GROUND_Y) {
        if (b.x + b.radius > netLeft && b.x < NET_X && b.vx > 0) {
          b.x = netLeft - b.radius;
          b.vx = -Math.abs(b.vx) * 0.75;
          audio.playBump();
        } else if (b.x - b.radius < netRight && b.x > NET_X && b.vx < 0) {
          b.x = netRight + b.radius;
          b.vx = Math.abs(b.vx) * 0.75;
          audio.playBump();
        }
      }

      // Ball Hit Detection
      const checkPlayerBallCollision = (p: PlayerState) => {
        if (b.teleportWarp && b.teleportWarp.phase === 'CHARGING') return null;

        const isDiving = p.isDiving;
        const isZard = p.character === 'CHARIZARD';
        const isMew = p.character === 'MEW';
        const isOrbit = p.character === 'ORBIT';
        const isSnorlax = p.character === 'SNORLAX';

        const playerCenterX = p.x;
        const playerCenterY = isDiving ? p.y - 20 : isZard ? p.y - 42 : isMew ? p.y - 28 : isOrbit ? p.y - 34 : isSnorlax ? p.y - 36 : p.y - 32;
        const hitRadius = isDiving ? 34 : isZard ? 40 : isOrbit ? 36 : isSnorlax ? 42 : isMew ? 30 : 32;

        const dx = b.x - playerCenterX;
        const dy = b.y - playerCenterY;
        const dist = Math.hypot(dx, dy);

        if (dist < b.radius + hitRadius) {
          const isP1 = p.role === 'P1';
          const actionPressed = isP1
            ? p1Action
            : gameMode === '1P_VS_AI'
            ? !p.isGrounded && Math.random() > 0.35
            : p2Action;

          if ((!p.isGrounded || p.isFlying) && actionPressed) {
            p.expression = 'DETERMINED';

            if (isSnorlax && p.isAwakenedUltra) {
              b.isSuperCharged = true;
              b.element = 'HYPER';
              const spikeDirection = isP1 ? 1 : -1;
              b.vx = spikeDirection * 22.5;
              b.vy = 11.0;

              setShake(14);
              audio.playUltraSnorlaxSmash();
              spawnParticles(particles.current, b.x, b.y, '#FDE047', 32, 9, 'HYPER_BLAST');
              spawnParticles(particles.current, b.x, b.y, '#10B981', 20, 7, 'HYPER_BLAST');

              rallyCount.current++;
              onRallyIncrement(rallyCount.current);
              return 'SPIKE';
            }

            if (p.character === 'ORBIT') {
              b.isSuperCharged = true;
              b.element = 'CYBER';
              const spikeDirection = isP1 ? 1 : -1;
              b.vx = spikeDirection * 19.2;
              b.vy = 9.8;

              setShake(8);
              audio.playCyberSmash();
              spawnParticles(particles.current, b.x, b.y, '#06B6D4', 28, 8, 'CYBER_BINARY');
              spawnParticles(particles.current, b.x, b.y, '#1E3A8A', 16, 6, 'SPARK');

              rallyCount.current++;
              onRallyIncrement(rallyCount.current);
              return 'SPIKE';
            }

            if (p.character === 'MEWTWO' && p.skillCharges > 0 && !p.isAbilityDisabledForPoint) {
              p.skillCharges--;
              const fromX = b.x;
              const fromY = b.y;

              const opponentLeft = isP1 ? NET_X + 40 : 50;
              const opponentRight = isP1 ? COURT_WIDTH - 60 : NET_X - 40;
              const randomTargetX = opponentLeft + Math.random() * (opponentRight - opponentLeft);
              const randomTargetY = 150 + Math.random() * 80;

              const spikeDirection = isP1 ? 1 : -1;
              b.teleportWarp = {
                fromX,
                fromY,
                toX: randomTargetX,
                toY: randomTargetY,
                timer: MEWTWO_TELEPORT_CHARGE_FRAMES,
                maxTimer: MEWTWO_TELEPORT_CHARGE_FRAMES,
                phase: 'CHARGING',
                spikeDirection,
                isDropShot: false,
              };

              b.vx = 0;
              b.vy = 0;
              b.element = 'PSYCHIC';
              audio.playPsychicCharge();

              rallyCount.current++;
              onRallyIncrement(rallyCount.current);
              return 'SPIKE';
            }

            b.isSuperCharged = true;
            b.element =
              p.character === 'CHARIZARD'
                ? 'FIRE'
                : p.character === 'SQUIRTLE'
                ? 'WATER'
                : p.character === 'MEW'
                ? 'PSYCHIC'
                : 'THUNDER';
            const spikeDirection = isP1 ? 1 : -1;

            let spikeSpeedX = 14.8;
            let spikeSpeedY = 7.6;

            if (p.character === 'CHARIZARD') {
              spikeSpeedX = 16.8;
              spikeSpeedY = 8.6;
              audio.playFireSmash();
              spawnParticles(particles.current, b.x, b.y, '#EA580C', 22, 7, 'FLAME');
              setShake(5);
            } else if (p.character === 'SNORLAX') {
              spikeSpeedX = 15.8;
              spikeSpeedY = 8.