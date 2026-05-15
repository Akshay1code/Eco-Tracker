/**
 * useGoogleFit.js
 * ---------------
 * React hook that manages the Google Fit OAuth token lifecycle and periodic
 * data sync. When connected, it fetches today's Fit aggregate every 5 minutes
 * and sends the data to the Eco-Tracker backend for carbon/XP calculation.
 *
 * Usage:
 *   const { fitConnected, fitSnapshot, fitSyncing, fitError,
 *           connectGoogleFit, disconnectGoogleFit, syncNow } = useGoogleFit(userEmail);
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import {
  fetchTodayFitAggregate,
  initGoogleAuth,
  isGoogleFitConfigured,
  requestFitToken,
  revokeFitToken,
} from '../lib/googleFitApi.js';
import { sendGoogleFitTrigger } from '../lib/trackingApi.js';

const SESSION_TOKEN_KEY = 'eco_gfit_token';
const SESSION_CONNECTED_KEY = 'eco_gfit_connected';
const SYNC_INTERVAL_MS = 10_000; // 10 seconds

/**
 * Persist token to sessionStorage (cleared on tab close, not localStorage).
 */
function saveToken(token) {
  try {
    sessionStorage.setItem(SESSION_TOKEN_KEY, token);
    sessionStorage.setItem(SESSION_CONNECTED_KEY, 'true');
  } catch {
    // ignore – storage may be unavailable in some privacy modes
  }
}

function loadToken() {
  try {
    return sessionStorage.getItem(SESSION_TOKEN_KEY) || null;
  } catch {
    return null;
  }
}

function clearToken() {
  try {
    sessionStorage.removeItem(SESSION_TOKEN_KEY);
    sessionStorage.removeItem(SESSION_CONNECTED_KEY);
  } catch {
    // ignore
  }
}

/**
 * @returns {boolean} true if the user previously connected this session
 */
function wasConnectedThisSession() {
  try {
    return sessionStorage.getItem(SESSION_CONNECTED_KEY) === 'true';
  } catch {
    return false;
  }
}

/**
 * @param {string|null} userEmail - The logged-in user's email (used as userId for backend).
 */
