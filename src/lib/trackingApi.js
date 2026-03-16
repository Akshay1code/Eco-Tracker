const TRACKING_API_BASE_URL = import.meta.env.VITE_TRACKING_API_URL || 'http://localhost:3001';

function normalizeUserId(userId) {
  return typeof userId === 'string' && userId.trim() ? userId.trim().toLowerCase() : null;
}

async function postTrigger(pathname, payload) {
  const userId = normalizeUserId(payload.userId || payload.email);
  if (!userId) {
    return null;
  }

  try {
    const response = await fetch(`${TRACKING_API_BASE_URL}${pathname}`, {
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
