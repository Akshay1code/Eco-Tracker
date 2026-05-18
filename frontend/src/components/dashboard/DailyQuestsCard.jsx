import React, { useEffect, useState } from 'react';
import { fetchDailyQuests, completeDailyQuest } from '../../lib/userApi.js';
import './DailyQuestsCard.css';

const difficultyColors = {
  easy: 'var(--green-500, #22c55e)',
  medium: 'var(--yellow-500, #eab308)',
  hard: 'var(--red-500, #ef4444)',
};

function formatCarbonReduction(value) {
  return Number(value || 0).toFixed(1);
}

function DailyQuestsCard({ userId, onQuestCompleted }) {
  const [quests, setQuests] = useState([]);
  const [completed, setCompleted] = useState([]);
  const [streak, setStreak] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!userId) return;

    const loadQuests = async () => {
      try {
        setLoading(true);
        const { data } = await fetchDailyQuests(userId);
        setQuests(data.quests);
        setCompleted(data.completed);
        setStreak(data.streak);
      } catch {
        setError('Failed to load daily quests.');
      } finally {
        setLoading(false);
      }
    };

    loadQuests();
  }, [userId]);

  const handleComplete = async (questId) => {
    try {
      const { data } = await completeDailyQuest(userId, questId);
      setCompleted([...completed, questId]);
      setStreak(data.new_streak);

      if (onQuestCompleted) {
        onQuestCompleted(data);
      }
    } catch (err) {
      alert(err.message || 'Failed to complete quest');
    }
  };

  if (loading) return <div className="card-white p-4">Loading quests...</div>;
  if (error) return <div className="card-white p-4 text-red-500">{error}</div>;

  return (
    <section className="card-white daily-quests-card">
      <div className="daily-quests-header">
        <h3 className="text-xl text-forest font-bold mb-2">Daily Eco Quests</h3>
        <div className="streak-badge">
          Streak: {streak} {streak >= 7 && '(+15 XP Bonus!)'}
        </div>
      </div>

      <div className="quests-list">
        {quests.map((quest) => {
          const isCompleted = completed.includes(quest.quest_id);
          return (
            <div key={quest.quest_id} className={`quest-item ${isCompleted ? 'completed' : ''}`}>
              <div className="quest-info">
                <div className="quest-title-row">
                  <h4>{quest.title}</h4>
                  <span className="quest-difficulty" style={{ backgroundColor: difficultyColors[quest.difficulty] }}>
                    {quest.difficulty}
                  </span>
                </div>
                <p className="quest-desc">{quest.description}</p>
                <div className="quest-rewards">
                  <span className="reward-xp">+{quest.xp_reward} XP</span>
                  <span className="reward-co2">-{formatCarbonReduction(quest.carbon_reduction)} kgCO2</span>
                </div>
              </div>
              <div className="quest-action">
                <button
                  className={`quest-btn ${isCompleted ? 'done' : ''}`}
                  onClick={() => !isCompleted && handleComplete(quest.quest_id)}
                  disabled={isCompleted}
                >
                  {isCompleted ? 'Completed' : 'Complete'}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

export default DailyQuestsCard;
