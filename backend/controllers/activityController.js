import { getDailyRecord, listDailyRecords, mutateDailyRecord } from '../models/activityModel.js';
import { findUserByUserId, syncUserProgress, toPublicUser } from '../models/userModel.js';
import { applyActivityTrigger, applyBatteryTrigger, applyTimeTrigger, getRecordDate } from '../services/ecoEngine.js';
import { getDatabaseStatus } from '../db.js';

function normalizeUserId(value) {
  return typeof value === 'string' && value.trim() ? value.trim().toLowerCase() : '';
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

function resolveUserId(payload = {}, searchParams) {
  if (searchParams) {
    return normalizeUserId(getParam(searchParams, 'userId') || getParam(searchParams, 'email'));
  }

  return normalizeUserId(payload.userId || payload.email);
}

function requireUserId(userId) {
  if (!userId) {
    return {
      status: 400,
      payload: { error: 'userId or email is required.' },
    };
  }

  return null;
}

async function syncProgressForRecord(userId, previousRecord, currentRecord) {
  const existingUser = await findUserByUserId(userId);
  if (!existingUser) {
    return null;
  }

  const previousXp = Math.max(0, Number(previousRecord?.xp_earned || 0));
  const currentXp = Math.max(0, Number(currentRecord?.xp_earned || 0));
  const xpDelta = currentXp - previousXp;

  if (xpDelta === 0) {
    return toPublicUser(existingUser);
  }

  const nextTotalXp = Math.max(0, Number(existingUser.score || 0) + xpDelta);
  const updatedUser = await syncUserProgress(userId, nextTotalXp);
  return toPublicUser(updatedUser);
}

export async function getHealth() {
  return {
    status: 200,
    payload: {
      ok: true,
      service: 'eco-activity-backend',
      date: getRecordDate(),
      database: getDatabaseStatus(),
    },
  };
}

export async function getDailyActivity(searchParams) {
  const userId = resolveUserId({}, searchParams);
  const missingUserId = requireUserId(userId);
  if (missingUserId) {
    return missingUserId;
  }

  const date = getParam(searchParams, 'date');
  if (date) {
    const record = await getDailyRecord(userId, date);
    return {
      status: 200,
      payload: { success: true, record },
    };
  }

  const records = await listDailyRecords(userId);
  return {
    status: 200,
    payload: { success: true, records },
  };
}

export async function postActivityTrigger(body = {}) {
  const userId = resolveUserId(body);
  const missingUserId = requireUserId(userId);
  if (missingUserId) {
    return missingUserId;
  }

  const { previousRecord, record, result } = await mutateDailyRecord(userId, body.timestamp, (dailyRecord) =>
    applyActivityTrigger(dailyRecord, body)
  );
  const user = await syncProgressForRecord(userId, previousRecord, record);

  return {
    status: 200,
    payload: {
      success: true,
      trigger: 'activity',
      date: record.date,
      thresholdMeters: 20,
      user,
      ...result,
    },
  };
}

export async function postTimeTrigger(body = {}) {
  const userId = resolveUserId(body);
  const missingUserId = requireUserId(userId);
  if (missingUserId) {
    return missingUserId;
  }

  const { previousRecord, record, result } = await mutateDailyRecord(userId, body.timestamp, (dailyRecord) =>
    applyTimeTrigger(dailyRecord, body)
  );
  const user = await syncProgressForRecord(userId, previousRecord, record);

  return {
    status: 200,
    payload: {
      success: true,
      trigger: 'time',
      date: record.date,
      user,
      ...result,
    },
  };
}

export async function postBatteryTrigger(body = {}) {
  const userId = resolveUserId(body);
  const missingUserId = requireUserId(userId);
  if (missingUserId) {
    return missingUserId;
  }

  const { previousRecord, record, result } = await mutateDailyRecord(userId, body.timestamp, (dailyRecord) =>
    applyBatteryTrigger(dailyRecord, body)
  );
  const user = await syncProgressForRecord(userId, previousRecord, record);

  return {
    status: 200,
    payload: {
      success: true,
      trigger: 'battery',
      date: record.date,
      user,
      ...result,
    },
  };
}
