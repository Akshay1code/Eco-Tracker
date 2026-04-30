export const DEFAULT_PORT = Number(process.env.PORT || 3001);

export const MOVEMENT_THRESHOLD_METERS = 20;
export const TIME_TRIGGER_MINUTES = 15;
export const DEFAULT_CHARGER_POWER_W = 15;

// Smartphone active power during GPS tracking (~3.5 W is realistic for a modern phone)
export const ACTIVE_DEVICE_POWER_W = 3.5;

// India electricity grid emission factor — CEA 2023 data: ~0.82 kg CO₂/kWh
export const INDIA_GRID_EMISSION_FACTOR = 0.82;

// India petrol car average emission factor (ARAI data): ~0.171 kg CO₂/km
export const VEHICLE_EMISSION_KG_PER_KM = 0.171;

// CO₂ saved per km by walking/cycling instead of driving (same reference as vehicle factor)
export const ACTIVE_TRAVEL_SAVED_KG_PER_KM = 0.171;

// Daily baseline for XP calculation (0.20 kg = typical mixed commute day)
// Above this value, base XP scales down toward 0. Below it, full base XP is awarded.
export const CARBON_BASELINE_KG = 0.20;

export const BASE_XP = 150;
export const WELCOME_XP = 200;
export const XP_PER_LEVEL = 200;
export const BADGE_LEVEL_INTERVAL = 10;
export const BATTERY_DRAIN_REMINDER_THRESHOLD = 6;

export const DAILY_GOALS = {
  walkSteps: 3000,
  lowEnergyKwh: 0.03,
  chargingLimitMinutes: 120,
  activeMinutes: 30,
};

export const ECO_REMINDER_MESSAGE =
  'Your device is consuming more energy than usual. Optimizing usage helps both your battery and the planet.';

