import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import EcoDashboardHeader from '../components/layout/EcoDashboardHeader.jsx';
import HeroCard from '../components/dashboard/HeroCard.jsx';
import EcoCalendar from '../components/dashboard/EcoCalendar.jsx';
import EcoTodos from '../components/dashboard/EcoTodos.jsx';
import QuoteCard from '../components/dashboard/QuoteCard.jsx';
import TrackerAlertModal from '../components/modals/TrackerAlertModal.jsx';
import useDailyActivityRecords from '../hooks/useDailyActivityRecords.js';
import useLeaderboard from '../hooks/useLeaderboard.js';
import useUserProfile from '../hooks/useUserProfile.js';
import useDeviceCarbonTracker from '../hooks/useDeviceCarbonTracker.ts';
import DailyQuestsCard from '../components/dashboard/DailyQuestsCard.jsx';
import VehicleDetectionModal from '../components/modals/VehicleDetectionModal.jsx';
import CyclingCelebrationCard from '../components/dashboard/CyclingCelebrationCard.jsx';
import ElectricityBillModal from '../components/modals/ElectricityBillModal.jsx';

function getRankTitle(xp) {
  if (xp > 5000) return 'Eco Legend';
  if (xp > 2000) return 'Green Master';
  if (xp > 1000) return 'Eco Warrior';
  if (xp > 500) return 'Seedling';
  return 'Eco Novice';
}

