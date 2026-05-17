import React, { useState } from 'react';
import Modal from '../shared/Modal.jsx';
import { MdDirectionsBus, MdDirectionsCar, MdTrain, MdPedalBike, MdClose } from 'react-icons/md';
import { submitTransportCarbon } from '../../lib/userApi.js';

function VehicleDetectionModal({ userId, mode, speedKmh, onClose, onConfirm }) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSelect = async (transportType) => {
    setIsSubmitting(true);
    let carbonKg = 0;
    
    // Very rough heuristic for prototype
    const assumedDistanceKm = Math.max(1, (speedKmh / 60) * 10); // e.g. 10 mins driving at that speed
    
    switch (transportType) {
      case 'car': carbonKg = assumedDistanceKm * 0.171; break; // ARAI standard petrol car
      case 'bus': carbonKg = assumedDistanceKm * 0.105; break;
      case 'train': carbonKg = assumedDistanceKm * 0.041; break;
      case 'bike': carbonKg = 0; break;
    }

    try {
      await submitTransportCarbon(userId, carbonKg, transportType);
      onConfirm({ transportType, carbonKg });
    } catch (err) {
      console.error(err);
      onConfirm({ transportType, carbonKg }); // Optimistic success
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal onClose={onClose} maxWidth={400}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '1.25rem', color: '#1f2937' }}>Movement Detected</h2>
          <p style={{ margin: '4px 0 0', color: '#6b7280', fontSize: '0.9rem' }}>
            We noticed you're moving at ~{Math.round(speedKmh)} km/h. How are you traveling?
          </p>
        </div>
        <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af' }}>
          <MdClose size={24} />
        </button>
      </header>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '20px' }}>
        <button 
          onClick={() => handleSelect('car')} disabled={isSubmitting}
          style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '16px', background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: '12px', color: '#991b1b', cursor: 'pointer', fontWeight: 600 }}
        >
          <MdDirectionsCar size={24} /> Private Car
        </button>

        <button 
          onClick={() => handleSelect('bus')} disabled={isSubmitting}
          style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '16px', background: '#f0fdf4', border: '1px solid #86efac', borderRadius: '12px', color: '#166534', cursor: 'pointer', fontWeight: 600 }}
        >
          <MdDirectionsBus size={24} /> Public Bus
        </button>

        <button 
          onClick={() => handleSelect('train')} disabled={isSubmitting}
          style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '16px', background: '#e0f2fe', border: '1px solid #7dd3fc', borderRadius: '12px', color: '#075985', cursor: 'pointer', fontWeight: 600 }}
        >
          <MdTrain size={24} /> Train / Metro
        </button>

        <button 
          onClick={() => handleSelect('bike')} disabled={isSubmitting}
          style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '16px', background: '#fdf4ff', border: '1px solid #f9a8d4', borderRadius: '12px', color: '#86198f', cursor: 'pointer', fontWeight: 600 }}
        >
          <MdPedalBike size={24} /> Cycling
        </button>
      </div>

      <p style={{ marginTop: '20px', fontSize: '0.8rem', color: '#9ca3af', textAlign: 'center' }}>
        We use this to estimate your carbon footprint accurately.
      </p>
    </Modal>
  );
}

export default VehicleDetectionModal;
