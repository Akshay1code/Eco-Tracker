export type PedometerActivity = 'idle' | 'walking' | 'running';

export interface MotionSample {
  x: number;
  y: number;
  z: number;
  timestamp: number;
  intervalMs?: number | null;
}

export interface GpsContext {
  speedMps?: number | null;
  accuracyMeters?: number | null;
  timestamp?: number;
}

export interface DebugSignalPoint {
  timestamp: number;
  rawMagnitude: number;
  filteredMagnitude: number;
  baseline: number;
  threshold: number;
  centeredMagnitude: number;
  confidence: number;
  accepted: boolean;
}

export interface StepLogEntry {
  timestamp: number;
  confidence: number;
  cadenceSpm: number;
  activity: Exclude<PedometerActivity, 'idle'>;
  strideMeters: number;
  peak: number;
  threshold: number;
  gpsSpeedMps: number | null;
}

export interface PedometerSnapshot {
  steps: number;
  distanceMeters: number;
  caloriesBurned: number;
  co2SavedKg: number;
  cadenceSpm: number;
  activity: PedometerActivity;
  lastStepConfidence: number;
  averageConfidence: number;
  lastStepAt: number;
  debugSignals: DebugSignalPoint[];
  recentSteps: StepLogEntry[];
}

export interface StepDetection {
  detected: true;
  confidence: number;
  cadenceSpm: number;
  activity: Exclude<PedometerActivity, 'idle'>;
  distanceMeters: number;
  caloriesBurned: number;
  co2SavedKg: number;
}

export interface ProcessResult {
  step: StepDetection | null;
  snapshot: PedometerSnapshot;
}

interface SignalPoint {
  timestamp: number;
  centered: number;
  filtered: number;
  baseline: number;
  threshold: number;
}

interface PedometerOptions {
  smoothingWindow: number;
  baselineWindow: number;
  intervalWindow: number;
  debugWindow: number;
  stepLogWindow: number;
  minStepIntervalMs: number;
  maxStepIntervalMs: number;
  idleTimeoutMs: number;
  minThreshold: number;
  thresholdStdMultiplier: number;
  thresholdBias: number;
  amplitudeBoost: number;
  minProminence: number;
  neutralGpsScore: number;
  maxGpsContextAgeMs: number;
  baseStepLengthMeters: number;
  runningStepLengthMeters: number;
  co2SavedPerKmKg: number;
  walkingCaloriesPerStep: number;
  runningCaloriesPerStep: number;
}

const DEFAULT_OPTIONS: PedometerOptions = {
  smoothingWindow: 6,
  baselineWindow: 24,
  intervalWindow: 6,
  debugWindow: 180,
  stepLogWindow: 24,
  minStepIntervalMs: 280,
  maxStepIntervalMs: 1_400,
  idleTimeoutMs: 2_500,
  minThreshold: 0.42,
  thresholdStdMultiplier: 1.25,
  thresholdBias: 0.2,
  amplitudeBoost: 1.1,
  minProminence: 0.36,
  neutralGpsScore: 0.64,
  maxGpsContextAgeMs: 15_000,
  baseStepLengthMeters: 0.76,
  runningStepLengthMeters: 1.02,
  co2SavedPerKmKg: 0.192,
  walkingCaloriesPerStep: 0.042,
  runningCaloriesPerStep: 0.065,
};

const GRAVITY_METERS_PER_SECOND_SQUARED = 9.81;
const G_UNIT_MAX_MAGNITUDE = 3.5;

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function round(value: number, digits = 3) {
  return Number(value.toFixed(digits));
}

