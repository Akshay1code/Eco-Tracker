import { API_BASE_URL } from './apiBase.js';

async function postJson(pathname, payload) {
  const response = await fetch(`${API_BASE_URL}${pathname}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  let data = {};
  try {
    data = await response.json();
  } catch {
    data = {};
  }

  if (!response.ok) {
    throw new Error(data.error || 'Request failed.');
  }

  return data;
}

export function signupUser(payload) {
  return postJson('/api/users/signup', payload);
}

export function loginUser(payload) {
  return postJson('/api/users/login', payload);
}
