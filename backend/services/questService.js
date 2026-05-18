import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { findUserByUserId, syncUserProgress, syncUserCarbonFootprint } from '../models/userModel.js';
import { getDb, isFileStoreMode } from '../db.js';
import { updateStoredUserByEmailKey } from '../store/userStore.js';
import { mutateDailyRecord } from '../models/activityModel.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let questsDataset = null;
const QUEST_CARBON_REDUCTION_BY_DIFFICULTY = {
  easy: 0.2,
  medium: 0.3,
  hard: 0.4,
};

const FALLBACK_QUESTS = [
  {
    quest_id: 'fallback_walk',
    title: 'Short Walk',
    description: 'Walk instead of driving for a short trip.',
    category: 'transport',
    difficulty: 'easy',
    xp_reward: 15,
  },
  {
    quest_id: 'fallback_transit',
    title: 'Public Transit',
    description: 'Take public transit instead of a car today.',
    category: 'transport',
    difficulty: 'medium',
    xp_reward: 30,
  },
  {
    quest_id: 'fallback_meal',
    title: 'Meatless Meal',
    description: 'Enjoy a fully plant-based meal today.',
    category: 'food',
    difficulty: 'easy',
    xp_reward: 18,
  },
  {
    quest_id: 'fallback_linedry',
    title: 'Line Dry',
    description: 'Air dry your clothes instead of using a dryer.',
    category: 'energy',
    difficulty: 'medium',
    xp_reward: 35,
  },
  {
    quest_id: 'fallback_cleanup',
    title: 'Community Cleanup',
    description: 'Pick up trash in your neighborhood.',
    category: 'community',
    difficulty: 'hard',
    xp_reward: 60,
  },
  {
    quest_id: 'fallback_tree',
    title: 'Plant a Tree',
    description: 'Plant a tree or native plant.',
    category: 'nature',
    difficulty: 'hard',
    xp_reward: 75,
  },
];

function loadQuestsDataset() {
  if (!questsDataset) {
    const datasetPath = path.join(__dirname, '../data/quests_dataset.json');
    if (fs.existsSync(datasetPath)) {
      questsDataset = JSON.parse(fs.readFileSync(datasetPath, 'utf-8'));
    } else {
      questsDataset = FALLBACK_QUESTS;
    }
  }
  return questsDataset;
}

function getDayOfYear() {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  const diff = now - start;
  const oneDay = 1000 * 60 * 60 * 24;
  return Math.floor(diff / oneDay);
}

function normalizeLookupValue(value) {
  return typeof value === 'string' && value.trim() ? value.trim().toLowerCase() : '';
}

function getQuestCarbonReduction(quest = {}) {
  const difficultyKey = typeof quest.difficulty === 'string' ? quest.difficulty.trim().toLowerCase() : '';
  const reductionFromDifficulty = QUEST_CARBON_REDUCTION_BY_DIFFICULTY[difficultyKey];

  if (typeof reductionFromDifficulty === 'number') {
    return reductionFromDifficulty;
  }

  const rawReduction = Number(quest.carbon_reduction || 0);
  if (Number.isFinite(rawReduction) && rawReduction > 0) {
    return Number(rawReduction.toFixed(1));
  }

  return QUEST_CARBON_REDUCTION_BY_DIFFICULTY.easy;
}

function normalizeQuest(quest = {}, fallbackId = 'quest') {
  return {
    ...quest,
    quest_id: quest.quest_id || fallbackId,
    title: quest.title || 'Eco Quest',
    description: quest.description || quest.desc || 'Complete a positive eco habit today.',
    difficulty: quest.difficulty || 'easy',
    carbon_reduction: getQuestCarbonReduction(quest),
  };
}

export async function getDailyQuests(userId) {
  const user = await findUserByUserId(userId);
  if (!user) throw new Error('User not found');

  const today = new Date().toISOString().slice(0, 10);
  let userDailyQuests = user.dailyQuests || { date: '', assigned: [], completed: [] };

  if (userDailyQuests.date !== today) {
    const dataset = loadQuestsDataset();
    const dayOfYear = getDayOfYear();
    
    // Get quests for today (day 1-365)
    // Wrap around if dayOfYear > 365
    const targetDay = ((dayOfYear - 1) % 365) + 1;
    const daysQuests = dataset.filter(q => q.day_of_year === targetDay);
    
    // Randomly select 3
    const questPool = daysQuests.length ? daysQuests : FALLBACK_QUESTS;
    const shuffled = [...questPool].sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, 3).map((quest, index) =>
      normalizeQuest(quest, `D${String(targetDay).padStart(3, '0')}_Q${index + 1}`)
    );
    
    // Calculate streak
    let currentStreak = user.questStreak || 0;
    
    // If the last active date was yesterday, streak continues. Else, breaks.
    // We can infer last active date from the old dailyQuests.date
    if (userDailyQuests.date) {
      const lastDate = new Date(userDailyQuests.date);
      const todayDate = new Date(today);
      const diffTime = Math.abs(todayDate - lastDate);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      // Check if user completed ANY quests on the last active date
      if (diffDays > 1 || userDailyQuests.completed.length === 0) {
        currentStreak = 0;
      }
    }

    userDailyQuests = {
      date: today,
      assigned: selected,
      completed: []
    };

    // Save newly assigned quests and calculated streak
    const updateDoc = {
      $set: {
        dailyQuests: userDailyQuests,
        questStreak: currentStreak,
        updatedAt: new Date().toISOString()
      }
    };

    if (isFileStoreMode()) {
      await updateStoredUserByEmailKey(normalizeLookupValue(userId), (u) => ({
        ...u,
        dailyQuests: userDailyQuests,
        questStreak: currentStreak,
        updatedAt: new Date().toISOString()
      }));
    } else {
      await getDb().collection('users').updateOne(
        { emailKey: normalizeLookupValue(userId) },
        updateDoc
      );
    }
  }

  return {
    quests: (userDailyQuests.assigned || []).map((quest, index) =>
      normalizeQuest(quest, `assigned_${index + 1}`)
    ),
    completed: userDailyQuests.completed,
    streak: user.questStreak || 0
  };
}

