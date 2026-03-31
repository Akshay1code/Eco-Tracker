import Modal from '../shared/Modal.jsx';
import Avatar from '../shared/Avatar.jsx';
import { RANK_BADGES } from '../../data/mockData.js';

function ProfileModal({ user, onClose }) {
  if (!user) {
    return null;
  }

  const bars = user.weekly || [];
  const max = Math.max(...bars, 0.01);

  return (
    <Modal onClose={onClose} maxWidth={520}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 style={{ color: 'var(--forest)', fontSize: 26 }}>Community Profile</h3>
        <button type="button" className="mini-btn" onClick={onClose}>?</button>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginTop: 14 }}>
        <Avatar name={user.name} size={64} />
        <div>
          <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--forest)' }}>{user.name}</div>
          <div style={{ color: 'var(--gray-600)' }}>{RANK_BADGES[user.badge]}</div>
        </div>
      </div>

      <div className="card-white" style={{ marginTop: 12, padding: 12, borderRadius: 14 }}>
        <p style={{ color: 'var(--gray-600)' }}>{user.bio}</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginTop: 12 }}>
        <div className="mini-stat"><span>Rank</span><strong>#{user.rank}</strong></div>
        <div className="mini-stat"><span>Score</span><strong>{user.score.toFixed(2)} kg</strong></div>
        <div className="mini-stat"><span>Streak</span><strong>{user.streak} days</strong></div>
      </div>

      {typeof user.level === 'number' ? (
        <div style={{ marginTop: 12 }} className="card-white">
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, alignItems: 'center' }}>
            <strong style={{ color: 'var(--forest)' }}>Level {user.level}</strong>
            <span style={{ color: 'var(--gray-600)', fontSize: 12 }}>{user.xp} XP</span>
          </div>
          {Array.isArray(user.badges) && user.badges.length ? (
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 10 }}>
              {user.badges.slice(-3).map((badge) => (
                <span key={badge.key || badge.label} className="pill">{badge.label}</span>
              ))}
            </div>
          ) : null}
        </div>
      ) : null}

      <div style={{ marginTop: 14 }}>
        <div style={{ fontWeight: 700, color: 'var(--forest)', marginBottom: 8 }}>7-Day Footprint</div>
        <div style={{ display: 'flex', alignItems: 'end', gap: 8, height: 100 }}>
          {bars.map((val, i) => (
            <div
              key={i}
              title={`${val.toFixed(2)} kg`}
              style={{
                flex: 1,
                borderRadius: '8px 8px 0 0',
                background: 'linear-gradient(180deg, #34d399, #15803d)',
                height: `${(val / max) * 100}%`,
                minHeight: 14,
              }}
            />
          ))}
        </div>
      </div>

      <div style={{ display: 'flex', gap: 8, marginTop: 12, flexWrap: 'wrap' }}>
        <span className="pill">Low Carbon Hero</span>
        <span className="pill">Transit Saver</span>
        <span className="pill">Streak Master</span>
      </div>
    </Modal>
  );
}

export default ProfileModal;
