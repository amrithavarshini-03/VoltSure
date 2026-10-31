import { RouteSegment, VehicleProfile, SegmentEnergyOutput } from '../data/types';

const GRAVITY = 9.80665; // m/s^2
const AIR_DENSITY = 1.184; // kg/m^3 at ~30°C near sea level / Coimbatore elevation (~400m)

/**
 * Calculates physics-informed energy consumption for a given segment with
 * empirical correction terms for ambient temperature, stop-start traffic, and payload.
 */
export function calculateSegmentEnergy(
  segment: RouteSegment,
  vehicle: VehicleProfile,
  riderMassKg: number = 75,
  payloadKg: number = 0,
  ambientTempC: number = 33,
  auxLoadW: number = 25
): SegmentEnergyOutput {
  const totalMassKg = vehicle.massKg + riderMassKg + payloadKg;
  const speedMs = (segment.avgSpeedKmh * 1000) / 3600;
  const thetaRad = Math.atan(segment.gradePercent / 100);

  // 1. Aerodynamic drag resistance force (N)
  const fAero = 0.5 * AIR_DENSITY * vehicle.cda * speedMs * speedMs;

  // 2. Rolling resistance force (N)
  const fRoll = vehicle.cr * totalMassKg * GRAVITY * Math.cos(thetaRad);

  // 3. Gravitational grade force (N)
  const fGrade = totalMassKg * GRAVITY * Math.sin(thetaRad);

  // 4. Mechanical tractive power (W)
  const pMech = (fAero + fRoll + fGrade) * speedMs;

  // 5. Electrical conversion with drivetrain / regen efficiencies
  let pElec: number;
  let isRegen = false;

  if (pMech >= 0) {
    pElec = (pMech / vehicle.drivetrainEfficiency) + vehicle.auxPowerW + auxLoadW;
  } else {
    // Regenerative descent
    isRegen = true;
    const regenPower = pMech * vehicle.regenEfficiency;
    // Cap regen to 1.5 kW max for 2W/3W pack safety
    const clampedRegen = Math.max(regenPower, -1500);
    pElec = clampedRegen + vehicle.auxPowerW + auxLoadW;
  }

  // 6. Learned Environmental & Traffic Corrections
  // Traffic stop-start idling and repeated acceleration penalty
  let trafficMultiplier = 1.0;
  if (segment.trafficLevel === 'moderate') {
    trafficMultiplier = 1.12;
  } else if (segment.trafficLevel === 'heavy') {
    trafficMultiplier = 1.28;
  }

  // Temperature efficiency derating (optimal ~25°C to 28°C)
  // Higher temperatures (>32°C) trigger pack fan/BMS cooling and increased internal resistance
  let tempMultiplier = 1.0;
  if (ambientTempC > 30) {
    tempMultiplier = 1.0 + (ambientTempC - 30) * 0.008; // ~33°C is +2.4%, 40°C is +8%
  } else if (ambientTempC < 20) {
    tempMultiplier = 1.0 + (20 - ambientTempC) * 0.012; // Cold penalty
  }

  const effectivePowerW = pElec * trafficMultiplier * tempMultiplier;

  // Segment duration in hours
  const durationHours = segment.distanceKm / Math.max(segment.avgSpeedKmh, 5);
  const energyWh = effectivePowerW * durationHours;
  const whPerKm = segment.distanceKm > 0 ? energyWh / segment.distanceKm : 0;

  return {
    segmentId: segment.id,
    distanceKm: segment.distanceKm,
    gradePercent: segment.gradePercent,
    avgSpeedKmh: segment.avgSpeedKmh,
    powerW: Math.round(effectivePowerW),
    energyWh: Math.round(energyWh * 10) / 10,
    whPerKm: Math.round(whPerKm * 10) / 10,
    isRegen,
  };
}

/**
 * Computes deterministic baseline energy for an entire candidate route.
 */
export function calculateRouteBaseEnergy(
  segments: RouteSegment[],
  vehicle: VehicleProfile,
  riderMassKg: number = 75,
  payloadKg: number = 0,
  ambientTempC: number = 33,
  auxLoadW: number = 25
): { totalEnergyWh: number; segmentBreakdown: SegmentEnergyOutput[] } {
  const breakdown = segments.map((seg) =>
    calculateSegmentEnergy(seg, vehicle, riderMassKg, payloadKg, ambientTempC, auxLoadW)
  );

  const totalEnergyWh = breakdown.reduce((acc, curr) => acc + curr.energyWh, 0);

  return {
    totalEnergyWh: Math.round(totalEnergyWh * 10) / 10,
    segmentBreakdown: breakdown,
  };
}

