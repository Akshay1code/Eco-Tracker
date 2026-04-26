import { MdClose } from 'react-icons/md';
import Modal from '../shared/Modal.jsx';
import '../../styles/community.css';

const getRankTitle = (xp) => {
  if (xp > 5000) return 'Eco Legend';
  if (xp > 2000) return 'Green Master';
  if (xp > 1000) return 'Eco Warrior';
  if (xp > 500) return 'Seedling';
  return 'Eco Novice';
};

function ProfileModal({ user, onClose }) {
  if (!user) return null;

  const weeklyData = user.weekly || [0, 0, 0, 0, 0, 0, 0];
  const maxFootprint = Math.max(...weeklyData, 0.1);
  const xpProgress = user.xp ? (user.xp % 1000) / 10 : 45; // Simulated progress for demo

  return (
    <Modal onClose={onClose} maxWidth={520}>
      <header className="modal-header-flex">
        <div>
          <h2 className="community-title" style={{ fontSize: '1.75rem', marginBottom: 0 }}>Community Profile</h2>
          <p className="community-subtitle" style={{ fontSize: '0.8rem' }}>Detailed sustainability report</p>
        </div>
        <button className="modal-close-btn" onClick={onClose}>
          <MdClose size={20} />
        </button>
      </header>

      <section className="profile-intro">
        <div className="profile-avatar-big">
          {user.name?.charAt(0)}
        </div>
        <div>
          <div className="user-name" style={{ fontSize: '1.5rem' }}>{user.name}</div>
          <div className="user-title" style={{ fontSize: '1rem' }}>{getRankTitle(user.xp)}</div>
        </div>
      </section>

      {user.bio && (
        <div className="profile-bio-card">
          {user.bio}
        </div>
      )}

      <div className="modal-stat-grid">
        <div className="modal-stat-card">
          <span className="modal-stat-label">Global Rank</span>
          <span className="modal-stat-value">#{user.dynamicRank || user.rank}</span>
        </div>
        <div className="modal-stat-card">
          <span className="modal-stat-label">Weekly Score</span>
          <span className="modal-stat-value">{user.score?.toFixed(2)} kg</span>
        </div>
        <div className="modal-stat-card">
          <span className="modal-stat-label">Eco Streak</span>
          <span className="modal-stat-value">{user.streak || 0} Days</span>
        </div>
      </div>

      <div className="level-progress-container">
        <div className="level-header">
          <span>Level {user.level || Math.floor((user.xp || 0) / 1000) + 1}</span>
          <span>{user.xp || 0} XP</span>
        </div>
        <div className="level-bar-bg">
          <div className="level-bar-fill" style={{ width: `${xpProgress}%` }} />
        </div>
      </div>

      <h3 className="footprint-chart-label">7-Day Footprint Trend</h3>
      <div className="mini-footprint-bars">
        {weeklyData.map((val, i) => (
          <div
            key={i}
            className={`mini-bar ${i === weeklyData.length - 1 ? 'active' : ''}`}
            style={{ height: `${(val / maxFootprint) * 100}%`, minHeight: '10%' }}
            title={`${val.toFixed(2)} kg CO2`}
          />
        ))}
      </div>

      <div className="badge-cloud">
        {(user.badges || [
          { label: 'Low Carbon Hero' },
          { label: 'Transit Saver' },
          { label: 'Streak Master' }
        ]).map((badge, idx) => (
          <span key={idx} className="badge-tag">
            {badge.label}
          </span>
        ))}
      </div>
    </Modal>
  );
}

export default ProfileModal;
