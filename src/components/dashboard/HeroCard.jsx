import { useEffect, useMemo } from 'react';
import { TODOS_INIT } from '../../data/mockData.js';
import CarbonGauge from './CarbonGauge.jsx';
import LeafSVG from '../shared/LeafSVG.jsx';
import StatChip from '../shared/StatChip.jsx';
import ProgressBar from '../shared/ProgressBar.jsx';

function HeroCard({ onXPData, deviceData, onRequestMotionAccess }) {
  const stats = useMemo(() => {
    const totalXP = TODOS_INIT.filter((todo) => todo.done).reduce((sum, todo) => sum + todo.xp, 0);
    const level = Math.floor(totalXP / 200) + 1;
    const levelPct = ((totalXP % 200) / 200) * 100;
    return { totalXP, level, levelPct };
  }, []);

  const liveScore = Math.max(0, Math.min(0.99, deviceData?.carbon ?? 0));
  const liveSteps = deviceData?.steps ?? 0;
  const liveDistance = deviceData?.distance ?? 0;
  const liveActive = deviceData?.activeMinutes ?? 0;
  const motionPermission = deviceData?.motionPermission ?? 'prompt';

  useEffect(() => {
    if (onXPData) {
      onXPData(stats);
    }
  }, [onXPData, stats]);

  const particles = [
    { left: '8%', top: '74%', delay: '0s', duration: '7s' },
    { left: '17%', top: '92%', delay: '.6s', duration: '8.2s' },
    { left: '28%', top: '83%', delay: '.9s', duration: '7.6s' },
    { left: '42%', top: '90%', delay: '.2s', duration: '9s' },
    { left: '58%', top: '85%', delay: '.8s', duration: '8.8s' },
    { left: '68%', top: '95%', delay: '1.4s', duration: '7.8s' },
    { left: '80%', top: '88%', delay: '.5s', duration: '8.4s' },
    { left: '90%', top: '92%', delay: '1.2s', duration: '7.2s' },
  ];

  return (
    <section
      className="card-dark pulse-glow"
      style={{
        position: 'relative',
        overflow: 'hidden',
        padding: 24,
        display: 'grid',
        gridTemplateColumns: '1.6fr 1fr',
        gap: 20,
      }}
    >
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'radial-gradient(120% 90% at 12% 4%, rgba(110,231,183,.3), rgba(34,197,94,.06) 45%, transparent 75%)',
          pointerEvents: 'none',
        }}
      />

      {particles.map((particle, i) => (
        <span
          key={i}
          className="particle"
          style={{
            left: particle.left,
            top: particle.top,
            animationDelay: particle.delay,
            animationDuration: particle.duration,
            color: 'rgba(167,243,208,.65)',
          }}
        >
          <LeafSVG size={13} />
        </span>
      ))}

      <div style={{ position: 'relative', zIndex: 1 }}>
        <div style={{ color: '#a7f3d0', fontSize: 13, textTransform: 'uppercase', letterSpacing: 1.4 }}>Today Overview</div>
        <h2 style={{ color: '#fff', fontSize: 34, marginTop: 6 }}>Your Carbon Pulse</h2>
        <p style={{ color: 'rgba(255,255,255,.82)', maxWidth: 520, marginTop: 8 }}>
          Keep your footprint low and your quest momentum high by stacking small, consistent eco actions.
        </p>

        <div style={{ display: 'flex', gap: 10, marginTop: 18, flexWrap: 'wrap' }}>
          <StatChip label="Live Steps" value={liveSteps.toLocaleString()} />
          <StatChip label="Distance" value={`${liveDistance.toFixed(2)} km`} />
          <StatChip label="Active" value={`${liveActive} min`} />
        </div>

        {motionPermission !== 'granted' ? (
          <button
            type="button"
            className="mini-btn"
            style={{ marginTop: 12, background: 'rgba(255,255,255,.14)', color: '#fff', borderColor: 'rgba(255,255,255,.35)' }}
            onClick={onRequestMotionAccess}
          >
            Activate Pedometer
          </button>
        ) : null}
      </div>

      <div style={{ position: 'relative', zIndex: 1 }}>
        <div className="card-white" style={{ padding: 16, background: 'rgba(255,255,255,.08)', borderColor: 'rgba(255,255,255,.2)' }}>
          <CarbonGauge score={liveScore || 0.01} />
          <div style={{ marginTop: 8, color: '#fff' }}>
            <div style={{ fontSize: 12, opacity: 0.8 }}>Today's XP</div>
            <div style={{ fontSize: 26, fontWeight: 800 }}>{stats.totalXP}</div>
            <div style={{ fontSize: 12, opacity: 0.8, marginBottom: 8 }}>Level {stats.level}</div>
            <ProgressBar
              value={stats.levelPct}
              color="linear-gradient(90deg, var(--gold), var(--gold-lt))"
              height={9}
            />
          </div>
        </div>
      </div>
    </section>
  );
}

export default HeroCard;
