import { useEffect, useState, useCallback } from 'react';
import { fetchUserProfile } from '../lib/userApi.js';

function useUserProfile(userId, pollIntervalMs = 5000) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(Boolean(userId));
  const [error, setError] = useState('');
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const refetch = useCallback(() => {
    setRefreshTrigger((prev) => prev + 1);
  }, []);

  useEffect(() => {
    if (!userId) {
      setUser(null);
      setIsLoading(false);
      setError('');
      return undefined;
    }

    let isActive = true;

    const loadUser = async (showLoadingState) => {
      if (showLoadingState && isActive) {
        setIsLoading(true);
      }

      try {
        const payload = await fetchUserProfile(userId);
        if (!isActive) {
          return;
        }

        setUser(payload.user || null);
        setError('');
      } catch (loadError) {
        if (!isActive) {
          return;
        }

        setError(loadError instanceof Error ? loadError.message : 'Unable to load user profile right now.');
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    };

    void loadUser(true);
    const interval = window.setInterval(() => {
      void loadUser(false);
    }, pollIntervalMs);

    return () => {
      isActive = false;
      window.clearInterval(interval);
    };
  }, [pollIntervalMs, userId, refreshTrigger]);

  return {
    user,
    isLoading,
    error,
    refetch,
  };
}

export default useUserProfile;
