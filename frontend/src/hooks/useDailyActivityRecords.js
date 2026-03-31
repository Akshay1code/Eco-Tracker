import { useEffect, useMemo, useState } from 'react';
import { fetchDailyActivityRecords } from '../lib/trackingApi.js';

function getTodayKey() {
  return new Date().toISOString().slice(0, 10);
}

function useDailyActivityRecords(userId, pollIntervalMs = 10000) {
  const [records, setRecords] = useState([]);
  const [isLoading, setIsLoading] = useState(Boolean(userId));
  const [error, setError] = useState('');

  useEffect(() => {
    if (!userId) {
      setRecords([]);
      setIsLoading(false);
      setError('');
      return undefined;
    }

    let isActive = true;

    const loadRecords = async (showLoadingState) => {
      if (showLoadingState && isActive) {
        setIsLoading(true);
      }

      try {
        const payload = await fetchDailyActivityRecords(userId);
        if (!isActive) {
          return;
        }

        setRecords(Array.isArray(payload.records) ? payload.records : []);
        setError('');
      } catch (loadError) {
        if (!isActive) {
          return;
        }

        setError(loadError instanceof Error ? loadError.message : 'Unable to load activity records right now.');
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    };

    void loadRecords(true);
    const interval = window.setInterval(() => {
      void loadRecords(false);
    }, pollIntervalMs);

    return () => {
      isActive = false;
      window.clearInterval(interval);
    };
  }, [pollIntervalMs, userId]);

  const todayRecord = useMemo(() => {
    const todayKey = getTodayKey();
    return records.find((record) => record.date === todayKey) || null;
  }, [records]);

  return {
    records,
    todayRecord,
    isLoading,
    error,
  };
}

export default useDailyActivityRecords;