export default function useGoogleFit(userEmail) {
  const [fitConnected, setFitConnected] = useState(false);
  const [fitSyncing, setFitSyncing] = useState(false);
  const [fitError, setFitError] = useState(null);
  const [fitSnapshot, setFitSnapshot] = useState(null);
  const [configured] = useState(isGoogleFitConfigured);

  const tokenRef = useRef(loadToken());
  const syncIntervalRef = useRef(null);
  const isMountedRef = useRef(true);
  const prevSnapshotRef = useRef(null);

  // When Google Fit snapshot changes (e.g. steps changed), store in db via trigger
  useEffect(() => {
    if (!fitSnapshot || !userEmail) return;

    const prev = prevSnapshotRef.current;
    if (
      prev &&
      prev.steps === fitSnapshot.steps &&
      prev.distanceMeters === fitSnapshot.distanceMeters &&
      prev.calories === fitSnapshot.calories &&
      prev.activeMinutes === fitSnapshot.activeMinutes
    ) {
      // No meaningful change, skip database trigger
      return;
    }

    prevSnapshotRef.current = fitSnapshot;

    sendGoogleFitTrigger({
      userId: userEmail,
      steps: fitSnapshot.steps,
      distanceMeters: fitSnapshot.distanceMeters,
      calories: fitSnapshot.calories,
      activeMinutes: fitSnapshot.activeMinutes,
      activityType: fitSnapshot.activityType,
      timestamp: fitSnapshot.syncedAt,
    }).catch((err) => console.error('Failed to sync to DB:', err));
  }, [fitSnapshot, userEmail]);

  // ─── Core sync function ────────────────────────────────────────────────────
  const performSync = useCallback(
    async (token) => {
      if (!token || !userEmail || !isMountedRef.current) return;

      setFitSyncing(true);
      setFitError(null);

      try {
        const snapshot = await fetchTodayFitAggregate(token);

        if (!isMountedRef.current) return;

        setFitSnapshot(snapshot);
      } catch (error) {
        if (!isMountedRef.current) return;

        const message = error?.message || 'Google Fit sync failed.';

        // Token expired — clear state so user can re-auth
        if (message.includes('401') || message.includes('invalid_token')) {
          clearToken();
          tokenRef.current = null;
          setFitConnected(false);
          setFitError('Google Fit session expired. Please reconnect.');
          stopSyncInterval();
          return;
        }

        setFitError(message);
      } finally {
        if (isMountedRef.current) {
          setFitSyncing(false);
        }
      }
    },
    [userEmail]
  );

  // ─── Interval management ───────────────────────────────────────────────────
  const startSyncInterval = useCallback(
    (token) => {
      if (syncIntervalRef.current) clearInterval(syncIntervalRef.current);
      syncIntervalRef.current = setInterval(() => {
        performSync(token);
      }, SYNC_INTERVAL_MS);
    },
    [performSync]
  );

  function stopSyncInterval() {
    if (syncIntervalRef.current) {
      clearInterval(syncIntervalRef.current);
      syncIntervalRef.current = null;
    }
  }

  // ─── Re-connect from sessionStorage on mount & Window Visibility ─────────
  useEffect(() => {
    isMountedRef.current = true;

    if (!configured) return;

    const stored = loadToken();
    if (stored && wasConnectedThisSession()) {
      tokenRef.current = stored;
      setFitConnected(true);
      performSync(stored);
      startSyncInterval(stored);
    }

    // Smart Refresh Logic: Trigger sync when window regains focus or tab becomes visible
    // This helps recover from browser background throttling.
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && tokenRef.current) {
        performSync(tokenRef.current);
      }
    };

    const handleFocus = () => {
      if (tokenRef.current) {
        performSync(tokenRef.current);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);

    return () => {
      isMountedRef.current = false;
      stopSyncInterval();
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
    };
    // Only run on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ─── Hardware Motion Sync ──────────────────────────────────────────────────
  // Proactively triggers a Google Fit sync when the accelerometer detects walking.
  useEffect(() => {
    if (typeof window === 'undefined' || !('DeviceMotionEvent' in window)) return;

    let motionTimeout = null;

    const handleMotion = (event) => {
      if (!tokenRef.current) return;

      const acc = event.accelerationIncludingGravity;
      if (!acc) return;
      
      const magnitude = Math.sqrt((acc.x || 0) ** 2 + (acc.y || 0) ** 2 + (acc.z || 0) ** 2);
      
      // Standard gravity is ~9.8. Magnitudes significantly higher/lower indicate movement.
      if (Math.abs(magnitude - 9.8) > 2.0) {
        if (!motionTimeout) {
          // Debounce: Wait 3 seconds after walking starts to allow steps to accumulate in Fit
          motionTimeout = setTimeout(() => {
            if (tokenRef.current) {
              performSync(tokenRef.current);
            }
            motionTimeout = null;
          }, 3000);
        }
      }
    };

    window.addEventListener('devicemotion', handleMotion);
    return () => {
      window.removeEventListener('devicemotion', handleMotion);
      if (motionTimeout) clearTimeout(motionTimeout);
    };
  }, [performSync]);

  // ─── Public API ────────────────────────────────────────────────────────────

  /**
   * Triggers the Google OAuth popup and begins syncing Fit data.
   */
  const connectGoogleFit = useCallback(async () => {
    if (!configured) {
      setFitError(
        'Google Fit is not configured. Set VITE_GOOGLE_FIT_CLIENT_ID in your .env file.'
      );
      return;
    }

    setFitError(null);

    try {
      await initGoogleAuth();
      const token = await requestFitToken();

      if (!token) throw new Error('No access token received.');

      saveToken(token);
      tokenRef.current = token;
      setFitConnected(true);

      await performSync(token);
      startSyncInterval(token);
    } catch (error) {
      const message = error?.message || 'Failed to connect to Google Fit.';
      if (message.includes('popup_closed') || message.includes('access_denied')) {
        setFitError('Google Fit authorization was cancelled.');
      } else {
        setFitError(message);
      }
    }
  }, [configured, performSync, startSyncInterval]);

  /**
   * Revokes the token and stops syncing.
   */
  const disconnectGoogleFit = useCallback(() => {
    const token = tokenRef.current;
    revokeFitToken(token);
    clearToken();
    tokenRef.current = null;
    stopSyncInterval();
    setFitConnected(false);
    setFitSnapshot(null);
    setFitError(null);
    setFitSyncing(false);
  }, []);

  /**
   * Manually triggers an immediate Fit sync.
   */
  const syncNow = useCallback(() => {
    if (tokenRef.current) {
      performSync(tokenRef.current);
    }
  }, [performSync]);

  return {
    /** Whether the user has authorized Google Fit this session */
    fitConnected,
    /** Latest fetched Fit snapshot (steps, distance, calories, activeMinutes, activityType) */
    fitSnapshot,
    /** True while a sync request is in flight */
    fitSyncing,
    /** Error message string, or null */
    fitError,
    /** Whether VITE_GOOGLE_FIT_CLIENT_ID is set */
    fitConfigured: configured,
    connectGoogleFit,
    disconnectGoogleFit,
    syncNow,
  };
}
