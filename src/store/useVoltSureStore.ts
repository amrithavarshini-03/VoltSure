import { create } from 'zustand';
import {
  TripScenarioInputs,
  VehicleProfile,
  Charger,
  RouteCandidate,
  RoutePredictionResult,
} from '../data/types';
import { VEHICLE_PROFILES } from '../data/vehicles';
import { CHARGERS } from '../data/chargers';
import { HERO_ROUTES } from '../data/routes';
import { DESTINATION_CORRIDORS, ORIGIN_HUBS } from '../data/corridors';
import { buildDynamicRoutesForLocations, LocationGeoData } from '../engine/customRoute';
import { evaluateCandidateRoutes } from '../engine/planner';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar: string;
  role: string;
  defaultVehicleId: string;
}

export interface ConnectedVehicleTelemetry {
  vehicleId: string;
  vin: string;
  licensePlate: string;
  currentSoC: number;
  currentSoH: number;
  packTempC: number;
  packVoltageV: number;
  odometerKm: number;
  lastSynced: string;
  connectionType: 'Cloud Telematics' | 'Bluetooth BLE' | 'Simulated Adapter';
  isConnected: boolean;
  isSyncing: boolean;
}

export interface DriveSimulationState {
  isActive: boolean;
  currentKm: number;
  speedKmh: number;
  currentSoC: number;
  etaMinutes: number;
  nextStep: string;
  isRerouted: boolean;
  rerouteReason?: string;
}

export interface EventLogEntry {
  id: string;
  timestamp: string;
  title: string;
  description: string;
  impact: string;
}

interface VoltSureState {
  // Authentication & Vehicle Pairing
  user: UserProfile | null;
  telemetry: ConnectedVehicleTelemetry;
  loginUser: (profile: UserProfile, customTelemetry?: Partial<ConnectedVehicleTelemetry>) => void;
  logoutUser: () => void;
  syncVehicleTelemetry: (vehicleId: string) => Promise<void>;

  // Global Modes
  truthMode: boolean;
  setTruthMode: (enabled: boolean) => void;
  toggleTruthMode: () => void;

  // Judge Mode
  judgeMode: {
    active: boolean;
    currentStepIndex: number;
    isPlaying: boolean;
  };
  startJudgeMode: () => void;
  stopJudgeMode: () => void;
  setJudgeStep: (stepIndex: number) => void;
  toggleJudgePlay: () => void;

  // Replan Lab compatibility
  replanActiveEvent: 'none' | 'charger_failed' | 'traffic_worsened' | 'temp_spike' | 'payload_increased' | 'soc_drop';
  replanTelemetryOffset: number;
  replanEventLog: EventLogEntry[];
  triggerReplanEvent: (event: 'charger_failed' | 'traffic_worsened' | 'temp_spike' | 'payload_increased' | 'soc_drop') => void;
  resetReplanScenario: () => void;
  setReplanTelemetryOffset: (offset: number) => void;

  // Modals & Overlays
  commandPaletteOpen: boolean;
  setCommandPaletteOpen: (open: boolean) => void;
  proofCertificateOpen: boolean;
  setProofCertificateOpen: (open: boolean) => void;

  // Scenario Inputs
  scenarioInputs: TripScenarioInputs;
  setScenarioInputs: (updates: Partial<TripScenarioInputs>) => void;
  resetScenarioDefaults: () => void;

  // Selected Route & Corridor
  selectedOriginId: string;
  selectedDestinationId: string;
  customOriginText: string;
  customDestinationText: string;
  setCustomLocations: (origin: string, destination: string) => void;
  getCustomGeoDetails: () => {
    originGeo: LocationGeoData;
    destinationGeo: LocationGeoData;
  };
  setSelectedOriginId: (id: string) => void;
  setSelectedDestinationId: (id: string) => void;
  selectedRouteId: string;
  setSelectedRouteId: (id: string) => void;

  // Live Traffic Auto-Sensing
  trafficAutoSense: boolean;
  setTrafficAutoSense: (enabled: boolean) => void;
  sensedTrafficIncident: string | null;
  simulateTrafficUpdate: () => void;

  // Charger age slider overrides (chargerId -> minutes)
  chargerAgeOverrides: Record<string, number>;
  setChargerAgeOverride: (chargerId: string, ageMinutes: number) => void;
  resetChargerAgeOverrides: () => void;

  // Drive Simulation State
  driveState: DriveSimulationState;
  startDriveSimulation: () => void;
  stopDriveSimulation: () => void;
  triggerDriveDisruption: () => void;
  advanceDriveStep: (kmDelta: number) => void;

