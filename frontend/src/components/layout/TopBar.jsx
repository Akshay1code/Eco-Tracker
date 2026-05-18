const TITLES = {
  dashboard: 'Eco Dashboard',
  activity: 'Activity Insights',
  community: 'Community Rankings',
  journal: 'Eco Journal',
  goals: 'Goals & Rewards',
  profile: 'Eco Profile',
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

    </header>
  );
}

export default TopBar;
