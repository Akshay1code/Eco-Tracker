function ProgressBar({ value = 0, color = 'linear-gradient(90deg, #22c55e, #4ade80)', height = 10 }) {
  const safe = Math.max(0, Math.min(100, value));

  return (
    <div
      style={{
        width: '100%',
        height,
        borderRadius: 999,
        background: 'rgba(15, 61, 42, 0.12)',
        overflow: 'hidden',
      }}
    >
      <div
        className="bar-grow"
        style={{
          width: `${safe}%`,
          height: '100%',
          borderRadius: 999,
          background: color,
        }}
      />
    </div>
  );
}

export default ProgressBar;
