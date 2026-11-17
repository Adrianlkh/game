import React from 'react';
import { Trophy, Play, RotateCcw, Swords, Users, Bot, Zap, Droplets, Flame, Sparkles, Heart, Terminal, Moon } from 'lucide-react';
import { AIDifficulty, BattleFormat, CharacterType, GameMode, MatchScore, TeamRoster } from '../types';
import { ALL_CHARACTERS, CHARACTER_META, POINTS_PER_CHARACTER_3V3 } from '../constants';
import { TeamRosterSelector } from './TeamRosterSelector';

interface MatchOverlayProps {
  isPaused: boolean;
  isGameOver: boolean;
  winner: 'P1' | 'P2' | null;
  score: MatchScore;
  battleFormat: BattleFormat;
  gameMode: GameMode;
  difficulty: AIDifficulty;
  targetScore: number;
  p1Char: CharacterType;
  p2Char: CharacterType;
  p1Team: TeamRoster;
  p2Team: TeamRoster;
  onResume: () => void;
  onRestart: () => void;
  onSelectBattleFormat: (format: BattleFormat) => void;
  onSelectMode: (mode: GameMode) => void;
  onSelectDifficulty: (diff: AIDifficulty) => void;
  onSelectTargetScore: (target: number) => void;
  onSelectP1Char: (char: CharacterType) => void;
  onSelectP2Char: (char: CharacterType) => void;
  onChangeP1Team: (team: TeamRoster) => void;
  onChangeP2Team: (team: TeamRoster) => void;
}

