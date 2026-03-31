function hashToGradient(name = 'Eco User') {
  const base = name.trim().charCodeAt(0) || 65;
  const hueA = base % 360;
  const hueB = (base * 1.7) % 360;
  return `linear-gradient(135deg, hsl(${hueA} 70% 45%), hsl(${hueB} 75% 58%))`;
}

function getInitials(name = '') {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (!parts.length) {
    return 'EJ';
  }
  return parts.slice(0, 2).map((p) => p[0].toUpperCase()).join('');
}

function Avatar({ name = 'Eco User', size = 44 }) {
  const initials = getInitials(name);

  return (
    <div
      aria-label={name}
      title={name}
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        background: hashToGradient(name),
        color: '#fff',
        display: 'grid',
        placeItems: 'center',
        fontWeight: 700,
        letterSpacing: 0.4,
        boxShadow: '0 10px 22px rgba(0,0,0,.18)',
      }}
    >
      <span style={{ fontSize: Math.max(12, Math.floor(size * 0.33)) }}>{initials}</span>
    </div>
  );
}

export default Avatar;
