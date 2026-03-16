export const DEFAULT_PORT = Number(process.env.PORT || 3001);

export const MOVEMENT_THRESHOLD_METERS = 20;
export const TIME_TRIGGER_MINUTES = 15;
export const DEFAULT_CHARGER_POWER_W = 15;
export const ACTIVE_DEVICE_POWER_W = 8;
export const INDIA_GRID_EMISSION_FACTOR = 0.727;
export const CARBON_BASELINE_KG = 0.05;
export const BASE_XP = 100;
export const BATTERY_DRAIN_REMINDER_THRESHOLD = 6;

export const DAILY_GOALS = {
  walkSteps: 3000,
  lowEnergyKwh: 0.03,
  chargingLimitMinutes: 120,
  activeMinutes: 30,
};

export const ECO_REMINDER_MESSAGE =
  'Your device is consuming more energy than usual. Optimizing usage helps both your battery and the planet.';
