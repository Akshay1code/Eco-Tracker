import { useEffect, useMemo } from 'react';
import { TODOS_INIT } from '../../data/mockData.js';
import CarbonFootprint from './CarbonFootprint.jsx';
import DashboardMascot from './DashboardMascot.jsx';
import LeafSVG from '../shared/LeafSVG.jsx';
import StatChip from '../shared/StatChip.jsx';
import ProgressBar from '../shared/ProgressBar.jsx';

function HeroCard({ onXPData, deviceData, onRequestMotionAccess }) {
  const stats = useMemo(() => {
    const fallbackXP = TODOS_INIT.filter((todo) => todo.done).reduce((sum, todo) => sum + todo.xp, 0);
    const totalXP = Number(deviceData?.totalXp ?? fallbackXP);
    const level = Number(deviceData?.level ?? Math.floor(totalXP / 200) + 1);
    const levelPct = Number(deviceData?.levelProgressPct ?? ((totalXP % 200) / 200) * 100);
    return { totalXP, level, levelPct };
  }, [deviceData?.level, deviceData?.levelProgressPct, deviceData?.totalXp]);

  const liveScore = Math.max(
    0,
    Math.min(0.99, deviceData?.carbon ?? 0)
  );
  const liveSteps = deviceData?.steps ?? 0;
  const liveDistance = deviceData?.distance ?? 0;
  const liveActive = deviceData?.activeMinutes ?? 0;
  const liveCadence = deviceData?.cadence ?? 0;
  const liveConfidence = deviceData?.averageStepConfidence ?? 0;
  const motionPermission = deviceData?.motionPermission ?? 'prompt';
  const liveActivity = deviceData?.activity ?? 'idle';
  const trackingStatus = deviceData?.trackingStatus ?? 'active';
  const meaningfulUpdates = deviceData?.meaningfulUpdates ?? 0;
  const heroFootprintScore = Math.max(0, Math.min(10, liveScore * 10));
  const sampleSeconds = deviceData?.samplingIntervalSeconds ?? 60;
  const movementThreshold = deviceData?.movementThresholdMeters ?? 20;
  const motionSupported = deviceData?.supported?.motion ?? false;
  const badges = Array.isArray(deviceData?.badges) ? deviceData.badges : [];

  const activityLabelMap = {
    idle: 'Idle',
    walking: 'Walking',
    running: 'Running',
    vehicle: 'Vehicle',
  };

  const trackingMessage =
    trackingStatus === 'paused'
      ? 'GPS tracking is paused while this dashboard tab is hidden to reduce battery drain.'
      : trackingStatus === 'permission-denied'
        ? 'Location access is blocked, so GPS-based movement analytics are currently paused.'
        : `Adaptive thresholds and local-peak detection screen out random hand motion, while GPS checks keep confidence grounded every ${sampleSeconds} seconds.`;

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
      className="card-dark pulse-glow hero-card hero-card--mascot"
    >
      <DashboardMascot />
      <div className="hero-card__glow" />

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

      <div className="hero-card__content">
        <div className="hero-card__eyebrow">Today Overview</div>
        <h2 className="hero-card__title">Your Carbon Pulse</h2>
        <p className="hero-card__intro">
          Keep your footprint low and your quest momentum high by stacking small, consistent eco actions.
        </p>

        <div className="hero-card__stats">
          <StatChip label="Live Steps" value={liveSteps.toLocaleString()} />
          <StatChip label="Distance" value={`${liveDistance.toFixed(2)} km`} />
          <StatChip label="Active" value={`${liveActive} min`} />
          <StatChip label="Activity" value={activityLabelMap[liveActivity]} />
          <StatChip label="Cadence" value={`${Math.round(liveCadence)} spm`} />
          <StatChip label="Confidence" value={`${Math.round(liveConfidence * 100)}%`} />
        </div>

        <p className="hero-card__message">
          {trackingMessage}
        </p>

        <div className="hero-card__meta">
          <span className="hero-card__meta-item">Sample: {sampleSeconds}s</span>
          <span className="hero-card__meta-item">Threshold: {movementThreshold} m</span>
          <span className="hero-card__meta-item">Saved updates: {meaningfulUpdates}</span>
          <span className="hero-card__meta-item">GPS: {deviceData?.gpsDistance?.toFixed(2) ?? '0.00'} km</span>
          <span className="hero-card__meta-item">Pedometer: {deviceData?.estimatedDistance?.toFixed(2) ?? '0.00'} km</span>
        </div>

        {motionSupported && motionPermission !== 'granted' ? (
          <button
            type="button"
            className="mini-btn"
            style={{ marginTop: 14, background: 'rgba(255,255,255,.14)', color: '#fff', borderColor: 'rgba(255,255,255,.35)' }}
            onClick={onRequestMotionAccess}
          >
            Activate Pedometer
          </button>
        ) : null}
      </div>

      <div className="hero-card__side">
        <div className="hero-card__gauge-card">
          <CarbonFootprint
            score={heroFootprintScore}
            animated
            showControls={false}
            size={220}
          />
          <div className="hero-card__xp">
            <div className="hero-card__xp-label">Today's XP</div>
            <div className="hero-card__xp-value">{stats.totalXP}</div>
            <div className="hero-card__xp-level">Level {stats.level}</div>
            <ProgressBar
              value={stats.levelPct}
              color="linear-gradient(90deg, var(--gold), var(--gold-lt))"
              height={9}
            />
            {badges.length ? (
              <div style={{ marginTop: 10, display: 'flex', gap: 6, flexWrap: 'wrap', justifyContent: 'center' }}>
                {badges.slice(-3).map((badge) => (
                  <span key={badge.key || badge.label} className="pill" style={{ background: 'rgba(255,255,255,.12)', color: '#fff' }}>
                    {badge.label}
                  </span>
                ))}
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}

export default HeroCard;
