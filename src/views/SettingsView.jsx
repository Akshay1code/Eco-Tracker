import { useEffect, useState } from 'react';
import TopBar from '../components/layout/TopBar.jsx';
import SectionHeader from '../components/shared/SectionHeader.jsx';
import Avatar from '../components/shared/Avatar.jsx';
import { API_BASE_URL } from '../lib/apiBase.js';
import { fetchBackendHealth, fetchUserProfile, updateUserProfile } from '../lib/userApi.js';
import '../styles/settings.css';

const DEFAULT_NAME = 'Eco Explorer';
const DEFAULT_BIO = 'Building tiny low-carbon habits that stick.';
const DEFAULT_NOTIFICATIONS = {
  reminders: true,
  streak: true,
  community: false,
};

function parseStoredProfile() {
  if (typeof window === 'undefined') {
    return { userId: '', fallbackName: DEFAULT_NAME, profile: null };
  }

  const userId = (localStorage.getItem('userEmail') || '').trim().toLowerCase();
  const fallbackName = (localStorage.getItem('userName') || '').trim() || DEFAULT_NAME;

  try {
    const storedProfile = JSON.parse(localStorage.getItem('userProfile') || 'null');
    return { userId, fallbackName, profile: storedProfile };
  } catch {
    return { userId, fallbackName, profile: null };
  }
}

function getNotificationState(settings) {
  return {
    ...DEFAULT_NOTIFICATIONS,
    ...(settings?.notifications || {}),
  };
}

function getUnitValue(settings) {
  return settings?.unit === 'lbs CO2' ? 'lbs CO2' : 'kg CO2';
}

function persistSessionProfile(user, profile) {
  if (typeof window === 'undefined') {
    return;
  }

  if (user?.email) {
    localStorage.setItem('userEmail', user.email);
  }

  const displayName = profile?.name || user?.name;
  if (displayName) {
    localStorage.setItem('userName', displayName);
  }

  if (profile) {
    localStorage.setItem('userProfile', JSON.stringify(profile));
  }
}

