import { useEffect, useState } from 'react';
import { fetchLeaderboard } from '../lib/communityApi.js';

function useLeaderboard(limit = 20) {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let isActive = true;

    setIsLoading(true);
    setError('');

    fetchLeaderboard(limit)
      .then((payload) => {
        if (!isActive) {
          return;
        }

        setUsers(Array.isArray(payload.users) ? payload.users : []);
      })
      .catch((loadError) => {
        if (!isActive) {
          return;
        }

        setUsers([]);
        setError(loadError instanceof Error ? loadError.message : 'Unable to load leaderboard right now.');
      })
      .finally(() => {
        if (isActive) {
          setIsLoading(false);
        }
      });

    return () => {
      isActive = false;
    };
  }, [limit]);

  return {
    users,
    isLoading,
    error,
  };
}

export default useLeaderboard;
