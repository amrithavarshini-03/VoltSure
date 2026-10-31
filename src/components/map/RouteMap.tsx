import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Polyline, Marker, Popup, Tooltip as LeafletTooltip, useMap } from 'react-leaflet';
import L from 'leaflet';
import { RouteCandidate, Charger, RoutePredictionResult } from '../../data/types';
import { useVoltSureStore } from '../../store/useVoltSureStore';
import { ORIGIN_HUBS, DESTINATION_CORRIDORS } from '../../data/corridors';

// Fix Leaflet marker icons in React Vite bundler
delete (L.Icon.Default.prototype as unknown as { _getIconUrl?: unknown })._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Component to ensure Leaflet recalculates pixel boundaries immediately upon mounting
const MapResizer: React.FC = () => {
  const map = useMap();
  useEffect(() => {
    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 150);
    return () => clearTimeout(timer);
  }, [map]);
  return null;
};

// Component to re-fit map view bounds whenever route polyline changes
const MapBoundsUpdater: React.FC<{ polyline?: [number, number][] }> = ({ polyline }) => {
  const map = useMap();
  useEffect(() => {
    if (polyline && polyline.length > 0) {
      try {
        const bounds = L.latLngBounds(polyline);
        map.fitBounds(bounds, { padding: [45, 45], maxZoom: 13 });
      } catch {
        // Fallback silently if bounds invalid
      }
    }
  }, [map, polyline]);
  return null;
};

// Custom SVG Icons for Waypoints and Chargers
const createPinIcon = (color: string, label: string) =>
  L.divIcon({
    className: 'custom-map-pin',
    html: `
      <div style="background-color: ${color}; color: white; border: 2px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.3); border-radius: 9999px; padding: 4px 8px; font-size: 10px; font-weight: 700; font-family: monospace; display: flex; align-items: center; gap: 4px; white-space: nowrap;">
        <span>${label}</span>
      </div>
    `,
    iconSize: [40, 24],
    iconAnchor: [20, 12],
  });

