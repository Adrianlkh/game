import { BallState, GameMode, Particle, PlayerState } from '../types';
import {
  BALL_GRAVITY,
  BALL_MAX_SPEED,
  COURT_WIDTH,
  GROUND_Y,
  MEWTWO_TELEPORT_CHARGE_FRAMES,
  NET_TOP_Y,
  NET_WIDTH,
  NET_X,
  getCharacterPowerMultiplier,
} from '../constants';
import { audio } from '../services/audioService';
import { spawnParticles } from './physics';

export interface BallStepResult {
  scoredOnSide: 'LEFT' | 'RIGHT' | null;
  rallyHit: boolean;
}

export function stepBallAndCollisions(
  b: BallState,
  p1: PlayerState,
  p2: PlayerState,
  p1Action: boolean,
  p2Action: boolean,
  gameMode: GameMode,
  particles: Particle[],
  onRallyHit: () => void,
  onShake: (amount: number) => void
): BallStepResult {
  // 1. Update ball motion or Mewtwo's telegraphed teleport charge
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
        spawnParticles(particles, b.x, b.y, '#C084FC', 16, 5, 'PORTAL');
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

  // 2. Wall Collisions
  if (b.x - b.radius < 20) {
    b.x = 20 + b.radius;
    b.vx = Math.abs(b.vx) * 0.85;
    audio.playBump();
  } else if (b.x + b.radius > COURT_WIDTH - 20) {
    b.x = COURT_WIDTH - 20 - b.radius;
    b.vx = -Math.abs(b.vx) * 0.85;
    audio.playBump();
  }

  // 3. Ceiling Collision
  if (b.y - b.radius < 20) {
    b.y = 20 + b.radius;
    b.vy = Math.abs(b.vy) * 0.8;
  }

  // 4. Net Collisions
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
    spawnParticles(particles, NET_X, NET_TOP_Y, '#FFFFFF', 4);
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

  // 5. Player-Ball Hit Detection
  let rallyHit = false;

  const checkPlayerHit = (p: PlayerState) => {
    if (b.teleportWarp && b.teleportWarp.phase === 'CHARGING') return;

    const isDiving = p.isDiving;
    const isZard = p.character === 'CHARIZARD';
    const isMew = p.character === 'MEW';
    const isOrbit = p.character === 'ORBIT';
    const isSnorlax = p.character === 'SNORLAX';

    const playerCenterX = p.x;
    const playerCenterY = isDiving
      ? p.y - 20
      : isZard
      ? p.y - 42
      : isMew
      ? p.y - 28
      : isOrbit
      ? p.y - 34
      : isSnorlax
      ? p.y - 36
      : p.y - 32;
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

          onShake(14);
          audio.playUltraSnorlaxSmash();
          spawnParticles(particles, b.x, b.y, '#FDE047', 32, 9, 'HYPER_BLAST');
          spawnParticles(particles, b.x, b.y, '#10B981', 20, 7, 'HYPER_BLAST');

          rallyHit = true;
          onRallyHit();
          return;
        }

        if (p.character === 'ORBIT') {
          b.isSuperCharged = true;
          b.element = 'CYBER';
          const spikeDirection = isP1 ? 1 : -1;
          b.vx = spikeDirection * 19.2;
          b.vy = 9.8;

          onShake(8);
          audio.playCyberSmash();
          spawnParticles(particles, b.x, b.y, '#06B6D4', 28, 8, 'CYBER_BINARY');
          spawnParticles(particles, b.x, b.y, '#1E3A8A', 16, 6, 'SPARK');

          rallyHit = true;
          onRallyHit();
          return;
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

          rallyHit = true;
          onRallyHit();
          return;
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
          spawnParticles(particles, b.x, b.y, '#EA580C', 22, 7, 'FLAME');
          onShake(5);
        } else if (p.character === 'SNORLAX') {
          spikeSpeedX = 15.8;
          spikeSpeedY = 8.2;
          audio.playBump();
          spawnParticles(particles, b.x, b.y, '#10B981', 18, 6, 'SPARK');
          onShake(4);
        } else if (p.character === 'GRENINJA') {
          spikeSpeedX = 15.6;
          spikeSpeedY = 8.0;
          audio.playWaterShuriken();
          spawnParticles(particles, b.x, b.y, '#38BDF8', 18, 6, 'SHURIKEN_SPLASH');
          onShake(4);
        } else if (p.character === 'MEWTWO') {
          spikeSpeedX = 15.8;
          spikeSpeedY = 8.0;
          audio.playTeleport();
          spawnParticles(particles, b.x, b.y, '#C084FC', 18, 6, 'PSYCHIC');
          onShake(4);
        } else if (p.character === 'PIKACHU') {
          spikeSpeedX = 15.2;
          spikeSpeedY = 7.8;
          audio.playSpike();
          spawnParticles(particles, b.x, b.y, '#00F0FF', 18, 6, 'VOLT_LIGHTNING');
          onShake(4);
        } else if (p.character === 'MEW') {
          spikeSpeedX = 14.8;
          spikeSpeedY = 7.6;
          audio.playMewBlink();
          spawnParticles(particles, b.x, b.y, '#F472B6', 18, 6, 'MEW_SPARKLE');
          onShake(3);
        } else if (p.character === 'SQUIRTLE') {
          spikeSpeedX = 14.6;
          spikeSpeedY = 7.5;
          audio.playHydroSmash();
          spawnParticles(particles, b.x, b.y, '#38BDF8', 18, 6, 'BUBBLE');
          onShake(3);
        }

        b.vx = spikeDirection * spikeSpeedX;
        b.vy = spikeSpeedY;

        rallyHit = true;
        onRallyHit();
      } else if (isDiving) {
        b.isSuperCharged = false;
        b.element = 'NORMAL';
        b.vy = -11.2;
        b.vx = (isP1 ? 4.2 : -4.2) + (Math.random() * 2 - 1);
        p.expression = 'HAPPY';
        audio.playDive();
        rallyHit = true;
        onRallyHit();
      } else {
        b.isSuperCharged = p.isAwakenedUltra;
        b.element = p.isAwakenedUltra ? 'HYPER' : isOrbit ? 'CYBER' : 'NORMAL';
        const safeDist = Math.max(dist, 0.001);
        const normX = dx / safeDist;
        const powerMult = getCharacterPowerMultiplier(p);

        b.vx = (normX * 7.8 + p.vx * 0.5) * powerMult;
        b.vy = (-9.2 - Math.abs(normX * 1.6)) * powerMult;
        p.expression = 'HAPPY';

        if (p.isAwakenedUltra) {
          audio.playUltraSnorlaxSmash();
          spawnParticles(particles, b.x, b.y, '#10B981', 12, 5, 'HYPER_BLAST');
        } else if (isOrbit) {
          audio.playCyberSmash();
          spawnParticles(particles, b.x, b.y, '#06B6D4', 8, 4, 'CYBER_BINARY');
        } else {
          audio.playBump();
          spawnParticles(particles, b.x, b.y, '#FFFFFF', 5);
        }

        rallyHit = true;
        onRallyHit();
      }
    }
  };

  checkPlayerHit(p1);
  checkPlayerHit(p2);

  // 6. Ground Touch Check
  if (b.y + b.radius >= GROUND_Y) {
    b.y = GROUND_Y - b.radius;
    return {
      scoredOnSide: b.x < NET_X ? 'LEFT' : 'RIGHT',
      rallyHit,
    };
  }

  return { scoredOnSide: null, rallyHit };
}
