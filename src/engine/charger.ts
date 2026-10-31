import { Charger, ChargerTrustScoreResult, VehicleProfile } from '../data/types';

const TAU_MINUTES = 45; // Characteristic freshness decay time constant

/**
 * Computes transparent Bayesian Charger Trust Score and usable probability.
 * Enforces hard compatibility gating, exponential status age decay,
 * historical session priors, and arrival queue deratings.
 */
export function calculateChargerTrustScore(
  charger: Charger,
  vehicle: VehicleProfile,
  customAgeMinutes?: number
): ChargerTrustScoreResult {
  const effectiveAgeMinutes = customAgeMinutes !== undefined ? customAgeMinutes : charger.statusAgeMinutes;

  // 1. Compatibility Hard Gate
  const hasCompatibleConnector = charger.connectors.some((conn) =>
    vehicle.compatibleConnectors.includes(conn)
  );

  if (!hasCompatibleConnector) {
    return {
      chargerId: charger.id,
      isCompatible: false,
      incompatibleReason: `Incompatible connector: Charger offers [${charger.connectors.join(', ')}] but vehicle requires [${vehicle.compatibleConnectors.join(', ')}]`,
      freshnessWeight: 0,
      historicalPUsable: 0,
      statusPUsable: 0,
      arrivalOccupancyPenalty: 0,
      faultPenalty: 0,
      pUsable: 0,
      trustScore: 0,
      uncertaintyWidth: 0,
      evidenceSummary: 'Compatibility hard gate failed (0% trust).',
    };
  }

  // 2. Exponential Freshness Decay: w_fresh = exp(-age / tau)
  const freshnessWeight = Math.exp(-effectiveAgeMinutes / TAU_MINUTES);

  // 3. Historical Reliability (Laplace / Beta-prior mean)
  const nTotal = charger.recentSuccesses + charger.recentFailures;
  const pHist = (charger.recentSuccesses + 1) / (nTotal + 2);

  // 4. Status Reliability Mapping
  let pStatus = 0.50;
  if (charger.status === 'available') pStatus = 0.96;
  else if (charger.status === 'occupied') pStatus = 0.40;
  else if (charger.status === 'fault') pStatus = 0.04;
  else if (charger.status === 'unknown') pStatus = 0.48;

  // 5. Blended Usability Estimate
  const pBlended = freshnessWeight * pStatus + (1 - freshnessWeight) * pHist;

  // 6. Arrival Occupancy & Fault Report Penalties
  const arrivalOccupancyPenalty = charger.occupancyFactor * 0.22;
  const faultPenalty = Math.min(charger.faultReportsLast24h * 0.12, 0.36);

  const netPUsable = Math.max(0.02, Math.min(0.98, pBlended - arrivalOccupancyPenalty - faultPenalty));

  // 7. Uncertainty Interval (wider when status is stale and history sample size is small)
  const sampleSize = Math.max(nTotal + 2, 2);
  const betaVariance = (pHist * (1 - pHist)) / (sampleSize + 1);
  const stdError = Math.sqrt(betaVariance);
  const staleMultiplier = 1.0 + (1 - freshnessWeight) * 0.8;
  const uncertaintyHalfWidth = Math.min(1.645 * stdError * staleMultiplier, 0.30);

  // Lower confidence bound (LCB) for defensive trust score
  const pLowerBound = Math.max(0.02, netPUsable - uncertaintyHalfWidth * 0.6);
  const trustScore = Math.round(pLowerBound * 100);

  // 8. Plain-language evidence narrative
  let evidenceSummary = '';
  if (effectiveAgeMinutes > 120) {
    evidenceSummary = `Status is stale (${Math.floor(effectiveAgeMinutes / 60)}h ${effectiveAgeMinutes % 60}m old; freshness weight ${(freshnessWeight * 100).toFixed(1)}%). Reverting to historical reliability (${(pHist * 100).toFixed(0)}%).`;
  } else if (charger.status === 'available') {
    evidenceSummary = `Fresh telemetry (${effectiveAgeMinutes}m old; freshness weight ${(freshnessWeight * 100).toFixed(0)}%). High availability confirmed by ${charger.recentSuccesses} recent successful sessions.`;
  } else {
    evidenceSummary = `Status reported as '${charger.status}'. Evidence discounted by queue/fault risk.`;
  }

  return {
    chargerId: charger.id,
    isCompatible: true,
    freshnessWeight: Math.round(freshnessWeight * 1000) / 1000,
    historicalPUsable: Math.round(pHist * 1000) / 1000,
    statusPUsable: pStatus,
    arrivalOccupancyPenalty: Math.round(arrivalOccupancyPenalty * 1000) / 1000,
    faultPenalty: Math.round(faultPenalty * 1000) / 1000,
    pUsable: Math.round(netPUsable * 1000) / 1000,
    trustScore: Math.min(Math.max(trustScore, 1), 99),
    uncertaintyWidth: Math.round(uncertaintyHalfWidth * 2 * 100),
    evidenceSummary,
  };
}

