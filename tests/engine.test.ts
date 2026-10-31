import { describe, it, expect } from 'vitest';
import { calculateSegmentEnergy } from '../src/engine/energy';
import { calculateChargerTrustScore } from '../src/engine/charger';
import { evaluateCandidateRoutes } from '../src/engine/planner';
import { runMonteCarloSimulation } from '../src/engine/uncertainty';
import { SeededRNG } from '../src/engine/rng';
import { VehicleProfile, RouteCandidate, Charger, RouteSegment, TripScenarioInputs } from '../src/data/types';
import { useVoltSureStore, DEMO_USERS } from '../src/store/useVoltSureStore';

const mockVehicle: VehicleProfile = {
  id: 'ref-ola-s1z-3kwh',
  name: 'Reference vehicle profile — Ola S1 Z (3.1 kWh)',
  variant: '3.1 kWh (Claimed 179 km)',
  claimedCapacityKWh: 3.1,
  claimedRangeKm: 179,
  nominalVoltageV: 51.2,
  massKg: 122,
  cr: 0.015,
  cda: 0.42,
  drivetrainEfficiency: 0.88,
  regenEfficiency: 0.60,
  auxPowerW: 30,
  compatibleConnectors: ['LECCS', 'Type 2'],
  provenance: 'REAL',
  notes: 'Claimed figures from a user-supplied reference; not independently validated.',
};

