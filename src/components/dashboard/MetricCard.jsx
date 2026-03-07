function MetricCard({ metric }) {
  return (
    <article
      className="card-metric card-lift"
      style={{
        background: `linear-gradient(145deg, ${metric.colors[0]}, ${metric.colors[1]})`,
        color: '#fff',
        padding: 16,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <div style={{ position: 'absolute', top: 2, right: 8, fontSize: 56, opacity: 0.1 }}>{metric.icon}</div>
      <div style={{ fontSize: 12, opacity: 0.86 }}>{metric.label}</div>
      <div style={{ marginTop: 8, fontSize: 28, fontWeight: 800 }}>{metric.value}</div>
      <div style={{ fontSize: 12, opacity: 0.9 }}>{metric.unit}</div>
      <div style={{ marginTop: 12 }}>
        <div style={{ height: 6, borderRadius: 999, background: 'rgba(255,255,255,.25)' }}>
          <div
            className="bar-grow"
            style={{
              width: `${metric.progress}%`,
              height: '100%',
              borderRadius: 999,
              background: 'rgba(255,255,255,.95)',
            }}
          />
        </div>
      </div>
    </article>
  );
}

export default MetricCard;
