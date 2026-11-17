export type GameMode = '1P_VS_AI' | '2P_LOCAL' | 'RALLY_PRACTICE';

export type BattleFormat = '1V1' | '3V3';

export type AIDifficulty = 'EASY' | 'NORMAL' | 'MASTER';

export type PlayerRole = 'P1' | 'P2';

export type CharacterType = 'PIKACHU' | 'SQUIRTLE' | 'CHARIZARD' | 'MEWTWO' | 'MEW' | 'ORBIT' | 'GRENINJA' | 'SNORLAX';

export type TeamRoster = [CharacterType, CharacterType, CharacterType];

export interface Vector2D {
  x: number;
  y: number;
}

export interface Projectile {
  id: string;
  type: 'ELECTRO_SHOCK' | 'WATER_SHURIKEN';
  owner: PlayerRole;
  x: number;
  y: number;
  vx: number;
  vy: number;
  rotation: number;
  size: number;
  stunDuration: number;
  life: number;
  maxLife: number;
  targetRole?: PlayerRole;
}

export interface ThunderVisual {
  targetX: number;
  targetY: number;
  timer: number;
}

export interface PlayerState {
  role: PlayerRole;
  character: CharacterType;
  x: number;
  y: number;
  vx: number;
  vy: number;
  width: number;
  height: number;
  isGrounded: boolean;
  isJumping: boolean;
  isDiving: boolean;
  isSpiking: boolean;

  // Stun Mechanic
  stunTimer: number;

  // Standardized Skill Charges per character life (reset on new match or tag-in)
  skillCharges: number;
  maxSkillCharges: number;
  skillCooldown: number;

  // Greninja Shuriken 10-second auto recharge (600 frames)
  shurikenRechargeTimer: number;

  // Snorlax Rest & Ultra-Awakened mode
  isResting: boolean;
  restTimer: number;
  maxRestDuration: number;
  isAwakenedUltra: boolean;
  snoreTimer: number;

  // Orbit: Point-interval ability disable
  isAbilityDisabledForPoint: boolean;
  hackEffectTimer: number;

  // Pikachu: Agility / Volt Dash
  isVoltDashing: boolean;
  voltDashTimer: number;

  // Squirtle: Double Jump (1 extra jump in mid-air per ground contact)
  airJumpCount: number;
  maxAirJumps: number;

  // Charizard: Flight & Hover
  isFlying: boolean;
  flightFuel: number;
  maxFlightFuel: number;
  wingAngle: number;
  wingFlapSpeed: number;
  flameFlicker: number;

  // Mewtwo & Mew: Psychic float and effects
  teleportCooldown: number;
  psychicAuraIntensity: number;
  isLevitating: boolean;
  warpRiftEffect: { active: boolean; x: number; y: number; alpha: number } | null;

  // Mew: Self-teleport effect
  mewFlashTimer: number;

  diveTimer: number;
  spikeCooldown: number;
  facing: 'left' | 'right';
  animFrame: number;
  colorTheme: 'classic' | 'shiny';
  name: string;

  // Kinematics and dynamic expression state
  earAngleLeft: number;
  earAngleRight: number;
  tailSway: number;
  shellRotation: number;
  squashX: number;
  squashY: number;
  blinkTimer: number;
  isBlinking: boolean;
  expression: 'NORMAL' | 'DETERMINED' | 'HAPPY' | 'SURPRISED';
}

export interface BallState {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  rotation: number;
  isSuperCharged: boolean;
  element: 'THUNDER' | 'WATER' | 'FIRE' | 'PSYCHIC' | 'CYBER' | 'HYPER' | 'NORMAL';
  trail: Array<{ x: number; y: number; charged: boolean; element: 'THUNDER' | 'WATER' | 'FIRE' | 'PSYCHIC' | 'CYBER' | 'HYPER' | 'NORMAL'; alpha: number }>;
  teleportWarp?: {
    fromX: number;
    fromY: number;
    toX: number;
    toY: number;
    timer: number;
    maxTimer: number;
    phase: 'CHARGING' | 'EMERGED';
    spikeDirection: number;
    isDropShot: boolean;
  } | null;
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  alpha: number;
  life: number;
  maxLife: number;
  type?: 'SAND' | 'SPARK' | 'BUBBLE' | 'WATER_SPLASH' | 'FLAME' | 'SMOKE' | 'PSYCHIC' | 'PORTAL' | 'MEW_SPARKLE' | 'VOLT_LIGHTNING' | 'CYBER_BINARY' | 'SHURIKEN_SPLASH' | 'SNORLAX_Z' | 'HYPER_BLAST';
  textChar?: string;
}

export interface MatchScore {
  p1: number;
  p2: number;
  currentRally: number;
  maxRally: number;
  isDeuce: boolean;
  advantage: 'P1' | 'P2' | null;
  // 3v3 Squad tracking: points lost per character slot (max 5 each)
  p1ActiveIdx: number;
  p2ActiveIdx: number;
  p1CharLosses: [number, number, number];
  p2CharLosses: [number, number, number];
}

export interface CommentaryMessage {
  id: string;
  sender: 'ANNOUNCER' | 'P1' | 'P2';
  text: string;
  timestamp: number;
  type: 'SPIKE' | 'DIVE_SAVE' | 'POINT' | 'MATCH_POINT' | 'WIN' | 'FLUFF';
}
