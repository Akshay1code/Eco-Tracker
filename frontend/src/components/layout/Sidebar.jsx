import Avatar from '../shared/Avatar.jsx';
import '../../styles/sidebar.css';

const NAV_ITEMS = [
  { key: 'dashboard', label: 'Dashboard', icon: '\uD83C\uDF3F' },
  { key: 'activity', label: 'Activity', icon: '\uD83D\uDCCA' },
  { key: 'community', label: 'Community', icon: '\uD83C\uDF0D' },
  { key: 'journal', label: 'Journal', icon: '\uD83D\uDCD3' },
  { key: 'goals', label: 'Goals', icon: '\uD83C\uDFAF' },
  { key: 'settings', label: 'Settings', icon: '\u2699\uFE0F' },
];

function Sidebar({ activeTab, setActiveTab }) {
  return (
    <aside className="sidebar">
      <div>
        <div className="sidebar-logo">EcoJourney</div>
        <div className="sidebar-user">
          <Avatar name="Eco Explorer" size={50} />
          <div>
            <div className="sidebar-user-name">Eco Explorer</div>
            <div className="sidebar-user-role">Carbon Tracker RPG</div>
          </div>
        </div>

        <nav>
          {NAV_ITEMS.map((item) => (
            <button
              key={item.key}
              type="button"
              className={`sidebar-link ${activeTab === item.key ? 'active' : ''}`}
              onClick={() => setActiveTab(item.key)}
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </button>
          ))}
        </nav>
      </div>

      <div className="sidebar-footprint">
        <div>Daily Footprint</div>
        <strong>0.41 kg CO2</strong>
      </div>
    </aside>
  );
}

export default Sidebar;
