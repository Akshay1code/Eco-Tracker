import { useState } from 'react';
import { TODOS_INIT } from '../../data/mockData.js';
import { useXPSystem } from '../../hooks/useXPSystem.js';
import ProgressBar from '../shared/ProgressBar.jsx';

function EcoTodos({ userProgress }) {
  const { todos, xpPops, totalXP, level, levelPct, toggleTodo, addTodo } = useXPSystem(TODOS_INIT);
  const [text, setText] = useState('');
  const persistedLevel = userProgress?.level ?? level;
  const persistedXp = userProgress?.score ?? totalXP;
  const persistedLevelPct = userProgress?.levelProgressPct ?? levelPct;

  const onAdd = () => {
    addTodo(text, 25, '\uD83C\uDF3F');
    setText('');
  };

  return (
    <section className="card-white eco-todos">
      <div className="todo-head">
        <h3 style={{ color: 'var(--forest)', fontSize: 20 }}>Eco Quests</h3>
        <div className="todo-level">Level {persistedLevel}</div>
      </div>

      <div className="todo-progress">
        <div className="todo-xp-text">{persistedXp} XP collected</div>
        <ProgressBar value={persistedLevelPct} color="linear-gradient(90deg, #22c55e, #6ee7b7)" height={8} />
      </div>

      <div className="todo-list">
        {todos.map((todo) => (
          <label
            key={todo.id}
            className={`todo-item ${todo.done ? 'is-done task-done-anim' : ''}`}
          >
            <input className="todo-check" type="checkbox" checked={todo.done} onChange={() => toggleTodo(todo.id)} />
            <span className="todo-icon">{todo.icon}</span>
            <span className="todo-text">{todo.text}</span>
            <strong className="todo-reward">+{todo.xp} XP</strong>
          </label>
        ))}
      </div>

      <div className="todo-add-row">
        <input
          className="todo-add-input"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Add new eco quest"
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