function DashboardView({ onCalClick, onUserClick, onLogout, activeTab = 'dashboard' }) {
  const [vehicleModalShown, setVehicleModalShown] = useState(false);
  const [pendingVehicleData, setPendingVehicleData] = useState(null);
  const [showElectricityModal, setShowElectricityModal] = useState(false);
  const [optimisticQuestImpact, setOptimisticQuestImpact] = useState(null);

  const { users: leaderboardUsers, isLoading: isLeaderboardLoading, error: leaderboardError } = useLeaderboard(50);
  const storedEmail = typeof window !== 'undefined' ? localStorage.getItem('userEmail') : null;
  const {
    records: activityRecords,
    todayRecord,
  } = useDailyActivityRecords(storedEmail, 30_000); // 30 s is sufficient — triggers keep it fresh
  const { user: userProfile, refetch: refetchProfile } = useUserProfile(storedEmail);
  const tracker = useDeviceCarbonTracker(storedEmail, todayRecord);

  useEffect(() => {
    if (!optimisticQuestImpact) return;

    const profileScore = Number(userProfile?.carbonScore);
    const todayNetCarbon = Number(todayRecord?.net_carbon_impact ?? todayRecord?.carbon_emission);
    const profileCaughtUp =
      Number.isFinite(profileScore) &&
      Math.abs(profileScore - optimisticQuestImpact.footprintScore) < 0.0001;
    const recordCaughtUp =
      Number.isFinite(todayNetCarbon) &&
      Math.abs(todayNetCarbon - optimisticQuestImpact.carbon) < 0.0001;

    if (profileCaughtUp || recordCaughtUp) {
      setOptimisticQuestImpact(null);
    }
  }, [optimisticQuestImpact, todayRecord, userProfile]);

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
  const liveCarbon =
    typeof optimisticQuestImpact?.carbon === 'number'
      ? optimisticQuestImpact.carbon
      : tracker.carbon;

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
    if (!storedEmail) return;

    const checkAndShowElectricityModal = () => {
      const now = new Date();
      const hour = now.getHours();
      const todayKey = now.toISOString().slice(0, 10);
      const shownKey = `eco_elec_shown_${storedEmail}_${todayKey}`;

      // Only show between 11:00 AM and 12:00 PM local time
      if (hour >= 11 && hour < 12) {
        if (!localStorage.getItem(shownKey)) {
          setShowElectricityModal(true);
          localStorage.setItem(shownKey, 'true');
        }
      }
    };

    // Check immediately on mount
    checkAndShowElectricityModal();

    // Then re-check every minute so it catches the 11am window if the app is already open
    const interval = setInterval(checkAndShowElectricityModal, 60_000);
    return () => clearInterval(interval);
  }, [storedEmail]);

  const footprintScore = typeof optimisticQuestImpact?.footprintScore === 'number'
    ? optimisticQuestImpact.footprintScore
    : typeof userProfile?.carbonScore === 'number'
      ? userProfile.carbonScore
      : Math.min(10, (liveCarbon / 2.0) * 10);

  const dashboardData = {
    ...tracker,
    carbon: liveCarbon,
    footprintScore: footprintScore,
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

  const normalizedUserKey = typeof storedEmail === 'string' ? storedEmail.trim().toLowerCase() : '';
  const currentLeaderboardUser = leaderboardUsers.find((user) => {
    const candidateId = typeof user?.id === 'string' ? user.id.trim().toLowerCase() : '';
    const candidateName = typeof user?.name === 'string' ? user.name.trim().toLowerCase() : '';
    const normalizedUserName = typeof userName === 'string' ? userName.trim().toLowerCase() : '';
    return candidateId === normalizedUserKey || (normalizedUserName && candidateName === normalizedUserName);
  });

  const communityRank = typeof currentLeaderboardUser?.rank === 'number' ? currentLeaderboardUser.rank : null;
  const communityXp = Number(currentLeaderboardUser?.xp ?? liveXp ?? 0);
  const communityLevel = Number(currentLeaderboardUser?.level ?? userProfile?.level ?? 1);
  const communityStreak = Number(currentLeaderboardUser?.streak ?? streakDays ?? 0);
  const communityEmission = Number(currentLeaderboardUser?.score ?? liveCarbon ?? 0);
  const communityInitial = (userName || 'E').trim().charAt(0).toUpperCase();
  const communityTitle = getRankTitle(communityXp);

  return (
    <div>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
      >
        <EcoDashboardHeader
          userName={userName}
          streakDays={streakDays}
          currentDate={new Date()}
          onLogout={onLogout}
        />
      </motion.div>

      {tracker.supported.motion && tracker.motionPermission !== 'granted' ? (
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="card-white"
          style={{ padding: 16, marginTop: 20 }}
        >
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
        </motion.section>
      ) : null}

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-40px' }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
      >
        <HeroCard deviceData={dashboardData} compact />
      </motion.div>

      {tracker.movementMode === 'cycling' && (
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        >
          <CyclingCelebrationCard 
            distanceKm={tracker.estimatedDistance || 0.1} 
            co2SavedKg={(tracker.estimatedDistance || 0.1) * 0.14} 
          />
        </motion.div>
      )}

      {storedEmail && (
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        >
          <DailyQuestsCard 
            userId={storedEmail} 
            onQuestCompleted={(data) => {
              setOptimisticQuestImpact({
                carbon: Number(data.new_net_carbon_impact ?? tracker.carbon ?? 0),
                footprintScore: Number(data.new_carbon_score ?? userProfile?.carbonScore ?? 0),
              });

              // Optimistically update today's net carbon locally based on the quest impact.
              const todayKey = new Date().toISOString().slice(0, 10);
              try {
                const existing = JSON.parse(localStorage.getItem(`eco_daily_${todayKey}`) || '{}');
                localStorage.setItem(
                  `eco_daily_${todayKey}`,
                  JSON.stringify({
                    ...existing,
                    carbon: Number(data.new_net_carbon_impact ?? existing.carbon ?? 0),
                  })
                );
              } catch {}
              if (refetchProfile) refetchProfile();
            }}
          />
        </motion.div>
      )}

      <div className="two-col" style={{ marginTop: 20 }}>
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
        >
          <EcoCalendar onDayClick={onCalClick} activeDays={activeCalendarDays} recordsByDay={calendarRecordsByDay} />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.7, ease: 'easeOut', delay: 0.1 }}
        >
          <section className="card-white" style={{ padding: 20, height: '100%' }}>
            <h3 style={{ color: 'var(--forest)', fontSize: 20, marginBottom: 12 }}>Community Leaderboard</h3>
            {isLeaderboardLoading ? <p style={{ color: 'var(--gray-600)', margin: 0 }}>Loading leaderboard...</p> : null}
            {!isLeaderboardLoading && leaderboardError ? (
              <p style={{ color: '#b91c1c', margin: 0 }}>{leaderboardError}</p>
            ) : null}
            {!isLeaderboardLoading && !leaderboardError && !leaderboardUsers.length ? (
              <p style={{ color: 'var(--gray-600)', margin: 0 }}>No community users found yet.</p>
            ) : null}
            {!isLeaderboardLoading && !leaderboardError && leaderboardUsers.length ? (
              <div
                role="button"
                tabIndex={0}
                onClick={() => currentLeaderboardUser && onUserClick?.(currentLeaderboardUser)}
                onKeyDown={(event) => {
                  if ((event.key === 'Enter' || event.key === ' ') && currentLeaderboardUser) {
                    event.preventDefault();
                    onUserClick?.(currentLeaderboardUser);
                  }
                }}
                style={{
                  borderRadius: 24,
                  padding: '22px 20px',
                  border: '1px solid rgba(110, 231, 183, 0.22)',
                  background: 'radial-gradient(circle at top right, rgba(167,243,208,0.24), transparent 32%), linear-gradient(135deg, rgba(240,250,244,0.98), rgba(232,245,233,0.92))',
                  boxShadow: '0 16px 32px rgba(34, 88, 53, 0.08)',
                  display: 'grid',
                  gap: 18,
                  cursor: currentLeaderboardUser ? 'pointer' : 'default',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16 }}>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: 12, fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--gray-600)' }}>
                      Your Community Rank
                    </div>
                    <div style={{ fontSize: 40, fontWeight: 900, lineHeight: 1, color: 'var(--forest)', marginTop: 6 }}>
                      {communityRank ? `#${String(communityRank).padStart(2, '0')}` : 'Unranked'}
                    </div>
                  </div>
                  <div
                    style={{
                      width: 56,
                      height: 56,
                      borderRadius: '50%',
                      display: 'grid',
                      placeItems: 'center',
                      flexShrink: 0,
                      background: 'linear-gradient(135deg, rgba(255,255,255,0.95), rgba(220, 252, 231, 0.9))',
                      border: '1px solid rgba(110, 231, 183, 0.2)',
                      color: 'var(--forest)',
                      fontWeight: 900,
                      fontSize: 22,
                      boxShadow: '0 8px 20px rgba(34, 88, 53, 0.08)',
                    }}
                  >
                    {communityInitial}
                  </div>
                </div>

                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--forest)', wordBreak: 'break-word' }}>{userName}</div>
                  <div style={{ fontSize: 13, color: '#5f8a6e', marginTop: 4 }}>{communityTitle}</div>
                </div>

                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
                    gap: 12,
                  }}
                >
                  {[
                    { label: 'Emission', value: `${communityEmission.toFixed(2)} kg`, tone: 'var(--forest)' },
                    { label: 'Level', value: String(communityLevel), tone: '#b45309' },
                    { label: 'Streak', value: `${communityStreak}d`, tone: '#ea580c' },
                  ].map((item) => (
                    <div
                      key={item.label}
                      style={{
                        minWidth: 0,
                        borderRadius: 18,
                        padding: '14px 12px',
                        background: 'rgba(255,255,255,0.82)',
                        border: '1px solid rgba(110, 231, 183, 0.14)',
                        boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.75)',
                      }}
                    >
                      <div style={{ fontSize: 12, fontWeight: 800, textTransform: 'uppercase', color: 'var(--gray-600)' }}>{item.label}</div>
                      <div style={{ fontSize: 22, fontWeight: 900, color: item.tone, marginTop: 8, lineHeight: 1.05, wordBreak: 'break-word' }}>
                        {item.value}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}
          </section>
        </motion.div>
      </div>

      <div style={{ marginTop: 20 }}>
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
        >
          <QuoteCard />
        </motion.div>
      </div>

      <div style={{ marginTop: 20 }}>
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
        >
          <EcoTodos userProgress={userProfile} />
        </motion.div>
      </div>

      {tracker.batteryAlert ? (
        <TrackerAlertModal alert={tracker.batteryAlert} onClose={tracker.dismissBatteryAlert} />
      ) : null}

      {pendingVehicleData && !vehicleModalShown && (
        <VehicleDetectionModal 
          userId={storedEmail}
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
            if (refetchProfile) refetchProfile();
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
            if (refetchProfile) refetchProfile();
          }}
        />
      )}
    </div>
  );
}

export default DashboardView;
