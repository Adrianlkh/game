import {
  BallState,
  CharacterType,
  Particle,
  PlayerRole,
  PlayerState,
  Projectile,
  ThunderVisual,
} from '../types';
import {
  CHARIZARD_CEILING,
  CHARIZARD_FLIGHT_LIFT,
  CHARIZARD_MAX_FUEL,
  DIVE_SPEED,
  GRAVITY,
  GROUND_Y,
  JUMP_FORCE,
  NET_X,
  PLAYER_SPEED,
  SHURIKEN_RECHARGE_INTERVAL,
  SNORLAX_REST_FRAMES,
  getMaxSkillCharges,
} from '../constants';
import { audio } from '../services/audioService';

export function createInitialPlayerState(role: PlayerRole, character: CharacterType): PlayerState {
  const isP1 = role === 'P1';
  return {
    role,
    character,
    x: isP1 ? 180 : 620,
    y: GROUND_Y,
    vx: 0,
    vy: 0,
    width: 60,
    height: 60,
    isGrounded: true,
    isJumping: false,
    isDiving: false,
    isSpiking: false,
    stunTimer: 0,
    skillCharges: getMaxSkillCharges(character),
    maxSkillCharges: getMaxSkillCharges(character),
    skillCooldown: 0,
    shurikenRechargeTimer: SHURIKEN_RECHARGE_INTERVAL,
    isResting: false,
    restTimer: 0,
    maxRestDuration: SNORLAX_REST_FRAMES,
    isAwakenedUltra: false,
    snoreTimer: 0,
    isAbilityDisabledForPoint: false,
    hackEffectTimer: 0,
    isVoltDashing: false,
    voltDashTimer: 0,
    airJumpCount: 0,
    maxAirJumps: 1,
    isRapidSpinning: false,
    rapidSpinTimer: 0,
    isFlying: false,
    flightFuel: CHARIZARD_MAX_FUEL,
    maxFlightFuel: CHARIZARD_MAX_FUEL,
    wingAngle: 0,
    wingFlapSpeed: 0.15,
    flameFlicker: 0,
    teleportCooldown: 0,
    psychicAuraIntensity: 0,
    isLevitating: false,
    warpRiftEffect: null,
    mewFlashTimer: 0,
    diveTimer: 0,
    spikeCooldown: 0,
    facing: isP1 ? 'right' : 'left',
    animFrame: 0,
    colorTheme: isP1 ? 'classic' : 'shiny',
    name: character,
    earAngleLeft: -0.35,
    earAngleRight: 0.35,
    tailSway: 0,
    shellRotation: 0,
    squashX: 1,
    squashY: 1,
    blinkTimer: isP1 ? 180 : 210,
    isBlinking: false,
    expression: 'NORMAL',
  };
}

export function resetPlayerForNewCharacter(p: PlayerState, character: CharacterType) {
  p.character = character;
  p.name = character;
  p.maxSkillCharges = getMaxSkillCharges(character);
  p.skillCharges = getMaxSkillCharges(character);
  p.maxRestDuration = SNORLAX_REST_FRAMES;
  p.shurikenRechargeTimer = SHURIKEN_RECHARGE_INTERVAL;
  p.isResting = false;
  p.restTimer = 0;
  p.isAwakenedUltra = false;
  p.stunTimer = 0;
  p.isAbilityDisabledForPoint = false;
  p.flightFuel = CHARIZARD_MAX_FUEL;
  p.airJumpCount = 0;
  p.skillCooldown = 0;
  p.expression = 'NORMAL';
}

export function resetPlayerForServe(p: PlayerState) {
  p.vx = 0;
  p.vy = 0;
  p.x = p.role === 'P1' ? 180 : 620;
  p.y = GROUND_Y;
  p.facing = p.role === 'P1' ? 'right' : 'left';
  p.isDiving = false;
  p.isFlying = false;
  p.isVoltDashing = false;
  p.voltDashTimer = 0;
  p.airJumpCount = 0;
  p.teleportCooldown = 0;
  p.skillCooldown = 0;
  p.stunTimer = 0;
  p.isResting = false;
  p.restTimer = 0;
  p.isAwakenedUltra = false;
  p.isAbilityDisabledForPoint = false;
  p.flightFuel = CHARIZARD_MAX_FUEL;
  p.expression = 'NORMAL';
}

