import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { sendActivityTrigger, sendBatteryTrigger, sendTimeTrigger } from '../lib/trackingApi.js';
import {
  createRealtimePedometer,
  type DebugSignalPoint,
  type PedometerActivity,
  type StepLogEntry,
} from '../lib/pedometer.ts';

type MotionPermission = 'prompt' | 'granted' | 'denied' | 'unsupported';
type ActivityKind = PedometerActivity | 'vehicle';
type TrackingStatus = 'active' | 'paused' | 'permission-denied' | 'unsupported';

interface BatteryManagerLike extends EventTarget {
  charging: boolean;
  level: number;
}

interface TrackerAlert {
  title: string;
  message: string;
}

export interface DeviceCarbonData {
  carbon: number;
  batteryUsed: number;
  distance: number;
  gpsDistance: number;
  estimatedDistance: number;
  speed: number;
  steps: number;
  activeMinutes: number;
  location: { latitude: number; longitude: number } | null;
  screenTime: number;
  permissionDenied: boolean;
  motionPermission: MotionPermission;
  activity: ActivityKind;
  trackingStatus: TrackingStatus;
  meaningfulUpdates: number;
  lastMovementDistance: number;
  samplingIntervalSeconds: number;
  movementThresholdMeters: number;
  cadence: number;
  caloriesBurned: number;
  co2SavedKg: number;
  lastStepConfidence: number;
  averageStepConfidence: number;
  debugSignals: DebugSignalPoint[];
  recentSteps: StepLogEntry[];
  charging: boolean;
  chargingTimeMinutes: number;
  chargingEnergyKwh: number;
  chargingCarbonKg: number;
  batteryAlert: TrackerAlert | null;
  supported: { geolocation: boolean; battery: boolean; motion: boolean };
  requestMotionAccess: () => Promise<boolean>;
  dismissBatteryAlert: () => void;
}

type GeoPoint = { latitude: number; longitude: number };

const EARTH_RADIUS_KM = 6371;
const GPS_SAMPLE_INTERVAL_MS = 60_000;
const GPS_CACHE_MAX_AGE_MS = 60_000;
const GPS_TIMEOUT_MS = 10_000;
const GPS_MOVEMENT_THRESHOLD_METERS = 20;
const GPS_MAX_ACCEPTABLE_ACCURACY_METERS = 100;
const WALKING_SPEED_MIN_MPS = 0.55;
const RUNNING_SPEED_MIN_MPS = 2.2;
const VEHICLE_SPEED_MIN_MPS = 5.8;
const RECENT_STEP_WINDOW_MS = 4_000;
const STEP_LENGTH_WALKING_METERS = 0.76;
const STEP_LENGTH_RUNNING_METERS = 1.02;
const WALKING_CALORIES_PER_STEP = 0.042;
const RUNNING_CALORIES_PER_STEP = 0.065;
const CO2_SAVED_PER_KM_WALKED = 0.192;
const TIME_TRIGGER_INTERVAL_MS = 15 * 60_000;
const CHARGER_POWER_WATTS = 15;
const GRID_EMISSION_FACTOR = 0.727;

function toRad(value: number) {
  return (value * Math.PI) / 180;
}

