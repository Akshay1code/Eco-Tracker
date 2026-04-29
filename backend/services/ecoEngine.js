import {
  ACTIVE_DEVICE_POWER_W,
  ACTIVE_TRAVEL_SAVED_KG_PER_KM,
  BASE_XP,
  BATTERY_DRAIN_REMINDER_THRESHOLD,
  CARBON_BASELINE_KG,
  DAILY_GOALS,
  DEFAULT_CHARGER_POWER_W,
  ECO_REMINDER_MESSAGE,
  INDIA_GRID_EMISSION_FACTOR,
  MOVEMENT_THRESHOLD_METERS,
  TIME_TRIGGER_MINUTES,
  VEHICLE_EMISSION_KG_PER_KM,
} from '../constants.js';

function round(value, digits = 6) {
  return Number(value.toFixed(digits));
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function toPositiveNumber(value) {
  const numeric = Number(value || 0);
  return Number.isFinite(numeric) && numeric > 0 ? numeric : 0;
}

export function createEmptyPendingActivity() {
  return {
    detected: false,
    distance_m: 0,
    active_minutes: 0,
    steps: 0,
  };
}

export function createDefaultRecord(userId, date) {
  return {
    userId,
    date,
    steps: 0,
    active_time: 0,
    charging_time: 0,
    energy_used: 0,
    carbon_emission: 0,
    net_carbon_impact: 0,
    gross_carbon_impact: 0,
    carbon_saved: 0,
    device_energy_used: 0,
    device_carbon_emission: 0,
    charging_energy_used: 0,
    charging_carbon_emission: 0,
    transport_carbon_emission: 0,
    xp_earned: BASE_XP,
    eco_score: 100,
    activity_distance: 0,
    activity_logs: [],
    reminders: [],
    task_status: [],
    pending_activity: createEmptyPendingActivity(),
    charge_session: {
      active: false,
      started_at: null,
      charger_power_w: DEFAULT_CHARGER_POWER_W,
    },
    battery_state: {
      charging: false,
      last_level: null,
      last_sample_time: null,
      last_drain_rate: 0,
    },
    last_time_trigger_at: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
}

function recomputeImpactMetrics(record) {
  const deviceEnergyUsed = toPositiveNumber(record.device_energy_used);
  const chargingEnergyUsed = toPositiveNumber(record.charging_energy_used);
  const deviceCarbonEmission = toPositiveNumber(record.device_carbon_emission);
  const chargingCarbonEmission = toPositiveNumber(record.charging_carbon_emission);
  const transportCarbonEmission = toPositiveNumber(record.transport_carbon_emission);
  const carbonSaved = toPositiveNumber(record.carbon_saved);

  const energyUsed = round(deviceEnergyUsed + chargingEnergyUsed);
  const grossCarbonImpact = round(deviceCarbonEmission + chargingCarbonEmission + transportCarbonEmission);
  const netCarbonImpact = round(Math.max(grossCarbonImpact - carbonSaved, 0));

  record.device_energy_used = round(deviceEnergyUsed);
  record.charging_energy_used = round(chargingEnergyUsed);
  record.device_carbon_emission = round(deviceCarbonEmission);
  record.charging_carbon_emission = round(chargingCarbonEmission);
  record.transport_carbon_emission = round(transportCarbonEmission);
  record.carbon_saved = round(carbonSaved);
  record.energy_used = energyUsed;
  record.gross_carbon_impact = grossCarbonImpact;
  record.net_carbon_impact = netCarbonImpact;
  record.carbon_emission = netCarbonImpact;

  return record;
}

function hydrateLegacyImpactMetrics(record, sourceRecord) {
  const hasStructuredImpact =
    sourceRecord &&
    [
      'device_energy_used',
      'device_carbon_emission',
      'charging_energy_used',
      'charging_carbon_emission',
      'transport_carbon_emission',
      'carbon_saved',
    ].some((key) => Object.prototype.hasOwnProperty.call(sourceRecord, key));

  if (!hasStructuredImpact) {
    record.device_energy_used = toPositiveNumber(record.energy_used);
    record.device_carbon_emission = toPositiveNumber(record.net_carbon_impact || record.carbon_emission);
    record.charging_energy_used = 0;
    record.charging_carbon_emission = 0;
    record.transport_carbon_emission = 0;
    record.carbon_saved = 0;
  }

  return recomputeImpactMetrics(record);
}

export function hydrateRecord(record, userId, date) {
  const base = createDefaultRecord(userId, date);
  const hydrated = {
    ...base,
    ...record,
    pending_activity: {
      ...base.pending_activity,
      ...(record?.pending_activity || {}),
    },
    charge_session: {
      ...base.charge_session,
      ...(record?.charge_session || {}),
    },
    battery_state: {
      ...base.battery_state,
      ...(record?.battery_state || {}),
    },
    activity_logs: Array.isArray(record?.activity_logs) ? record.activity_logs : [],
    reminders: Array.isArray(record?.reminders) ? record.reminders : [],
    task_status: Array.isArray(record?.task_status) ? record.task_status : [],
  };

  return hydrateLegacyImpactMetrics(hydrated, record);
}

export function getRecordDate(timestamp) {
  const date = timestamp ? new Date(timestamp) : new Date();
  return date.toISOString().slice(0, 10);
}

export function calculateChargingEnergyKwh(durationMinutes, chargerPowerW = DEFAULT_CHARGER_POWER_W) {
  const hours = Math.max(durationMinutes, 0) / 60;
  return round((chargerPowerW * hours) / 1000);
}

export function calculateActiveEnergyKwh(activeMinutes, devicePowerW = ACTIVE_DEVICE_POWER_W) {
  const hours = Math.max(activeMinutes, 0) / 60;
  return round((devicePowerW * hours) / 1000);
}

export function calculateCarbonKg(energyKwh) {
  return round(Math.max(energyKwh, 0) * INDIA_GRID_EMISSION_FACTOR);
}

function calculateTaskStatus(record) {
  return [
    {
      id: 'walk-target-distance',
      label: 'Walk target distance',
      completed: record.steps >= DAILY_GOALS.walkSteps,
      reward_xp: 20,
    },
    {
      id: 'maintain-low-energy',
      label: 'Maintain low energy usage',
      completed: record.energy_used < DAILY_GOALS.lowEnergyKwh,
      reward_xp: 15,
    },
    {
      id: 'reduce-charging-time',
      label: 'Reduce charging time',
      completed: record.charging_time <= DAILY_GOALS.chargingLimitMinutes,
      reward_xp: 15,
    },
    {
      id: 'stay-active',
      label: 'Stay active',
      completed: record.active_time >= DAILY_GOALS.activeMinutes,
      reward_xp: 20,
    },
  ];
}

function applyGamification(record) {
  const taskStatus = calculateTaskStatus(record);
  const taskBonus = taskStatus.filter((task) => task.completed).reduce((sum, task) => sum + task.reward_xp, 0);
  const baseFactor = clamp(1 - record.carbon_emission / CARBON_BASELINE_KG, 0, 1);

  record.task_status = taskStatus;
  record.xp_earned = Math.round(BASE_XP * baseFactor + taskBonus);
  record.eco_score = clamp(
    Math.round(baseFactor * 100 + taskStatus.filter((task) => task.completed).length * 5),
    0,
    100
  );
  record.updated_at = new Date().toISOString();

  return record;
}

function pushLimited(array, entry, maxEntries = 50) {
  array.push(entry);
  if (array.length > maxEntries) {
    array.splice(0, array.length - maxEntries);
  }
}

function calculateTransportImpact(activityType, distanceMeters) {
  const normalizedActivity = typeof activityType === 'string' ? activityType.toLowerCase() : 'walking';
  const distanceKm = Math.max(0, Number(distanceMeters || 0)) / 1000;

  if (!distanceKm) {
    return { emittedKg: 0, savedKg: 0, direction: 'neutral' };
  }

  if (normalizedActivity === 'vehicle' || normalizedActivity === 'transport' || normalizedActivity === 'driving') {
    return {
      emittedKg: round(distanceKm * VEHICLE_EMISSION_KG_PER_KM),
      savedKg: 0,
      direction: 'emitted',
    };
  }

  return {
    emittedKg: 0,
    savedKg: round(distanceKm * ACTIVE_TRAVEL_SAVED_KG_PER_KM),
    direction: 'saved',
  };
}

export function applyActivityTrigger(record, payload) {
  const distanceMeters = Number(payload.distanceMeters || 0);
  if (distanceMeters <= MOVEMENT_THRESHOLD_METERS) {
    return {
      updated: false,
      reason: 'movement_below_threshold',
      thresholdMeters: MOVEMENT_THRESHOLD_METERS,
      record: applyGamification(record),
    };
  }

  const stepsDelta = Math.max(0, Math.floor(Number(payload.stepsDelta || 0)));
  const activeMinutesDelta = Math.max(0, Number(payload.activeMinutes || 0));
  const timestamp = payload.timestamp || new Date().toISOString();
  const transportImpact = calculateTransportImpact(payload.activityType, distanceMeters);

  record.steps += stepsDelta;
  record.active_time = round(record.active_time + activeMinutesDelta, 2);
  record.activity_distance = round(record.activity_distance + distanceMeters / 1000, 3);
  record.transport_carbon_emission = round(record.transport_carbon_emission + transportImpact.emittedKg);
  record.carbon_saved = round(record.carbon_saved + transportImpact.savedKg);

  record.pending_activity.detected = true;
  record.pending_activity.distance_m = round(record.pending_activity.distance_m + distanceMeters, 2);
  record.pending_activity.active_minutes = round(record.pending_activity.active_minutes + activeMinutesDelta, 2);
  record.pending_activity.steps += stepsDelta;

  pushLimited(record.activity_logs, {
    timestamp,
    distance_moved: round(distanceMeters, 2),
    activity: payload.activityType || 'walking',
    carbon_delta_kg: round(transportImpact.emittedKg || transportImpact.savedKg),
    carbon_direction: transportImpact.direction,
    net_impact_delta_kg: round(transportImpact.emittedKg - transportImpact.savedKg),
    cadence_spm: payload.cadenceSpm ? round(Number(payload.cadenceSpm), 1) : 0,
    confidence: payload.confidence ? round(Number(payload.confidence), 3) : 0,
  });

  recomputeImpactMetrics(record);

  return {
    updated: true,
    record: applyGamification(record),
  };
}

export function applyTimeTrigger(record, payload) {
  const timestamp = payload.timestamp || new Date().toISOString();
  const activityDetected = Boolean(payload.activityDetected || record.pending_activity.detected);
  if (!activityDetected) {
    record.last_time_trigger_at = timestamp;
    return {
      updated: false,
      skipped: true,
      reason: 'no_activity_detected',
      record: applyGamification(record),
    };
  }

  const intervalMinutes = Math.max(1, Number(payload.intervalMinutes || TIME_TRIGGER_MINUTES));
  const activeMinutes = round(Math.max(0, Number(record.pending_activity.active_minutes || 0)), 2);
  if (activeMinutes <= 0) {
    record.last_time_trigger_at = timestamp;
    record.pending_activity = createEmptyPendingActivity();
    return {
      updated: false,
      skipped: true,
      reason: 'no_active_minutes',
      intervalMinutes,
      record: applyGamification(record),
    };
  }

  const energyKwh = calculateActiveEnergyKwh(activeMinutes, Number(payload.devicePowerWatts || ACTIVE_DEVICE_POWER_W));
  const carbonKg = calculateCarbonKg(energyKwh);

  record.device_energy_used = round(record.device_energy_used + energyKwh);
  record.device_carbon_emission = round(record.device_carbon_emission + carbonKg);
  record.last_time_trigger_at = timestamp;
  record.pending_activity = createEmptyPendingActivity();
  recomputeImpactMetrics(record);

  return {
    updated: true,
    energyKwh,
    carbonKg,
    record: applyGamification(record),
  };
}

function evaluateBatteryDrain(record, batteryLevel, timestamp, charging) {
  const state = record.battery_state;
  const previousLevel = state.last_level;
  const previousTimestamp = state.last_sample_time;
  let reminder = null;

  if (
    typeof previousLevel === 'number' &&
    previousTimestamp &&
    !charging &&
    typeof batteryLevel === 'number' &&
    batteryLevel < previousLevel
  ) {
    const elapsedHours = (new Date(timestamp).getTime() - new Date(previousTimestamp).getTime()) / 3_600_000;
    if (elapsedHours > 0) {
      const drainRate = round((previousLevel - batteryLevel) / elapsedHours, 2);
      state.last_drain_rate = drainRate;

      if (drainRate > BATTERY_DRAIN_REMINDER_THRESHOLD) {
        reminder = {
          timestamp,
          drain_rate: drainRate,
          message: ECO_REMINDER_MESSAGE,
        };
        pushLimited(record.reminders, reminder, 20);
      }
    }
  }

  state.charging = charging;
  state.last_level = typeof batteryLevel === 'number' ? batteryLevel : state.last_level;
  state.last_sample_time = timestamp;

  return reminder;
}

export function applyBatteryTrigger(record, payload) {
  const timestamp = payload.timestamp || new Date().toISOString();
  const charging = Boolean(payload.charging);
  const batteryLevel =
    payload.batteryLevel === null || payload.batteryLevel === undefined ? null : Number(payload.batteryLevel);
  const chargeSession = record.charge_session;

  const reminder = evaluateBatteryDrain(record, batteryLevel, timestamp, charging);
  let event = 'battery-sample';
  let energyKwh = 0;
  let carbonKg = 0;

  if (charging && !chargeSession.active) {
    chargeSession.active = true;
    chargeSession.started_at = timestamp;
    chargeSession.charger_power_w = Number(payload.chargerPowerWatts || DEFAULT_CHARGER_POWER_W);
    event = 'charging-started';
  } else if (!charging && chargeSession.active && chargeSession.started_at) {
    const durationMinutes = Math.max(
      0,
      (new Date(timestamp).getTime() - new Date(chargeSession.started_at).getTime()) / 60_000
    );

    energyKwh = calculateChargingEnergyKwh(durationMinutes, chargeSession.charger_power_w);
    carbonKg = calculateCarbonKg(energyKwh);

    record.charging_time = round(record.charging_time + durationMinutes, 2);
    record.charging_energy_used = round(record.charging_energy_used + energyKwh);
    record.charging_carbon_emission = round(record.charging_carbon_emission + carbonKg);

    chargeSession.active = false;
    chargeSession.started_at = null;
    chargeSession.charger_power_w = Number(payload.chargerPowerWatts || DEFAULT_CHARGER_POWER_W);
    event = 'charging-stopped';
  }

  recomputeImpactMetrics(record);

  return {
    updated: true,
    event,
    energyKwh,
    carbonKg,
    reminder,
    record: applyGamification(record),
  };
}
