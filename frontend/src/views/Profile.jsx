import { useMemo, useState } from 'react';
import {
  MdCake,
  MdDateRange,
  MdEdit,
  MdEmail,
  MdEmojiEvents,
  MdLocationOn,
  MdPerson,
  MdStar,
} from 'react-icons/md';
import TopBar from '../components/layout/TopBar.jsx';
import useUserProfile from '../hooks/useUserProfile.js';
import '../styles/profile.css';

function formatJoined(dateValue) {
  if (!dateValue) return 'January 2024';
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return 'January 2024';
  return date.toLocaleString('en-US', { month: 'long', year: 'numeric' });
}

function initialsFromName(name) {
  return (
    (name || 'Eco Explorer')
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() || '')
      .join('') || 'EE'
  );
}

function Profile({ activeTab = 'profile', onLogout }) {
  const storedEmail = typeof window !== 'undefined' ? localStorage.getItem('userEmail') : null;
  const { user: backendUser } = useUserProfile(storedEmail);
  const [editMode, setEditMode] = useState(false);

  const mergedProfile = useMemo(() => {
    const backendName = backendUser?.name || backendUser?.nickname || 'Alex Johnson';
    const location = [backendUser?.city, backendUser?.country].filter(Boolean).join(', ') || 'Unknown Location';
    return {
      name: backendName,
      initials: initialsFromName(backendName),
      email: backendUser?.email || 'Loading...',
      location: location,
      dob: backendUser?.dob || 'Unknown',
      joined: formatJoined(backendUser?.createdAt),
      level: backendUser?.level || 1,
      xp: backendUser?.score || 0,
    };
  }, [backendUser]);

  const detailRows = [
    { label: 'Full Name', value: mergedProfile.name, Icon: MdPerson },
    { label: 'Email', value: mergedProfile.email, Icon: MdEmail },
    { label: 'Location', value: mergedProfile.location, Icon: MdLocationOn },
    { label: 'Date of Birth', value: mergedProfile.dob, Icon: MdCake },
    { label: 'Joined', value: mergedProfile.joined, Icon: MdDateRange },
  ];

  const badges = backendUser?.badges || [];

  return (
    <div className="profile-page">
      <TopBar activeTab={activeTab} onLogout={onLogout} />

      <div className="profile-layout">
        <div className="profile-column">
          <div className="profile-card">
            <div className="profile-hero">
              <div className="profile-hero-pattern" />
              <div className="profile-avatar">
                {mergedProfile.initials}
              </div>
            </div>
            <div className="profile-info">
              <h1 className="profile-name">{mergedProfile.name}</h1>
              <div className="profile-rpg-badge">
                Carbon Tracker RPG
              </div>
              <p className="profile-member-since">Member since {mergedProfile.joined}</p>
              <div className="profile-divider" />
              <div className="profile-stats-row">
                <div className="profile-stat">
                  <span className="profile-stat-value">{mergedProfile.level}</span>
                  <span className="profile-stat-label">Level</span>
                </div>
                <div className="profile-stat">
                  <span className="profile-stat-value">{mergedProfile.xp}</span>
                  <span className="profile-stat-label">Total XP</span>
                </div>
              </div>
            </div>
          </div>

          <div className="profile-card profile-card--padded">
            <div className="profile-section-header">
              <MdPerson className="profile-section-icon" />
              <h2 className="profile-section-title">Personal Details</h2>
            </div>
            <div className="profile-details-list">
              {detailRows.map(({ label, value, Icon }) => (
                <div key={label} className="profile-detail-row">
                  <div className="profile-detail-label">
                    <Icon className="profile-detail-icon" />
                    <span>{label}</span>
                  </div>
                  <div className="profile-detail-value">{value}</div>
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={() => setEditMode((prev) => !prev)}
              className="profile-edit-btn"
            >
              <MdEdit className="text-base" />
              {editMode ? 'Done Previewing' : 'Edit Profile'}
            </button>
            <div className={`profile-edit-info ${editMode ? 'profile-edit-info--active' : 'profile-edit-info--inactive'}`}>
              {editMode
                ? 'Edit mode is ready for backend profile editing next. Your current backend values are loaded above.'
                : 'Profile values shown here are connected to the signed-in backend user and recent activity history.'}
            </div>
          </div>
        </div>

        <div className="profile-column">
          <div className="profile-card profile-card--padded" style={{ height: '100%' }}>
            <div className="profile-section-header profile-section-header--badges">
              <MdEmojiEvents className="profile-section-icon-gold" />
              <h2 className="profile-section-title--large">Achievement Badges Room</h2>
              <div className="profile-badges-count">
                {badges.length} unlocked from DB
              </div>
            </div>

            <div className="profile-badge-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))' }}>
              {badges.length === 0 ? (
                <div style={{gridColumn: '1 / -1', textAlign: 'center', opacity: 0.7, padding: '20px', fontSize: '13px'}}>No badges earned yet. Complete activities to level up!</div>
              ) : null}
              {badges.map((badge) => {
                return (
                  <div
                    key={badge.key}
                    className="profile-badge-item profile-badge-item--unlocked"
                  >
                    <div
                      className="profile-badge-icon-box"
                      style={{
                        background: `linear-gradient(135deg, #a5d6a7, #43a047)`,
                        boxShadow: `0 4px 14px rgba(67,160,71,0.35)`,
                      }}
                    >
                      <MdStar className="profile-badge-icon profile-badge-icon--unlocked" />
                    </div>
                    <div className="profile-badge-name profile-badge-name--unlocked">
                      {badge.label}
                    </div>
                    <div
                      className="profile-badge-xp"
                      style={{ color: '#43a047', marginTop: '4px' }}
                    >
                      Awarded {new Date(badge.awardedAt).toLocaleDateString()}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Profile;
