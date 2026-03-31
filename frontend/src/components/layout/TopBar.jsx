const TITLES = {
  dashboard: 'Eco Dashboard',
  activity: 'Activity Insights',
  community: 'Community Rankings',
  journal: 'Eco Journal',
  goals: 'Goals & Rewards',
  settings: 'Settings',
};

function TopBar({ activeTab = 'dashboard', onLogout }) {
  const today = new Date();
  const dateText = new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(today);

  return (
    <header className="topbar">
      <div>
        <h1>{TITLES[activeTab] || 'EcoJourney'}</h1>
        <p>Welcome back, traveler. {dateText}</p>
      </div>
      <div className="topbar-actions">
        <div className="streak-pill">{'\uD83D\uDD25'} 12-day streak</div>
        <button type="button" className="bell-btn" aria-label="Notifications">
          {'\uD83D\uDD14'}
        </button>
        <button type="button" className="logout-btn" onClick={onLogout}>
          Logout
        </button>
      </div>
    </header>
  );
}

export default TopBar;
