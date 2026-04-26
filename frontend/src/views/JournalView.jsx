import { useState } from 'react';
import { MdEdit, MdToday, MdMood, MdCloudQueue } from 'react-icons/md';
import TopBar from '../components/layout/TopBar.jsx';
import useUserProfile from '../hooks/useUserProfile.js';
import { updateUserJournal } from '../lib/userApi.js';
import '../styles/gamification.css';

const MOODS = ['🌿', '😊', '🌱', '🌍', '♻️'];

const getImpactClass = (val) => {
  if (val <= 0.2) return 'eco-good';
  if (val <= 0.4) return 'eco-mid';
  return 'eco-high';
};

export default function JournalView({ onLogout, activeTab = 'journal' }) {
  const storedEmail = typeof window !== 'undefined' ? localStorage.getItem('userEmail') : null;
  const { user: userProfile } = useUserProfile(storedEmail);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ date: new Date().toISOString().slice(0, 10), mood: '🌿', text: '' });

  const entries = userProfile?.journal || [];

  const submit = async (e) => {
    e.preventDefault();
    if (!form.text.trim()) return;

    const footprint = Math.max(0.05, Math.min(0.6, 0.1 + Math.random() * 0.4));
    const newEntry = {
      id: entries.length ? Math.max(...entries.map((entry) => entry.id)) + 1 : 1,
      date: form.date,
      mood: form.mood,
      text: form.text.trim(),
      footprint,
    };

    const updatedJournal = [newEntry, ...entries];
    try {
      await updateUserJournal(storedEmail, updatedJournal);
      setForm({ date: new Date().toISOString().slice(0, 10), mood: '🌿', text: '' });
      setShowForm(false);
    } catch (err) {
      console.error('Failed to sync journal entry', err);
    }
  };

  return (
    <div className="gamification-page">
      <TopBar activeTab={activeTab} onLogout={onLogout} />

      <header>
        <h1 className="gamification-title">Eco Journal</h1>
        <p className="gamification-subtitle">Chronicle your daily reflections and environmental impact.</p>
        
        <button className="toggle-form-btn" onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Discard Entry' : <><MdEdit style={{ verticalAlign: 'middle', marginRight: '4px' }} /> New Reflection</>}
        </button>
      </header>

      {showForm && (
        <form className="premium-form-card" onSubmit={submit}>
          <div className="input-group">
            <label className="input-label">Date of Reflection</label>
            <input 
              type="date" 
              className="premium-input" 
              value={form.date} 
              onChange={(e) => setForm({ ...form, date: e.target.value })} 
            />
          </div>

          <div className="input-group">
            <label className="input-label">How are you feeling about your impact?</label>
            <div className="mood-selector">
              {MOODS.map((m) => (
                <button
                  key={m}
                  type="button"
                  className={`mood-pill ${form.mood === m ? 'active' : ''}`}
                  onClick={() => setForm({ ...form, mood: m })}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>

          <div className="input-group">
            <label className="input-label">Daily Wisdom & Actions</label>
            <textarea 
              className="premium-textarea" 
              rows={4} 
              placeholder="What did you learn today? Which habits did you improve?"
              value={form.text} 
              onChange={(e) => setForm({ ...form, text: e.target.value })} 
            />
          </div>

          <button type="submit" className="complete-btn" style={{ width: '100%', padding: '1rem' }}>
            Preserve Memory
          </button>
        </form>
      )}

      <div className="journal-grid">
        {entries.length > 0 ? (
          entries.map((entry) => (
            <article key={entry.id} className={`journal-card ${getImpactClass(entry.footprint)}`}>
              <div className="journal-header">
                <span className="journal-date-tag"><MdToday style={{ verticalAlign: 'middle', marginRight: '4px' }} /> {entry.date}</span>
                <span className="journal-mood">{entry.mood}</span>
              </div>
              <p className="journal-text">{entry.text}</p>
              <div className="journal-footer">
                <div className="impact-chip">
                  <MdCloudQueue /> {entry.footprint.toFixed(2)} kg CO₂ Impact
                </div>
              </div>
            </article>
          ))
        ) : (
          <div style={{ textAlign: 'center', padding: '4rem', opacity: 0.5 }}>
            <MdMood size="3rem" style={{ marginBottom: '1rem' }} />
            <p>Your journal is empty. What's one eco-friendly thing you did today?</p>
          </div>
        )}
      </div>
    </div>
  );
}