function formatTimestamp(value) {
  if (!value) {
    return 'Waiting for first sync';
  }

  const timestamp = new Date(value);
  if (Number.isNaN(timestamp.getTime())) {
    return 'Waiting for first sync';
  }

  return timestamp.toLocaleString([], {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
}

function normalizeHealthState(payload) {
  const database = payload?.database || {};
  return {
    status: database.status || 'disconnected',
    mode: database.mode || 'unknown',
    label: database.label || 'Backend unavailable',
  };
}

function getProfileBio(profile) {
  return typeof profile?.bio === 'string' ? profile.bio : DEFAULT_BIO;
}

function SettingsView({ onLogout, activeTab = 'settings' }) {
  const [session] = useState(() => parseStoredProfile());
  const [name, setName] = useState(() => session.profile?.name || session.fallbackName);
  const [bio, setBio] = useState(() => getProfileBio(session.profile));
  const [toggles, setToggles] = useState(() => getNotificationState(session.profile?.settings));
  const [unit, setUnit] = useState(() => getUnitValue(session.profile?.settings));
  const [confirmReset, setConfirmReset] = useState(false);
  const [isLoading, setIsLoading] = useState(Boolean(session.userId));
  const [isSaving, setIsSaving] = useState(false);
  const [loadError, setLoadError] = useState('');
  const [saveNotice, setSaveNotice] = useState({
    tone: 'neutral',
    message: 'Profile changes save back to your users document in MongoDB.',
  });
  const [backendHealth, setBackendHealth] = useState({
    status: 'checking',
    mode: 'unknown',
    label: 'Checking backend',
  });
  const [lastSyncedAt, setLastSyncedAt] = useState('');

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

  useEffect(() => {
    let isActive = true;

    const loadSettings = async () => {
      if (!session.userId) {
        setIsLoading(false);
        setLoadError('Sign in first so we know which profile to load.');
        return;
      }

      setIsLoading(true);

      try {
        const payload = await fetchUserProfile(session.userId);
        if (!isActive) {
          return;
        }

        const nextProfile = payload.profile || {};
        const nextUser = payload.user || {};

        setName(nextProfile.name || nextUser.name || session.fallbackName);
        setBio(getProfileBio(nextProfile));
        setToggles(getNotificationState(nextProfile.settings));
        setUnit(getUnitValue(nextProfile.settings));
        setLastSyncedAt(nextUser.updatedAt || '');
        setLoadError('');
        persistSessionProfile(nextUser, nextProfile);
      } catch (error) {
        if (!isActive) {
          return;
        }

        setLoadError(error instanceof Error ? error.message : 'Unable to load your settings right now.');
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    };

    const loadHealth = async () => {
      try {
        const payload = await fetchBackendHealth();
        if (!isActive) {
          return;
        }

        setBackendHealth(normalizeHealthState(payload));
      } catch {
        if (!isActive) {
          return;
        }

        setBackendHealth({
          status: 'disconnected',
          mode: 'unknown',
          label: 'Backend unreachable',
        });
      }
    };

    void loadSettings();
    void loadHealth();

    return () => {
      isActive = false;
    };
  }, [session.fallbackName, session.userId]);

  const setToggle = (key) => {
    setToggles((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const resetPreferences = () => {
    setToggles(DEFAULT_NOTIFICATIONS);
    setUnit('kg CO2');
    setConfirmReset(false);
    setSaveNotice({
      tone: 'neutral',
      message: 'Preference draft reset. Save to push the defaults back to MongoDB.',
    });
  };

  const handleSave = async () => {
    if (!session.userId || isSaving) {
      return;
    }

    setIsSaving(true);
    setSaveNotice({
      tone: 'neutral',
      message: 'Saving your settings to the backend...',
    });

    try {
      const payload = await updateUserProfile(session.userId, {
        name,
        bio,
        settings: {
          notifications: toggles,
          unit,
        },
      });

      persistSessionProfile(payload.user, payload.profile);
      setLastSyncedAt(payload.user?.updatedAt || '');
      setName(payload.profile?.name || name);
      setBio(typeof payload.profile?.bio === 'string' ? payload.profile.bio : bio);
      setToggles(getNotificationState(payload.profile?.settings));
      setUnit(getUnitValue(payload.profile?.settings));
      setSaveNotice({
        tone: 'success',
        message: 'Settings saved to MongoDB successfully.',
      });
    } catch (error) {
      setSaveNotice({
        tone: 'error',
        message: error instanceof Error ? error.message : 'Unable to save settings right now.',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const accountLabel = session.userId || 'No account found';
  const backendDetail =
    backendHealth.status === 'connected'
      ? backendHealth.mode === 'atlas'
        ? 'Remote cluster connected and ready for profile sync.'
        : 'Connected, but this backend is still pointing at local MongoDB.'
      : 'Start the backend and verify the database connection before saving.';

  return (
    <div className="settings-view">
      <TopBar activeTab={activeTab} onLogout={onLogout} />
      <SectionHeader title="Settings" subtitle="Tune your profile, preferences, and backend sync." />

      <section className="settings-hero">
        <div className="settings-hero-copy">
          <span className="settings-eyebrow">Live Sync</span>
          <h2>Settings now save directly through the backend.</h2>
          <p>
            Your profile, notification preferences, and carbon units are loaded from the database and saved back to the
            same user record.
          </p>
        </div>

        <div className="settings-status-grid">
          <article className={`settings-status-card settings-status-card--${backendHealth.status}`}>
            <span className="settings-status-label">Database</span>
            <strong>{backendHealth.label}</strong>
            <p>{backendDetail}</p>
          </article>

          <article className="settings-status-card settings-status-card--account">
            <span className="settings-status-label">Signed In As</span>
            <strong>{accountLabel}</strong>
            <p>{loadError || `API endpoint: ${API_BASE_URL}`}</p>
          </article>
        </div>
      </section>

      <section className="settings-meta-strip">
        <div className="settings-meta-pill">
          <span>Last sync</span>
          <strong>{formatTimestamp(lastSyncedAt)}</strong>
        </div>
        <div className={`settings-meta-pill settings-meta-pill--${saveNotice.tone}`}>
          <span>Save status</span>
          <strong>{saveNotice.message}</strong>
        </div>
      </section>

      <section className="card-white settings-panel">
        <div className="settings-panel-head">
          <h3>Profile</h3>
          <span>{isLoading ? 'Loading from DB' : 'Public identity'}</span>
        </div>

        <div className="settings-profile-row">
          <div className="settings-avatar-wrap">
            <Avatar name={name} size={64} />
          </div>
          <div className="settings-field-wrap">
            <label className="settings-field">
              <span className="settings-label">Display name</span>
              <input
                className="settings-input"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="How should the community see you?"
              />
            </label>
          </div>
        </div>

        <label className="settings-field settings-field--bio">
          <span className="settings-label">Bio</span>
          <textarea
            className="settings-textarea"
            rows={4}
            value={bio}
            onChange={(event) => setBio(event.target.value)}
            placeholder="Share the habit or mission you are building."
          />
        </label>
      </section>

      <SectionHeader title="Notifications" />
      <section className="card-white settings-panel">
        <div className="settings-panel-head">
          <h3>Alert controls</h3>
          <span>Stored in your profile settings</span>
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
          Your tracker summary will be shown using <strong>{unit}</strong> across charts, cards, and the community
          profile.
        </div>
      </section>

      <SectionHeader title="Reset" />
      <section className="card-white settings-panel settings-danger-panel">
        <div className="settings-panel-head">
          <h3>Reset preferences</h3>
          <span>Draft only until you save</span>
        </div>
        {!confirmReset ? (
          <button type="button" className="danger-btn settings-danger-btn" onClick={() => setConfirmReset(true)}>
            Reset Draft
          </button>
        ) : (
          <div className="settings-danger-confirm">
            <p className="settings-danger-text">Restore notifications and units to their default values?</p>
            <div className="settings-action-row">
              <button type="button" className="danger-btn settings-danger-btn" onClick={resetPreferences}>
                Confirm
              </button>
              <button type="button" className="mini-btn settings-cancel-btn" onClick={() => setConfirmReset(false)}>
                Cancel
              </button>
            </div>
          </div>
        )}
      </section>

      <div className="settings-save-row">
        <div className="settings-save-copy">
          <span className="settings-save-label">MongoDB Sync</span>
          <strong>{backendHealth.label}</strong>
          <p>{session.userId ? 'Save writes to your backend profile document.' : 'Sign in to enable profile sync.'}</p>
        </div>

        <button
          type="button"
          className="save-btn settings-save-btn"
          onClick={handleSave}
          disabled={!session.userId || isLoading || isSaving}
        >
          {isSaving ? 'Saving...' : 'Save Settings'}
        </button>
      </div>
    </div>
  );
}

export default SettingsView;
