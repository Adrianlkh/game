import { GROUND_Y, POINTS_PER_CHARACTER_3V3 } from '../constants';
import { BattleFormat, PlayerState } from '../types';

function renderSkillAndStatusHud(
  ctx: CanvasRenderingContext2D,
  p: PlayerState,
  battleFormat: BattleFormat,
  pointsLost: number
) {
  ctx.save();
  const barW = 44;
  const barH = 6;
  const barY = battleFormat === '3V3' ? -88 : -78;

  // In 3v3 mode, draw a compact 5-point health bar directly below skill bar!
  if (battleFormat === '3V3') {
    const hpRem = Math.max(0, POINTS_PER_CHARACTER_3V3 - pointsLost);
    const hpBarY = -75;
    ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
    ctx.fillRect(-barW / 2 - 1, hpBarY - 1, barW + 2, 5);
    const pipW = (barW - 2) / POINTS_PER_CHARACTER_3V3;
    for (let i = 0; i < POINTS_PER_CHARACTER_3V3; i++) {
      ctx.fillStyle = i < hpRem ? (hpRem <= 2 ? '#EF4444' : '#4ADE80') : 'rgba(51, 65, 85, 0.6)';
      ctx.fillRect(-barW / 2 + 1 + i * pipW, hpBarY, pipW - 1, 3);
    }
  }

  ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
  ctx.fillRect(-barW / 2 - 1, barY - 1, barW + 2, barH + 2);
  ctx.strokeStyle =
    p.character === 'SQUIRTLE'
      ? '#38BDF8'
      : p.character === 'SNORLAX'
      ? '#10B981'
      : p.character === 'ORBIT'
      ? '#06B6D4'
      : p.character === 'GRENINJA'
      ? '#3B82F6'
      : p.character === 'MEW'
      ? '#F472B6'
      : p.character === 'MEWTWO'
      ? '#A855F7'
      : '#FBBF24';
  ctx.lineWidth = 1;
  ctx.strokeRect(-barW / 2 - 1, barY - 1, barW + 2, barH + 2);

  if (p.character === 'SQUIRTLE') {
    const hasAirJump = p.airJumpCount < p.maxAirJumps;
    ctx.fillStyle = hasAirJump ? '#38BDF8' : 'rgba(51, 65, 85, 0.6)';
    ctx.fillRect(-barW / 2 + 1, barY + 1, barW - 2, barH - 2);
  } else {
    const segments = p.maxSkillCharges;
    const segW = (barW - 4) / segments;
    for (let s = 0; s < segments; s++) {
      if (s < p.skillCharges) {
        ctx.fillStyle =
          p.character === 'SNORLAX'
            ? '#10B981'
            : p.character === 'ORBIT'
            ? '#06B6D4'
            : p.character === 'GRENINJA'
            ? '#3B82F6'
            : p.character === 'MEW'
            ? '#F472B6'
            : p.character === 'MEWTWO'
            ? '#C084FC'
            : '#FBBF24';
        ctx.fillRect(-barW / 2 + 2 + s * segW, barY + 1, Math.max(1, segW - 1), barH - 2);
      } else {
        ctx.fillStyle = 'rgba(51, 65, 85, 0.6)';
        ctx.fillRect(-barW / 2 + 2 + s * segW, barY + 1, Math.max(1, segW - 1), barH - 2);
      }
    }
  }

  ctx.font = '6px "Press Start 2P", monospace';
  ctx.fillStyle = '#F8FAFC';
  ctx.textAlign = 'center';
  const labelName =
    p.character === 'SQUIRTLE'
      ? p.isGrounded
        ? 'DOUBLE JUMP'
        : p.airJumpCount < p.maxAirJumps
        ? 'AIR JUMP: 1'
        : 'AIR JUMP: 0'
      : p.character === 'SNORLAX'
      ? p.isResting
        ? `REST: ${(p.restTimer / 60).toFixed(1)}s`
        : p.isAwakenedUltra
        ? 'ULTRA AWAKE!'
        : `REST: ${p.skillCharges}/10`
      : p.character === 'GRENINJA'
      ? `SHURIKEN: ${p.skillCharges}/20`
      : p.character === 'ORBIT'
      ? `HACK: ${p.skillCharges}/5`
      : p.character === 'PIKACHU'
      ? `THUNDER: ${p.skillCharges}/5`
      : p.character === 'MEWTWO'
      ? `WARP: ${p.skillCharges}/5`
      : p.character === 'MEW'
      ? `BLINK: ${p.skillCharges}/5`
      : 'READY';
  ctx.fillText(labelName, 0, barY - 4);
  ctx.restore();

  // Stun stars
  if (p.stunTimer > 0) {
    ctx.save();
    const starAngle = Date.now() * 0.015;
    ctx.font = '10px monospace';
    ctx.fillStyle = '#FDE047';
    ctx.fillText('⚡', Math.cos(starAngle) * 16, -65 + Math.sin(starAngle) * 5);
    ctx.fillText('⚡', Math.cos(starAngle + Math.PI) * 16, -65 + Math.sin(starAngle + Math.PI) * 5);

    ctx.strokeStyle = '#FDE047';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(0, -65, 12, 0, Math.PI * 2 * (p.stunTimer / 120));
    ctx.stroke();
    ctx.restore();
  }

  if (p.isAbilityDisabledForPoint) {
    ctx.save();
    ctx.strokeStyle = '#EF4444';
    ctx.lineWidth = 2;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.arc(0, -32, 36, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.font = '7px "Press Start 2P", monospace';
    ctx.fillStyle = '#EF4444';
    ctx.textAlign = 'center';
    ctx.fillText('HACKED!', 0, -100);
    ctx.restore();
  }
}

function drawSnorlax(ctx: CanvasRenderingContext2D, p: PlayerState) {
  ctx.translate(0, -32);

  if (p.isAwakenedUltra) {
    ctx.save();
    const ultraPulse = Math.sin(Date.now() * 0.018) * 6;
    ctx.strokeStyle = '#10B981';
    ctx.lineWidth = 3.5;
    ctx.beginPath();
    ctx.arc(0, -4, 38 + ultraPulse, 0, Math.PI * 2);
    ctx.stroke();

    ctx.strokeStyle = '#FDE047';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(0, -4, 43 + ultraPulse, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }

  const snorlaxTeal = '#064E3B';
  const snorlaxHighlight = '#047857';
  const creamBelly = '#FEF3C7';
  const clawWhite = '#FFFFFF';

  ctx.fillStyle = snorlaxTeal;
  ctx.beginPath();
  ctx.moveTo(-12, -26);
  ctx.lineTo(-18, -42);
  ctx.lineTo(-4, -32);
  ctx.closePath();
  ctx.fill();

  ctx.beginPath();
  ctx.moveTo(4, -32);
  ctx.lineTo(18, -42);
  ctx.lineTo(12, -26);
  ctx.closePath();
  ctx.fill();

  const bodyGrad = ctx.createRadialGradient(-4, -6, 6, 0, 0, 34);
  bodyGrad.addColorStop(0, snorlaxHighlight);
  bodyGrad.addColorStop(0.65, snorlaxTeal);
  bodyGrad.addColorStop(1, '#022C22');
  ctx.fillStyle = bodyGrad;

  ctx.beginPath();
  ctx.moveTo(-22, 22);
  ctx.bezierCurveTo(8, 28, 26, 22, 22, 4);
  ctx.bezierCurveTo(24, -8, 22, -26, 14, -30);
  ctx.bezierCurveTo(4, -34, -4, -34, -14, -30);
  ctx.bezierCurveTo(-22, -26, -24, -8, -22, 4);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = creamBelly;
  ctx.beginPath();
  ctx.ellipse(0, 8, 17, 18, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.beginPath();
  ctx.ellipse(0, -18, 12, 10, 0, 0, Math.PI * 2);
  ctx.fill();

  if (p.isResting) {
    ctx.strokeStyle = '#0F172A';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-8, -18); ctx.lineTo(-2, -18);
    ctx.moveTo(2, -18); ctx.lineTo(8, -18);
    ctx.stroke();

    ctx.fillStyle = '#991B1B';
    ctx.beginPath();
    ctx.arc(0, -12, 3.5, 0, Math.PI);
    ctx.fill();
  } else if (p.isAwakenedUltra) {
    ctx.fillStyle = '#FDE047';
    ctx.beginPath();
    ctx.ellipse(-5, -18, 4, 3, 0.2, 0, Math.PI * 2);
    ctx.ellipse(5, -18, 4, 3, -0.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#0F172A';
    ctx.beginPath();
    ctx.arc(-5, -18, 1.6, 0, Math.PI * 2);
    ctx.arc(5, -18, 1.6, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#991B1B';
    ctx.beginPath();
    ctx.arc(0, -12, 5, 0, Math.PI);
    ctx.fill();
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.moveTo(-4, -12); ctx.lineTo(-2, -9); ctx.lineTo(0, -12);
    ctx.moveTo(0, -12); ctx.lineTo(2, -9); ctx.lineTo(4, -12);
    ctx.fill();
  } else {
    ctx.strokeStyle = '#0F172A';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-8, -18); ctx.lineTo(-2, -18);
    ctx.moveTo(2, -18); ctx.lineTo(8, -18);
    ctx.stroke();

    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.moveTo(-4, -14); ctx.lineTo(-2, -10); ctx.lineTo(0, -14);
    ctx.moveTo(0, -14); ctx.lineTo(2, -10); ctx.lineTo(4, -14);
    ctx.fill();
  }

  ctx.fillStyle = creamBelly;
  ctx.beginPath(); ctx.ellipse(-11, 26, 9, 5, 0.1, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(11, 26, 9, 5, -0.1, 0, Math.PI * 2); ctx.fill();

  ctx.fillStyle = '#92400E';
  ctx.beginPath(); ctx.ellipse(-11, 26, 5, 2.8, 0, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(11, 26, 5, 2.8, 0, 0, Math.PI * 2); ctx.fill();

  ctx.fillStyle = clawWhite;
  ctx.beginPath();
  ctx.arc(-18, 27, 1.8, 0, Math.PI * 2);
  ctx.arc(18, 27, 1.8, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = snorlaxTeal;
  if (p.isJumping || p.isSpiking) {
    ctx.beginPath(); ctx.ellipse(18, -16, 8, 6, -0.4, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = clawWhite;
    ctx.beginPath(); ctx.arc(24, -18, 2, 0, Math.PI * 2); ctx.fill();
  } else {
    ctx.beginPath(); ctx.ellipse(14, 4, 7.5, 6, 0.2, 0, Math.PI * 2); ctx.fill();
  }
}

function drawOrbit(ctx: CanvasRenderingContext2D, p: PlayerState) {
  ctx.translate(0, -32);

  const spaceNavy = '#1E3A8A';
  const navyDark = '#172554';
  const alienTeal = '#06B6D4';
  const tealHighlight = '#67E8F9';
  const visorDark = '#0F172A';

  ctx.fillStyle = alienTeal;
  ctx.beginPath();
  ctx.moveTo(-10, 16);
  ctx.quadraticCurveTo(-22, 22, -18, 12);
  ctx.quadraticCurveTo(-14, 10, -8, 12);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = navyDark;
  ctx.lineWidth = 1.6;
  ctx.stroke();

  const drawAntenna = (baseX: number, stemEndX: number) => {
    ctx.save();
    ctx.strokeStyle = navyDark;
    ctx.lineWidth = 2.6;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(baseX, -24);
    ctx.lineTo(stemEndX, -38);
    ctx.stroke();

    ctx.fillStyle = alienTeal;
    ctx.beginPath();
    ctx.arc(stemEndX, -38, 4.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = navyDark;
    ctx.lineWidth = 1.8;
    ctx.stroke();

    ctx.strokeStyle = '#67E8F9';
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.arc(stemEndX, -38, 7, -Math.PI * 0.85, -Math.PI * 0.15);
    ctx.stroke();
    ctx.restore();
  };
  drawAntenna(-6, -12);
  drawAntenna(8, 14);

  const headGrad = ctx.createRadialGradient(-2, -16, 3, 0, -14, 18);
  headGrad.addColorStop(0, tealHighlight);
  headGrad.addColorStop(0.65, alienTeal);
  headGrad.addColorStop(1, '#0891B2');
  ctx.fillStyle = headGrad;
  ctx.beginPath();
  ctx.arc(0, -13, 17, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = navyDark;
  ctx.lineWidth = 2.2;
  ctx.stroke();

  const hoodieGrad = ctx.createLinearGradient(0, -2, 0, 24);
  hoodieGrad.addColorStop(0, '#2563EB');
  hoodieGrad.addColorStop(0.55, spaceNavy);
  hoodieGrad.addColorStop(1, navyDark);
  ctx.fillStyle = hoodieGrad;

  ctx.beginPath();
  ctx.moveTo(-15, 23);
  ctx.bezierCurveTo(7, 27, 22, 21, 18, 7);
  ctx.bezierCurveTo(20, -1, 18, -6, 11, -8);
  ctx.bezierCurveTo(4, -10, -5, -10, -11, -6);
  ctx.bezierCurveTo(-17, 0, -20, 11, -15, 23);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = navyDark;
  ctx.lineWidth = 2.2;
  ctx.stroke();

  ctx.strokeStyle = '#06B6D4';
  ctx.lineWidth = 1.8;
  ctx.beginPath();
  ctx.moveTo(0, -2); ctx.lineTo(0, 23);
  ctx.stroke();
  ctx.fillStyle = '#FBBF24';
  ctx.fillRect(-2, 2, 4, 4);

  ctx.font = 'bold 8px "Outfit", sans-serif';
  ctx.fillStyle = '#67E8F9';
  ctx.textAlign = 'center';
  ctx.fillText('CS', 8, 8);

  ctx.fillStyle = visorDark;
  ctx.beginPath();
  ctx.roundRect(-14, -19, 28, 12, 6);
  ctx.fill();
  ctx.strokeStyle = navyDark;
  ctx.lineWidth = 2;
  ctx.stroke();

  if (p.isBlinking) {
    ctx.strokeStyle = '#38BDF8';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-8, -13); ctx.lineTo(-2, -13);
    ctx.moveTo(2, -13); ctx.lineTo(8, -13);
    ctx.stroke();
  } else {
    ctx.strokeStyle = '#38BDF8';
    ctx.lineWidth = 2.2;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(-8, -11); ctx.lineTo(-5, -15); ctx.lineTo(-2, -11);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(2, -11); ctx.lineTo(5, -15); ctx.lineTo(8, -11);
    ctx.stroke();
  }

  ctx.fillStyle = '#F43F5E';
  ctx.beginPath();
  ctx.arc(0, -3.5, 4.5, 0, Math.PI);
  ctx.fill();
  ctx.strokeStyle = navyDark;
  ctx.lineWidth = 1.4;
  ctx.stroke();

  ctx.fillStyle = alienTeal;
  ctx.beginPath(); ctx.ellipse(-6, 26, 6, 4.2, 0.1, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = navyDark; ctx.lineWidth = 1.8; ctx.stroke();
  ctx.beginPath(); ctx.ellipse(6, 27, 7, 4.6, -0.1, 0, Math.PI * 2); ctx.fill();
  ctx.stroke();

  ctx.save();
  ctx.translate(-13, 8);
  ctx.rotate(0.18);
  ctx.fillStyle = '#334155';
  ctx.fillRect(-6, -8, 13, 17);
  ctx.strokeStyle = '#64748B';
  ctx.lineWidth = 1.4;
  ctx.strokeRect(-6, -8, 13, 17);
  ctx.fillStyle = '#06B6D4';
  ctx.fillRect(-4, -6, 9, 13);
  ctx.restore();

  ctx.fillStyle = alienTeal;
  if (p.isJumping || p.isSpiking) {
    ctx.beginPath();
    ctx.ellipse(17, -17, 7, 5, -0.4, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = navyDark;
    ctx.lineWidth = 1.6;
    ctx.stroke();
    ctx.fillStyle = '#06B6D4';
    ctx.beginPath();
    ctx.arc(23, -19, 4, 0, Math.PI * 2);
    ctx.fill();
  } else {
    ctx.beginPath();
    ctx.ellipse(13, 5, 6, 4.5, 0.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = navyDark;
    ctx.lineWidth = 1.6;
    ctx.stroke();
  }
}

function drawGreninja(ctx: CanvasRenderingContext2D, p: PlayerState) {
  ctx.translate(0, -34);

  const frogBlue = '#1D4ED8';
  const frogDark = '#1E3A8A';
  const tonguePink = '#F43F5E';
  const tongueShadow = '#BE123C';
  const creamBelly = '#FEF08A';

  ctx.save();
  ctx.strokeStyle = tonguePink;
  ctx.lineWidth = 5.5;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(-6, -10);
  ctx.bezierCurveTo(-18, -14, -28, -4, -26, 8);
  ctx.bezierCurveTo(-24, 18, -16, 22, -18, 30);
  ctx.stroke();

  ctx.fillStyle = tonguePink;
  ctx.beginPath();
  ctx.ellipse(0, -6, 14, 6.5, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = tongueShadow;
  ctx.lineWidth = 1.4;
  ctx.stroke();
  ctx.restore();

  ctx.fillStyle = frogBlue;
  ctx.beginPath();
  ctx.moveTo(-4, -14);
  ctx.lineTo(-14, -34);
  ctx.lineTo(-2, -24);
  ctx.lineTo(6, -34);
  ctx.lineTo(12, -14);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = frogDark;
  ctx.lineWidth = 2;
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(0, -14, 14, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#FFFFFF';
  ctx.beginPath();
  ctx.ellipse(5, -16, 4.5, 3.2, 0.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#FDE047';
  ctx.beginPath();
  ctx.ellipse(6, -16, 2.8, 2.2, 0.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#0F172A';
  ctx.beginPath();
  ctx.ellipse(6.5, -16, 1.2, 2, 0.2, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = frogBlue;
  ctx.beginPath();
  ctx.moveTo(-12, 22);
  ctx.bezierCurveTo(4, 25, 18, 19, 14, 4);
  ctx.bezierCurveTo(16, -4, 14, -8, 6, -8);
  ctx.bezierCurveTo(-4, -8, -12, -4, -14, 6);
  ctx.bezierCurveTo(-18, 12, -18, 18, -12, 22);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = frogDark;
  ctx.lineWidth = 2;
  ctx.stroke();

  ctx.fillStyle = creamBelly;
  ctx.beginPath();
  ctx.ellipse(3, 8, 8, 12, 0.1, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#FFFFFF';
  ctx.beginPath();
  ctx.arc(-8, 14, 3.5, 0, Math.PI * 2);
  ctx.arc(10, 15, 3.5, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = frogBlue;
  ctx.beginPath(); ctx.ellipse(-8, 27, 7, 4.2, 0.2, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(8, 28, 8, 4.8, -0.2, 0, Math.PI * 2); ctx.fill();

  if (p.isJumping || p.isSpiking) {
    ctx.beginPath(); ctx.ellipse(16, -18, 7, 4.5, -0.5, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#38BDF8';
    ctx.beginPath();
    ctx.arc(22, -22, 5, 0, Math.PI * 2);
    ctx.fill();
  } else {
    ctx.beginPath(); ctx.ellipse(12, 5, 6, 4, 0.2, 0, Math.PI * 2); ctx.fill();
  }
}

function drawMew(ctx: CanvasRenderingContext2D, p: PlayerState) {
  const mewHover = Math.sin(Date.now() * 0.008) * 5;
  ctx.translate(0, -30 + mewHover);

  const auraRad = 26 + Math.sin(Date.now() * 0.015) * 4;
  const mewAura = ctx.createRadialGradient(0, 0, 6, 0, 0, auraRad);
  mewAura.addColorStop(0, 'rgba(244, 114, 182, 0.55)');
  mewAura.addColorStop(0.65, 'rgba(251, 207, 232, 0.25)');
  mewAura.addColorStop(1, 'rgba(253, 242, 248, 0)');
  ctx.fillStyle = mewAura;
  ctx.beginPath();
  ctx.arc(0, 0, auraRad, 0, Math.PI * 2);
  ctx.fill();

  if (p.mewFlashTimer > 0) {
    ctx.fillStyle = `rgba(255, 255, 255, ${p.mewFlashTimer / 16})`;
    ctx.beginPath();
    ctx.arc(0, 0, 36, 0, Math.PI * 2);
    ctx.fill();
  }

  const pinkBase = '#F472B6';
  const pinkHighlight = '#FDF2F8';
  const pinkShadow = '#DB2777';

  ctx.save();
  ctx.translate(-8, 10);
  ctx.rotate(p.tailSway * 1.5);
  ctx.strokeStyle = pinkShadow;
  ctx.lineWidth = 2.4;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.bezierCurveTo(-14, 2, -26, -10, -22, -26);
  ctx.bezierCurveTo(-18, -38, -6, -34, -4, -24);
  ctx.bezierCurveTo(-2, -14, -10, -10, -14, -16);
  ctx.stroke();

  ctx.fillStyle = pinkBase;
  ctx.beginPath();
  ctx.ellipse(-14, -18, 6.5, 4.5, -0.3, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = pinkShadow;
  ctx.lineWidth = 1.2;
  ctx.stroke();
  ctx.restore();

  const bodyGrad = ctx.createRadialGradient(-3, -2, 2, 0, 2, 20);
  bodyGrad.addColorStop(0, pinkHighlight);
  bodyGrad.addColorStop(0.55, pinkBase);
  bodyGrad.addColorStop(1, pinkShadow);
  ctx.fillStyle = bodyGrad;

  ctx.beginPath();
  ctx.moveTo(-8, 16);
  ctx.bezierCurveTo(4, 20, 16, 14, 12, 0);
  ctx.bezierCurveTo(14, -8, 16, -16, 8, -22);
  ctx.bezierCurveTo(2, -26, -6, -24, -10, -14);
  ctx.bezierCurveTo(-14, -2, -14, 6, -8, 16);
  ctx.closePath();
  ctx.fill();

  const headGrad = ctx.createRadialGradient(2, -18, 2, 2, -16, 15);
  headGrad.addColorStop(0, pinkHighlight);
  headGrad.addColorStop(0.65, pinkBase);
  headGrad.addColorStop(1, pinkShadow);
  ctx.fillStyle = headGrad;
  ctx.beginPath();
  ctx.arc(2, -16, 14, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = pinkBase;
  ctx.beginPath();
  ctx.moveTo(-4, -25); ctx.lineTo(-10, -36); ctx.lineTo(2, -29); ctx.closePath(); ctx.fill();
  ctx.beginPath();
  ctx.moveTo(6, -26); ctx.lineTo(13, -37); ctx.lineTo(12, -25); ctx.closePath(); ctx.fill();

  if (p.isBlinking) {
    ctx.strokeStyle = '#0F172A';
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    ctx.arc(6, -16, 4, 0.2, Math.PI - 0.2);
    ctx.stroke();
  } else {
    ctx.fillStyle = '#0284C7';
    ctx.beginPath();
    ctx.ellipse(6.5, -16, 4.5, 6.2, 0.15, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#38BDF8';
    ctx.beginPath();
    ctx.ellipse(7, -16, 3.2, 4.8, 0.15, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.arc(8, -18, 1.8, 0, Math.PI * 2);
    ctx.arc(5.5, -14.5, 1.0, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.strokeStyle = '#831843';
  ctx.lineWidth = 1.3;
  ctx.beginPath();
  ctx.arc(9, -12, 2.4, 0.1, Math.PI * 0.9);
  ctx.stroke();

  ctx.fillStyle = pinkBase;
  ctx.beginPath(); ctx.ellipse(-4, 22, 6.5, 3.8, 0.1, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(8, 23, 7.5, 4.2, -0.15, 0, Math.PI * 2); ctx.fill();

  ctx.fillStyle = pinkBase;
  if (p.isJumping || p.isSpiking) {
    ctx.beginPath(); ctx.ellipse(14, -20, 5, 3.5, -0.4, 0, Math.PI * 2); ctx.fill();
  } else {
    ctx.beginPath(); ctx.ellipse(7, -3, 4.5, 3.2, 0.2, 0, Math.PI * 2); ctx.fill();
  }
}

function drawPikachu(ctx: CanvasRenderingContext2D, p: PlayerState) {
  const isClassic = p.colorTheme === 'classic';
  const primaryYellow = isClassic ? '#FDCB02' : '#F59E0B';
  const highlightYellow = isClassic ? '#FEF08A' : '#FDE68A';
  const shadowAmber = isClassic ? '#D97706' : '#92400E';
  const darkBrown = '#78350F';
  const cheekRed = '#EF4444';

  ctx.translate(0, -32);
  ctx.save();
  ctx.translate(-16, 12); ctx.rotate(p.tailSway - (p.isJumping ? 0.35 : 0.05));
  ctx.fillStyle = darkBrown; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(-8, -4); ctx.lineTo(-4, -10); ctx.lineTo(4, -6); ctx.closePath(); ctx.fill();
  ctx.fillStyle = primaryYellow;
  ctx.beginPath(); ctx.moveTo(-6, -7); ctx.lineTo(-14, -13); ctx.lineTo(-8, -17); ctx.lineTo(-24, -27); ctx.lineTo(-18, -31); ctx.lineTo(-38, -45); ctx.lineTo(-28, -52); ctx.lineTo(-6, -34); ctx.lineTo(-12, -28); ctx.lineTo(2, -18); ctx.closePath(); ctx.fill();
  ctx.strokeStyle = shadowAmber; ctx.lineWidth = 1.4; ctx.stroke();
  ctx.restore();

  ctx.fillStyle = shadowAmber; ctx.beginPath(); ctx.ellipse(-14, 28, 8, 4.5, 0.2, 0, Math.PI * 2); ctx.fill();

  const bodyGrad = ctx.createRadialGradient(-4, 0, 6, 0, 6, 32);
  bodyGrad.addColorStop(0, highlightYellow); bodyGrad.addColorStop(0.55, primaryYellow); bodyGrad.addColorStop(1, shadowAmber);
  ctx.fillStyle = bodyGrad;
  ctx.beginPath();
  ctx.moveTo(-16, 24); ctx.bezierCurveTo(8, 28, 26, 20, 22, 6); ctx.bezierCurveTo(24, 0, 26, -14, 18, -24);
  ctx.bezierCurveTo(8, -34, -12, -34, -18, -20); ctx.bezierCurveTo(-26, -8, -26, 12, -16, 24);
  ctx.closePath(); ctx.fill();

  ctx.fillStyle = darkBrown;
  ctx.beginPath(); ctx.moveTo(-20, -10); ctx.quadraticCurveTo(-14, -11, -8, -8); ctx.quadraticCurveTo(-14, -6, -21, -5); ctx.closePath(); ctx.fill();
  ctx.beginPath(); ctx.moveTo(-21, 2); ctx.quadraticCurveTo(-14, 1, -7, 4); ctx.quadraticCurveTo(-14, 7, -20, 8); ctx.closePath(); ctx.fill();

  ctx.fillStyle = primaryYellow; ctx.beginPath(); ctx.ellipse(8, 30, 9, 5, -0.15, 0, Math.PI * 2); ctx.fill();

  ctx.save();
  ctx.translate(-10, -26); ctx.rotate(p.earAngleLeft);
  const earGradL = ctx.createLinearGradient(0, 0, -10, -32);
  earGradL.addColorStop(0, primaryYellow); earGradL.addColorStop(0.7, '#0F172A');
  ctx.fillStyle = earGradL;
  ctx.beginPath(); ctx.moveTo(-5, 0); ctx.quadraticCurveTo(-14, -18, -9, -38); ctx.quadraticCurveTo(0, -22, 5, 0); ctx.closePath(); ctx.fill();
  ctx.restore();

  ctx.save();
  ctx.translate(8, -25); ctx.rotate(p.earAngleRight);
  const earGradR = ctx.createLinearGradient(0, 0, 10, -32);
  earGradR.addColorStop(0, primaryYellow); earGradR.addColorStop(0.7, '#0F172A');
  ctx.fillStyle = earGradR;
  ctx.beginPath(); ctx.moveTo(-4, 0); ctx.quadraticCurveTo(2, -20, 12, -38); ctx.quadraticCurveTo(16, -18, 5, 0); ctx.closePath(); ctx.fill();
  ctx.restore();

  if (isClassic) {
    ctx.fillStyle = '#DC2626'; ctx.beginPath(); ctx.ellipse(1, -26, 17, 7, 0.05, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#EF4444'; ctx.beginPath(); ctx.arc(0, -28, 13, Math.PI, 0); ctx.fill();
    ctx.fillStyle = '#B91C1C'; ctx.beginPath(); ctx.ellipse(13, -25, 10, 4, 0.2, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#FFFFFF'; ctx.beginPath(); ctx.arc(3, -29, 3.2, 0, Math.PI * 2); ctx.fill();
  }

  ctx.fillStyle = cheekRed; ctx.beginPath(); ctx.arc(14, -1, 6.5, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#FCA5A5'; ctx.beginPath(); ctx.arc(12.5, -2.5, 2, 0, Math.PI * 2); ctx.fill();

  if (p.isBlinking) {
    ctx.strokeStyle = '#0F172A'; ctx.lineWidth = 2.2; ctx.beginPath(); ctx.arc(7, -8, 4.5, 0.2, Math.PI - 0.2); ctx.stroke();
  } else {
    ctx.fillStyle = '#0F172A'; ctx.beginPath(); ctx.arc(7.5, -8, 4.8, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#FFFFFF'; ctx.beginPath(); ctx.arc(9, -9.5, 1.9, 0, Math.PI * 2); ctx.fill();
  }

  ctx.fillStyle = '#0F172A'; ctx.beginPath(); ctx.ellipse(14.5, -5.5, 1.2, 0.9, 0, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = '#0F172A'; ctx.lineWidth = 1.6;
  ctx.beginPath(); ctx.arc(11.5, -2.5, 2.5, 0.1, Math.PI * 0.85); ctx.stroke();
  ctx.beginPath(); ctx.arc(15, -2.5, 2.2, 0.1, Math.PI * 0.85); ctx.stroke();

  ctx.fillStyle = primaryYellow;
  if (p.isJumping) {
    ctx.beginPath(); ctx.ellipse(17, -12, 6, 4.5, -0.4, 0, Math.PI * 2); ctx.fill();
  } else {
    ctx.beginPath(); ctx.ellipse(8, 12, 6.5, 4.5, 0.2, 0, Math.PI * 2); ctx.fill();
  }
}

function drawMewtwo(ctx: CanvasRenderingContext2D, p: PlayerState) {
  const hoverFloatY = Math.sin(Date.now() * 0.006) * 4;
  ctx.translate(0, -38 + hoverFloatY);

  const auraRad = 34 + Math.sin(Date.now() * 0.01) * 3;
  const psychicAura = ctx.createRadialGradient(0, 0, 10, 0, 0, auraRad);
  psychicAura.addColorStop(0, 'rgba(192, 132, 252, 0.45)');
  psychicAura.addColorStop(0.7, 'rgba(147, 51, 234, 0.25)');
  psychicAura.addColorStop(1, 'rgba(124, 58, 237, 0)');
  ctx.fillStyle = psychicAura;
  ctx.beginPath(); ctx.arc(0, 0, auraRad, 0, Math.PI * 2); ctx.fill();

  const bodySilver = '#E2E8F0';
  const bodyHighlight = '#F8FAFC';
  const bodyShadow = '#94A3B8';
  const purpleTail = '#7C3AED';
  const purpleHighlight = '#A855F7';
  const purpleDark = '#5B21B6';

  ctx.save();
  ctx.translate(-10, 12); ctx.rotate(p.tailSway);
  const tailGrad = ctx.createRadialGradient(-4, 0, 2, 0, 0, 28);
  tailGrad.addColorStop(0, purpleHighlight); tailGrad.addColorStop(0.65, purpleTail); tailGrad.addColorStop(1, purpleDark);
  ctx.fillStyle = tailGrad;
  ctx.beginPath();
  ctx.moveTo(0, -4);
  ctx.bezierCurveTo(-18, 4, -34, -4, -32, -22);
  ctx.bezierCurveTo(-30, -38, -14, -38, -10, -26);
  ctx.bezierCurveTo(-8, -16, -18, -14, -22, -22);
  ctx.bezierCurveTo(-24, -26, -20, -28, -16, -26);
  ctx.bezierCurveTo(-16, -16, -2, -6, 2, -10);
  ctx.closePath(); ctx.fill();
  ctx.strokeStyle = purpleDark; ctx.lineWidth = 1.4; ctx.stroke();
  ctx.restore();

  const underbellyGrad = ctx.createLinearGradient(0, 0, 0, 32);
  underbellyGrad.addColorStop(0, purpleHighlight); underbellyGrad.addColorStop(0.7, purpleTail); underbellyGrad.addColorStop(1, purpleDark);
  ctx.fillStyle = underbellyGrad;
  ctx.beginPath(); ctx.ellipse(3, 15, 12, 17, 0.1, 0, Math.PI * 2); ctx.fill();

  const torsoGrad = ctx.createRadialGradient(-4, -6, 2, 0, 0, 26);
  torsoGrad.addColorStop(0, bodyHighlight); torsoGrad.addColorStop(0.6, bodySilver); torsoGrad.addColorStop(1, bodyShadow);
  ctx.fillStyle = torsoGrad;
  ctx.beginPath();
  ctx.moveTo(-10, 18);
  ctx.bezierCurveTo(4, 22, 18, 16, 14, 2);
  ctx.bezierCurveTo(16, -10, 18, -22, 10, -28);
  ctx.bezierCurveTo(2, -34, -10, -32, -14, -18);
  ctx.bezierCurveTo(-18, -4, -18, 8, -10, 18);
  ctx.closePath(); ctx.fill();

  ctx.strokeStyle = purpleTail; ctx.lineWidth = 3.5; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(-6, -26); ctx.quadraticCurveTo(-18, -22, -10, -8); ctx.stroke();

  const headGrad = ctx.createRadialGradient(2, -22, 2, 4, -18, 18);
  headGrad.addColorStop(0, bodyHighlight); headGrad.addColorStop(0.6, bodySilver); headGrad.addColorStop(1, bodyShadow);
  ctx.fillStyle = headGrad;
  ctx.beginPath(); ctx.ellipse(4, -20, 12, 14, 0.15, 0, Math.PI * 2); ctx.fill();

  ctx.fillStyle = bodySilver;
  ctx.beginPath(); ctx.moveTo(-2, -30); ctx.lineTo(-8, -42); ctx.lineTo(1, -34); ctx.closePath(); ctx.fill();
  ctx.beginPath(); ctx.moveTo(8, -31); ctx.lineTo(15, -43); ctx.lineTo(14, -32); ctx.closePath(); ctx.fill();

  ctx.fillStyle = purpleTail;
  ctx.beginPath(); ctx.ellipse(-6, 30, 7, 4.5, 0.1, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(8, 31, 8, 5, -0.1, 0, Math.PI * 2); ctx.fill();

  if (p.isBlinking) {
    ctx.strokeStyle = '#0F172A'; ctx.lineWidth = 2.4;
    ctx.beginPath(); ctx.arc(7, -22, 4.5, 0.2, Math.PI - 0.2); ctx.stroke();
  } else {
    ctx.fillStyle = '#1E1B4B'; ctx.beginPath(); ctx.ellipse(8, -22, 4.8, 6.5, 0.2, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#C084FC'; ctx.beginPath(); ctx.ellipse(8.5, -22, 3.2, 5, 0.2, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#FFFFFF'; ctx.beginPath(); ctx.arc(9.5, -24, 1.4, 0, Math.PI * 2); ctx.fill();
  }

  ctx.strokeStyle = '#475569'; ctx.lineWidth = 1.4;
  ctx.beginPath(); ctx.moveTo(11, -14); ctx.lineTo(16, -14); ctx.stroke();

  ctx.fillStyle = bodySilver;
  if (p.isJumping || p.isSpiking) {
    ctx.beginPath(); ctx.ellipse(18, -26, 7, 5, -0.4, 0, Math.PI * 2); ctx.fill();
    const orbGrad = ctx.createRadialGradient(24, -28, 1, 24, -28, 8);
    orbGrad.addColorStop(0, '#FFFFFF'); orbGrad.addColorStop(0.4, '#C084FC'); orbGrad.addColorStop(1, 'rgba(147, 51, 234, 0)');
    ctx.fillStyle = orbGrad; ctx.beginPath(); ctx.arc(24, -28, 8, 0, Math.PI * 2); ctx.fill();
  } else {
    ctx.beginPath(); ctx.ellipse(12, 4, 7, 5, 0.2, 0, Math.PI * 2); ctx.fill();
  }
}

function drawCharizard(ctx: CanvasRenderingContext2D, p: PlayerState) {
  ctx.translate(0, -42);
  const orangeBase = '#EA580C';
  const orangeHighlight = '#FB923C';
  const orangeShadow = '#9A3412';
  const tealWing = '#0D9488';
  const tealWingHighlight = '#14B8A6';
  const bellyCream = '#FEF08A';

  ctx.save();
  ctx.translate(-8, -14); ctx.rotate(-0.2 + p.wingAngle * (p.isFlying ? 1.5 : 0.6));
  ctx.fillStyle = orangeShadow;
  ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(-24, -36); ctx.lineTo(-44, -32); ctx.lineTo(-30, -8); ctx.closePath(); ctx.fill();
  ctx.fillStyle = tealWing;
  ctx.beginPath(); ctx.moveTo(-4, -4); ctx.lineTo(-22, -32); ctx.lineTo(-40, -28); ctx.lineTo(-26, -8); ctx.closePath(); ctx.fill();
  ctx.restore();

  ctx.save();
  ctx.translate(-18, 16); ctx.rotate(p.tailSway - (p.isFlying ? 0.3 : 0.05));
  ctx.strokeStyle = orangeShadow; ctx.fillStyle = orangeBase; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(0, 0); ctx.bezierCurveTo(-18, 8, -32, -4, -38, -18); ctx.bezierCurveTo(-38, -26, -28, -26, -24, -16); ctx.bezierCurveTo(-18, -4, -6, 2, 2, -4); ctx.closePath(); ctx.fill(); ctx.stroke();

  const flameX = -36; const flameY = -22 + p.flameFlicker;
  const flameGrad = ctx.createRadialGradient(flameX, flameY, 2, flameX, flameY, 16);
  flameGrad.addColorStop(0, '#FFFFFF'); flameGrad.addColorStop(0.3, '#FDE047'); flameGrad.addColorStop(0.65, '#F97316'); flameGrad.addColorStop(1, 'rgba(239, 68, 68, 0)');
  ctx.fillStyle = flameGrad; ctx.beginPath(); ctx.arc(flameX, flameY, 14, 0, Math.PI * 2); ctx.fill();
  ctx.restore();

  const bodyGrad = ctx.createRadialGradient(-4, -6, 4, 0, 4, 38);
  bodyGrad.addColorStop(0, orangeHighlight); bodyGrad.addColorStop(0.6, orangeBase); bodyGrad.addColorStop(1, orangeShadow);
  ctx.fillStyle = bodyGrad;
  ctx.beginPath();
  ctx.moveTo(-16, 28); ctx.bezierCurveTo(8, 34, 28, 24, 22, 6); ctx.bezierCurveTo(24, -4, 26, -20, 16, -30);
  ctx.bezierCurveTo(6, -38, -10, -36, -18, -22); ctx.bezierCurveTo(-26, -8, -26, 16, -16, 28);
  ctx.closePath(); ctx.fill();

  const bellyGrad = ctx.createLinearGradient(0, -10, 0, 30);
  bellyGrad.addColorStop(0, '#FEF9C3'); bellyGrad.addColorStop(0.7, bellyCream); bellyGrad.addColorStop(1, '#FBBF24');
  ctx.fillStyle = bellyGrad; ctx.beginPath(); ctx.ellipse(8, 10, 14, 19, 0.15, 0, Math.PI * 2); ctx.fill();

  ctx.fillStyle = orangeBase;
  ctx.beginPath(); ctx.moveTo(-8, -32); ctx.quadraticCurveTo(-18, -44, -14, -50); ctx.quadraticCurveTo(-6, -42, -2, -34); ctx.closePath(); ctx.fill();
  ctx.beginPath(); ctx.moveTo(4, -34); ctx.quadraticCurveTo(8, -48, 16, -52); ctx.quadraticCurveTo(14, -40, 10, -32); ctx.closePath(); ctx.fill();

  ctx.save();
  ctx.translate(2, -12); ctx.rotate(0.1 - p.wingAngle * (p.isFlying ? 1.6 : 0.8));
  ctx.fillStyle = orangeBase; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(26, -38); ctx.lineTo(48, -34); ctx.lineTo(34, -4); ctx.closePath(); ctx.fill();
  ctx.strokeStyle = orangeShadow; ctx.lineWidth = 1.5; ctx.stroke();
  ctx.fillStyle = tealWingHighlight; ctx.beginPath(); ctx.moveTo(4, -4); ctx.lineTo(24, -34); ctx.lineTo(44, -30); ctx.lineTo(30, -6); ctx.closePath(); ctx.fill();
  ctx.restore();

  ctx.fillStyle = orangeBase;
  ctx.beginPath(); ctx.ellipse(-8, 32, 9, 5.5, 0.1, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(12, 33, 10, 6, -0.15, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#FFFFFF'; ctx.beginPath(); ctx.arc(18, 33, 1.8, 0, Math.PI * 2); ctx.fill();

  if (p.isBlinking) {
    ctx.strokeStyle = '#0F172A'; ctx.lineWidth = 2.4; ctx.beginPath(); ctx.arc(10, -22, 5, 0.2, Math.PI - 0.2); ctx.stroke();
  } else {
    ctx.fillStyle = '#0F172A'; ctx.beginPath(); ctx.ellipse(11, -22, 5, 6.5, 0.2, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#06B6D4'; ctx.beginPath(); ctx.ellipse(11.5, -22, 3.5, 5, 0.2, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#0F172A'; ctx.beginPath(); ctx.ellipse(12, -22, 1.2, 4.5, 0.2, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#FFFFFF'; ctx.beginPath(); ctx.arc(13, -24, 1.4, 0, Math.PI * 2); ctx.fill();
  }

  ctx.fillStyle = orangeBase; ctx.beginPath(); ctx.ellipse(18, -18, 8, 5, 0.1, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#991B1B'; ctx.beginPath(); ctx.arc(17, -13, 5, 0, Math.PI); ctx.fill();
  ctx.fillStyle = '#FFFFFF'; ctx.beginPath(); ctx.moveTo(14, -13); ctx.lineTo(16, -9); ctx.lineTo(18, -13); ctx.closePath(); ctx.fill();

  ctx.fillStyle = orangeBase;
  if (p.isFlying || p.isJumping) {
    ctx.beginPath(); ctx.ellipse(22, -24, 8, 5, -0.4, 0, Math.PI * 2); ctx.fill();
  } else {
    ctx.beginPath(); ctx.ellipse(15, 2, 8, 5, 0.2, 0, Math.PI * 2); ctx.fill();
  }
}

function drawSquirtle(ctx: CanvasRenderingContext2D, p: PlayerState) {
  const skinBase = '#7DD3FC';
  const skinHighlight = '#BAE6FD';
  const skinShadow = '#0284C7';
  const shellBrown = '#78350F';
  const shellCream = '#FEF08A';
  const shellRim = '#F8FAFC';

  ctx.translate(0, -32);
  ctx.save();
  ctx.translate(-16, 14); ctx.rotate(p.tailSway);
  const tailGrad = ctx.createRadialGradient(0, 0, 2, -4, -6, 18);
  tailGrad.addColorStop(0, skinHighlight); tailGrad.addColorStop(0.6, skinBase); tailGrad.addColorStop(1, skinShadow);
  ctx.fillStyle = tailGrad;
  ctx.beginPath();
  ctx.moveTo(0, 0); ctx.bezierCurveTo(-14, 4, -26, -6, -22, -18); ctx.bezierCurveTo(-18, -28, -6, -26, -4, -18);
  ctx.bezierCurveTo(-2, -10, -12, -8, -12, -14); ctx.bezierCurveTo(-12, -18, -16, -18, -16, -14); ctx.bezierCurveTo(-16, -4, -4, 4, 2, -2);
  ctx.closePath(); ctx.fill();
  ctx.strokeStyle = skinShadow; ctx.lineWidth = 1.3; ctx.stroke();
  ctx.restore();

  ctx.save();
  ctx.fillStyle = shellBrown; ctx.beginPath(); ctx.ellipse(-8, 4, 18, 22, -0.2, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = shellRim; ctx.lineWidth = 3.5; ctx.stroke();
  ctx.restore();

  const headGrad = ctx.createRadialGradient(2, -18, 4, 4, -14, 22);
  headGrad.addColorStop(0, skinHighlight); headGrad.addColorStop(0.65, skinBase); headGrad.addColorStop(1, skinShadow);
  ctx.fillStyle = headGrad; ctx.beginPath(); ctx.arc(3, -16, 19, 0, Math.PI * 2); ctx.fill();

  const plastronGrad = ctx.createLinearGradient(0, -6, 0, 24);
  plastronGrad.addColorStop(0, '#FEF9C3'); plastronGrad.addColorStop(0.7, shellCream); plastronGrad.addColorStop(1, '#FDE047');
  ctx.fillStyle = plastronGrad; ctx.beginPath(); ctx.ellipse(6, 8, 14, 18, 0.15, 0, Math.PI * 2); ctx.fill();

  ctx.strokeStyle = '#B45309'; ctx.lineWidth = 1.4;
  ctx.beginPath(); ctx.moveTo(6, -8); ctx.lineTo(6, 24); ctx.moveTo(-4, 0); ctx.lineTo(16, 2); ctx.moveTo(-6, 12); ctx.lineTo(14, 14); ctx.stroke();
  ctx.strokeStyle = shellRim; ctx.lineWidth = 2.2; ctx.beginPath(); ctx.ellipse(6, 8, 14.5, 18.5, 0.15, 0, Math.PI * 2); ctx.stroke();

  ctx.fillStyle = skinBase;
  ctx.beginPath(); ctx.ellipse(-6, 28, 8, 5, 0.1, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(10, 29, 9, 5.5, -0.15, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#FFFFFF'; ctx.beginPath(); ctx.arc(16, 29, 1.4, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(18, 30.5, 1.4, 0, Math.PI * 2); ctx.fill();

  if (p.isBlinking) {
    ctx.strokeStyle = '#0F172A'; ctx.lineWidth = 2.4; ctx.beginPath(); ctx.arc(9, -17, 5, 0.2, Math.PI - 0.2); ctx.stroke();
  } else {
    ctx.fillStyle = '#7F1D1D'; ctx.beginPath(); ctx.ellipse(9, -17, 5.2, 7.5, 0.1, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#1E1B4B'; ctx.beginPath(); ctx.ellipse(9.5, -17, 3.4, 5.5, 0.1, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#FFFFFF'; ctx.beginPath(); ctx.ellipse(10.5, -19.5, 2.2, 3, 0, 0, Math.PI * 2); ctx.fill();
  }

  ctx.fillStyle = skinShadow; ctx.beginPath(); ctx.arc(19, -15, 1.1, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = '#0F172A'; ctx.lineWidth = 1.6; ctx.beginPath(); ctx.arc(15, -12, 4.5, 0.2, Math.PI * 0.85); ctx.stroke();

  ctx.fillStyle = skinBase;
  if (p.isJumping || p.isSpiking) {
    ctx.beginPath(); ctx.ellipse(20, -18, 7.5, 5.5, -0.5, 0, Math.PI * 2); ctx.fill();
  } else {
    ctx.beginPath(); ctx.ellipse(14, 2, 7.5, 5, 0.2, 0, Math.PI * 2); ctx.fill();
  }
}

export function renderCharacter(
  ctx: CanvasRenderingContext2D,
  p: PlayerState,
  battleFormat: BattleFormat,
  pointsLost: number
) {
  ctx.save();
  ctx.translate(p.x, p.y);

  // Ground contact shadow
  ctx.save();
  const distFromGround = Math.max(0, GROUND_Y - p.y);
  const shadowScale = Math.max(0.18, 1 - distFromGround / 160);
  ctx.fillStyle = 'rgba(15, 23, 42, 0.28)';
  ctx.beginPath();
  const shadowW =
    p.character === 'CHARIZARD'
      ? 34
      : p.character === 'SNORLAX'
      ? 36
      : p.character === 'ORBIT'
      ? 28
      : p.character === 'MEW'
      ? 20
      : 26;
  ctx.ellipse(0, 2, shadowW * shadowScale, 8 * shadowScale, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  renderSkillAndStatusHud(ctx, p, battleFormat, pointsLost);

  if (p.facing === 'left') {
    ctx.scale(-1, 1);
  }
  ctx.scale(p.squashX, p.squashY);

  switch (p.character) {
    case 'SNORLAX':
      drawSnorlax(ctx, p);
      break;
    case 'ORBIT':
      drawOrbit(ctx, p);
      break;
    case 'GRENINJA':
      drawGreninja(ctx, p);
      break;
    case 'MEW':
      drawMew(ctx, p);
      break;
    case 'PIKACHU':
      drawPikachu(ctx, p);
      break;
    case 'MEWTWO':
      drawMewtwo(ctx, p);
      break;
    case 'CHARIZARD':
      drawCharizard(ctx, p);
      break;
    case 'SQUIRTLE':
      drawSquirtle(ctx, p);
      break;
  }

  ctx.restore();
}