export function spawnParticles(
  particles: Particle[],
  x: number,
  y: number,
  color: string,
  count: number,
  speed: number = 3,
  type: Particle['type'] = 'SAND'
) {
  for (let i = 0; i < count; i++) {
    const angle = Math.random() * Math.PI * 2;
    const vel = (Math.random() * 0.7 + 0.3) * speed;
    const isFloaty =
      type === 'BUBBLE' ||
      type === 'FLAME' ||
      type === 'PSYCHIC' ||
      type === 'MEW_SPARKLE' ||
      type === 'CYBER_BINARY' ||
      type === 'SNORLAX_Z';
    particles.push({
      x,
      y,
      vx: Math.cos(angle) * vel,
      vy: Math.sin(angle) * vel - (isFloaty ? 2.5 : 1.2),
      size: type === 'FLAME' || type === 'PORTAL' || type === 'HYPER_BLAST' ? Math.random() * 6 + 3 : Math.random() * 4 + 2,
      color,
      alpha: 1,
      life: 0,
      maxLife: Math.floor(Math.random() * 24 + 15),
      type,
      textChar: type === 'CYBER_BINARY' ? (Math.random() > 0.5 ? '1' : '0') : type === 'SNORLAX_Z' ? 'Z' : undefined,
    });
  }
}

export function castPikachuThunder(
  caster: PlayerState,
  target: PlayerState,
  activeThunderStrikes: ThunderVisual[],
  particles: Particle[],
  onShake: (amount: number) => void
) {
  caster.skillCharges--;
  caster.skillCooldown = 75;
  caster.expression = 'DETERMINED';

  const targetX = target.x;
  const targetY = target.y;

  target.stunTimer = 120;
  target.isFlying = false;
  target.isVoltDashing = false;
  target.expression = 'SURPRISED';

  activeThunderStrikes.push({
    targetX,
    targetY,
    timer: 16,
  });

  audio.playThunderClap();
  onShake(6);

  spawnParticles(particles, targetX, targetY - 20, '#FDE047', 25, 7, 'VOLT_LIGHTNING');
  spawnParticles(particles, targetX, targetY - 20, '#00F0FF', 16, 6, 'SPARK');
  spawnParticles(particles, targetX, GROUND_Y, '#EAB308', 12, 4, 'SAND');
}

