import { ObjectId } from 'mongodb';
import { getDb, isFileStoreMode } from '../db.js';
import { WELCOME_XP } from '../constants.js';
import { buildProgressionSnapshot } from '../services/progression.js';
import {
  findStoredUserByEmailKey,
  findStoredUserByIdentifier,
  findStoredUserByNicknameKey,
  insertStoredUser,
  listStoredUsers,
  updateStoredUserByEmailKey,
} from '../store/userStore.js';

const USERS_COLLECTION = 'users';

function getUsersCollection() {
  return getDb().collection(USERS_COLLECTION);
}

function normalizeLookupValue(value) {
  return typeof value === 'string' && value.trim() ? value.trim().toLowerCase() : '';
}

function createDefaultSettings() {
  return {
    notifications: {
      reminders: true,
      streak: true,
      community: false,
    },
    unit: 'kg CO2',
  };
}

function normalizeUserSettings(settings = {}, existingSettings = createDefaultSettings()) {
  const mergedSettings = {
    ...createDefaultSettings(),
    ...(existingSettings || {}),
    ...(settings || {}),
  };

  return {
    notifications: {
      ...createDefaultSettings().notifications,
      ...(existingSettings?.notifications || {}),
      ...(settings?.notifications || {}),
    },
    unit: mergedSettings.unit === 'lbs CO2' ? 'lbs CO2' : 'kg CO2',
  };
}

function sanitizeUserDocument(document) {
  if (!document) {
    return null;
  }

  return {
    id: document._id instanceof ObjectId ? document._id.toString() : String(document._id || ''),
    name: document.name,
    nickname: document.nickname,
    dob: document.dob,
    city: document.city,
    country: document.country,
    email: document.email,
    bio: document.bio || '',
    rank: document.rank || 'guardian',
    score: typeof document.score === 'number' ? document.score : WELCOME_XP,
    level: typeof document.level === 'number' ? document.level : buildProgressionSnapshot(document.score).level,
    levelProgressPct:
      typeof document.levelProgressPct === 'number'
        ? document.levelProgressPct
        : buildProgressionSnapshot(document.score).levelProgressPct,
    badges: Array.isArray(document.badges) ? document.badges : [],
    goals: Array.isArray(document.goals) ? document.goals : [],
    journal: Array.isArray(document.journal) ? document.journal : [],
    settings: normalizeUserSettings(document.settings),
    createdAt: document.createdAt,
    updatedAt: document.updatedAt,
  };
}

export async function ensureUserIndexes() {
  if (isFileStoreMode()) {
    return;
  }

  const collection = getUsersCollection();
  await collection.createIndex({ emailKey: 1 }, { unique: true, name: 'uniq_user_email' });
  await collection.createIndex({ nicknameKey: 1 }, { unique: true, sparse: true, name: 'uniq_user_nickname' });
  await collection.createIndex({ nameKey: 1 }, { sparse: true, name: 'idx_user_name' });
}

export async function findUserByEmail(email) {
  const emailKey = normalizeLookupValue(email);
  if (!emailKey) {
    return null;
  }

  if (isFileStoreMode()) {
    return findStoredUserByEmailKey(emailKey);
  }

  return getUsersCollection().findOne({ emailKey });
}

export async function findUserByNickname(nickname) {
  const nicknameKey = normalizeLookupValue(nickname);
  if (!nicknameKey) {
    return null;
  }

  if (isFileStoreMode()) {
    return findStoredUserByNicknameKey(nicknameKey);
  }

  return getUsersCollection().findOne({ nicknameKey });
}

export async function findExistingSignupUser(email, nickname) {
  const [emailUser, nicknameUser] = await Promise.all([findUserByEmail(email), findUserByNickname(nickname)]);

  if (emailUser) {
    return {
      field: 'email',
      user: emailUser,
    };
  }

  if (nicknameUser) {
    return {
      field: 'nickname',
      user: nicknameUser,
    };
  }

  return null;
}

export async function findUserByIdentifier(identifier) {
  const key = normalizeLookupValue(identifier);
  if (!key) {
    return null;
  }

  if (isFileStoreMode()) {
    return findStoredUserByIdentifier(key);
  }

  return getUsersCollection().findOne({
    $or: [{ emailKey: key }, { nicknameKey: key }, { nameKey: key }],
  });
}

export async function findUserByUserId(userId) {
  const userKey = normalizeLookupValue(userId);
  if (!userKey) {
    return null;
  }

  if (isFileStoreMode()) {
    return findStoredUserByEmailKey(userKey);
  }

  return getUsersCollection().findOne({ emailKey: userKey });
}

