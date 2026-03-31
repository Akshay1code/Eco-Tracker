import { API_BASE_URL } from './apiBase.js';

function normalizeUserId(userId) {
  return typeof userId === 'string' && userId.trim() ? userId.trim().toLowerCase() : null;
}

async function postTrigger(pathname, payload) {
  const userId = normalizeUserId(payload.userId || payload.email);
  if (!userId) {
    return null;
  }

  try {
    const response = await fetch(`${API_BASE_URL}${pathname}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...payload,
        userId,
      }),
      keepalive: true,
    });

    if (!response.ok) {
      return null;
    }

    return await response.json();
  } catch {
    return null;
  }
}
export function sendActivityTrigger(payload) {
  return postTrigger('/api/triggers/activity', payload);
}
export function sendTimeTrigger(payload) {
  return postTrigger('/api/triggers/time', payload);
}
export function sendBatteryTrigger(payload) {
  return postTrigger('/api/triggers/battery', payload);
}

export async function fetchDailyActivityRecords(userId) {
  const normalizedUserId = normalizeUserId(userId);
  if (!normalizedUserId) {
    return { records: [] };
  }

  const response = await fetch(`${API_BASE_URL}/api/daily?userId=${encodeURIComponent(normalizedUserId)}`);

  let data = {};
  try {
    data = await response.json();
  } catch {
    data = {};
  }

  if (!response.ok) {
    throw new Error(data.error || 'Unable to load activity records right now.');
  }

  return data;
}
