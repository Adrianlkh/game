import { CharacterType, PlayerState } from './types';

export const COURT_WIDTH = 800;
export const COURT_HEIGHT = 450;
export const GROUND_Y = 380;
export const NET_X = 400;
export const NET_TOP_Y = 250;
export const NET_WIDTH = 12;

export const GRAVITY = 0.32;
export const BALL_GRAVITY = 0.28;
export const PLAYER_SPEED = 5.2;
export const JUMP_FORCE = -8.8;
export const DIVE_SPEED = 7.5;
export const BALL_MAX_SPEED = 23.5;

export const CHARIZARD_FLIGHT_LIFT = -0.55;
export const CHARIZARD_MAX_FUEL = 100;
export const CHARIZARD_CEILING = 110;

export const MEWTWO_TELEPORT_CHARGE_FRAMES = 26;
export const COUNTDOWN_TOTAL_FRAMES = 115;
export const SNORLAX_REST_FRAMES = 360; // 6 seconds at 60 FPS
export const SHURIKEN_RECHARGE_INTERVAL = 600; // 10 seconds at 60 FPS

export const POINTS_PER_CHARACTER_3V3 = 5;

export interface CharacterMeta {
  id: CharacterType;
  name: string;
  shortLabel: string;
  emoji: string;
  badgeColor: string;
  btnColor: string;
  hudAccent: string;
  skillName: string;
  skillHint: string;
  skillSummary: string;
  maxCharges: number;
}

