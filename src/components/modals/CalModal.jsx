import Modal from '../shared/Modal.jsx';
import ProgressBar from '../shared/ProgressBar.jsx';
import { CAL_DETAIL } from '../../data/mockData.js';

function CalModal({ day, onClose }) {
  const detail = CAL_DETAIL[day] || { score: 0.0, steps: 0, dist: 0, energy: '0%', active: 0, perf: 0 };

  let plant = '\uD83C\uDF31';
  if (detail.perf >= 85) plant = '\uD83C\uDF33';
  else if (detail.perf >= 65) plant = '\uD83C\uDF3F';

  return (
    <Modal onClose={onClose} maxWidth={470}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 style={{ color: 'var(--forest)', fontSize: 26 }}>Day {day} Snapshot</h3>
        <button type="button" className="mini-btn" onClick={onClose}>Close</button>
      </div>

      <div style={{ marginTop: 10, fontSize: 46 }}>{plant}</div>
      <p style={{ color: 'var(--gray-600)', marginTop: 8 }}>Carbon score: {detail.score.toFixed(2)} kg CO2</p>

      <div style={{ marginTop: 14 }}>
        <div style={{ fontSize: 13, color: 'var(--gray-600)', marginBottom: 6 }}>Performance</div>
        <ProgressBar value={detail.perf} color="linear-gradient(90deg, #22c55e, #6ee7b7)" height={10} />
      </div>

      <div style={{ marginTop: 18, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        <div className="mini-stat"><span>Steps</span><strong>{detail.steps}</strong></div>
        <div className="mini-stat"><span>Distance</span><strong>{detail.dist} km</strong></div>
        <div className="mini-stat"><span>Energy</span><strong>{detail.energy}</strong></div>
        <div className="mini-stat"><span>Active</span><strong>{detail.active} min</strong></div>
      </div>
    </Modal>
  );
}

export default CalModal;
