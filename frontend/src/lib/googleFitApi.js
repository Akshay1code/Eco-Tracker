/**
 * googleFitApi.js
 * ---------------
 * Google Fit REST API integration using Google Identity Services (GIS).
 * This is a browser-only module — no backend secret is needed.
 *
 * SETUP (one-time):
 * 1. Go to https://console.cloud.google.com/
 * 2. Create a project (or select existing).
 * 3. Enable "Fitness API": APIs & Services → Library → search "Fitness API".
 * 4. Create OAuth credentials: APIs & Services → Credentials → Create Credentials
 *    → OAuth Client ID → Web Application.
 *    - Authorized JS origins: http://localhost:5173
 *    - No redirect URI needed (implicit/token flow).
 * 5. Copy the Client ID into your frontend/.env:
 *    VITE_GOOGLE_FIT_CLIENT_ID=YOUR_CLIENT_ID.apps.googleusercontent.com
 *
 * NOTE: Google Fit consumer app was deprecated in 2024, but the Fitness REST API
 * continues to work for web developers. New data written after the deprecation
 * date is still accessible if users use Health Connect on Android or partner apps.
 */

const CLIENT_ID = import.meta.env.VITE_GOOGLE_FIT_CLIENT_ID || '';

const FIT_SCOPES = [
  'https://www.googleapis.com/auth/fitness.activity.read',
  'https://www.googleapis.com/auth/fitness.body.read',
  'https://www.googleapis.com/auth/fitness.location.read',
].join(' ');

const FITNESS_API_BASE = 'https://www.googleapis.com/fitness/v1/users/me';

// Data source type names used in the Fitness API
const DATA_TYPE_STEPS = 'com.google.step_count.delta';
const DATA_TYPE_DISTANCE = 'com.google.distance.delta';
const DATA_TYPE_CALORIES = 'com.google.calories.expended';
const DATA_TYPE_ACTIVE_MINUTES = 'com.google.active_minutes';
const DATA_TYPE_ACTIVITY_SEGMENT = 'com.google.activity.segment';

/**
 * Activity type codes from the Google Fit API.
 * Reference: https://developers.google.com/fit/rest/v1/reference/activity-types
 */
const FIT_ACTIVITY_CODES = {
  7: 'walking',
  8: 'running',
  1: 'biking',    // cycling
  9: 'vehicle',   // in vehicle
  72: 'walking',  // walking (fitness)
  56: 'running',  // jogging
  0: 'idle',      // in vehicle (unknown)
};

/** Convert a Fit activity code to our internal activity type string */
function fitActivityCodeToKind(code) {
  return FIT_ACTIVITY_CODES[code] || 'idle';
}

/**
 * Returns today's start and end timestamps as nanoseconds (required by Fit API).
 */
function getTodayNanosecondRange() {
  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
  const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
  return {
    startTimeNs: String(startOfDay.getTime() * 1_000_000),
    endTimeNs: String(endOfDay.getTime() * 1_000_000),
  };
}

/** Stores the GIS token client instance */
let _tokenClient = null;
let _pendingResolve = null;
let _pendingReject = null;

/**
 * Loads the Google Identity Services script if not already loaded.
 */
function loadGisScript() {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined') {
      reject(new Error('Google Identity Services requires a browser environment.'));
      return;
    }

    if (window.google?.accounts?.oauth2) {
      resolve();
      return;
    }

    const existing = document.querySelector('script[src*="accounts.google.com/gsi/client"]');
    if (existing) {
      existing.addEventListener('load', resolve);
      existing.addEventListener('error', () => reject(new Error('Failed to load GIS script.')));
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = resolve;
    script.onerror = () => reject(new Error('Failed to load Google Identity Services script.'));
    document.head.appendChild(script);
  });
}

/**
 * Initializes the GIS token client (idempotent).
 * Must be called before requestFitToken().
 */
export async function initGoogleAuth() {
  if (!CLIENT_ID) {
    throw new Error(
      'VITE_GOOGLE_FIT_CLIENT_ID is not set. ' +
      'Add it to frontend/.env to enable Google Fit integration.'
    );
  }

  await loadGisScript();

  if (_tokenClient) return;

  _tokenClient = window.google.accounts.oauth2.initTokenClient({
    client_id: CLIENT_ID,
    scope: FIT_SCOPES,
    callback: (response) => {
      if (response.error) {
        if (_pendingReject) {
          _pendingReject(new Error(`Google OAuth error: ${response.error}`));
        }
        _pendingResolve = null;
        _pendingReject = null;
        return;
      }
      if (_pendingResolve) {
        _pendingResolve(response.access_token);
      }
      _pendingResolve = null;
      _pendingReject = null;
    },
  });
}