  // Selectors
  getVehicle: () => VehicleProfile;
  getRoutes: () => RouteCandidate[];
  getChargers: () => Charger[];
  getRoutePlan: () => {
    evaluatedRoutes: RoutePredictionResult[];
    recommendedRouteId: string | null;
    overallFeasible: boolean;
    unmetTargetExplanation?: string;
  };
}

export const DEMO_USERS: UserProfile[] = [
  {
    id: 'user-arun',
    name: 'Arun Kumar',
    email: 'arun.k@voltsure.demo',
    phone: '+91 98401 23456',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
    role: 'Personal EV Commuter',
    defaultVehicleId: 'ref-ola-s1z-3kwh',
  },
  {
    id: 'user-priya',
    name: 'Priya Sundaram',
    email: 'priya.s@logistics.demo',
    phone: '+91 98402 78901',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=120&auto=format&fit=crop&q=80',
    role: 'Urban Delivery Rider',
    defaultVehicleId: 'fleet-escooter-2kwh',
  },
  {
    id: 'user-rohan',
    name: 'Rohan Mehta',
    email: 'rohan.m@greenhaul.demo',
    phone: '+91 98403 45678',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80',
    role: 'Commercial Cargo Fleet Operator',
    defaultVehicleId: 'fleet-e3w-cargo',
  },
];

const DEFAULT_INPUTS: TripScenarioInputs = {
  vehicleId: 'ref-ola-s1z-3kwh',
  startingSoC: 42,
  ambientTempC: 33,
  payloadKg: 20, // Rider is 75kg by default, total = 95kg
  trafficLevel: 'moderate',
  auxLoadW: 25,
  reservePercent: 10,
  confidenceTarget: 90,
  riderHistoryTrips: 25,
};

