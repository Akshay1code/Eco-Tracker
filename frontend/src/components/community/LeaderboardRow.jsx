import Avatar from '../shared/Avatar.jsx';
import { RANK_BADGES } from '../../data/mockData.js';

function rankTone(rank) {
  if (rank === 1) return { bg: 'rgba(245,158,11,.16)', border: 'rgba(245,158,11,.35)', color: '#b45309' };
  if (rank === 2) return { bg: 'rgba(15,61,42,.1)', border: 'rgba(15,61,42,.24)', color: '#0f3d2a' };
  return { bg: 'rgba(156,163,175,.12)', border: 'rgba(156,163,175,.24)', color: '#374151' };
}

function LeaderboardRow({ user, onClick }) {
  const tone = rankTone(user.rank);

  return (
    <button
      type="button"
      onClick={() => onClick?.(user)}
      style={{
        width: '100%',
        display: 'grid',
        gridTemplateColumns: '56px 1fr auto',
        alignItems: 'center',
        gap: 12,
        borderRadius: 14,
        border: `1px solid ${tone.border}`,
        background: '#fff',
        padding: 10,
        cursor: 'pointer',
        textAlign: 'left',
      }}
    >
      <div
        className={user.rank === 1 ? 'badge-shine' : ''}
        style={{
          width: 42,
          height: 42,
          borderRadius: 12,
          background: tone.bg,
          display: 'grid',
          placeItems: 'center',
          color: tone.color,
          fontWeight: 800,
        }}
      >
        #{user.rank}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <Avatar name={user.name} size={38} />
        <div>
          <div style={{ fontWeight: 700, color: 'var(--forest)' }}>{user.name}</div>
          <div style={{ fontSize: 12, color: 'var(--gray-600)' }}>{RANK_BADGES[user.badge]}</div>
        </div>
      </div>

      <div style={{ textAlign: 'right' }}>
        <div style={{ fontWeight: 700, color: 'var(--forest)' }}>{user.score.toFixed(2)} kg</div>
        <div style={{ fontSize: 12, color: 'var(--gray-600)' }}>
          {user.xp} XP <span style={{ color: user.trend === 'up' ? '#16a34a' : '#dc2626' }}>{user.trend === 'up' ? '?' : '?'}</span>
        </div>
      </div>
    </button>
  );
}

export default LeaderboardRow;
