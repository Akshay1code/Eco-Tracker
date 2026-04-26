import { useMemo, useState } from 'react';
import { MdEmojiEvents, MdChevronRight, MdCo2, MdBolt } from 'react-icons/md';
import TopBar from '../components/layout/TopBar.jsx';
import useLeaderboard from '../hooks/useLeaderboard.js';
import '../styles/community.css';

const FILTERS = ['This Week', 'This Month', 'All Time'];

export default function CommunityView({ onUserClick, onLogout, activeTab = 'community' }) {
  const [filter, setFilter] = useState(FILTERS[0]);
  const { users: leaderboardUsers, isLoading, error } = useLeaderboard(25);

  const users = useMemo(() => {
    if (!leaderboardUsers.length) return [];

    let sorted = [];
    if (filter === 'All Time') {
      sorted = [...leaderboardUsers].sort((a, b) => b.xp - a.xp);
    } else {
      // For Week/Month, lower score (carbon emission) is better, but higher XP wins ties
      sorted = [...leaderboardUsers].sort((a, b) => (a.score || 0) - (b.score || 0) || (b.xp || 0) - (a.xp || 0));
    }
    
    return sorted.map((u, i) => ({ ...u, dynamicRank: i + 1 }));
  }, [filter, leaderboardUsers]);

  const podium = users.slice(0, 3);
  const others = users.slice(3);

  const getRankTitle = (xp) => {
    if (xp > 5000) return 'Eco Legend';
    if (xp > 2000) return 'Green Master';
    if (xp > 1000) return 'Eco Warrior';
    if (xp > 500) return 'Seedling';
    return 'Eco Novice';
  };

  return (
    <div className="community-page">
      <TopBar activeTab={activeTab} onLogout={onLogout} />

      <header className="community-header-section">
        <h1 className="community-title">Community Rankings</h1>
        <p className="community-subtitle">Compare your sustainability achievements with top eco-warriors.</p>
        
        <div className="filter-container">
          {FILTERS.map((item) => (
            <button
              key={item}
              className={`pill-button ${item === filter ? 'active' : ''}`}
              onClick={() => setFilter(item)}
            >
              {item}
            </button>
          ))}
        </div>
      </header>

      {isLoading ? (
        <div className="rankings-table-container">
          <p style={{ padding: '2rem', textAlign: 'center', color: 'var(--eco-mint)' }}>Loading top participants...</p>
        </div>
      ) : error ? (
        <div className="rankings-table-container">
          <p style={{ padding: '2rem', textAlign: 'center', color: 'var(--carbon-high)' }}>{error}</p>
        </div>
      ) : (
        <>
          <section className="podium-container">
            {/* Rank 2 */}
            {podium[1] && (
              <div className="podium-card rank-2">
                <div className="rank-badge">#2</div>
                <div className="avatar-wrapper">
                  <div className="avatar-main">{podium[1].name?.charAt(0)}</div>
                </div>
                <div className="podium-name">{podium[1].name}</div>
                <div className="podium-rank-text">{getRankTitle(podium[1].xp)}</div>
                <div className="podium-metrics">
                  <div className="metric-row">
                    <span className="metric-label">Emission</span>
                    <span className="metric-value">{podium[1].score?.toFixed(2)} kg</span>
                  </div>
                  <div className="metric-row">
                    <span className="metric-label">XP</span>
                    <span className="metric-value">{podium[1].xp}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Rank 1 */}
            {podium[0] && (
              <div className="podium-card rank-1">
                <div className="rank-badge">#1</div>
                <div className="avatar-wrapper">
                  <div className="avatar-main">{podium[0].name?.charAt(0)}</div>
                  <MdEmojiEvents style={{ position: 'absolute', top: -15, right: -5, color: 'var(--xp-gold)', fontSize: '2rem' }} />
                </div>
                <div className="podium-name">{podium[0].name}</div>
                <div className="podium-rank-text">{getRankTitle(podium[0].xp)}</div>
                <div className="podium-metrics">
                  <div className="metric-row">
                    <span className="metric-label">Emission</span>
                    <span className="metric-value">{podium[0].score?.toFixed(2)} kg</span>
                  </div>
                  <div className="metric-row">
                    <span className="metric-label">XP</span>
                    <span className="metric-value" style={{ color: 'var(--xp-gold)' }}>{podium[0].xp}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Rank 3 */}
            {podium[2] && (
              <div className="podium-card rank-3">
                <div className="rank-badge">#3</div>
                <div className="avatar-wrapper">
                  <div className="avatar-main">{podium[2].name?.charAt(0)}</div>
                </div>
                <div className="podium-name">{podium[2].name}</div>
                <div className="podium-rank-text">{getRankTitle(podium[2].xp)}</div>
                <div className="podium-metrics">
                  <div className="metric-row">
                    <span className="metric-label">Emission</span>
                    <span className="metric-value">{podium[2].score?.toFixed(2)} kg</span>
                  </div>
                  <div className="metric-row">
                    <span className="metric-label">XP</span>
                    <span className="metric-value">{podium[2].xp}</span>
                  </div>
                </div>
              </div>
            )}
          </section>

          <section className="rankings-table-container">
            <div className="leader-row" style={{ borderBottom: '2px solid var(--eco-bg)', marginBottom: '0.5rem', opacity: 0.7 }}>
              <div className="rank-num" style={{ fontSize: '0.7rem', textTransform: 'uppercase' }}>Rank</div>
              <div className="user-name" style={{ fontSize: '0.7rem', textTransform: 'uppercase' }}>Participant</div>
              <div className="user-name" style={{ fontSize: '0.7rem', textTransform: 'uppercase' }}>Sustainability Score</div>
              <div className="user-name" style={{ fontSize: '0.7rem', textTransform: 'uppercase' }}>Eco Experience</div>
              <div></div>
            </div>
            
            <div style={{ display: 'grid' }}>
              {others.map((user) => (
                <div key={user.id} className="leader-row" onClick={() => onUserClick?.(user)}>
                  <div className="rank-num">{String(user.dynamicRank).padStart(2, '0')}</div>
                  <div className="user-info-cell">
                    <div className="list-avatar">{user.name?.charAt(0)}</div>
                    <div>
                      <div className="user-name">{user.name}</div>
                      <div className="user-title">{getRankTitle(user.xp)}</div>
                    </div>
                  </div>
                  <div className="score-cell">
                    <MdCo2 style={{ verticalAlign: 'middle', marginRight: '4px' }} />
                    {user.score?.toFixed(2)} kg
                  </div>
                  <div className="xp-cell">
                    <MdBolt style={{ marginRight: '2px' }} />
                    {user.xp} XP
                  </div>
                  <div className="chevron-cell">
                    <MdChevronRight fontSize="1.25rem" />
                  </div>
                </div>
              ))}
            </div>
            
            {!users.length && <p style={{ textAlign: 'center', padding: '2rem', opacity: 0.5 }}>No records found for this period.</p>}
          </section>
        </>
      )}
    </div>
  );
}
