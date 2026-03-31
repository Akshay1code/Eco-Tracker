import { useState } from 'react';
import TopBar from '../components/layout/TopBar.jsx';
import SectionHeader from '../components/shared/SectionHeader.jsx';
import ProgressBar from '../components/shared/ProgressBar.jsx';
import { GOALS_INIT } from '../data/mockData.js';

function GoalsView({ onLogout, activeTab = 'goals' }) {
  const [goals, setGoals] = useState(GOALS_INIT);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: '', desc: '', deadline: '', xp: 80 });

  const completeGoal = (id) => {
    const today = new Date().toISOString().slice(0, 10);
    setGoals((prev) =>
      prev.map((goal) =>
        goal.id === id ? { ...goal, done: true, progress: 100, completedAt: today } : goal
      )
    );
  };

  const submit = (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.deadline) return;

    setGoals((prev) => [
      {
        id: prev.length ? Math.max(...prev.map((goal) => goal.id)) + 1 : 1,
        title: form.title.trim(),
        desc: form.desc.trim() || 'Custom eco goal',
        progress: 0,
        deadline: form.deadline,
        xp: Number(form.xp) || 50,
        done: false,
        completedAt: null,
      },
      ...prev,
    ]);

    setForm({ title: '', desc: '', deadline: '', xp: 80 });
    setShowForm(false);
  };

  const activeGoals = goals.filter((goal) => !goal.done);
  const completedGoals = goals.filter((goal) => goal.done);

  return (
    <div>
      <TopBar activeTab={activeTab} onLogout={onLogout} />

      <SectionHeader title="Goals" subtitle="Build your long-term eco progression." />
      <button type="button" className="primary-btn" onClick={() => setShowForm((s) => !s)}>
        {showForm ? 'Close Form' : 'Add Goal'}
      </button>

      {showForm ? (
        <form className="card-white" style={{ padding: 16, marginTop: 12 }} onSubmit={submit}>
          <div className="form-grid-2">
            <label>
              <span>Title</span>
              <input value={form.title} onChange={(e) => setForm((old) => ({ ...old, title: e.target.value }))} />
            </label>
            <label>
              <span>Target Date</span>
              <input
                type="date"
                value={form.deadline}
                onChange={(e) => setForm((old) => ({ ...old, deadline: e.target.value }))}
              />
            </label>
          </div>

          <label style={{ marginTop: 12, display: 'block' }}>
            <span>Description</span>
            <input value={form.desc} onChange={(e) => setForm((old) => ({ ...old, desc: e.target.value }))} />
          </label>

          <label style={{ marginTop: 12, display: 'block' }}>
            <span>XP Reward</span>
            <input
              type="number"
              min="10"
              value={form.xp}
              onChange={(e) => setForm((old) => ({ ...old, xp: e.target.value }))}
            />
          </label>

          <button type="submit" className="primary-btn" style={{ marginTop: 12 }}>
            Save Goal
          </button>
        </form>
      ) : null}

      <SectionHeader title="Active Goals" />
      <div style={{ display: 'grid', gap: 10 }}>
        {activeGoals.map((goal) => (
          <article key={goal.id} className="card-white" style={{ padding: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, alignItems: 'center' }}>
              <div>
                <h3 style={{ color: 'var(--forest)' }}>{goal.title}</h3>
                <p style={{ color: 'var(--gray-600)', marginTop: 4 }}>{goal.desc}</p>
              </div>
              <span className="score-chip">+{goal.xp} XP</span>
            </div>

            <div style={{ marginTop: 10 }}>
              <ProgressBar value={goal.progress} color="linear-gradient(90deg, #22c55e, #6ee7b7)" height={10} />
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 10, alignItems: 'center' }}>
              <small style={{ color: 'var(--gray-600)' }}>Deadline: {goal.deadline}</small>
              <button type="button" className="mini-btn" onClick={() => completeGoal(goal.id)}>
                Mark Complete
              </button>
            </div>
          </article>
        ))}
      </div>

      <SectionHeader title="Completed Goals" />
      <div style={{ display: 'grid', gap: 10 }}>
        {completedGoals.map((goal) => (
          <article
            key={goal.id}
            className="card-white"
            style={{ padding: 14, opacity: 0.72, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
          >
            <div>
              <strong style={{ color: 'var(--forest)' }}>? {goal.title}</strong>
              <p style={{ color: 'var(--gray-600)', fontSize: 13 }}>Completed: {goal.completedAt}</p>
            </div>
            <span className="score-chip">+{goal.xp} XP</span>
          </article>
        ))}
      </div>
    </div>
  );
}

export default GoalsView;