export function triggerCharacterActionSkill(
  caster: PlayerState,
  opponent: PlayerState,
  ball: BallState,
  activeThunderStrikes: ThunderVisual[],
  projectiles: Projectile[],
  particles: Particle[],
  onShake: (amount: number) => void
) {
  const charType = caster.character;
  const isP1 = caster.role === 'P1';

  if (charType === 'SNORLAX' && caster.skillCharges > 0 && !caster.isResting) {
    caster.skillCharges--;
    caster.isResting = true;
    caster.restTimer = SNORLAX_REST_FRAMES;
    caster.isAwakenedUltra = false;
    caster.skillCooldown = 60;
    audio.playSnorlaxRest();
    spawnParticles(particles, caster.x, caster.y - 30, '#A7F3D0', 12, 3, 'SNORLAX_Z');
  } else if (charType === 'PIKACHU' && caster.skillCharges > 0) {
    castPikachuThunder(caster, opponent, activeThunderStrikes, particles, onShake);
  } else if (charType === 'GRENINJA' && caster.skillCharges > 0) {
    caster.skillCharges--;
    caster.skillCooldown = 22;
    caster.expression = 'DETERMINED';

    projectiles.push({
      id: Math.random().toString(),
      type: 'WATER_SHURIKEN',
      owner: caster.role,
      targetRole: opponent.role,
      x: caster.x + (isP1 ? 20 : -20),
      y: caster.y - 28,
      vx: isP1 ? 9.5 : -9.5,
      vy: -0.8,
      rotation: 0,
      size: 14,
      stunDuration: 30,
      life: 0,
      maxLife: 90,
    });

    audio.playWaterShuriken();
    spawnParticles(particles, caster.x + (isP1 ? 20 : -20), caster.y - 28, '#38BDF8', 8, 3, 'BUBBLE');
  } else if (charType === 'ORBIT' && caster.skillCharges > 0) {
    caster.skillCharges--;
    caster.skillCooldown = 90;
    caster.hackEffectTimer = 30;
    caster.expression = 'DETERMINED';

    opponent.isAbilityDisabledForPoint = true;
    opponent.isFlying = false;
    opponent.isVoltDashing = false;

    audio.playCyberHack();
    spawnParticles(particles, caster.x, caster.y - 20, '#06B6D4', 20, 6, 'CYBER_BINARY');
    spawnParticles(particles, opponent.x, opponent.y - 25, '#EF4444', 25, 7, 'CYBER_BINARY');
  } else if (charType === 'MEW' && caster.skillCharges > 0) {
    caster.skillCharges--;
    caster.skillCooldown = 50;
    caster.mewFlashTimer = 16;
    caster.expression = 'HAPPY';

    const oldX = caster.x;
    const oldY = caster.y;

    let destX = ball.x + (isP1 ? -22 : 22);
    let destY = ball.y + 12;

    if (isP1) {
      destX = Math.max(50, Math.min(NET_X - 35, destX));
    } else {
      destX = Math.max(NET_X + 35, Math.min(755, destX));
    }
    destY = Math.max(70, Math.min(GROUND_Y, destY));

    caster.x = destX;
    caster.y = destY;
    caster.vx = 0;
    caster.vy = -1.5;
    caster.isGrounded = false;

    spawnParticles(particles, oldX, oldY, '#F472B6', 16, 5, 'MEW_SPARKLE');
    spawnParticles(particles, destX, destY, '#FBCFE8', 20, 6, 'MEW_SPARKLE');
    audio.playMewBlink();
  }
}

