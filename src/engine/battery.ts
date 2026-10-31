import { VehicleProfile } from '../data/types';

export interface UsableEnergyResult {
  nominalCapacityWh: number;
  effectiveCapacityWh: number;
  usableEnergyWh: number;
  protectedReserveWh: number;
  availableAboveReserveWh: number; // Can be negative if starting below reserve
  temperatureFactor: number;
  sohUsed: number;
  isSohEstimated: boolean;
}

/**
 * Calculates battery available energy budget and protected reserve capacity.
 * Derates capacity based on high/low cell temperatures and SoH degradation.
 */
export function calculateUsableEnergy(
  vehicle: VehicleProfile,
  startingSoC: number,
  reservePercent: number,
  ambientTempC: number = 33,
  sohEstimate: number | null = null
): UsableEnergyResult {
  const nominalCapacityWh = vehicle.claimedCapacityKWh * 1000;

  // If SoH is not provided by BMS, use a conservative 94% reference and note uncertainty
  const isSohEstimated = sohEstimate === null;
  const sohUsed = sohEstimate !== null ? Math.min(Math.max(sohEstimate, 0.7), 1.0) : 0.94;

  // Temperature capacity derating (Li-ion electrochemical availability)
  let temperatureFactor = 1.0;
  if (ambientTempC < 20) {
    // Capacity reduction in cold (0.5% per deg below 20)
    temperatureFactor = Math.max(0.75, 1.0 - (20 - ambientTempC) * 0.006);
  } else if (ambientTempC > 38) {
    // Thermal safety throttling cutoff headroom
    temperatureFactor = Math.max(0.92, 1.0 - (ambientTempC - 38) * 0.005);
  }

  const effectiveCapacityWh = nominalCapacityWh * sohUsed * temperatureFactor;

  const boundedSoC = Math.min(Math.max(startingSoC, 0), 100);
  const boundedReservePercent = Math.min(Math.max(reservePercent, 0), 40);

  const usableEnergyWh = effectiveCapacityWh * (boundedSoC / 100);
  const protectedReserveWh = effectiveCapacityWh * (boundedReservePercent / 100);
  const availableAboveReserveWh = usableEnergyWh - protectedReserveWh;

  return {
    nominalCapacityWh: Math.round(nominalCapacityWh),
    effectiveCapacityWh: Math.round(effectiveCapacityWh),
    usableEnergyWh: Math.round(usableEnergyWh * 10) / 10,
    protectedReserveWh: Math.round(protectedReserveWh * 10) / 10,
    availableAboveReserveWh: Math.round(availableAboveReserveWh * 10) / 10,
    temperatureFactor: Math.round(temperatureFactor * 1000) / 1000,
    sohUsed: Math.round(sohUsed * 100),
    isSohEstimated,
  };
}

