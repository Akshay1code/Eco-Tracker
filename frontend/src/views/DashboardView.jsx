import { useEffect, useState } from 'react';
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
import DailyQuestsCard from '../components/dashboard/DailyQuestsCard.jsx';
import VehicleDetectionModal from '../components/modals/VehicleDetectionModal.jsx';
import CyclingCelebrationCard from '../components/dashboard/CyclingCelebrationCard.jsx';
import ElectricityBillModal from '../components/modals/ElectricityBillModal.jsx';

function DashboardView({ onCalClick, onUserClick, onLogout, activeTab = 'dashboard' }) {
  const [vehicleModalShown, setVehicleModalShown] = useState(false);
  const [pendingVehicleData, setPendingVehicleData] = useState(null);
  const [showElectricityModal, setShowElectricityModal] = useState(false);

  const { users: leaderboardUsers, isLoading: isLeaderboardLoading, error: leaderboardError } = useLeaderboard(5);
  const topFive = leaderboardUsers.slice(0, 5);
  const storedEmail = typeof window !== 'undefined' ? localStorage.getItem('userEmail') : null;
  const {
    records: activityRecords,
    todayRecord,
  } = useDailyActivityRecords(storedEmail, 30_000); // 30 s is sufficient — triggers keep it fresh
  const { user: userProfile } = useUserProfile(storedEmail);
  const tracker = useDeviceCarbonTracker(storedEmail, todayRecord);

  // Write live carbon to localStorage so the sidebar in App.jsx can read it without prop drilling
  useEffect(() => {
    if (!todayRecord) return;
    const todayKey = new Date().toISOString().slice(0, 10);
    try {
      const existing = JSON.parse(localStorage.getItem(`eco_daily_${todayKey}`) || '{}');
      localStorage.setItem(
        `eco_daily_${todayKey}`,
        JSON.stringify({
          ...existing,
          carbon: Number(todayRecord.net_carbon_impact ?? todayRecord.carbon_emission ?? 0),
          date: todayKey,
        })
      );
    } catch { /* ignore */ }
  }, [todayRecord]);

  // Prefer real-time backend score (returned by activity triggers) over cached profile.
  // tracker.backendScore is updated on every GPS movement event that crosses the 20m threshold.
  const liveXp = tracker.backendScore ?? Number(userProfile?.score ?? 0);

  // tracker.carbon is already set to backendCarbonKg when available (see useDeviceCarbonTracker).
  // todayRecord from the daily poll gives the same source-of-truth but may be slightly stale.
  const liveCarbon = tracker.carbon;

  useEffect(() => {
    // Detect vehicle movement and trigger modal once per session
    if (!vehicleModalShown && (tracker.movementMode === 'car_or_bus' || tracker.movementMode === 'train_or_metro' || tracker.movementMode === 'two_wheeler')) {
      if (tracker.speed > 5) { // Ensure speed is actually significant
        setPendingVehicleData({
          mode: tracker.movementMode,
          speed: tracker.speed
        });
      }
    }
  }, [tracker.movementMode, tracker.speed, vehicleModalShown]);

  useEffect(() => {
    // Electricity bill logic: 7th to 12th of the month
    const today = new Date();
    const day = today.getDate();
    if (day >= 7 && day <= 12 && storedEmail && userProfile) {
      // Check if user already submitted this month's bill
      const lastBillDateStr = userProfile.lastElectricityBillDate;
      if (lastBillDateStr) {
        const lastBillDate = new Date(lastBillDateStr);
        if (lastBillDate.getMonth() === today.getMonth() && lastBillDate.getFullYear() === today.getFullYear()) {
          return; // Already submitted this month
        }
      }
      
      // Also check local storage to avoid spamming if they close it
      const dismissedKey = `eco_elec_dismissed_${today.getFullYear()}_${today.getMonth()}`;
      if (!localStorage.getItem(dismissedKey)) {
        setShowElectricityModal(true);
      }
    }
  }, [storedEmail, userProfile]);

  const dashboardData = {
    ...tracker,
    carbon: liveCarbon,
    footprintScore: liveCarbon,
    totalXp: liveXp,
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
  const getPrevDay = (dateStr) => {
    const d = new Date(dateStr);
    d.setUTCDate(d.getUTCDate() - 1);
    return d.toISOString().slice(0, 10);
  };

  let streakDays = 0;
  let cursorStr = new Date().toISOString().slice(0, 10);
  
  if (!activityDates.has(cursorStr)) {
    cursorStr = getPrevDay(cursorStr);
  }

  while (activityDates.has(cursorStr)) {
    streakDays += 1;
    cursorStr = getPrevDay(cursorStr);
  }

  return (
    <div>
      <EcoDashboardHeader
        userName={userName}
        streakDays={streakDays}
        currentDate={new Date()}
        onLogout={onLogout}
      />

      {tracker.supported.motion && tracker.motionPermission !== 'granted' ? (
        <section className="card-white" style={{ padding: 16, marginTop: 20 }}>
          <h3 style={{ color: 'var(--forest)', fontSize: 18, marginBottom: 8 }}>Enable motion tracking</h3>
          <p style={{ color: 'var(--gray-600)', margin: 0, lineHeight: 1.6 }}>
            {tracker.motionPermission === 'denied'
              ? 'Motion permission is currently blocked, so step updates may stop or lag behind.'
              : 'Allow motion sensors to keep step counting continuous and more accurate on mobile browsers.'}
          </p>
          <button
            type="button"
            className="mini-btn"
            onClick={() => {
              void tracker.requestMotionAccess();
            }}
            style={{ marginTop: 12 }}
          >
            {tracker.motionPermission === 'denied' ? 'Try again' : 'Enable now'}
          </button>
        </section>
      ) : null}

      <HeroCard deviceData={dashboardData} compact />

      {tracker.movementMode === 'cycling' && (
        <CyclingCelebrationCard 
          distanceKm={tracker.estimatedDistance || 0.1} 
          co2SavedKg={(tracker.estimatedDistance || 0.1) * 0.192} 
        />
      )}

      {storedEmail && (
        <DailyQuestsCard 
          userId={storedEmail} 
          onQuestCompleted={(data) => {
            // Optimistically update footprint locally 
            const todayKey = new Date().toISOString().slice(0, 10);
            try {
              const existing = JSON.parse(localStorage.getItem(`eco_daily_${todayKey}`) || '{}');
              localStorage.setItem(
                `eco_daily_${todayKey}`,
                JSON.stringify({ ...existing, carbon: data.new_carbon_footprint })
              );
            } catch {}
          }}
        />
      )}

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

      {pendingVehicleData && !vehicleModalShown && (
        <VehicleDetectionModal 
          mode={pendingVehicleData.mode} 
          speedKmh={pendingVehicleData.speed * 3.6} // m/s to km/h
          onClose={() => {
            setPendingVehicleData(null);
            setVehicleModalShown(true);
          }}
          onConfirm={(result) => {
            setPendingVehicleData(null);
            setVehicleModalShown(true);
            
            if (result.carbonKg > 0) {
              const todayKey = new Date().toISOString().slice(0, 10);
              try {
                const existing = JSON.parse(localStorage.getItem(`eco_daily_${todayKey}`) || '{}');
                // Optimistically add the carbon
                localStorage.setItem(
                  `eco_daily_${todayKey}`,
                  JSON.stringify({ ...existing, carbon: (existing.carbon || 0) + result.carbonKg })
                );
              } catch {}
            }
          }}
        />
      )}

      {showElectricityModal && storedEmail && (
        <ElectricityBillModal 
          userId={storedEmail}
          onClose={() => {
            setShowElectricityModal(false);
            const today = new Date();
            localStorage.setItem(`eco_elec_dismissed_${today.getFullYear()}_${today.getMonth()}`, 'true');
          }}
          onComplete={(data) => {
            // Optimistically update daily footprint
            const todayKey = new Date().toISOString().slice(0, 10);
            try {
              const existing = JSON.parse(localStorage.getItem(`eco_daily_${todayKey}`) || '{}');
              localStorage.setItem(
                `eco_daily_${todayKey}`,
                JSON.stringify({ ...existing, carbon: (existing.carbon || 0) + data.dailyKgCO2Contribution })
              );
            } catch {}
          }}
        />
      )}
    </div>
  );
}

export default DashboardView;
