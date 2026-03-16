import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { sendActivityTrigger, sendBatteryTrigger, sendTimeTrigger } from '../lib/trackingApi.js';

type MotionPermission = 'prompt' | 'granted' | 'denied' | 'unsupported';
type ActivityKind = 'idle' | 'walking' | 'vehicle';
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
const GPS_MOVEMENT_THRESHOLD_METERS = 50;
const GPS_MAX_ACCEPTABLE_ACCURACY_METERS = 100;
const GPS_STEP_VALIDATION_DISTANCE_METERS = 50;
const GPS_STEP_SPEED_LIMIT_MPS = 3;
const GRAVITY_METERS_PER_SECOND_SQUARED = 9.81;
const G_UNIT_MAX_MAGNITUDE = 3.5;
const MIN_WALKING_TOTAL_ACCELERATION_G = 1.2;
const MAX_WALKING_TOTAL_ACCELERATION_G = 1.45;
const NORMAL_WALKING_CADENCE_MIN_HZ = 1.4;
const NORMAL_WALKING_CADENCE_MAX_HZ = 2.3;
const STEP_LENGTH_METERS = 0.78;
const MIN_STEP_INTERVAL_MS = Math.round(1000 / NORMAL_WALKING_CADENCE_MAX_HZ);
const MAX_STEP_INTERVAL_MS = Math.round(1000 / NORMAL_WALKING_CADENCE_MIN_HZ);
const PATTERN_SPIKE_COUNT = 3;
const MAX_PATTERN_GAP_MS = 2_000;
const CARBON_SAVED_PER_KM_WALKED = 0.0002;
const TIME_TRIGGER_INTERVAL_MS = 15 * 60_000;
const CHARGER_POWER_WATTS = 15;
const GRID_EMISSION_FACTOR = 0.727;

