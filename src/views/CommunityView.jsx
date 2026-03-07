import { useMemo, useState } from 'react';
import TopBar from '../components/layout/TopBar.jsx';
import SectionHeader from '../components/shared/SectionHeader.jsx';
import PodiumCard from '../components/community/PodiumCard.jsx';
import LeaderboardRow from '../components/community/LeaderboardRow.jsx';
import { LEADERBOARD } from '../data/mockData.js';

const FILTERS = ['This Week', 'This Month', 'All Time'];

function CommunityView({ onUserClick, onLogout, activeTab = 'community' }) {
  const [filter, setFilter] = useState(FILTERS[0]);

  const users = useMemo(() => {
    if (filter === 'All Time') {
      return [...LEADERBOARD].sort((a, b) => b.xp - a.xp);
    }
    if (filter === 'This Month') {
      return [...LEADERBOARD].sort((a, b) => a.score - b.score);
    }
    return LEADERBOARD;
  }, [filter]);

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
        <div style={{ display: 'grid', gap: 8 }}>
          {users.map((user) => (
            <LeaderboardRow key={`${filter}-${user.rank}-${user.name}`} user={user} onClick={onUserClick} />
          ))}
        </div>
      </section>
    </div>
  );
}

export default CommunityView;