export function applyPlayerMovementAndGravity(
  p: PlayerState,
  moveLeft: boolean,
  moveRight: boolean,
  jumpOrFly: boolean,
  actionPressed: boolean,
  jumpTappedFresh: boolean,
  particles: Particle[]
) {
  const charType = p.character;
  const isP1 = p.role === 'P1';

  // Squirtle Double Jump (1 extra jump in mid-air)
  if (charType === 'SQUIRTLE' && jumpTappedFresh && p.stunTimer <= 0 && !p.isAbilityDisabledForPoint) {
    if (!p.isGrounded && p.airJumpCount < p.maxAirJumps) {
      p.vy = JUMP_FORCE * 0.98;
      p.airJumpCount++;
      p.squashX = 0.8;
      p.squashY = 1.25;
      p.expression = 'HAPPY';

      audio.playJump();
      spawnParticles(particles, p.x, p.y + 12, '#38BDF8', 12, 3.5, 'BUBBLE');
      spawnParticles(particles, p.x, p.y + 12, '#BAE6FD', 6, 2.5, 'WATER_SPLASH');
    }
  }

  // Charizard Flight
  if (charType === 'CHARIZARD') {
    if (jumpOrFly && p.flightFuel > 0 && !p.isAbilityDisabledForPoint && p.stunTimer <= 0) {
      p.isFlying = true;
      p.isGrounded = false;
      p.vy += CHARIZARD_FLIGHT_LIFT;
      p.flightFuel = Math.max(0, p.flightFuel - 0.7);
      if (Math.random() < 0.12) {
        audio.playWingFlap();
        spawnParticles(particles, p.x - 10, p.y, '#F97316', 3, 2, 'FLAME');
      }
    } else {
      p.isFlying = false;
    }

    if (p.isGrounded) {
      p.flightFuel = Math.min(CHARIZARD_MAX_FUEL, p.flightFuel + 1.2);
    }
  }

  if (p.stunTimer <= 0) {
    if (p.isDiving) {
      p.diveTimer--;
      p.x += p.facing === 'right' ? DIVE_SPEED : -DIVE_SPEED;
      if (p.diveTimer <= 0) p.isDiving = false;
    } else {
      let currentSpeed =
        charType === 'CHARIZARD' && p.isFlying
          ? PLAYER_SPEED * 1.2
          : charType === 'GRENINJA'
          ? PLAYER_SPEED * 1.15
          : PLAYER_SPEED;

      if (p.isResting) {
        currentSpeed *= 0.75;
      }

      if (moveLeft && !moveRight) {
        p.vx = -currentSpeed;
        p.facing = 'left';
      } else if (moveRight && !moveLeft) {
        p.vx = currentSpeed;
        p.facing = 'right';
      } else {
        p.vx *= 0.72;
        if (Math.abs(p.vx) < 0.2) p.vx = 0;
      }

      if (jumpOrFly && p.isGrounded) {
        p.vy = charType === 'GRENINJA' ? JUMP_FORCE * 1.15 : p.isResting ? JUMP_FORCE * 0.8 : JUMP_FORCE;
        p.isGrounded = false;
        p.isJumping = true;
        p.squashX = 0.8;
        p.squashY = 1.25;
        audio.playJump();
      }

      if (actionPressed && p.isGrounded && Math.abs(p.vx) > 1.5 && !p.isDiving && charType !== 'MEW') {
        p.isDiving = true;
        p.diveTimer = 22;
        audio.playDive();
      }
    }
  }

  const effectiveGravity = charType === 'CHARIZARD' && p.isFlying ? GRAVITY * 0.4 : GRAVITY;
  p.vy += effectiveGravity;
  p.x += p.vx;
  p.y += p.vy;

  if (charType === 'CHARIZARD' && p.y < CHARIZARD_CEILING) {
    p.y = CHARIZARD_CEILING;
    p.vy = 0;
  }

  if (p.y >= GROUND_Y) {
    p.y = GROUND_Y;
    p.vy = 0;
    p.isGrounded = true;
    p.isJumping = false;
    p.airJumpCount = 0;
  }

  p.squashX += (1 - p.squashX) * 0.15;
  p.squashY += (1 - p.squashY) * 0.15;

  if (isP1) {
    if (p.x < 45) p.x = 45;
    if (p.x > NET_X - 35) p.x = NET_X - 35;
  } else {
    if (p.x < NET_X + 35) p.x = NET_X + 35;
    if (p.x > 755) p.x = 755;
  }
}

export function updatePlayerAnimationKinematics(p: PlayerState) {
  p.flameFlicker = Math.sin(Date.now() * 0.02) * 4;
  p.wingAngle = Math.sin(Date.now() * 0.015) * 0.4;

  const speedX = p.facing === 'right' ? p.vx : -p.vx;
  const targetEarLeft = -0.38 - p.vy * 0.04 - speedX * 0.03;
  const targetEarRight = 0.38 - p.vy * 0.04 - speedX * 0.03;
  p.earAngleLeft += (targetEarLeft - p.earAngleLeft) * 0.18;
  p.earAngleRight += (targetEarRight - p.earAngleRight) * 0.18;

  const targetTail = Math.sin(Date.now() * 0.008) * 0.2 + speedX * 0.06;
  p.tailSway += (targetTail - p.tailSway) * 0.15;

  p.blinkTimer--;
  if (p.blinkTimer <= 0) {
    p.isBlinking = true;
    if (p.blinkTimer < -8) {
      p.isBlinking = false;
      p.blinkTimer = Math.floor(Math.random() * 160 + 120);
    }
  }
}
