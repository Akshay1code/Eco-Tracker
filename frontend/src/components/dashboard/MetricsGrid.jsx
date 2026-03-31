import { METRICS } from '../../data/mockData.js';
import MetricCard from './MetricCard.jsx';

function MetricsGrid({ metrics = METRICS }) {
  return (
    <section
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
        gap: 14,
      }}
    >
      {metrics.map((metric) => (
        <MetricCard key={metric.label} metric={metric} />
      ))}
    </section>
  );
}

export default MetricsGrid;
