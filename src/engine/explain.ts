import {
  RouteCandidate,
  VehicleProfile,
  Charger,
  TripScenarioInputs,
  RoutePredictionResult,
} from '../data/types';
import { runMonteCarloSimulation } from './uncertainty';
import { calculateUsableEnergy } from './battery';

export interface CounterfactualAdvice {
  parameter: 'startingSoC' | 'traffic' | 'reserve' | 'charger';
  description: string;
  actionableValue: string | number;
  expectedFeasibilityPercent: number;
}

/**
 * Performs counterfactual parameter search to discover minimal condition adjustments
 * that would make an infeasible route feasible at the target confidence level.
 */
export function generateCounterfactualExplanations(
  rejectedRoute: RoutePredictionResult,
  routeCandidate: RouteCandidate,
  vehicle: VehicleProfile,
  inputs: TripScenarioInputs,
  recommendedRoute?: RoutePredictionResult
): {
  reasons: string[];
  advices: CounterfactualAdvice[];
  evidenceBulletins: string[];
} {
  const reasons: string[] = [];
  const advices: CounterfactualAdvice[] = [];
  const evidenceBulletins: string[] = [];

  // Core explanation template 1:
  reasons.push(
    `The direct route was rejected because energy demand exceeds the protected budget in ${rejectedRoute.reserveViolationsCount} of ${rejectedRoute.totalSimulations} modelled scenarios.`
  );

  // Core explanation template 2 (if recommended alternative exists):
  if (recommendedRoute && recommendedRoute.routeId !== rejectedRoute.routeId) {
    const marginWh = Math.round(recommendedRoute.availableAboveReserveWh);
    const recStop = recommendedRoute.chargingStop;
    if (recStop) {
      reasons.push(
        `${recommendedRoute.routeName} has a larger predicted margin (+${marginWh} Wh above reserve) and a charging stop with fresher evidence (status ${recStop.charger.statusAgeMinutes}m old with ${recStop.trustScore.trustScore}/100 trust score).`
      );
    }
  }

  // Core explanation template 3 (rider history):
  if (inputs.riderHistoryTrips < 50) {
    evidenceBulletins.push(
      `Confidence is lower than usual because this vehicle profile has only ${inputs.riderHistoryTrips} logged reference trips; uncertainty intervals have been defensively widened.`
    );
  }

  // Core explanation template 6 (stale status):
  evidenceBulletins.push(
    `A stale 'available' status is not treated as fresh evidence. Freshness decays exponentially with a 45-minute half-life.`
  );

  // Counterfactual search 1: Binary search on starting SoC needed for direct route
  let low = inputs.startingSoC;
  let high = 100;
  let viableSoC: number | null = null;

  for (let iter = 0; iter < 8; iter++) {
    const testSoC = Math.round((low + high) / 2);
    const testUsable = calculateUsableEnergy(vehicle, testSoC, inputs.reservePercent, inputs.ambientTempC);
    const sim = runMonteCarloSimulation(
      routeCandidate.segments,
      vehicle,
      testSoC,
      inputs.reservePercent,
      testUsable.effectiveCapacityWh,
      inputs.riderHistoryTrips,
      inputs.trafficLevel,
      inputs.ambientTempC,
      inputs.payloadKg,
      inputs.auxLoadW,
      42
    );

    if (sim.pFeasibleArrival >= inputs.confidenceTarget / 100) {
      viableSoC = testSoC;
      high = testSoC; // Try lower
    } else {
      low = testSoC + 1; // Need higher
    }
  }

  if (viableSoC !== null && viableSoC <= 100) {
    advices.push({
      parameter: 'startingSoC',
      description: `To make ${routeCandidate.name} feasible at ${inputs.confidenceTarget}%: start with ≥ ${viableSoC}% SoC.`,
      actionableValue: viableSoC,
      expectedFeasibilityPercent: inputs.confidenceTarget,
    });
  }

  // Counterfactual search 2: Free-flow traffic impact
  if (inputs.trafficLevel !== 'free') {
    const testUsable = calculateUsableEnergy(vehicle, inputs.startingSoC, inputs.reservePercent, inputs.ambientTempC);
    const freeSim = runMonteCarloSimulation(
      routeCandidate.segments,
      vehicle,
      inputs.startingSoC,
      inputs.reservePercent,
      testUsable.effectiveCapacityWh,
      inputs.riderHistoryTrips,
      'free',
      inputs.ambientTempC,
      inputs.payloadKg,
      inputs.auxLoadW,
      42
    );

    const freeFlowP = Math.round(freeSim.pFeasibleArrival * 100);
    advices.push({
      parameter: 'traffic',
      description: `If traffic clears to free-flow, feasibility reaches ${freeFlowP}%; VoltSure will reassess when new traffic data arrives.`,
      actionableValue: 'free',
      expectedFeasibilityPercent: freeFlowP,
    });
  }

  // Counterfactual search 3: Lower reserve tolerance
  if (inputs.reservePercent > 5) {
    const testUsable = calculateUsableEnergy(vehicle, inputs.startingSoC, 5, inputs.ambientTempC);
    const relaxedSim = runMonteCarloSimulation(
      routeCandidate.segments,
      vehicle,
      inputs.startingSoC,
      5,
      testUsable.effectiveCapacityWh,
      inputs.riderHistoryTrips,
      inputs.trafficLevel,
      inputs.ambientTempC,
      inputs.payloadKg,
      inputs.auxLoadW,
      42
    );

    const relaxedP = Math.round(relaxedSim.pFeasibleArrival * 100);
    if (relaxedP >= 75) {
      advices.push({
        parameter: 'reserve',
        description: `Reducing protected reserve to 5% raises estimated arrival feasibility to ${relaxedP}% (increases risk of zero-charge stall).`,
        actionableValue: 5,
        expectedFeasibilityPercent: relaxedP,
      });
    }
  }

  return {
    reasons,
    advices,
    evidenceBulletins,
  };
}

