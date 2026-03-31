import Avatar from '../shared/Avatar.jsx';
import { RANK_BADGES } from '../../data/mockData.js';

function podiumBg(rank) {
  if (rank === 1) return 'linear-gradient(140deg, rgba(245,158,11,.25), rgba(252,211,77,.35))';
  if (rank === 2) return 'linear-gradient(140deg, rgba(107,114,128,.2), rgba(209,213,219,.32))';
  return 'linear-gradient(140deg, rgba(180,83,9,.2), rgba(251,191,36,.2))';
}

function PodiumCard({ user }) {
  return (
    <article
      className="card-white card-lift"
      style={{
        padding: 14,
        background: podiumBg(user.rank),
        display: 'grid',
        justifyItems: 'center',
        gap: 8,
      }}
    >
      <div style={{ fontWeight: 800, color: 'var(--forest)' }}>#{user.rank}</div>
      <Avatar name={user.name} size={50} />
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontWeight: 700, color: 'var(--forest)' }}>{user.name}</div>
        <div style={{ fontSize: 12, color: 'var(--gray-600)' }}>{RANK_BADGES[user.badge]}</div>
      </div>
      <div style={{ fontWeight: 800, color: 'var(--deep)' }}>{user.score.toFixed(2)} kg</div>
    </article>
  );
}

export default PodiumCard;
