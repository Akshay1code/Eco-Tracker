function StatChip({ label, value }) {
  return (
    <div
      style={{
        padding: '10px 12px',
        borderRadius: 14,
        background: 'rgba(255,255,255,.08)',
        border: '1px solid rgba(255,255,255,.16)',
      }}
    >
      <div style={{ fontSize: 11, color: 'rgba(255,255,255,.76)', marginBottom: 2 }}>{label}</div>
      <div style={{ color: '#fff', fontWeight: 700, fontSize: 15 }}>{value}</div>
    </div>
  );
}

export default StatChip;
