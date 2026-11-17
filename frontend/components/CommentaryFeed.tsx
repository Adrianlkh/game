import React from 'react';
import { Sparkles, Radio, MessageSquare } from 'lucide-react';
import { CommentaryMessage } from '../types';

interface CommentaryFeedProps {
  latestComment: string;
  isAiGenerating: boolean;
  history: CommentaryMessage[];
}

export const CommentaryFeed: React.FC<CommentaryFeedProps> = ({
  latestComment,
  isAiGenerating,
  history,
}) => {
  return (
    <div className="w-full max-w-5xl mx-auto mt-2 px-3">
      <div className="bg-slate-900/80 border border-yellow-500/40 rounded-lg p-2.5 flex items-center justify-between gap-3 shadow-md">
        {/* Announcer badge */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-yellow-400/20 border border-yellow-400/40 text-yellow-300">
            <Radio className="w-3.5 h-3.5 text-red-500 animate-pulse" />
            <span className="font-pixel text-[9px] tracking-tight">AI ANNOUNCER</span>
          </div>
          {isAiGenerating && (
            <span className="text-[10px] text-yellow-300/70 font-sans italic flex items-center gap-1 animate-pulse">
              <Sparkles className="w-3 h-3 text-cyan-400" /> Thinking...
            </span>
          )}
        </div>

        {/* Ticker message */}
        <div className="flex-1 overflow-hidden">
          <p className="font-sans font-semibold text-xs sm:text-sm text-yellow-100 truncate drop-shadow">
            "{latestComment}"
          </p>
        </div>
      </div>
    </div>
  );
};