function round(value: number, digits = 3) {
  return Number(value.toFixed(digits));
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function distanceKm(prev: GeoPoint, curr: GeoPoint) {
  const dLat = toRad(curr.latitude - prev.latitude);
  const dLng = toRad(curr.longitude - prev.longitude);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(prev.latitude)) *
      Math.cos(toRad(curr.latitude)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  return 2 * EARTH_RADIUS_KM * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function deriveActivityFromSignals(
  speedMps: number,
  motionActivity: PedometerActivity,
  cadenceSpm: number,
  lastStepAt: number,
  now: number
): ActivityKind {
  const hasRecentSteps = lastStepAt > 0 && now - lastStepAt <= RECENT_STEP_WINDOW_MS;

  if (speedMps >= VEHICLE_SPEED_MIN_MPS && !hasRecentSteps) {
    return 'vehicle';
  }

  if (hasRecentSteps && (motionActivity === 'running' || cadenceSpm >= 140 || speedMps >= RUNNING_SPEED_MIN_MPS)) {
    return 'running';
  }

  if (hasRecentSteps && (motionActivity === 'walking' || cadenceSpm >= 60 || speedMps >= WALKING_SPEED_MIN_MPS)) {
    return 'walking';
  }

  if (speedMps >= RUNNING_SPEED_MIN_MPS && hasRecentSteps) {
    return 'running';
  }

  if (speedMps >= WALKING_SPEED_MIN_MPS && speedMps < VEHICLE_SPEED_MIN_MPS) {
    return 'walking';
  }

  return 'idle';
}

export default function useDeviceCarbonTracker(userEmail: string | null): DeviceCarbonData {
  const [batteryUsed, setBatteryUsed] = useState(0);
  const [gpsDistance, setGpsDistance] = useState(0);
  const [estimatedDistance, setEstimatedDistance] = useState(0);
  const [speed, setSpeed] = useState(0);
  const [steps, setSteps] = useState(0);
  const [activeMinutes, setActiveMinutes] = useState(0);
  const [location, setLocation] = useState<GeoPoint | null>(null);
  const [screenTime, setScreenTime] = useState(0);
  const [permissionDenied, setPermissionDenied] = useState(false);
  const [motionPermission, setMotionPermission] = useState<MotionPermission>('prompt');
  const [activity, setActivity] = useState<ActivityKind>('idle');
  const [trackingStatus, setTrackingStatus] = useState<TrackingStatus>('active');
  const [meaningfulUpdates, setMeaningfulUpdates] = useState(0);
  const [lastMovementDistance, setLastMovementDistance] = useState(0);
  const [cadence, setCadence] = useState(0);
  const [caloriesBurned, setCaloriesBurned] = useState(0);
  const [co2SavedKg, setCo2SavedKg] = useState(0);
  const [lastStepConfidence, setLastStepConfidence] = useState(0);
  const [averageStepConfidence, setAverageStepConfidence] = useState(0);
  const [debugSignals, setDebugSignals] = useState<DebugSignalPoint[]>([]);
  const [recentSteps, setRecentSteps] = useState<StepLogEntry[]>([]);
  const [charging, setCharging] = useState(false);
  const [chargingTimeMinutes, setChargingTimeMinutes] = useState(0);
  const [chargingEnergyKwh, setChargingEnergyKwh] = useState(0);
  const [chargingCarbonKg, setChargingCarbonKg] = useState(0);
  const [batteryAlert, setBatteryAlert] = useState<TrackerAlert | null>(null);

  const pedometerRef = useRef(createRealtimePedometer());
  const prevLocationRef = useRef<{ point: GeoPoint; at: number } | null>(null);
  const sampleTimerRef = useRef<number | null>(null);
  const motionPermissionRef = useRef<MotionPermission>('prompt');
  const permissionDeniedRef = useRef(false);
  const chargingStateRef = useRef<boolean | null>(null);
  const chargingStartedAtRef = useRef<number | null>(null);
  const movementCarryMetersRef = useRef(0);
  const lastMovementTsRef = useRef(0);
  const lastDebugSyncAtRef = useRef(0);
  const gpsDistanceRef = useRef(0);
  const estimatedDistanceRef = useRef(0);
  const stepsRef = useRef(0);
  const cadenceRef = useRef(0);
  const caloriesRef = useRef(0);
  const co2SavedRef = useRef(0);
  const lastStepConfidenceRef = useRef(0);
  const averageStepConfidenceRef = useRef(0);
  const lastReportedStepsRef = useRef(0);
  const lastReportedDistanceKmRef = useRef(0);

  const supported = useMemo(
    () => ({
      geolocation: typeof navigator !== 'undefined' && 'geolocation' in navigator,
      battery: typeof navigator !== 'undefined' && 'getBattery' in navigator,
      motion: typeof window !== 'undefined' && 'DeviceMotionEvent' in window,
    }),
    []
  );

  const carbon = useMemo(
    () => round(Math.max(chargingCarbonKg - co2SavedKg, 0), 4),
    [chargingCarbonKg, co2SavedKg]
  );

  const distance = useMemo(
    () => round(Math.max(gpsDistance, estimatedDistance), 3),
    [gpsDistance, estimatedDistance]
  );

  const markMovement = useCallback(() => {
    lastMovementTsRef.current = Date.now();
  }, []);

  const syncDebugSnapshot = useCallback((force = false) => {
    const now = Date.now();
    if (!force && now - lastDebugSyncAtRef.current < 1_500) {
      return;
    }

    const snapshot = pedometerRef.current.getSnapshot();
    setDebugSignals(snapshot.debugSignals.slice(-90));
    setRecentSteps(snapshot.recentSteps);
    lastDebugSyncAtRef.current = now;
  }, []);

  const syncPedometerSnapshot = useCallback((forceDebug = false) => {
    const snapshot = pedometerRef.current.getSnapshot();
    const nextEstimatedDistance = round(snapshot.distanceMeters / 1000, 3);

    estimatedDistanceRef.current = nextEstimatedDistance;
    stepsRef.current = snapshot.steps;
    cadenceRef.current = snapshot.cadenceSpm;
    caloriesRef.current = snapshot.caloriesBurned;
    co2SavedRef.current = snapshot.co2SavedKg;

    setEstimatedDistance(nextEstimatedDistance);
    setSteps(snapshot.steps);
    setCadence(snapshot.cadenceSpm);
    setCaloriesBurned(snapshot.caloriesBurned);
    setCo2SavedKg(snapshot.co2SavedKg);
    setLastStepConfidence(snapshot.lastStepConfidence);
    setAverageStepConfidence(snapshot.averageConfidence);
    lastStepConfidenceRef.current = snapshot.lastStepConfidence;
    averageStepConfidenceRef.current = snapshot.averageConfidence;
    syncDebugSnapshot(forceDebug);
    return snapshot;
  }, [syncDebugSnapshot]);

  const applyGpsFallbackSteps = useCallback((distanceMetersDelta: number, activityKind: 'walking' | 'running', speedMps: number) => {
    const stepLengthMeters = activityKind === 'running' ? STEP_LENGTH_RUNNING_METERS : STEP_LENGTH_WALKING_METERS;
    movementCarryMetersRef.current += distanceMetersDelta;
    const stepsDelta = Math.floor(movementCarryMetersRef.current / stepLengthMeters);

    if (stepsDelta <= 0) {
      return 0;
    }

    movementCarryMetersRef.current -= stepsDelta * stepLengthMeters;
    const distanceDeltaKm = (stepsDelta * stepLengthMeters) / 1000;
    const cadenceEstimate = clamp((speedMps / stepLengthMeters) * 60, activityKind === 'running' ? 130 : 60, activityKind === 'running' ? 190 : 135);
    const caloriesDelta = stepsDelta * (activityKind === 'running' ? RUNNING_CALORIES_PER_STEP : WALKING_CALORIES_PER_STEP);
    const co2Delta = distanceDeltaKm * CO2_SAVED_PER_KM_WALKED;

    stepsRef.current += stepsDelta;
    estimatedDistanceRef.current = round(estimatedDistanceRef.current + distanceDeltaKm, 3);
    cadenceRef.current = round(cadenceEstimate, 1);
    caloriesRef.current = round(caloriesRef.current + caloriesDelta, 2);
    co2SavedRef.current = round(co2SavedRef.current + co2Delta, 4);

    setSteps(stepsRef.current);
    setEstimatedDistance(estimatedDistanceRef.current);
    setCadence(cadenceRef.current);
    setCaloriesBurned(caloriesRef.current);
    setCo2SavedKg(co2SavedRef.current);
    setLastStepConfidence(0.52);
    setAverageStepConfidence((prev) => round((prev + 0.52) / 2, 3));
    lastStepConfidenceRef.current = 0.52;
    averageStepConfidenceRef.current = round((averageStepConfidenceRef.current + 0.52) / 2, 3);

    return stepsDelta;
  }, []);

  useEffect(() => {
    motionPermissionRef.current = motionPermission;
  }, [motionPermission]);

  useEffect(() => {
    permissionDeniedRef.current = permissionDenied;
  }, [permissionDenied]);

  const requestMotionAccess = useCallback(async () => {
    if (!supported.motion || typeof window === 'undefined') {
      setMotionPermission('unsupported');
      return false;
    }

    const deviceMotionCtor = window.DeviceMotionEvent as unknown as {
      requestPermission?: () => Promise<'granted' | 'denied'>;
    };

    if (typeof deviceMotionCtor.requestPermission === 'function') {
      try {
        const result = await deviceMotionCtor.requestPermission();
        const granted = result === 'granted';
        setMotionPermission(granted ? 'granted' : 'denied');
        return granted;
      } catch {
        setMotionPermission('denied');
        return false;
      }
    }

    setMotionPermission('granted');
    return true;
  }, [supported.motion]);

  const dismissBatteryAlert = useCallback(() => {
    setBatteryAlert(null);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      if (typeof document !== 'undefined' && document.hidden) {
        return;
      }
      setScreenTime((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!userEmail || typeof window === 'undefined') return;

    const interval = window.setInterval(() => {
      if (typeof document !== 'undefined' && document.hidden) {
        return;
      }

      void sendTimeTrigger({
        userId: userEmail,
        intervalMinutes: TIME_TRIGGER_INTERVAL_MS / 60_000,
        activityDetected: Date.now() - lastMovementTsRef.current <= TIME_TRIGGER_INTERVAL_MS,
        timestamp: new Date().toISOString(),
      });
    }, TIME_TRIGGER_INTERVAL_MS);

    return () => window.clearInterval(interval);
  }, [userEmail]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (typeof document !== 'undefined' && document.hidden) {
        return;
      }
      if (Date.now() - lastMovementTsRef.current <= GPS_SAMPLE_INTERVAL_MS + 5_000) {
        setActiveMinutes((prev) => prev + 1);
      }
    }, GPS_SAMPLE_INTERVAL_MS);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!supported.motion || typeof window === 'undefined') return;

    const onMotion = (event: DeviceMotionEvent) => {
      if (typeof document !== 'undefined' && document.hidden) return;

      const acc = event.accelerationIncludingGravity;
      if (!acc) return;

      const result = pedometerRef.current.processSample({
        x: acc.x ?? 0,
        y: acc.y ?? 0,
        z: acc.z ?? 0,
        timestamp: Date.now(),
        intervalMs: typeof event.interval === 'number' ? event.interval : null,
      });

      if (result.step) {
        const snapshot = syncPedometerSnapshot(true);
        setActivity(result.step.activity);
        if (snapshot.cadenceSpm > 0) {
          setCadence(snapshot.cadenceSpm);
        }
        markMovement();
        return;
      }

      syncDebugSnapshot(false);
    };

    window.addEventListener('devicemotion', onMotion);
    return () => window.removeEventListener('devicemotion', onMotion);
  }, [markMovement, supported.motion, syncDebugSnapshot, syncPedometerSnapshot]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const interval = window.setInterval(() => {
      const snapshot = syncPedometerSnapshot(false);
      setActivity((prev) => {
        if (prev === 'vehicle' && Date.now() - lastMovementTsRef.current <= GPS_SAMPLE_INTERVAL_MS) {
          return prev;
        }
        return snapshot.activity;
      });
    }, 2_000);

    return () => window.clearInterval(interval);
  }, [syncPedometerSnapshot]);

  useEffect(() => {
    if (!supported.geolocation || typeof navigator === 'undefined' || typeof window === 'undefined') {
      setTrackingStatus(supported.motion ? 'active' : 'unsupported');
      return;
    }

    let cancelled = false;

    const clearSampleTimer = () => {
      if (sampleTimerRef.current !== null) {
        window.clearTimeout(sampleTimerRef.current);
        sampleTimerRef.current = null;
      }
    };

    const scheduleNextSample = (delay = GPS_SAMPLE_INTERVAL_MS) => {
      clearSampleTimer();
      if (cancelled) return;
      sampleTimerRef.current = window.setTimeout(() => {
        sampleLocation();
      }, delay);
    };

    const sampleLocation = () => {
      if (cancelled) return;

      if (typeof document !== 'undefined' && document.hidden) {
        setTrackingStatus('paused');
        setActivity(pedometerRef.current.getSnapshot().activity);
        setSpeed(0);
        clearSampleTimer();
        return;
      }

      setTrackingStatus('active');

      navigator.geolocation.getCurrentPosition(
        (pos) => {
          if (cancelled) return;

          setPermissionDenied(false);

          const accuracy = pos.coords.accuracy ?? Number.POSITIVE_INFINITY;
          const point = { latitude: pos.coords.latitude, longitude: pos.coords.longitude };
          const now = Date.now();
          const motionSnapshot = syncPedometerSnapshot(false);
          const reportedSpeed = pos.coords.speed;

          if (!Number.isFinite(accuracy) || accuracy > GPS_MAX_ACCEPTABLE_ACCURACY_METERS) {
            pedometerRef.current.updateGpsContext({ speedMps: null, accuracyMeters: accuracy, timestamp: now });
            setLocation(point);
            setActivity(motionSnapshot.activity);
            setSpeed(0);
            scheduleNextSample();
            return;
          }

          const prev = prevLocationRef.current;

          if (!prev) {
            prevLocationRef.current = { point, at: now };
            setLocation(point);
            setActivity(motionSnapshot.activity);
            setSpeed(0);
            scheduleNextSample();
            return;
          }

          const movedKm = distanceKm(prev.point, point);
          const movedMeters = movedKm * 1000;
          const elapsedSeconds = Math.max((now - prev.at) / 1000, 1);
          const fallbackSpeedMps = movedMeters / elapsedSeconds;
          const speedMps =
            typeof reportedSpeed === 'number' && Number.isFinite(reportedSpeed) && reportedSpeed >= 0
              ? reportedSpeed
              : fallbackSpeedMps;

          pedometerRef.current.updateGpsContext({
            speedMps,
            accuracyMeters: accuracy,
            timestamp: now,
          });

          const nextActivity = deriveActivityFromSignals(
            speedMps,
            motionSnapshot.activity,
            motionSnapshot.cadenceSpm,
            motionSnapshot.lastStepAt,
            now
          );

          prevLocationRef.current = { point, at: now };
          setLocation(point);
          setSpeed(round(speedMps * 3.6, 2));
          setActivity(nextActivity);

          if (movedMeters < GPS_MOVEMENT_THRESHOLD_METERS) {
            if (motionSnapshot.activity !== 'idle') {
              markMovement();
            }
            scheduleNextSample();
            return;
          }

          gpsDistanceRef.current = round(gpsDistanceRef.current + movedKm, 3);
          setGpsDistance(gpsDistanceRef.current);
          setLastMovementDistance(round(movedMeters, 1));
          setMeaningfulUpdates((prevCount) => prevCount + 1);
          markMovement();

          let fallbackSteps = 0;
          if ((!supported.motion || motionPermissionRef.current !== 'granted') && (nextActivity === 'walking' || nextActivity === 'running')) {
            fallbackSteps = applyGpsFallbackSteps(movedMeters, nextActivity, speedMps);
          }

          const fusedDistanceKm = Math.max(gpsDistanceRef.current, estimatedDistanceRef.current);
          const distanceDeltaMeters = Math.max(0, (fusedDistanceKm - lastReportedDistanceKmRef.current) * 1000);
          const stepsDeltaToReport = Math.max(0, stepsRef.current - lastReportedStepsRef.current);
          const activeMinutesDelta = Math.max(1, Math.round(elapsedSeconds / 60));
          const shouldReportActivity =
            distanceDeltaMeters >= GPS_MOVEMENT_THRESHOLD_METERS ||
            stepsDeltaToReport >= Math.ceil(GPS_MOVEMENT_THRESHOLD_METERS / STEP_LENGTH_WALKING_METERS) ||
            fallbackSteps > 0;

          if (userEmail && shouldReportActivity) {
            lastReportedDistanceKmRef.current = fusedDistanceKm;
            lastReportedStepsRef.current = stepsRef.current;

            void sendActivityTrigger({
              userId: userEmail,
              distanceMeters: round(distanceDeltaMeters, 2),
              stepsDelta: stepsDeltaToReport,
              activeMinutes: activeMinutesDelta,
              activityType: nextActivity,
              cadenceSpm: round(cadenceRef.current, 1),
              confidence: round(lastStepConfidenceRef.current, 3),
              avgConfidence: round(averageStepConfidenceRef.current, 3),
              timestamp: new Date(now).toISOString(),
            });
          }

          scheduleNextSample();
        },
        (error) => {
          if (cancelled) return;

          if (error.code === error.PERMISSION_DENIED) {
            setPermissionDenied(true);
            setTrackingStatus('permission-denied');
            setActivity('idle');
            setSpeed(0);
            clearSampleTimer();
            return;
          }

          setActivity(pedometerRef.current.getSnapshot().activity);
          setSpeed(0);
          scheduleNextSample();
        },
        {
          enableHighAccuracy: false,
          maximumAge: GPS_CACHE_MAX_AGE_MS,
          timeout: GPS_TIMEOUT_MS,
        }
      );
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        clearSampleTimer();
        setTrackingStatus('paused');
        setActivity(pedometerRef.current.getSnapshot().activity);
        setSpeed(0);
        return;
      }

      if (permissionDeniedRef.current) {
        setTrackingStatus('permission-denied');
        return;
      }

      sampleLocation();
    };

    if (typeof document === 'undefined' || !document.hidden) {
      sampleLocation();
    } else {
      setTrackingStatus('paused');
    }

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      cancelled = true;
      clearSampleTimer();
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [
    applyGpsFallbackSteps,
    markMovement,
    supported.geolocation,
    supported.motion,
    syncPedometerSnapshot,
    userEmail,
  ]);

  useEffect(() => {
    if (!supported.battery || typeof navigator === 'undefined') return;

    const navWithBattery = navigator as Navigator & {
      getBattery?: () => Promise<BatteryManagerLike>;
    };

    let batteryManager: BatteryManagerLike | null = null;
    let initialLevel = 1;

    const syncBatteryEvent = () => {
      if (!batteryManager || !userEmail) return;

      void sendBatteryTrigger({
        userId: userEmail,
        charging: batteryManager.charging,
        batteryLevel: Number((batteryManager.level * 100).toFixed(2)),
        chargerPowerWatts: CHARGER_POWER_WATTS,
        timestamp: new Date().toISOString(),
      });
    };

    const onLevelChange = () => {
      if (!batteryManager) return;
      const used = (initialLevel - batteryManager.level) * 100;
      setBatteryUsed(used > 0 ? used : 0);
      syncBatteryEvent();
    };

    const onChargingChange = () => {
      if (!batteryManager) return;

      const now = Date.now();
      const wasCharging = chargingStateRef.current === true;

      setCharging(batteryManager.charging);

      if (chargingStateRef.current !== null && chargingStateRef.current !== batteryManager.charging) {
        setBatteryAlert(
          batteryManager.charging
            ? {
                title: 'Hurrah!!!',
                message: 'Your device has gone into charging mode. Eco Tracker is cheering you on.',
              }
            : {
                title: 'Charging Paused',
                message: 'Your device just left charging mode. We will keep watching your battery gently.',
              }
        );
      }

      if (!wasCharging && batteryManager.charging) {
        chargingStartedAtRef.current = now;
      }

      if (wasCharging && !batteryManager.charging && chargingStartedAtRef.current) {
        const durationMinutes = Math.max((now - chargingStartedAtRef.current) / 60_000, 0);
        const energyKwh = (CHARGER_POWER_WATTS * (durationMinutes / 60)) / 1000;
        const chargingCarbon = energyKwh * GRID_EMISSION_FACTOR;

        setChargingTimeMinutes((prev) => Number((prev + durationMinutes).toFixed(2)));
        setChargingEnergyKwh((prev) => Number((prev + energyKwh).toFixed(4)));
        setChargingCarbonKg((prev) => Number((prev + chargingCarbon).toFixed(4)));
        chargingStartedAtRef.current = null;
      }

      chargingStateRef.current = batteryManager.charging;
      syncBatteryEvent();
    };

    navWithBattery
      .getBattery?.()
      .then((battery) => {
        batteryManager = battery;
        initialLevel = battery.level;
        setCharging(battery.charging);
        chargingStateRef.current = battery.charging;
        chargingStartedAtRef.current = battery.charging ? Date.now() : null;
        battery.addEventListener('levelchange', onLevelChange);
        battery.addEventListener('chargingchange', onChargingChange);
        syncBatteryEvent();
      })
      .catch(() => {
        // Ignore unsupported/blocked battery API errors.
      });

    return () => {
      batteryManager?.removeEventListener('levelchange', onLevelChange);
      batteryManager?.removeEventListener('chargingchange', onChargingChange);
    };
  }, [supported.battery, userEmail]);

  return {
    carbon,
    batteryUsed,
    distance,
    gpsDistance,
    estimatedDistance,
    speed,
    steps,
    activeMinutes,
    location,
    screenTime,
    permissionDenied,
    motionPermission,
    activity,
    trackingStatus,
    meaningfulUpdates,
    lastMovementDistance,
    samplingIntervalSeconds: GPS_SAMPLE_INTERVAL_MS / 1000,
    movementThresholdMeters: GPS_MOVEMENT_THRESHOLD_METERS,
    cadence,
    caloriesBurned,
    co2SavedKg,
    lastStepConfidence,
    averageStepConfidence,
    debugSignals,
    recentSteps,
    charging,
    chargingTimeMinutes,
    chargingEnergyKwh,
    chargingCarbonKg,
    batteryAlert,
    supported,
    requestMotionAccess,
    dismissBatteryAlert,
  };
}