export async function completeQuest(userId, questId) {
  const user = await findUserByUserId(userId);
  if (!user) throw new Error('User not found');

  const today = new Date().toISOString().slice(0, 10);
  const userDailyQuests = user.dailyQuests;

  if (!userDailyQuests || userDailyQuests.date !== today) {
    throw new Error('Daily quests not initialized or expired. Fetch quests first.');
  }

  if (userDailyQuests.completed.includes(questId)) {
    throw new Error('Quest already completed');
  }

  const quest = userDailyQuests.assigned.find(q => q.quest_id === questId);
  if (!quest) {
    throw new Error('Quest not assigned for today');
  }
  const normalizedQuest = normalizeQuest(quest, questId);

  let xpReward = normalizedQuest.xp_reward;
  const streak = user.questStreak || 0;
  
  if (streak >= 7) {
    xpReward += 15; // 7-day streak bonus
  }

  userDailyQuests.completed.push(questId);
  
  // Update if this is the first quest completed today and streak should increment
  let newStreak = streak;
  if (userDailyQuests.completed.length === 1) {
    newStreak += 1;
  }

  const carbonReduction = normalizedQuest.carbon_reduction;
  const newCarbonFootprint = Math.max(0, (user.carbonFootprint || 0) - carbonReduction);

  const timestamp = new Date().toISOString();
  
  if (isFileStoreMode()) {
    await updateStoredUserByEmailKey(normalizeLookupValue(userId), (u) => ({
      ...u,
      dailyQuests: userDailyQuests,
      questStreak: newStreak,
      carbonFootprint: newCarbonFootprint,
      updatedAt: timestamp
    }));
  } else {
    await getDb().collection('users').updateOne(
      { emailKey: normalizeLookupValue(userId) },
      {
        $set: {
          dailyQuests: userDailyQuests,
          questStreak: newStreak,
          carbonFootprint: newCarbonFootprint,
          updatedAt: timestamp
        }
      }
    );
  }

  // Sync XP
  const newXp = (user.score || 0) + xpReward;
  await syncUserProgress(userId, newXp);

  // Sync Carbon Footprint and calculate score
  const carbonResult = await syncUserCarbonFootprint(userId, newCarbonFootprint);

  const { record: updatedDailyRecord } = await mutateDailyRecord(userId, timestamp, (dailyRecord) => {
    dailyRecord.carbon_saved = Number((Number(dailyRecord.carbon_saved || 0) + carbonReduction).toFixed(6));

    const deviceCarbon = Number(dailyRecord.device_carbon_emission || 0);
    const chargingCarbon = Number(dailyRecord.charging_carbon_emission || 0);
    const transportCarbon = Number(dailyRecord.transport_carbon_emission || 0);
    const carbonSaved = Number(dailyRecord.carbon_saved || 0);

    const gross = Number((deviceCarbon + chargingCarbon + transportCarbon).toFixed(6));
    const net = Number(Math.max(0, gross - carbonSaved).toFixed(6));

    dailyRecord.gross_carbon_impact = gross;
    dailyRecord.net_carbon_impact = net;
    dailyRecord.carbon_emission = net;
    dailyRecord.updated_at = timestamp;
    dailyRecord.activity_logs = Array.isArray(dailyRecord.activity_logs) ? dailyRecord.activity_logs : [];
    dailyRecord.activity_logs.push({
      timestamp,
      activity: 'quest',
      source: 'daily_quest',
      quest_id: normalizedQuest.quest_id,
      quest_title: normalizedQuest.title,
      carbon_delta_kg: carbonReduction,
      carbon_direction: 'saved',
      net_impact_delta_kg: -carbonReduction,
      distance_moved: 0,
      cadence_spm: 0,
      confidence: 1,
    });

    if (dailyRecord.activity_logs.length > 50) {
      dailyRecord.activity_logs.splice(0, dailyRecord.activity_logs.length - 50);
    }

    return { updated: true };
  });

  return {
    quest_id: questId,
    carbon_reduction: carbonReduction,
    carbon_impact: -carbonReduction,
    xp_reward: xpReward,
    new_carbon_footprint: carbonResult.carbonFootprint,
    new_carbon_score: carbonResult.carbonScore,
    new_streak: newStreak,
    new_net_carbon_impact: updatedDailyRecord.net_carbon_impact,
    daily_record: updatedDailyRecord,
  };
}

export async function updateCarbonFootprint(userId, deltaKgCO2) {
  const user = await findUserByUserId(userId);
  if (!user) throw new Error('User not found');

  const newCarbonFootprint = Math.max(0, (user.carbonFootprint || 0) + deltaKgCO2);
  const carbonResult = await syncUserCarbonFootprint(userId, newCarbonFootprint);

  return {
    carbonFootprint: carbonResult.carbonFootprint,
    carbonScore: carbonResult.carbonScore
  };
}
