import EcoDashboardHeader from '../components/layout/EcoDashboardHeader.jsx';
import HeroCard from '../components/dashboard/HeroCard.jsx';
import EcoCalendar from '../components/dashboard/EcoCalendar.jsx';
import EcoTodos from '../components/dashboard/EcoTodos.jsx';
import QuoteCard from '../components/dashboard/QuoteCard.jsx';
import LeaderboardRow from '../components/community/LeaderboardRow.jsx';
import TrackerAlertModal from '../components/modals/TrackerAlertModal.jsx';
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
  } = useDailyActivityRecords(storedEmail);
  const { user: userProfile } = useUserProfile(storedEmail);
  const tracker = useDeviceCarbonTracker(storedEmail, todayRecord);

  const dashboardData = {
    ...tracker,
    carbon: todayRecord ? Number(todayRecord.net_carbon_impact ?? todayRecord.carbon_emission ?? 0) : tracker.carbon,
    footprintScore: todayRecord ? Number(todayRecord.net_carbon_impact ?? todayRecord.carbon_emission ?? 0) : tracker.carbon,
    totalXp: Number(userProfile?.score ?? 0),
    level: Number(userProfile?.level ?? 1),
    levelProgressPct: Number(userProfile?.levelProgressPct ?? 0),
    badges: Array.isArray(userProfile?.badges) ? userProfile.badges : [],
  };

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
  const userName =
    userProfile?.nickname ||
    userProfile?.name ||
    (typeof window !== 'undefined' ? localStorage.getItem('userName') : null) ||
    'EcoWarrior';
  const activityDates = new Set(
    activityRecords
      .filter(
        (record) =>
          Number(record.steps || 0) > 0 ||
          Number(record.active_time || 0) > 0 ||
          Number(record.activity_distance || 0) > 0 ||
          Number(record.carbon_emission || 0) > 0
      )
      .map((record) => record.date)
  );
  let streakDays = 0;
  const streakCursor = new Date();
  while (activityDates.has(streakCursor.toISOString().slice(0, 10))) {
    streakDays += 1;
    streakCursor.setDate(streakCursor.getDate() - 1);
  }

  return (
    <div>
      <EcoDashboardHeader
        userName={userName}
        streakDays={streakDays}
        currentDate={new Date()}
        onLogout={onLogout}
      />

      <HeroCard deviceData={dashboardData} compact />

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