export const MatchOverlay: React.FC<MatchOverlayProps> = ({
  isPaused,
  isGameOver,
  winner,
  score,
  battleFormat,
  gameMode,
  difficulty,
  targetScore,
  p1Char,
  p2Char,
  p1Team,
  p2Team,
  onResume,
  onRestart,
  onSelectBattleFormat,
  onSelectMode,
  onSelectDifficulty,
  onSelectTargetScore,
  onSelectP1Char,
  onSelectP2Char,
  onChangeP1Team,
  onChangeP2Team,
}) => {
  if (!isPaused && !isGameOver) return null;

  const winnerLabel =
    battleFormat === '3V3'
      ? winner === 'P1'
        ? 'PLAYER 1 SQUAD WINS!'
        : `${gameMode === '1P_VS_AI' ? 'AI' : 'PLAYER 2'} SQUAD WINS!`
      : winner === 'P1'
      ? `PLAYER 1 (${p1Char}) WINS!`
      : `${gameMode === '1P_VS_AI' ? 'AI' : 'PLAYER 2'} (${p2Char}) WINS!`;

  const charButtons: Array<{ id: CharacterType; label: string; icon: React.ReactNode; color: string; desc: string }> = [
    { id: 'PIKACHU', label: 'PIKA', icon: <Zap className="w-3 h-3 text-amber-900 fill-yellow-400" />, color: 'bg-yellow-400 hover:bg-yellow-300 text-slate-950', desc: 'Thunder: Auto-locks sky lightning onto rival; 2.0s stun (5 uses • locked during first 3s of each point)!' },
    { id: 'SQUIRTLE', label: 'SQRT', icon: <Droplets className="w-3 h-3 text-blue-800 fill-cyan-400" />, color: 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold', desc: 'Double Jump: Exactly 1 extra jump in mid-air per ground contact!' },
    { id: 'GRENINJA', label: 'NINJA', icon: <Swords className="w-3 h-3 text-blue-200 fill-blue-300" />, color: 'bg-blue-600 hover:bg-blue-500 text-white font-bold ring-1 ring-blue-300', desc: 'Homing Water Shuriken: Auto-locks onto rival, 0.5s stun! Recharges 1 star every 10s!' },
    { id: 'SNORLAX', label: 'LAX', icon: <Moon className="w-3 h-3 text-yellow-300 fill-yellow-400" />, color: 'bg-emerald-800 hover:bg-emerald-700 text-yellow-200 font-bold ring-1 ring-emerald-400', desc: 'Rest: Sleeps for 6s at 0.75x speed; awakens into Ultra Power stronger than Orbit! (10 uses)' },
    { id: 'ORBIT', label: 'ORBIT', icon: <Terminal className="w-3 h-3 text-cyan-200 fill-cyan-400" />, color: 'bg-cyan-600 hover:bg-cyan-500 text-white font-bold ring-1 ring-cyan-300', desc: 'Hacker Skill: Disables rival ability for the entire 1-point interval (5 uses) + Heaviest Ball Power!' },
    { id: 'MEWTWO', label: 'MEW2', icon: <Sparkles className="w-3 h-3 text-purple-200 fill-purple-300" />, color: 'bg-purple-600 hover:bg-purple-500 text-white', desc: 'Psychic Singularity: Teleports ball to a random court spot (5 uses)!' },
    { id: 'MEW', label: 'MEW', icon: <Heart className="w-3 h-3 text-red-600 fill-pink-300" />, color: 'bg-pink-400 hover:bg-pink-300 text-slate-950 font-bold', desc: 'Instant Blink: Teleports directly TO the ball to set up your hit (5 uses)!' },
    { id: 'CHARIZARD', label: 'ZARD', icon: <Flame className="w-3 h-3 text-red-700 fill-orange-500" />, color: 'bg-orange-500 hover:bg-orange-400 text-white', desc: 'Flight: Hold Jump to soar & hover over court; Flame Spike!' },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-slate-900 border-4 border-yellow-500 rounded-2xl p-5 sm:p-6 shadow-[0_0_40px_rgba(253,203,2,0.3)] text-center max-h-[95vh] overflow-y-auto">
        {isGameOver ? (
          <div>
            <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-gradient-to-tr from-cyan-400 via-pink-400 to-yellow-300 border-4 border-yellow-200 flex items-center justify-center shadow-lg shadow-cyan-500/50">
              <Trophy className="w-9 h-9 text-slate-950" />
            </div>
            <h2 className="font-pixel text-sm sm:text-base text-yellow-300 drop-shadow mb-1">
              {winnerLabel}
            </h2>
            <p className="font-sans text-xs text-yellow-100/80 mb-4">
              {battleFormat === '3V3'
                ? `All 3 rival squad fighters knocked out (${POINTS_PER_CHARACTER_3V3} lives each)! Final Score: ${score.p1} - ${score.p2}`
                : `${score.isDeuce ? 'Clutched in DEUCE! ' : ''}Final Score: ${Math.max(score.p1, score.p2)} to ${Math.min(score.p1, score.p2)}!`}
            </p>

            <button
              onClick={onRestart}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-yellow-400 to-amber-500 hover:from-yellow-300 hover:to-amber-400 text-slate-950 font-pixel text-xs tracking-wider font-bold shadow-lg shadow-yellow-500/30 active:scale-95 transition mb-4"
            >
              PLAY AGAIN
            </button>
          </div>
        ) : (
          <div>
            <h2 className="font-pixel text-base sm:text-lg text-yellow-400 mb-1">
              {battleFormat === '3V3' ? '3V3 SQUAD SETUP & OPTIONS' : 'GAME PAUSED'}
            </h2>
            <p className="text-xs text-slate-400 mb-4 font-sans">
              {battleFormat === '3V3'
                ? `Draft 3 characters in order. Each character has ${POINTS_PER_CHARACTER_3V3} lives before tagging out!`
                : 'Choose characters, battle format, difficulty, or resume'}
            </p>

            <div className="flex gap-2 mb-4">
              <button
                onClick={onResume}
                className="flex-1 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-pixel text-xs font-bold transition flex items-center justify-center gap-1.5 shadow"
              >
                <Play className="w-4 h-4 fill-current" /> RESUME / FIGHT
              </button>
              <button
                onClick={onRestart}
                className="py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-600 text-slate-200 font-pixel text-xs transition flex items-center justify-center gap-1.5"
              >
                <RotateCcw className="w-4 h-4" /> RESTART
              </button>
            </div>
          </div>
        )}

        {/* Battle Format Selector (1v1 vs 3v3) */}
        <div className="border-t border-slate-800 pt-3 text-left">
          <div className="grid grid-cols-2 gap-2 mb-3">
            <button
              onClick={() => onSelectBattleFormat('1V1')}
              className={`p-2 rounded-lg border text-xs font-sans font-bold flex items-center justify-center gap-2 transition ${
                battleFormat === '1V1'
                  ? 'bg-yellow-500/20 border-yellow-400 text-yellow-300'
                  : 'bg-slate-800 border-slate-700 text-slate-400'
              }`}
            >
              1V1 Classic Match
            </button>
            <button
              onClick={() => onSelectBattleFormat('3V3')}
              className={`p-2 rounded-lg border text-xs font-sans font-bold flex items-center justify-center gap-2 transition ${
                battleFormat === '3V3'
                  ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300'
                  : 'bg-slate-800 border-slate-700 text-slate-400'
              }`}
            >
              <Users className="w-4 h-4 text-emerald-400" /> 3V3 Squad ({POINTS_PER_CHARACTER_3V3} Lives / Char)
            </button>
          </div>

          {/* Character Pickers */}
          {battleFormat === '3V3' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
              <TeamRosterSelector
                label={`P1 SQUAD ORDER (${POINTS_PER_CHARACTER_3V3} LIVES EACH)`}
                accentColor="yellow"
                team={p1Team}
                onChangeTeam={onChangeP1Team}
              />
              <TeamRosterSelector
                label={gameMode === '1P_VS_AI' ? `AI SQUAD ORDER (${POINTS_PER_CHARACTER_3V3} LIVES EACH)` : `P2 SQUAD ORDER (${POINTS_PER_CHARACTER_3V3} LIVES EACH)`}
                accentColor="cyan"
                team={p2Team}
                onChangeTeam={onChangeP2Team}
              />
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
              {/* P1 1v1 Picker */}
              <div className="bg-slate-950 p-2.5 rounded-xl border border-yellow-500/30">
                <span className="text-[9px] font-pixel text-yellow-300 block mb-1.5">P1 CHARACTER</span>
                <div className="flex flex-wrap gap-1.5">
                  {ALL_CHARACTERS.map((charId) => {
                    const meta = CHARACTER_META[charId];
                    return (
                      <button
                        key={charId}
                        onClick={() => onSelectP1Char(charId)}
                        className={`py-1.5 px-2 rounded flex items-center justify-center gap-1 text-[8px] font-pixel transition ${
                          p1Char === charId
                            ? `${meta.btnColor} font-bold ring-2 ring-white scale-105`
                            : 'bg-slate-800 text-slate-400 hover:text-white'
                        }`}
                      >
                        <span>{meta.emoji}</span> {meta.shortLabel}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* P2 1v1 Picker */}
              <div className="bg-slate-950 p-2.5 rounded-xl border border-cyan-500/30">
                <span className="text-[9px] font-pixel text-cyan-300 block mb-1.5">
                  {gameMode === '1P_VS_AI' ? 'AI BOT' : 'P2'} CHARACTER
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {ALL_CHARACTERS.map((charId) => {
                    const meta = CHARACTER_META[charId];
                    return (
                      <button
                        key={charId}
                        onClick={() => onSelectP2Char(charId)}
                        className={`py-1.5 px-2 rounded flex items-center justify-center gap-1 text-[8px] font-pixel transition ${
                          p2Char === charId
                            ? `${meta.btnColor} font-bold ring-2 ring-white scale-105`
                            : 'bg-slate-800 text-slate-400 hover:text-white'
                        }`}
                      >
                        <span>{meta.emoji}</span> {meta.shortLabel}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Skills Reference */}
          <div className="bg-slate-950/80 p-2.5 rounded-xl border border-slate-800 mb-3 text-[10px] font-sans text-slate-300 grid grid-cols-1 sm:grid-cols-2 gap-x-3 gap-y-1">
            {ALL_CHARACTERS.map((charId) => {
              const meta = CHARACTER_META[charId];
              return (
                <div key={charId}>
                  {meta.emoji} <strong className="text-white">{meta.name}</strong>: <em>{meta.skillName}</em> - {meta.skillSummary}
                </div>
              );
            })}
          </div>

          {/* Mode Selector */}
          <div className="grid grid-cols-2 gap-2 mb-3">
            <button
              onClick={() => onSelectMode('1P_VS_AI')}
              className={`p-2 rounded-lg border text-xs font-sans font-bold flex items-center gap-2 transition ${
                gameMode === '1P_VS_AI' ? 'bg-yellow-500/20 border-yellow-400 text-yellow-300' : 'bg-slate-800 border-slate-700 text-slate-400'
              }`}
            >
              <Bot className="w-4 h-4 text-yellow-400" /> 1P vs AI
            </button>
            <button
              onClick={() => onSelectMode('2P_LOCAL')}
              className={`p-2 rounded-lg border text-xs font-sans font-bold flex items-center gap-2 transition ${
                gameMode === '2P_LOCAL' ? 'bg-yellow-500/20 border-yellow-400 text-yellow-300' : 'bg-slate-800 border-slate-700 text-slate-400'
              }`}
            >
              <Users className="w-4 h-4 text-cyan-400" /> 2P Same PC
            </button>
          </div>

          {/* AI Difficulty */}
          {gameMode === '1P_VS_AI' && (
            <div className="mb-3">
              <label className="text-[10px] font-pixel text-yellow-400/80 block mb-1.5">
                AI DIFFICULTY
              </label>
              <div className="grid grid-cols-3 gap-1.5">
                {(['EASY', 'NORMAL', 'MASTER'] as AIDifficulty[]).map((d) => (
                  <button
                    key={d}
                    onClick={() => onSelectDifficulty(d)}
                    className={`py-1.5 rounded text-[10px] font-pixel transition ${
                      difficulty === d ? 'bg-amber-400 text-slate-950 font-bold' : 'bg-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Target Score */}
          {battleFormat === '1V1' && (
            <div>
              <label className="text-[10px] font-pixel text-yellow-400/80 block mb-1.5">
                POINTS TO WIN (DEUCE APPLIES)
              </label>
              <div className="grid grid-cols-3 gap-1.5">
                {[5, 10, 15].map((pts) => (
                  <button
                    key={pts}
                    onClick={() => onSelectTargetScore(pts)}
                    className={`py-1.5 rounded text-[10px] font-pixel transition ${
                      targetScore === pts ? 'bg-yellow-400 text-slate-950 font-bold' : 'bg-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    {pts} PTS
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
