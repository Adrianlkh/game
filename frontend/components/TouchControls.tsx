import React from 'react';
import { ArrowLeft, ArrowRight, ArrowUp, Sparkles } from 'lucide-react';

interface TouchControlsProps {
  onTouchChange: (input: { p1Left: boolean; p1Right: boolean; p1Jump: boolean; p1Action: boolean }) => void;
  inputState: { p1Left: boolean; p1Right: boolean; p1Jump: boolean; p1Action: boolean };
}

export const TouchControls: React.FC<TouchControlsProps> = ({ onTouchChange, inputState }) => {
  const updateInput = (key: keyof typeof inputState, val: boolean) => {
    onTouchChange({
      ...inputState,
      [key]: val,
    });
  };

  return (
    <div className="w-full max-w-5xl mx-auto mt-2 px-3 flex items-center justify-between select-none touch-none sm:hidden">
      {/* Left / Right directional pad */}
      <div className="flex items-center gap-2">
        <button
          onTouchStart={(e) => { e.preventDefault(); updateInput('p1Left', true); }}
          onTouchEnd={(e) => { e.preventDefault(); updateInput('p1Left', false); }}
          onMouseDown={() => updateInput('p1Left', true)}
          onMouseUp={() => updateInput('p1Left', false)}
          className={`w-14 h-14 rounded-2xl border-2 flex items-center justify-center active:scale-95 transition ${
            inputState.p1Left ? 'bg-yellow-400 border-yellow-200 text-slate-900 shadow-lg' : 'bg-slate-900/90 border-yellow-500/50 text-yellow-400'
          }`}
          aria-label="Move Left"
        >
          <ArrowLeft className="w-7 h-7" />
        </button>

        <button
          onTouchStart={(e) => { e.preventDefault(); updateInput('p1Right', true); }}
          onTouchEnd={(e) => { e.preventDefault(); updateInput('p1Right', false); }}
          onMouseDown={() => updateInput('p1Right', true)}
          onMouseUp={() => updateInput('p1Right', false)}
          className={`w-14 h-14 rounded-2xl border-2 flex items-center justify-center active:scale-95 transition ${
            inputState.p1Right ? 'bg-yellow-400 border-yellow-200 text-slate-900 shadow-lg' : 'bg-slate-900/90 border-yellow-500/50 text-yellow-400'
          }`}
          aria-label="Move Right"
        >
          <ArrowRight className="w-7 h-7" />
        </button>
      </div>

      {/* Jump & Dedicated Pokémon Nature Skill button */}
      <div className="flex items-center gap-2">
        <button
          onTouchStart={(e) => { e.preventDefault(); updateInput('p1Jump', true); }}
          onTouchEnd={(e) => { e.preventDefault(); updateInput('p1Jump', false); }}
          onMouseDown={() => updateInput('p1Jump', true)}
          onMouseUp={() => updateInput('p1Jump', false)}
          className={`w-14 h-14 rounded-2xl border-2 flex flex-col items-center justify-center active:scale-95 transition ${
            inputState.p1Jump ? 'bg-emerald-400 border-emerald-200 text-slate-950' : 'bg-slate-900/90 border-emerald-500/50 text-emerald-400'
          }`}
          aria-label="Jump / Fly"
        >
          <ArrowUp className="w-6 h-6" />
          <span className="text-[8px] font-pixel">JUMP</span>
        </button>

        <button
          onTouchStart={(e) => { e.preventDefault(); updateInput('p1Action', true); }}
          onTouchEnd={(e) => { e.preventDefault(); updateInput('p1Action', false); }}
          onMouseDown={() => updateInput('p1Action', true)}
          onMouseUp={() => updateInput('p1Action', false)}
          className={`w-16 h-14 rounded-2xl border-2 flex flex-col items-center justify-center active:scale-95 transition ${
            inputState.p1Action ? 'bg-gradient-to-r from-yellow-400 to-pink-500 border-white text-white shadow-[0_0_15px_rgba(236,72,153,0.8)]' : 'bg-slate-900/90 border-pink-500/60 text-pink-300'
          }`}
          aria-label="Pokémon Nature Skill"
        >
          <Sparkles className="w-5 h-5 fill-current" />
          <span className="text-[7.5px] font-pixel">SKILL</span>
        </button>
      </div>
    </div>
  );
};
