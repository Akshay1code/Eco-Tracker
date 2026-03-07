import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

type MotionPermission = 'prompt' | 'granted' | 'denied' | 'unsupported';

interface BatteryManagerLike extends EventTarget {
  level: number;
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
  supported: { geolocation: boolean; battery: boolean; motion: boolean };
  requestMotionAccess: () => Promise<boolean>;
}

type GeoPoint = { latitude: number; longitude: number };

function toRad(value: number) {
  return (value * Math.PI) / 180;
}

function distanceKm(prev: GeoPoint, curr: GeoPoint) {
  const R = 6371;
  const dLat = toRad(curr.latitude - prev.latitude);
  const dLng = toRad(curr.longitude - prev.longitude);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(prev.latitude)) *
      Math.cos(toRad(curr.latitude)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  return 2 * R * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export default function useDeviceCarbonTracker(_userEmail: string | null): DeviceCarbonData {
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

  const prevLocationRef = useRef<{ point: GeoPoint; at: number } | null>(null);
  const lastStepTsRef = useRef(0);
  const movementCarryKmRef = useRef(0);
  const lastMovementTsRef = useRef(0);

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

  useEffect(() => {
    const interval = setInterval(() => setScreenTime((prev) => prev + 1), 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      if (Date.now() - lastMovementTsRef.current <= 65_000) {
        setActiveMinutes((prev) => prev + 1);
      }
    }, 60_000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!supported.motion || typeof window === 'undefined') return;

    const onMotion = (event: DeviceMotionEvent) => {
      const acc = event.accelerationIncludingGravity;
      if (!acc) return;

      const x = acc.x ?? 0;
      const y = acc.y ?? 0;
      const z = acc.z ?? 0;
      const magnitude = Math.sqrt(x * x + y * y + z * z);
      const gravity = 9.81;
      const movement = Math.abs(magnitude - gravity);
      const now = Date.now();

      if (movement > 1.2 && now - lastStepTsRef.current > 350) {
        lastStepTsRef.current = now;
        setSteps((prev) => prev + 1);
        markMovement();
      }
    };

    window.addEventListener('devicemotion', onMotion);
    return () => window.removeEventListener('devicemotion', onMotion);
  }, [markMovement, supported.motion]);

  useEffect(() => {
    if (!supported.geolocation || typeof navigator === 'undefined') return;

    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        const point = { latitude: pos.coords.latitude, longitude: pos.coords.longitude };
        const now = Date.now();
        setLocation(point);

        const prev = prevLocationRef.current;
        if (prev) {
          const movedKm = distanceKm(prev.point, point);
          const elapsedMs = Math.max(now - prev.at, 1000);
          const elapsedHrs = elapsedMs / 3_600_000;
          const speedFromDelta = movedKm / elapsedHrs;
          const speedKmh = Number.isFinite(pos.coords.speed ?? NaN) && pos.coords.speed !== null
            ? Math.max((pos.coords.speed as number) * 3.6, 0)
            : Math.max(speedFromDelta, 0);
          setSpeed(speedKmh);

          if (movedKm > 0.00002 && movedKm < 0.35) {
            setDistance((prevDist) => prevDist + movedKm);
            setCarbon((prevCarbon) => prevCarbon + movedKm * 0.0002);
            markMovement();

            movementCarryKmRef.current += movedKm;
            const estimatedSteps = Math.floor(movementCarryKmRef.current / 0.00078);
            if (estimatedSteps > 0) {
              setSteps((prevSteps) => prevSteps + estimatedSteps);
              movementCarryKmRef.current -= estimatedSteps * 0.00078;
            }
          }
        }

        prevLocationRef.current = { point, at: now };
      },
      () => setPermissionDenied(true),
      {
        enableHighAccuracy: true,
        maximumAge: 4000,
        timeout: 12000,
      }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, [markMovement, supported.geolocation]);

  useEffect(() => {
    if (!supported.battery || typeof navigator === 'undefined') return;

    const navWithBattery = navigator as Navigator & {
      getBattery?: () => Promise<BatteryManagerLike>;
    };

    let batteryManager: BatteryManagerLike | null = null;
    let initialLevel = 1;

    const onLevelChange = () => {
      if (!batteryManager) return;
      const used = (initialLevel - batteryManager.level) * 100;
      setBatteryUsed(used > 0 ? used : 0);
    };

    navWithBattery
      .getBattery?.()
      .then((battery) => {
        batteryManager = battery;
        initialLevel = battery.level;
        battery.addEventListener('levelchange', onLevelChange);
      })
      .catch(() => {
        // Ignore unsupported/blocked battery API errors.
      });

    return () => {
      batteryManager?.removeEventListener('levelchange', onLevelChange);
    };
  }, [supported.battery]);

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
    supported,
    requestMotionAccess,
  };
}