function mean(values: number[]) {
  if (!values.length) return 0;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function standardDeviation(values: number[]) {
  if (values.length < 2) return 0;
  const avg = mean(values);
  const variance = values.reduce((sum, value) => sum + (value - avg) ** 2, 0) / values.length;
  return Math.sqrt(variance);
}

function pushCapped<T>(array: T[], value: T, max: number) {
  array.push(value);
  if (array.length > max) {
    array.splice(0, array.length - max);
  }
}

function normalizeAccelerationMagnitude(magnitude: number) {
  if (magnitude > 0.1 && magnitude < G_UNIT_MAX_MAGNITUDE) {
    return magnitude * GRAVITY_METERS_PER_SECOND_SQUARED;
  }

  return magnitude;
}

export function createRealtimePedometer(options?: Partial<PedometerOptions>) {
  const config = { ...DEFAULT_OPTIONS, ...options };
  const smoothingValues: number[] = [];
  const baselineValues: number[] = [];
  const signalHistory: SignalPoint[] = [];
  const stepIntervals: number[] = [];
  const confidenceHistory: number[] = [];
  const debugSignals: DebugSignalPoint[] = [];
  const recentSteps: StepLogEntry[] = [];

  let steps = 0;
  let distanceMeters = 0;
  let caloriesBurned = 0;
  let co2SavedKg = 0;
  let lastStepAt = 0;
  let lastStepConfidence = 0;
  let lastSampleAt = 0;
  let valleyFloor = 0;
  let gpsSpeedMps: number | null = null;
  let gpsAccuracyMeters: number | null = null;
  let gpsTimestamp = 0;

  function getCadenceSpm() {
    if (!stepIntervals.length) return 0;
    const avgInterval = mean(stepIntervals);
    if (avgInterval <= 0) return 0;
    return clamp(60_000 / avgInterval, 0, 220);
  }

  function classifyActivity(cadenceSpm: number, peak: number, threshold: number): PedometerActivity {
    if (!lastStepAt || Date.now() - lastStepAt > config.idleTimeoutMs) {
      return 'idle';
    }

    if (cadenceSpm >= 140 || peak > threshold * 2.1) {
      return 'running';
    }

    return cadenceSpm >= 55 ? 'walking' : 'idle';
  }

  function getStrideMeters(activity: Exclude<PedometerActivity, 'idle'>, cadenceSpm: number) {
    if (activity === 'running') {
      return clamp(config.runningStepLengthMeters + (cadenceSpm - 150) * 0.004, 0.95, 1.25);
    }

    return clamp(config.baseStepLengthMeters + (cadenceSpm - 100) * 0.0022, 0.62, 0.92);
  }

  function getGpsScore(activity: Exclude<PedometerActivity, 'idle'>, timestamp: number) {
    if (!gpsTimestamp || timestamp - gpsTimestamp > config.maxGpsContextAgeMs || gpsSpeedMps === null) {
      return config.neutralGpsScore;
    }

    if (gpsAccuracyMeters !== null && gpsAccuracyMeters > 50) {
      return config.neutralGpsScore;
    }

    if (gpsSpeedMps < 0.35) {
      return activity === 'running' ? 0.3 : 0.4;
    }

    if (gpsSpeedMps <= 2.2) {
      return activity === 'walking' ? 1 : 0.75;
    }

    if (gpsSpeedMps <= 4.9) {
      return activity === 'running' ? 1 : 0.72;
    }

    return 0.28;
  }

  function getSnapshot(): PedometerSnapshot {
    const cadenceSpm = round(getCadenceSpm(), 1);
    return {
      steps,
      distanceMeters: round(distanceMeters, 2),
      caloriesBurned: round(caloriesBurned, 2),
      co2SavedKg: round(co2SavedKg, 4),
      cadenceSpm,
      activity: classifyActivity(cadenceSpm, 0, 1),
      lastStepConfidence: round(lastStepConfidence, 3),
      averageConfidence: round(mean(confidenceHistory), 3),
      lastStepAt,
      debugSignals: [...debugSignals],
      recentSteps: [...recentSteps],
    };
  }

  function updateGpsContext(context: GpsContext) {
    gpsSpeedMps =
      typeof context.speedMps === 'number' && Number.isFinite(context.speedMps) && context.speedMps >= 0
        ? context.speedMps
        : null;
    gpsAccuracyMeters =
      typeof context.accuracyMeters === 'number' && Number.isFinite(context.accuracyMeters)
        ? context.accuracyMeters
        : null;
    gpsTimestamp = context.timestamp ?? Date.now();
  }

  function reset() {
    smoothingValues.length = 0;
    baselineValues.length = 0;
    signalHistory.length = 0;
    stepIntervals.length = 0;
    confidenceHistory.length = 0;
    debugSignals.length = 0;
    recentSteps.length = 0;
    steps = 0;
    distanceMeters = 0;
    caloriesBurned = 0;
    co2SavedKg = 0;
    lastStepAt = 0;
    lastStepConfidence = 0;
    lastSampleAt = 0;
    valleyFloor = 0;
    gpsSpeedMps = null;
    gpsAccuracyMeters = null;
    gpsTimestamp = 0;
  }

  function processSample(sample: MotionSample): ProcessResult {
    const magnitude = normalizeAccelerationMagnitude(Math.sqrt(sample.x ** 2 + sample.y ** 2 + sample.z ** 2));
    pushCapped(smoothingValues, magnitude, config.smoothingWindow);
    const filteredMagnitude = mean(smoothingValues);

    pushCapped(baselineValues, filteredMagnitude, config.baselineWindow);
    const baseline = mean(baselineValues);
    const centered = filteredMagnitude - baseline;
    const noise = standardDeviation(baselineValues);
    const threshold = Math.max(
      config.minThreshold,
      clamp(noise * config.thresholdStdMultiplier + config.thresholdBias, config.minThreshold, 2.2)
    );
    const timestamp = sample.timestamp || Date.now();
    const signalPoint: SignalPoint = {
      timestamp,
      centered,
      filtered: filteredMagnitude,
      baseline,
      threshold,
    };

    if (!signalHistory.length) {
      valleyFloor = centered;
    } else {
      valleyFloor = Math.min(valleyFloor, centered);
    }

    pushCapped(signalHistory, signalPoint, 6);

    let step: StepDetection | null = null;
    let accepted = false;
    let candidateConfidence = 0;

    if (signalHistory.length >= 3) {
      const prev = signalHistory[signalHistory.length - 3];
      const current = signalHistory[signalHistory.length - 2];
      const next = signalHistory[signalHistory.length - 1];
      const isLocalMaximum = current.centered > prev.centered && current.centered >= next.centered;

      if (isLocalMaximum && current.centered > current.threshold) {
        const intervalMs = lastStepAt ? current.timestamp - lastStepAt : 0;
        const cadenceIntervals = [...stepIntervals];
        if (intervalMs > 0 && intervalMs <= config.maxStepIntervalMs * 2) {
          cadenceIntervals.push(intervalMs);
        }

        const candidateCadenceSpm =
          cadenceIntervals.length > 0 ? clamp(60_000 / mean(cadenceIntervals), 0, 220) : 0;
        const candidateActivity: Exclude<PedometerActivity, 'idle'> =
          candidateCadenceSpm >= 140 || current.centered > current.threshold * 2.1 ? 'running' : 'walking';
        const prominence = current.centered - valleyFloor;
        const amplitudeScore = clamp((prominence - current.threshold) / Math.max(current.threshold, 0.1), 0, 1);
        const peakScore = clamp(current.centered / Math.max(current.threshold * 1.8, 0.25), 0, 1);

        let intervalScore = 0.62;
        if (intervalMs > 0) {
          if (intervalMs < config.minStepIntervalMs || intervalMs > config.maxStepIntervalMs) {
            intervalScore = 0;
          } else if (stepIntervals.length >= 2) {
            const expected = mean(stepIntervals);
            const deviation = Math.abs(intervalMs - expected);
            intervalScore = clamp(1 - deviation / Math.max(expected * 0.45, 1), 0, 1);
          } else {
            intervalScore = clamp(1 - Math.abs(intervalMs - 540) / 700, 0.25, 1);
          }
        }

        const rhythmIrregularity =
          stepIntervals.length >= 3 ? standardDeviation(stepIntervals) / Math.max(mean(stepIntervals), 1) : 0.18;
        const regularityScore = clamp(1 - rhythmIrregularity * 1.8, 0, 1);
        const gpsScore = getGpsScore(candidateActivity, current.timestamp);

        candidateConfidence = clamp(
          amplitudeScore * 0.3 + peakScore * 0.18 + intervalScore * 0.26 + regularityScore * 0.16 + gpsScore * 0.1,
          0,
          1
        );

        const intervalOk =
          !lastStepAt ||
          (intervalMs >= config.minStepIntervalMs && intervalMs <= config.maxStepIntervalMs);
        const prominenceOk =
          prominence >= Math.max(current.threshold * config.amplitudeBoost, config.minProminence);
        const signalStable = regularityScore >= 0.18 || stepIntervals.length < 3;

        if (intervalOk && prominenceOk && signalStable && candidateConfidence >= 0.58) {
          const cadenceSpm = round(candidateCadenceSpm, 1);
          const activity = candidateActivity;
          const strideMeters = getStrideMeters(activity, cadenceSpm);
          steps += 1;
          distanceMeters += strideMeters;
          caloriesBurned += activity === 'running' ? config.runningCaloriesPerStep : config.walkingCaloriesPerStep;
          co2SavedKg += (strideMeters / 1000) * config.co2SavedPerKmKg;
          lastStepAt = current.timestamp;
          lastStepConfidence = candidateConfidence;
          pushCapped(confidenceHistory, candidateConfidence, config.intervalWindow * 8);
          if (intervalMs > 0) {
            pushCapped(stepIntervals, intervalMs, config.intervalWindow);
          }
          pushCapped(
            recentSteps,
            {
              timestamp: current.timestamp,
              confidence: round(candidateConfidence, 3),
              cadenceSpm,
              activity,
              strideMeters: round(strideMeters, 3),
              peak: round(current.centered, 3),
              threshold: round(current.threshold, 3),
              gpsSpeedMps,
            },
            config.stepLogWindow
          );

          step = {
            detected: true,
            confidence: round(candidateConfidence, 3),
            cadenceSpm,
            activity,
            distanceMeters: round(distanceMeters, 2),
            caloriesBurned: round(caloriesBurned, 2),
            co2SavedKg: round(co2SavedKg, 4),
          };
          accepted = true;
        }

        valleyFloor = next.centered;
      }
    }

    if (lastSampleAt && timestamp - lastSampleAt > config.maxStepIntervalMs * 2) {
      stepIntervals.length = 0;
    }
    lastSampleAt = timestamp;

    pushCapped(
      debugSignals,
      {
        timestamp,
        rawMagnitude: round(magnitude, 3),
        filteredMagnitude: round(filteredMagnitude, 3),
        baseline: round(baseline, 3),
        threshold: round(threshold, 3),
        centeredMagnitude: round(centered, 3),
        confidence: round(candidateConfidence, 3),
        accepted,
      },
      config.debugWindow
    );

    return {
      step,
      snapshot: getSnapshot(),
    };
  }

  return {
    processSample,
    updateGpsContext,
    getSnapshot,
    reset,
  };
}
