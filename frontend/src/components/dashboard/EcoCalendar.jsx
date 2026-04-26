import { MdChevronLeft, MdChevronRight } from 'react-icons/md';
import './Dashboard.css';

const DAY_HEADERS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

function EcoCalendar({ onDayClick, activeDays = new Set(), recordsByDay = {} }) {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const currentDay = now.getDate();

  const first = new Date(year, month, 1).getDay();
  const totalDays = new Date(year, month + 1, 0).getDate();
  const slots = Array.from({ length: 42 }, (_, i) => i - first + 1);

  const getDayStatus = (day) => {
    const record = recordsByDay[day];
    if (!record) return null;
    const carbon = record.carbon_emission || 0;
    if (carbon < 0.2) return 'green';
    if (carbon < 0.5) return 'amber';
    return 'red';
  };

  return (
    <section className="calendar-card">
      <header className="calendar-header">
        <h3 className="calendar-title">Eco Calendar</h3>
        <div className="calendar-nav">
          <button className="nav-btn"><MdChevronLeft /></button>
          <span style={{ fontWeight: 700, minWidth: '100px', textAlign: 'center' }}>
            {new Intl.DateTimeFormat('en-US', { month: 'short', year: 'numeric' }).format(now)}
          </span>
          <button className="nav-btn"><MdChevronRight /></button>
        </div>
      </header>

      <div className="calendar-grid">
        {DAY_HEADERS.map(day => (
          <div key={day} className="day-label">{day}</div>
        ))}

        {slots.map((day, idx) => {
          const isCurrentMonth = day >= 1 && day <= totalDays;
          if (!isCurrentMonth) return <div key={idx} />;

          const status = getDayStatus(day);
          const isToday = day === currentDay;

          return (
            <button 
              key={idx} 
              className={`date-cell ${isToday ? 'today' : ''}`}
              onClick={() => onDayClick?.(day)}
            >
              {day}
              {status && (
                <div className="dot-row">
                  <div className={`dot dot-${status}`} />
                </div>
              )}
            </button>
          );
        })}
      </div>

      <footer className="calendar-legend">
        <div className="legend-item">
          <div className="legend-dot dot-green" /> Good
        </div>
        <div className="legend-item">
          <div className="legend-dot dot-amber" /> Moderate
        </div>
        <div className="legend-item">
          <div className="legend-dot dot-red" /> High CO₂
        </div>
      </footer>
    </section>
  );
}

export default EcoCalendar;
