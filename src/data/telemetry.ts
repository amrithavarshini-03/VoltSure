import { TelemetryPoint } from './types';

// 40-minute simulated in-flight BMS telemetry stream (Coimbatore Gandhipuram heading towards Anaikatti)
export const SIMULATED_TELEMETRY_STREAM: TelemetryPoint[] = [
  { timeOffsetSeconds: 0, distanceCompletedKm: 0.0, speedKmh: 0, currentGradePercent: 0.0, currentSoC: 42.0, packVoltageV: 50.8, packCurrentA: 0.8, batteryTempC: 32.0, ambientTempC: 33.0, instantaneousPowerW: 40 },
  { timeOffsetSeconds: 120, distanceCompletedKm: 0.8, speedKmh: 24, currentGradePercent: 0.2, currentSoC: 41.5, packVoltageV: 49.8, packCurrentA: 18.2, batteryTempC: 32.2, ambientTempC: 33.0, instantaneousPowerW: 906 },
  { timeOffsetSeconds: 240, distanceCompletedKm: 1.6, speedKmh: 22, currentGradePercent: 0.3, currentSoC: 41.0, packVoltageV: 49.5, packCurrentA: 21.0, batteryTempC: 32.5, ambientTempC: 33.1, instantaneousPowerW: 1039 },
  { timeOffsetSeconds: 360, distanceCompletedKm: 2.3, speedKmh: 18, currentGradePercent: 0.1, currentSoC: 40.5, packVoltageV: 49.9, packCurrentA: 14.5, batteryTempC: 32.8, ambientTempC: 33.1, instantaneousPowerW: 723 },
  { timeOffsetSeconds: 480, distanceCompletedKm: 3.1, speedKmh: 26, currentGradePercent: 0.2, currentSoC: 39.9, packVoltageV: 49.4, packCurrentA: 19.8, batteryTempC: 33.0, ambientTempC: 33.2, instantaneousPowerW: 978 },
  { timeOffsetSeconds: 600, distanceCompletedKm: 4.0, speedKmh: 28, currentGradePercent: 0.4, currentSoC: 39.2, packVoltageV: 49.2, packCurrentA: 22.4, batteryTempC: 33.4, ambientTempC: 33.2, instantaneousPowerW: 1102 },
  { timeOffsetSeconds: 720, distanceCompletedKm: 5.2, speedKmh: 35, currentGradePercent: 0.3, currentSoC: 38.4, packVoltageV: 49.1, packCurrentA: 24.0, batteryTempC: 33.7, ambientTempC: 33.3, instantaneousPowerW: 1178 },
  { timeOffsetSeconds: 840, distanceCompletedKm: 6.5, speedKmh: 38, currentGradePercent: 0.2, currentSoC: 37.6, packVoltageV: 49.0, packCurrentA: 23.5, batteryTempC: 34.0, ambientTempC: 33.3, instantaneousPowerW: 1151 },
  { timeOffsetSeconds: 960, distanceCompletedKm: 7.8, speedKmh: 42, currentGradePercent: 0.5, currentSoC: 36.7, packVoltageV: 48.8, packCurrentA: 26.2, batteryTempC: 34.4, ambientTempC: 33.4, instantaneousPowerW: 1278 },
  { timeOffsetSeconds: 1080, distanceCompletedKm: 9.2, speedKmh: 44, currentGradePercent: 0.4, currentSoC: 35.8, packVoltageV: 48.7, packCurrentA: 25.8, batteryTempC: 34.8, ambientTempC: 33.4, instantaneousPowerW: 1256 },
  { timeOffsetSeconds: 1200, distanceCompletedKm: 10.7, speedKmh: 46, currentGradePercent: 0.6, currentSoC: 34.8, packVoltageV: 48.5, packCurrentA: 28.0, batteryTempC: 35.2, ambientTempC: 33.5, instantaneousPowerW: 1358 },
  { timeOffsetSeconds: 1320, distanceCompletedKm: 12.3, speedKmh: 48, currentGradePercent: 0.5, currentSoC: 33.7, packVoltageV: 48.4, packCurrentA: 27.5, batteryTempC: 35.5, ambientTempC: 33.5, instantaneousPowerW: 1331 },
  { timeOffsetSeconds: 1440, distanceCompletedKm: 13.9, speedKmh: 48, currentGradePercent: 0.7, currentSoC: 32.5, packVoltageV: 48.2, packCurrentA: 29.4, batteryTempC: 36.0, ambientTempC: 33.6, instantaneousPowerW: 1417 },
  { timeOffsetSeconds: 1560, distanceCompletedKm: 15.5, speedKmh: 45, currentGradePercent: 0.8, currentSoC: 31.2, packVoltageV: 48.0, packCurrentA: 31.0, batteryTempC: 36.5, ambientTempC: 33.6, instantaneousPowerW: 1488 },
  { timeOffsetSeconds: 1680, distanceCompletedKm: 17.1, speedKmh: 46, currentGradePercent: 0.9, currentSoC: 29.8, packVoltageV: 47.8, packCurrentA: 32.5, batteryTempC: 37.0, ambientTempC: 33.7, instantaneousPowerW: 1553 },
  { timeOffsetSeconds: 1800, distanceCompletedKm: 18.7, speedKmh: 44, currentGradePercent: 1.1, currentSoC: 28.3, packVoltageV: 47.5, packCurrentA: 34.2, batteryTempC: 37.5, ambientTempC: 33.7, instantaneousPowerW: 1624 },
  { timeOffsetSeconds: 1920, distanceCompletedKm: 20.2, speedKmh: 42, currentGradePercent: 1.3, currentSoC: 26.6, packVoltageV: 47.2, packCurrentA: 36.0, batteryTempC: 38.1, ambientTempC: 33.8, instantaneousPowerW: 1699 },
  { timeOffsetSeconds: 2040, distanceCompletedKm: 21.6, speedKmh: 40, currentGradePercent: 1.4, currentSoC: 24.8, packVoltageV: 47.0, packCurrentA: 37.5, batteryTempC: 38.7, ambientTempC: 33.8, instantaneousPowerW: 1762 },
  { timeOffsetSeconds: 2160, distanceCompletedKm: 23.0, speedKmh: 38, currentGradePercent: 1.6, currentSoC: 22.9, packVoltageV: 46.7, packCurrentA: 39.2, batteryTempC: 39.3, ambientTempC: 33.9, instantaneousPowerW: 1830 },
  { timeOffsetSeconds: 2280, distanceCompletedKm: 24.3, speedKmh: 36, currentGradePercent: 1.8, currentSoC: 20.8, packVoltageV: 46.3, packCurrentA: 41.0, batteryTempC: 39.9, ambientTempC: 33.9, instantaneousPowerW: 1898 },
  { timeOffsetSeconds: 2400, distanceCompletedKm: 25.5, speedKmh: 34, currentGradePercent: 1.9, currentSoC: 18.5, packVoltageV: 45.9, packCurrentA: 42.5, batteryTempC: 40.4, ambientTempC: 34.0, instantaneousPowerW: 1950 },
];

