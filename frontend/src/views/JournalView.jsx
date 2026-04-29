import { useEffect, useMemo, useState } from 'react';
import {
  MdAutoAwesome,
  MdCloudQueue,
  MdEdit,
  MdInsights,
  MdMenuBook,
  MdMood,
  MdPark,
  MdPublic,
  MdSpa,
  MdToday,
  MdWbSunny,
} from 'react-icons/md';
import TopBar from '../components/layout/TopBar.jsx';
import useUserProfile from '../hooks/useUserProfile.js';
import { updateUserJournal } from '../lib/userApi.js';
import '../styles/gamification.css';

const MOOD_OPTIONS = [
  { value: 'grounded', label: 'Grounded', hint: 'Calm and intentional', Icon: MdSpa },
  { value: 'optimistic', label: 'Optimistic', hint: 'Small wins are adding up', Icon: MdWbSunny },
  { value: 'growing', label: 'Growing', hint: 'Learning as you go', Icon: MdPark },
  { value: 'aware', label: 'Aware', hint: 'Seeing the bigger picture', Icon: MdPublic },
];

const JOURNAL_PROMPTS = [
  'One greener choice I made today was...',
  'Something I noticed about my habits this week...',
  'Tomorrow I want to reduce my impact by...',
];

const MOOD_LOOKUP = MOOD_OPTIONS.reduce((lookup, option) => {
  lookup[option.value] = option;
  return lookup;
}, {});

const createInitialForm = () => ({
  date: new Date().toISOString().slice(0, 10),
  mood: MOOD_OPTIONS[0].value,
  text: '',
});

const getImpactClass = (val) => {
  if (val <= 0.2) return 'eco-good';
  if (val <= 0.4) return 'eco-mid';
  return 'eco-high';
};

const getImpactLabel = (val) => {
  if (val <= 0.2) return 'Low-impact day';
  if (val <= 0.4) return 'Balanced day';
  return 'Needs attention';
};

const getImpactMessage = (val) => {
  if (val <= 0.2) return 'Your habits stayed comfortably within a lighter footprint.';
  if (val <= 0.4) return 'You are moving in the right direction with room to refine.';
  return "This is a good reflection point for tomorrow's choices.";
};

const sortEntries = (journal = []) =>
  [...journal].sort((a, b) => new Date(b.date || 0).getTime() - new Date(a.date || 0).getTime());

const formatLongDate = (value) => {
  if (!value) return 'No date';
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return parsed.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
};

const getReflectionStreak = (journal = []) => {
  const uniqueDays = [...new Set(journal.map((entry) => entry.date).filter(Boolean))]
    .map((value) => new Date(`${value}T00:00:00`))
    .filter((date) => !Number.isNaN(date.getTime()))
    .sort((a, b) => b.getTime() - a.getTime());

  if (!uniqueDays.length) {
    return 0;
  }

  let streak = 1;
  for (let index = 1; index < uniqueDays.length; index += 1) {
    const previous = uniqueDays[index - 1];
    const current = uniqueDays[index];
    const diffInDays = Math.round((previous.getTime() - current.getTime()) / 86400000);
    if (diffInDays !== 1) {
      break;
    }
    streak += 1;
  }

  return streak;
};

const getMoodMeta = (value) => {
  if (MOOD_LOOKUP[value]) {
    return MOOD_LOOKUP[value];
  }

  if (typeof value === 'string' && /^[a-z\s-]+$/i.test(value.trim())) {
    return {
      value,
      label: value.trim(),
      hint: 'Saved from an earlier reflection',
      Icon: MdMood,
    };
  }

  return {
    value: 'reflective',
    label: 'Reflective',
    hint: 'Saved from an earlier reflection',
    Icon: MdMood,
  };
};

