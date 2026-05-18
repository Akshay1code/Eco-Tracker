import Modal from '../shared/Modal.jsx';

function TrackerAlertModal({ alert, onClose }) {
  if (!alert) {
    return null;
  }

  return (
    <Modal onClose={onClose} maxWidth={440}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 style={{ color: 'var(--forest)', fontSize: 26 }}>{alert.title}</h3>
        <button type="button" className="mini-btn" onClick={onClose}>
          Close
        </button>
      </div>

      <div style={{ marginTop: 12, fontSize: 44 }}>🔋</div>
      <p style={{ color: 'var(--gray-600)', marginTop: 8, lineHeight: 1.6 }}>{alert.message}</p>

      <div
        className="card-white"
        style={{
          marginTop: 14,
          padding: 14,
          borderRadius: 16,
          background: 'linear-gradient(135deg, rgba(34,197,94,.12), rgba(16,185,129,.08))',
          borderColor: 'rgba(34,197,94,.18)',
        }}
      >
        <div style={{ color: 'var(--forest)', fontWeight: 700 }}>Battery Update</div>
        <div style={{ color: 'var(--gray-600)', marginTop: 6, fontSize: 14 }}>
          Eco Tracker will surface friendly charging alerts here while keeping monitoring lightweight.
        </div>
      </div>
    </Modal>
  );
}

export default TrackerAlertModal;
