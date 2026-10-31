import { VehicleAdapter, ChargingAdapter } from './types';
import { VehicleProfile, Charger, TelemetryPoint } from '../data/types';

/**
 * PRODUCTION INTEGRATION STUB: Authorised OEM Cloud & CAN Telemetry
 * 
 * In a commercial deployment, this adapter connects to:
 * - OEM Telematics REST / WebSocket API (e.g. AWS IoT Greengrass, MQTT)
 * - Direct on-vehicle OBD-II / CAN bus datalogger (ISO 14229 UDS / SAE J1939)
 * 
 * SAFEGUARD NOTE: No live OEM partnership or reverse-engineered connection is claimed.
 * Demo runs on SimulatedVehicleAdapter.
 */
export class OEMAuthorizedVehicleAdapter implements VehicleAdapter {
  readonly id = 'adapter-oem-cloud-stub';
  readonly name = 'Authorised OEM Telematics Gateway (Stub)';
  readonly provenance = 'REAL' as const;

  constructor(private readonly apiKey?: string, private readonly endpointUrl?: string) {}

  async fetchVehicleProfile(_vehicleId: string): Promise<VehicleProfile> {
    throw new Error('OEMAuthorizedVehicleAdapter requires authenticated enterprise OEM partnership credentials.');
  }

  async fetchLatestTelemetry(_vehicleId: string): Promise<TelemetryPoint> {
    throw new Error('Direct telematics stream requires verified vehicle VIN authorization token.');
  }

  streamTelemetry(_vehicleId: string, _onUpdate: (telemetry: TelemetryPoint) => void): () => void {
    throw new Error('Telemetry WebSocket stream inactive in concept prototype.');
  }
}

/**
 * PRODUCTION INTEGRATION STUB: OCPP 1.6-J / 2.0.1 Central System Adapter
 * 
 * In a commercial deployment, this adapter connects to:
 * - Charge Point Operators (CPOs) via Open Charge Point Interface (OCPI 2.2.1)
 * - Central System Charge Point Management System (CPMS) WebSockets
 * 
 * SAFEGUARD NOTE: No commercial CPO relationship or live grid control is claimed.
 * Demo runs on SimulatedChargingAdapter.
 */
export class OCPPOpenChargeAdapter implements ChargingAdapter {
  readonly id = 'adapter-ocpp-cpo-stub';
  readonly name = 'OCPP 2.0.1 / OCPI 2.2.1 Roaming Adapter (Stub)';
  readonly provenance = 'REAL' as const;

  constructor(private readonly ocpiAuthToken?: string) {}

  async fetchNearbyChargers(_lat: number, _lng: number, _radiusKm: number): Promise<Charger[]> {
    throw new Error('OCPI live network queries require registered CPO roaming credentials.');
  }

  async fetchChargerStatus(_chargerId: string): Promise<{
    status: Charger['status'];
    statusAgeMinutes: number;
    rawPayload: Record<string, unknown>;
  }> {
    throw new Error('Live OCPP StatusNotification requires active WebSocket connection to physical station.');
  }
}

