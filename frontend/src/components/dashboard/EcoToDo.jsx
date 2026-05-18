import React, { useState } from 'react';

const initialTasks = [
    { id: 1, text: 'Walk instead of driving', xp: 40, completed: false },
    { id: 2, text: 'Use public transport', xp: 30, completed: false },
    { id: 3, text: 'Reduce device usage', xp: 15, completed: false },
    { id: 4, text: 'Plant a tree 🌱', xp: 50, completed: false },
    { id: 5, text: 'Use reusable water bottle', xp: 20, completed: false },
];

const EcoToDo = () => {
    const [tasks, setTasks] = useState(initialTasks);
    const [animations, setAnimations] = useState([]);

    const handleToggle = (id, xp, e) => {
        const task = tasks.find(t => t.id === id);
        if (task.completed) return; // Only allow one-way completion for this demo

        const rect = e.currentTarget.getBoundingClientRect();
        const newAnimId = Date.now();

        // Create floating XP animation
        setAnimations(prev => [...prev, {
            id: newAnimId,
            xp,
            x: e.clientX - rect.left + 20,
            y: e.clientY - rect.top - 10
        }]);

        setTasks(prev => prev.map(t =>
            t.id === id ? { ...t, completed: true } : t
        ));

        // Remove animation after 1s
        setTimeout(() => {
            setAnimations(prev => prev.filter(anim => anim.id !== newAnimId));
        }, 1000);
    };

    return (
        <div className="eco-card" style={{ padding: '1.5rem', position: 'relative' }}>
            <h3 style={{ color: 'var(--forest-green)', marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>Daily Eco Tasks</span>
                <span style={{ fontSize: '0.8rem', background: 'var(--mint-green)', padding: '0.2rem 0.6rem', borderRadius: '12px', color: 'var(--forest-green)' }}>
                    {tasks.filter(t => t.completed).length}/{tasks.length} Done
                </span>
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                {tasks.map(t => (
                    <label
                        key={t.id}
                        className={t.completed ? 'green-glow' : ''}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            padding: '1rem',
                            borderRadius: '12px',
                            border: '1px solid rgba(167, 243, 208, 0.4)',
                            cursor: t.completed ? 'default' : 'pointer',
                            transition: 'background 0.3s, transform 0.2s',
                            background: t.completed ? 'rgba(34, 197, 94, 0.05)' : 'white'
                        }}
                        onMouseEnter={(e) => {
                            if (!t.completed) e.currentTarget.style.transform = 'translateY(-2px)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'translateY(0)';
                        }}
                        onClick={(e) => {
                            e.preventDefault(); // Handle in the wrapper to get coordinates easily
                            handleToggle(t.id, t.xp, e);
                        }}
                    >
                        <div style={{
                            width: '24px', height: '24px', borderRadius: '6px',
                            border: `2px solid ${t.completed ? 'var(--leaf-green)' : '#cbd5e1'}`,
                            background: t.completed ? 'var(--leaf-green)' : 'transparent',
                            marginRight: '1rem',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            transition: 'all 0.2s'
                        }}>
                            {t.completed && <span style={{ color: 'white', fontSize: '14px' }}>✓</span>}
                        </div>

                        <div style={{ flex: 1, textDecoration: t.completed ? 'line-through' : 'none', color: t.completed ? 'var(--text-muted)' : 'var(--text-main)', opacity: t.completed ? 0.6 : 1 }}>
                            {t.text}
                        </div>

                        <div style={{ color: t.completed ? 'var(--text-muted)' : 'var(--leaf-green)', fontWeight: 'bold' }}>
                            +{t.xp} XP
                        </div>
                    </label>
                ))}
            </div>

            {animations.map(anim => (
                <div key={anim.id} className="xp-float" style={{ left: anim.x, top: anim.y }}>
                    +{anim.xp} XP
                </div>
            ))}
        </div>
    );
};

export default EcoToDo;
