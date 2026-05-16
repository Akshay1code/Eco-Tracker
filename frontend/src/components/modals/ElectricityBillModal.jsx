import React, { useState } from 'react';
import Modal from '../shared/Modal.jsx';
import { MdElectricBolt, MdClose, MdCheckCircle } from 'react-icons/md';
import { submitElectricityBill } from '../../lib/userApi.js';

function ElectricityBillModal({ userId, onClose, onComplete }) {
  const [billAmount, setBillAmount] = useState('');
  const [unitsKwh, setUnitsKwh] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [resultData, setResultData] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!billAmount && !unitsKwh) {
      setError('Please enter either your bill amount or electricity units.');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const { data } = await submitElectricityBill(
        userId, 
        billAmount ? Number(billAmount) : undefined, 
        unitsKwh ? Number(unitsKwh) : undefined
      );
      setSuccess(true);
      setResultData(data);
      if (onComplete) onComplete(data);
    } catch (err) {
      setError(err.message || 'Failed to submit bill.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (success && resultData) {
    return (
      <Modal onClose={onClose} maxWidth={400}>
        <div style={{ textAlign: 'center', padding: '20px 0' }}>
          <MdCheckCircle size={64} color="#16a34a" style={{ marginBottom: '16px' }} />
          <h2 style={{ fontSize: '1.5rem', color: '#1f2937', margin: '0 0 8px' }}>Bill Processed!</h2>
          <p style={{ color: '#4b5563', margin: '0 0 20px' }}>
            Your monthly energy footprint adds approximately <strong>{resultData.dailyKgCO2Contribution.toFixed(2)} kg CO₂</strong> to your daily average this month.
          </p>
          <button 
            onClick={onClose}
            className="complete-btn" 
            style={{ width: '100%', padding: '12px' }}
          >
            Done
          </button>
        </div>
      </Modal>
    );
  }

  return (
    <Modal onClose={onClose} maxWidth={400}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '1.25rem', color: '#1f2937', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <MdElectricBolt color="#eab308" /> Monthly Energy Check
          </h2>
          <p style={{ margin: '6px 0 0', color: '#6b7280', fontSize: '0.9rem' }}>
            It's that time of the month! Log your latest electricity bill to keep your footprint accurate.
          </p>
        </div>
        <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af' }}>
          <MdClose size={24} />
        </button>
      </header>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div className="input-group">
          <label className="input-label">Electricity Units (kWh) <span style={{ color: '#9ca3af', fontWeight: 'normal' }}>Preferred</span></label>
          <input 
            type="number" 
            className="premium-input" 
            placeholder="e.g. 250" 
            value={unitsKwh}
            onChange={(e) => setUnitsKwh(e.target.value)}
          />
        </div>

        <div style={{ textAlign: 'center', color: '#9ca3af', fontSize: '0.8rem', fontWeight: 600 }}>OR</div>

        <div className="input-group">
          <label className="input-label">Total Bill Amount (₹)</label>
          <input 
            type="number" 
            className="premium-input" 
            placeholder="e.g. 1500" 
            value={billAmount}
            onChange={(e) => setBillAmount(e.target.value)}
          />
          <p style={{ fontSize: '0.75rem', color: '#9ca3af', margin: '6px 0 0' }}>
            We'll estimate units using the average grid rate if you enter the amount.
          </p>
        </div>

        {error && <div style={{ color: '#b91c1c', fontSize: '0.9rem', padding: '8px', background: '#fef2f2', borderRadius: '6px' }}>{error}</div>}

        <button 
          type="submit" 
          className="complete-btn" 
          disabled={isSubmitting}
          style={{ width: '100%', marginTop: '8px' }}
        >
          {isSubmitting ? 'Calculating Impact...' : 'Log Energy Usage'}
        </button>
      </form>
    </Modal>
  );
}

export default ElectricityBillModal;
