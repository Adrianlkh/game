import React, { useState, useCallback, useEffect } from 'react';
import { RetroHeader } from './components/RetroHeader';
import { GameCanvas } from './components/GameCanvas';
import { TouchControls } from './components/TouchControls';
import { CommentaryFeed } from './components/CommentaryFeed';
import { MatchOverlay } from './components/MatchOverlay';
import {
  AIDifficulty,
  BattleFormat,
  CharacterType,
  CommentaryMessage,
  GameMode,
  MatchScore,
  TeamRoster,
} from './types';
import { POINTS_PER_CHARACTER_3V3 } from './constants';
import { audio } from './services/audioService';
import { fetchRetroCommentary } from './services/geminiService';

const INITIAL_SCORE: MatchScore = {
  p1: 0,
  p2: 0,
  currentRally: 0,
  maxRally: 0,
  isDeuce: false,
  advantage: null,
  p1ActiveIdx: 0,
  p2ActiveIdx: 0,
  p1CharLosses: [0, 0, 0],
  p2CharLosses: [0, 0, 0],
};

export default function App() {
  const [score, setScore] = useState<MatchScore>(INITIAL_SCORE);

  const [battleFormat, setBattleFormat] = useState<BattleFormat>('1V1');
  const [gameMode, setGameMode] = useState<GameMode>('1P_VS_AI');
  const [difficulty, setDifficulty] = useState<AIDifficulty>('NORMAL');
  const [targetScore, setTargetScore] = useState<number>(10);

  // 1v1 Single Picks
  const [p1Char, setP1Char] = useState<CharacterType>('PIKACHU');
  const [p2Char, setP2Char] = useState<CharacterType>('SQUIRTLE');

  // 3v3 Ordered Squads
  const [p1Team, setP1Team] = useState<TeamRoster>(['PIKACHU', 'ORBIT', 'SNORLAX']);
  const [p2Team, setP2Team] = useState<TeamRoster>(['SQUIRTLE', 'GRENINJA', 'CHARIZARD']);

  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [musicEnabled, setMusicEnabled] = useState<boolean>(false);
  const [crtFilter, setCrtFilter] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);

  const [latestComment, setLatestComment] = useState<string>(
    'WELCOME TO THE BEACH ARENA! Switch between 1V1 and 3V3 Squad Battles anytime!'
  );
  const [isAiGenerating, setIsAiGenerating] = useState<boolean>(false);
  const [commentHistory, setCommentHistory] = useState<CommentaryMessage[]>([]);

  const [touchInput, setTouchInput] = useState({
    p1Left: false,
    p1Right: false,
    p1Jump: false,
    p1Action: false,
  });

  // Active character resolution for 1v1 vs 3v3
  const activeP1Char = battleFormat === '3V3' ? p1Team[score.p1ActiveIdx] : p1Char;
  const activeP2Char = battleFormat === '3V3' ? p2Team[score.p2ActiveIdx] : p2Char;

  // Victory Detection: In 3v3, when the 3rd (last) character loses 10 lives
  let isGameOver = false;
  if (battleFormat === '3V3') {
    isGameOver =
      score.p1CharLosses[2] >= POINTS_PER_CHARACTER_3V3 ||
      score.p2CharLosses[2] >= POINTS_PER_CHARACTER_3V3;
  } else {
    const reachedDeuce = score.p1 >= targetScore - 1 && score.p2 >= targetScore - 1;
    isGameOver = reachedDeuce
      ? Math.abs(score.p1 - score.p2) >= 2
      : score.p1 >= targetScore || score.p2 >= targetScore;
  }

  const winner: 'P1' | 'P2' | null = isGameOver
    ? battleFormat === '3V3'
      ? score.p2CharLosses[2] >= POINTS_PER_CHARACTER_3V3
        ? 'P1'
        : 'P2'
      : score.p1 > score.p2
      ? 'P1'
      : 'P2'
    : null;

  // Pause shortcut (Escape or P)
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.code === 'Escape' || e.code === 'KeyP') {
        setIsPaused((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, []);

  const handleToggleSound = useCallback(() => {
    setSoundEnabled((prev) => {
      const next = !prev;
      audio.setMuted(!next);
      return next;
    });
  }, []);

  const handleToggleMusic = useCallback(() => {
    setMusicEnabled((prev) => {
      const next = !prev;
      if (next) {
        audio.startMusic();
      } else {
        audio.stopMusic();
      }
      return next;
    });
  }, []);

  const handleTogglePause = useCallback(() => {
    setIsPaused((prev) => !prev);
  }, []);

  const handleResetMatch = useCallback((keepPaused: boolean = false) => {
    setScore(INITIAL_SCORE);
    setIsPaused(keepPaused);
    setLatestComment('NEW MATCH STARTED! Give it everything on the beach court!');
  }, []);

  const handleSelectBattleFormat = useCallback((format: BattleFormat) => {
    setBattleFormat(format);
    setScore(INITIAL_SCORE);
    if (format === '3V3') {
      setIsPaused(true);
      setLatestComment(`3V3 SQUAD BATTLE! Pick 3 fighters in order — ${POINTS_PER_CHARACTER_3V3} lives per fighter!`);
    } else {
      setIsPaused(false);
      setLatestComment('1V1 CLASSIC MATCH! First to reach target score (win by 2 if Deuce)!');
    }
  }, []);

  const handleScoreUpdate = useCallback(
    async (
      newScore: MatchScore,
      scorer: 'P1' | 'P2',
      eventType: 'POINT' | 'SPIKE' | 'DIVE_SAVE' | 'DEUCE' | 'ADVANTAGE' | 'TAG_IN',
      taggedInChar?: CharacterType
    ) => {
      setScore(newScore);

      let matchEnded = false;
      if (battleFormat === '3V3') {
        matchEnded =
          newScore.p1CharLosses[2] >= POINTS_PER_CHARACTER_3V3 ||
          newScore.p2CharLosses[2] >= POINTS_PER_CHARACTER_3V3;
      } else {
        const matchReachedDeuce = newScore.p1 >= targetScore - 1 && newScore.p2 >= targetScore - 1;
        matchEnded = matchReachedDeuce
          ? Math.abs(newScore.p1 - newScore.p2) >= 2
          : newScore.p1 >= targetScore || newScore.p2 >= targetScore;
      }

      const p1Now = battleFormat === '3V3' ? p1Team[newScore.p1ActiveIdx] : p1Char;
      const p2Now = battleFormat === '3V3' ? p2Team[newScore.p2ActiveIdx] : p2Char;

      setIsAiGenerating(true);
      const comment = await fetchRetroCommentary({
        event: matchEnded ? 'WIN' : eventType,
        battleFormat,
        scoringPlayer: scorer,
        scorerCharacter: scorer === 'P1' ? p1Now : p2Now,
        opponentCharacter: scorer === 'P1' ? p2Now : p1Now,
        score: { p1: newScore.p1, p2: newScore.p2 },
        rallyCount: newScore.currentRally,
        isDeuce: newScore.isDeuce,
        advantage: newScore.advantage,
        taggedInChar,
      });
      setLatestComment(comment);
      setIsAiGenerating(false);

      setCommentHistory((prev) => [
        {
          id: Math.random().toString(),
          sender: 'ANNOUNCER',
          text: comment,
          timestamp: Date.now(),
          type: eventType === 'DEUCE' || eventType === 'TAG_IN' ? 'POINT' : eventType,
        },
        ...prev.slice(0, 15),
      ]);
    },
    [battleFormat, targetScore, p1Char, p2Char, p1Team, p2Team]
  );

  const handleRallyIncrement = useCallback((rally: number) => {
    setScore((prev) => ({
      ...prev,
      currentRally: rally,
      maxRally: Math.max(prev.maxRally, rally),
    }));
  }, []);

  return (
    <div
      className={`min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between py-2 sm:py-4 px-2 select-none ${
        crtFilter ? 'crt-overlay crt-glow' : ''
      }`}
    >
      <RetroHeader
        score={score}
        targetScore={targetScore}
        battleFormat={battleFormat}
        gameMode={gameMode}
        difficulty={difficulty}
        p1Char={activeP1Char}
        p2Char={activeP2Char}
        p1Team={p1Team}
        p2Team={p2Team}
        soundEnabled={soundEnabled}
        musicEnabled={musicEnabled}
        crtFilter={crtFilter}
        isPaused={isPaused}
        onToggleSound={handleToggleSound}
        onToggleMusic={handleToggleMusic}
        onToggleCrt={() => setCrtFilter((prev) => !prev)}
        onTogglePause={handleTogglePause}
        onResetMatch={() => handleResetMatch(false)}
        onSelectBattleFormat={handleSelectBattleFormat}
        onSelectP1Char={(c) => {
          setP1Char(c);
          handleResetMatch(false);
        }}
        onSelectP2Char={(c) => {
          setP2Char(c);
          handleResetMatch(false);
        }}
        onOpenTeamSetup={() => setIsPaused(true)}
      />

      <main className="w-full flex-1 flex flex-col items-center justify-center relative my-1">
        <GameCanvas
          battleFormat={battleFormat}
          gameMode={gameMode}
          difficulty={difficulty}
          targetScore={targetScore}
          p1Char={activeP1Char}
          p2Char={activeP2Char}
          p1Team={p1Team}
          p2Team={p2Team}
          p1ActiveIdx={score.p1ActiveIdx}
          p2ActiveIdx={score.p2ActiveIdx}
          isPaused={isPaused || isGameOver}
          score={score}
          onScoreUpdate={handleScoreUpdate}
          onRallyIncrement={handleRallyIncrement}
          touchInput={touchInput}
        />

        <TouchControls inputState={touchInput} onTouchChange={setTouchInput} />
      </main>

      <CommentaryFeed
        latestComment={latestComment}
        isAiGenerating={isAiGenerating}
        history={commentHistory}
      />

      <MatchOverlay
        isPaused={isPaused}
        isGameOver={isGameOver}
        winner={winner}
        score={score}
        battleFormat={battleFormat}
        gameMode={gameMode}
        difficulty={difficulty}
        targetScore={targetScore}
        p1Char={p1Char}
        p2Char={p2Char}
        p1Team={p1Team}
        p2Team={p2Team}
        onResume={() => setIsPaused(false)}
        onRestart={() => handleResetMatch(false)}
        onSelectBattleFormat={handleSelectBattleFormat}
        onSelectMode={(m) => {
          setGameMode(m);
          handleResetMatch(true);
        }}
        onSelectDifficulty={(d) => {
          setDifficulty(d);
          handleResetMatch(true);
        }}
        onSelectTargetScore={(pts) => {
          setTargetScore(pts);
          handleResetMatch(true);
        }}
        onSelectP1Char={(c) => {
          setP1Char(c);
          handleResetMatch(true);
        }}
        onSelectP2Char={(c) => {
          setP2Char(c);
          handleResetMatch(true);
        }}
        onChangeP1Team={(team) => {
          setP1Team(team);
          handleResetMatch(true);
        }}
        onChangeP2Team={(team) => {
          setP2Team(team);
          handleResetMatch(true);
        }}
      />
    </div>
  );
}
