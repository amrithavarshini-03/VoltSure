import { VehicleAdapter, ChargingAdapter } from './types';
import { VehicleProfile, Charger, TelemetryPoint } from '../data/types';
import { VEHICLE_PROFILES } from '../data/vehicles';
import { CHARGERS } from '../data/chargers';
import { SIMULATED_TELEMETRY_STREAM } from '../data/telemetry';

export class SimulatedVehicleAdapter implements VehicleAdapter {
  readonly id = 'adapter-simulated-bms';
  readonly name = 'Simulated CAN/BMS Telemetry Adapter';
  readonly provenance = 'SIMULATED' as const;

  async fetchVehicleProfile(vehicleId: string): Promise<VehicleProfile> {
    const found = VEHICLE_PROFILES.find((v) => v.id === vehicleId);
    if (!found) throw new Error(`Vehicle profile ${vehicleId} not found in simulated repository`);
    return found;
  }

  async fetchLatestTelemetry(vehicleId: string): Promise<TelemetryPoint> {
    // Return first point from stream
    return SIMULATED_TELEMETRY_STREAM[0];
  }

  streamTelemetry(vehicleId: string, onUpdate: (telemetry: TelemetryPoint) => void): () => void {
    let index = 0;
    const interval = setInterval(() => {
      onUpdate(SIMULATED_TELEMETRY_STREAM[index % SIMULATED_TELEMETRY_STREAM.length]);
      index++;
    }, 2000);

    return () => clearInterval(interval);
  }
}

export class SimulatedChargingAdapter implements ChargingAdapter {
  readonly id = 'adapter-simulated-ocpp';
  readonly name = 'Simulated OCPP 2.0.1 Charging Network Adapter';
  readonly provenance = 'SIMULATED' as const;

  async fetchNearbyChargers(_lat: number, _lng: number, _radiusKm: number): Promise<Charger[]> {
    return CHARGERS;
  }

  async fetchChargerStatus(chargerId: string): Promise<{
    status: Charger['status'];
    statusAgeMinutes: number;
    rawPayload: Record<string, unknown>;
  }> {
    const charger = CHARGERS.find((c) => c.id === chargerId);
    if (!charger) throw new Error(`Charger ${chargerId} not found`);
    return {
      status: charger.status,
      statusAgeMinutes: charger.statusAgeMinutes,
      rawPayload: {
        chargerId: charger.id,
        operator: charger.operator,
        connectors: charger.connectors,
        powerKw: charger.powerKw,
        source: 'Simulated OCPP StatusNotification.req',
      },
    };
  }
}

