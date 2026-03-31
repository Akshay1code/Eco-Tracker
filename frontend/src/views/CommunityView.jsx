import { useMemo, useState } from 'react';
import TopBar from '../components/layout/TopBar.jsx';
import SectionHeader from '../components/shared/SectionHeader.jsx';
import PodiumCard from '../components/community/PodiumCard.jsx';
import LeaderboardRow from '../components/community/LeaderboardRow.jsx';
import useLeaderboard from '../hooks/useLeaderboard.js';

const FILTERS = ['This Week', 'This Month', 'All Time'];

function CommunityView({ onUserClick, onLogout, activeTab = 'community' }) {
  const [filter, setFilter] = useState(FILTERS[0]);
  const { users: leaderboardUsers, isLoading, error } = useLeaderboard(25);

  const users = useMemo(() => {
    if (!leaderboardUsers.length) {
      return [];
    }

    if (filter === 'All Time') {
      return [...leaderboardUsers].sort((a, b) => b.xp - a.xp);
    }
    if (filter === 'This Month') {
      return [...leaderboardUsers].sort((a, b) => a.score - b.score || b.xp - a.xp);
    }
    return [...leaderboardUsers].sort((a, b) => a.score - b.score || b.xp - a.xp);
  }, [filter, leaderboardUsers]);

  const podium = users.slice(0, 3);

  return (
    <div>
      <TopBar activeTab={activeTab} onLogout={onLogout} />

      <SectionHeader title="Community" subtitle="Compare your footprint trend with fellow players." />
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 14 }}>
        {FILTERS.map((item) => (
          <button
            key={item}
            type="button"
            className={`pill-button ${item === filter ? 'active' : ''}`}
            onClick={() => setFilter(item)}
          >
            {item}
          </button>
        ))}
      </div>

      <div className="three-col" style={{ marginBottom: 16 }}>
        {podium.map((user) => (
          <PodiumCard key={user.rank} user={user} />
        ))}
      </div>

      <section className="card-white" style={{ padding: 16 }}>
        {isLoading ? <p style={{ color: 'var(--gray-600)', margin: 0 }}>Loading community rankings...</p> : null}
        {!isLoading && error ? <p style={{ color: '#b91c1c', margin: 0 }}>{error}</p> : null}
        {!isLoading && !error && !users.length ? (
          <p style={{ color: 'var(--gray-600)', margin: 0 }}>No community members are available yet.</p>
        ) : null}
        {!isLoading && !error && users.length ? (
          <div style={{ display: 'grid', gap: 8 }}>
            {users.map((user) => (
              <LeaderboardRow key={`${filter}-${user.rank}-${user.id}`} user={user} onClick={onUserClick} />
            ))}
          </div>
        ) : null}
      </section>
    </div>
  );
}

export default CommunityView;

