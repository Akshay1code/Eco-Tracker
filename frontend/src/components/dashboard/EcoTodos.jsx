import { useState } from 'react';
import { updateUserGoals } from '../../lib/userApi.js';
import ProgressBar from '../shared/ProgressBar.jsx';

function EcoTodos({ userProgress }) {
  const [inputText, setInputText] = useState('');
  const [xpPops, setXpPops] = useState([]);

  const goals = userProgress?.goals || [];
  const storedEmail = typeof window !== 'undefined' ? localStorage.getItem('userEmail') : null;

  const toggleGoal = async (id) => {
    const updatedGoals = goals.map((g) => {
      if (g.id === id) {
        const nextDone = !g.done;
        if (nextDone) {
          const popId = `${Date.now()}-${id}`;
          setXpPops((old) => [...old, { id: popId, xp: g.xp }]);
          setTimeout(() => setXpPops((old) => old.filter((p) => p.id !== popId)), 1100);
        }
        return { ...g, done: nextDone, progress: nextDone ? 100 : 0 };
      }
      return g;
    });

    try {
      await updateUserGoals(storedEmail, updatedGoals);
    } catch (e) {
      console.error('Failed to toggle goal', e);
    }
  };

  const onAdd = async () => {
    if (!inputText.trim()) return;

    const newGoal = {
      id: goals.length ? Math.max(...goals.map((g) => g.id)) + 1 : 1,
      title: inputText.trim(),
      desc: 'Quick dashboard quest',
      xp: 25,
      done: false,
      progress: 0,
      deadline: new Date().toISOString().slice(0, 10),
    };

    try {
      await updateUserGoals(storedEmail, [newGoal, ...goals]);
      setInputText('');
    } catch (e) {
      console.error('Failed to add goal', e);
    }
  };

  return (
    <section className="card-white eco-todos">
      <div className="todo-head">
        <h3 style={{ color: 'var(--forest)', fontSize: 20 }}>Eco Quests</h3>
        <div className="todo-level">Level {userProgress?.level || 1}</div>
      </div>

      <div className="todo-progress">
        <div className="todo-xp-text">{userProgress?.score || 0} XP collected</div>
        <ProgressBar value={userProgress?.levelProgressPct || 0} color="linear-gradient(90deg, #22c55e, #6ee7b7)" height={8} />
      </div>

      <div className="todo-list">
        {goals.map((goal) => (
          <label
            key={goal.id}
            className={`todo-item ${goal.done ? 'is-done task-done-anim' : ''}`}
          >
            <input 
              className="todo-check" 
              type="checkbox" 
              checked={goal.done} 
              onChange={() => toggleGoal(goal.id)} 
            />
            <span className="todo-icon">🌿</span>
            <span className="todo-text">{goal.title}</span>
            <strong className="todo-reward">+{goal.xp} XP</strong>
          </label>
        ))}
        {goals.length === 0 && <p style={{ color: 'var(--gray-600)', fontSize: 13, textAlign: 'center', padding: '1rem' }}>No active quests. Add one below!</p>}
      </div>

      <div className="todo-add-row">
        <input
          className="todo-add-input"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="New eco quest..."
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              onAdd();
            }
          }}
        />
        <button type="button" className="primary-btn todo-add-btn" onClick={onAdd}>
          Add
        </button>
      </div>

      <div className="todo-pop-wrap">
        {xpPops.map((pop) => (
          <div key={pop.id} className="xp-pop todo-pop">
            +{pop.xp} XP
          </div>
        ))}
      </div>
    </section>
  );
}

export default EcoTodos;