export async function createUser(userData) {
  const timestamp = new Date().toISOString();
  const progression = buildProgressionSnapshot(WELCOME_XP, [], timestamp);
  const document = {
    name: userData.name.trim(),
    nickname: userData.nickname.trim(),
    dob: userData.dob,
    city: userData.city.trim(),
    country: userData.country.trim(),
    email: userData.email.trim().toLowerCase(),
    bio: typeof userData.bio === 'string' ? userData.bio.trim() : '',
    emailKey: normalizeLookupValue(userData.email),
    nicknameKey: normalizeLookupValue(userData.nickname),
    nameKey: normalizeLookupValue(userData.name),
    passwordHash: userData.passwordHash,
    passwordSalt: userData.passwordSalt,
    rank: 'guardian',
    score: progression.score,
    level: progression.level,
    levelProgressPct: progression.levelProgressPct,
    badges: progression.badges,
    goals: Array.isArray(userData.goals) ? userData.goals : [],
    journal: Array.isArray(userData.journal) ? userData.journal : [],
    settings: normalizeUserSettings(userData.settings),
    createdAt: timestamp,
    updatedAt: timestamp,
  };

  if (isFileStoreMode()) {
    return insertStoredUser(document);
  }

  const result = await getUsersCollection().insertOne(document);
  return {
    ...document,
    _id: result.insertedId,
  };
}

export async function listUsersForLeaderboard() {
  if (isFileStoreMode()) {
    return listStoredUsers();
  }

  return getUsersCollection()
    .find(
      {},
      {
        projection: {
          name: 1,
          nickname: 1,
          city: 1,
          country: 1,
          email: 1,
          bio: 1,
          emailKey: 1,
          rank: 1,
          score: 1,
          level: 1,
          levelProgressPct: 1,
          badges: 1,
          settings: 1,
          createdAt: 1,
          updatedAt: 1,
        },
      }
    )
    .toArray();
}

export async function syncUserProgress(userId, totalXp) {
  const timestamp = new Date().toISOString();
  const existingUser = await findUserByUserId(userId);
  if (!existingUser) {
    throw new Error('User not found for progression sync.');
  }

  const progression = buildProgressionSnapshot(totalXp, existingUser.badges, timestamp);

  if (isFileStoreMode()) {
    await updateStoredUserByEmailKey(normalizeLookupValue(userId), (currentUser) => ({
      ...currentUser,
      score: progression.score,
      level: progression.level,
      levelProgressPct: progression.levelProgressPct,
      badges: progression.badges,
      updatedAt: timestamp,
    }));
  } else {
    await getUsersCollection().updateOne(
      { emailKey: normalizeLookupValue(userId) },
      {
        $set: {
          score: progression.score,
          level: progression.level,
          levelProgressPct: progression.levelProgressPct,
          badges: progression.badges,
          updatedAt: timestamp,
        },
      }
    );
  }

  return {
    ...existingUser,
    ...progression,
    updatedAt: timestamp,
  };
}

export async function updateUserProfileSettings(userId, profileData = {}) {
  const existingUser = await findUserByUserId(userId);
  if (!existingUser) {
    throw new Error('User not found.');
  }

  const timestamp = new Date().toISOString();
  const nextName =
    typeof profileData.name === 'string' && profileData.name.trim().length >= 2
      ? profileData.name.trim()
      : existingUser.name;
  const nextBio = typeof profileData.bio === 'string' ? profileData.bio.trim() : existingUser.bio || '';
  const nextSettings = normalizeUserSettings(profileData.settings, existingUser.settings);

  if (isFileStoreMode()) {
    await updateStoredUserByEmailKey(normalizeLookupValue(userId), (currentUser) => ({
      ...currentUser,
      name: nextName,
      nameKey: normalizeLookupValue(nextName),
      bio: nextBio,
      settings: nextSettings,
      updatedAt: timestamp,
    }));
  } else {
    await getUsersCollection().updateOne(
      { emailKey: normalizeLookupValue(userId) },
      {
        $set: {
          name: nextName,
          nameKey: normalizeLookupValue(nextName),
          bio: nextBio,
          settings: nextSettings,
          updatedAt: timestamp,
        },
      }
    );
  }

  return {
    ...existingUser,
    name: nextName,
    bio: nextBio,
    settings: nextSettings,
    updatedAt: timestamp,
  };
}

export async function saveUserGoals(userId, goals = []) {
  const timestamp = new Date().toISOString();
  if (isFileStoreMode()) {
    await updateStoredUserByEmailKey(normalizeLookupValue(userId), (currentUser) => ({
      ...currentUser,
      goals,
      updatedAt: timestamp,
    }));
  } else {
    await getUsersCollection().updateOne(
      { emailKey: normalizeLookupValue(userId) },
      { $set: { goals, updatedAt: timestamp } }
    );
  }
  return goals;
}

export async function saveUserJournal(userId, journal = []) {
  const timestamp = new Date().toISOString();
  if (isFileStoreMode()) {
    await updateStoredUserByEmailKey(normalizeLookupValue(userId), (currentUser) => ({
      ...currentUser,
      journal,
      updatedAt: timestamp,
    }));
  } else {
    await getUsersCollection().updateOne(
      { emailKey: normalizeLookupValue(userId) },
      { $set: { journal, updatedAt: timestamp } }
    );
  }
  return journal;
}

export function isDuplicateUserError(error) {
  return Boolean(error && typeof error === 'object' && error.code === 11000);
}

export function getDuplicateUserMessage(error) {
  const keyPattern = error?.keyPattern || {};

  if (keyPattern.emailKey) {
    return 'An account with that email already exists.';
  }

  if (keyPattern.nicknameKey) {
    return 'That nickname is already taken.';
  }

  return 'An account with those details already exists.';
}

export function toPublicUser(document) {
  return sanitizeUserDocument(document);
}
