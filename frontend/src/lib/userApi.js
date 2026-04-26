import { API_BASE_URL } from './apiBase.js';

async function parseApiResponse(response, fallbackMessage) {
  let data = {};
  try {
    data = await response.json();
  } catch {
    data = {};
  }

  if (!response.ok) {
    throw new Error(data.error || fallbackMessage);
  }

  return data;
}

export async function fetchUserProfile(userId) {
  const normalizedUserId = typeof userId === 'string' ? userId.trim().toLowerCase() : '';
  if (!normalizedUserId) {
    return { user: null };
  }

  const response = await fetch(`${API_BASE_URL}/api/users/profile?userId=${encodeURIComponent(normalizedUserId)}`);
  return parseApiResponse(response, 'Unable to load user profile right now.');
}

export async function updateUserProfile(userId, profileData = {}) {
  const normalizedUserId = typeof userId === 'string' ? userId.trim().toLowerCase() : '';
  if (!normalizedUserId) {
    throw new Error('No signed-in user was found for this save.');
  }

  const response = await fetch(`${API_BASE_URL}/api/users/profile?userId=${encodeURIComponent(normalizedUserId)}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(profileData),
  });

  return parseApiResponse(response, 'Unable to save settings right now.');
}

export async function updateUserGoals(userId, goals = []) {
  const normalizedUserId = typeof userId === 'string' ? userId.trim().toLowerCase() : '';
  const response = await fetch(`${API_BASE_URL}/api/users/goals?userId=${encodeURIComponent(normalizedUserId)}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ goals }),
  });
  return parseApiResponse(response, 'Unable to sync goals.');
}

export async function updateUserJournal(userId, journal = []) {
  const normalizedUserId = typeof userId === 'string' ? userId.trim().toLowerCase() : '';
  const response = await fetch(`${API_BASE_URL}/api/users/journal?userId=${encodeURIComponent(normalizedUserId)}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ journal }),
  });
  return parseApiResponse(response, 'Unable to sync journal entries.');
}

export async function fetchBackendHealth() {
  const response = await fetch(`${API_BASE_URL}/api/health`);
  return parseApiResponse(response, 'Unable to reach the backend right now.');
}