const createChargerIcon = (status: Charger['status'], ageMinutes: number, trustScore: number) => {
  let bgColor = '#059669'; // Emerald
  if (status === 'fault') bgColor = '#DC2626';
  else if (status === 'occupied') bgColor = '#0284C7';
  else if (ageMinutes > 120) bgColor = '#D97706';

  return L.divIcon({
    className: 'custom-charger-pin',
    html: `
      <div style="background: white; border: 2px solid ${bgColor}; border-radius: 50%; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 10px rgba(0,0,0,0.15); position: relative;">
        <span style="color: ${bgColor}; font-size: 14px; font-weight: bold;">⚡</span>
        <span style="position: absolute; top: -6px; right: -6px; background: ${bgColor}; color: white; font-size: 8px; font-weight: bold; border-radius: 6px; padding: 1px 3px; font-family: monospace;">
          ${trustScore}
        </span>
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
  });
};

interface RouteMapProps {
  routes: RouteCandidate[];
  chargers: Charger[];
  predictions: RoutePredictionResult[];
  selectedRouteId: string;
  onSelectRoute?: (routeId: string) => void;
  heightClass?: string;
}

export const RouteMap: React.FC<RouteMapProps> = ({
  routes,
  chargers,
  predictions,
  selectedRouteId,
  onSelectRoute,
  heightClass = 'h-[460px]',
}) => {
  const { replanActiveEvent, getCustomGeoDetails } = useVoltSureStore();
  const { originGeo, destinationGeo } = getCustomGeoDetails();

  const predMap = new Map<string, RoutePredictionResult>();
  predictions.forEach((p) => predMap.set(p.routeId, p));

  const activeRoute = routes.find((r) => r.id === selectedRouteId) || routes[0];

  // Dynamic center
  const center: [number, number] = [
    (originGeo.lat + destinationGeo.lat) / 2,
    (originGeo.lng + destinationGeo.lng) / 2,
  ];

  return (
    <div className={`relative w-full ${heightClass} rounded-2xl overflow-hidden border border-slate-200 shadow-card bg-slate-50 z-0`}>
      {/* Floating Map Legend */}
      <div className="absolute top-3 right-3 z-[400] bg-white/95 backdrop-blur-sm p-3 rounded-xl border border-slate-200/90 shadow-md text-xs font-mono space-y-1.5 select-none pointer-events-auto">
        <div className="font-semibold text-slate-900 text-[11px] uppercase tracking-wider mb-1 font-sans">
          Route Reliability Layer
        </div>
        <div className="flex items-center gap-2">
          <span className="w-4 h-1.5 rounded-full bg-lime-600" />
          <span className="text-slate-700">Recommended / Feasible</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-4 h-1 border-b-2 border-dashed border-red-500" />
          <span className="text-slate-700">Rejected (Reserve Breach)</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-4 h-1.5 rounded-full bg-sky-500" />
          <span className="text-slate-700">Safe Alternative</span>
        </div>
        {replanActiveEvent !== 'none' && (
          <div className="flex items-center gap-2 text-purple-700 font-bold border-t border-slate-100 pt-1">
            <span className="w-2 h-2 rounded-full bg-purple-600 animate-ping" />
            <span>Replan Active</span>
          </div>
        )}
      </div>

      <MapContainer
        center={center}
        zoom={11}
        scrollWheelZoom={false}
        className="h-full w-full"
        style={{ height: '100%', width: '100%', minHeight: '350px' }}
      >
        <MapResizer />
        <MapBoundsUpdater polyline={activeRoute?.polyline} />

        {/* 100% Free OpenStreetMap Light Tiles */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
          maxZoom={19}
        />

        {/* Selected Origin Waypoint */}
        <Marker
          position={[originGeo.lat, originGeo.lng]}
          icon={createPinIcon('#0F172A', `START: ${originGeo.shortName}`)}
        >
          <Popup>
            <div className="text-xs p-1">
              <strong>Origin:</strong> {originGeo.name}<br />
              Elevation: {originGeo.elevationM}m AMSL
            </div>
          </Popup>
        </Marker>

        {/* Selected Destination Waypoint */}
        <Marker
          position={[destinationGeo.lat, destinationGeo.lng]}
          icon={createPinIcon('#059669', `DEST: ${destinationGeo.shortName}`)}
        >
          <Popup>
            <div className="text-xs p-1">
              <strong>Destination:</strong> {destinationGeo.name}<br />
              Elevation: {destinationGeo.elevationM}m AMSL
            </div>
          </Popup>
        </Marker>

        {/* Candidate Route Polylines */}
        {routes.map((route) => {
          const pred = predMap.get(route.id);
          const isSelected = route.id === selectedRouteId;
          const isFeasible = pred ? pred.isFeasibleAtTarget : false;

          let color = isFeasible ? '#65A30D' : '#DC2626';
          let dashArray: string | undefined = isFeasible ? undefined : '6, 8';
          let weight = isSelected ? 5.5 : 3.5;
          let opacity = isSelected ? 0.95 : 0.65;

          if (route.id === 'route-c-safe-reserve') {
            color = '#0284C7';
            dashArray = isSelected ? undefined : '4, 4';
          }

          return (
            <React.Fragment key={route.id}>
              {/* Ghost shadow outline if selected */}
              {isSelected && (
                <Polyline
                  positions={route.polyline}
                  pathOptions={{
                    color: isFeasible ? '#BEF264' : '#FCA5A5',
                    weight: 10,
                    opacity: 0.5,
                  }}
                />
              )}

              <Polyline
                positions={route.polyline}
                pathOptions={{
                  color,
                  weight,
                  opacity,
                  dashArray,
                }}
                eventHandlers={{
                  click: () => onSelectRoute && onSelectRoute(route.id),
                }}
              >
                <LeafletTooltip sticky>
                  <div className="font-sans text-xs">
                    <p className="font-bold text-slate-900">{route.name}</p>
                    <p className="text-slate-600 font-mono">
                      {route.totalDistanceKm} km • {route.elevationGainM}m elevation gain
                    </p>
                    {pred && (
                      <p className={`font-mono font-bold mt-1 ${isFeasible ? 'text-lime-700' : 'text-red-600'}`}>
                        {isFeasible ? '✓ FEASIBLE' : '✗ REJECTED'} ({(pred.pFeasibleArrival * 100).toFixed(0)}% arrival probability)
                      </p>
                    )}
                  </div>
                </LeafletTooltip>
              </Polyline>
            </React.Fragment>
          );
        })}

        {/* Charger Markers with Bayesian Trust Badge */}
        {chargers.map((c) => {
          const predWithStop = Array.from(predMap.values()).find((p) => p.chargingStop?.charger.id === c.id);
          const trustScore = predWithStop?.chargingStop?.trustScore.trustScore || 85;

          return (
            <Marker
              key={c.id}
              position={[c.lat, c.lng]}
              icon={createChargerIcon(c.status, c.statusAgeMinutes, trustScore)}
            >
              <Popup>
                <div className="font-sans text-xs space-y-1.5 p-1 max-w-[220px]">
                  <div className="flex items-center justify-between">
                    <strong className="text-slate-900">{c.name}</strong>
                    <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-lime-100 text-lime-900 font-bold">
                      Trust: {trustScore}
                    </span>
                  </div>
                  <p className="text-slate-500 text-[11px] font-mono">
                    {c.powerKw} kW • {c.connectors.join(', ')}
                  </p>
                  <div className="text-[10px] space-y-0.5 text-slate-600 border-t border-slate-100 pt-1">
                    <div>Status: <span className="font-semibold capitalize">{c.status}</span> ({c.statusAgeMinutes}m ago)</div>
                    <div>Source: <span className="font-mono">{c.statusSource}</span></div>
                    <div className="text-slate-400 italic text-[9px]">{c.accessNotes}</div>
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
};
