import React, { useState } from 'react';
import useLeaderboard from '../../hooks/useLeaderboard.js';

// Rank badge colours mapped from backend badge field
const BADGE_COLOURS = {
  protector: '#f59e0b',
  guardian:  '#22c55e',
  walker:    '#3b82f6',
  seedling:  '#86efac',
};

function getBadgeLabel(badge) {
  const map = {
    protector: '🏆 Planet Protector',
    guardian:  '🌳 Earth Guardian',
    walker:    '🌿 Eco Walker',
    seedling:  '🌱 Seedling',
  };
  return map[badge] || '🌱 Seedling';
}

const ProfileModal = ({ user, onClose }) => {
  if (!user) return null;
  const colour = BADGE_COLOURS[user.badge] || '#22c55e';
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="close-btn" onClick={onClose}>&times;</button>
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <div style={{ fontSize: '4rem', marginBottom: '0.5rem' }}>
            {user.name?.charAt(0)?.toUpperCase() || '?'}
          </div>
          <h2 style={{ color: 'var(--forest-green)', margin: 0 }}>{user.name}</h2>
          <div style={{ color: colour, fontWeight: 'bold' }}>{getBadgeLabel(user.badge)}</div>
        </div>

        <div style={{ background: 'rgba(250, 204, 21, 0.1)', padding: '1rem', borderRadius: '12px', marginBottom: '1.5rem', fontStyle: 'italic', color: 'var(--text-muted)', textAlign: 'center' }}>
          "{user.bio || 'Building a greener routine one day at a time.'}"
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
          <div style={{ textAlign: 'center', padding: '1rem', background: '#f9fafb', borderRadius: '12px' }}>
            <div style={{ color: 'var(--text-muted)' }}>Carbon Score</div>
            <strong style={{ color: 'var(--forest-green)', fontSize: '1.2rem' }}>
              {typeof user.score === 'number' ? user.score.toFixed(3) : '0.000'} kg
            </strong>
          </div>
          <div style={{ textAlign: 'center', padding: '1rem', background: '#f9fafb', borderRadius: '12px' }}>
            <div style={{ color: 'var(--text-muted)' }}>XP Points</div>
            <strong style={{ color: 'var(--soft-yellow)', fontSize: '1.2rem' }}>{user.xp ?? 0} 🌿</strong>
          </div>
        </div>

        {Array.isArray(user.badges) && user.badges.length > 0 && (
          <>
            <h4 style={{ color: 'var(--forest-green)', marginBottom: '0.5rem' }}>Eco Achievements</h4>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              {user.badges.map((b, i) => (
                <span key={i} style={{ padding: '0.4rem 0.8rem', background: 'var(--mint-green)', borderRadius: '20px', fontSize: '0.9rem' }}>
                  {b}
                </span>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

// Skeleton placeholder row shown while loading
const SkeletonRow = ({ index }) => (
  <div style={{
    display: 'flex', alignItems: 'center', padding: '0.8rem',
    borderRadius: '16px', border: '1px solid rgba(167, 243, 208, 0.1)',
    opacity: 1 - index * 0.18, animation: 'pulse 1.5s infinite',
  }}>
    <div style={{ width: 30, height: 18, background: '#e5e7eb', borderRadius: 4, marginRight: '1rem' }} />
    <div style={{ width: 40, height: 40, borderRadius: '50%', background: '#e5e7eb', marginRight: '1rem' }} />
    <div style={{ flex: 1 }}>
      <div style={{ width: '60%', height: 14, background: '#e5e7eb', borderRadius: 4, marginBottom: 6 }} />
      <div style={{ width: '40%', height: 10, background: '#e5e7eb', borderRadius: 4 }} />
    </div>
    <div style={{ textAlign: 'right' }}>
      <div style={{ width: 50, height: 14, background: '#e5e7eb', borderRadius: 4, marginBottom: 6 }} />
      <div style={{ width: 40, height: 10, background: '#e5e7eb', borderRadius: 4 }} />
    </div>
  </div>
);

const CommunityRankings = () => {
  const [selectedUser, setSelectedUser] = useState(null);
  // Poll every 30 s — fast enough to feel live without hammering the backend
  const { users, isLoading, error } = useLeaderboard(4, 30_000);

  return (
    <div className="eco-card" style={{ padding: '1.5rem' }}>
      <h3 style={{ color: 'var(--forest-green)', marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span>Global Community</span>
        {!isLoading && !error && (
          <span style={{ fontSize: '0.75rem', color: 'var(--leaf-green)', opacity: 0.7, fontWeight: 400 }}>
            Live · {users.length} players
          </span>
        )}
      </h3>

      {/* Loading skeleton */}
      {isLoading && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {[0, 1, 2, 3].map((i) => <SkeletonRow key={i} index={i} />)}
        </div>
      )}

      {/* Error state */}
      {!isLoading && error && (
        <div style={{ color: '#ef4444', fontSize: '0.85rem', padding: '0.75rem', background: 'rgba(239,68,68,0.07)', borderRadius: 12, textAlign: 'center' }}>
          ⚠ {error}
        </div>
      )}

      {/* Empty state */}
      {!isLoading && !error && users.length === 0 && (
        <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.9rem', padding: '1rem 0' }}>
          No community members yet. Start tracking to join the leaderboard!
        </div>
      )}

      {/* Live leaderboard rows */}
      {!isLoading && !error && users.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {users.slice(0, 4).map((u, i) => {
            const colour = BADGE_COLOURS[u.badge] || '#22c55e';
            return (
              <div
                key={u.id}
                onClick={() => setSelectedUser(u)}
                style={{
                  display: 'flex', alignItems: 'center', padding: '0.8rem',
                  borderRadius: '16px',
                  border: '1px solid rgba(167, 243, 208, 0.2)',
                  cursor: 'pointer', transition: 'transform 0.2s, box-shadow 0.2s',
                  background: i === 0
                    ? 'linear-gradient(to right, rgba(250, 204, 21, 0.1), transparent)'
                    : 'transparent',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateX(5px)';
                  e.currentTarget.style.boxShadow = '0 5px 15px rgba(34, 197, 94, 0.1)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateX(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                {/* Rank */}
                <div style={{ fontSize: '1.5rem', marginRight: '1rem', width: '30px', textAlign: 'center' }}>
                  {i === 0 ? '🏅' : `#${i + 1}`}
                </div>

                {/* Avatar */}
                <div style={{
                  width: 40, height: 40, borderRadius: '50%',
                  background: `${colour}22`,
                  border: `2px solid ${colour}55`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '1.3rem', fontWeight: 800, color: colour,
                  marginRight: '1rem', flexShrink: 0,
                }}>
                  {u.name?.charAt(0)?.toUpperCase() || '?'}
                </div>

                {/* Name + badge */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 'bold', color: 'var(--text-main)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {u.name}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: colour }}>{getBadgeLabel(u.badge)}</div>
                </div>

                {/* Metrics */}
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <div style={{ fontWeight: 'bold', color: 'var(--forest-green)', fontSize: '0.9rem' }}>
                    {typeof u.score === 'number' ? u.score.toFixed(3) : '0.000'} kg
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    {u.xp ?? 0} XP
                    {u.streak > 0 && <span style={{ marginLeft: 4, color: '#f97316' }}>🔥{u.streak}</span>}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <ProfileModal user={selectedUser} onClose={() => setSelectedUser(null)} />
    </div>
  );
};

export default CommunityRankings;