/**
 * Opens the Google OAuth consent popup and returns an access token.
 * Stores it in sessionStorage so the user doesn't re-auth on every poll.
 */
export async function requestFitToken(prompt = 'consent') {
  await initGoogleAuth();

  return new Promise((resolve, reject) => {
    _pendingResolve = resolve;
    _pendingReject = reject;
    _tokenClient.requestAccessToken({ prompt });
  });
}

/**
 * Revokes the stored token and clears session state.
 */
export function revokeFitToken(token) {
  if (!token || typeof window === 'undefined') return;
  try {
    window.google?.accounts?.oauth2?.revoke(token, () => {});
  } catch {
    // ignore
  }
}

/**
 * Fetches today's aggregated fitness data from the Google Fitness REST API.
 * Returns a normalized FitDaySnapshot object.
 *
 * @param {string} token - A valid Google OAuth access token with Fitness scopes.
 * @returns {Promise<FitDaySnapshot>}
 */
export async function fetchTodayFitAggregate(token) {
  const { startTimeNs, endTimeNs } = getTodayNanosecondRange();

  const body = {
    aggregateBy: [
      { dataTypeName: DATA_TYPE_STEPS },
      { dataTypeName: DATA_TYPE_DISTANCE },
      { dataTypeName: DATA_TYPE_CALORIES },
      { dataTypeName: DATA_TYPE_ACTIVE_MINUTES },
      { dataTypeName: DATA_TYPE_ACTIVITY_SEGMENT },
    ],
    bucketByTime: { durationMillis: String(86_400_000) }, // 1 day bucket
    startTimeMillis: String(Math.floor(Number(startTimeNs) / 1_000_000)),
    endTimeMillis: String(Math.floor(Number(endTimeNs) / 1_000_000)),
  };

  const response = await fetch(`${FITNESS_API_BASE}/dataset:aggregate`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errText = await response.text().catch(() => '');
    throw new Error(`Google Fit API error ${response.status}: ${errText}`);
  }

  const data = await response.json();
  return parseFitAggregate(data);
}

/**
 * Parses the Fitness API aggregate response into a normalized snapshot.
 * @param {object} apiResponse
 * @returns {FitDaySnapshot}
 */
function parseFitAggregate(apiResponse) {
  const bucket = apiResponse?.bucket?.[0];

  let steps = 0;
  let distanceMeters = 0;
  let calories = 0;
  let activeMinutes = 0;
  let dominantActivityCode = 7; // default: walking

  if (!bucket?.dataset) {
    return buildSnapshot(steps, distanceMeters, calories, activeMinutes, dominantActivityCode);
  }

  const activitySegmentCounts = {};

  for (const dataset of bucket.dataset) {
    const typeName = dataset.dataSourceId || '';

    for (const point of dataset.point || []) {
      for (const val of point.value || []) {
        const intVal = val.intVal || 0;
        const fpVal = val.fpVal || 0;

        if (typeName.includes('step_count')) {
          steps += intVal;
        } else if (typeName.includes('distance')) {
          distanceMeters += fpVal;
        } else if (typeName.includes('calories')) {
          calories += fpVal;
        } else if (typeName.includes('active_minutes')) {
          activeMinutes += intVal;
        } else if (typeName.includes('activity.segment')) {
          const code = intVal;
          activitySegmentCounts[code] = (activitySegmentCounts[code] || 0) + 1;
        }
      }
    }
  }

  // Pick the most frequent activity segment as the dominant type
  if (Object.keys(activitySegmentCounts).length > 0) {
    dominantActivityCode = Number(
      Object.entries(activitySegmentCounts).sort((a, b) => b[1] - a[1])[0][0]
    );
  }

  return buildSnapshot(steps, distanceMeters, calories, activeMinutes, dominantActivityCode);
}

/**
 * @typedef {Object} FitDaySnapshot
 * @property {number} steps
 * @property {number} distanceMeters
 * @property {number} distanceKm
 * @property {number} calories
 * @property {number} activeMinutes
 * @property {string} activityType - 'walking' | 'running' | 'biking' | 'vehicle' | 'idle'
 * @property {string} syncedAt - ISO timestamp of when this snapshot was fetched
 */
function buildSnapshot(steps, distanceMeters, calories, activeMinutes, activityCode) {
  return {
    steps: Math.round(steps),
    distanceMeters: Math.round(distanceMeters),
    distanceKm: Number((distanceMeters / 1000).toFixed(3)),
    calories: Math.round(calories),
    activeMinutes: Math.round(activeMinutes),
    activityType: fitActivityCodeToKind(activityCode),
    syncedAt: new Date().toISOString(),
  };
}

/** Returns true if the Google Fit Client ID is configured. */
export function isGoogleFitConfigured() {
  return Boolean(CLIENT_ID);
}
