import { useEffect, useMemo, useState } from 'react';
import {
  MdAdd,
  MdFlag,
  MdLocalFireDepartment,
  MdStars,
  MdTimer,
  MdTrackChanges,
  MdTrendingUp,
} from 'react-icons/md';
import TopBar from '../components/layout/TopBar.jsx';
import useUserProfile from '../hooks/useUserProfile.js';
import { updateUserGoals } from '../lib/userApi.js';
import '../styles/gamification.css';

const GOAL_TEMPLATES = [
  {
    title: 'Greener commute week',
    desc: 'Replace at least three car rides with cycling, walking, or public transport.',
    xp: 180,
    deadlineOffsetDays: 7,
  },
  {
    title: 'Low-waste kitchen reset',
    desc: 'Meal plan, reuse containers, and avoid single-use packaging for one full week.',
    xp: 220,
    deadlineOffsetDays: 10,
  },
  {
    title: 'Home energy tune-up',
    desc: 'Audit lights, chargers, and cooling habits to reduce avoidable electricity use.',
    xp: 250,
    deadlineOffsetDays: 14,
  },
];

const createInitialForm = () => ({
  title: '',
  desc: '',
  deadline: '',
  xp: 200,
});

const clampProgress = (value) => Math.max(0, Math.min(100, Number(value) || 0));

const sortGoals = (goals = []) =>
  [...goals].sort((left, right) => {
    if (left.done !== right.done) {
      return left.done ? 1 : -1;
    }

    const leftDate = new Date((left.done ? left.completedAt : left.deadline) || 0).getTime();
    const rightDate = new Date((right.done ? right.completedAt : right.deadline) || 0).getTime();

    if (left.done && right.done) {
      return rightDate - leftDate;
    }

    return leftDate - rightDate;
  });

const formatLongDate = (value) => {
  if (!value) return 'No date';
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return parsed.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
};

const getFutureDate = (offsetDays) => {
  const date = new Date();
  date.setDate(date.getDate() + offsetDays);
  return date.toISOString().slice(0, 10);
};

const getDaysRemaining = (deadline) => {
  if (!deadline) return null;
  const end = new Date(`${deadline}T00:00:00`);
  const today = new Date();
  const start = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  if (Number.isNaN(end.getTime())) return null;
  return Math.ceil((end.getTime() - start.getTime()) / 86400000);
};

const getGoalStatus = (goal) => {
  if (goal.done) {
    return { label: 'Completed', tone: 'success', detail: `Finished on ${formatLongDate(goal.completedAt)}` };
  }

  const daysRemaining = getDaysRemaining(goal.deadline);
  if (daysRemaining === null) {
    return { label: 'No deadline', tone: 'neutral', detail: 'Add a date to keep this goal visible.' };
  }

  if (daysRemaining < 0) {
    return {
      label: 'Overdue',
      tone: 'danger',
      detail: `${Math.abs(daysRemaining)} day${Math.abs(daysRemaining) === 1 ? '' : 's'} past target`,
    };
  }

  if (daysRemaining === 0) {
    return { label: 'Due today', tone: 'warn', detail: 'A good day to close this out.' };
  }

  if (daysRemaining <= 3) {
    return {
      label: 'Due soon',
      tone: 'warn',
      detail: `${daysRemaining} day${daysRemaining === 1 ? '' : 's'} left to finish`,
    };
  }

  return {
    label: 'On track',
    tone: 'success',
    detail: `${daysRemaining} day${daysRemaining === 1 ? '' : 's'} remaining`,
  };
};

