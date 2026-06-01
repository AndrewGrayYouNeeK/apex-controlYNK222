import React, { useRef, useEffect, useCallback } from 'react';

const SCOPE_SIZE = 800;
const CENTER = SCOPE_SIZE / 2;
const RADIUS = 350;

export default function RadarScope({ aircraft, conflicts, selectedAircraft, onSelectAircraft, weather, sweepAngle }) {
  const canvasRef = useRef(null);
  const animRef = useRef(null);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    if (canvas.width !== SCOPE_SIZE * dpr) {
      canvas.width = SCOPE_SIZE * dpr;
      canvas.height = SCOPE_SIZE * dpr;
    }
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    // Background
    ctx.fillStyle = '#030a04';
    ctx.fillRect(0, 0, SCOPE_SIZE, SCOPE_SIZE);

    // Range rings
    ctx.strokeStyle = 'rgba(0, 180, 40, 0.12)';
    ctx.lineWidth = 0.5;
    for (let r = 50; r <= RADIUS; r += 50) {
      ctx.beginPath();
      ctx.arc(CENTER, CENTER, r, 0, Math.PI * 2);
      ctx.stroke();
    }

    // Compass lines
    for (let angle = 0; angle < 360; angle += 30) {
      const rad = (angle * Math.PI) / 180;
      ctx.beginPath();
      ctx.moveTo(CENTER, CENTER);
      ctx.lineTo(CENTER + Math.cos(rad) * RADIUS, CENTER + Math.sin(rad) * RADIUS);
      ctx.stroke();

      // Labels
      ctx.fillStyle = 'rgba(0, 180, 40, 0.3)';
      ctx.font = '10px "JetBrains Mono"';
      ctx.textAlign = 'center';
      ctx.fillText(
        String(angle === 0 ? 360 : angle).padStart(3, '0'),
        CENTER + Math.cos(rad) * (RADIUS + 15),
        CENTER + Math.sin(rad) * (RADIUS + 15) + 3
      );
    }

    // Runway indicators at center
    ctx.strokeStyle = 'rgba(0, 255, 60, 0.4)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(CENTER - 15, CENTER);
    ctx.lineTo(CENTER + 15, CENTER);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(CENTER, CENTER - 15);
    ctx.lineTo(CENTER, CENTER + 15);
    ctx.stroke();

    // Weather overlay
    if (weather && weather.severity > 1) {
      drawWeather(ctx, weather);
    }

    // Radar sweep
    const sweepRad = ((sweepAngle || 0) * Math.PI) / 180;
    const gradient = ctx.createConicalGradient
      ? null
      : (() => {
          const g = ctx.createLinearGradient(
            CENTER, CENTER,
            CENTER + Math.cos(sweepRad) * RADIUS,
            CENTER + Math.sin(sweepRad) * RADIUS
          );
          return g;
        })();

    ctx.save();
    ctx.globalAlpha = 0.15;
    ctx.beginPath();
    ctx.moveTo(CENTER, CENTER);
    ctx.arc(CENTER, CENTER, RADIUS, sweepRad - 0.5, sweepRad);
    ctx.closePath();
    const sweepGrad = ctx.createRadialGradient(CENTER, CENTER, 0, CENTER, CENTER, RADIUS);
    sweepGrad.addColorStop(0, 'rgba(0, 255, 60, 0.0)');
    sweepGrad.addColorStop(0.3, 'rgba(0, 255, 60, 0.3)');
    sweepGrad.addColorStop(1, 'rgba(0, 255, 60, 0.1)');
    ctx.fillStyle = sweepGrad;
    ctx.fill();
    ctx.restore();

    // Draw sweep line
    ctx.save();
    ctx.strokeStyle = 'rgba(0, 255, 60, 0.5)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(CENTER, CENTER);
    ctx.lineTo(CENTER + Math.cos(sweepRad) * RADIUS, CENTER + Math.sin(sweepRad) * RADIUS);
    ctx.stroke();
    ctx.restore();

    // Draw aircraft
    aircraft.forEach(ac => {
      drawAircraft(ctx, ac, ac.id === selectedAircraft, conflicts);
    });

    // Draw conflict indicators
    conflicts.forEach(c => {
      drawConflict(ctx, c);
    });

    // Scope border
    ctx.strokeStyle = 'rgba(0, 200, 50, 0.3)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(CENTER, CENTER, RADIUS, 0, Math.PI * 2);
    ctx.stroke();

  }, [aircraft, conflicts, selectedAircraft, weather, sweepAngle]);

  useEffect(() => {
    const render = () => {
      draw();
      animRef.current = requestAnimationFrame(render);
    };
    animRef.current = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animRef.current);
  }, [draw]);

  function drawWeather(ctx, weather) {
    if (weather.severity < 2) return;
    const count = weather.severity * 3;
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const dist = Math.random() * RADIUS * 0.8;
      const size = 20 + Math.random() * 40;
      const x = CENTER + Math.cos(angle) * dist;
      const y = CENTER + Math.sin(angle) * dist;

      ctx.save();
      ctx.globalAlpha = 0.08 + weather.severity * 0.02;
      const colors = ['rgba(255, 0, 0, 0.3)', 'rgba(255, 165, 0, 0.3)', 'rgba(255, 255, 0, 0.2)'];
      ctx.fillStyle = colors[Math.floor(Math.random() * colors.length)];
      ctx.beginPath();
      ctx.arc(x, y, size, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  function drawAircraft(ctx, ac, isSelected, conflicts) {
    const x = ac.x;
    const y = ac.y;
    if (x < 0 || x > SCOPE_SIZE || y < 0 || y > SCOPE_SIZE) return;

    const isConflict = conflicts.some(c => c.aircraft1.id === ac.id || c.aircraft2.id === ac.id);
    const isEmergency = !!ac.emergency;

    // Contrail — fading dots that grow toward the aircraft
    ctx.save();
    ac.trail.forEach((t, i) => {
      const ratio = (i + 1) / ac.trail.length;
      const alpha = ratio * 0.4;
      const r = 0.8 + ratio * 1.6;
      ctx.fillStyle = isEmergency
        ? `rgba(255, 80, 80, ${alpha})`
        : `rgba(0, 230, 80, ${alpha})`;
      ctx.beginPath();
      ctx.arc(t.x, t.y, r, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.restore();

    // Aircraft blip
    ctx.save();
    let color = 'rgba(0, 255, 60, 0.9)';
    if (isEmergency) color = 'rgba(255, 50, 50, 1)';
    else if (isConflict) color = 'rgba(255, 200, 0, 1)';
    else if (isSelected) color = 'rgba(100, 255, 150, 1)';

    // Draw blip shape with phosphor glow
    const size = ac.aircraft.category === 'SUPER' ? 6 : ac.aircraft.category === 'HEAVY' ? 5 : ac.aircraft.category === 'SMALL' ? 3 : 4;

    ctx.shadowColor = color;
    ctx.shadowBlur = isEmergency || isConflict ? 12 : 6;
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x, y, size, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    // Pulsing selection ring
    if (isSelected) {
      const pulse = 1 + Math.sin(Date.now() / 200) * 0.25;
      ctx.strokeStyle = 'rgba(120, 255, 170, 0.6)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(x, y, (size + 6) * pulse, 0, Math.PI * 2);
      ctx.stroke();
    }

    // Heading indicator line
    const headRad = ((90 - ac.heading) * Math.PI) / 180;
    ctx.strokeStyle = color;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + Math.cos(headRad) * 15, y - Math.sin(headRad) * 15);
    ctx.stroke();

    // Data block
    const blockX = x + 12;
    const blockY = y - 20;

    if (isSelected) {
      ctx.strokeStyle = 'rgba(100, 255, 150, 0.3)';
      ctx.lineWidth = 1;
      ctx.setLineDash([2, 2]);
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(blockX, blockY + 10);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    ctx.font = '10px "JetBrains Mono"';
    ctx.fillStyle = color;
    ctx.textAlign = 'left';

    // Callsign
    ctx.fillText(ac.callsign, blockX, blockY);

    // Altitude / Speed
    const altStr = String(Math.floor(ac.altitude / 100)).padStart(3, '0');
    const spdStr = String(Math.floor(ac.speed)).padStart(3, '0');
    ctx.fillText(`${altStr} ${spdStr}`, blockX, blockY + 11);

    // Aircraft type
    ctx.fillStyle = isEmergency ? 'rgba(255, 50, 50, 0.6)' : 'rgba(0, 180, 40, 0.5)';
    ctx.fillText(ac.aircraft.type, blockX, blockY + 22);

    // Emergency indicator
    if (isEmergency) {
      const flashOn = Math.floor(Date.now() / 500) % 2 === 0;
      if (flashOn) {
        ctx.fillStyle = 'rgba(255, 0, 0, 0.8)';
        ctx.font = 'bold 9px "JetBrains Mono"';
        ctx.fillText(`EMER ${ac.squawk}`, blockX, blockY + 33);
      }
    }

    // Status
    if (ac.status === 'APPROACH' || ac.status === 'GO AROUND') {
      ctx.fillStyle = ac.status === 'GO AROUND' ? 'rgba(255, 200, 0, 0.7)' : 'rgba(0, 200, 255, 0.6)';
      ctx.font = '8px "JetBrains Mono"';
      ctx.fillText(ac.status, blockX, blockY + (isEmergency ? 44 : 33));
    }

    ctx.restore();
  }

  function drawConflict(ctx, conflict) {
    const { aircraft1: a, aircraft2: b, severity } = conflict;
    const midX = (a.x + b.x) / 2;
    const midY = (a.y + b.y) / 2;
    const flashOn = Math.floor(Date.now() / 300) % 2 === 0;

    if (flashOn) {
      ctx.save();
      ctx.strokeStyle = severity === 'CRITICAL' ? 'rgba(255, 0, 0, 0.8)' : 'rgba(255, 200, 0, 0.8)';
      ctx.lineWidth = 2;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(a.x, a.y);
      ctx.lineTo(b.x, b.y);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.fillStyle = severity === 'CRITICAL' ? 'rgba(255, 0, 0, 0.9)' : 'rgba(255, 200, 0, 0.9)';
      ctx.font = 'bold 12px "JetBrains Mono"';
      ctx.textAlign = 'center';
      ctx.fillText('⚠ CA', midX, midY - 5);
      ctx.restore();
    }
  }

  const handleClick = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    const scaleX = SCOPE_SIZE / rect.width;
    const scaleY = SCOPE_SIZE / rect.height;
    const clickX = (e.clientX - rect.left) * scaleX;
    const clickY = (e.clientY - rect.top) * scaleY;

    let closest = null;
    let closestDist = 20;
    aircraft.forEach(ac => {
      const d = Math.sqrt((ac.x - clickX) ** 2 + (ac.y - clickY) ** 2);
      if (d < closestDist) {
        closest = ac.id;
        closestDist = d;
      }
    });
    onSelectAircraft(closest);
  };

  return (
    <div className="relative">
      <canvas
        ref={canvasRef}
        style={{ width: '100%', height: '100%', maxWidth: SCOPE_SIZE, maxHeight: SCOPE_SIZE, cursor: 'crosshair' }}
        onClick={handleClick}
        className="rounded-full radar-glow"
      />
    </div>
  );
}