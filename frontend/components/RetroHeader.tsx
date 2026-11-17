import React from 'react';
import { Volume2, VolumeX, Monitor, Music, RotateCcw, Zap, Droplets, Flame, Sparkles, Heart, Terminal, Play, Pause, Swords, Moon, Users } from 'lucide-react';
import { GameMode, AIDifficulty, MatchScore, CharacterType, BattleFormat, TeamRoster } from '../types';
import { ALL_CHARACTERS, CHARACTER_META, POINTS_PER_CHARACTER_3V3 } from '../constants';

interface RetroHeaderProps {
  score: MatchScore;
  targetScore: number;
  battleFormat: BattleFormat;
  gameMode: GameMode;
  difficulty: AIDifficulty;
  p1Char: CharacterType;
  p2Char: CharacterType;
  p1Team: TeamRoster;
  p2Team: TeamRoster;
  soundEnabled: boolean;
  musicEnabled: boolean;
  crtFilter: boolean;
  isPaused: boolean;
  onToggleSound: () => void;
  onToggleMusic: () => void;
  onToggleCrt: () => void;
  onTogglePause: () => void;
  onResetMatch: () => void;
  onSelectBattleFormat: (format: BattleFormat) => void;
  onSelectP1Char: (char: CharacterType) => void;
  onSelectP2Char: (char: CharacterType) => void;
  onOpenTeamSetup: () => void;
}

