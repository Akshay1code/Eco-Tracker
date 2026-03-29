import TopBar from '../components/layout/TopBar.jsx';
import SectionHeader from '../components/shared/SectionHeader.jsx';
import HeroCard from '../components/dashboard/HeroCard.jsx';
import MetricsGrid from '../components/dashboard/MetricsGrid.jsx';
import EcoCalendar from '../components/dashboard/EcoCalendar.jsx';
import EcoTodos from '../components/dashboard/EcoTodos.jsx';
import QuoteCard from '../components/dashboard/QuoteCard.jsx';
import LeaderboardRow from '../components/community/LeaderboardRow.jsx';
import TrackerAlertModal from '../components/modals/TrackerAlertModal.jsx';
import { METRICS } from '../data/mockData.js';
import useDailyActivityRecords from '../hooks/useDailyActivityRecords.js';
import useLeaderboard from '../hooks/useLeaderboard.js';
import useUserProfile from '../hooks/useUserProfile.js';
import useDeviceCarbonTracker from '../hooks/useDeviceCarbonTracker.ts';

function DashboardView({ onCalClick, onUserClick, onLogout, activeTab = 'dashboard' }) {
  const { users: leaderboardUsers, isLoading: isLeaderboardLoading, error: leaderboardError } = useLeaderboard(5);
  const topFive = leaderboardUsers.slice(0, 5);
  const storedEmail = typeof window !== 'undefined' ? localStorage.getItem('userEmail') : null;
  const {
    records: activityRecords,
    todayRecord,
    isLoading: isActivityLoading,
    error: activityError,
  } = useDailyActivityRecords(storedEmail);
  const { user: userProfile } = useUserProfile(storedEmail);
  const tracker = useDeviceCarbonTracker(storedEmail, todayRecord);
  const dashboardData = {
    ...tracker,
    carbon: todayRecord ? Number(todayRecord.carbon_emission || 0) : tracker.carbon,
    totalXp: Number(userProfile?.score ?? 0),
    level: Number(userProfile?.level ?? 1),
    levelProgressPct: Number(userProfile?.levelProgressPct ?? 0),
    badges: Array.isArray(userProfile?.badges) ? userProfile.badges : [],
  };
  const chargeCarbonProgress = Math.min((tracker.co2SavedKg / 1.5) * 100, 100);
  const caloriesProgress = Math.min((tracker.caloriesBurned / 400) * 100, 100);
  const calendarRecordsByDay = activityRecords.reduce((accumulator, record) => {
    const date = new Date(record.date);
    if (
      date.getFullYear() === new Date().getFullYear() &&
      date.getMonth() === new Date().getMonth()
    ) {
      accumulator[date.getDate()] = record;
    }
    return accumulator;
  }, {});
  const activeCalendarDays = new Set(Object.keys(calendarRecordsByDay).map((key) => Number(key)));

  const liveMetrics = METRICS.map((metric) => {
    if (metric.label === 'Steps Walked') {
      const steps = dashboardData.steps || 0;
      return { ...metric, value: steps.toLocaleString(), unit: 'steps', progress: Math.min((steps / 8000) * 100, 100) };
    }
    if (metric.label === 'Distance') {
      return {
        ...metric,
        value: dashboardData.distance.toFixed(2),
        unit: 'km',
        progress: Math.min((dashboardData.distance / 5) * 100, 100),
      };
    }
    if (metric.label === 'Active Time') {
      return {
        ...metric,
        value: `${dashboardData.activeMinutes}`,
        unit: 'min',
        progress: Math.min((dashboardData.activeMinutes / 90) * 100, 100),
      };
    }
    if (metric.label === 'Carbon Saved') {
      return {
        ...metric,
        label: 'Carbon Saved',
        value: tracker.co2SavedKg.toFixed(3),
        unit: 'kg CO2',
        progress: chargeCarbonProgress,
      };
    }
    if (metric.label === 'Device Energy') {
      return {
        ...metric,
        label: 'Calories Burned',
        value: tracker.caloriesBurned.toFixed(0),
        unit: 'kcal',
        progress: caloriesProgress,
      };
    }
    if (metric.label === 'Eco Score') {
      const score = todayRecord
        ? Math.max(0, Math.min(100, Number(todayRecord.eco_score || 0)))
        : Math.max(0, Math.min(100, 100 - dashboardData.carbon * 100));
      return { ...metric, value: `${Math.round(score)}`, unit: '/ 100', progress: score };
    }
    return metric;
  });

  return (
    <div>
      <TopBar activeTab={activeTab} onLogout={onLogout} />
      <HeroCard deviceData={dashboardData} onRequestMotionAccess={tracker.requestMotionAccess} />

      <SectionHeader title="Carbon Activity Metrics" subtitle="Adaptive step detection blends accelerometer peaks, cadence rhythm, and GPS-aware validation for steadier real-time tracking." />
      {isActivityLoading ? <p style={{ color: 'var(--gray-600)' }}>Loading your activity data from the database...</p> : null}
      {!isActivityLoading && activityError ? <p style={{ color: '#b91c1c' }}>{activityError}</p> : null}
      <MetricsGrid metrics={liveMetrics} />

      <div className="two-col" style={{ marginTop: 20 }}>
        <EcoCalendar onDayClick={onCalClick} activeDays={activeCalendarDays} recordsByDay={calendarRecordsByDay} />

        <section className="card-white" style={{ padding: 20 }}>
          <h3 style={{ color: 'var(--forest)', fontSize: 20, marginBottom: 12 }}>Community Leaderboard</h3>
          {isLeaderboardLoading ? <p style={{ color: 'var(--gray-600)', margin: 0 }}>Loading leaderboard...</p> : null}
          {!isLeaderboardLoading && leaderboardError ? (
            <p style={{ color: '#b91c1c', margin: 0 }}>{leaderboardError}</p>
          ) : null}
          {!isLeaderboardLoading && !leaderboardError && !topFive.length ? (
            <p style={{ color: 'var(--gray-600)', margin: 0 }}>No community users found yet.</p>
          ) : null}
          {!isLeaderboardLoading && !leaderboardError && topFive.length ? (
            <div style={{ display: 'grid', gap: 8 }}>
              {topFive.map((user) => (
                <LeaderboardRow key={user.id} user={user} onClick={onUserClick} />
              ))}
            </div>
          ) : null}
        </section>
      </div>

      <div className="two-col-wide" style={{ marginTop: 20 }}>
        <EcoTodos userProgress={userProfile} />
        <QuoteCard />
      </div>

      {tracker.batteryAlert ? (
        <TrackerAlertModal alert={tracker.batteryAlert} onClose={tracker.dismissBatteryAlert} />
      ) : null}
    </div>
  );
}

export default DashboardView;
