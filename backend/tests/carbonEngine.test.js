import test from 'node:test';
import assert from 'node:assert/strict';
import {
  ACTIVE_TRAVEL_SAVED_KG_PER_KM,
  INDIA_GRID_EMISSION_FACTOR,
  calculateTransportCarbonKg,
  getTransportEmissionProfile,
  resolveTransportModeKey,
} from '../constants.js';

function calculateQuestCarbonReduction(difficulty) {
  switch (difficulty) {
    case 'easy': return 0.5;
    case 'medium': return 1.5;
    case 'hard': return 3.0;
    default: return 0.0;
  }
}

function calculateQuestXp(difficulty) {
  switch (difficulty) {
    case 'easy': return 10;
    case 'medium': return 30;
    case 'hard': return 75;
    default: return 0;
  }
}

function calculateMonthlyElectricityCarbon(unitsKwh) {
  return Number((unitsKwh * INDIA_GRID_EMISSION_FACTOR).toFixed(6));
}

function calculateDailyElectricityCarbon(unitsKwh, daysInMonth) {
  const monthly = calculateMonthlyElectricityCarbon(unitsKwh);
  return Number((monthly / daysInMonth).toFixed(6));
}

test('Carbon Engine Formulas', async (t) => {
  await t.test('Quest Carbon Reduction', () => {
    assert.equal(calculateQuestCarbonReduction('easy'), 0.5);
    assert.equal(calculateQuestCarbonReduction('medium'), 1.5);
    assert.equal(calculateQuestCarbonReduction('hard'), 3.0);
    assert.equal(calculateQuestCarbonReduction('unknown'), 0.0);
  });

  await t.test('Quest XP', () => {
    assert.equal(calculateQuestXp('easy'), 10);
    assert.equal(calculateQuestXp('medium'), 30);
    assert.equal(calculateQuestXp('hard'), 75);
    assert.equal(calculateQuestXp('unknown'), 0);
  });

  await t.test('Electricity Carbon Calculation', () => {
    assert.equal(calculateMonthlyElectricityCarbon(100), 71);
    assert.equal(calculateDailyElectricityCarbon(300, 30), 7.1);
  });

  await t.test('Transport Mode Resolution', () => {
    assert.equal(resolveTransportModeKey('car'), 'car_petrol');
    assert.equal(resolveTransportModeKey('Diesel Car'), 'car_diesel');
    assert.equal(resolveTransportModeKey('bike'), 'walking_cycling');
    assert.equal(resolveTransportModeKey('auto'), 'auto_rickshaw');
  });

  await t.test('Transport Carbon Calculation', () => {
    assert.equal(calculateTransportCarbonKg(10, 'two_wheeler_petrol').toFixed(2), '0.40');
    assert.equal(calculateTransportCarbonKg(10, 'car_petrol').toFixed(2), '1.40');
    assert.equal(calculateTransportCarbonKg(10, 'car_diesel').toFixed(2), '1.55');
    assert.equal(calculateTransportCarbonKg(10, 'metro_train_electric').toFixed(2), '0.20');
    assert.equal(calculateTransportCarbonKg(10, 'bus_diesel_city').toFixed(2), '0.50');
    assert.equal(calculateTransportCarbonKg(10, 'walking_cycling').toFixed(2), '0.00');
    assert.equal(calculateTransportCarbonKg(10, 'auto_rickshaw').toFixed(2), '0.75');
  });

  await t.test('Transport Metadata', () => {
    const profile = getTransportEmissionProfile('metro');
    assert.equal(profile.label, 'Metro / Train (Electric)');
    assert.equal(profile.factorKgCO2e, 0.02);
    assert.equal(ACTIVE_TRAVEL_SAVED_KG_PER_KM, 0.14);
  });
});
