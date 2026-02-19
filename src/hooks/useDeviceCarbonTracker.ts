import { useEffect, useState } from "react";

export interface DeviceCarbonData {
  carbon: number;
  batteryUsed: number;
  distance: number;
  speed: number;
  location: { latitude: number; longitude: number } | null;
  screenTime: number;
  permissionDenied: boolean;
  supported: { geolocation: boolean; battery: boolean };
}

export default function useDeviceCarbonTracker(userEmail: string | null): DeviceCarbonData {
  const [carbon, setCarbon] = useState(0);
  const [batteryUsed, setBatteryUsed] = useState(0);
  const [distance, setDistance] = useState(0);
  const [speed, setSpeed] = useState(0);
  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [screenTime, setScreenTime] = useState(0);
  const [permissionDenied, setPermissionDenied] = useState(false);
  const [supported] = useState({
    geolocation: "geolocation" in navigator,
    battery: "getBattery" in navigator,
  });

  // Screen time counter
  useEffect(() => {
    const interval = setInterval(() => setScreenTime((prev) => prev + 1), 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!userEmail) return;

    let watchId: number;

    // 🌍 Track location + movement
    if ("geolocation" in navigator) {
      watchId = navigator.geolocation.watchPosition(
        (pos) => {
          const { latitude, longitude, speed } = pos.coords;

          setLocation({ latitude, longitude });
          setSpeed(speed || 0);

          setDistance((prev) => prev + 0.05);

          const carbonFactor = 0.0002;
          setCarbon((prev) => prev + 0.05 * carbonFactor);
        },
        () => setPermissionDenied(true)
      );
    }

    // 🔋 Battery tracking
    if ("getBattery" in navigator) {
      (navigator as any).getBattery().then((battery: any) => {
        const initial = battery.level;

        battery.addEventListener("levelchange", () => {
          const used = (initial - battery.level) * 100;
          setBatteryUsed(used > 0 ? used : 0);
        });
      });
    }

    return () => {
      if (watchId) navigator.geolocation.clearWatch(watchId);
    };
  }, [userEmail]);

  return { carbon, batteryUsed, distance, speed, location, screenTime, permissionDenied, supported };
}