export const useVoltSureStore = create<VoltSureState>((set, get) => ({
  // Default not logged in so minimal vehicle setup / login screen is presented after splash
  user: null,
  telemetry: {
    vehicleId: 'ref-ola-s1z-3kwh',
    vin: 'MA6EV3Z2026TN0421',
    licensePlate: 'TN-38-BZ-4102',
    currentSoC: 42,
    currentSoH: 96,
    packTempC: 32.4,
    packVoltageV: 51.2,
    odometerKm: 3420,
    lastSynced: 'Just now (Live Cloud Telematics)',
    connectionType: 'Cloud Telematics',
    isConnected: false,
    isSyncing: false,
  },

  loginUser: (profile, customTelemetry) => {
    const vehId = customTelemetry?.vehicleId || profile.defaultVehicleId;
    const soc =
      customTelemetry?.currentSoC ??
      (vehId.includes('cargo') ? 35 : vehId.includes('escooter') ? 58 : 42);
    const plate =
      customTelemetry?.licensePlate ||
      (vehId.includes('cargo')
        ? 'TN-38-CG-9011'
        : vehId.includes('escooter')
        ? 'TN-38-EF-5520'
        : 'TN-38-BZ-4102');

    set((state) => ({
      user: profile,
      scenarioInputs: {
        ...state.scenarioInputs,
        vehicleId: vehId,
        startingSoC: soc,
      },
      telemetry: {
        ...state.telemetry,
        vehicleId: vehId,
        licensePlate: plate,
        currentSoC: soc,
        isConnected: true,
        lastSynced: 'Just now (Live Cloud Telematics)',
        ...customTelemetry,
      },
    }));
  },

  logoutUser: () => set({ user: null, telemetry: { ...get().telemetry, isConnected: false } }),

  syncVehicleTelemetry: async (vehicleId) => {
    set((state) => ({ telemetry: { ...state.telemetry, isSyncing: true } }));
    // Simulate real cloud handshake latency (800ms)
    await new Promise((resolve) => setTimeout(resolve, 800));

    const veh = VEHICLE_PROFILES.find((v) => v.id === vehicleId) || VEHICLE_PROFILES[0];
    const initialSoC = vehicleId.includes('cargo') ? 35 : vehicleId.includes('escooter') ? 58 : 42;

    set((state) => ({
      scenarioInputs: {
        ...state.scenarioInputs,
        vehicleId: veh.id,
        startingSoC: initialSoC,
      },
      telemetry: {
        ...state.telemetry,
        vehicleId: veh.id,
        currentSoC: initialSoC,
        currentSoH: 96,
        packTempC: 32.2,
        lastSynced: 'Just now (Synced via BMS Telemetry)',
        isConnected: true,
        isSyncing: false,
      },
    }));
  },

  truthMode: false,
  setTruthMode: (enabled) => set({ truthMode: enabled }),
  toggleTruthMode: () => set((state) => ({ truthMode: !state.truthMode })),

  // Judge Mode
  judgeMode: {
    active: false,
    currentStepIndex: 0,
    isPlaying: false,
  },
  startJudgeMode: () =>
    set({
      judgeMode: { active: true, currentStepIndex: 0, isPlaying: true },
    }),
  stopJudgeMode: () =>
    set({
      judgeMode: { active: false, currentStepIndex: 0, isPlaying: false },
    }),
  setJudgeStep: (stepIndex) =>
    set((state) => ({
      judgeMode: { ...state.judgeMode, currentStepIndex: stepIndex },
    })),
  toggleJudgePlay: () =>
    set((state) => ({
      judgeMode: { ...state.judgeMode, isPlaying: !state.judgeMode.isPlaying },
    })),

  // Replan Lab
  replanActiveEvent: 'none',
  replanTelemetryOffset: 960,
  replanEventLog: [
    {
      id: 'log-0',
      timestamp: '14:20:00',
      title: 'Mission Dispatched',
      description: 'Trip planned via Route B with verified GreenGrid Karamadai stop.',
      impact: 'Initial Feasibility: 94% (Target: 90%)',
    },
  ],
  triggerReplanEvent: (event) => {
    const timestamp = new Date().toLocaleTimeString('en-US', { hour12: false });
    const newLog: EventLogEntry = {
      id: `log-${Date.now()}`,
      timestamp,
      title: event === 'charger_failed' ? 'Primary Charger Offline' : 'Disruption Event',
      description: 'Simulated telemetry anomaly detected by in-flight engine.',
      impact: 'Rerouted to designated fallback station.',
    };

    set((state) => ({
      replanActiveEvent: event,
      replanEventLog: [newLog, ...state.replanEventLog],
    }));
  },
  resetReplanScenario: () =>
    set({
      replanActiveEvent: 'none',
      replanTelemetryOffset: 0,
    }),
  setReplanTelemetryOffset: (offset) => set({ replanTelemetryOffset: offset }),

  commandPaletteOpen: false,
  setCommandPaletteOpen: (open) => set({ commandPaletteOpen: open }),
  proofCertificateOpen: false,
  setProofCertificateOpen: (open) => set({ proofCertificateOpen: open }),

  scenarioInputs: DEFAULT_INPUTS,
  setScenarioInputs: (updates) =>
    set((state) => ({
      scenarioInputs: { ...state.scenarioInputs, ...updates },
      telemetry: {
        ...state.telemetry,
        currentSoC: updates.startingSoC !== undefined ? updates.startingSoC : state.telemetry.currentSoC,
      },
    })),
  resetScenarioDefaults: () =>
    set({
      scenarioInputs: DEFAULT_INPUTS,
      chargerAgeOverrides: {},
    }),

  selectedOriginId: 'origin-gandhipuram',
  selectedDestinationId: 'dest-anaikatti',
  customOriginText: 'Gandhipuram Transit Center, Coimbatore',
  customDestinationText: 'Anaikatti Foothills (Western Ghats)',
  setSelectedOriginId: (id) => {
    const orig = ORIGIN_HUBS.find((o) => o.id === id);
    set({
      selectedOriginId: id,
      customOriginText: orig?.name || 'Gandhipuram Transit Center, Coimbatore',
    });
  },
  setSelectedDestinationId: (id) => {
    const dest = DESTINATION_CORRIDORS.find((d) => d.id === id);
    const routes = dest?.routes || HERO_ROUTES;
    const defaultRouteId = routes[0]?.id || 'route-a-direct';
    set({
      selectedDestinationId: id,
      selectedRouteId: defaultRouteId,
      customDestinationText: dest?.name || 'Anaikatti Foothills (Western Ghats)',
    });
  },
  setCustomLocations: (origin, destination) => {
    const dynamic = buildDynamicRoutesForLocations(origin, destination, get().scenarioInputs.trafficLevel);
    set({
      customOriginText: origin,
      customDestinationText: destination,
      selectedRouteId: dynamic.routes[0].id,
    });
  },
  getCustomGeoDetails: () => {
    const { customOriginText, customDestinationText } = get();
    const dynamic = buildDynamicRoutesForLocations(customOriginText, customDestinationText);
    return {
      originGeo: dynamic.originGeo,
      destinationGeo: dynamic.destinationGeo,
    };
  },

  selectedRouteId: 'route-b-saibaba',
  setSelectedRouteId: (id) => set({ selectedRouteId: id }),

  // Live Traffic Auto-Sensing
  trafficAutoSense: true,
  setTrafficAutoSense: (enabled) => set({ trafficAutoSense: enabled }),
  sensedTrafficIncident: 'Peak Hour Choke at Thadagam Junction (21 km/h sensed)',
  simulateTrafficUpdate: () => {
    const incidents = [
      { level: 'heavy' as const, note: 'Heavy Congestion: Bottleneck at Urban Arterial (21 km/h avg speed)' },
      { level: 'moderate' as const, note: 'Congestion Easing: Arterial flow recovering to 38 km/h' },
      { level: 'free' as const, note: 'Free Flow: Ring bypass clear, speeds up to 54 km/h' },
    ];
    set((state) => {
      const currentIndex = incidents.findIndex((i) => i.level === state.scenarioInputs.trafficLevel);
      const nextIndex = (currentIndex + 1) % incidents.length;
      const next = incidents[nextIndex];
      return {
        scenarioInputs: { ...state.scenarioInputs, trafficLevel: next.level },
        sensedTrafficIncident: next.note,
      };
    });
  },

  chargerAgeOverrides: {},
  setChargerAgeOverride: (chargerId, ageMinutes) =>
    set((state) => ({
      chargerAgeOverrides: { ...state.chargerAgeOverrides, [chargerId]: ageMinutes },
    })),
  resetChargerAgeOverrides: () => set({ chargerAgeOverrides: {} }),

  // In-Drive Simulation
  driveState: {
    isActive: false,
    currentKm: 0,
    speedKmh: 42,
    currentSoC: 42,
    etaMinutes: 48,
    nextStep: 'Continue on Mettupalayam Rd for 12.8 km towards GreenGrid Hub',
    isRerouted: false,
  },

  startDriveSimulation: () => {
    set({
      driveState: {
        isActive: true,
        currentKm: 2.4,
        speedKmh: 44,
        currentSoC: 41.5,
        etaMinutes: 46,
        nextStep: 'Head north on Mettupalayam Rd towards GreenGrid Karamadai Hub (12.4 km)',
        isRerouted: false,
      },
    });
  },

  stopDriveSimulation: () => {
    set((state) => ({
      driveState: { ...state.driveState, isActive: false },
    }));
  },

  triggerDriveDisruption: () => {
    set((state) => ({
      driveState: {
        ...state.driveState,
        isRerouted: true,
        rerouteReason: 'Primary GreenGrid Karamadai Hub reported communication loss (Fault 0x4B)',
        nextStep: 'Dynamic Replan: Divert via Kavundampalayam Energy Station (+4 min detour, reserve protected)',
      },
      chargerAgeOverrides: {
        ...state.chargerAgeOverrides,
        'ch-greengrid': 240, // Mark stale/failed
      },
    }));
  },

  advanceDriveStep: (kmDelta) => {
    set((state) => {
      const newKm = Math.min(state.driveState.currentKm + kmDelta, 41.5);
      const drainSoC = Math.max(state.driveState.currentSoC - 0.7 * kmDelta, 18);
      const remainingEta = Math.max(state.driveState.etaMinutes - Math.round(kmDelta * 1.4), 2);
      return {
        driveState: {
          ...state.driveState,
          currentKm: Math.round(newKm * 10) / 10,
          currentSoC: Math.round(drainSoC * 10) / 10,
          etaMinutes: remainingEta,
        },
      };
    });
  },

  getVehicle: () => {
    const { scenarioInputs } = get();
    return (
      VEHICLE_PROFILES.find((v) => v.id === scenarioInputs.vehicleId) ||
      VEHICLE_PROFILES[0]
    );
  },
  getRoutes: () => {
    const { customOriginText, customDestinationText, scenarioInputs, selectedDestinationId } = get();
    if (customOriginText && customDestinationText) {
      const isHeroDefault =
        customOriginText.includes('Gandhipuram') &&
        customDestinationText.includes('Anaikatti');
      if (isHeroDefault) {
        return HERO_ROUTES;
      }
      const dynamic = buildDynamicRoutesForLocations(
        customOriginText,
        customDestinationText,
        scenarioInputs.trafficLevel
      );
      return dynamic.routes;
    }
    const corridor = DESTINATION_CORRIDORS.find((d) => d.id === selectedDestinationId);
    return corridor ? corridor.routes : HERO_ROUTES;
  },
  getChargers: () => {
    const { driveState, replanActiveEvent } = get();
    if (driveState.isRerouted || replanActiveEvent === 'charger_failed') {
      return CHARGERS.map((c) =>
        c.id === 'ch-greengrid'
          ? { ...c, status: 'fault' as const, statusSource: 'OCPP Fault Notification', statusAgeMinutes: 1 }
          : c
      );
    }
    return CHARGERS;
  },
  getRoutePlan: () => {
    const state = get();
    const vehicle = state.getVehicle();
    const chargers = state.getChargers();
    const routes = state.getRoutes();

    return evaluateCandidateRoutes(
      routes,
      chargers,
      vehicle,
      state.scenarioInputs,
      state.chargerAgeOverrides
    );
  },
}));
