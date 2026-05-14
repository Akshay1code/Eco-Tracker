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
const SYNC_INTERVAL_MS = 5 * 60_000; // 5 minutes

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

        // Send to backend eco-engine for authoritative carbon/XP calculation
        await sendGoogleFitTrigger({
          userId: userEmail,
          steps: snapshot.steps,
          distanceMeters: snapshot.distanceMeters,
          calories: snapshot.calories,
          activeMinutes: snapshot.activeMinutes,
          activityType: snapshot.activityType,
          timestamp: snapshot.syncedAt,
        });
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

  // ─── Re-connect from sessionStorage on mount ───────────────────────────────
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

    return () => {
      isMountedRef.current = false;
      stopSyncInterval();
    };
    // Only run on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
