import { useState } from 'react';
import TopBar from '../components/layout/TopBar.jsx';
import SectionHeader from '../components/shared/SectionHeader.jsx';
import Avatar from '../components/shared/Avatar.jsx';
import '../styles/settings.css';

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
  const notificationItems = [
    {
      key: 'reminders',
      title: 'Daily reminders',
      description: 'Nudges to log movement and carbon progress every day.',
    },
    {
      key: 'streak',
      title: 'Streak alerts',
      description: 'Warnings before your tracking streak is about to break.',
    },
    {
      key: 'community',
      title: 'Community updates',
      description: 'Highlights from friends, rankings, and weekly challenge posts.',
    },
  ];

  const setToggle = (key) => {
    setToggles((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const resetProgress = () => {
    setToggles({ reminders: false, streak: false, community: false });
    setConfirmReset(false);
  };

  return (
    <div className="settings-view">
      <TopBar activeTab={activeTab} onLogout={onLogout} />
      <SectionHeader title="Settings" subtitle="Tune your profile and gameplay preferences." />

      <section className="card-white settings-panel">
        <div className="settings-panel-head">
          <h3>Profile</h3>
          <span>Public identity</span>
        </div>

        <div className="settings-profile-row">
          <div className="settings-avatar-wrap">
            <Avatar name={name} size={64} />
          </div>
          <div className="settings-field-wrap">
            <label className="settings-field">
              <span className="settings-label">Display name</span>
              <input className="settings-input" value={name} onChange={(e) => setName(e.target.value)} />
            </label>
          </div>
        </div>

        <label className="settings-field settings-field--bio">
          <span className="settings-label">Bio</span>
          <textarea className="settings-textarea" rows={3} value={bio} onChange={(e) => setBio(e.target.value)} />
        </label>
      </section>

      <SectionHeader title="Notifications" />
      <section className="card-white settings-panel">
        <div className="settings-panel-head">
          <h3>Alert controls</h3>
          <span>Real-time nudges</span>
        </div>

        <div className="settings-stack">
          {notificationItems.map((item) => (
            <div key={item.key} className="toggle-row settings-toggle-row">
              <div className="settings-toggle-copy">
                <span className="settings-toggle-title">{item.title}</span>
                <span className="settings-toggle-description">{item.description}</span>
              </div>
              <button
                type="button"
                className={`toggle ${toggles[item.key] ? 'on' : ''}`}
                onClick={() => setToggle(item.key)}
                aria-label={item.title}
                aria-pressed={toggles[item.key]}
              />
            </div>
          ))}
        </div>
      </section>

      <SectionHeader title="Units" />
      <section className="card-white settings-panel">
        <div className="settings-panel-head">
          <h3>Carbon units</h3>
          <span>Personal preference</span>
        </div>

        <div className="settings-unit-group">
          {['kg CO2', 'lbs CO2'].map((item) => (
            <button
              key={item}
              type="button"
              className={`pill-button settings-unit-btn ${unit === item ? 'active' : ''}`}
              onClick={() => setUnit(item)}
            >
              {item}
            </button>
          ))}
        </div>

        <div className="settings-hint">
          Your tracker summary will be shown using <strong>{unit}</strong> across charts and cards.
        </div>
      </section>

      <SectionHeader title="Danger Zone" />
      <section className="card-white settings-panel settings-danger-panel">
        <div className="settings-panel-head">
          <h3>Reset data</h3>
          <span>Irreversible action</span>
        </div>
        {!confirmReset ? (
          <button type="button" className="danger-btn settings-danger-btn" onClick={() => setConfirmReset(true)}>
            Reset Progress
          </button>
        ) : (
          <div className="settings-danger-confirm">
            <p className="settings-danger-text">Are you sure? This cannot be undone.</p>
            <div className="settings-action-row">
              <button type="button" className="danger-btn settings-danger-btn" onClick={resetProgress}>Confirm</button>
              <button type="button" className="mini-btn settings-cancel-btn" onClick={() => setConfirmReset(false)}>Cancel</button>
            </div>
          </div>
        )}
      </section>

      <button type="button" className="save-btn settings-save-btn">
        Save Settings
      </button>
    </div>
  );
}

export default SettingsView;
