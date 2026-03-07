import TopBar from '../components/layout/TopBar.jsx';
import SectionHeader from '../components/shared/SectionHeader.jsx';
import StatChip from '../components/shared/StatChip.jsx';
import { ACTIVITY_LOG, WEEKLY_CO2 } from '../data/mockData.js';

function borderColor(status) {
  if (status === 'good') return '#16a34a';
  if (status === 'avg') return '#f59e0b';
  return '#ef4444';
}

function ActivityView({ onLogout, activeTab = 'activity' }) {
  const max = Math.max(...WEEKLY_CO2);

  return (
    <div>
      <TopBar activeTab={activeTab} onLogout={onLogout} />

      <SectionHeader title="Weekly CO2 Trend" subtitle="Last 7 days of footprint intensity." />
      <section className="card-white" style={{ padding: 20 }}>
        <div style={{ display: 'flex', alignItems: 'end', gap: 12, height: 180 }}>
          {WEEKLY_CO2.map((value, i) => (
            <div key={i} style={{ flex: 1, textAlign: 'center' }}>
              <div
                className="bar-grow"
                style={{
                  height: `${(value / max) * 100}%`,
                  minHeight: 20,
                  borderRadius: '10px 10px 0 0',
                  background: 'linear-gradient(180deg, #4ade80, #166534)',
                }}
              />
              <div style={{ marginTop: 8, fontSize: 12, color: 'var(--gray-600)' }}>D{i + 1}</div>
            </div>
          ))}
        </div>
      </section>

      <SectionHeader title="Monthly Summary" />
      <section className="card-dark" style={{ padding: 20 }}>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <StatChip label="Avg Footprint" value="0.43 kg" />
          <StatChip label="Total Steps" value="21,584" />
          <StatChip label="Best Day" value="0.35 kg" />
          <StatChip label="Active Time" value="352 min" />
        </div>
      </section>

      <SectionHeader title="Activity Log" />
      <div style={{ display: 'grid', gap: 10 }}>
        {ACTIVITY_LOG.map((item) => (
          <article
            key={item.date}
            className="card-white"
            style={{
              padding: 14,
              borderLeft: `6px solid ${borderColor(item.status)}`,
              borderTopLeftRadius: 0,
              borderBottomLeftRadius: 0,
            }}
          >
            <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 8, alignItems: 'center' }}>
              <div>
                <div style={{ color: 'var(--forest)', fontWeight: 700 }}>{item.date}</div>
                <div style={{ color: 'var(--gray-600)', fontSize: 13 }}>{item.steps} steps • {item.dist} km</div>
              </div>
              <strong style={{ color: 'var(--deep)' }}>{item.footprint.toFixed(2)} kg CO2</strong>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

export default ActivityView;

