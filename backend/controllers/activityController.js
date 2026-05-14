import { getDailyRecord, listDailyRecords, mutateDailyRecord } from '../models/activityModel.js';
import { findUserByUserId, syncUserProgress, toPublicUser } from '../models/userModel.js';
import {
  applyActivityTrigger,
  applyBatteryTrigger,
  applyGoogleFitSync,
  applyTimeTrigger,
  getRecordDate,
} from '../services/ecoEngine.js';
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
      // Spread the engine result so consumers can read result.updated, result.record, etc.
      ...result,
      // Also surface the most important live metrics at the top level for quick access
      net_carbon_impact: record.net_carbon_impact,
      xp_earned: record.xp_earned,
      eco_score: record.eco_score,
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

/**
 * postGoogleFitTrigger
 * --------------------
 * Accepts authoritative daily activity data from the Google Fit REST API
 * (fetched in the browser by useGoogleFit) and applies it to the user's
 * daily record via applyGoogleFitSync in the eco-engine.
 *
 * Expected body: { userId, steps, distanceMeters, calories, activeMinutes, activityType, timestamp }
 */
export async function postGoogleFitTrigger(body = {}) {
  const userId = resolveUserId(body);
  const missingUserId = requireUserId(userId);
  if (missingUserId) {
    return missingUserId;
  }

  // Light input validation — values must be non-negative numbers
  const steps = Number(body.steps || 0);
  const distanceMeters = Number(body.distanceMeters || 0);
  const activeMinutes = Number(body.activeMinutes || 0);

  if (!Number.isFinite(steps) || !Number.isFinite(distanceMeters) || !Number.isFinite(activeMinutes)) {
    return {
      status: 400,
      payload: { error: 'steps, distanceMeters, and activeMinutes must be valid numbers.' },
    };
  }

  if (steps < 0 || distanceMeters < 0 || activeMinutes < 0) {
    return {
      status: 400,
      payload: { error: 'steps, distanceMeters, and activeMinutes must be >= 0.' },
    };
  }

  const { previousRecord, record, result } = await mutateDailyRecord(
    userId,
    body.timestamp,
    (dailyRecord) => applyGoogleFitSync(dailyRecord, body)
  );

  const user = await syncProgressForRecord(userId, previousRecord, record);

  return {
    status: 200,
    payload: {
      success: true,
      trigger: 'google_fit',
      source: 'google_fit',
      date: record.date,
      user,
      ...result,
      // Surface key metrics at the top level for easy client access
      net_carbon_impact: record.net_carbon_impact,
      carbon_saved: record.carbon_saved,
      xp_earned: record.xp_earned,
      eco_score: record.eco_score,
    },
  };
}
