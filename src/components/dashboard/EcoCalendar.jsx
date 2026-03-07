import { CAL_DATA } from '../../data/mockData.js';

const DAY_HEADERS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

function EcoCalendar({ onDayClick }) {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const currentDay = now.getDate();

  const first = new Date(year, month, 1).getDay();
  const totalDays = new Date(year, month + 1, 0).getDate();
  const slots = Array.from({ length: 42 }, (_, i) => i - first + 1);

  return (
    <section className="card-white" style={{ padding: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <h3 style={{ color: 'var(--forest)', fontSize: 20 }}>Eco Calendar</h3>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <button type="button" className="mini-btn" aria-label="Previous month">?</button>
          <strong style={{ color: 'var(--gray-600)' }}>
            {new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' }).format(now)}
          </strong>
          <button type="button" className="mini-btn" aria-label="Next month">?</button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 8, marginBottom: 8 }}>
        {DAY_HEADERS.map((day) => (
          <div key={day} style={{ textAlign: 'center', color: 'var(--gray-600)', fontSize: 12, fontWeight: 700 }}>
            {day}
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 8 }}>
        {slots.map((day, idx) => {
          const out = day < 1 || day > totalDays;
          if (out) {
            return <div key={idx} style={{ height: 36 }} />;
          }

          const hasData = Boolean(CAL_DATA[day]);
          const classes = ['cal-day'];
          if (hasData) classes.push('has-data');
          if (day === currentDay) classes.push('today');

          return (
            <button
              key={idx}
              type="button"
              className={classes.join(' ')}
              onClick={() => onDayClick?.(day)}
              aria-label={`Day ${day}`}
            >
              {day}
            </button>
          );
        })}
      </div>
    </section>
  );
}

export default EcoCalendar;