describe('VoltSure Deterministic Engine Tests', () => {
  it('1. PRNG produces strictly deterministic sequences with identical seed', () => {
    const rng1 = new SeededRNG(12345);
    const rng2 = new SeededRNG(12345);
    for (let i = 0; i < 20; i++) {
      expect(rng1.next()).toBe(rng2.next());
    }
  });

  it('2. Segment energy increases monotonically with steeper positive elevation grade', () => {
    const flatSegment: RouteSegment = {
      id: 'seg-flat',
      distanceKm: 5,
      startElevationM: 400,
      endElevationM: 400,
      gradePercent: 0,
      avgSpeedKmh: 45,
      trafficLevel: 'free',
    };

    const uphillSegment: RouteSegment = {
      ...flatSegment,
      id: 'seg-uphill',
      endElevationM: 600,
      gradePercent: 4.0,
    };

    const steepSegment: RouteSegment = {
      ...flatSegment,
      id: 'seg-steep',
      endElevationM: 800,
      gradePercent: 8.0,
    };

    const energyFlat = calculateSegmentEnergy(flatSegment, mockVehicle).energyWh;
    const energyUphill = calculateSegmentEnergy(uphillSegment, mockVehicle).energyWh;
    const energySteep = calculateSegmentEnergy(steepSegment, mockVehicle).energyWh;

    expect(energyUphill).toBeGreaterThan(energyFlat);
    expect(energySteep).toBeGreaterThan(energyUphill);
  });

  it('3. Feasibility probability decreases as starting SoC drops', () => {
    const testSegments: RouteSegment[] = [
      { id: 's1', distanceKm: 15, startElevationM: 410, endElevationM: 450, gradePercent: 0.2, avgSpeedKmh: 40, trafficLevel: 'free' },
      { id: 's2', distanceKm: 15, startElevationM: 450, endElevationM: 520, gradePercent: 0.4, avgSpeedKmh: 45, trafficLevel: 'moderate' },
    ];

    const highSocSim = runMonteCarloSimulation(testSegments, mockVehicle, 80, 10, 3100, 25, 'moderate', 33, 20, 25, 42);
    const midSocSim = runMonteCarloSimulation(testSegments, mockVehicle, 42, 10, 3100, 25, 'moderate', 33, 20, 25, 42);
    const lowSocSim = runMonteCarloSimulation(testSegments, mockVehicle, 22, 10, 3100, 25, 'moderate', 33, 20, 25, 42);

    expect(highSocSim.pFeasibleArrival).toBeGreaterThan(midSocSim.pFeasibleArrival);
    expect(midSocSim.pFeasibleArrival).toBeGreaterThan(lowSocSim.pFeasibleArrival);
  });

  it('4. Stale status age exponentially lowers Charger Trust Score', () => {
    const freshCharger: Charger = {
      id: 'ch-test',
      name: 'VoltHub Thadagam Test',
      operator: 'SimulatedGrid',
      lat: 11.02,
      lng: 76.95,
      connectors: ['LECCS', 'Type 2'],
      powerKw: 15,
      status: 'available',
      statusAgeMinutes: 4, // Fresh (4 min)
      statusSource: 'OCPP Heartbeat',
      recentSuccesses: 18,
      recentFailures: 2,
      faultReportsLast24h: 0,
      occupancyFactor: 0.1,
      operatingHours: '24/7',
      accessNotes: 'Clear access',
      provenance: 'SIMULATED',
    };

    const freshScore = calculateChargerTrustScore(freshCharger, mockVehicle, 4);
    const staleScore = calculateChargerTrustScore(freshCharger, mockVehicle, 220); // 3h 40m stale

    expect(freshScore.trustScore).toBeGreaterThan(staleScore.trustScore);
    expect(freshScore.freshnessWeight).toBeGreaterThan(staleScore.freshnessWeight);
    expect(staleScore.freshnessWeight).toBeLessThan(0.05); // e^(-220/45) < 0.05
  });

  it('5. Incompatible connector gates Charger Trust Score to exactly 0', () => {
    const incompatibleCharger: Charger = {
      id: 'ch-incompatible',
      name: 'Heavy Bus CCS1 Hub',
      operator: 'SimulatedBusNet',
      lat: 11.05,
      lng: 76.92,
      connectors: ['CCS1-Heavy', 'GB/T'], // Neither is in vehicle's ['LECCS', 'Type 2']
      powerKw: 60,
      status: 'available',
      statusAgeMinutes: 2,
      statusSource: 'OCPP Heartbeat',
      recentSuccesses: 50,
      recentFailures: 0,
      faultReportsLast24h: 0,
      occupancyFactor: 0.0,
      operatingHours: '24/7',
      accessNotes: 'Commercial Depot',
      provenance: 'SIMULATED',
    };

    const result = calculateChargerTrustScore(incompatibleCharger, mockVehicle);
    expect(result.isCompatible).toBe(false);
    expect(result.trustScore).toBe(0);
    expect(result.pUsable).toBe(0);
    expect(result.incompatibleReason).toContain('Incompatible connector');
  });

  it('6. Risk-aware planner rejects infeasible Direct Route A and recommends Route B at 90% confidence target', () => {
    // Hero Scenario inputs: starting SoC 42%, 33°C, rider+payload 95 kg (75kg + 20kg), moderate traffic
    const inputs: TripScenarioInputs = {
      vehicleId: mockVehicle.id,
      startingSoC: 42,
      ambientTempC: 33,
      payloadKg: 20,
      trafficLevel: 'moderate',
      auxLoadW: 30,
      reservePercent: 10,
      confidenceTarget: 90,
      riderHistoryTrips: 25,
    };

    const routeA: RouteCandidate = {
      id: 'route-a-direct',
      name: 'Route A — Direct (Thadagam Rd)',
      viaName: 'Via Thadagam Road',
      tagline: 'Shortest distance, stop-start city & uphill foothills',
      isDirect: true,
      totalDistanceKm: 35.2,
      elevationGainM: 320,
      estDurationMinutes: 44,
      polyline: [[11.018, 76.972], [11.099, 76.784]],
      segments: [
        { id: 'a1', distanceKm: 8, startElevationM: 410, endElevationM: 430, gradePercent: 0.25, avgSpeedKmh: 24, trafficLevel: 'heavy' },
        { id: 'a2', distanceKm: 15, startElevationM: 430, endElevationM: 520, gradePercent: 0.6, avgSpeedKmh: 42, trafficLevel: 'moderate' },
        { id: 'a3', distanceKm: 12.2, startElevationM: 520, endElevationM: 730, gradePercent: 1.7, avgSpeedKmh: 36, trafficLevel: 'free' },
      ],
    };

    const chargerGreenGrid: Charger = {
      id: 'ch-greengrid',
      name: 'GreenGrid Karamadai Hub',
      operator: 'SimulatedGrid',
      lat: 11.045,
      lng: 76.955,
      connectors: ['LECCS', 'Type 2'],
      powerKw: 25,
      status: 'available',
      statusAgeMinutes: 4, // Fresh!
      statusSource: 'OCPP Heartbeat',
      recentSuccesses: 34,
      recentFailures: 1,
      faultReportsLast24h: 0,
      occupancyFactor: 0.15,
      operatingHours: '24/7',
      accessNotes: 'Convenient wayside station',
      provenance: 'SIMULATED',
    };

    const routeB: RouteCandidate = {
      id: 'route-b-saibaba',
      name: 'Route B — Via Saibaba Colony / Mettupalayam Rd',
      viaName: 'Via Saibaba Colony / Mettupalayam Rd',
      tagline: 'Flatter profile with verified fast charging stop',
      isDirect: false,
      totalDistanceKm: 41.5,
      elevationGainM: 190,
      estDurationMinutes: 52,
      chargingStopId: 'ch-greengrid',
      chargeDurationMinutes: 12,
      targetArrivalSoCAtStop: 75,
      polyline: [[11.018, 76.972], [11.045, 76.955], [11.099, 76.784]],
      segments: [
        { id: 'b1', distanceKm: 14, startElevationM: 410, endElevationM: 440, gradePercent: 0.2, avgSpeedKmh: 40, trafficLevel: 'moderate' },
        { id: 'b2', distanceKm: 14, startElevationM: 440, endElevationM: 480, gradePercent: 0.28, avgSpeedKmh: 48, trafficLevel: 'free' },
        { id: 'b3', distanceKm: 13.5, startElevationM: 480, endElevationM: 600, gradePercent: 0.88, avgSpeedKmh: 38, trafficLevel: 'free' },
      ],
    };

    const plan = evaluateCandidateRoutes([routeA, routeB], [chargerGreenGrid], mockVehicle, inputs);

    const evaluatedA = plan.evaluatedRoutes.find((r) => r.routeId === 'route-a-direct')!;
    const evaluatedB = plan.evaluatedRoutes.find((r) => r.routeId === 'route-b-saibaba')!;

    // Route A must be rejected due to reserve breach at 42% SoC
    expect(evaluatedA.isFeasibleAtTarget).toBe(false);
    expect(evaluatedA.pFeasibleArrival).toBeLessThan(0.70); // Typically ~30-45%

    // Route B must be feasible and recommended
    expect(evaluatedB.isFeasibleAtTarget).toBe(true);
    expect(evaluatedB.pFeasibleArrival).toBeGreaterThan(0.90);
    expect(plan.recommendedRouteId).toBe('route-b-saibaba');
  });

  it('7. User onboarding pairs vehicle telematics and updates SoC accurately', () => {
    const store = useVoltSureStore.getState();

    // Initially user is null
    expect(store.user).toBeNull();

    // Login Arun Kumar with custom starting SoC
    store.loginUser(DEMO_USERS[0], {
      vehicleId: 'ref-ola-s1z-3kwh',
      licensePlate: 'TN-38-TEST-99',
      currentSoC: 45,
    });

    const updated = useVoltSureStore.getState();
    expect(updated.user?.name).toBe('Arun Kumar');
    expect(updated.telemetry.licensePlate).toBe('TN-38-TEST-99');
    expect(updated.telemetry.currentSoC).toBe(45);
    expect(updated.scenarioInputs.startingSoC).toBe(45);

    // Logout resets user to null
    updated.logoutUser();
    expect(useVoltSureStore.getState().user).toBeNull();
  });

  it('8. Destination corridors and traffic auto-sensing update routes dynamically', () => {
    const store = useVoltSureStore.getState();

    // Default destination is Anaikatti Foothills (35.2 km)
    expect(store.selectedDestinationId).toBe('dest-anaikatti');
    const anaikattiRoutes = store.getRoutes();
    expect(anaikattiRoutes[0].totalDistanceKm).toBe(35.2);

    // Switch to Marudhamalai Temple (22.4 km)
    store.setSelectedDestinationId('dest-marudhamalai');
    const updated = useVoltSureStore.getState();
    expect(updated.selectedDestinationId).toBe('dest-marudhamalai');
    const marudhamalaiRoutes = updated.getRoutes();
    expect(marudhamalaiRoutes[0].name).toContain('Marudhamalai');

    // Test traffic fluctuation simulation
    const initialTraffic = updated.scenarioInputs.trafficLevel;
    updated.simulateTrafficUpdate();
    const afterUpdate = useVoltSureStore.getState();
    expect(afterUpdate.scenarioInputs.trafficLevel).not.toBe(initialTraffic);
  });
});