function toRad(value: number) {
  return (value * Math.PI) / 180;
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

function classifyActivity(speedMps: number): ActivityKind {
  if (speedMps > 3) {
    return 'vehicle';
  }
  return 'walking';
}

function normalizeAccelerationMagnitude(magnitude: number) {
  if (magnitude > 0.1 && magnitude < G_UNIT_MAX_MAGNITUDE) {
    return magnitude * GRAVITY_METERS_PER_SECOND_SQUARED;
  }

  return magnitude;
}

export default function useDeviceCarbonTracker(userEmail: string | null): DeviceCarbonData {
  const [carbon, setCarbon] = useState(0);
  const [batteryUsed, setBatteryUsed] = useState(0);
  const [distance, setDistance] = useState(0);
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
  const [charging, setCharging] = useState(false);
  const [chargingTimeMinutes, setChargingTimeMinutes] = useState(0);
  const [chargingEnergyKwh, setChargingEnergyKwh] = useState(0);
  const [chargingCarbonKg, setChargingCarbonKg] = useState(0);
  const [batteryAlert, setBatteryAlert] = useState<TrackerAlert | null>(null);

  const prevLocationRef = useRef<{ point: GeoPoint; at: number } | null>(null);
  const gpsValidationRef = useRef<{ point: GeoPoint; at: number } | null>(null);
  const lastCandidateSpikeTsRef = useRef(0);
  const consecutiveSpikeCountRef = useRef(0);
  const pendingMotionStepsRef = useRef(0);
  const movementCarryMetersRef = useRef(0);
  const lastMovementTsRef = useRef(0);
  const sampleTimerRef = useRef<number | null>(null);
  const motionPermissionRef = useRef<MotionPermission>('prompt');
  const permissionDeniedRef = useRef(false);
  const chargingStateRef = useRef<boolean | null>(null);
  const chargingStartedAtRef = useRef<number | null>(null);

  const supported = useMemo(
    () => ({
      geolocation: typeof navigator !== 'undefined' && 'geolocation' in navigator,
      battery: typeof navigator !== 'undefined' && 'getBattery' in navigator,
      motion: typeof window !== 'undefined' && 'DeviceMotionEvent' in window,
    }),
    []
  );

  const markMovement = useCallback(() => {
    lastMovementTsRef.current = Date.now();
  }, []);

  const resetMotionStepValidation = useCallback(() => {
    lastCandidateSpikeTsRef.current = 0;
    consecutiveSpikeCountRef.current = 0;
    pendingMotionStepsRef.current = 0;
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

      const x = acc.x ?? 0;
      const y = acc.y ?? 0;
      const z = acc.z ?? 0;
      const magnitude = normalizeAccelerationMagnitude(Math.sqrt(x * x + y * y + z * z));
      const totalAccelerationG = magnitude / GRAVITY_METERS_PER_SECOND_SQUARED;
      const now = Date.now();
      const sinceLastSpike = now - lastCandidateSpikeTsRef.current;

      if (
        totalAccelerationG < MIN_WALKING_TOTAL_ACCELERATION_G ||
        totalAccelerationG > MAX_WALKING_TOTAL_ACCELERATION_G
      ) {
        return;
      }

      if (sinceLastSpike > 0 && sinceLastSpike < MIN_STEP_INTERVAL_MS) {
        return;
      }

      if (sinceLastSpike > MAX_PATTERN_GAP_MS || sinceLastSpike > MAX_STEP_INTERVAL_MS) {
        consecutiveSpikeCountRef.current = 0;
      }

      lastCandidateSpikeTsRef.current = now;
      consecutiveSpikeCountRef.current += 1;

      if (consecutiveSpikeCountRef.current < PATTERN_SPIKE_COUNT) {
        return;
      }

      const stepDelta = consecutiveSpikeCountRef.current === PATTERN_SPIKE_COUNT ? PATTERN_SPIKE_COUNT : 1;
      pendingMotionStepsRef.current += stepDelta;
    };

    window.addEventListener('devicemotion', onMotion);
    return () => window.removeEventListener('devicemotion', onMotion);
  }, [supported.motion]);

  useEffect(() => {
    if (!supported.geolocation || typeof navigator === 'undefined' || typeof window === 'undefined') {
      setTrackingStatus('unsupported');
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
        setActivity('idle');
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

          if (!Number.isFinite(accuracy) || accuracy > GPS_MAX_ACCEPTABLE_ACCURACY_METERS) {
            setActivity('idle');
            setSpeed(0);
            scheduleNextSample();
            return;
          }

          const prev = prevLocationRef.current;
          const validationPrev = gpsValidationRef.current;
          gpsValidationRef.current = { point, at: now };

          if (!validationPrev) {
            prevLocationRef.current = prev ?? { point, at: now };
            setLocation(point);
            setActivity('idle');
            setSpeed(0);
            scheduleNextSample();
            return;
          }

          const validationMovedKm = distanceKm(validationPrev.point, point);
          const validationMovedMeters = validationMovedKm * 1000;
          const validationElapsedSeconds = Math.max((now - validationPrev.at) / 1000, 1);
          const validationFallbackSpeedMps = validationMovedMeters / validationElapsedSeconds;
          const reportedSpeed = pos.coords.speed;
          const speedMps =
            typeof reportedSpeed === 'number' && Number.isFinite(reportedSpeed) && reportedSpeed >= 0
              ? reportedSpeed
              : validationFallbackSpeedMps;
          const stepValidationPassed =
            validationMovedMeters >= GPS_STEP_VALIDATION_DISTANCE_METERS && speedMps <= GPS_STEP_SPEED_LIMIT_MPS;
          let committedMotionSteps = 0;

          if (pendingMotionStepsRef.current > 0) {
            if (stepValidationPassed) {
              committedMotionSteps = pendingMotionStepsRef.current;
              pendingMotionStepsRef.current = 0;
              setSteps((prevSteps) => prevSteps + committedMotionSteps);
              markMovement();
            } else if (
              validationMovedMeters < GPS_STEP_VALIDATION_DISTANCE_METERS ||
              speedMps > GPS_STEP_SPEED_LIMIT_MPS
            ) {
              resetMotionStepValidation();
            }
          }

          if (!prev) {
            prevLocationRef.current = { point, at: now };
            setLocation(point);
            setActivity('idle');
            setSpeed(speedMps * 3.6);
            scheduleNextSample();
            return;
          }

          const movedKm = distanceKm(prev.point, point);
          const movedMeters = movedKm * 1000;
          if (movedMeters <= GPS_MOVEMENT_THRESHOLD_METERS) {
            setActivity(stepValidationPassed ? 'walking' : speedMps > GPS_STEP_SPEED_LIMIT_MPS ? 'vehicle' : 'idle');
            setSpeed(stepValidationPassed ? speedMps * 3.6 : 0);
            if (stepValidationPassed || committedMotionSteps > 0) {
              markMovement();
            }
            scheduleNextSample();
            return;
          }

          const elapsedSeconds = Math.max((now - prev.at) / 1000, 1);
          const fallbackSpeedMps = movedMeters / elapsedSeconds;
          const storageSpeedMps =
            typeof reportedSpeed === 'number' && Number.isFinite(reportedSpeed) && reportedSpeed >= 0
              ? reportedSpeed
              : fallbackSpeedMps;
          const nextActivity = classifyActivity(storageSpeedMps);
          const estimatedSteps =
            nextActivity === 'walking' ? Math.max(1, Math.floor(movedMeters / STEP_LENGTH_METERS)) : 0;
          const activeMinutesDelta = Math.max(1, Math.round(elapsedSeconds / 60));

          prevLocationRef.current = { point, at: now };
          setLocation(point);
          setDistance((prevDist) => prevDist + movedKm);
          setSpeed(storageSpeedMps * 3.6);
          setActivity(nextActivity);
          setLastMovementDistance(Number(movedMeters.toFixed(1)));
          setMeaningfulUpdates((prevCount) => prevCount + 1);
          markMovement();

          if (nextActivity === 'walking') {
            setCarbon((prevCarbon) => prevCarbon + movedKm * CARBON_SAVED_PER_KM_WALKED);

            if (!supported.motion || motionPermissionRef.current !== 'granted') {
              movementCarryMetersRef.current += movedMeters;
              const fallbackSteps = Math.floor(movementCarryMetersRef.current / STEP_LENGTH_METERS);
              if (fallbackSteps > 0) {
                setSteps((prevSteps) => prevSteps + fallbackSteps);
                movementCarryMetersRef.current -= fallbackSteps * STEP_LENGTH_METERS;
              }
            } else if (committedMotionSteps === 0 || storageSpeedMps > GPS_STEP_SPEED_LIMIT_MPS) {
              resetMotionStepValidation();
            }
          }

          const stepsDeltaToReport =
            committedMotionSteps > 0
              ? committedMotionSteps
              : nextActivity === 'walking' && (!supported.motion || motionPermissionRef.current !== 'granted')
                ? Math.max(1, Math.floor(movedMeters / STEP_LENGTH_METERS))
                : 0;

          if (userEmail) {
            void sendActivityTrigger({
              userId: userEmail,
              distanceMeters: Number(movedMeters.toFixed(2)),
              stepsDelta: stepsDeltaToReport,
              activeMinutes: activeMinutesDelta,
              activityType: nextActivity,
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

          setActivity('idle');
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
        setActivity('idle');
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
  }, [markMovement, resetMotionStepValidation, supported.geolocation, supported.motion, userEmail]);

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
        chargerPowerWatts: 15,
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
