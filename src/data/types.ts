/**
 * Core type schemas for VoltSure AI mobility intelligence platform.
 * Aligned with Appendix A: Trip, Route Segment, Battery Telemetry, Charger, Decision.
 */

export type DataProvenance = 'REAL' | 'PUBLIC' | 'SIMULATED';

export interface VehicleProfile {
  id: string;
  name: string;
  variant: string;
  claimedCapacityKWh: number;
  claimedRangeKm: number;
  nominalVoltageV: number;
  massKg: number;           // Curb weight of vehicle
  cr: number;               // Rolling resistance coefficient (~0.012 - 0.018)
  cda: number;              // Drag area m^2 (~0.35 - 0.55 for scooter)
  drivetrainEfficiency: number; // ~0.88
  regenEfficiency: number;      // ~0.60
  auxPowerW: number;        // Base accessory / lighting load
  compatibleConnectors: string[];
  provenance: DataProvenance;
  notes: string;
}

export interface RouteSegment {
  id: string;
  distanceKm: number;
  startElevationM: number;
  endElevationM: number;
  gradePercent: number;    // tan(theta) * 100
  avgSpeedKmh: number;
  trafficLevel: 'free' | 'moderate' | 'heavy';
}

export interface RouteCandidate {
  id: string;
  name: string;
  viaName: string;
  tagline: string;
  isDirect: boolean;
  totalDistanceKm: number;
  elevationGainM: number;
  estDurationMinutes: number;
  segments: RouteSegment[];
  polyline: [number, number][]; // [lat, lng] array
  chargingStopId?: string;      // ID of charger if route includes a stop
  fallbackStopId?: string;      // Fallback charger ID
  chargeDurationMinutes?: number;
  targetArrivalSoCAtStop?: number; // Target SoC after charge
}

export interface Charger {
  id: string;
  name: string;
  operator: string;
  lat: number;
  lng: number;
  connectors: string[]; // e.g. ['LECCS', 'Type 2', 'CCS2', 'Swap-Pack']
  powerKw: number;
  status: 'available' | 'occupied' | 'fault' | 'unknown';
  statusAgeMinutes: number; // e.g. 4m, 220m
  statusSource: string;     // e.g. 'OCPP Heartbeat', 'User check-in', 'Simulator'
  recentSuccesses: number;
  recentFailures: number;
  faultReportsLast24h: number;
  occupancyFactor: number;  // 0.0 (empty) to 1.0 (long queue)
  operatingHours: string;
  accessNotes: string;
  provenance: DataProvenance;
}

export interface TripScenarioInputs {
  vehicleId: string;
  startingSoC: number;        // 10 - 100%
  ambientTempC: number;       // 15 - 45°C
  payloadKg: number;          // 0 - 150 kg (rider is +75kg by default)
  trafficLevel: 'free' | 'moderate' | 'heavy';
  auxLoadW: number;           // 10 - 100W
  reservePercent: number;     // 5 - 25% (default 10%)
  confidenceTarget: 80 | 90 | 95; // %
  riderHistoryTrips: 3 | 25 | 120; // Calibration confidence level
}

export interface SegmentEnergyOutput {
  segmentId: string;
  distanceKm: number;
  gradePercent: number;
  avgSpeedKmh: number;
  powerW: number;
  energyWh: number;
  whPerKm: number;
  isRegen: boolean;
}

export interface ChargerTrustScoreResult {
  chargerId: string;
  isCompatible: boolean;
  incompatibleReason?: string;
  freshnessWeight: number; // w_fresh = exp(-age / tau)
  historicalPUsable: number;
  statusPUsable: number;
  arrivalOccupancyPenalty: number;
  faultPenalty: number;
  pUsable: number;          // Expected probability [0, 1]
  trustScore: number;       // 0 - 100
  uncertaintyWidth: number; // Lower to upper 90% bounds
  evidenceSummary: string;
}

export interface RoutePredictionResult {
  routeId: string;
  routeName: string;
  totalDistanceKm: number;
  durationMinutes: number;
  p10EnergyWh: number;
  p50EnergyWh: number;
  p90EnergyWh: number;
  usableEnergyWh: number;
  protectedReserveWh: number;
  availableAboveReserveWh: number; // usableEnergyWh - protectedReserveWh - p50EnergyWh
  pFeasibleArrival: number;        // Probability of arriving with reserve intact [0, 1]
  p10ArrivalSoC: number;
  p50ArrivalSoC: number;
  p90ArrivalSoC: number;
  reserveViolationsCount: number;  // Out of 2,000 Monte Carlo runs
  totalSimulations: number;        // 2,000
  isFeasibleAtTarget: boolean;     // pFeasibleArrival >= confidenceTarget
  rejectionReason?: string;
  segmentBreakdown: SegmentEnergyOutput[];
  chargingStop?: {
    charger: Charger;
    trustScore: ChargerTrustScoreResult;
    energyToStopWh: number;
    socAtArrivalAtStop: number;
    energyAfterStopWh: number;
    chargeAddedKWh: number;
    fallbackCharger?: Charger;
    fallbackTrustScore?: ChargerTrustScoreResult;
  };
  whyThisRoute: string[];
  whyNotRoute: string[];
}

export interface FleetVehicle {
  id: string;
  licensePlate: string;
  model: string;
  batteryCapacityKWh: number;
  currentSoC: number;
  currentSoH: number; // State of Health 0-100%
  assignedTrip: {
    tripId: string;
    destinationName: string;
    distanceKm: number;
    elevationGainM: number;
    urgency: 'high' | 'normal' | 'low';
  };
  suitability: 'GO' | 'GO_WITH_STOP' | 'DO_NOT_DISPATCH';
  arrivalProbability: number;
  estimatedArrivalSoC: number;
  riskTags: string[];
  chargerDependency?: string;
  provenance: DataProvenance;
}

export interface BatteryPack {
  id: string;
  slotNumber: number;
  packModel: string;
  compatibleVehicles: string[];
  socPercent: number;
  voltageV: number;
  internalTempC: number;
  cycleCount: number;
  sohEstimate: number | null; // Nullable to show realistic telemetry gaps!
  sohConfidence: 'HIGH' | 'ESTIMATED' | 'UNAVAILABLE';
  suitabilityScore: number;   // 0 - 100
  isRecommended: boolean;
  notes: string;
  provenance: DataProvenance;
}

export interface TelemetryPoint {
  timeOffsetSeconds: number; // 0 to 2400 (40 mins)
  distanceCompletedKm: number;
  speedKmh: number;
  currentGradePercent: number;
  currentSoC: number;
  packVoltageV: number;
  packCurrentA: number;
  batteryTempC: number;
  ambientTempC: number;
  instantaneousPowerW: number;
}

