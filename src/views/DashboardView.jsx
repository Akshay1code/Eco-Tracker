import TopBar from '../components/layout/TopBar.jsx';
import SectionHeader from '../components/shared/SectionHeader.jsx';
import HeroCard from '../components/dashboard/HeroCard.jsx';
import MetricsGrid from '../components/dashboard/MetricsGrid.jsx';
import EcoCalendar from '../components/dashboard/EcoCalendar.jsx';
import EcoTodos from '../components/dashboard/EcoTodos.jsx';
import QuoteCard from '../components/dashboard/QuoteCard.jsx';
import LeaderboardRow from '../components/community/LeaderboardRow.jsx';
import TrackerAlertModal from '../components/modals/TrackerAlertModal.jsx';
import { LEADERBOARD, METRICS } from '../data/mockData.js';
import useDeviceCarbonTracker from '../hooks/useDeviceCarbonTracker.ts';

function DashboardView({ onCalClick, onUserClick, onLogout, activeTab = 'dashboard' }) {
  const topFive = LEADERBOARD.slice(0, 5);
  const storedEmail = typeof window !== 'undefined' ? localStorage.getItem('userEmail') : null;
  const tracker = useDeviceCarbonTracker(storedEmail);
  const chargeCarbonProgress = Math.min((tracker.co2SavedKg / 1.5) * 100, 100);
  const caloriesProgress = Math.min((tracker.caloriesBurned / 400) * 100, 100);

  const liveMetrics = METRICS.map((metric) => {
    if (metric.label === 'Steps Walked') {
      const steps = tracker.steps || 0;
      return { ...metric, value: steps.toLocaleString(), unit: 'steps', progress: Math.min((steps / 8000) * 100, 100) };
    }
    if (metric.label === 'Distance') {
      return {
        ...metric,
        value: tracker.distance.toFixed(2),
        unit: 'km',
        progress: Math.min((tracker.distance / 5) * 100, 100),
      };
    }
    if (metric.label === 'Active Time') {
      return {
        ...metric,
        value: `${tracker.activeMinutes}`,
        unit: 'min',
        progress: Math.min((tracker.activeMinutes / 90) * 100, 100),
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
      const score = Math.max(0, Math.min(100, 100 - tracker.carbon * 100));
      return { ...metric, value: `${Math.round(score)}`, unit: '/ 100', progress: score };
    }
    return metric;
  });

  return (
    <div>
      <TopBar activeTab={activeTab} onLogout={onLogout} />
      <HeroCard deviceData={tracker} onRequestMotionAccess={tracker.requestMotionAccess} />

      <SectionHeader title="Carbon Activity Metrics" subtitle="Adaptive step detection blends accelerometer peaks, cadence rhythm, and GPS-aware validation for steadier real-time tracking." />
      <MetricsGrid metrics={liveMetrics} />

      <div className="two-col" style={{ marginTop: 20 }}>
        <EcoCalendar onDayClick={onCalClick} />

        <section className="card-white" style={{ padding: 20 }}>
          <h3 style={{ color: 'var(--forest)', fontSize: 20, marginBottom: 12 }}>Community Leaderboard</h3>
          <div style={{ display: 'grid', gap: 8 }}>
            {topFive.map((user) => (
              <LeaderboardRow key={user.rank} user={user} onClick={onUserClick} />
            ))}
          </div>
        </section>
      </div>

      <div className="two-col-wide" style={{ marginTop: 20 }}>
        <EcoTodos />
        <QuoteCard />
      </div>

      {tracker.batteryAlert ? (
        <TrackerAlertModal alert={tracker.batteryAlert} onClose={tracker.dismissBatteryAlert} />
      ) : null}
    </div>
  );
}

export default DashboardView;
