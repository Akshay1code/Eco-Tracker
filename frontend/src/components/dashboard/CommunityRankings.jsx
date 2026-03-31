import React, { useState } from 'react';

const ProfileModal = ({ user, onClose }) => {
    if (!user) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <button className="close-btn" onClick={onClose}>&times;</button>
                <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                    <div style={{ fontSize: '4rem', marginBottom: '0.5rem' }}>{user.avatar}</div>
                    <h2 style={{ color: 'var(--forest-green)', margin: 0 }}>{user.name}</h2>
                    <div style={{ color: 'var(--leaf-green)', fontWeight: 'bold' }}>{user.badge}</div>
                </div>

                <div style={{ background: 'rgba(250, 204, 21, 0.1)', padding: '1rem', borderRadius: '12px', marginBottom: '1.5rem', fontStyle: 'italic', color: 'var(--text-muted)', textAlign: 'center' }}>
                    "{user.bio}"
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                    <div style={{ textAlign: 'center', padding: '1rem', background: '#f9fafb', borderRadius: '12px' }}>
                        <div style={{ color: 'var(--text-muted)' }}>Carbon Score</div>
                        <strong style={{ color: 'var(--forest-green)', fontSize: '1.2rem' }}>{user.score} kg</strong>
                    </div>
                    <div style={{ textAlign: 'center', padding: '1rem', background: '#f9fafb', borderRadius: '12px' }}>
                        <div style={{ color: 'var(--text-muted)' }}>XP Points</div>
                        <strong style={{ color: 'var(--soft-yellow)', fontSize: '1.2rem' }}>{user.xp} 🌿</strong>
                    </div>
                </div>

                <h4 style={{ color: 'var(--forest-green)', marginBottom: '0.5rem' }}>Eco Achievements</h4>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    <span style={{ padding: '0.4rem 0.8rem', background: 'var(--mint-green)', borderRadius: '20px', fontSize: '0.9rem' }}>Zero Waste Day</span>
                    <span style={{ padding: '0.4rem 0.8rem', background: 'var(--mint-green)', borderRadius: '20px', fontSize: '0.9rem' }}>Public Transit Pro</span>
                    <span style={{ padding: '0.4rem 0.8rem', background: 'var(--mint-green)', borderRadius: '20px', fontSize: '0.9rem' }}>Tree Planter</span>
                </div>
            </div>
        </div>
    );
};

const users = [
    { id: 1, name: 'GreenWarrior', avatar: '🧑‍🌾', score: '0.18', xp: 1540, badge: '🏆 Planet Protector', bio: 'Walking instead of driving whenever possible. Small steps for a greener planet 🌍' },
    { id: 2, name: 'NatureLover99', avatar: '👩‍🌾', score: '0.22', xp: 1320, badge: '🌳 Earth Guardian', bio: 'Composting everything I can and loving it.' },
    { id: 3, name: 'EcoWalker', avatar: '🏃', score: '0.26', xp: 980, badge: '🌿 Eco Walker', bio: 'Switched to electric and biking to work.' },
    { id: 4, name: 'FreshStart', avatar: '🌱', score: '0.35', xp: 450, badge: '🌱 Seedling', bio: 'Just starting my journey to reduce my footprint.' },
];

const CommunityRankings = () => {
    const [selectedUser, setSelectedUser] = useState(null);

    return (
        <div className="eco-card" style={{ padding: '1.5rem' }}>
            <h3 style={{ color: 'var(--forest-green)', marginBottom: '1rem', display: 'flex', justifyContent: 'space-between' }}>
                <span>Global Community</span>
                <span style={{ fontSize: '0.9rem', color: 'var(--leaf-green)', cursor: 'pointer' }}>View All</span>
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {users.map((u, i) => (
                    <div
                        key={u.id}
                        onClick={() => setSelectedUser(u)}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            padding: '0.8rem',
                            borderRadius: '16px',
                            border: '1px solid rgba(167, 243, 208, 0.2)',
                            cursor: 'pointer',
                            transition: 'transform 0.2s, box-shadow 0.2s',
                            background: i === 0 ? 'linear-gradient(to right, rgba(250, 204, 21, 0.1), transparent)' : 'transparent'
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'translateX(5px)';
                            e.currentTarget.style.boxShadow = '0 5px 15px rgba(34, 197, 94, 0.1)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'translateX(0)';
                            e.currentTarget.style.boxShadow = 'none';
                        }}
                    >
                        <div style={{ fontSize: '1.5rem', marginRight: '1rem', width: '30px', textAlign: 'center' }}>
                            {i === 0 ? '🏅' : `#${i + 1}`}
                        </div>
                        <div style={{ fontSize: '2rem', marginRight: '1rem' }}>{u.avatar}</div>
                        <div style={{ flex: 1 }}>
                            <div style={{ fontWeight: 'bold', color: 'var(--text-main)' }}>{u.name}</div>
                            <div style={{ fontSize: '0.8rem', color: 'var(--leaf-green)' }}>{u.badge}</div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                            <div style={{ fontWeight: 'bold', color: 'var(--forest-green)' }}>{u.score} kg</div>
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{u.xp} XP</div>
                        </div>
                    </div>
                ))}
            </div>

            <ProfileModal user={selectedUser} onClose={() => setSelectedUser(null)} />
        </div>
    );
};

export default CommunityRankings;
