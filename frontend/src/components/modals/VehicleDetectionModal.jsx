import React, { useState } from 'react';
import Modal from '../shared/Modal.jsx';
import { MdClose, MdDirectionsBike, MdDirectionsBus, MdDirectionsCar, MdPedalBike, MdTrain } from 'react-icons/md';
import { submitTransportCarbon } from '../../lib/userApi.js';

const TRANSPORT_OPTIONS = [
  {
    value: 'two_wheeler_petrol',
    label: 'Two-Wheeler',
    Icon: MdDirectionsBike,
    factorKgPerKm: 0.04,
    styles: { background: '#fff7ed', border: '1px solid #fdba74', color: '#9a3412' },
  },
  {
    value: 'car_petrol',
    label: 'Petrol Car',
    Icon: MdDirectionsCar,
    factorKgPerKm: 0.14,
    styles: { background: '#fef2f2', border: '1px solid #fca5a5', color: '#991b1b' },
  },
  {
    value: 'car_diesel',
    label: 'Diesel Car',
    Icon: MdDirectionsCar,
    factorKgPerKm: 0.155,
    styles: { background: '#fefce8', border: '1px solid #fde047', color: '#854d0e' },
  },
  {
    value: 'metro_train_electric',
    label: 'Metro / Train',
    Icon: MdTrain,
    factorKgPerKm: 0.02,
    styles: { background: '#e0f2fe', border: '1px solid #7dd3fc', color: '#075985' },
  },
  {
    value: 'bus_diesel_city',
    label: 'Bus',
    Icon: MdDirectionsBus,
    factorKgPerKm: 0.05,
    styles: { background: '#f0fdf4', border: '1px solid #86efac', color: '#166534' },
  },
  {
    value: 'walking_cycling',
    label: 'Walking / Cycling',
    Icon: MdPedalBike,
    factorKgPerKm: 0,
    styles: { background: '#f5f3ff', border: '1px solid #c4b5fd', color: '#5b21b6' },
  },
  {
    value: 'auto_rickshaw',
    label: 'Auto-Rickshaw',
    Icon: MdDirectionsCar,
    factorKgPerKm: 0.075,
    styles: { background: '#ecfeff', border: '1px solid #67e8f9', color: '#155e75' },
  },
];

function VehicleDetectionModal({ userId, mode, speedKmh, onClose, onConfirm }) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const assumedDistanceKm = Math.max(1, (speedKmh / 60) * 10);

  const handleSelect = async (transportType) => {
    const selectedOption = TRANSPORT_OPTIONS.find((option) => option.value === transportType);
    const fallbackCarbonKg = Number((assumedDistanceKm * (selectedOption?.factorKgPerKm || 0)).toFixed(6));

    setIsSubmitting(true);
    try {
      const response = await submitTransportCarbon(userId, {
        transportType,
        distanceKm: assumedDistanceKm,
      });
      const carbonKg = Number(response?.data?.carbonKg ?? fallbackCarbonKg);
      onConfirm({ transportType, carbonKg, distanceKm: assumedDistanceKm });
    } catch (err) {
      console.error(err);
      onConfirm({ transportType, carbonKg: fallbackCarbonKg, distanceKm: assumedDistanceKm });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal onClose={onClose} maxWidth={440}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '1.25rem', color: '#1f2937' }}>Movement Detected</h2>
          <p style={{ margin: '4px 0 0', color: '#6b7280', fontSize: '0.9rem' }}>
            We noticed you&apos;re moving at ~{Math.round(speedKmh)} km/h. How are you traveling?
          </p>
          {mode ? (
            <p style={{ margin: '8px 0 0', color: '#9ca3af', fontSize: '0.8rem' }}>
              Detected mode: {String(mode).replace(/_/g, ' ')}
            </p>
          ) : null}
        </div>
        <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af' }}>
          <MdClose size={24} />
        </button>
      </header>

      <div style={{ display: 'grid', gap: '12px', marginTop: '20px' }}>
        {TRANSPORT_OPTIONS.map(({ value, label, Icon, styles }) => (
          <button
            key={value}
            onClick={() => handleSelect(value)}
            disabled={isSubmitting}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '16px',
              borderRadius: '12px',
              cursor: isSubmitting ? 'wait' : 'pointer',
              fontWeight: 600,
              ...styles,
            }}
          >
            <Icon size={24} />
            {label}
          </button>
        ))}
      </div>

      <p style={{ marginTop: '20px', fontSize: '0.8rem', color: '#9ca3af', textAlign: 'center' }}>
        Transport emissions are estimated from your India-specific dataset. Electricity and phone charging are handled separately.
      </p>
    </Modal>
  );
}

export default VehicleDetectionModal;
