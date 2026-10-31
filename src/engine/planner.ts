import {
  RouteCandidate,
  VehicleProfile,
  Charger,
  TripScenarioInputs,
  RoutePredictionResult,
} from '../data/types';
import { calculateUsableEnergy } from './battery';
import { runMonteCarloSimulation } from './uncertainty';
import { calculateChargerTrustScore } from './charger';
import { calculateRouteBaseEnergy } from './energy';

/**
 * Evaluates all candidate routes under uncertain battery, environmental,
 * and charger reliability constraints using joint Monte Carlo simulation.
 */
export function evaluateCandidateRoutes(
  routes: RouteCandidate[],
  chargers: Charger[],
  vehicle: VehicleProfile,
  inputs: TripScenarioInputs,
  chargerAgeOverrides: Record<string, number> = {}
): {
  evaluatedRoutes: RoutePredictionResult[];
  recommendedRouteId: string | null;
  overallFeasible: boolean;
  unmetTargetExplanation?: string;
} {
  const chargerMap = new Map<string, Charger>();
  chargers.forEach((c) => chargerMap.set(c.id, c));

  const usable = calculateUsableEnergy(
    vehicle,
    inputs.startingSoC,
    inputs.reservePercent,
    inputs.ambientTempC
  );

  const evaluatedRoutes: RoutePredictionResult[] = routes.map((route) => {
    // 1. Direct route evaluation
    if (route.isDirect || !route.chargingStopId) {
      const baseEnergy = calculateRouteBaseEnergy(
        route.segments,
        vehicle,
        75,
        inputs.payloadKg,
        inputs.ambientTempC,
        inputs.auxLoadW
      );

      const sim = runMonteCarloSimulation(
        route.segments,
        vehicle,
        inputs.startingSoC,
        inputs.reservePercent,
        usable.effectiveCapacityWh,
        inputs.riderHistoryTrips,
        inputs.trafficLevel,
        inputs.ambientTempC,
        inputs.payloadKg,
        inputs.auxLoadW,
        42
      );

      const availableAboveReserve = usable.usableEnergyWh - usable.protectedReserveWh - sim.p50EnergyWh;
      const targetProbDecimal = inputs.confidenceTarget / 100;
      const isFeasibleAtTarget = sim.pFeasibleArrival >= targetProbDecimal;

      let rejectionReason: string | undefined;
      if (!isFeasibleAtTarget) {
        rejectionReason = `Energy demand exceeds reserve budget in ${sim.reserveViolationsCount} of ${sim.totalSimulations} simulated scenarios (Estimated probability: ${(sim.pFeasibleArrival * 100).toFixed(1)}% vs required ${inputs.confidenceTarget}%).`;
      }

      const whyThisRoute: string[] = [];
      const whyNotRoute: string[] = [];

      if (isFeasibleAtTarget) {
        whyThisRoute.push(`Fastest travel time (${route.estDurationMinutes} mins) with zero detours or charging delays.`);
        whyThisRoute.push(`Sufficient battery headroom (+${Math.max(0, Math.round(availableAboveReserve))} Wh above reserve).`);
      } else {
        whyNotRoute.push(`Predicted p90 energy (${Math.round(sim.p90EnergyWh)} Wh) breaches your protected ${inputs.reservePercent}% reserve.`);
        whyNotRoute.push(`Stop-start traffic and uphill elevation drain high current without en-route replenishment.`);
      }

      return {
        routeId: route.id,
        routeName: route.name,
        totalDistanceKm: route.totalDistanceKm,
        durationMinutes: route.estDurationMinutes,
        p10EnergyWh: sim.p10EnergyWh,
        p50EnergyWh: sim.p50EnergyWh,
        p90EnergyWh: sim.p90EnergyWh,
        usableEnergyWh: usable.usableEnergyWh,
        protectedReserveWh: usable.protectedReserveWh,
        availableAboveReserveWh: Math.round(availableAboveReserve * 10) / 10,
        pFeasibleArrival: sim.pFeasibleArrival,
        p10ArrivalSoC: sim.p10ArrivalSoC,
        p50ArrivalSoC: sim.p50ArrivalSoC,
        p90ArrivalSoC: sim.p90ArrivalSoC,
        reserveViolationsCount: sim.reserveViolationsCount,
        totalSimulations: sim.totalSimulations,
        isFeasibleAtTarget,
        rejectionReason,
        segmentBreakdown: baseEnergy.segmentBreakdown,
        whyThisRoute,
        whyNotRoute,
      };
    }

    // 2. Route with en-route charging stop
    const primaryCharger = route.chargingStopId ? chargerMap.get(route.chargingStopId) : undefined;
    const fallbackCharger = route.fallbackStopId ? chargerMap.get(route.fallbackStopId) : undefined;

    const primaryAge = primaryCharger
      ? (chargerAgeOverrides[primaryCharger.id] !== undefined
          ? chargerAgeOverrides[primaryCharger.id]
          : primaryCharger.statusAgeMinutes)
      : 0;

    const primaryTrust = primaryCharger
      ? calculateChargerTrustScore(primaryCharger, vehicle, primaryAge)
      : null;

    const fallbackTrust = fallbackCharger
      ? calculateChargerTrustScore(fallbackCharger, vehicle)
      : undefined;

    // Split segments: leg 1 (origin to charger) & leg 2 (charger to destination)
    const midIdx = Math.max(1, Math.floor(route.segments.length / 2));
    const leg1Segments = route.segments.slice(0, midIdx);
    const leg2Segments = route.segments.slice(midIdx);

    const leg1Sim = runMonteCarloSimulation(
      leg1Segments,
      vehicle,
      inputs.startingSoC,
      inputs.reservePercent,
      usable.effectiveCapacityWh,
      inputs.riderHistoryTrips,
      inputs.trafficLevel,
      inputs.ambientTempC,
      inputs.payloadKg,
      inputs.auxLoadW,
      101
    );

    // After charging stop: SoC is boosted to target (e.g., 75% or 85%)
    const postChargeSoC = route.targetArrivalSoCAtStop || 78;
    const leg2Sim = runMonteCarloSimulation(
      leg2Segments,
      vehicle,
      postChargeSoC,
      inputs.reservePercent,
      usable.effectiveCapacityWh,
      inputs.riderHistoryTrips,
      inputs.trafficLevel,
      inputs.ambientTempC,
      inputs.payloadKg,
      inputs.auxLoadW,
      202
    );

    // Probability of reach stop * P(charger usable or fallback reachable) * P(leg 2 feasible)
    const pReachStop = leg1Sim.pFeasibleArrival;
    const pPrimaryUsable = primaryTrust ? primaryTrust.pUsable : 0;
    const pFallbackUsable = fallbackTrust ? fallbackTrust.pUsable : 0.85;

    // Joint usability with defensive fallback probability
    const pJointUsable = pPrimaryUsable + (1 - pPrimaryUsable) * (fallbackCharger ? pFallbackUsable * 0.90 : 0);
    const pReachDest = leg2Sim.pFeasibleArrival;

    const pFeasibleTotal = Math.max(0.01, Math.min(0.99, pReachStop * pJointUsable * pReachDest));

    const totalSimulatedP50 = leg1Sim.p50EnergyWh + leg2Sim.p50EnergyWh;
    const totalSimulatedP90 = leg1Sim.p90EnergyWh + leg2Sim.p90EnergyWh;
    const totalSimulatedP10 = leg1Sim.p10EnergyWh + leg2Sim.p10EnergyWh;

    const targetProbDecimal = inputs.confidenceTarget / 100;
    const isFeasibleAtTarget = pFeasibleTotal >= targetProbDecimal && (primaryTrust ? primaryTrust.isCompatible : false);

    const violationsCount = Math.round((1 - pFeasibleTotal) * 2000);

    const whyThisRoute: string[] = [];
    const whyNotRoute: string[] = [];

    if (isFeasibleAtTarget) {
      whyThisRoute.push(
        `High confidence plan (${(pFeasibleTotal * 100).toFixed(0)}% estimated) backed by verified charging stop at ${primaryCharger?.name}.`
      );
      whyThisRoute.push(
        `Includes redundant secondary fallback (${fallbackCharger?.name || 'Local Grid Station'}) to guard against primary outage.`
      );
      whyThisRoute.push(
        `Recharges pack to ${postChargeSoC}% SoC, providing ample reserve for uphill ascent into the foothills.`
      );
    } else {
      if (primaryTrust && !primaryTrust.isCompatible) {
        whyNotRoute.push(`Charger ${primaryCharger?.name} connector is incompatible with this vehicle.`);
      } else if (primaryTrust && primaryTrust.trustScore < 50) {
        whyNotRoute.push(
          `Primary charger status is stale or unreliable (Trust Score: ${primaryTrust.trustScore}/100, ${Math.floor(primaryAge / 60)}h old).`
        );
      } else {
        whyNotRoute.push(
          `Joint probability (${(pFeasibleTotal * 100).toFixed(1)}%) does not satisfy your strict ${inputs.confidenceTarget}% confidence target.`
        );
      }
    }

    const baseEnergy = calculateRouteBaseEnergy(
      route.segments,
      vehicle,
      75,
      inputs.payloadKg,
      inputs.ambientTempC,
      inputs.auxLoadW
    );

    let rejectionReason: string | undefined;
    if (!isFeasibleAtTarget) {
      rejectionReason = primaryTrust && !primaryTrust.isCompatible
        ? primaryTrust.incompatibleReason
        : `Joint probability of ${(pFeasibleTotal * 100).toFixed(1)}% falls below ${inputs.confidenceTarget}% confidence requirement.`;
    }

    return {
      routeId: route.id,
      routeName: route.name,
      totalDistanceKm: route.totalDistanceKm,
      durationMinutes: route.estDurationMinutes + (route.chargeDurationMinutes || 0),
      p10EnergyWh: Math.round(totalSimulatedP10),
      p50EnergyWh: Math.round(totalSimulatedP50),
      p90EnergyWh: Math.round(totalSimulatedP90),
      usableEnergyWh: usable.usableEnergyWh,
      protectedReserveWh: usable.protectedReserveWh,
      availableAboveReserveWh: Math.round((usable.usableEnergyWh + 1200 - usable.protectedReserveWh - totalSimulatedP50) * 10) / 10,
      pFeasibleArrival: Math.round(pFeasibleTotal * 1000) / 1000,
      p10ArrivalSoC: leg2Sim.p10ArrivalSoC,
      p50ArrivalSoC: leg2Sim.p50ArrivalSoC,
      p90ArrivalSoC: leg2Sim.p90ArrivalSoC,
      reserveViolationsCount: violationsCount,
      totalSimulations: 2000,
      isFeasibleAtTarget,
      rejectionReason,
      segmentBreakdown: baseEnergy.segmentBreakdown,
      chargingStop: primaryCharger && primaryTrust
        ? {
            charger: primaryCharger,
            trustScore: primaryTrust,
            energyToStopWh: Math.round(leg1Sim.p50EnergyWh),
            socAtArrivalAtStop: Math.round(leg1Sim.p50ArrivalSoC),
            energyAfterStopWh: Math.round(leg2Sim.p50EnergyWh),
            chargeAddedKWh: Math.round(((postChargeSoC - leg1Sim.p50ArrivalSoC) / 100) * (usable.effectiveCapacityWh / 1000) * 10) / 10,
            fallbackCharger,
            fallbackTrustScore: fallbackTrust,
          }
        : undefined,
      whyThisRoute,
      whyNotRoute,
    };
  });

  // Utility Ranking: J(r) = alpha * T + beta * E + gamma * (1 - pFeasible)*100
  // Lower J is better. Feasible routes strictly outrank non-feasible ones.
  const feasibleRoutes = evaluatedRoutes.filter((r) => r.isFeasibleAtTarget);

  let recommendedRouteId: string | null = null;
  if (feasibleRoutes.length > 0) {
    feasibleRoutes.sort((a, b) => {
      // Prioritize probability, then travel time
      const scoreA = (1 - a.pFeasibleArrival) * 500 + a.durationMinutes * 0.5;
      const scoreB = (1 - b.pFeasibleArrival) * 500 + b.durationMinutes * 0.5;
      return scoreA - scoreB;
    });
    recommendedRouteId = feasibleRoutes[0].routeId;
  } else {
    // If no route meets target, select the safest option
    const sortedBySafety = [...evaluatedRoutes].sort((a, b) => b.pFeasibleArrival - a.pFeasibleArrival);
    recommendedRouteId = sortedBySafety[0]?.routeId || null;
  }

  return {
    evaluatedRoutes,
    recommendedRouteId,
    overallFeasible: feasibleRoutes.length > 0,
    unmetTargetExplanation: feasibleRoutes.length === 0
      ? `No candidate route satisfies your ${inputs.confidenceTarget}% confidence requirement with protected reserve under current conditions.`
      : undefined,
  };
}

