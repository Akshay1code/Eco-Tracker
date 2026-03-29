import { randomBytes, scryptSync, timingSafeEqual } from 'node:crypto';
import {
  createUser,
  findExistingSignupUser,
  findUserByIdentifier,
  findUserByUserId,
  getDuplicateUserMessage,
  isDuplicateUserError,
  listUsersForLeaderboard,
  toPublicUser,
  updateUserProfileSettings,
} from '../models/userModel.js';
import { listActivityRecordsForLeaderboard } from '../models/activityModel.js';
import { WELCOME_XP } from '../constants.js';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const LEADERBOARD_LIMIT = 50;
const LEADERBOARD_BADGES = [
  { minXp: 1500, badge: 'protector' },
  { minXp: 900, badge: 'guardian' },
  { minXp: 500, badge: 'walker' },
  { minXp: 0, badge: 'seedling' },
];

function createProfile(user) {
  return {
    name: user.name,
    nickname: user.nickname,
    dob: user.dob,
    city: user.city,
    country: user.country,
    bio: user.bio || '',
    rank: user.rank || 'guardian',
    level: user.level || 1,
    badges: Array.isArray(user.badges) ? user.badges : [],
    settings: user.settings || {},
  };
}

function hashPassword(password, salt = randomBytes(16).toString('hex')) {
  const hashBuffer = scryptSync(password, salt, 64);
  return {
    passwordSalt: salt,
    passwordHash: hashBuffer.toString('hex'),
  };
}

function verifyPassword(password, passwordSalt, passwordHash) {
  if (!passwordSalt || !passwordHash) {
    return false;
  }

  const derivedBuffer = scryptSync(password, passwordSalt, 64);
  const storedBuffer = Buffer.from(passwordHash, 'hex');

  return storedBuffer.length === derivedBuffer.length && timingSafeEqual(storedBuffer, derivedBuffer);
}

function validateProfileField(label, value) {
  if (typeof value !== 'string' || value.trim().length < 2) {
    return `${label} must be at least 2 characters.`;
  }

  return '';
}

function validateSignupPayload(payload) {
  const today = new Date().toISOString().slice(0, 10);

  return (
    validateProfileField('Name', payload.name) ||
    validateProfileField('Nickname', payload.nickname) ||
    validateProfileField('City', payload.city) ||
    validateProfileField('Country', payload.country) ||
    (!payload.dob ? 'Date of birth is required.' : '') ||
    (payload.dob && payload.dob > today ? 'Date of birth cannot be in the future.' : '') ||
    (!EMAIL_RE.test((payload.email || '').trim()) ? 'Enter a valid email address.' : '') ||
    (!payload.password || payload.password.length < 8 ? 'Password must be at least 8 characters.' : '') ||
    (payload.confirmPassword !== payload.password ? 'Passwords must match.' : '')
  );
}

function getParam(source, key) {
  if (!source) {
    return null;
  }

  if (typeof source.get === 'function') {
    return source.get(key);
  }

  const value = source[key];
  return Array.isArray(value) ? value[0] : value;
}

function clampLeaderboardLimit(rawValue) {
  const value = Number(rawValue);
  if (!Number.isFinite(value) || value <= 0) {
    return LEADERBOARD_LIMIT;
  }

  return Math.min(Math.floor(value), LEADERBOARD_LIMIT);
}

function roundMetric(value, digits = 2) {
  return Number((Number(value) || 0).toFixed(digits));
}

function getRecentDateRange(days = 7) {
  const dates = [];
  const today = new Date();

  for (let index = days - 1; index >= 0; index -= 1) {
    const date = new Date(today);
    date.setDate(today.getDate() - index);
    dates.push(date.toISOString().slice(0, 10));
  }

  return dates;
}

function inferBadge(rank, xp) {
  return LEADERBOARD_BADGES.find((entry) => xp >= entry.minXp)?.badge || 'seedling';
}

function buildUserBio(user) {
  const location = [user.city, user.country].filter(Boolean).join(', ');
  if (location) {
    return `Eco tracker from ${location}.`;
  }

  return 'Building a greener routine one day at a time.';
}

function normalizeUserId(value) {
  return typeof value === 'string' && value.trim() ? value.trim().toLowerCase() : '';
}

function calculateStreak(records) {
  const activityDates = new Set(
    records
      .filter(
        (record) =>
          Number(record.steps || 0) > 0 ||
          Number(record.active_time || 0) > 0 ||
          Number(record.activity_distance || 0) > 0 ||
          Number(record.carbon_emission || 0) > 0
      )
      .map((record) => record.date)
  );

  let streak = 0;
  const cursor = new Date();

  while (activityDates.has(cursor.toISOString().slice(0, 10))) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }

  return streak;
}

