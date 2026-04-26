import { useState } from 'react';
import { MdAdd, MdCheck, MdTrendingUp, MdFlag, MdTimer } from 'react-icons/md';
import TopBar from '../components/layout/TopBar.jsx';
import useUserProfile from '../hooks/useUserProfile.js';
import { updateUserGoals } from '../lib/userApi.js';
import '../styles/gamification.css';

export default function GoalsView({ onLogout, activeTab = 'goals' }) {
  const storedEmail = typeof window !== 'undefined' ? localStorage.getItem('userEmail') : null;
  const { user: userProfile, isLoading: isUserLoading } = useUserProfile(storedEmail);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: '', desc: '', deadline: '', xp: 200 });

  const goals = userProfile?.goals || [];

  const completeGoal = async (id) => {
    const today = new Date().toISOString().slice(0, 10);
    const updatedGoals = goals.map((goal) =>
      goal.id === id ? { ...goal, done: true, progress: 100, completedAt: today } : goal
    );
    try {
      await updateUserGoals(storedEmail, updatedGoals);
    } catch (e) {
      console.error('Failed to sync goal completion', e);
    }
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.deadline) return;

    const newGoal = {
      id: goals.length ? Math.max(...goals.map((goal) => goal.id)) + 1 : 1,
      title: form.title.trim(),
      desc: form.desc.trim() || 'Custom eco quest',
      progress: 0,
      deadline: form.deadline,
      xp: Number(form.xp) || 100,
      done: false,
      completedAt: null,
    };

    const updatedGoals = [newGoal, ...goals];
    try {
      await updateUserGoals(storedEmail, updatedGoals);
      setForm({ title: '', desc: '', deadline: '', xp: 200 });
      setShowForm(false);
    } catch (err) {
      console.error('Failed to save new quest', err);
    }
  };

  const activeGoals = goals.filter((goal) => !goal.done);
  const completedGoals = goals.filter((goal) => goal.done);

  return (
    <div className="gamification-page">
      <TopBar activeTab={activeTab} onLogout={onLogout} />

      <header>
        <h1 className="gamification-title">Eco Quests</h1>
        <p className="gamification-subtitle">Define your path to sustainability and earn rare rewards.</p>
        
        <button className="toggle-form-btn" onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Cancel Mission' : <><MdAdd style={{ verticalAlign: 'middle', marginRight: '4px' }} /> Start New Quest</>}
        </button>
      </header>

      {showForm && (
        <form className="premium-form-card" onSubmit={submit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="input-group">
              <label className="input-label">Quest Title</label>
              <input 
                className="premium-input" 
                placeholder="e.g. 50km Bike Ride"
                value={form.title} 
                onChange={(e) => setForm({ ...form, title: e.target.value })} 
              />
            </div>
            <div className="input-group">
              <label className="input-label">Deadline</label>
              <input 
                type="date" 
                className="premium-input" 
                value={form.deadline} 
                onChange={(e) => setForm({ ...form, deadline: e.target.value })} 
              />
            </div>
          </div>

          <div className="input-group">
            <label className="input-label">Mission Description</label>
            <input 
              className="premium-input" 
              placeholder="What specific actions are required?"
              value={form.desc} 
              onChange={(e) => setForm({ ...form, desc: e.target.value })} 
            />
          </div>

          <div className="input-group">
            <label className="input-label">XP Potentail</label>
            <input 
              type="number" 
              className="premium-input" 
              value={form.xp} 
              onChange={(e) => setForm({ ...form, xp: e.target.value })} 
            />
          </div>

          <button type="submit" className="complete-btn" style={{ width: '100%', padding: '1rem' }}>
            Accept Quest
          </button>
        </form>
      )}

      <section>
        <h2 className="activity-section-title" style={{ marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <MdFlag color="var(--eco-mid)" /> Active Missions
        </h2>
        <div className="quest-list">
          {activeGoals.map((quest) => (
            <article key={quest.id} className="quest-card">
              <div className="quest-header">
                <div className="quest-info">
                  <h3>{quest.title}</h3>
                  <p>{quest.desc}</p>
                </div>
                <span className="xp-badge">+{quest.xp} XP</span>
              </div>
              
              <div className="quest-progress-bar">
                <div className="quest-progress-fill" style={{ width: `${quest.progress}%` }} />
              </div>
              
              <div className="quest-footer">
                <span className="quest-date"><MdTimer style={{ verticalAlign: 'middle', marginRight: '4px' }} /> Target: {quest.deadline}</span>
                <button className="complete-btn" onClick={() => completeGoal(quest.id)}>
                  Claim Mastery
                </button>
              </div>
            </article>
          ))}
          {activeGoals.length === 0 && <p style={{ opacity: 0.5, textAlign: 'center', padding: '2rem' }}>All current quests accomplished. New challenges await.</p>}
        </div>
      </section>

      {completedGoals.length > 0 && (
        <section style={{ marginTop: '3rem' }}>
          <h2 className="activity-section-title" style={{ marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem', opacity: 0.7 }}>
            <MdCheck color="var(--eco-mid)" /> Hall of Fame
          </h2>
          <div className="quest-list">
            {completedGoals.map((quest) => (
              <article key={quest.id} className="quest-card completed">
                <div className="quest-header">
                  <div className="quest-info">
                    <h3>{quest.title}</h3>
                    <p>Completed on {quest.completedAt}</p>
                  </div>
                  <span className="xp-badge" style={{ backgroundColor: 'var(--eco-surface)', color: 'var(--eco-mid)' }}>+{quest.xp} XP</span>
                </div>
              </article>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

