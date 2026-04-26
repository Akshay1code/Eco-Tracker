import { useEffect, useMemo, useState } from 'react';
import {
  MdDirectionsWalk, MdCo2, MdTimer, MdLocalFireDepartment, MdStraighten, 
  MdTrendingDown, MdTrendingUp, MdPieChart, MdListAlt, MdSearch, 
  MdRestaurant, MdTrain, MdBolt, MdShoppingBag, MdDirectionsBike, MdMilitaryTech, 
  MdTrackChanges, MdCheckCircle, MdEmojiEvents, MdChevronLeft, MdChevronRight
} from 'react-icons/md';
import { ResponsiveContainer, BarChart, Bar, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, PieChart, Pie, Cell } from 'recharts';
import clsx from 'clsx';
import TopBar from '../components/layout/TopBar.jsx';
import useDailyActivityRecords from '../hooks/useDailyActivityRecords.js';
import useUserProfile from '../hooks/useUserProfile.js';
import useDeviceCarbonTracker from '../hooks/useDeviceCarbonTracker.ts';
import '../styles/activity.css';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{ backgroundColor: '#fff', border: '1px solid rgba(105,240,122,0.25)', borderRadius: '12px', padding: '10px', boxShadow: '0 4px 16px rgba(27,94,32,0.1)' }}>
        <p style={{ margin: 0, fontSize: '12px', color: '#81c784' }}>{label}</p>
        <p style={{ margin: 0, fontWeight: 'bold', color: '#1b5e20' }}>
          {payload[0].value} {payload[0].name === 'co2' ? 'kg' : ''}
        </p>
      </div>
    );
  }
  return null;
};

