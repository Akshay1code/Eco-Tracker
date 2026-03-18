import {
  ACTIVE_DEVICE_POWER_W,
  BASE_XP,
  BATTERY_DRAIN_REMINDER_THRESHOLD,
  CARBON_BASELINE_KG,
  DAILY_GOALS,
  DEFAULT_CHARGER_POWER_W,
  ECO_REMINDER_MESSAGE,
  INDIA_GRID_EMISSION_FACTOR,
  MOVEMENT_THRESHOLD_METERS,
  TIME_TRIGGER_MINUTES,
} from '../constants.js';

function round(value, digits = 6) {
  return Number(value.toFixed(digits));
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
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

export function hydrateRecord(record, userId, date) {
  const base = createDefaultRecord(userId, date);
  return {
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
  record.eco_score = clamp(Math.round(baseFactor * 100 + taskStatus.filter((task) => task.completed).length * 5), 0, 100);
  record.updated_at = new Date().toISOString();

  return record;
}

function pushLimited(array, entry, maxEntries = 50) {
  array.push(entry);
  if (array.length > maxEntries) {
    array.splice(0, array.length - maxEntries);
  }
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

  record.steps += stepsDelta;
  record.active_time = round(record.active_time + activeMinutesDelta, 2);
  record.activity_distance = round(record.activity_distance + distanceMeters / 1000, 3);

  record.pending_activity.detected = true;
  record.pending_activity.distance_m = round(record.pending_activity.distance_m + distanceMeters, 2);
  record.pending_activity.active_minutes = round(record.pending_activity.active_minutes + activeMinutesDelta, 2);
  record.pending_activity.steps += stepsDelta;

  pushLimited(record.activity_logs, {
    timestamp,
    distance_moved: round(distanceMeters, 2),
    activity: payload.activityType || 'walking',
    cadence_spm: payload.cadenceSpm ? round(Number(payload.cadenceSpm), 1) : 0,
    confidence: payload.confidence ? round(Number(payload.confidence), 3) : 0,
  });

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
  const activeMinutes = Math.max(record.pending_activity.active_minutes, Math.min(intervalMinutes, record.active_time || 0));
  const energyKwh = calculateActiveEnergyKwh(activeMinutes, Number(payload.devicePowerWatts || ACTIVE_DEVICE_POWER_W));
  const carbonKg = calculateCarbonKg(energyKwh);

  record.energy_used = round(record.energy_used + energyKwh);
  record.carbon_emission = round(record.carbon_emission + carbonKg);
  record.last_time_trigger_at = timestamp;
  record.pending_activity = createEmptyPendingActivity();

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
    record.energy_used = round(record.energy_used + energyKwh);
    record.carbon_emission = round(record.carbon_emission + carbonKg);

    chargeSession.active = false;
    chargeSession.started_at = null;
    chargeSession.charger_power_w = Number(payload.chargerPowerWatts || DEFAULT_CHARGER_POWER_W);
    event = 'charging-stopped';
  }

  return {
    updated: true,
    event,
    energyKwh,
    carbonKg,
    reminder,
    record: applyGamification(record),
  };
}