function summarizeLeaderboardUser(user, records, recentDates) {
  const recordsByDate = new Map(records.map((record) => [record.date, record]));
  const weekly = recentDates.map((date) => roundMetric(recordsByDate.get(date)?.carbon_emission || 0));
  const nonZeroWeekly = weekly.filter((value) => value > 0);
  const latestCarbon = nonZeroWeekly[nonZeroWeekly.length - 1] || 0;
  const averageCarbon = nonZeroWeekly.length
    ? roundMetric(nonZeroWeekly.reduce((sum, value) => sum + value, 0) / nonZeroWeekly.length)
    : roundMetric(latestCarbon);
  const activityXp = records.reduce((sum, record) => sum + Number(record.xp_earned || 0), 0);
  const xp = Math.max(Number(user.score || 0), WELCOME_XP + activityXp);
  const trend = weekly.length >= 2 && weekly[weekly.length - 1] <= weekly[0] ? 'up' : 'down';

  return {
    id: user.emailKey || user.email?.toLowerCase() || user.nickname?.toLowerCase() || user.name,
    name: user.nickname || user.name || 'Eco User',
    score: averageCarbon,
    latestCarbon: roundMetric(latestCarbon),
    xp,
    level: typeof user.level === 'number' ? user.level : 1,
    badges: Array.isArray(user.badges) ? user.badges : [],
    badge: inferBadge(user.rank, xp),
    bio: buildUserBio(user),
    trend,
    streak: calculateStreak(records),
    weekly,
  };
}

export async function getUserProfile(searchParams) {
  const userId = normalizeUserId(getParam(searchParams, 'userId') || getParam(searchParams, 'email'));
  if (!userId) {
    return {
      status: 400,
      payload: { error: 'userId or email is required.' },
    };
  }

  const user = await findUserByUserId(userId);
  if (!user) {
    return {
      status: 404,
      payload: { error: 'User not found.' },
    };
  }

  const publicUser = toPublicUser(user);
  return {
    status: 200,
    payload: {
      success: true,
      user: publicUser,
      profile: createProfile(publicUser),
    },
  };
}

export async function saveUserProfile(searchParams, payload = {}) {
  const userId = normalizeUserId(getParam(searchParams, 'userId') || payload.userId || payload.email);
  if (!userId) {
    return {
      status: 400,
      payload: { error: 'userId or email is required.' },
    };
  }

  let updatedUser;
  try {
    updatedUser = await updateUserProfileSettings(userId, payload);
  } catch (error) {
    if (error instanceof Error && error.message === 'User not found.') {
      return {
        status: 404,
        payload: { error: 'User not found.' },
      };
    }

    throw error;
  }
  const publicUser = toPublicUser(updatedUser);

  return {
    status: 200,
    payload: {
      success: true,
      user: publicUser,
      profile: createProfile(publicUser),
    },
  };
}

export async function getLeaderboard(searchParams) {
  const limit = clampLeaderboardLimit(getParam(searchParams, 'limit'));
  const recentDates = getRecentDateRange(7);
  const [users, activityRecords] = await Promise.all([listUsersForLeaderboard(), listActivityRecordsForLeaderboard()]);

  const recordsByUserId = new Map();
  activityRecords.forEach((record) => {
    if (!recordsByUserId.has(record.userId)) {
      recordsByUserId.set(record.userId, []);
    }

    recordsByUserId.get(record.userId).push(record);
  });

  const leaderboard = users
    .map((user) => {
      const userKey = user.emailKey || user.email?.toLowerCase();
      const records = userKey ? recordsByUserId.get(userKey) || [] : [];
      return summarizeLeaderboardUser(user, records, recentDates);
    })
    .sort((left, right) => right.xp - left.xp || left.score - right.score || left.name.localeCompare(right.name))
    .slice(0, limit)
    .map((user, index) => ({
      ...user,
      rank: index + 1,
    }));

  return {
    status: 200,
    payload: {
      success: true,
      users: leaderboard,
      totalUsers: users.length,
    },
  };
}

export async function signupUser(payload = {}) {
  const validationError = validateSignupPayload(payload);
  if (validationError) {
    return {
      status: 400,
      payload: { error: validationError },
    };
  }

  const existingSignupUser = await findExistingSignupUser(payload.email, payload.nickname);
  if (existingSignupUser?.field === 'email') {
    return {
      status: 409,
      payload: { error: 'An account with that email already exists.' },
    };
  }

  if (existingSignupUser?.field === 'nickname') {
    return {
      status: 409,
      payload: { error: 'That nickname is already taken.' },
    };
  }

  try {
    const { passwordHash, passwordSalt } = hashPassword(payload.password);
    const createdUser = await createUser({
      ...payload,
      passwordHash,
      passwordSalt,
    });
    const publicUser = toPublicUser(createdUser);

    return {
      status: 201,
      payload: {
        success: true,
        user: publicUser,
        profile: createProfile(publicUser),
        welcomeXp: publicUser.score,
      },
    };
  } catch (error) {
    if (isDuplicateUserError(error)) {
      return {
        status: 409,
        payload: { error: getDuplicateUserMessage(error) },
      };
    }

    throw error;
  }
}

export async function loginUser(payload = {}) {
  const identifier = typeof payload.identifier === 'string' ? payload.identifier.trim() : '';
  const password = typeof payload.password === 'string' ? payload.password : '';

  if (!identifier) {
    return {
      status: 400,
      payload: { error: 'Enter your username or email.' },
    };
  }

  if (!password || password.length < 8) {
    return {
      status: 400,
      payload: { error: 'Password must be at least 8 characters.' },
    };
  }

  const user = await findUserByIdentifier(identifier);
  if (!user || !verifyPassword(password, user.passwordSalt, user.passwordHash)) {
    return {
      status: 401,
      payload: { error: 'Invalid credentials. Please try again.' },
    };
  }

  const publicUser = toPublicUser(user);

  return {
    status: 200,
    payload: {
      success: true,
      user: publicUser,
      profile: createProfile(publicUser),
    },
  };
}
