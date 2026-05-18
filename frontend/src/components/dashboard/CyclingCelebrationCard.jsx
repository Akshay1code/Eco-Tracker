import React, { useEffect, useState } from 'react';
import { MdPedalBike, MdClose } from 'react-icons/md';

function CyclingCelebrationCard({ distanceKm, co2SavedKg }) {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  return (
    <div style={{
      background: 'linear-gradient(135deg, #dcfce7, #bbf7d0)',
      border: '1px solid #86efac',
      borderRadius: '16px',
      padding: '20px',
      marginTop: '20px',
      display: 'flex',
      alignItems: 'flex-start',
      gap: '16px',
      position: 'relative',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)'
    }}>
      <button 
        onClick={() => setIsVisible(false)}
        style={{ position: 'absolute', top: '12px', right: '12px', background: 'none', border: 'none', cursor: 'pointer', color: '#166534' }}
      >
        <MdClose size={20} />
      </button>

      <div style={{ background: '#16a34a', color: 'white', padding: '12px', borderRadius: '50%' }}>
        <MdPedalBike size={32} />
      </div>

      <div>
        <h3 style={{ margin: 0, color: '#166534', fontSize: '1.2rem', fontWeight: 700 }}>Great job choosing to cycle!</h3>
        <p style={{ margin: '4px 0 0', color: '#15803d', fontSize: '0.95rem' }}>
          You've ridden ~{distanceKm.toFixed(1)} km so far.
        </p>
        <div style={{ marginTop: '12px', display: 'inline-block', background: '#ffffff', color: '#166534', padding: '6px 12px', borderRadius: '99px', fontSize: '0.85rem', fontWeight: 600, border: '1px solid #bbf7d0' }}>
          Avoided {co2SavedKg.toFixed(2)} kg CO₂
        </div>
      </div>
    </div>
  );
}

export default CyclingCelebrationCard;
