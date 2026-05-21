export const DEFAULT_PORT = Number(process.env.PORT || 3001);

export const MOVEMENT_THRESHOLD_METERS = 20;
export const TIME_TRIGGER_MINUTES = 15;
export const DEFAULT_CHARGER_POWER_W = 15;

// Smartphone active power during GPS tracking (~3.5 W is realistic for a modern phone)
export const ACTIVE_DEVICE_POWER_W = 3.5;

// India grid factor from the user-provided CEA CO2 Baseline Database, FY 2024-25.
export const INDIA_GRID_EMISSION_FACTOR = 0.71;

// User-provided project dataset. For ranged factors we keep the original range
// plus a representative midpoint that the backend uses for calculations.
export const EMISSION_DATASET = {
  electricity: {
    mode: 'electricity_grid',
    unit: 'per kWh',
    factorKgCO2e: 0.71,
    source: 'CEA CO2 Baseline Database, FY 2024-25 (Version 21.0)',
  },
  phoneCharging: {
    mode: 'phone_charging',
    unit: 'per hour',
    minKgCO2e: 0.0107,
    maxKgCO2e: 0.0142,
    source: 'Calculated using CEA grid factor (0.710 kg/kWh)',
  },
  transport: {
    two_wheeler_petrol: {
      label: 'Two-Wheeler (Petrol)',
      unit: 'per km',
      minKgCO2e: 0.035,
      maxKgCO2e: 0.045,
      factorKgCO2e: 0.04,
      source: 'Shakti Foundation / WRI India-Specific Road Transport Emission Factors (2015) + updates',
    },
    car_petrol: {
      label: 'Passenger Car (Petrol - Small/Mid)',
      unit: 'per km',
      minKgCO2e: 0.12,
      maxKgCO2e: 0.16,
      factorKgCO2e: 0.14,
      source: 'Shakti Foundation, ICCT & ARAI-based studies',
    },
    car_diesel: {
      label: 'Passenger Car (Diesel)',
      unit: 'per km',
      minKgCO2e: 0.13,
      maxKgCO2e: 0.18,
      factorKgCO2e: 0.155,
      source: 'ICCT & India GHG Program',
    },
    metro_train_electric: {
      label: 'Metro / Train (Electric)',
      unit: 'per km (passenger)',
      minKgCO2e: 0.015,
      maxKgCO2e: 0.025,
      factorKgCO2e: 0.02,
      source: 'TERI & India GHG Program',
    },
    bus_diesel_city: {
      label: 'Bus (Diesel - City)',
      unit: 'per km (passenger)',
      minKgCO2e: 0.04,
      maxKgCO2e: 0.06,
      factorKgCO2e: 0.05,
      source: 'WRI India & ARAI',
    },
    walking_cycling: {
      label: 'Walking / Cycling',
      unit: 'per km',
      minKgCO2e: 0,
      maxKgCO2e: 0,
      factorKgCO2e: 0,
      source: 'No direct emissions',
    },
    auto_rickshaw: {
      label: 'Auto-Rickshaw (Petrol/CNG)',
      unit: 'per km',
      minKgCO2e: 0.06,
      maxKgCO2e: 0.09,
      factorKgCO2e: 0.075,
      source: 'Shakti Foundation',
    },
  },
};

export const DEFAULT_TRANSPORT_MODE = 'car_petrol';
export const VEHICLE_EMISSION_KG_PER_KM = EMISSION_DATASET.transport.car_petrol.factorKgCO2e;
export const TRAIN_EMISSION_KG_PER_KM = EMISSION_DATASET.transport.metro_train_electric.factorKgCO2e;
export const BUS_EMISSION_KG_PER_KM = EMISSION_DATASET.transport.bus_diesel_city.factorKgCO2e;

// Used when the app rewards active travel for replacing a typical private petrol car trip.
export const ACTIVE_TRAVEL_SAVED_KG_PER_KM = EMISSION_DATASET.transport.car_petrol.factorKgCO2e;

const TRANSPORT_MODE_ALIASES = {
  two_wheeler_petrol: 'two_wheeler_petrol',
  'two-wheeler': 'two_wheeler_petrol',
  two_wheeler: 'two_wheeler_petrol',
  scooter: 'two_wheeler_petrol',
  motorcycle: 'two_wheeler_petrol',
  motorbike: 'two_wheeler_petrol',
  petrol_scooter: 'two_wheeler_petrol',
  bike_motor: 'two_wheeler_petrol',
  car_petrol: 'car_petrol',
  'car-petrol': 'car_petrol',
  car: 'car_petrol',
  private_car: 'car_petrol',
  petrol_car: 'car_petrol',
  car_diesel: 'car_diesel',
  'car-diesel': 'car_diesel',
  diesel_car: 'car_diesel',
  diesel: 'car_diesel',
  metro_train_electric: 'metro_train_electric',
  'metro-train': 'metro_train_electric',
  train: 'metro_train_electric',
  metro: 'metro_train_electric',
  subway: 'metro_train_electric',
  rail: 'metro_train_electric',
  railway: 'metro_train_electric',
  transit: 'metro_train_electric',
  bus_diesel_city: 'bus_diesel_city',
  'bus-diesel-city': 'bus_diesel_city',
  bus: 'bus_diesel_city',
  public_bus: 'bus_diesel_city',
  walking_cycling: 'walking_cycling',
  'walking-cycling': 'walking_cycling',
  walk: 'walking_cycling',
  walking: 'walking_cycling',
  run: 'walking_cycling',
  running: 'walking_cycling',
  cycle: 'walking_cycling',
  cycling: 'walking_cycling',
  bicycle: 'walking_cycling',
  biking: 'walking_cycling',
  bike: 'walking_cycling',
  auto_rickshaw: 'auto_rickshaw',
  'auto-rickshaw': 'auto_rickshaw',
  auto: 'auto_rickshaw',
  autorickshaw: 'auto_rickshaw',
  rickshaw: 'auto_rickshaw',
};

export function resolveTransportModeKey(mode) {
  const normalizedMode = typeof mode === 'string' ? mode.trim().toLowerCase().replace(/\s+/g, '_') : '';
  return TRANSPORT_MODE_ALIASES[normalizedMode] || DEFAULT_TRANSPORT_MODE;
}

export function getTransportEmissionProfile(mode) {
  const resolvedMode = resolveTransportModeKey(mode);
  return {
    key: resolvedMode,
    ...EMISSION_DATASET.transport[resolvedMode],
  };
}

export function getTransportEmissionFactorKgPerKm(mode) {
  return getTransportEmissionProfile(mode).factorKgCO2e;
}

export function calculateTransportCarbonKg(distanceKm, mode) {
  const normalizedDistanceKm = Math.max(0, Number(distanceKm || 0));
  return Number((normalizedDistanceKm * getTransportEmissionFactorKgPerKm(mode)).toFixed(6));
}

// Daily baseline for XP calculation (0.20 kg = typical mixed commute day)
// Above this value, base XP scales down toward 0. Below it, full base XP is awarded.
export const CARBON_BASELINE_KG = 0.20;

export const BASE_XP = 150;
export const WELCOME_XP = 200;
export const XP_PER_LEVEL = 2500;
export const XP_SLOWDOWN_AFTER_LEVEL = 10;
export const XP_SLOWDOWN_MULTIPLIER = 1.5;
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
