import { useEffect, useState } from 'react';
import { fetchLeaderboard } from '../lib/communityApi.js';

function useLeaderboard(limit = 20, pollIntervalMs = 60_000) {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let isActive = true;

    const loadLeaderboard = async (showLoadingState) => {
      if (showLoadingState && isActive) {
        setIsLoading(true);
      }

      try {
        const payload = await fetchLeaderboard(limit);
        if (!isActive) {
          return;
        }

        setUsers(Array.isArray(payload.users) ? payload.users : []);
        setError('');
      } catch (loadError) {
        if (!isActive) {
          return;
        }

        setUsers([]);
        setError(loadError instanceof Error ? loadError.message : 'Unable to load leaderboard right now.');
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    };

    void loadLeaderboard(true);
    const interval = window.setInterval(() => {
      void loadLeaderboard(false);
    }, pollIntervalMs);

    return () => {
      isActive = false;
      window.clearInterval(interval);
    };
  }, [limit, pollIntervalMs]);

  return {
    users,
    isLoading,
    error,
  };
}

export default useLeaderboard;
