import { GoogleGenAI } from '@google/genai';
import { CharacterType, BattleFormat } from '../types';

export interface CommentaryRequest {
  event: 'SPIKE' | 'DIVE_SAVE' | 'POINT' | 'MATCH_POINT' | 'DEUCE' | 'ADVANTAGE' | 'WIN' | 'TAG_IN';
  battleFormat?: BattleFormat;
  scoringPlayer: 'P1' | 'P2';
  scorerCharacter: CharacterType;
  opponentCharacter: CharacterType;
  score: { p1: number; p2: number };
  rallyCount: number;
  isDeuce: boolean;
  advantage: 'P1' | 'P2' | null;
  taggedInChar?: CharacterType;
}

export async function fetchRetroCommentary(req: CommentaryRequest): Promise<string> {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY, vertexai: true });

    const heroDesc = req.scoringPlayer === 'P1' ? `Player 1 (${req.scorerCharacter})` : `Player 2 (${req.opponentCharacter})`;

    const prompt = `You are the legendary 90s retro arcade sports announcer for the beach volleyball tournament (${req.battleFormat === '3V3' ? '3v3 Squad Elimination Battle' : '1v1 Battle'}) featuring Pikachu, Squirtle, Charizard, Mewtwo, Mew, Orbit, Greninja, and Snorlax!
Event: ${req.event}
Scorer/Hero: ${heroDesc}
Current Score: P1: ${req.score.p1} vs P2: ${req.score.p2}
${req.taggedInChar ? `Character Knocked Out (5 points lost)! New fighter tagging in: ${req.taggedInChar}!` : ''}
Deuce Status: ${req.isDeuce ? (req.advantage ? `ADVANTAGE ${req.advantage}!` : 'TIED IN DEUCE (WIN BY 2)!') : 'Standard play'}
Rally Hits: ${req.rallyCount}

Generate ONE short, punchy, nostalgic 90s arcade hype sentence (maximum 14 words).
- If TAG_IN: shout about the 5-point knockout and hype up ${req.taggedInChar} entering the sand court!
- If Squirtle scored: shout about "DOUBLE JUMP!", "SQUIRTLE LEAPS SKY-HIGH!".
- If Snorlax scored: shout about "SNORLAX AWAKENED WITH ULTRA FORCE!" or "SEISMIC BELLY CRASH!".
- If Pikachu called Thunder: shout about "PIKACHU'S AUTO-LOCK THUNDER CRASH!".
- If Greninja scored: shout about "HOMING WATER SHURIKEN STRIKE!".
- If Orbit locked abilities: shout about "ORBIT'S HACKER LOCKDOWN!" or "OVERCLOCKED MEGA-SPIKE!".
- If Mewtwo warped: shout about "MEWTWO WARPED THE BALL TO A RANDOM SPOT!".
- If Mew blinked: shout about "MEW TELEPORTED RIGHT TO THE BALL!".
- If DEUCE: shout "DEUCE! MUST WIN BY 2!".
No markdown, no asterisks, no quotes. Just the raw energetic quote.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        thinkingConfig: { thinkingBudget: 0 },
        temperature: 1.0,
      }
    });

    return response.text?.trim() || (req.taggedInChar ? `5 POINTS LOST! ${req.taggedInChar} TAGS IN TO SAVE THE SQUAD!` : 'WHAT A THRILLING RALLY ON THE BEACH!');
  } catch {
    if (req.event === 'TAG_IN' && req.taggedInChar) {
      return `KNOCKOUT! ${req.taggedInChar} TAGS IN NEXT FROM THE SQUAD ROSTER!`;
    }
    const squirtleLines = [
      'DOUBLE JUMP! Squirtle leaps sky-high on a burst of bubbles!',
      'BUBBLE HOP! Squirtle catches big air for the smash!'
    ];
    const snorlaxLines = [
      'SNORLAX AWAKENED! An earth-shattering spike even stronger than Orbit!',
      'REST COMPLETED! Snorlax unleashes unstoppable ultra colossal power!'
    ];
    const pikaLines = [
      'AUTO-LOCK THUNDER! Pikachu crashes lightning from the sky for a 2-second stun!',
      'THUNDER CRASH! Unavoidable lightning strike paralyzes the rival!'
    ];
    const greninjaLines = [
      'HOMING WATER SHURIKEN! Greninja tracks down the rival with ninja precision!',
      'NINJA FROG SUPREMACY! Rapid water shuriken barrage!'
    ];
    const orbitLines = [
      'HACKER LOCKDOWN! Orbit disables enemy abilities for the entire point!',
      'OVERCLOCKED SPIKE! Orbit hits with unmatched alien computing power!'
    ];
    const mewtwoLines = [
      'RANDOM WARP! Mewtwo bends reality to an unpredictable drop zone!',
      'PSYSTRIKE TELEPORT! Unpredictable dimensional chaos!'
    ];
    const mewLines = [
      'MEW TELEPORTED RIGHT TO THE BALL! Flawless mythical positioning!',
      'BLINK TO THE BALL! Mew appeared in the exact right spot!'
    ];

    if (req.event === 'DEUCE' || req.isDeuce) {
      return 'DEUCE! The crowd is on their feet! Win by 2!';
    }
    if (req.scorerCharacter === 'SQUIRTLE') return squirtleLines[Math.floor(Math.random() * squirtleLines.length)];
    if (req.scorerCharacter === 'SNORLAX') return snorlaxLines[Math.floor(Math.random() * snorlaxLines.length)];
    if (req.scorerCharacter === 'PIKACHU') return pikaLines[Math.floor(Math.random() * pikaLines.length)];
    if (req.scorerCharacter === 'GRENINJA') return greninjaLines[Math.floor(Math.random() * greninjaLines.length)];
    if (req.scorerCharacter === 'ORBIT') return orbitLines[Math.floor(Math.random() * orbitLines.length)];
    if (req.scorerCharacter === 'MEWTWO') return mewtwoLines[Math.floor(Math.random() * mewtwoLines.length)];
    if (req.scorerCharacter === 'MEW') return mewLines[Math.floor(Math.random() * mewLines.length)];
    return 'WHAT A SENSATIONAL VOLLEYBALL PLAY ON THE SAND!';
  }
}