export const CHARACTER_META: Record<CharacterType, CharacterMeta> = {
  PIKACHU: {
    id: 'PIKACHU',
    name: 'Pikachu',
    shortLabel: 'PIKA',
    emoji: '⚡',
    badgeColor: 'bg-yellow-400 border-yellow-200 text-slate-950',
    btnColor: 'bg-yellow-400 hover:bg-yellow-300 text-slate-950',
    hudAccent: '#FBBF24',
    skillName: 'Thunder',
    skillHint: 'Action: Thunder (Auto-lock sky lightning strike, 2.0s stun, 5 uses)',
    skillSummary: 'Auto-locks onto rival with sky lightning; 2.0s stun (5 uses).',
    maxCharges: 5,
  },
  SQUIRTLE: {
    id: 'SQUIRTLE',
    name: 'Squirtle',
    shortLabel: 'SQRT',
    emoji: '🐢',
    badgeColor: 'bg-cyan-500 border-cyan-200 text-slate-950',
    btnColor: 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold',
    hudAccent: '#38BDF8',
    skillName: 'Double Jump',
    skillHint: 'Jump in air: Double Jump (1 extra mid-air jump)',
    skillSummary: 'Exactly 1 extra jump in mid-air per ground contact.',
    maxCharges: 1,
  },
  CHARIZARD: {
    id: 'CHARIZARD',
    name: 'Charizard',
    shortLabel: 'ZARD',
    emoji: '🔥',
    badgeColor: 'bg-orange-500 border-orange-300 text-white',
    btnColor: 'bg-orange-500 hover:bg-orange-400 text-white',
    hudAccent: '#F97316',
    skillName: 'Flight',
    skillHint: 'Hold Jump: Fly & Hover • Action in air: Flame Spike',
    skillSummary: 'Hold Jump to soar & hover over court; heavy Flame Spike.',
    maxCharges: 5,
  },
  MEWTWO: {
    id: 'MEWTWO',
    name: 'Mewtwo',
    shortLabel: 'MEW2',
    emoji: '🔮',
    badgeColor: 'bg-purple-600 border-purple-300 text-white font-bold',
    btnColor: 'bg-purple-600 hover:bg-purple-500 text-white',
    hudAccent: '#A855F7',
    skillName: 'Psychic Warp',
    skillHint: 'Action in air: Random Psychic Ball Warp (5 uses)',
    skillSummary: 'Teleports ball to a random court spot (5 uses).',
    maxCharges: 5,
  },
  MEW: {
    id: 'MEW',
    name: 'Mew',
    shortLabel: 'MEW',
    emoji: '💖',
    badgeColor: 'bg-pink-400 border-pink-200 text-slate-950 font-bold',
    btnColor: 'bg-pink-400 hover:bg-pink-300 text-slate-950 font-bold',
    hudAccent: '#F472B6',
    skillName: 'Blink Teleport',
    skillHint: 'Action: Teleport TO Ball position (5 uses)',
    skillSummary: 'Warps directly to the ball to set up your hit (5 uses).',
    maxCharges: 5,
  },
  ORBIT: {
    id: 'ORBIT',
    name: 'Orbit',
    shortLabel: 'ORBIT',
    emoji: '👾',
    badgeColor: 'bg-cyan-600 border-cyan-300 text-white font-bold shadow-[0_0_8px_rgba(6,182,212,0.6)]',
    btnColor: 'bg-cyan-600 hover:bg-cyan-500 text-white font-bold ring-1 ring-cyan-300',
    hudAccent: '#06B6D4',
    skillName: 'Hacker',
    skillHint: 'Action: Hacker (Locks enemy skills for entire point, 5 uses) • Heavy Power!',
    skillSummary: '5 uses; locks rival skill for 1 point + Heaviest Base Spike.',
    maxCharges: 5,
  },
  GRENINJA: {
    id: 'GRENINJA',
    name: 'Greninja',
    shortLabel: 'NINJA',
    emoji: '🥷',
    badgeColor: 'bg-blue-600 border-blue-300 text-white font-bold shadow-[0_0_8px_rgba(37,99,235,0.6)]',
    btnColor: 'bg-blue-600 hover:bg-blue-500 text-white font-bold ring-1 ring-blue-300',
    hudAccent: '#3B82F6',
    skillName: 'Water Shuriken',
    skillHint: 'Action: Homing Water Shuriken (0.5s stun, recharges every 10s)',
    skillSummary: 'Auto-locking star (0.5s stun), recharges 1 every 10s.',
    maxCharges: 20,
  },
  SNORLAX: {
    id: 'SNORLAX',
    name: 'Snorlax',
    shortLabel: 'LAX',
    emoji: '😴',
    badgeColor: 'bg-emerald-800 border-emerald-400 text-yellow-200 font-bold shadow-[0_0_8px_rgba(6,95,70,0.6)]',
    btnColor: 'bg-emerald-800 hover:bg-emerald-700 text-yellow-200 font-bold ring-1 ring-emerald-400',
    hudAccent: '#10B981',
    skillName: 'Rest',
    skillHint: 'Action: Rest (6s at 0.75x speed; awakens into Ultra Power stronger than Orbit! 10 uses)',
    skillSummary: '6s at 0.75x speed; awakens into Ultra Power > Orbit (10 uses).',
    maxCharges: 10,
  },
};

export const ALL_CHARACTERS: CharacterType[] = [
  'PIKACHU',
  'SQUIRTLE',
  'CHARIZARD',
  'MEWTWO',
  'MEW',
  'ORBIT',
  'GRENINJA',
  'SNORLAX',
];

export const getMaxSkillCharges = (char: CharacterType): number => {
  return CHARACTER_META[char].maxCharges;
};

export const getCharacterPowerMultiplier = (p: PlayerState): number => {
  if (p.character === 'SNORLAX' && p.isAwakenedUltra) {
    return 1.62;
  }

  switch (p.character) {
    case 'ORBIT': return 1.38;
    case 'SNORLAX': return 1.28;
    case 'CHARIZARD': return 1.22;
    case 'MEWTWO': return 1.18;
    case 'GRENINJA': return 1.15;
    case 'PIKACHU': return 1.12;
    case 'MEW': return 1.10;
    case 'SQUIRTLE': return 1.08;
    default: return 1.0;
  }
};
