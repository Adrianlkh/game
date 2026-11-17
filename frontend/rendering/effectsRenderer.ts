import { BallState, Particle, Projectile, ThunderVisual } from '../types';
import { COURT_HEIGHT, COURT_WIDTH, GROUND_Y } from '../constants';

export function renderThunderStrikes(
  ctx: CanvasRenderingContext2D,
  strikes: ThunderVisual[]
) {
  strikes.forEach((th) => {
    ctx.save();
    const flashAlpha = Math.min(1, th.timer / 8);

    ctx.fillStyle = `rgba(254, 240, 138, ${flashAlpha * 0.25})`;
    ctx.fillRect(0, 0, COURT_WIDTH, COURT_HEIGHT);

    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 5;
    ctx.beginPath();
    let currY = 0;
    let currX = th.targetX;
    ctx.moveTo(currX, currY);

    while (currY < th.targetY) {
      currY += 28 + Math.random() * 20;
      currX = th.targetX + (Math.random() - 0.5) * 32;
      ctx.lineTo(currX, Math.min(th.targetY, currY));
    }
    ctx.stroke();

    ctx.strokeStyle = `rgba(253, 224, 71, ${flashAlpha})`;
    ctx.lineWidth = 12;
    ctx.stroke();
    ctx.strokeStyle = `rgba(0, 240, 255, ${flashAlpha * 0.7})`;
    ctx.lineWidth = 20;
    ctx.stroke();

    ctx.strokeStyle = '#00F0FF';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.ellipse(th.targetX, th.targetY, (16 - th.timer) * 4, 8, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  });
}

export function renderProjectiles(
  ctx: CanvasRenderingContext2D,
  projectiles: Projectile[]
) {
  projectiles.forEach((pr) => {
    ctx.save();
    ctx.translate(pr.x, pr.y);
    ctx.rotate(pr.rotation);

    ctx.fillStyle = '#38BDF8';
    ctx.strokeStyle = '#0284C7';
    ctx.lineWidth = 2;
    ctx.beginPath();
    for (let p = 0; p < 4; p++) {
      const a = p * (Math.PI / 2);
      ctx.lineTo(Math.cos(a) * pr.size, Math.sin(a) * pr.size);
      ctx.lineTo(Math.cos(a + Math.PI / 4) * (pr.size * 0.35), Math.sin(a + Math.PI / 4) * (pr.size * 0.35));
    }
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.arc(0, 0, 3.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  });
}

export function renderBallAndEffects(
  ctx: CanvasRenderingContext2D,
  b: BallState
) {
  // Teleport portal & beacon
  if (b.teleportWarp) {
    ctx.save();
    const { fromX, fromY, toX, toY, timer, maxTimer, phase } = b.teleportWarp;
    const progress = Math.max(0, Math.min(1, timer / maxTimer));

    if (phase === 'CHARGING') {
      const vortexSpin = (maxTimer - timer) * 0.35;
      ctx.save();
      ctx.translate(fromX, fromY);
      ctx.rotate(vortexSpin);

      const singularityGrad = ctx.createRadialGradient(0, 0, 6, 0, 0, 36);
      singularityGrad.addColorStop(0, 'rgba(255, 255, 255, 0.9)');
      singularityGrad.addColorStop(0.35, 'rgba(192, 132, 252, 0.7)');
      singularityGrad.addColorStop(0.7, 'rgba(147, 51, 234, 0.4)');
      singularityGrad.addColorStop(1, 'rgba(124, 58, 237, 0)');
      ctx.fillStyle = singularityGrad;
      ctx.beginPath();
      ctx.arc(0, 0, 36, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      const beaconPulse = Math.sin(Date.now() * 0.02) * 5;
      const targetRad = 26 + beaconPulse;

      ctx.strokeStyle = '#C084FC';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(toX, toY, targetRad, 0, Math.PI * 2);
      ctx.stroke();

      ctx.strokeStyle = '#F472B6';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(toX - 10, toY);
      ctx.lineTo(toX + 10, toY);
      ctx.moveTo(toX, toY - 10);
      ctx.lineTo(toX + 10, toY);
      ctx.stroke();

      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(toX, toY, 32 * progress + 8, 0, Math.PI * 2);
      ctx.stroke();

      ctx.font = '8px "Press Start 2P", monospace';
      ctx.fillStyle = '#E9D5FF';
      ctx.textAlign = 'center';
      ctx.fillText('WARP!', toX, toY - 32);
    } else {
      const fade = timer / 18;
      ctx.strokeStyle = `rgba(192, 132, 252, ${fade})`;
      ctx.lineWidth = 4 * fade;
      ctx.beginPath();
      ctx.arc(toX, toY, (1 - fade) * 45 + 15, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.restore();
  }

  // Ball Trail
  b.trail.forEach((t) => {
    if (t.element === 'HYPER') {
      ctx.fillStyle = `rgba(16, 185, 129, ${t.alpha * 0.95})`;
    } else if (t.element === 'CYBER') {
      ctx.fillStyle = `rgba(6, 182, 212, ${t.alpha * 0.9})`;
    } else if (t.element === 'PSYCHIC') {
      ctx.fillStyle = `rgba(192, 132, 252, ${t.alpha * 0.85})`;
    } else if (t.element === 'FIRE') {
      ctx.fillStyle = `rgba(249, 115, 22, ${t.alpha * 0.85})`;
    } else if (t.element === 'WATER') {
      ctx.fillStyle = `rgba(56, 189, 248, ${t.alpha * 0.7})`;
    } else if (t.element === 'THUNDER') {
      ctx.fillStyle = `rgba(0, 240, 255, ${t.alpha * 0.7})`;
    } else {
      ctx.fillStyle = `rgba(250, 204, 21, ${t.alpha * 0.55})`;
    }
    ctx.beginPath();
    ctx.arc(t.x, t.y, b.radius * (0.6 + t.alpha * 0.4), 0, Math.PI * 2);
    ctx.fill();
  });

  if (b.isSuperCharged) {
    if (b.element === 'HYPER') {
      ctx.strokeStyle = '#10B981';
      ctx.lineWidth = 5.5;
      ctx.beginPath();
      ctx.arc(b.x, b.y, b.radius + 9, 0, Math.PI * 2);
      ctx.stroke();
      ctx.strokeStyle = '#FDE047';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.arc(b.x, b.y, b.radius + 13, 0, Math.PI * 2);
      ctx.stroke();
    } else if (b.element === 'CYBER') {
      ctx.strokeStyle = '#06B6D4';
      ctx.lineWidth = 5.0;
      ctx.beginPath();
      ctx.arc(b.x, b.y, b.radius + 8, 0, Math.PI * 2);
      ctx.stroke();

      for (let s = 0; s < 4; s++) {
        const ang = Date.now() * 0.025 + s * (Math.PI / 2);
        ctx.fillStyle = '#67E8F9';
        ctx.fillRect(b.x + Math.cos(ang) * (b.radius + 10) - 2, b.y + Math.sin(ang) * (b.radius + 10) - 2, 5, 5);
      }
    } else if (b.element === 'PSYCHIC') {
      ctx.strokeStyle = '#C084FC';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(b.x, b.y, b.radius + 8, 0, Math.PI * 2);
      ctx.stroke();
    } else if (b.element === 'FIRE') {
      ctx.strokeStyle = '#EA580C';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(b.x, b.y, b.radius + 7, 0, Math.PI * 2);
      ctx.stroke();
    } else if (b.element === 'WATER') {
      ctx.strokeStyle = '#38BDF8';
      ctx.lineWidth = 3.5;
      ctx.beginPath();
      ctx.arc(b.x, b.y, b.radius + 6, 0, Math.PI * 2);
      ctx.stroke();
    } else {
      ctx.strokeStyle = '#00F0FF';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(b.x, b.y, b.radius + 6, 0, Math.PI * 2);
      ctx.stroke();
    }
  }

  // Ball Shadow
  ctx.fillStyle = 'rgba(0, 0, 0, 0.22)';
  const ballShadowScale = Math.max(0.2, 1 - (GROUND_Y - b.y) / 250);
  ctx.beginPath();
  ctx.ellipse(b.x, GROUND_Y + 2, b.radius * ballShadowScale * 1.3, 5 * ballShadowScale, 0, 0, Math.PI * 2);
  ctx.fill();

  // Yellow Beach Volleyball Rendering
  ctx.save();
  ctx.translate(b.x, b.y);
  ctx.rotate(b.rotation);

  ctx.fillStyle = '#78350F';
  ctx.beginPath();
  ctx.arc(0, 0, b.radius, 0, Math.PI * 2);
  ctx.fill();

  const yellowVolleyGrad = ctx.createRadialGradient(-5, -6, 2, 0, 0, b.radius);
  yellowVolleyGrad.addColorStop(0, '#FEF08A');
  yellowVolleyGrad.addColorStop(0.35, '#FDE047');
  yellowVolleyGrad.addColorStop(0.75, '#F59E0B');
  yellowVolleyGrad.addColorStop(1, '#D97706');
  ctx.fillStyle = yellowVolleyGrad;
  ctx.beginPath();
  ctx.arc(0, 0, b.radius - 1, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#1D4ED8';
  ctx.beginPath();
  ctx.moveTo(-b.radius * 0.7, -b.radius * 0.6);
  ctx.bezierCurveTo(-b.radius * 0.2, -b.radius * 0.9, b.radius * 0.4, -b.radius * 0.4, b.radius * 0.7, -b.radius * 0.1);
  ctx.bezierCurveTo(b.radius * 0.4, -b.radius * 0.1, -b.radius * 0.1, -b.radius * 0.4, -b.radius * 0.7, -b.radius * 0.6);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = '#F8FAFC';
  ctx.beginPath();
  ctx.moveTo(-b.radius * 0.8, -b.radius * 0.1);
  ctx.bezierCurveTo(-b.radius * 0.3, -b.radius * 0.4, b.radius * 0.3, b.radius * 0.1, b.radius * 0.8, 0);
  ctx.bezierCurveTo(b.radius * 0.4, b.radius * 0.3, -b.radius * 0.2, 0, -b.radius * 0.8, -b.radius * 0.1);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = '#0284C7';
  ctx.beginPath();
  ctx.moveTo(-b.radius * 0.6, b.radius * 0.5);
  ctx.bezierCurveTo(-b.radius * 0.1, b.radius * 0.2, b.radius * 0.4, b.radius * 0.5, b.radius * 0.6, b.radius * 0.7);
  ctx.bezierCurveTo(b.radius * 0.2, b.radius * 0.8, -b.radius * 0.2, b.radius * 0.6, -b.radius * 0.6, b.radius * 0.5);
  ctx.closePath();
  ctx.fill();

  ctx.strokeStyle = '#92400E';
  ctx.lineWidth = 1.3;
  ctx.beginPath();
  ctx.moveTo(-b.radius + 2, 0);
  ctx.bezierCurveTo(-b.radius * 0.3, -b.radius * 0.7, b.radius * 0.3, b.radius * 0.7, b.radius - 2, 0);
  ctx.moveTo(0, -b.radius + 2);
  ctx.bezierCurveTo(b.radius * 0.6, -b.radius * 0.4, b.radius * 0.3, b.radius * 0.5, 0, b.radius - 2);
  ctx.moveTo(-b.radius * 0.65, -b.radius * 0.65);
  ctx.bezierCurveTo(0, 0, b.radius * 0.5, b.radius * 0.2, b.radius * 0.7, b.radius * 0.7);
  ctx.stroke();

  ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
  ctx.beginPath();
  ctx.ellipse(-b.radius * 0.38, -b.radius * 0.38, 4.5, 2.5, -Math.PI / 4, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

export function renderParticles(
  ctx: CanvasRenderingContext2D,
  particles: Particle[]
) {
  particles.forEach((pt) => {
    ctx.fillStyle = pt.color;
    ctx.globalAlpha = pt.alpha;
    if (pt.type === 'CYBER_BINARY' && pt.textChar) {
      ctx.font = 'bold 9px monospace';
      ctx.fillText(pt.textChar, pt.x, pt.y);
    } else if (pt.type === 'SNORLAX_Z') {
      ctx.font = 'bold 12px "Press Start 2P", monospace';
      ctx.fillText('Z', pt.x, pt.y);
    } else {
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, pt.size, 0, Math.PI * 2);
      ctx.fill();
    }
  });
  ctx.globalAlpha = 1.0;
}
