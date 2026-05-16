import test from 'node:test';
import assert from 'node:assert/strict';

// We'll mock out the services and test the core formulas here.
// In reality, these would be exported from a math/utils module.

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
  return unitsKwh * 0.725;
}

function calculateDailyElectricityCarbon(unitsKwh, daysInMonth) {
  const monthly = calculateMonthlyElectricityCarbon(unitsKwh);
  return monthly / daysInMonth;
}

function calculateTransportCarbon(distanceKm, transportType) {
  switch (transportType) {
    case 'car': return distanceKm * 0.192;
    case 'bus': return distanceKm * 0.105;
    case 'train': return distanceKm * 0.041;
    case 'bike': return 0;
    default: return 0;
  }
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
    // 100 kWh -> 100 * 0.725 = 72.5 kg CO2
    assert.equal(calculateMonthlyElectricityCarbon(100), 72.5);
    
    // Daily contribution for 30 days
    const daily = calculateDailyElectricityCarbon(300, 30); // 300 * 0.725 = 217.5 / 30 = 7.25
    assert.equal(daily, 7.25);
  });

  await t.test('Transport Carbon Calculation', () => {
    assert.equal(calculateTransportCarbon(10, 'car').toFixed(2), '1.92');
    assert.equal(calculateTransportCarbon(10, 'bus').toFixed(2), '1.05');
    assert.equal(calculateTransportCarbon(10, 'train').toFixed(2), '0.41');
    assert.equal(calculateTransportCarbon(10, 'bike').toFixed(2), '0.00');
  });
});