const getMoodCountLabel = (entries = []) => {
  if (!entries.length) {
    return 'No reflections yet';
  }

  const counts = entries.reduce((lookup, entry) => {
    const key = getMoodMeta(entry.mood).label;
    lookup[key] = (lookup[key] || 0) + 1;
    return lookup;
  }, {});

  const [label, total] = Object.entries(counts).sort((left, right) => right[1] - left[1])[0];
  return `${label} leads with ${total} note${total === 1 ? '' : 's'}`;
};

const getRecentCadence = (entries = []) => {
  if (!entries.length) {
    return 0;
  }

  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - 6);

  return entries.filter((entry) => {
    const parsed = new Date(`${entry.date || ''}T00:00:00`);
    return !Number.isNaN(parsed.getTime()) && parsed >= cutoff;
  }).length;
};

export default function JournalView({ onLogout, activeTab = 'journal' }) {
  const storedEmail = typeof window !== 'undefined' ? localStorage.getItem('userEmail') : null;
  const { user: userProfile, isLoading, error } = useUserProfile(storedEmail);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(createInitialForm);
  const [entries, setEntries] = useState([]);
  const [isSaving, setIsSaving] = useState(false);
  const [saveState, setSaveState] = useState({ type: '', message: '' });

  useEffect(() => {
    setEntries(sortEntries(userProfile?.journal || []));
  }, [userProfile]);

  const stats = useMemo(() => {
    const totalEntries = entries.length;
    const currentDate = new Date();
    const reflectionsThisMonth = entries.filter((entry) => {
      const parsed = new Date(entry.date || 0);
      return (
        !Number.isNaN(parsed.getTime()) &&
        parsed.getMonth() === currentDate.getMonth() &&
        parsed.getFullYear() === currentDate.getFullYear()
      );
    }).length;
    const averageImpact = totalEntries
      ? entries.reduce((sum, entry) => sum + (Number(entry.footprint) || 0), 0) / totalEntries
      : 0;
    const lowImpactDays = entries.filter((entry) => Number(entry.footprint) <= 0.2).length;
    const averageWords = totalEntries
      ? Math.round(
          entries.reduce(
            (sum, entry) => sum + (entry.text?.trim().split(/\s+/).filter(Boolean).length || 0),
            0
          ) / totalEntries
        )
      : 0;

    return {
      totalEntries,
      reflectionsThisMonth,
      averageImpact,
      lowImpactDays,
      averageWords,
      recentCadence: getRecentCadence(entries),
      leadingMood: getMoodCountLabel(entries),
      streak: getReflectionStreak(entries),
      latestEntry: entries[0] || null,
    };
  }, [entries]);

  const submit = async (event) => {
    event.preventDefault();
    if (!form.text.trim() || isSaving) return;

    setIsSaving(true);
    setSaveState({ type: '', message: '' });

    const footprint = Math.max(0.05, Math.min(0.6, 0.1 + Math.random() * 0.4));
    const newEntry = {
      id: entries.length ? Math.max(...entries.map((entry) => Number(entry.id) || 0)) + 1 : 1,
      date: form.date,
      mood: form.mood,
      text: form.text.trim(),
      footprint,
    };

    const updatedJournal = sortEntries([newEntry, ...entries]);

    try {
      await updateUserJournal(storedEmail, updatedJournal);
      setEntries(updatedJournal);
      setForm(createInitialForm());
      setShowForm(false);
      setSaveState({ type: 'success', message: 'Reflection saved to your eco journal.' });
    } catch (saveError) {
      console.error('Failed to sync journal entry', saveError);
      setSaveState({ type: 'error', message: 'Your reflection could not be saved right now.' });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="gamification-page">
      <TopBar activeTab={activeTab} onLogout={onLogout} />

      <header className="section-hero">
        <div>
          <span className="section-kicker">Reflection Studio</span>
          <h1 className="gamification-title">Eco Journal</h1>
          <p className="gamification-subtitle">
            Capture the habits, tradeoffs, and small environmental wins that shape your routine.
          </p>
        </div>

        <button className="toggle-form-btn" onClick={() => setShowForm((current) => !current)} type="button">
          {showForm ? 'Discard Entry' : <><MdEdit style={{ verticalAlign: 'middle', marginRight: '4px' }} /> New Reflection</>}
        </button>
      </header>

      <section className="insight-grid">
        <article className="insight-card insight-card-accent">
          <div className="insight-icon-shell">
            <MdMenuBook />
          </div>
          <div>
            <p className="insight-label">Reflection streak</p>
            <h2>{stats.streak} day{stats.streak === 1 ? '' : 's'}</h2>
            <p className="insight-copy">Keep the narrative going one meaningful note at a time.</p>
          </div>
        </article>

        <article className="insight-card">
          <div className="insight-content">
            <p className="insight-label">Entries logged</p>
            <h2>{stats.totalEntries}</h2>
            <p className="insight-copy">{stats.reflectionsThisMonth} reflections added this month.</p>
          </div>
        </article>

        <article className="insight-card">
          <div className="insight-content">
            <p className="insight-label">Average impact</p>
            <h2>{stats.averageImpact.toFixed(2)} kg</h2>
            <p className="insight-copy">A snapshot of the footprint attached to your recent reflections.</p>
          </div>
        </article>

        <article className="insight-card">
          <div className="insight-content">
            <p className="insight-label">Low-impact days</p>
            <h2>{stats.lowImpactDays}</h2>
            <p className="insight-copy">Days where your recorded impact stayed especially light.</p>
          </div>
        </article>
      </section>

      <section className="feature-panel-grid">
        <article className="feature-panel">
          <div className="feature-panel-header">
            <div>
              <span className="section-kicker">Latest Reflection</span>
              <h2 className="feature-panel-title">What your journal is saying</h2>
            </div>
            <MdInsights className="feature-panel-icon" />
          </div>

          {stats.latestEntry ? (
            <div className="feature-spotlight">
              <div className={`impact-pill ${getImpactClass(stats.latestEntry.footprint)}`}>
                {getImpactLabel(stats.latestEntry.footprint)}
              </div>
              <p className="feature-spotlight-text">"{stats.latestEntry.text}"</p>
              <p className="feature-spotlight-meta">
                {formatLongDate(stats.latestEntry.date)} and {getImpactMessage(stats.latestEntry.footprint)}
              </p>
            </div>
          ) : (
            <div className="feature-empty">
              <MdMood size="2rem" />
              <p>Your first reflection will unlock journal insights here.</p>
            </div>
          )}
        </article>

        <article className="feature-panel">
          <div className="feature-panel-header">
            <div>
              <span className="section-kicker">Prompt Bank</span>
              <h2 className="feature-panel-title">When you are not sure how to start</h2>
            </div>
            <MdAutoAwesome className="feature-panel-icon" />
          </div>

          <div className="prompt-chip-row">
            {JOURNAL_PROMPTS.map((prompt) => (
              <button
                key={prompt}
                className="prompt-chip"
                type="button"
                onClick={() => {
                  setShowForm(true);
                  setForm((current) => ({
                    ...current,
                    text: current.text ? current.text : prompt,
                  }));
                }}
              >
                {prompt}
              </button>
            ))}
          </div>
        </article>

        <article className="feature-panel">
          <div className="feature-panel-header">
            <div>
              <span className="section-kicker">Reflection Rhythm</span>
              <h2 className="feature-panel-title">What your recent pattern looks like</h2>
            </div>
            <MdToday className="feature-panel-icon" />
          </div>

          <div className="summary-stack">
            <div className="summary-inline-card">
              <strong>{stats.recentCadence}</strong>
              <span>reflections logged in the last 7 days</span>
            </div>
            <div className="summary-inline-card">
              <strong>{stats.averageWords}</strong>
              <span>average words per note</span>
            </div>
            <div className="summary-inline-card">
              <strong>{stats.leadingMood}</strong>
              <span>your most common reflection tone</span>
            </div>
          </div>
        </article>
      </section>

      {showForm && (
        <form className="premium-form-card" onSubmit={submit}>
          <div className="form-grid form-grid-split">
            <div className="input-group">
              <label className="input-label">Date of Reflection</label>
              <input
                type="date"
                className="premium-input"
                value={form.date}
                onChange={(event) => setForm({ ...form, date: event.target.value })}
              />
            </div>

            <div className="input-group">
              <label className="input-label">How does this day feel?</label>
              <div className="mood-selector mood-selector-expanded">
                {MOOD_OPTIONS.map(({ value, label, hint, Icon }) => (
                  <button
                    key={value}
                    type="button"
                    className={`mood-option-card ${form.mood === value ? 'active' : ''}`}
                    onClick={() => setForm({ ...form, mood: value })}
                  >
                    <Icon />
                    <strong>{label}</strong>
                    <span>{hint}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="input-group">
            <label className="input-label">Daily Wisdom and Actions</label>
            <textarea
              className="premium-textarea premium-textarea-tall"
              rows={5}
              placeholder="What changed today, and what would you like to repeat tomorrow?"
              value={form.text}
              onChange={(event) => setForm({ ...form, text: event.target.value })}
            />
            <div className="field-meta-row">
              <span>Write a short note about your choices, lessons, or tradeoffs.</span>
              <span>{form.text.trim().split(/\s+/).filter(Boolean).length} words</span>
            </div>
          </div>

          <div className="field-meta-card reflection-guide-card">
            <strong>Reflection guide</strong>
            <p>Try this flow: one action you took, one tradeoff you noticed, and one lighter choice to repeat tomorrow.</p>
          </div>

          <div className="form-actions-row">
            <button type="submit" className="complete-btn complete-btn-wide" disabled={isSaving}>
              {isSaving ? 'Saving Reflection...' : 'Preserve Memory'}
            </button>
          </div>
        </form>
      )}

      {saveState.message ? (
        <div className={`feedback-banner ${saveState.type === 'error' ? 'error' : 'success'}`}>{saveState.message}</div>
      ) : null}

      {error ? <div className="feedback-banner error">{error}</div> : null}

      <section className="section-block">
        <div className="section-heading-row">
          <div>
            <span className="section-kicker">Timeline</span>
            <h2 className="activity-section-title">Reflection archive</h2>
          </div>
          <span className="section-count">{entries.length} saved</span>
        </div>

        {entries.length > 0 ? (
          <div className="story-strip">
            {entries.slice(0, 3).map((entry) => {
              const mood = getMoodMeta(entry.mood);
              return (
                <article key={`story-${entry.id}`} className="story-strip-card">
                  <span className="story-strip-date">{formatLongDate(entry.date)}</span>
                  <strong>{mood.label}</strong>
                  <p>{entry.text}</p>
                </article>
              );
            })}
          </div>
        ) : null}

        <div className="journal-grid">
          {entries.length > 0 ? (
            entries.map((entry) => {
              const mood = getMoodMeta(entry.mood);
              const MoodIcon = mood.Icon;

              return (
                <article key={entry.id} className={`journal-card ${getImpactClass(entry.footprint)}`}>
                  <div className="journal-header">
                    <span className="journal-date-tag">
                      <MdToday style={{ verticalAlign: 'middle', marginRight: '4px' }} /> {formatLongDate(entry.date)}
                    </span>
                    <span className="journal-mood-badge">
                      <MoodIcon />
                      {mood.label}
                    </span>
                  </div>
                  <p className="journal-text">{entry.text}</p>
                  <div className="journal-footer">
                    <div className="impact-chip">
                      <MdCloudQueue /> {Number(entry.footprint || 0).toFixed(2)} kg CO2 impact
                    </div>
                    <span className="journal-word-count">
                      {entry.text?.trim().split(/\s+/).filter(Boolean).length || 0} words
                    </span>
                  </div>
                </article>
              );
            })
          ) : (
            <div className="empty-collection-card">
              <MdMood size="3rem" />
              <h3>{isLoading ? 'Loading your journal...' : 'Your journal is still blank'}</h3>
              <p>Start with one honest note about a greener choice you made today.</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
