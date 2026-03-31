import { useEffect, useState } from 'react';
import { fetchUserProfile } from '../lib/userApi.js';

function useUserProfile(userId, pollIntervalMs = 10000) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(Boolean(userId));
  const [error, setError] = useState('');

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
  }, [pollIntervalMs, userId]);

  return {
    user,
    isLoading,
    error,
  };
}

export default useUserProfile;
