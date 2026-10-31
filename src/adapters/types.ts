import { VehicleProfile, Charger, TelemetryPoint, DataProvenance } from '../data/types';

export interface VehicleAdapter {
  readonly id: string;
  readonly name: string;
  readonly provenance: DataProvenance;
  fetchVehicleProfile(vehicleId: string): Promise<VehicleProfile>;
  fetchLatestTelemetry(vehicleId: string): Promise<TelemetryPoint>;
  streamTelemetry(vehicleId: string, onUpdate: (telemetry: TelemetryPoint) => void): () => void;
}

export interface ChargingAdapter {
  readonly id: string;
  readonly name: string;
  readonly provenance: DataProvenance;
  fetchNearbyChargers(lat: number, lng: number, radiusKm: number): Promise<Charger[]>;
  fetchChargerStatus(chargerId: string): Promise<{
    status: Charger['status'];
    statusAgeMinutes: number;
    rawPayload: Record<string, unknown>;
  }>;
}