export default function ActivityView({ onLogout }) {
  const storedEmail = typeof window !== 'undefined' ? localStorage.getItem('userEmail') : null;
  const { records, todayRecord } = useDailyActivityRecords(storedEmail);
  const { user: backendUser } = useUserProfile(storedEmail);
  const tracker = useDeviceCarbonTracker(storedEmail, todayRecord);

  const [chartMode, setChartMode] = useState('CO₂');
  const [logFilter, setLogFilter] = useState('All');
  const [logSearch, setLogSearch] = useState('');
  const [activeMonth, setActiveMonth] = useState('April 2026');

  // Use real-time tracker values (which include persisted baseline + live session)
  const liveSteps = tracker.steps;
  const liveDistance = tracker.distance;
  const liveActiveMin = tracker.activeMinutes;
  const liveCalories = tracker.caloriesBurned;
  const liveCarbonEmission = todayRecord?.carbon_emission || tracker.carbon;

  const LIVE_STATS_MAP = useMemo(() => [
    { id:'steps',    label:'Steps Taken',    sublabel:'of 10,000 goal', icon: MdDirectionsWalk,  color:'#2e7d32', colorLight:'#a5d6a7', value: liveSteps,  goal: 10000, unit:'',     live: true  },
    { id:'carbon',   label:'Carbon Emitted', sublabel:'today',          icon: MdCo2,             color:'#00897b', colorLight:'#80cbc4', value: parseFloat(liveCarbonEmission.toFixed(4)),  goal: 2.0,   unit:'kg',   live: false },
    { id:'active',   label:'Active Time',    sublabel:'today',          icon: MdTimer,           color:'#f57c00', colorLight:'#ffcc80', value: liveActiveMin,   goal: 480,   unit:'min',  live: true  },
    { id:'calories', label:'Calories Burned',sublabel:'estimated',      icon: MdLocalFireDepartment, color:'#e53935', colorLight:'#ef9a9a', value: parseFloat(liveCalories.toFixed(1)), goal: 600, unit:'kcal', live: false },
    { id:'distance', label:'Distance',       sublabel:'walked today',   icon: MdStraighten,      color:'#0277bd', colorLight:'#81d4fa', value: parseFloat(liveDistance.toFixed(2)),   goal: 10,    unit:'km',   live: true  },
  ], [liveSteps, liveCarbonEmission, liveActiveMin, liveCalories, liveDistance]);

  const WEEKLY_DATA_STRC = useMemo(() => {
    const last7 = [...records].reverse().slice(0, 7).reverse();
    return last7.map(r => ({
      day: new Date(r.date).toLocaleDateString('en-US', { weekday: 'short' }),
      co2: r.carbon_emission,
      steps: r.steps,
      active: r.active_time
    }));
  }, [records]);

  const ACTIVITY_LOG_DATA = useMemo(() => {
    const logs = todayRecord?.activity_logs || [];
    return logs.map((l, i) => {
      const type = l.activity?.charAt(0).toUpperCase() + l.activity?.slice(1) || 'Walking';
      let icon = MdDirectionsWalk;
      let color = '#2e7d32';
      let colorLight = '#a5d6a7';

      if (type === 'Cycling') { icon = MdDirectionsBike; color = '#6a1b9a'; colorLight = '#ce93d8'; }
      if (type === 'Transport') { icon = MdTrain; color = '#0277bd'; colorLight = '#81d4fa'; }

      return {
        id: i,
        type,
        name: `${type} Activity`,
        time: new Date(l.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        duration: l.duration || '—',
        co2: (l.distance_moved / 1000 * 0.192).toFixed(2),
        xp: Math.round(l.distance_moved / 100 * 2),
        icon,
        color,
        colorLight
      };
    }).reverse();
  }, [todayRecord]);

  const CARBON_SOURCES_DIST = useMemo(() => {
    const total = todayRecord?.carbon_emission || 0;
    if (total === 0) return [
      { name: 'Transport', value: 0, color: '#43a047' },
      { name: 'Devices', value: 0, color: '#69f07a' },
      { name: 'Others', value: 0, color: '#0277bd' },
    ];
    // Simple heuristic split for UX
    return [
      { name: 'Transport', value: parseFloat((total * 0.6).toFixed(2)), color: '#43a047' },
      { name: 'Devices', value: parseFloat((total * 0.3).toFixed(2)), color: '#69f07a' },
      { name: 'Others', value: parseFloat((total * 0.1).toFixed(2)), color: '#0277bd' },
    ];
  }, [todayRecord]);



  const DAILY_GOALS_LIST = useMemo(() => [
    { icon: MdDirectionsWalk, label:'10,000 steps',     current: liveSteps,  target:10000, unit:'steps', color:'#2e7d32' },
    { icon: MdCo2,            label:'Under 2.0 kg CO₂', current: parseFloat(liveCarbonEmission.toFixed(2)),  target:2.0,   unit:'kg',    color:'#00897b' },
    { icon: MdTimer,          label:'60 min active',     current: liveActiveMin,   target:60,   unit:'min',   color:'#f57c00' },
    { icon: MdLocalFireDepartment, label:'500 kcal burned', current: parseFloat(liveCalories.toFixed(1)), target:500, unit:'kcal',  color:'#e53935' },
    { icon: MdStraighten,     label:'8 km distance',     current: parseFloat(liveDistance.toFixed(2)),   target:8,     unit:'km',    color:'#0277bd' },
  ], [liveSteps, liveCarbonEmission, liveActiveMin, liveCalories, liveDistance]);

  const filteredLog = useMemo(() =>
    ACTIVITY_LOG_DATA
      .filter(e => logFilter === 'All' || e.type === logFilter)
      .filter(e => e.name.toLowerCase().includes(logSearch.toLowerCase())),
    [ACTIVITY_LOG_DATA, logFilter, logSearch]
  );



  const chartDataKey = chartMode === 'CO₂' ? 'co2' : chartMode.toLowerCase();

  return (
    <div className="activity-page">
      <TopBar activeTab="activity" onLogout={onLogout} />

      <section>
        <h2 className="activity-section-title">Live Stats</h2>
        <p className="activity-section-subtitle">Real-time metrics for today</p>
        <div className="activity-live-grid">
          {LIVE_STATS_MAP.map(stat => {
            const Icon = stat.icon;
            const pct = Math.min(100, Math.round((stat.value / stat.goal) * 100));
            return (
              <div key={stat.id} className="live-stat-card">
                <div className="live-stat-top">
                  <div className="live-stat-icon-badge" style={{ background: `linear-gradient(135deg, ${stat.colorLight}, ${stat.color})` }}>
                    <Icon />
                  </div>
                  {stat.live && (
                    <div className="live-indicator">
                      <div className="pulse-dot" /> LIVE
                    </div>
                  )}
                </div>
                <div>
                  <div className="live-stat-value" style={{ color: stat.color }}>
                    {stat.value}
                  </div>
                  <div className="live-stat-label">{stat.label}</div>
                  <div className="live-stat-sublabel">{stat.sublabel}</div>
                </div>
                <div className="live-stat-bar-bg">
                  <div className="live-stat-bar-fill" style={{ width: `${pct}%` }} />
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section className="activity-card activity-card-padded">
        <div className="chart-header">
          <div>
            <h2 className="activity-section-title" style={{ fontSize: '1.25rem' }}>Weekly Trend</h2>
            <p className="activity-section-subtitle" style={{ marginBottom: 0 }}>Activity over the last 7 days</p>
          </div>
          <div className="chart-toggles">
            {['CO₂', 'Steps', 'Active'].map(tab => (
              <button
                key={tab}
                type="button"
                className={clsx('chart-toggle-pill', chartMode === tab ? 'chart-toggle-pill--active' : 'chart-toggle-pill--inactive')}
                onClick={() => setChartMode(tab)}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        <div style={{ height: '260px' }}>
          <ResponsiveContainer width="100%" height="100%">
            {chartMode === 'Steps' || chartMode === 'Active' ? (
              <BarChart data={WEEKLY_DATA_STRC}>
                <defs>
                  <linearGradient id="ecoGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#43a047" />
                    <stop offset="100%" stopColor="#69f07a" />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(105,240,122,0.15)" />
                <XAxis dataKey="day" tick={{ fill: '#81c784', fontSize: 12 }} />
                <YAxis tick={{ fill: '#81c784', fontSize: 11 }} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey={chartDataKey} fill="url(#ecoGradient)" radius={[8, 8, 0, 0]} />
              </BarChart>
            ) : (
              <AreaChart data={WEEKLY_DATA_STRC}>
                <defs>
                  <linearGradient id="ecoGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#43a047" stopOpacity={0.5}/>
                    <stop offset="100%" stopColor="#69f07a" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(105,240,122,0.15)" />
                <XAxis dataKey="day" tick={{ fill: '#81c784', fontSize: 12 }} />
                <YAxis tick={{ fill: '#81c784', fontSize: 11 }} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey={chartDataKey} stroke="#43a047" strokeWidth={2.5} fillOpacity={1} fill="url(#ecoGradient)" dot={{ fill: '#2e7d32', r: 4 }} activeDot={{ r: 7, fill: '#69f07a' }} />
              </AreaChart>
            )}
          </ResponsiveContainer>
        </div>
      </section>

      <section className="monthly-banner">
        <div className="monthly-header">
          <h2 className="monthly-title">Monthly Summary</h2>
          <div className="month-selector">
            <MdChevronLeft style={{ cursor: 'pointer' }} />
            {activeMonth}
            <MdChevronRight style={{ cursor: 'pointer' }} />
          </div>
        </div>
        <div className="monthly-stats-grid">
          <div className="monthly-stat-block">
            <div className="monthly-stat-label">Avg Footprint</div>
            <div className="monthly-stat-value">0.43 kg</div>
            <div className="monthly-stat-sub">per day</div>
            <MdCo2 className="monthly-stat-icon" />
          </div>
          <div className="monthly-stat-block">
            <div className="monthly-stat-label">Total Steps</div>
            <div className="monthly-stat-value">{liveSteps}</div>
            <div className="monthly-stat-sub">this month</div>
            <MdDirectionsWalk className="monthly-stat-icon" />
          </div>
          <div className="monthly-stat-block">
            <div className="monthly-stat-label">Best Day</div>
            <div className="monthly-stat-value">0.29 kg</div>
            <div className="monthly-stat-sub">lowest CO₂</div>
            <MdEmojiEvents className="monthly-stat-icon" />
          </div>
          <div className="monthly-stat-block">
            <div className="monthly-stat-label">Active Time</div>
            <div className="monthly-stat-value">{liveActiveMin} min</div>
            <div className="monthly-stat-sub">total session</div>
            <MdTimer className="monthly-stat-icon" />
          </div>
        </div>
      </section>

      <section>
        <div className="activity-card activity-card-padded">
          <h2 className="donut-card-title"><MdPieChart style={{ color: '#69f07a' }} /> Carbon Sources</h2>
          <div style={{ position: 'relative', height: '220px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={CARBON_SOURCES_DIST} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={4} dataKey="value" cornerRadius={6}>
                  {CARBON_SOURCES_DIST.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="donut-center">
              <div className="donut-total">{parseFloat(liveCarbonEmission.toFixed(4))} kg</div>
              <div className="donut-sub">today</div>
            </div>
          </div>
        </div>
      </section>

      <section className="activity-card">
        <div className="log-header">
          <h2 className="log-title"><MdListAlt style={{ color: '#69f07a' }} /> Activity Log</h2>
          <div className="log-controls">
            <div className="log-search">
              <MdSearch style={{ color: 'var(--eco-mint)', fontSize: '1rem' }} />
              <input type="text" placeholder="Search activities..." value={logSearch} onChange={e => setLogSearch(e.target.value)} />
            </div>
            <select className="log-filter" value={logFilter} onChange={e => setLogFilter(e.target.value)}>
              <option value="All">All</option>
              <option value="Walking">Walking</option>
              <option value="Cycling">Cycling</option>
            </select>
          </div>
        </div>
        <div className="log-table-header">
          <div>#</div><div>Activity</div><div>Duration</div><div>CO₂</div><div>XP Earned</div>
        </div>
        <div>
          {filteredLog.length === 0 ? <div style={{ padding: '2rem', textAlign: 'center', opacity: 0.6 }}>No activities logged for today.</div> : 
            filteredLog.map((log, index) => {
              const Icon = log.icon;
              let co2BadgeClass = 'badge-co2-low';
              if (log.co2 > 0.3) co2BadgeClass = 'badge-co2-high';
              else if (log.co2 >= 0.1) co2BadgeClass = 'badge-co2-mid';
              
              return (
                <div key={log.id} className="log-row">
                  <div className="log-index">{String(index + 1).padStart(2, '0')}</div>
                  <div className="log-activity-cell">
                    <div className="log-icon-badge" style={{ background: `linear-gradient(135deg, ${log.colorLight}, ${log.color})` }}>
                      <Icon />
                    </div>
                    <div>
                      <div className="log-name">{log.name}</div>
                      <div className="log-time">{log.time}</div>
                    </div>
                  </div>
                  <div className="log-duration">{log.duration}</div>
                  <div>
                    <span className={clsx('badge-base', co2BadgeClass)}>{log.co2} kg</span>
                  </div>
                  <div>
                    <span className="badge-base badge-xp">+{log.xp} XP</span>
                  </div>
                </div>
              );
            })
          }
        </div>
      </section>

      <section className="two-col-grid">
        <div className="activity-card activity-card-padded">
          <div className="records-card-title">
            <MdMilitaryTech style={{ color: 'var(--xp-gold)', fontSize: '1.25rem' }} /> Personal Records
          </div>
          <div>
            {[
              { id: 1, name: 'Steps today', value: liveSteps, date: 'Live' },
              { id: 2, name: 'CO₂ today', value: parseFloat(liveCarbonEmission.toFixed(4)) + ' kg', date: 'Live' },
              { id: 3, name: 'Distance today', value: parseFloat(liveDistance.toFixed(2)) + ' km', date: 'Live' },
              { id: 4, name: 'XP Earned', value: todayRecord?.xp_earned || 0, date: 'Today' },
              { id: 5, name: 'Calories', value: parseFloat(liveCalories.toFixed(1)) + ' kcal', date: 'Live' },
            ].map((rec, i) => (
              <div key={rec.id} className="record-row">
                <div className="record-rank">{i + 1}</div>
                <div className="record-name">{rec.name}</div>
                <div className="record-val">{rec.value}</div>
                <div className="record-date">{rec.date}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="activity-card activity-card-padded">
          <div className="goals-card-header">
            <div className="records-card-title" style={{ marginBottom: 0 }}>
              <MdTrackChanges style={{ color: 'var(--eco-lime)', fontSize: '1.25rem' }} /> Daily Goals
            </div>
          </div>
          <div>
            {DAILY_GOALS_LIST.map(goal => {
              const Icon = goal.icon;
              const pct = Math.min(100, Math.round((goal.current / goal.target) * 100));
              let fillBg = 'var(--eco-lime)';
              if (pct < 60) fillBg = '#ef4444';
              else if (pct < 100) fillBg = '#fbbf24';

              return (
                <div key={goal.label} className="goal-row">
                  <div className="goal-top">
                    <div className="goal-top-left">
                      <Icon style={{ color: goal.color, fontSize: '1rem' }} />
                      <div className="goal-name">{goal.label}</div>
                    </div>
                    <div className="goal-val">{goal.current} / {goal.target} {goal.unit}</div>
                  </div>
                  {pct >= 100 ? (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', marginTop: '-0.5rem' }}>
                      <MdCheckCircle style={{ color: 'var(--eco-lime)', fontSize: '1rem' }} />
                    </div>
                  ) : (
                    <div className="goal-bar-bg">
                      <div className="goal-bar-fill" style={{ width: `${pct}%`, backgroundColor: fillBg }} />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}
