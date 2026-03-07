import { useState } from 'react';
import TopBar from '../components/layout/TopBar.jsx';
import SectionHeader from '../components/shared/SectionHeader.jsx';
import EmptyState from '../components/shared/EmptyState.jsx';
import { JOURNAL_INIT } from '../data/mockData.js';

const MOODS = ['\uD83C\uDF3F', '\uD83D\uDE0A', '\uD83C\uDF31', '\uD83C\uDF0D', '\u267B\uFE0F'];

function colorFromFootprint(value) {
  if (value <= 0.4) return '#16a34a';
  if (value <= 0.5) return '#f59e0b';
  return '#ef4444';
}

function JournalView({ onLogout, activeTab = 'journal' }) {
  const [entries, setEntries] = useState(JOURNAL_INIT);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ date: new Date().toISOString().slice(0, 10), mood: '\uD83C\uDF3F', text: '' });

  const submit = (e) => {
    e.preventDefault();
    if (!form.text.trim()) return;

    const footprint = Math.max(0.28, Math.min(0.62, 0.35 + Math.random() * 0.22));
    setEntries((prev) => [
      {
        id: prev.length ? Math.max(...prev.map((entry) => entry.id)) + 1 : 1,
        date: form.date,
        mood: form.mood,
        text: form.text.trim(),
        footprint,
      },
      ...prev,
    ]);

    setForm((old) => ({ ...old, text: '' }));
    setShowForm(false);
  };

  return (
    <div>
      <TopBar activeTab={activeTab} onLogout={onLogout} />

      <SectionHeader title="Eco Journal" subtitle="Capture daily reflections and footprint moments." />
      <button type="button" className="primary-btn" onClick={() => setShowForm((s) => !s)}>
        {showForm ? 'Close Form' : 'New Entry'}
      </button>

      {showForm ? (
        <form className="card-white" style={{ padding: 16, marginTop: 12 }} onSubmit={submit}>
          <div className="form-grid-2">
            <label>
              <span>Date</span>
              <input
                type="date"
                value={form.date}
                onChange={(e) => setForm((old) => ({ ...old, date: e.target.value }))}
              />
            </label>

            <div>
              <span>Mood</span>
              <div style={{ display: 'flex', gap: 8, marginTop: 8, flexWrap: 'wrap' }}>
                {MOODS.map((mood) => (
                  <button
                    key={mood}
                    type="button"
                    onClick={() => setForm((old) => ({ ...old, mood }))}
                    className={`mood-btn ${form.mood === mood ? 'active' : ''}`}
                  >
                    {mood}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <label style={{ marginTop: 12, display: 'block' }}>
            <span>Reflection</span>
            <textarea
              rows={4}
              value={form.text}
              onChange={(e) => setForm((old) => ({ ...old, text: e.target.value }))}
              placeholder="What eco action did you complete today?"
            />
          </label>

          <button type="submit" className="primary-btn" style={{ marginTop: 12 }}>
            Submit
          </button>
        </form>
      ) : null}

      <div style={{ marginTop: 14, display: 'grid', gap: 10 }}>
        {entries.length ? (
          entries.map((entry) => (
            <article
              key={entry.id}
              className="card-white"
              style={{
                padding: 14,
                borderLeft: `6px solid ${colorFromFootprint(entry.footprint)}`,
                borderTopLeftRadius: 0,
                borderBottomLeftRadius: 0,
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, alignItems: 'center' }}>
                <span className="date-pill">{entry.date}</span>
                <span style={{ fontSize: 22 }}>{entry.mood}</span>
              </div>
              <p style={{ marginTop: 8, color: 'var(--gray-600)' }}>{entry.text}</p>
              <div style={{ marginTop: 8 }}>
                <span className="score-chip">{entry.footprint.toFixed(2)} kg CO2</span>
              </div>
            </article>
          ))
        ) : (
          <EmptyState title="Start your eco journey" message="No journal entries yet." />
        )}
      </div>
    </div>
  );
}

export default JournalView;

