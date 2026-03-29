import { API_BASE_URL } from './apiBase.js';

export async function fetchLeaderboard(limit = 20) {
  const response = await fetch(`${API_BASE_URL}/api/users/leaderboard?limit=${limit}`);

  let data = {};
  try {
    data = await response.json();
  } catch {
    data = {};
  }

  if (!response.ok) {
    throw new Error(data.error || 'Unable to load leaderboard right now.');
  }

  return data;
}
