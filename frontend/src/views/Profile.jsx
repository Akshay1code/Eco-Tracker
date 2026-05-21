import { useEffect, useMemo, useState } from 'react';
import {
  MdCake,
  MdDateRange,
  MdDeleteForever,
  MdEdit,
  MdEmail,
  MdEmojiEvents,
  MdLocationOn,
  MdPerson,
  MdStar,
} from 'react-icons/md';
import TopBar from '../components/layout/TopBar.jsx';
import useUserProfile from '../hooks/useUserProfile.js';
import { deleteUserAccount, updateUserProfile } from '../lib/userApi.js';
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

function formatDateInput(dateValue) {
  if (!dateValue) return '';
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) {
    return typeof dateValue === 'string' ? dateValue.slice(0, 10) : '';
  }
  return date.toISOString().slice(0, 10);
}

function createDraft(user) {
  return {
    name: user?.name || '',
    nickname: user?.nickname || '',
    dob: formatDateInput(user?.dob),
    city: user?.city || '',
    country: user?.country || '',
    bio: user?.bio || '',
  };
}

function getTodayString() {
  return new Date().toISOString().slice(0, 10);
}

function Profile({ activeTab = 'profile', onLogout }) {
  const storedEmail = typeof window !== 'undefined' ? localStorage.getItem('userEmail') : null;
  const { user: backendUser, isLoading, error, refetch } = useUserProfile(storedEmail);
  const [editMode, setEditMode] = useState(false);
  const [draft, setDraft] = useState(createDraft(null));
  const [saveState, setSaveState] = useState({ type: '', message: '' });
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');

  useEffect(() => {
    if (!backendUser || editMode) {
      return;
    }

    setDraft(createDraft(backendUser));
  }, [backendUser, editMode]);

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
      xp: backendUser?.currentXp ?? backendUser?.score ?? 0,
      xpRequiredForLevel: backendUser?.xpRequiredForLevel ?? 2500,
    };
  }, [backendUser]);

  const detailRows = useMemo(
    () => [
      { label: 'Full Name', value: mergedProfile.name, Icon: MdPerson },
      { label: 'Nickname', value: backendUser?.nickname || 'Not set', Icon: MdEdit },
      { label: 'Email', value: mergedProfile.email, Icon: MdEmail },
      { label: 'Location', value: mergedProfile.location, Icon: MdLocationOn },
      { label: 'Date of Birth', value: mergedProfile.dob, Icon: MdCake },
      { label: 'Joined', value: mergedProfile.joined, Icon: MdDateRange },
    ],
    [backendUser?.nickname, mergedProfile]
  );

  const badges = backendUser?.badges || [];
  const today = getTodayString();

  const handleDraftChange = (field, value) => {
    setDraft((previous) => ({
      ...previous,
      [field]: value,
    }));
    setSaveState({ type: '', message: '' });
  };

  const handleEditToggle = () => {
    if (editMode) {
      setDraft(createDraft(backendUser));
      setSaveState({ type: '', message: '' });
    }

    setEditMode((previous) => !previous);
  };

  const validateDraft = () => {
    if (!draft.name.trim() || draft.name.trim().length < 2) {
      return 'Full name must be at least 2 characters.';
    }
    if (!draft.nickname.trim() || draft.nickname.trim().length < 2) {
      return 'Nickname must be at least 2 characters.';
    }
    if (!draft.city.trim() || draft.city.trim().length < 2) {
      return 'City must be at least 2 characters.';
    }
    if (!draft.country.trim() || draft.country.trim().length < 2) {
      return 'Country must be at least 2 characters.';
    }
    if (!draft.dob) {
      return 'Date of birth is required.';
    }
    if (draft.dob > today) {
      return 'Date of birth cannot be in the future.';
    }
    return '';
  };

  const handleSaveProfile = async () => {
    const validationError = validateDraft();
    if (validationError) {
      setSaveState({ type: 'error', message: validationError });
      return;
    }

    setIsSaving(true);
    setSaveState({ type: '', message: '' });

    try {
      const response = await updateUserProfile(storedEmail, {
        name: draft.name.trim(),
        nickname: draft.nickname.trim(),
        dob: draft.dob,
        city: draft.city.trim(),
        country: draft.country.trim(),
        bio: draft.bio.trim(),
      });

      if (typeof window !== 'undefined') {
        localStorage.setItem('userName', response.user?.name || draft.name.trim());
        if (response.profile) {
          localStorage.setItem('userProfile', JSON.stringify(response.profile));
        }
      }

      setDraft(createDraft(response.user));
      setEditMode(false);
      setSaveState({ type: 'success', message: 'Account details saved to the database.' });
      refetch();
    } catch (saveError) {
      setSaveState({
        type: 'error',
        message: saveError instanceof Error ? saveError.message : 'Unable to save your account right now.',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== 'DELETE') {
      setSaveState({ type: 'error', message: 'Type DELETE to confirm account removal.' });
      return;
    }

    setIsDeleting(true);
    setSaveState({ type: '', message: '' });

    try {
      await deleteUserAccount(storedEmail);
      if (onLogout) {
        onLogout();
      }
    } catch (deleteError) {
      setSaveState({
        type: 'error',
        message: deleteError instanceof Error ? deleteError.message : 'Unable to delete your account right now.',
      });
      setIsDeleting(false);
    }
  };

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
                  <span className="profile-stat-label">XP This Level</span>
                </div>
              </div>
            </div>
          </div>

          <div className="profile-card profile-card--padded">
            <div className="profile-section-header">
              <MdPerson className="profile-section-icon" />
              <h2 className="profile-section-title">Personal Details</h2>
            </div>
            {editMode ? (
              <div className="profile-form">
                <div className="profile-form-grid">
                  <label className="profile-form-field">
                    <span>Full Name</span>
                    <input
                      type="text"
                      value={draft.name}
                      onChange={(event) => handleDraftChange('name', event.target.value)}
                      placeholder="Enter your full name"
                    />
                  </label>
                  <label className="profile-form-field">
                    <span>Nickname</span>
                    <input
                      type="text"
                      value={draft.nickname}
                      onChange={(event) => handleDraftChange('nickname', event.target.value)}
                      placeholder="Enter your nickname"
                    />
                  </label>
                  <label className="profile-form-field">
                    <span>Date of Birth</span>
                    <input
                      type="date"
                      max={today}
                      value={draft.dob}
                      onChange={(event) => handleDraftChange('dob', event.target.value)}
                    />
                  </label>
                  <label className="profile-form-field">
                    <span>City</span>
                    <input
                      type="text"
                      value={draft.city}
                      onChange={(event) => handleDraftChange('city', event.target.value)}
                      placeholder="Enter your city"
                    />
                  </label>
                  <label className="profile-form-field">
                    <span>Country</span>
                    <input
                      type="text"
                      value={draft.country}
                      onChange={(event) => handleDraftChange('country', event.target.value)}
                      placeholder="Enter your country"
                    />
                  </label>
                  <label className="profile-form-field profile-form-field--full">
                    <span>Email</span>
                    <input type="email" value={mergedProfile.email} disabled />
                  </label>
                  <label className="profile-form-field profile-form-field--full">
                    <span>Bio</span>
                    <textarea
                      rows="4"
                      value={draft.bio}
                      onChange={(event) => handleDraftChange('bio', event.target.value)}
                      placeholder="Write a short bio for your eco profile"
                    />
                  </label>
                </div>

                <div className="profile-form-actions">
                  <button type="button" onClick={handleEditToggle} className="profile-secondary-btn">
                    Cancel
                  </button>
                  <button type="button" onClick={handleSaveProfile} className="profile-edit-btn" disabled={isSaving}>
                    <MdEdit className="text-base" />
                    {isSaving ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </div>
            ) : (
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
            )}

            {!editMode ? (
              <button
                type="button"
                onClick={handleEditToggle}
                className="profile-edit-btn"
                disabled={isLoading}
              >
                <MdEdit className="text-base" />
                Edit Account
              </button>
            ) : null}

            <div
              className={`profile-edit-info ${
                saveState.type === 'error'
                  ? 'profile-edit-info--error'
                  : saveState.type === 'success'
                    ? 'profile-edit-info--success'
                    : editMode
                      ? 'profile-edit-info--active'
                      : 'profile-edit-info--inactive'
              }`}
            >
              {saveState.message ||
                error ||
                (editMode
                  ? 'Update your account details here. Saving will persist the changes in the database.'
                  : 'Profile values shown here are connected to the signed-in backend user and recent activity history.')}
            </div>

            <div className="profile-danger-zone">
              <div className="profile-danger-header">
                <MdDeleteForever className="profile-danger-icon" />
                <div>
                  <h3>Delete Account</h3>
                  <p>This permanently removes your account and its saved activity records from the database.</p>
                </div>
              </div>
              <label className="profile-form-field profile-form-field--full">
                <span>Type DELETE to confirm</span>
                <input
                  type="text"
                  value={deleteConfirmText}
                  onChange={(event) => setDeleteConfirmText(event.target.value)}
                  placeholder="DELETE"
                />
              </label>
              <button
                type="button"
                onClick={handleDeleteAccount}
                className="profile-danger-btn"
                disabled={isDeleting}
              >
                <MdDeleteForever />
                {isDeleting ? 'Deleting Account...' : 'Delete Account'}
              </button>
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
