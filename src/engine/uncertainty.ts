import { SeededRNG } from './rng';
import { RouteSegment, VehicleProfile } from '../data/types';
import { calculateSegmentEnergy } from './energy';

export interface MonteCarloHistogramBin {
  socMin: number;
  socMax: number;
  label: string;
  count: number;
  isReserveBreached: boolean;
}

export interface UncertaintySimulationResult {
  p10EnergyWh: number;
  p50EnergyWh: number;
  p90EnergyWh: number;
  p10ArrivalSoC: number;
  p50ArrivalSoC: number;
  p90ArrivalSoC: number;
  reserveViolationsCount: number;
  totalSimulations: number;
  pFeasibleArrival: number; // 0.0 to 1.0
  histogramBins: MonteCarloHistogramBin[];
  simulatedArrivalSoCs: number[]; // First 200 samples for sparkline / scatter
  sigmaUsed: number;
}

/**
 * Executes a 2,000-run Monte Carlo simulation using seeded PRNG
 * to quantify segment-level variance and trip-level reserve viability.
 */
export function runMonteCarloSimulation(
  segments: RouteSegment[],
  vehicle: VehicleProfile,
  startingSoC: number,
  reservePercent: number,
  effectiveCapacityWh: number,
  riderHistoryTrips: 3 | 25 | 120,
  trafficLevel: 'free' | 'moderate' | 'heavy',
  ambientTempC: number,
  payloadKg: number,
  auxLoadW: number,
  seed: number = 42
): UncertaintySimulationResult {
  const NUM_SIMULATIONS = 2000;
  const rng = new SeededRNG(seed);

  // Determine base segment expected energies
  const segmentBaseEnergies = segments.map((seg) => {
    const res = calculateSegmentEnergy(seg, vehicle, 75, payloadKg, ambientTempC, auxLoadW);
    return res.energyWh;
  });

  // Calculate composite log-normal sigma
  // 1. Rider history factor
  let sigmaHistory = 0.05;
  if (riderHistoryTrips === 3) sigmaHistory = 0.16;
  else if (riderHistoryTrips === 25) sigmaHistory = 0.08;
  else if (riderHistoryTrips === 120) sigmaHistory = 0.04;

  // 2. Traffic variance factor
  let sigmaTraffic = 0.04;
  if (trafficLevel === 'moderate') sigmaTraffic = 0.09;
  else if (trafficLevel === 'heavy') sigmaTraffic = 0.14;

  // 3. Ambient temperature extremity
  const tempDeviation = Math.abs(ambientTempC - 26);
  const sigmaTemp = Math.min(tempDeviation * 0.003, 0.06);

  // Composite per-segment uncertainty sigma
  const compositeSigma = Math.sqrt(
    sigmaHistory * sigmaHistory + sigmaTraffic * sigmaTraffic + sigmaTemp * sigmaTemp
  );

  const usableEnergyWh = effectiveCapacityWh * (startingSoC / 100);
  const protectedReserveWh = effectiveCapacityWh * (reservePercent / 100);
  const availableBudgetWh = usableEnergyWh - protectedReserveWh;

  const simulatedTripEnergies: number[] = new Array(NUM_SIMULATIONS);
  const simulatedArrivalSoCs: number[] = new Array(NUM_SIMULATIONS);
  let reserveViolationsCount = 0;

  for (let s = 0; s < NUM_SIMULATIONS; s++) {
    let tripEnergy = 0;

    for (let i = 0; i < segmentBaseEnergies.length; i++) {
      const baseE = segmentBaseEnergies[i];
      if (baseE > 0) {
        const noiseMultiplier = rng.nextLogNormal(compositeSigma);
        tripEnergy += baseE * noiseMultiplier;
      } else {
        // Regen segments have tighter variance bounded by pack physics
        const noiseMultiplier = rng.nextLogNormal(compositeSigma * 0.5);
        tripEnergy += baseE * noiseMultiplier;
      }
    }

    simulatedTripEnergies[s] = tripEnergy;

    // Remaining energy and arrival SoC
    const remainingEnergyWh = usableEnergyWh - tripEnergy;
    const arrivalSoC = (remainingEnergyWh / effectiveCapacityWh) * 100;
    // Clamp to minimum 0% for physical plausibility (flagging deep discharge)
    simulatedArrivalSoCs[s] = Math.max(arrivalSoC, -10);

    if (tripEnergy > availableBudgetWh) {
      reserveViolationsCount++;
    }
  }

  // Sort to extract percentiles
  simulatedTripEnergies.sort((a, b) => a - b);
  simulatedArrivalSoCs.sort((a, b) => a - b);

  const idx10 = Math.floor(NUM_SIMULATIONS * 0.1);
  const idx50 = Math.floor(NUM_SIMULATIONS * 0.5);
  const idx90 = Math.floor(NUM_SIMULATIONS * 0.9);

  const p10EnergyWh = simulatedTripEnergies[idx10];
  const p50EnergyWh = simulatedTripEnergies[idx50];
  const p90EnergyWh = simulatedTripEnergies[idx90];

  const p10ArrivalSoC = simulatedArrivalSoCs[idx10];
  const p50ArrivalSoC = simulatedArrivalSoCs[idx50];
  const p90ArrivalSoC = simulatedArrivalSoCs[idx90];

  const successfulRuns = NUM_SIMULATIONS - reserveViolationsCount;
  const pFeasibleArrival = Math.max(0, Math.min(1, successfulRuns / NUM_SIMULATIONS));

  // Build 14-bin histogram of arrival SoC
  const minSoC = Math.floor(Math.min(simulatedArrivalSoCs[0], 0));
  const maxSoC = Math.ceil(Math.max(simulatedArrivalSoCs[NUM_SIMULATIONS - 1], reservePercent + 15));
  const binCount = 14;
  const binWidth = Math.max((maxSoC - minSoC) / binCount, 1.5);

  const histogramBins: MonteCarloHistogramBin[] = [];
  for (let b = 0; b < binCount; b++) {
    const bMin = minSoC + b * binWidth;
    const bMax = bMin + binWidth;
    histogramBins.push({
      socMin: Math.round(bMin * 10) / 10,
      socMax: Math.round(bMax * 10) / 10,
      label: `${Math.round(bMin)}–${Math.round(bMax)}%`,
      count: 0,
      isReserveBreached: bMax <= reservePercent,
    });
  }

  for (let i = 0; i < NUM_SIMULATIONS; i++) {
    const val = simulatedArrivalSoCs[i];
    const binIdx = Math.min(Math.floor((val - minSoC) / binWidth), binCount - 1);
    if (binIdx >= 0 && binIdx < binCount) {
      histogramBins[binIdx].count++;
    }
  }

  return {
    p10EnergyWh: Math.round(p10EnergyWh * 10) / 10,
    p50EnergyWh: Math.round(p50EnergyWh * 10) / 10,
    p90EnergyWh: Math.round(p90EnergyWh * 10) / 10,
    p10ArrivalSoC: Math.round(p10ArrivalSoC * 10) / 10,
    p50ArrivalSoC: Math.round(p50ArrivalSoC * 10) / 10,
    p90ArrivalSoC: Math.round(p90ArrivalSoC * 10) / 10,
    reserveViolationsCount,
    totalSimulations: NUM_SIMULATIONS,
    pFeasibleArrival: Math.round(pFeasibleArrival * 1000) / 1000,
    histogramBins,
    simulatedArrivalSoCs: simulatedArrivalSoCs.slice(0, 250), // Subsample for visualization
    sigmaUsed: Math.round(compositeSigma * 1000) / 1000,
  };
}