export default function GoalsView({ onLogout, activeTab = 'goals' }) {
  const storedEmail = typeof window !== 'undefined' ? localStorage.getItem('userEmail') : null;
  const { user: userProfile, isLoading: isUserLoading, error } = useUserProfile(storedEmail);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(createInitialForm);
  const [goals, setGoals] = useState([]);
  const [saveState, setSaveState] = useState({ type: '', message: '' });
  const [isSavingForm, setIsSavingForm] = useState(false);
  const [pendingGoalId, setPendingGoalId] = useState(null);

  useEffect(() => {
    setGoals(sortGoals(userProfile?.goals || []));
  }, [userProfile]);

  const syncGoals = async (updatedGoals, successMessage, goalId = null) => {
    setPendingGoalId(goalId);
    setSaveState({ type: '', message: '' });

    try {
      await updateUserGoals(storedEmail, updatedGoals);
      setGoals(sortGoals(updatedGoals));
      setSaveState({ type: 'success', message: successMessage });
    } catch (saveError) {
      console.error('Failed to sync goals', saveError);
      setSaveState({ type: 'error', message: 'Goal changes could not be saved right now.' });
    } finally {
      setPendingGoalId(null);
    }
  };

  const completeGoal = async (id) => {
    const today = new Date().toISOString().slice(0, 10);
    const updatedGoals = goals.map((goal) =>
      goal.id === id ? { ...goal, done: true, progress: 100, completedAt: today } : goal
    );
    await syncGoals(updatedGoals, 'Quest completed and added to your hall of fame.', id);
  };

  const updateGoalProgress = async (id, nextProgress) => {
    const progress = clampProgress(nextProgress);
    const today = new Date().toISOString().slice(0, 10);
    const updatedGoals = goals.map((goal) => {
      if (goal.id !== id) {
        return goal;
      }

      return {
        ...goal,
        progress,
        done: progress >= 100,
        completedAt: progress >= 100 ? today : null,
      };
    });

    await syncGoals(updatedGoals, progress >= 100 ? 'Quest completed and progress updated.' : 'Quest progress updated.', id);
  };

  const submit = async (event) => {
    event.preventDefault();
    if (!form.title.trim() || !form.deadline || isSavingForm) return;

    setIsSavingForm(true);
    setSaveState({ type: '', message: '' });

    const newGoal = {
      id: goals.length ? Math.max(...goals.map((goal) => Number(goal.id) || 0)) + 1 : 1,
      title: form.title.trim(),
      desc: form.desc.trim() || 'Custom eco quest',
      progress: 0,
      deadline: form.deadline,
      xp: Number(form.xp) || 100,
      done: false,
      completedAt: null,
    };

    const updatedGoals = sortGoals([newGoal, ...goals]);

    try {
      await updateUserGoals(storedEmail, updatedGoals);
      setGoals(updatedGoals);
      setForm(createInitialForm());
      setShowForm(false);
      setSaveState({ type: 'success', message: 'A new eco quest has been added to your board.' });
    } catch (saveError) {
      console.error('Failed to save new quest', saveError);
      setSaveState({ type: 'error', message: 'Your new quest could not be saved right now.' });
    } finally {
      setIsSavingForm(false);
    }
  };

  const activeGoals = useMemo(() => goals.filter((goal) => !goal.done), [goals]);
  const completedGoals = useMemo(() => goals.filter((goal) => goal.done), [goals]);

  const stats = useMemo(() => {
    const averageProgress = activeGoals.length
      ? Math.round(activeGoals.reduce((sum, goal) => sum + clampProgress(goal.progress), 0) / activeGoals.length)
      : 0;
    const dueSoonCount = activeGoals.filter((goal) => {
      const daysRemaining = getDaysRemaining(goal.deadline);
      return daysRemaining !== null && daysRemaining >= 0 && daysRemaining <= 7;
    }).length;
    const overdueCount = activeGoals.filter((goal) => {
      const daysRemaining = getDaysRemaining(goal.deadline);
      return daysRemaining !== null && daysRemaining < 0;
    }).length;
    const earnedXp = completedGoals.reduce((sum, goal) => sum + (Number(goal.xp) || 0), 0);

    return {
      averageProgress,
      dueSoonCount,
      overdueCount,
      earnedXp,
    };
  }, [activeGoals, completedGoals]);

  return (
    <div className="gamification-page">
      <TopBar activeTab={activeTab} onLogout={onLogout} />

      <header className="section-hero">
        <div>
          <span className="section-kicker">Quest Board</span>
          <h1 className="gamification-title">Eco Quests</h1>
          <p className="gamification-subtitle">
            Turn your sustainability goals into clear missions with deadlines, milestones, and momentum.
          </p>
        </div>

        <button className="toggle-form-btn" onClick={() => setShowForm((current) => !current)} type="button">
          {showForm ? 'Cancel Mission' : <><MdAdd style={{ verticalAlign: 'middle', marginRight: '4px' }} /> Start New Quest</>}
        </button>
      </header>

      <section className="insight-grid">
        <article className="insight-card insight-card-accent">
          <div className="insight-icon-shell">
            <MdFlag />
          </div>
          <div>
            <p className="insight-label">Active missions</p>
            <h2>{activeGoals.length}</h2>
            <p className="insight-copy">{stats.dueSoonCount} due within the next week.</p>
          </div>
        </article>

        <article className="insight-card">
          <div className="insight-content">
            <p className="insight-label">Average progress</p>
            <h2>{stats.averageProgress}%</h2>
            <p className="insight-copy">A quick read on how far your active goals have moved.</p>
          </div>
        </article>

        <article className="insight-card">
          <div className="insight-content">
            <p className="insight-label">Overdue goals</p>
            <h2>{stats.overdueCount}</h2>
            <p className="insight-copy">Use these as your next opportunities to recover momentum.</p>
          </div>
        </article>

        <article className="insight-card">
          <div className="insight-content">
            <p className="insight-label">XP earned</p>
            <h2>{stats.earnedXp}</h2>
            <p className="insight-copy">Rewards collected from the quests you have already finished.</p>
          </div>
        </article>
      </section>

      <section className="feature-panel-grid">
        <article className="feature-panel">
          <div className="feature-panel-header">
            <div>
              <span className="section-kicker">Fast Start</span>
              <h2 className="feature-panel-title">Pick a quest template</h2>
            </div>
            <MdStars className="feature-panel-icon" />
          </div>

          <div className="prompt-chip-row">
            {GOAL_TEMPLATES.map((template) => (
              <button
                key={template.title}
                className="prompt-chip"
                type="button"
                onClick={() => {
                  setShowForm(true);
                  setForm({
                    title: template.title,
                    desc: template.desc,
                    deadline: getFutureDate(template.deadlineOffsetDays),
                    xp: template.xp,
                  });
                }}
              >
                {template.title}
              </button>
            ))}
          </div>
        </article>

        <article className="feature-panel">
          <div className="feature-panel-header">
            <div>
              <span className="section-kicker">Momentum Tip</span>
              <h2 className="feature-panel-title">Progress works best in small checkpoints</h2>
            </div>
            <MdTrendingUp className="feature-panel-icon" />
          </div>

          <div className="feature-spotlight feature-spotlight-soft">
            <p className="feature-spotlight-text">
              Update your progress when you hit 25%, 50%, or 75% so the board stays honest and motivating.
            </p>
            <p className="feature-spotlight-meta">
              Goals that feel visible are much easier to keep moving than goals that stay vague.
            </p>
          </div>
        </article>
      </section>

      {showForm && (
        <form className="premium-form-card" onSubmit={submit}>
          <div className="form-grid form-grid-split">
            <div className="input-group">
              <label className="input-label">Quest Title</label>
              <input
                className="premium-input"
                placeholder="e.g. Bike to work three times this week"
                value={form.title}
                onChange={(event) => setForm({ ...form, title: event.target.value })}
              />
            </div>
            <div className="input-group">
              <label className="input-label">Deadline</label>
              <input
                type="date"
                className="premium-input"
                value={form.deadline}
                onChange={(event) => setForm({ ...form, deadline: event.target.value })}
              />
            </div>
          </div>

          <div className="input-group">
            <label className="input-label">Mission Description</label>
            <textarea
              className="premium-textarea"
              rows={4}
              placeholder="Describe the concrete actions that would make this goal complete."
              value={form.desc}
              onChange={(event) => setForm({ ...form, desc: event.target.value })}
            />
          </div>

          <div className="form-grid form-grid-split">
            <div className="input-group">
              <label className="input-label">XP Potential</label>
              <input
                type="number"
                className="premium-input"
                value={form.xp}
                min="50"
                step="10"
                onChange={(event) => setForm({ ...form, xp: event.target.value })}
              />
            </div>

            <div className="input-group">
              <label className="input-label">Suggested structure</label>
              <div className="field-meta-card">
                Choose a measurable action, a visible deadline, and one milestone you can mark mid-week.
              </div>
            </div>
          </div>

          <div className="form-actions-row">
            <button type="submit" className="complete-btn complete-btn-wide" disabled={isSavingForm}>
              {isSavingForm ? 'Creating Quest...' : 'Accept Quest'}
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
            <span className="section-kicker">Active Board</span>
            <h2 className="activity-section-title">Current missions</h2>
          </div>
          <span className="section-count">{activeGoals.length} active</span>
        </div>

        <div className="quest-list">
          {activeGoals.map((quest) => {
            const status = getGoalStatus(quest);
            const progress = clampProgress(quest.progress);

            return (
              <article key={quest.id} className="quest-card">
                <div className="quest-header">
                  <div className="quest-info">
                    <div className="quest-title-row">
                      <h3>{quest.title}</h3>
                      <span className={`status-pill ${status.tone}`}>{status.label}</span>
                    </div>
                    <p>{quest.desc}</p>
                  </div>
                  <span className="xp-badge">+{quest.xp} XP</span>
                </div>

                <div className="quest-progress-meta">
                  <span>{progress}% complete</span>
                  <span>{status.detail}</span>
                </div>

                <div className="quest-progress-bar">
                  <div className="quest-progress-fill" style={{ width: `${progress}%` }} />
                </div>

                <div className="quest-progress-actions">
                  {[25, 50, 75, 100].map((step) => (
                    <button
                      key={step}
                      className={`progress-chip ${progress >= step ? 'active' : ''}`}
                      type="button"
                      disabled={pendingGoalId === quest.id}
                      onClick={() => updateGoalProgress(quest.id, step)}
                    >
                      {step}%
                    </button>
                  ))}
                </div>

                <div className="quest-footer">
                  <span className="quest-date">
                    <MdTimer style={{ verticalAlign: 'middle', marginRight: '4px' }} />
                    Target: {formatLongDate(quest.deadline)}
                  </span>

                  <button
                    className="complete-btn"
                    type="button"
                    disabled={pendingGoalId === quest.id}
                    onClick={() => completeGoal(quest.id)}
                  >
                    {pendingGoalId === quest.id ? 'Saving...' : 'Claim Mastery'}
                  </button>
                </div>
              </article>
            );
          })}

          {activeGoals.length === 0 && (
            <div className="empty-collection-card">
              <MdTrackChanges size="3rem" />
              <h3>{isUserLoading ? 'Loading your quests...' : 'No active quests yet'}</h3>
              <p>Start with one measurable change that you can finish this week.</p>
            </div>
          )}
        </div>
      </section>

      {completedGoals.length > 0 && (
        <section className="section-block">
          <div className="section-heading-row">
            <div>
              <span className="section-kicker">Completed</span>
              <h2 className="activity-section-title">Hall of fame</h2>
            </div>
            <span className="section-count">{completedGoals.length} cleared</span>
          </div>

          <div className="quest-list">
            {completedGoals.map((quest) => (
              <article key={quest.id} className="quest-card completed">
                <div className="quest-header">
                  <div className="quest-info">
                    <div className="quest-title-row">
                      <h3>{quest.title}</h3>
                      <span className="status-pill success">
                        <MdLocalFireDepartment />
                        Finished
                      </span>
                    </div>
                    <p>Completed on {formatLongDate(quest.completedAt)} with {quest.xp} XP earned.</p>
                  </div>
                  <span className="xp-badge xp-badge-muted">+{quest.xp} XP</span>
                </div>
              </article>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