export const RetroHeader: React.FC<RetroHeaderProps> = ({
  score,
  targetScore,
  battleFormat,
  gameMode,
  p1Char,
  p2Char,
  p1Team,
  p2Team,
  soundEnabled,
  musicEnabled,
  crtFilter,
  isPaused,
  onToggleSound,
  onToggleMusic,
  onToggleCrt,
  onTogglePause,
  onResetMatch,
  onSelectBattleFormat,
  onSelectP1Char,
  onSelectP2Char,
  onOpenTeamSetup,
}) => {
  const cycleChar = (curr: CharacterType) => {
    const idx = ALL_CHARACTERS.indexOf(curr);
    return ALL_CHARACTERS[(idx + 1) % ALL_CHARACTERS.length];
  };

  const p1Meta = CHARACTER_META[p1Char];
  const p2Meta = CHARACTER_META[p2Char];

  const renderHeaderIcon = (char: CharacterType) => {
    switch (char) {
      case 'SNORLAX': return <Moon className="w-5 h-5 text-yellow-200 fill-yellow-300 animate-pulse" />;
      case 'GRENINJA': return <Swords className="w-5 h-5 text-blue-200 animate-pulse" />;
      case 'ORBIT': return <Terminal className="w-5 h-5 text-cyan-200 animate-pulse" />;
      case 'MEW': return <Heart className="w-5 h-5 text-red-500 fill-pink-300 animate-pulse" />;
      case 'MEWTWO': return <Sparkles className="w-5 h-5 text-white animate-spin" />;
      case 'CHARIZARD': return <Flame className="w-5 h-5 text-red-700 fill-orange-500 animate-pulse" />;
      case 'SQUIRTLE': return <Droplets className="w-5 h-5 text-blue-800 fill-cyan-400 animate-bounce" />;
      default: return <Zap className="w-5 h-5 text-amber-900 fill-yellow-400 animate-pulse" />;
    }
  };

  const renderRosterStrip = (
    team: TeamRoster,
    activeIdx: number,
    losses: [number, number, number],
    alignRight: boolean
  ) => (
    <div className={`flex items-center gap-1.5 mt-1 ${alignRight ? 'justify-end' : 'justify-start'}`}>
      {team.map((charId, idx) => {
        const meta = CHARACTER_META[charId];
        const lost = losses[idx];
        const rem = Math.max(0, POINTS_PER_CHARACTER_3V3 - lost);
        const isKO = rem <= 0;
        const isActive = idx === activeIdx && !isKO;
        return (
          <div
            key={idx}
            className={`px-1.5 py-0.5 rounded-md border flex items-center gap-1 transition ${
              isKO
                ? 'bg-slate-900/60 border-slate-800 opacity-40 grayscale'
                : isActive
                ? 'bg-slate-800 border-yellow-400 shadow-[0_0_8px_rgba(250,204,21,0.4)]'
                : 'bg-slate-900 border-slate-700 opacity-80'
            }`}
            title={`#${idx + 1} ${meta.name}: ${rem}/5 PTS`}
          >
            <span className="text-[10px]">{meta.emoji}</span>
            <div className="flex flex-col">
              <span className="font-pixel text-[6px] text-slate-200">
                {isKO ? 'KO' : `${rem}PT`}
              </span>
              <div className="flex gap-0.5 mt-0.5">
                {[0, 1, 2, 3, 4].map((pip) => (
                  <span
                    key={pip}
                    className={`w-1 h-1 rounded-full ${
                      pip < rem ? (rem <= 2 ? 'bg-red-500' : 'bg-emerald-400') : 'bg-slate-700'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );

  return (
    <header className="w-full max-w-5xl mx-auto px-3 py-2 flex flex-col gap-2">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b-2 border-yellow-500/30 pb-2">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-emerald-700 via-cyan-500 to-yellow-300 border-2 border-yellow-100 flex items-center justify-center shadow-lg shadow-cyan-500/40">
            {renderHeaderIcon(p1Char)}
          </div>
          <div>
            <h1 className="font-pixel text-xs sm:text-sm tracking-wider text-yellow-300 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
              POKÉ VOLLEY ARCADE '97
            </h1>
            <p className="text-[10px] text-yellow-200/70 font-sans font-semibold">
              {battleFormat === '3V3'
                ? '3v3 Squad Elimination • 5 Points Per Character'
                : '1v1 Classic • Squirtle Double Jump • Homing Shurikens'}
            </p>
          </div>
        </div>

        {/* Battle Format Switcher & Quick Controls */}
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
          {/* 1V1 vs 3V3 Pill Toggle */}
          <div className="flex bg-slate-900 p-0.5 rounded-lg border border-slate-700">
            <button
              onClick={() => onSelectBattleFormat('1V1')}
              className={`px-2 py-1 rounded text-[9px] font-pixel transition ${
                battleFormat === '1V1' ? 'bg-yellow-400 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              1V1
            </button>
            <button
              onClick={() => onSelectBattleFormat('3V3')}
              className={`px-2 py-1 rounded text-[9px] font-pixel transition flex items-center gap-1 ${
                battleFormat === '3V3' ? 'bg-emerald-400 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Users className="w-3 h-3" /> 3V3
            </button>
          </div>

          {battleFormat === '3V3' && (
            <button
              onClick={onOpenTeamSetup}
              className="px-2 py-1 rounded bg-emerald-600/30 hover:bg-emerald-600/50 border border-emerald-400/60 text-emerald-200 text-[9px] font-pixel transition"
            >
              EDIT SQUADS
            </button>
          )}

          <button
            onClick={onTogglePause}
            className="p-1.5 sm:px-2.5 sm:py-1 rounded bg-slate-800 hover:bg-slate-700 border border-slate-600 text-xs font-sans font-bold flex items-center gap-1 transition"
            title="Pause / Options"
          >
            {isPaused ? <Play className="w-3.5 h-3.5 text-green-400" /> : <Pause className="w-3.5 h-3.5 text-amber-400" />}
            <span className="hidden sm:inline">{isPaused ? 'Resume' : 'Pause'}</span>
          </button>

          <button
            onClick={onToggleSound}
            className={`p-1.5 rounded border transition ${soundEnabled ? 'bg-amber-500/20 border-amber-400 text-amber-300' : 'bg-slate-800 border-slate-700 text-slate-400'}`}
            title="Toggle Sound FX"
          >
            {soundEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
          </button>

          <button
            onClick={onToggleMusic}
            className={`p-1.5 rounded border transition ${musicEnabled ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300' : 'bg-slate-800 border-slate-700 text-slate-400'}`}
            title="Toggle 8-bit Beach Music"
          >
            <Music className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={onToggleCrt}
            className={`p-1.5 rounded border transition ${crtFilter ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300 shadow-[0_0_8px_rgba(6,182,212,0.4)]' : 'bg-slate-800 border-slate-700 text-slate-400'}`}
            title="Toggle 90s CRT Scanline Shader"
          >
            <Monitor className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={onResetMatch}
            className="p-1.5 rounded bg-slate-800 hover:bg-red-950/40 border border-slate-700 hover:border-red-500/50 text-slate-300 hover:text-red-400 transition"
            title="Reset Match"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Retro Arcade LED Scoreboard */}
      <div className="bg-slate-900/90 border-2 border-yellow-500/60 rounded-xl px-3 sm:px-4 py-2 flex items-center justify-between shadow-inner shadow-black">
        {/* P1 Section */}
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={() => (battleFormat === '1V1' ? onSelectP1Char(cycleChar(p1Char)) : onOpenTeamSetup())}
            className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl border-2 flex flex-col items-center justify-center font-pixel text-[8px] shadow transition active:scale-90 ${p1Meta.badgeColor}`}
            title={battleFormat === '1V1' ? 'Click to cycle P1 Character' : 'Click to edit 3v3 Squad'}
          >
            <span>{p1Meta.emoji}</span>
            <span className="text-[7px] font-bold">{p1Meta.shortLabel}</span>
          </button>
          <div>
            <div className="text-[10px] font-pixel text-yellow-400 flex items-center gap-1">
              <span>PLAYER 1</span>
              {battleFormat === '1V1' && score.advantage === 'P1' && (
                <span className="text-[8px] bg-emerald-600 px-1 py-0.5 rounded text-white animate-pulse">ADV</span>
              )}
              {battleFormat === '3V3' && (
                <span className="text-[8px] text-slate-400 font-sans font-bold">
                  ({3 - score.p1ActiveIdx} left)
                </span>
              )}
            </div>

            {battleFormat === '3V3' ? (
              renderRosterStrip(p1Team, score.p1ActiveIdx, score.p1CharLosses, false)
            ) : (
              <div className="text-[9px] text-yellow-200/90 hidden sm:block font-sans font-medium">
                {p1Meta.skillHint}
              </div>
            )}

            <div className="text-[8px] text-slate-400 hidden sm:block mt-0.5">
              Controls: A/D (Move) • W (Jump) • Space/F (Action)
            </div>
          </div>
        </div>

        {/* Center LED Numbers */}
        <div className="flex flex-col items-center">
          <div className="flex items-center gap-3 sm:gap-6 bg-black/90 px-4 py-1.5 rounded-lg border border-yellow-500/40 shadow-inner">
            <span className="font-pixel text-2xl sm:text-3xl text-yellow-400 tabular-nums drop-shadow-[0_0_8px_rgba(250,204,21,0.6)]">
              {String(score.p1).padStart(2, '0')}
            </span>
            <span className="font-pixel text-xs text-red-500 animate-pulse">:</span>
            <span className="font-pixel text-2xl sm:text-3xl text-cyan-400 tabular-nums drop-shadow-[0_0_8px_rgba(34,211,238,0.6)]">
              {String(score.p2).padStart(2, '0')}
            </span>
          </div>

          <div className="flex items-center gap-2 mt-1">
            {battleFormat === '3V3' ? (
              <span className="px-2 py-0.5 rounded bg-emerald-600/30 border border-emerald-400/50 text-emerald-200 font-pixel text-[8px] tracking-wider">
                3V3 • 5 PTS / CHAR
              </span>
            ) : score.isDeuce ? (
              <span className="px-2 py-0.5 rounded bg-red-600/90 text-white font-pixel text-[9px] tracking-wider animate-bounce flex items-center gap-1 shadow-[0_0_10px_rgba(239,68,68,0.8)]">
                <Flame className="w-3 h-3 text-yellow-300 fill-yellow-300" />
                DEUCE (WIN BY 2)
              </span>
            ) : (
              <div className="flex items-center gap-2 text-[9px] font-pixel text-slate-400">
                <span>TARGET {targetScore}</span>
                <span>•</span>
                <span className="text-amber-300">RALLY: {score.currentRally}</span>
              </div>
            )}
          </div>
        </div>

        {/* P2 / AI Section */}
        <div className="flex items-center gap-2 sm:gap-3 text-right flex-row-reverse">
          <button
            onClick={() => (battleFormat === '1V1' ? onSelectP2Char(cycleChar(p2Char)) : onOpenTeamSetup())}
            className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl border-2 flex flex-col items-center justify-center font-pixel text-[8px] shadow transition active:scale-90 ${p2Meta.badgeColor}`}
            title={battleFormat === '1V1' ? 'Click to cycle P2 Character' : 'Click to edit 3v3 Squad'}
          >
            <span>{p2Meta.emoji}</span>
            <span className="text-[7px] font-bold">{p2Meta.shortLabel}</span>
          </button>
          <div>
            <div className="text-[10px] font-pixel text-cyan-400 flex items-center justify-end gap-1">
              {battleFormat === '1V1' && score.advantage === 'P2' && (
                <span className="text-[8px] bg-emerald-600 px-1 py-0.5 rounded text-white animate-pulse">ADV</span>
              )}
              {battleFormat === '3V3' && (
                <span className="text-[8px] text-slate-400 font-sans font-bold">
                  ({3 - score.p2ActiveIdx} left)
                </span>
              )}
              <span>{gameMode === '1P_VS_AI' ? `AI (${p2Meta.shortLabel})` : 'PLAYER 2'}</span>
            </div>

            {battleFormat === '3V3' ? (
              renderRosterStrip(p2Team, score.p2ActiveIdx, score.p2CharLosses, true)
            ) : (
              <div className="text-[9px] text-cyan-200/90 hidden sm:block font-sans font-medium">
                {p2Meta.skillHint}
              </div>
            )}

            <div className="text-[8px] text-slate-400 hidden sm:block mt-0.5">
              {gameMode === '2P_LOCAL' ? 'Controls: ←/→ (Move) • ↑ (Jump) • Enter/K (Action)' : 'AI Auto-Pilot'}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
