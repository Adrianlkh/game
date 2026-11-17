import React, { useState } from 'react';
import { ArrowUp, ArrowDown, Shuffle } from 'lucide-react';
import { ALL_CHARACTERS, CHARACTER_META } from '../constants';
import { CharacterType, TeamRoster } from '../types';

interface TeamRosterSelectorProps {
  label: string;
  accentColor: 'yellow' | 'cyan';
  team: TeamRoster;
  onChangeTeam: (nextTeam: TeamRoster) => void;
}

export const TeamRosterSelector: React.FC<TeamRosterSelectorProps> = ({
  label,
  accentColor,
  team,
  onChangeTeam,
}) => {
  const [activeSlot, setActiveSlot] = useState<0 | 1 | 2>(0);

  const handleAssignCharacter = (char: CharacterType) => {
    const next: TeamRoster = [...team] as TeamRoster;
    next[activeSlot] = char;
    onChangeTeam(next);
    // Auto-advance slot for fast 3-click drafting
    setActiveSlot(((activeSlot + 1) % 3) as 0 | 1 | 2);
  };

  const handleMoveSlot = (idx: 0 | 1 | 2, direction: 'up' | 'down') => {
    const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (targetIdx < 0 || targetIdx > 2) return;
    const next: TeamRoster = [...team] as TeamRoster;
    const temp = next[idx];
    next[idx] = next[targetIdx];
    next[targetIdx] = temp;
    onChangeTeam(next);
    setActiveSlot(targetIdx as 0 | 1 | 2);
  };

  const handleRandomize = () => {
    const pick = () => ALL_CHARACTERS[Math.floor(Math.random() * ALL_CHARACTERS.length)];
    onChangeTeam([pick(), pick(), pick()]);
  };

  const borderClass = accentColor === 'yellow' ? 'border-yellow-500/40' : 'border-cyan-500/40';
  const titleClass = accentColor === 'yellow' ? 'text-yellow-300' : 'text-cyan-300';
  const ringClass = accentColor === 'yellow' ? 'ring-2 ring-yellow-400 bg-yellow-500/15' : 'ring-2 ring-cyan-400 bg-cyan-500/15';

  return (
    <div className={`bg-slate-950 p-3 rounded-xl border ${borderClass}`}>
      <div className="flex items-center justify-between mb-2">
        <span className={`text-[9px] font-pixel ${titleClass}`}>{label}</span>
        <button
          type="button"
          onClick={handleRandomize}
          className="text-[9px] font-sans font-bold text-slate-300 hover:text-white flex items-center gap-1 bg-slate-800 px-2 py-0.5 rounded border border-slate-700 transition"
          title="Randomize 3-character squad"
        >
          <Shuffle className="w-3 h-3" /> Random
        </button>
      </div>

      {/* 3 Ordered Slots (1st -> 2nd -> 3rd) */}
      <div className="space-y-1.5 mb-2.5">
        {([0, 1, 2] as const).map((idx) => {
          const charId = team[idx];
          const meta = CHARACTER_META[charId];
          const isSelected = activeSlot === idx;
          return (
            <div
              key={idx}
              onClick={() => setActiveSlot(idx)}
              className={`flex items-center justify-between px-2 py-1.5 rounded-lg border cursor-pointer transition ${
                isSelected ? `${ringClass} border-transparent` : 'bg-slate-900 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="font-pixel text-[8px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">
                  #{idx + 1}
                </span>
                <span className="text-sm">{meta.emoji}</span>
                <div className="text-left">
                  <div className="font-pixel text-[8px] text-white">{meta.name.toUpperCase()}</div>
                  <div className="text-[9px] text-slate-400 font-sans">5 PTS • {meta.skillName}</div>
                </div>
              </div>

              {/* Reorder Arrows */}
              <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                <button
                  type="button"
                  disabled={idx === 0}
                  onClick={() => handleMoveSlot(idx, 'up')}
                  className="p-1 rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-30 text-slate-300 transition"
                  title="Move earlier in order"
                >
                  <ArrowUp className="w-3 h-3" />
                </button>
                <button
                  type="button"
                  disabled={idx === 2}
                  onClick={() => handleMoveSlot(idx, 'down')}
                  className="p-1 rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-30 text-slate-300 transition"
                  title="Move later in order"
                >
                  <ArrowDown className="w-3 h-3" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Character Roster Grid to fill Active Slot */}
      <div className="text-[9px] text-slate-400 font-sans mb-1">
        Tap a fighter to assign to <strong className="text-white">Slot #{activeSlot + 1}</strong>:
      </div>
      <div className="grid grid-cols-4 gap-1">
        {ALL_CHARACTERS.map((charId) => {
          const meta = CHARACTER_META[charId];
          const isAssignedHere = team[activeSlot] === charId;
          return (
            <button
              key={charId}
              type="button"
              onClick={() => handleAssignCharacter(charId)}
              className={`py-1 px-1 rounded flex flex-col items-center justify-center gap-0.5 text-[7px] font-pixel transition ${
                isAssignedHere
                  ? `${meta.btnColor} ring-2 ring-white scale-105`
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white'
              }`}
              title={`${meta.name}: ${meta.skillSummary}`}
            >
              <span className="text-xs">{meta.emoji}</span>
              <span>{meta.shortLabel}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
