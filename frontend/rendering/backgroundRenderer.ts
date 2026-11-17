import {
  COURT_HEIGHT,
  COURT_WIDTH,
  GROUND_Y,
  NET_TOP_Y,
  NET_WIDTH,
  NET_X,
} from '../constants';
import { MatchScore } from '../types';

export function renderBeachBackground(
  ctx: CanvasRenderingContext2D,
  waveOffset: number,
  cloudOffset: number
) {
  // Sky
  const skyGradient = ctx.createLinearGradient(0, 0, 0, GROUND_Y);
  skyGradient.addColorStop(0, '#0284C7');
  skyGradient.addColorStop(0.4, '#38BDF8');
  skyGradient.addColorStop(0.85, '#FEF08A');
  skyGradient.addColorStop(1, '#FBBF24');
  ctx.fillStyle = skyGradient;
  ctx.fillRect(0, 0, COURT_WIDTH, COURT_HEIGHT);

  // Sun with sunglasses
  ctx.save();
  ctx.fillStyle = '#F59E0B';
  ctx.beginPath();
  ctx.arc(400, 75, 46, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#FDE047';
  ctx.beginPath();
  ctx.arc(400, 75, 41, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#0F172A';
  ctx.fillRect(380, 68, 16, 12);
  ctx.fillRect(404, 68, 16, 12);
  ctx.fillRect(396, 70, 8, 4);
  ctx.fillStyle = '#38BDF8';
  ctx.fillRect(383, 70, 4, 3);
  ctx.fillRect(407, 70, 4, 3);
  ctx.restore();

  // Clouds
  ctx.fillStyle = 'rgba(255, 255, 255, 0.88)';
  const drawCloud = (cx: number, cy: number, scale: number) => {
    ctx.beginPath();
    ctx.arc(cx, cy, 20 * scale, 0, Math.PI * 2);
    ctx.arc(cx + 25 * scale, cy - 8 * scale, 24 * scale, 0, Math.PI * 2);
    ctx.arc(cx + 55 * scale, cy, 18 * scale, 0, Math.PI * 2);
    ctx.arc(cx + 35 * scale, cy + 8 * scale, 22 * scale, 0, Math.PI * 2);
    ctx.fill();
  };
  drawCloud(((120 + cloudOffset) % (COURT_WIDTH + 150)) - 75, 80, 0.9);
  drawCloud(((600 + cloudOffset * 0.7) % (COURT_WIDTH + 150)) - 75, 60, 1.1);

  // Ocean & Waves
  const oceanY = 240;
  ctx.fillStyle = '#0369A1';
  ctx.fillRect(0, oceanY, COURT_WIDTH, GROUND_Y - oceanY);

  ctx.fillStyle = '#38BDF8';
  ctx.beginPath();
  ctx.moveTo(0, oceanY + 15);
  for (let x = 0; x <= COURT_WIDTH; x += 30) {
    const waveY = oceanY + 15 + Math.sin(x * 0.03 + waveOffset) * 6;
    ctx.lineTo(x, waveY);
  }
  ctx.lineTo(COURT_WIDTH, GROUND_Y);
  ctx.lineTo(0, GROUND_Y);
  ctx.fill();

  // Palm Trees
  const drawPalmTree = (baseX: number, isLeft: boolean) => {
    ctx.save();
    ctx.strokeStyle = '#78350F';
    ctx.lineWidth = 12;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(baseX, GROUND_Y);
    const curveX = isLeft ? baseX + 35 : baseX - 35;
    ctx.quadraticCurveTo(curveX, GROUND_Y - 90, isLeft ? baseX + 10 : baseX - 10, GROUND_Y - 170);
    ctx.stroke();

    ctx.fillStyle = '#15803D';
    const topX = isLeft ? baseX + 10 : baseX - 10;
    const topY = GROUND_Y - 170;
    for (let a = -0.8; a <= 0.8; a += 0.35) {
      ctx.beginPath();
      ctx.ellipse(topX + Math.cos(a + (isLeft ? 0.3 : -0.3)) * 45, topY + Math.sin(a) * 20, 35, 12, a, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  };
  drawPalmTree(20, true);
  drawPalmTree(775, false);

  // Sand Court
  const sandGradient = ctx.createLinearGradient(0, GROUND_Y, 0, COURT_HEIGHT);
  sandGradient.addColorStop(0, '#FBBF24');
  sandGradient.addColorStop(0.3, '#F59E0B');
  sandGradient.addColorStop(1, '#D97706');
  ctx.fillStyle = sandGradient;
  ctx.fillRect(0, GROUND_Y, COURT_WIDTH, COURT_HEIGHT - GROUND_Y);

  ctx.strokeStyle = 'rgba(255, 255, 255, 0.75)';
  ctx.lineWidth = 3;
  ctx.strokeRect(30, GROUND_Y + 1, COURT_WIDTH - 60, COURT_HEIGHT - GROUND_Y - 12);

  ctx.beginPath();
  ctx.moveTo(NET_X, GROUND_Y + 1);
  ctx.lineTo(NET_X, COURT_HEIGHT - 12);
  ctx.stroke();

  // Net
  ctx.fillStyle = '#94A3B8';
  ctx.fillRect(NET_X - NET_WIDTH / 2, NET_TOP_Y, NET_WIDTH, GROUND_Y - NET_TOP_Y);
  ctx.fillStyle = '#F8FAFC';
  ctx.fillRect(NET_X - NET_WIDTH / 2 - 2, NET_TOP_Y, NET_WIDTH + 4, 10);
  ctx.strokeStyle = '#E2E8F0';
  ctx.lineWidth = 1;
  for (let y = NET_TOP_Y + 10; y < GROUND_Y; y += 10) {
    ctx.beginPath();
    ctx.moveTo(NET_X - NET_WIDTH / 2, y);
    ctx.lineTo(NET_X + NET_WIDTH / 2, y);
    ctx.stroke();
  }
}

export function renderCountdownAndPointBanners(
  ctx: CanvasRenderingContext2D,
  countdownTimer: number,
  pointResetDelay: number,
  score: MatchScore,
  tagInBanner: string | null
) {
  if (countdownTimer > 0) {
    ctx.save();
    const t = countdownTimer;

    let bannerText = '3';
    let bannerColor = '#38BDF8';
    let bannerGlow = 'rgba(56, 189, 248, 0.8)';
    let frameInStep = 0;

    if (t > 85) {
      bannerText = '3';
      bannerColor = '#38BDF8';
      bannerGlow = 'rgba(56, 189, 248, 0.8)';
      frameInStep = t - 85;
    } else if (t > 55) {
      bannerText = '2';
      bannerColor = '#FDE047';
      bannerGlow = 'rgba(253, 224, 71, 0.8)';
      frameInStep = t - 55;
    } else if (t > 25) {
      bannerText = '1';
      bannerColor = '#FB923C';
      bannerGlow = 'rgba(251, 146, 60, 0.8)';
      frameInStep = t - 25;
    } else {
      bannerText = 'START!';
      bannerColor = '#4ADE80';
      bannerGlow = 'rgba(74, 222, 128, 0.9)';
      frameInStep = t;
    }

    const popScale = 1.0 + (frameInStep / 30) * 0.35;
    const bannerW = bannerText === 'START!' ? 340 : 220;
    const bannerH = 76;
    const bannerX = COURT_WIDTH / 2 - bannerW / 2;
    const bannerY = 155;

    ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
    ctx.fillRect(bannerX, bannerY, bannerW, bannerH);

    ctx.strokeStyle = bannerColor;
    ctx.lineWidth = 3;
    ctx.strokeRect(bannerX, bannerY, bannerW, bannerH);

    ctx.font = '8px "Press Start 2P", monospace';
    ctx.fillStyle = '#CBD5E1';
    ctx.textAlign = 'center';
    ctx.fillText(bannerText === 'START!' ? '★ SERVE! ★' : 'GET READY!', COURT_WIDTH / 2, bannerY + 22);

    ctx.save();
    ctx.translate(COURT_WIDTH / 2, bannerY + 54);
    ctx.scale(popScale, popScale);

    ctx.font = bannerText === 'START!' ? '24px "Press Start 2P", monospace' : '28px "Press Start 2P", monospace';

    ctx.fillStyle = '#0F172A';
    ctx.fillText(bannerText, 3, 3);

    ctx.shadowColor = bannerGlow;
    ctx.shadowBlur = 14;

    ctx.fillStyle = bannerColor;
    ctx.fillText(bannerText, 0, 0);
    ctx.restore();

    ctx.restore();
  } else if (pointResetDelay > 0) {
    ctx.save();
    const isTagIn = !!tagInBanner;
    const boxW = isTagIn ? 420 : 260;
    const boxH = isTagIn ? 62 : 48;
    ctx.fillStyle = isTagIn
      ? 'rgba(185, 28, 28, 0.92)'
      : score.isDeuce
      ? 'rgba(220, 38, 38, 0.85)'
      : 'rgba(15, 23, 42, 0.8)';
    ctx.fillRect(COURT_WIDTH / 2 - boxW / 2, 145, boxW, boxH);
    ctx.strokeStyle = isTagIn ? '#FDE047' : '#FBBF24';
    ctx.lineWidth = 2.5;
    ctx.strokeRect(COURT_WIDTH / 2 - boxW / 2, 145, boxW, boxH);

    ctx.textAlign = 'center';
    if (isTagIn && tagInBanner) {
      ctx.font = '10px "Press Start 2P", monospace';
      ctx.fillStyle = '#FFFFFF';
      ctx.fillText('5 POINTS LOST • KO!', COURT_WIDTH / 2, 168);
      ctx.font = '11px "Press Start 2P", monospace';
      ctx.fillStyle = '#FDE047';
      ctx.fillText(tagInBanner, COURT_WIDTH / 2, 192);
    } else {
      ctx.font = '12px "Press Start 2P", monospace';
      ctx.fillStyle = '#FDE047';
      const msg = score.isDeuce ? (score.advantage ? `ADVANTAGE ${score.advantage}!` : 'DEUCE!') : 'POINT!';
      ctx.fillText(msg, COURT_WIDTH / 2, 175);
    }
    ctx.restore();
  }
}
