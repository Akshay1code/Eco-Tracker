import { MdClose, MdMenuBook } from 'react-icons/md';
import { useState, useEffect } from 'react';
import Modal from '../shared/Modal.jsx';
import '../../styles/community.css';
import { fetchUserProfile } from '../../lib/userApi.js';

const getRankTitle = (xp) => {
  if (xp > 5000) return 'Eco Legend';
  if (xp > 2000) return 'Green Master';
  if (xp > 1000) return 'Eco Warrior';
  if (xp > 500) return 'Seedling';
  return 'Eco Novice';
};

function ProfileModal({ user, onClose }) {
  const [fullProfile, setFullProfile] = useState(null);
  
  useEffect(() => {
    if (user?.id) {
      const viewerId = typeof window !== 'undefined' ? localStorage.getItem('userEmail') : null;
      // We pass the viewerId via a query param hack or adjust fetchUserProfile in a moment, 
      // actually let's just use the api directly
      const url = `http://localhost:3001/api/users/profile?userId=${encodeURIComponent(user.id)}${viewerId ? `&viewerId=${encodeURIComponent(viewerId)}` : ''}`;
      fetch(url)
        .then(res => res.json())
        .then(data => {
           if (data.success) {
             setFullProfile(data.user);
           }
        })
        .catch(console.error);
    }
  }, [user?.id]);

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

      {fullProfile && fullProfile.journal && fullProfile.journal.length > 0 && (
        <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px solid #eee' }}>
          <h3 style={{ fontSize: '1rem', color: '#1f2937', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <MdMenuBook /> Public Eco Journal
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '250px', overflowY: 'auto', paddingRight: '8px' }}>
            {fullProfile.journal.map(entry => (
              <div key={entry.id} style={{ background: '#f9fafb', padding: '12px', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.8rem', color: '#6b7280' }}>
                  <span>{new Date(entry.date).toLocaleDateString()}</span>
                  <span style={{ textTransform: 'capitalize', fontWeight: 600 }}>{entry.category} • {entry.mood}</span>
                </div>
                <p style={{ fontSize: '0.9rem', color: '#374151', margin: 0, whiteSpace: 'pre-wrap' }}>{entry.text}</p>
                {entry.tags && entry.tags.length > 0 && (
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '8px' }}>
                    {entry.tags.map(tag => (
                      <span key={tag} style={{ background: '#e0e7ff', color: '#4338ca', padding: '2px 6px', borderRadius: '4px', fontSize: '0.7rem' }}>#{tag}</span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </Modal>
  );
}

export default ProfileModal;
