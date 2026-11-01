import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useVoltSureStore } from '../store/useVoltSureStore';
import { BoltIcon } from '../components/common/BoltIcon';
import { ProvenanceChip } from '../components/common/ProvenanceChip';
import { AuthModal } from '../components/modals/AuthModal';
import { RouteMap } from '../components/map/RouteMap';
import { ORIGIN_HUBS, DESTINATION_CORRIDORS } from '../data/corridors';
import { KNOWN_LOCATIONS } from '../engine/customRoute';
import {
  Car,
  Zap,
  Gauge,
  Thermometer,
  ShieldCheck,
  ArrowRight,
  Sparkles,
  MapPin,
  RotateCw,
  Weight,
  Radio,
  Clock,
  CheckCircle2,
  AlertTriangle,
  LogIn,
  User,
  Wind,
  BatteryCharging,
  Activity,
  Layers,
  ChevronRight,
  TrendingDown,
  Navigation,
  Search,
  Check,
} from 'lucide-react';

export const DashboardPlanner: React.FC = () => {
  const {
    user,
    telemetry,
    getVehicle,
    getRoutes,
    getChargers,
    getRoutePlan,
    scenarioInputs,
    setScenarioInputs,
    selectedRouteId,
    setSelectedRouteId,
    customOriginText,
    customDestinationText,
    setCustomLocations,
    getCustomGeoDetails,
    trafficAutoSense,
    setTrafficAutoSense,
    sensedTrafficIncident,
    simulateTrafficUpdate,
    setProofCertificateOpen,
  } = useVoltSureStore();
  const navigate = useNavigate();

  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [typedOrigin, setTypedOrigin] = useState(customOriginText);
  const [typedDestination, setTypedDestination] = useState(customDestinationText);

  // Sync inputs if store changes externally
  useEffect(() => {
    setTypedOrigin(customOriginText);
  }, [customOriginText]);

  useEffect(() => {
    setTypedDestination(customDestinationText);
  }, [customDestinationText]);

  const vehicle = getVehicle();
  const routes = getRoutes();
  const chargers = getChargers();
  const { evaluatedRoutes, recommendedRouteId } = getRoutePlan();
  const { originGeo, destinationGeo } = getCustomGeoDetails();

  const activeRoute = routes.find((r) => r.id === selectedRouteId) || routes[0];
  const activePred = evaluatedRoutes.find((r) => r.routeId === selectedRouteId) || evaluatedRoutes[0];
  const recommendedRoute = evaluatedRoutes.find((r) => r.routeId === recommendedRouteId) || evaluatedRoutes[0];
  const directRoute = evaluatedRoutes.find((r) => r.routeId.includes('direct')) || evaluatedRoutes[0];

  const naiveRangeKm = Math.round((scenarioInputs.startingSoC / 100) * vehicle.claimedRangeKm);

  // Dynamic physics metrics: Harvested Regen Wh & Aero Headwind Wh
  const regenWhHarvested = Math.round(
    activeRoute.elevationGainM > 150
      ? 118 * (vehicle.massKg / 122)
      : activeRoute.elevationGainM < 0
      ? 185 * (vehicle.massKg / 122)
      : 84 * (vehicle.massKg / 122)
  );

  const headwindAeroDragWh = Math.round(
    activeRoute.totalDistanceKm * 1.35 * (vehicle.cda / 0.42)
  );

  const handleApplyLocations = (newOrigin?: string, newDest?: string) => {
    const o = (newOrigin !== undefined ? newOrigin : typedOrigin).trim();
    const d = (newDest !== undefined ? newDest : typedDestination).trim();
    if (!o || !d) return;
    setCustomLocations(o, d);
  };

  const handleProveJourney = (routeId?: string) => {
    if (routeId) {
      setSelectedRouteId(routeId);
    } else if (recommendedRouteId) {
      setSelectedRouteId(recommendedRouteId);
    }
    navigate('/proof');
  };

  // Quick suggestions for one-click fill
  const originSuggestions = [
    'Gandhipuram Transit Center, Coimbatore',
    'Coimbatore Central Railway Junction',
    'Peelamedu IT Corridor / TIDEL Park',
    'Ukkadam Bus Stand & Lake',
    'Singanallur Bus Terminal',
    'RS Puram Commercial Plaza',
  ];

  const destinationSuggestions = [
    'Anaikatti Foothills (Western Ghats)',
    'Marudhamalai Temple Hill Ascent',
    'Pollachi Highway Junction',
    'Siruvani Foothills Eco-Trail',
    'Ooty (Udhagamandalam) Nilgiri Hill Station',
    'Coimbatore International Airport (CJB)',
    'Coonoor Tea Estate Foothills',
    'Isha Yoga Center (Velliangiri Foothills)',
  ];

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Auth & Vehicle Connection Modal */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
      />

      {/* 1. Connected EV Telematics Card OR Sign In Banner */}
      {user ? (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-slate-200 shadow-card relative overflow-hidden bg-telemetry-grid">
          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            {/* Vehicle Identity & Sync State */}
            <div className="flex items-start gap-4">
              <div className="relative">
                <img
                  src={user.avatar}
                  alt="Driver Profile"
                  className="w-16 h-16 rounded-2xl object-cover border-2 border-slate-300 shadow-sm"
                />
                <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 border-2 border-white flex items-center justify-center text-[10px] text-white">
                  ✓
                </span>
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-mono font-bold">
                    <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
                    {telemetry.connectionType} Active
                  </span>
                  <span className="text-xs font-mono text-slate-400">
                    VIN: {telemetry.vin}
                  </span>
                </div>

                <h2 className="text-2xl font-extrabold font-heading text-slate-900 tracking-tight">
                  {vehicle.name}
                </h2>

                <p className="text-xs text-slate-500 font-sans">
                  Driver: <strong>{user.name}</strong> • Plate: <strong className="font-mono text-slate-800">{telemetry.licensePlate}</strong> • {telemetry.lastSynced}
                </p>
              </div>
            </div>

            {/* Switch Vehicle / Link Profile Action */}
            <button
              onClick={() => setAuthModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-100 text-xs font-mono font-bold text-slate-800 shadow-xs transition hover:scale-105"
            >
              <Radio className="w-4 h-4 text-lime-600 animate-pulse" />
              <span>Switch EV / Sign Out</span>
            </button>
          </div>

          {/* Live Telematics Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-6 border-t border-slate-100 font-mono">
            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80">
              <span className="text-[10px] text-slate-500 uppercase block">Live Battery (BMS)</span>
              <div className="flex items-baseline gap-1 mt-0.5">
                <span className="text-2xl font-extrabold text-lime-700">{scenarioInputs.startingSoC}%</span>
                <span className="text-xs text-slate-400">SoC</span>
              </div>
              <div className="w-full h-1.5 bg-slate-200 rounded-full mt-1.5 overflow-hidden">
                <div
                  className="h-full bg-lime-500"
                  style={{ width: `${scenarioInputs.startingSoC}%` }}
                />
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80">
              <span className="text-[10px] text-slate-500 uppercase block">Battery Health (SoH)</span>
              <div className="flex items-baseline gap-1 mt-0.5">
                <span className="text-2xl font-extrabold text-slate-900">{telemetry.currentSoH}%</span>
                <span className="text-xs text-slate-400">Health</span>
              </div>
              <span className="text-[10px] text-emerald-600 block mt-1">Optimal Pack Cell Temp</span>
            </div>

            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80">
              <span className="text-[10px] text-slate-500 uppercase block">Pack Temperature</span>
              <div className="flex items-baseline gap-1 mt-0.5">
                <span className="text-2xl font-extrabold text-amber-700">{telemetry.packTempC}°C</span>
                <span className="text-xs text-slate-400">Cell</span>
              </div>
              <span className="text-[10px] text-slate-500 block mt-1">Ambient: {scenarioInputs.ambientTempC}°C</span>
            </div>

            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80">
              <span className="text-[10px] text-slate-500 uppercase block">Protected Reserve</span>
              <div className="flex items-baseline gap-1 mt-0.5">
                <span className="text-2xl font-extrabold text-slate-900">{scenarioInputs.reservePercent}%</span>
                <span className="text-xs text-slate-400">Locked</span>
              </div>
              <span className="text-[10px] text-slate-500 block mt-1">Zero-stall reserve</span>
            </div>
          </div>
        </div>
      ) : (
        /* Signed Out Banner */
        <div className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-dashed border-slate-300 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-lime-100 border border-lime-300 flex items-center justify-center text-lime-700 flex-shrink-0">
              <Car className="w-7 h-7" />
            </div>
            <div>
              <h3 className="font-heading font-bold text-lg text-slate-900">
                You Are Currently Signed Out
              </h3>
              <p className="text-xs text-slate-500 font-sans mt-0.5">
                Sign in to pair with your vehicle&rsquo;s live CAN/BMS telematics registers, or continue testing as guest.
              </p>
            </div>
          </div>
          <button
            onClick={() => setAuthModalOpen(true)}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-lime-500 hover:bg-lime-400 text-slate-950 font-bold text-sm font-mono shadow-sm transition"
          >
            <LogIn className="w-4 h-4" />
            <span>Sign In to Link Vehicle</span>
          </button>
        </div>
      )}

      {/* 2. Interactive Manual Location Input & Geocoding Details */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
          <div>
            <span className="text-xs font-mono font-bold text-lime-700 uppercase tracking-wider block">
              Custom Location Input & Route Geocoding
            </span>
            <h3 className="text-xl font-bold font-heading text-slate-900 mt-0.5">
              Type Any Start Location & Destination
            </h3>
          </div>
          <span className="text-xs font-mono text-slate-400">
            Real-time elevation & distance tracking
          </span>
        </div>

        {/* Manual Typing Form */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Origin Text Input */}
          <div className="space-y-2">
            <label className="text-xs font-mono font-bold text-slate-700 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-slate-800" />
                <span>Start Location (Origin)</span>
              </span>
              <span className="text-[10px] text-slate-400 font-normal">Type freely</span>
            </label>
            <div className="relative">
              <input
                type="text"
                value={typedOrigin}
                onChange={(e) => setTypedOrigin(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleApplyLocations()}
                placeholder="e.g. Ukkadam, Singanallur, Gandhipuram..."
                className="w-full px-3.5 py-3 rounded-2xl border border-slate-300 bg-white text-slate-900 font-sans text-xs focus:outline-none focus:border-lime-500 focus:ring-2 focus:ring-lime-400/30 transition shadow-2xs"
              />
              <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-3.5" />
            </div>

            {/* Quick Origin Suggestions */}
            <div className="flex flex-wrap gap-1.5 pt-1">
              {originSuggestions.map((s, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setTypedOrigin(s);
                    handleApplyLocations(s, typedDestination);
                  }}
                  className={`text-[10px] font-mono px-2 py-1 rounded-lg border transition ${
                    typedOrigin === s
                      ? 'bg-slate-900 text-white border-slate-900'
                      : 'bg-slate-50 text-slate-600 border-slate-200 hover:border-slate-300 hover:bg-slate-100'
                  }`}
                >
                  {s.split(',')[0]}
                </button>
              ))}
            </div>
          </div>

          {/* Destination Text Input */}
          <div className="space-y-2">
            <label className="text-xs font-mono font-bold text-slate-700 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-lime-700" />
                <span>Target Destination</span>
              </span>
              <span className="text-[10px] text-lime-700 font-normal">Type freely</span>
            </label>
            <div className="relative">
              <input
                type="text"
                value={typedDestination}
                onChange={(e) => setTypedDestination(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleApplyLocations()}
                placeholder="e.g. Ooty, Anaikatti, Marudhamalai, Airport, Pollachi..."
                className="w-full px-3.5 py-3 rounded-2xl border border-slate-300 bg-white text-slate-900 font-sans text-xs focus:outline-none focus:border-lime-500 focus:ring-2 focus:ring-lime-400/30 transition shadow-2xs"
              />
              <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-3.5" />
            </div>

            {/* Quick Destination Suggestions */}
            <div className="flex flex-wrap gap-1.5 pt-1">
              {destinationSuggestions.map((s, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setTypedDestination(s);
                    handleApplyLocations(typedOrigin, s);
                  }}
                  className={`text-[10px] font-mono px-2 py-1 rounded-lg border transition ${
                    typedDestination === s
                      ? 'bg-lime-600 text-white border-lime-600 shadow-xs'
                      : 'bg-slate-50 text-slate-600 border-slate-200 hover:border-slate-300 hover:bg-slate-100'
                  }`}
                >
                  {s.split('(')[0].trim()}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Calculate Button */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
          <span className="text-[11px] font-mono text-slate-400">
            Press Enter or click to update physics tractive force calculations
          </span>
          <button
            onClick={() => handleApplyLocations()}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-mono font-bold transition shadow-xs flex items-center justify-center gap-2 hover:scale-105"
          >
            <RotateCw className="w-3.5 h-3.5 text-lime-400" />
            <span>Recalculate Route & Feasibility</span>
          </button>
        </div>

        {/* Tracked Location & Route Details Card */}
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/90 font-mono text-xs space-y-3">
          <div className="text-[10px] font-mono uppercase font-bold text-slate-500 tracking-wider">
            Tracked Location Telemetry & Gradient Profile
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-2.5 rounded-xl bg-white border border-slate-200">
              <span className="text-[9px] text-slate-400 uppercase block">Start Altitude</span>
              <span className="font-bold text-slate-900">{originGeo.elevationM}m AMSL</span>
              <span className="text-[9px] text-slate-400 block truncate">{originGeo.shortName}</span>
            </div>

            <div className="p-2.5 rounded-xl bg-white border border-slate-200">
              <span className="text-[9px] text-slate-400 uppercase block">End Altitude</span>
              <span className="font-bold text-slate-900">{destinationGeo.elevationM}m AMSL</span>
              <span className="text-[9px] text-slate-400 block truncate">{destinationGeo.shortName}</span>
            </div>

            <div className="p-2.5 rounded-xl bg-white border border-slate-200">
              <span className="text-[9px] text-slate-400 uppercase block">Calculated Distance</span>
              <span className="font-bold text-slate-900">{activeRoute.totalDistanceKm} km</span>
              <span className="text-[9px] text-slate-400 block">~{activeRoute.estDurationMinutes} mins</span>
            </div>

            <div className="p-2.5 rounded-xl bg-white border border-slate-200">
              <span className="text-[9px] text-slate-400 uppercase block">Elevation Delta</span>
              <span className={`font-bold ${activeRoute.elevationGainM > 100 ? 'text-amber-700' : 'text-emerald-700'}`}>
                {activeRoute.elevationGainM > 0 ? `+${activeRoute.elevationGainM}m ascent` : `${activeRoute.elevationGainM}m descent`}
              </span>
              <span className="text-[9px] text-slate-400 block">
                {activeRoute.elevationGainM > 150 ? 'Mountain Gradient' : 'Arterial Corridor'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Live Road Traffic Telematics & Auto-Sensing Widget */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-50 border border-amber-300 text-amber-700">
              <Activity className="w-4 h-4 text-amber-700 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-900">
                  Live Traffic Telematics & Road Condition Sensing
                </span>
                <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold">
                  ● Sensor Online
                </span>
              </div>
              <p className="text-xs text-slate-500 font-sans">
                Real-time congestion auto-detection from road speed telemetry probes
              </p>
            </div>
          </div>

          {/* Action to simulate sensor update */}
          <div className="flex items-center gap-2">
            <button
              onClick={simulateTrafficUpdate}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-xs font-mono text-slate-800 transition shadow-2xs hover:border-slate-400"
              title="Click to simulate live road congestion change"
            >
              <RotateCw className="w-3.5 h-3.5 text-lime-700" />
              <span>Simulate Traffic Fluctuation</span>
            </button>
          </div>
        </div>

        {/* Live Detected Status Card */}
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 font-sans">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className={`w-2.5 h-2.5 rounded-full animate-ping ${
                scenarioInputs.trafficLevel === 'heavy'
                  ? 'bg-red-500'
                  : scenarioInputs.trafficLevel === 'moderate'
                  ? 'bg-amber-500'
                  : 'bg-emerald-500'
              }`} />
              <span className="text-xs font-mono font-bold uppercase text-slate-800">
                Sensed Condition: <strong className="capitalize text-slate-900">{scenarioInputs.trafficLevel} Traffic</strong>
              </span>
            </div>
            <p className="text-xs text-slate-600 font-mono">
              {sensedTrafficIncident}
            </p>
          </div>

          {/* Segment Speed Breakdown */}
          <div className="grid grid-cols-3 gap-2 w-full md:w-auto text-xs font-mono text-slate-600">
            <div className="px-2 sm:px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-center">
              <span className="text-[8px] sm:text-[9px] text-slate-400 block uppercase">City Corridor</span>
              <strong className="text-slate-900 text-xs sm:text-sm">
                {scenarioInputs.trafficLevel === 'heavy' ? '22 km/h' : scenarioInputs.trafficLevel === 'moderate' ? '36 km/h' : '48 km/h'}
              </strong>
            </div>
            <div className="px-2 sm:px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-center">
              <span className="text-[8px] sm:text-[9px] text-slate-400 block uppercase">Arterial Bypass</span>
              <strong className="text-slate-900 text-xs sm:text-sm">
                {scenarioInputs.trafficLevel === 'heavy' ? '38 km/h' : scenarioInputs.trafficLevel === 'moderate' ? '46 km/h' : '54 km/h'}
              </strong>
            </div>
            <div className="px-2 sm:px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-center">
              <span className="text-[8px] sm:text-[9px] text-slate-400 block uppercase">Idle Penalty</span>
              <strong className="text-amber-700 text-xs sm:text-sm">
                {scenarioInputs.trafficLevel === 'heavy' ? '+28% Wh' : scenarioInputs.trafficLevel === 'moderate' ? '+12% Wh' : '0% (Nom)'}
              </strong>
            </div>
          </div>
        </div>

        {/* Ambient & Payload Secondary Inputs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          {/* Starting SoC Quick Adjuster */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 flex items-center justify-between font-sans">
              <span>Battery Starting SoC</span>
              <span className="font-mono text-xs text-lime-700 font-bold">
                {scenarioInputs.startingSoC}%
              </span>
            </label>
            <input
              type="range"
              min="15"
              max="100"
              step="1"
              value={scenarioInputs.startingSoC}
              onChange={(e) => setScenarioInputs({ startingSoC: Number(e.target.value) })}
              className="w-full accent-lime-600 cursor-pointer h-2 bg-slate-200 rounded-lg"
            />
          </div>

          {/* Passenger / Cargo Payload */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 flex items-center justify-between font-sans">
              <span>Payload & Luggage</span>
              <span className="font-mono text-xs text-slate-900 font-bold">
                +{scenarioInputs.payloadKg} kg
              </span>
            </label>
            <input
              type="range"
              min="0"
              max="80"
              step="5"
              value={scenarioInputs.payloadKg}
              onChange={(e) => setScenarioInputs({ payloadKg: Number(e.target.value) })}
              className="w-full accent-lime-600 cursor-pointer h-2 bg-slate-200 rounded-lg"
            />
          </div>
        </div>
      </div>

      {/* 4. Interactive Route Map with Candidate Polylines */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs font-mono font-bold text-lime-700 uppercase tracking-wider block">
              Cartographic Telematics
            </span>
            <h3 className="text-xl font-bold font-heading text-slate-900">
              Interactive Map & Live Station Graph
            </h3>
          </div>
          <span className="text-xs font-mono text-slate-400">
            OpenStreetMap standard tiles • Dynamic route fitting
          </span>
        </div>

        <RouteMap
          routes={routes}
          chargers={chargers}
          predictions={evaluatedRoutes}
          selectedRouteId={selectedRouteId}
          onSelectRoute={(id) => setSelectedRouteId(id)}
          heightClass="h-[420px]"
        />
      </div>

      {/* 5. Pre-Departure Feasibility Verdict ("Will I Make It?") */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Route Comparison Cards (7 Cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold font-heading text-slate-900">
              Evaluated Routes to {destinationGeo.shortName}
            </h3>
            <span className="text-xs font-mono text-slate-400">
              2,000 Monte Carlo runs • 10% protected reserve
            </span>
          </div>

          <div className="space-y-3">
            {evaluatedRoutes.map((routePred) => {
              const routeDef = routes.find((r) => r.id === routePred.routeId);
              const isSelected = routePred.routeId === selectedRouteId;
              const isRec = routePred.routeId === recommendedRouteId;
              const isFeasible = routePred.isFeasibleAtTarget;

              return (
                <div
                  key={routePred.routeId}
                  onClick={() => setSelectedRouteId(routePred.routeId)}
                  className={`p-5 rounded-3xl border-2 transition-all cursor-pointer relative ${
                    isSelected
                      ? isFeasible
                        ? 'border-lime-500 bg-lime-50/60 shadow-md ring-2 ring-lime-400/30'
                        : 'border-red-400 bg-red-50/60 shadow-md ring-2 ring-red-400/30'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full uppercase ${
                          isFeasible
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                            : 'bg-red-100 text-red-800 border border-red-300'
                        }`}>
                          {isFeasible ? '✓ FEASIBLE' : '✗ REJECTED'}
                        </span>
                        {isRec && (
                          <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-lime-200 text-lime-900">
                            ★ RECOMMENDED
                          </span>
                        )}
                        <span className="text-xs font-mono text-slate-400">
                          {routePred.totalDistanceKm} km
                        </span>
                      </div>
                      <h4 className="text-sm font-bold font-heading text-slate-900">
                        {routePred.routeName}
                      </h4>
                      <p className="text-xs text-slate-500 font-sans">
                        {routeDef?.tagline}
                      </p>
                    </div>

                    <div className="text-right flex-shrink-0">
                      <div className="text-2xl font-black font-mono tracking-tight text-slate-900">
                        {(routePred.pFeasibleArrival * 100).toFixed(0)}%
                      </div>
                      <span className="text-[10px] font-mono text-slate-400 uppercase block">
                        Feasibility
                      </span>
                    </div>
                  </div>

                  {/* Why this or why rejected */}
                  <div className="mt-3 pt-3 border-t border-slate-200/80 text-xs font-sans text-slate-700 space-y-1">
                    {!isFeasible && routePred.rejectionReason && (
                      <div className="flex items-center gap-1.5 text-red-700 font-mono text-[11px]">
                        <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />
                        <span>{routePred.rejectionReason}</span>
                      </div>
                    )}
                    {isFeasible && routePred.chargingStop && (
                      <div className="flex items-center gap-1.5 text-emerald-800 font-mono text-[11px]">
                        <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0" />
                        <span>Includes fresh stop at {routePred.chargingStop.charger.name} (Trust {routePred.chargingStop.trustScore.trustScore})</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Physics Energy Breakdown (5 Cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white rounded-3xl p-6 border-2 border-slate-200 shadow-card space-y-5">
            <span className="text-xs font-mono font-bold text-slate-800 uppercase tracking-wider block">
              Physics Energy & Environmental Breakdown
            </span>

            {/* Linear Dashboard Contrast */}
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500 font-mono font-semibold">Standard Linear Display DTE:</span>
                <span className="font-bold text-slate-800 font-mono">{naiveRangeKm} km</span>
              </div>
              <p className="text-[11px] text-slate-500 leading-snug">
                Linear range calculation ignores aerodynamic drag, elevation gradients, and battery internal resistance.
              </p>
            </div>

            {/* Environmental Resistance Indicators */}
            <div className="space-y-2.5 font-mono text-xs">
              {/* Kinetic Regen Recovery */}
              <div className="p-3 rounded-2xl bg-emerald-50/70 border border-emerald-300 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <TrendingDown className="w-4 h-4 text-emerald-700" />
                  <div>
                    <span className="font-bold text-emerald-950 block">Kinetic Regen Recovery</span>
                    <span className="text-[10px] text-emerald-700">Deceleration & slope recapture</span>
                  </div>
                </div>
                <span className="font-extrabold text-emerald-800 text-sm">+{regenWhHarvested} Wh</span>
              </div>

              {/* Aerodynamic Wind Drag */}
              <div className="p-3 rounded-2xl bg-sky-50/70 border border-sky-300 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Wind className="w-4 h-4 text-sky-700" />
                  <div>
                    <span className="font-bold text-sky-950 block">Atmospheric Headwind Drag</span>
                    <span className="text-[10px] text-sky-700">12 km/h NW wind vector</span>
                  </div>
                </div>
                <span className="font-extrabold text-sky-800 text-sm">+{headwindAeroDragWh} Wh</span>
              </div>

              {/* Cell Thermal Monitoring */}
              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Thermometer className="w-4 h-4 text-amber-700" />
                  <div>
                    <span className="font-bold text-slate-800 block">BMS Pack Cell Temperature</span>
                    <span className="text-[10px] text-slate-500">Thermal degradation limit &lt;45°C</span>
                  </div>
                </div>
                <span className="font-extrabold text-amber-800 text-sm">{telemetry.packTempC}°C</span>
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-2.5 pt-2">
              <button
                onClick={() => navigate('/drive')}
                className="w-full py-3.5 px-5 rounded-2xl bg-lime-500 hover:bg-lime-400 text-slate-950 font-extrabold text-sm font-heading shadow-md transition-all hover:scale-[1.01] flex items-center justify-center gap-2"
              >
                <Navigation className="w-4 h-4 stroke-[2.5]" />
                <span>Launch Live Drive HUD Simulation</span>
              </button>

              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => handleProveJourney()}
                  className="py-2.5 px-3 rounded-xl border border-slate-300 bg-white hover:bg-slate-100 text-xs font-mono font-bold text-slate-800 transition text-center"
                >
                  Inspect Proofs
                </button>
                <button
                  onClick={() => setProofCertificateOpen(true)}
                  className="py-2.5 px-3 rounded-xl border border-slate-300 bg-white hover:bg-slate-100 text-xs font-mono font-bold text-slate-800 transition text-center"
                >
                  Export Proof
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
