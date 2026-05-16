import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { findUserByUserId, syncUserProgress } from '../models/userModel.js';
import { getDb, isFileStoreMode } from '../db.js';
import { updateStoredUserByEmailKey } from '../store/userStore.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let questsDataset = null;

function loadQuestsDataset() {
  if (!questsDataset) {
    const datasetPath = path.join(__dirname, '../data/quests_dataset.json');
    if (fs.existsSync(datasetPath)) {
      questsDataset = JSON.parse(fs.readFileSync(datasetPath, 'utf-8'));
    } else {
      questsDataset = [];
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
    const shuffled = daysQuests.sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, 3);
    
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
    quests: userDailyQuests.assigned,
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

  let xpReward = quest.xp_reward;
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

  const newCarbonFootprint = Math.max(0, (user.carbonFootprint || 0) - quest.carbon_reduction);

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

  return {
    quest_id: questId,
    carbon_reduction: quest.carbon_reduction,
    xp_reward: xpReward,
    new_carbon_footprint: newCarbonFootprint,
    new_streak: newStreak
  };
}

export async function updateCarbonFootprint(userId, deltaKgCO2) {
  const user = await findUserByUserId(userId);
  if (!user) throw new Error('User not found');

  const newCarbonFootprint = Math.max(0, (user.carbonFootprint || 0) + deltaKgCO2);
  const timestamp = new Date().toISOString();

  if (isFileStoreMode()) {
    await updateStoredUserByEmailKey(normalizeLookupValue(userId), (u) => ({
      ...u,
      carbonFootprint: newCarbonFootprint,
      updatedAt: timestamp
    }));
  } else {
    await getDb().collection('users').updateOne(
      { emailKey: normalizeLookupValue(userId) },
      {
        $set: {
          carbonFootprint: newCarbonFootprint,
          updatedAt: timestamp
        }
      }
    );
  }

  return { carbonFootprint: newCarbonFootprint };
}
