import { MdChevronRight } from 'react-icons/md';
import '../../styles/community.css';

const getRankTitle = (xp) => {
  if (xp > 5000) return 'Eco Legend';
  if (xp > 2000) return 'Green Master';
  if (xp > 1000) return 'Eco Warrior';
  if (xp > 500) return 'Seedling';
  return 'Eco Novice';
};

function LeaderboardRow({ user, onClick }) {
  return (
    <div className="leader-row" onClick={() => onClick?.(user)} style={{ cursor: 'pointer', padding: '0.875rem 1rem' }}>
      <div className="rank-num">#{String(user.rank).padStart(2, '0')}</div>
      <div className="user-info-cell">
        <div className="list-avatar" style={{ width: '32px', height: '32px', fontSize: '0.8rem' }}>
          {user.name?.charAt(0)}
        </div>
        <div>
          <div className="user-name" style={{ fontSize: '0.9rem' }}>{user.name}</div>
          <div className="user-title" style={{ fontSize: '0.7rem' }}>{getRankTitle(user.xp)}</div>
        </div>
      </div>
      <div className="score-cell" style={{ fontSize: '0.8rem' }}>
        {user.score?.toFixed(2)} kg
      </div>
      <div className="xp-cell" style={{ fontSize: '0.8rem' }}>
        {user.xp} XP
      </div>
      <div className="chevron-cell">
        <MdChevronRight />
      </div>
    </div>
  );
}

export default LeaderboardRow;
