# VoltSure AI — Data Schema & Provenance Specification

Every data object in VoltSure AI adheres to strict data typing and carries an explicit `provenance` badge (`REAL`, `PUBLIC`, or `SIMULATED`).

---

## 1. Data Schemas

### 1.1 VehicleProfile
```typescript
interface VehicleProfile {
  id: string;
  name: string;
  variant: string;
  claimedCapacityKWh: number;
  claimedRangeKm: number;
  nominalVoltageV: number;
  massKg: number;
  cr: number;                  // Coefficient of rolling resistance
  cda: number;                 // Drag area (m^2)
  drivetrainEfficiency: number;
  regenEfficiency: number;
  auxPowerW: number;
  compatibleConnectors: string[];
  provenance: 'REAL' | 'PUBLIC' | 'SIMULATED';
  notes: string;
}
```

### 1.2 RouteSegment
```typescript
interface RouteSegment {
  id: string;
  distanceKm: number;
  startElevationM: number;
  endElevationM: number;
  gradePercent: number;        // tan(theta) * 100
  avgSpeedKmh: number;
  trafficLevel: 'free' | 'moderate' | 'heavy';
}
```

### 1.3 Charger
```typescript
interface Charger {
  id: string;
  name: string;
  operator: string;
  lat: number;
  lng: number;
  connectors: string[];        // ['LECCS', 'Type 2', 'CCS2', 'Swap-Pack']
  powerKw: number;
  status: 'available' | 'occupied' | 'fault' | 'unknown';
  statusAgeMinutes: number;    // Heartbeat latency
  statusSource: string;
  recentSuccesses: number;
  recentFailures: number;
  faultReportsLast24h: number;
  occupancyFactor: number;     // 0.0 to 1.0
  operatingHours: string;
  accessNotes: string;
  provenance: 'REAL' | 'PUBLIC' | 'SIMULATED';
}
```

### 1.4 RoutePredictionResult
```typescript
interface RoutePredictionResult {
  routeId: string;
  routeName: string;
  totalDistanceKm: number;
  durationMinutes: number;
  p10EnergyWh: number;
  p50EnergyWh: number;
  p90EnergyWh: number;
  usableEnergyWh: number;
  protectedReserveWh: number;
  availableAboveReserveWh: number;
  pFeasibleArrival: number;
  p10ArrivalSoC: number;
  p50ArrivalSoC: number;
  p90ArrivalSoC: number;
  reserveViolationsCount: number;
  totalSimulations: number;
  isFeasibleAtTarget: boolean;
  rejectionReason?: string;
}
```

---

## 2. Provenance Inventory Table

| Dataset | Provenance | Source & Derivation | Safeguard Note |
|---|---|---|---|
| Reference Ola S1 Z (3.1 kWh) | `REAL` | User-supplied reference OEM claimed brochure values | Claimed figures; not independently validated |
| Reference Ola S1 Z (5.1 kWh) | `REAL` | User-supplied reference OEM claimed brochure values | Claimed figures; not independently validated |
| Coimbatore Road Polylines | `PUBLIC` | Approximate geospatial coordinates around Gandhipuram & Thadagam Rd | Stylized elevation and distance profiles |
| Charger Station Records | `SIMULATED` | Synthetic CPO telemetry with randomized heartbeat latencies | Labelled simulator; no commercial CPO access |
| In-Flight BMS Telemetry | `SIMULATED` | 40-minute synthetic CAN/BMS stream (voltage, current, cell temp) | Realistic signal noise and hill descent regen |
| 120-Trip Evaluation Split | `SIMULATED` | Deterministic synthetic benchmark with complete-trip split | Distinct from scenario lab demonstrations |

