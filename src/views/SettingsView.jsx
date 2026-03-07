import { useState } from 'react';
import TopBar from '../components/layout/TopBar.jsx';
import SectionHeader from '../components/shared/SectionHeader.jsx';
import Avatar from '../components/shared/Avatar.jsx';

function SettingsView({ onLogout, activeTab = 'settings' }) {
  const [name, setName] = useState('Eco Explorer');
  const [bio, setBio] = useState('Building tiny low-carbon habits that stick.');
  const [toggles, setToggles] = useState({
    reminders: true,
    streak: true,
    community: false,
  });
  const [unit, setUnit] = useState('kg CO2');
  const [confirmReset, setConfirmReset] = useState(false);

  const setToggle = (key) => {
    setToggles((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const resetProgress = () => {
    setToggles({ reminders: false, streak: false, community: false });
    setConfirmReset(false);
  };

  return (
    <div>
      <TopBar activeTab={activeTab} onLogout={onLogout} />
      <SectionHeader title="Settings" subtitle="Tune your profile and gameplay preferences." />

      <section className="card-white" style={{ padding: 18 }}>
        <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
          <Avatar name={name} size={64} />
          <div style={{ flex: 1 }}>
            <label>
              <span>Name</span>
              <input value={name} onChange={(e) => setName(e.target.value)} />
            </label>
          </div>
        </div>

        <label style={{ display: 'block', marginTop: 12 }}>
          <span>Bio</span>
          <textarea rows={3} value={bio} onChange={(e) => setBio(e.target.value)} />
        </label>
      </section>

      <SectionHeader title="Notifications" />
      <section className="card-white" style={{ padding: 18, display: 'grid', gap: 10 }}>
        <div className="toggle-row"><span>Daily reminders</span><button type="button" className={`toggle ${toggles.reminders ? 'on' : ''}`} onClick={() => setToggle('reminders')} /></div>
        <div className="toggle-row"><span>Streak alerts</span><button type="button" className={`toggle ${toggles.streak ? 'on' : ''}`} onClick={() => setToggle('streak')} /></div>
        <div className="toggle-row"><span>Community updates</span><button type="button" className={`toggle ${toggles.community ? 'on' : ''}`} onClick={() => setToggle('community')} /></div>
      </section>

      <SectionHeader title="Units" />
      <section className="card-white" style={{ padding: 18 }}>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {['kg CO2', 'lbs CO2'].map((item) => (
            <button
              key={item}
              type="button"
              className={`pill-button ${unit === item ? 'active' : ''}`}
              onClick={() => setUnit(item)}
            >
              {item}
            </button>
          ))}
        </div>

        <div
          style={{
            marginTop: 14,
            padding: '12px 14px',
            borderRadius: 12,
            background: 'var(--mint)',
            color: 'var(--deep)',
            fontWeight: 600,
          }}
        >
          Always light theme for best experience {'\uD83C\uDF3F'}
        </div>
      </section>

      <SectionHeader title="Danger Zone" />
      <section className="card-white" style={{ padding: 18 }}>
        {!confirmReset ? (
          <button type="button" className="danger-btn" onClick={() => setConfirmReset(true)}>
            Reset Progress
          </button>
        ) : (
          <div>
            <p style={{ color: '#b91c1c', fontWeight: 700 }}>Are you sure? This cannot be undone.</p>
            <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
              <button type="button" className="danger-btn" onClick={resetProgress}>Confirm</button>
              <button type="button" className="mini-btn" onClick={() => setConfirmReset(false)}>Cancel</button>
            </div>
          </div>
        )}
      </section>

      <button type="button" className="save-btn" style={{ marginTop: 16 }}>
        Save Settings
      </button>
    </div>
  );
}

export default SettingsView;

