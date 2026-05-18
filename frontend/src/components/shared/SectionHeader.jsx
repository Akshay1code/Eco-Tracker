function SectionHeader({ title, subtitle }) {
  return (
    <div style={{ marginTop: 22, marginBottom: 14 }}>
      <h2 style={{ fontSize: 24, color: 'var(--forest)' }}>{title}</h2>
      {subtitle ? <p style={{ marginTop: 4, color: 'var(--gray-600)' }}>{subtitle}</p> : null}
    </div>
  );
}

export default SectionHeader;
