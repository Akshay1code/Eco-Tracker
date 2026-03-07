function CarbonGauge({ score = 0.41 }) {
  const r = 54;
  const circumference = 2 * Math.PI * r;
  const progress = Math.max(0, Math.min(1, score));
  const dashOffset = circumference * (1 - progress);

  let color = '#22c55e';
  if (score >= 0.7) {
    color = '#ef4444';
  } else if (score >= 0.3) {
    color = '#f59e0b';
  }

  return (
    <div style={{ display: 'grid', placeItems: 'center', position: 'relative' }}>
      <svg width="140" height="140" viewBox="0 0 140 140">
        <circle cx="70" cy="70" r={r} fill="none" stroke="rgba(255,255,255,.15)" strokeWidth="12" />
        <circle
          className="gauge-ring"
          cx="70"
          cy="70"
          r={r}
          fill="none"
          stroke={color}
          strokeWidth="12"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          transform="rotate(-90 70 70)"
        />
      </svg>
      <div style={{ position: 'absolute', textAlign: 'center' }}>
        <div style={{ color: '#fff', fontSize: 28, fontWeight: 800 }}>{score.toFixed(2)}</div>
        <div style={{ color: 'rgba(255,255,255,.78)', fontSize: 12 }}>kg today</div>
      </div>
    </div>
  );
}

export default CarbonGauge;
