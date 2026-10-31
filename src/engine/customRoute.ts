import { RouteCandidate, RouteSegment } from '../data/types';
import { CHARGERS } from '../data/chargers';

export interface LocationGeoData {
  name: string;
  shortName: string;
  lat: number;
  lng: number;
  elevationM: number;
}

// Comprehensive registry of Coimbatore & Tamil Nadu Western Ghats regional landmarks
export const KNOWN_LOCATIONS: Record<string, LocationGeoData> = {
  gandhipuram: {
    name: 'Gandhipuram Transit Center, Coimbatore',
    shortName: 'Gandhipuram',
    lat: 11.0182,
    lng: 76.9725,
    elevationM: 410,
  },
  railway: {
    name: 'Coimbatore Central Railway Junction',
    shortName: 'Coimbatore Jn',
    lat: 10.9985,
    lng: 76.9660,
    elevationM: 412,
  },
  peelamedu: {
    name: 'Peelamedu IT Corridor / TIDEL Park',
    shortName: 'Peelamedu IT',
    lat: 11.0255,
    lng: 77.0040,
    elevationM: 418,
  },
  rspuram: {
    name: 'RS Puram Commercial Plaza',
    shortName: 'RS Puram',
    lat: 11.0090,
    lng: 76.9450,
    elevationM: 425,
  },
  singanallur: {
    name: 'Singanallur Bus Terminal',
    shortName: 'Singanallur',
    lat: 10.9980,
    lng: 77.0220,
    elevationM: 405,
  },
  ukkadam: {
    name: 'Ukkadam Bus Stand & Lake',
    shortName: 'Ukkadam',
    lat: 10.9880,
    lng: 76.9620,
    elevationM: 400,
  },
  airport: {
    name: 'Coimbatore International Airport (CJB)',
    shortName: 'Coimbatore Airport',
    lat: 11.0300,
    lng: 77.0434,
    elevationM: 422,
  },
  saravanampatti: {
    name: 'Saravanampatti IT Special Economic Zone',
    shortName: 'Saravanampatti',
    lat: 11.0820,
    lng: 76.9950,
    elevationM: 428,
  },
  kovaipudur: {
    name: 'Kovaipudur Township',
    shortName: 'Kovaipudur',
    lat: 10.9320,
    lng: 76.9380,
    elevationM: 435,
  },
  avinashi: {
    name: 'Avinashi Road Arterial Corridor',
    shortName: 'Avinashi Road',
    lat: 11.0220,
    lng: 77.0100,
    elevationM: 415,
  },
  anaikatti: {
    name: 'Anaikatti Foothills (Western Ghats)',
    shortName: 'Anaikatti Foothills',
    lat: 11.0990,
    lng: 76.7840,
    elevationM: 730,
  },
  marudhamalai: {
    name: 'Marudhamalai Temple Hill Ascent',
    shortName: 'Marudhamalai Temple',
    lat: 11.0470,
    lng: 76.8520,
    elevationM: 590,
  },
  pollachi: {
    name: 'Pollachi Highway Junction',
    shortName: 'Pollachi Highway',
    lat: 10.6620,
    lng: 77.0080,
    elevationM: 370,
  },
  siruvani: {
    name: 'Siruvani Foothills Eco-Trail',
    shortName: 'Siruvani Foothills',
    lat: 10.9380,
    lng: 76.7150,
    elevationM: 620,
  },
  ooty: {
    name: 'Ooty (Udhagamandalam) Nilgiri Hill Station',
    shortName: 'Ooty Hills',
    lat: 11.4100,
    lng: 76.6950,
    elevationM: 2240,
  },
  coonoor: {
    name: 'Coonoor Tea Estate Foothills',
    shortName: 'Coonoor',
    lat: 11.3530,
    lng: 76.7959,
    elevationM: 1850,
  },
  mettupalayam: {
    name: 'Mettupalayam Foothill Station',
    shortName: 'Mettupalayam',
    lat: 11.3000,
    lng: 76.9400,
    elevationM: 325,
  },
  isha: {
    name: 'Isha Yoga Center (Velliangiri Foothills)',
    shortName: 'Isha Velliangiri',
    lat: 10.9730,
    lng: 76.7360,
    elevationM: 520,
  },
};

/**
 * Calculates great circle distance between two points in kilometers.
 */
function haversineDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Resolves a free-text string to coordinate and elevation data.
 * Matches keywords against known regional spots, or deterministically generates a realistic point.
 */
export function resolveLocationText(input: string, fallbackLat = 11.0182, fallbackLng = 76.9725): LocationGeoData {
  const query = input.trim().toLowerCase();

  // 1. Direct or partial match in known registry
  for (const [key, data] of Object.entries(KNOWN_LOCATIONS)) {
    if (query.includes(key) || data.name.toLowerCase().includes(query) || data.shortName.toLowerCase().includes(query)) {
      return data;
    }
  }

  // 2. Fallback heuristic for any custom location typed by user
  // Generate a deterministic coordinate offset within ~15-40 km of Coimbatore based on string hash
  let hash = 0;
  for (let i = 0; i < query.length; i++) {
    hash = (hash << 5) - hash + query.charCodeAt(i);
    hash |= 0;
  }
  const normalizedHash = Math.abs(hash) % 1000;
  const latOffset = ((normalizedHash % 100) - 50) * 0.003;
  const lngOffset = (Math.floor(normalizedHash / 100) - 5) * 0.003;

  const lat = Math.round((fallbackLat + latOffset) * 10000) / 10000;
  const lng = Math.round((fallbackLng + lngOffset) * 10000) / 10000;
  const isHill = query.includes('hill') || query.includes('mountain') || query.includes('peak') || query.includes('ghat');
  const elevationM = isHill ? 680 + (normalizedHash % 400) : 410 + (normalizedHash % 60);

  const formattedName = input.trim().charAt(0).toUpperCase() + input.trim().slice(1);

  return {
    name: formattedName,
    shortName: formattedName.split(',')[0].trim(),
    lat,
    lng,
    elevationM,
  };
}

/**
 * Generates an interpolated polyline curve between two coordinates with natural road curvature.
 */
function generateRoadPolyline(startLat: number, startLng: number, endLat: number, endLng: number, numPoints = 14): [number, number][] {
  const polyline: [number, number][] = [];
  polyline.push([startLat, startLng]);

  for (let i = 1; i < numPoints - 1; i++) {
    const fraction = i / (numPoints - 1);
    // Linear interpolation
    let lat = startLat + (endLat - startLat) * fraction;
    let lng = startLng + (endLng - startLng) * fraction;

    // Add gentle lateral sine curvature simulating realistic road curves
    const curvature = Math.sin(fraction * Math.PI) * 0.008;
    lat += curvature * 0.7;
    lng += curvature * 0.5;

    polyline.push([Math.round(lat * 10000) / 10000, Math.round(lng * 10000) / 10000]);
  }

  polyline.push([endLat, endLng]);
  return polyline;
}

/**
 * Generates dynamic candidate routes (Route A Direct & Route B via Charger Hub)
 * for ANY typed start location and destination!
 */
export function buildDynamicRoutesForLocations(
  originInput: string,
  destinationInput: string,
  trafficLevel: 'free' | 'moderate' | 'heavy' = 'moderate'
): {
  originGeo: LocationGeoData;
  destinationGeo: LocationGeoData;
  routes: RouteCandidate[];
} {
  const originGeo = resolveLocationText(originInput, 11.0182, 76.9725);
  const destinationGeo = resolveLocationText(destinationInput, 11.0990, 76.7840);

  // Compute straight-line distance, apply road tortuosity factor (~1.25x for urban/mountain roads)
  const crowDistance = haversineDistanceKm(originGeo.lat, originGeo.lng, destinationGeo.lat, destinationGeo.lng);
  const totalDistanceKm = Math.max(Math.round(crowDistance * 1.28 * 10) / 10, 4.5);

  const elevationGainM = Math.round(Math.max(destinationGeo.elevationM - originGeo.elevationM, 0));
  const estDurationMinutes = Math.round((totalDistanceKm / 38) * 60);

  // Split into 3 segments: City/Urban, Arterial, and Approach
  const seg1Dist = Math.round(totalDistanceKm * 0.28 * 10) / 10;
  const seg2Dist = Math.round(totalDistanceKm * 0.44 * 10) / 10;
  const seg3Dist = Math.round((totalDistanceKm - seg1Dist - seg2Dist) * 10) / 10;

  const seg1Elev = originGeo.elevationM + Math.round(elevationGainM * 0.15);
  const seg2Elev = originGeo.elevationM + Math.round(elevationGainM * 0.45);
  const seg3Elev = destinationGeo.elevationM;

  const grade1 = Math.round(((seg1Elev - originGeo.elevationM) / (seg1Dist * 1000)) * 10000) / 100;
  const grade2 = Math.round(((seg2Elev - seg1Elev) / (seg2Dist * 1000)) * 10000) / 100;
  const grade3 = Math.round(((seg3Elev - seg2Elev) / (seg3Dist * 1000)) * 10000) / 100;

  const citySpeed = trafficLevel === 'heavy' ? 22 : trafficLevel === 'moderate' ? 32 : 44;
  const arterialSpeed = trafficLevel === 'heavy' ? 38 : trafficLevel === 'moderate' ? 46 : 56;
  const approachSpeed = elevationGainM > 150 ? 36 : 48;

  const directSegments: RouteSegment[] = [
    {
      id: 'custom-seg-1',
      distanceKm: seg1Dist,
      startElevationM: originGeo.elevationM,
      endElevationM: seg1Elev,
      gradePercent: grade1,
      avgSpeedKmh: citySpeed,
      trafficLevel: trafficLevel === 'free' ? 'moderate' : 'heavy',
    },
    {
      id: 'custom-seg-2',
      distanceKm: seg2Dist,
      startElevationM: seg1Elev,
      endElevationM: seg2Elev,
      gradePercent: grade2,
      avgSpeedKmh: arterialSpeed,
      trafficLevel: trafficLevel,
    },
    {
      id: 'custom-seg-3',
      distanceKm: seg3Dist,
      startElevationM: seg2Elev,
      endElevationM: seg3Elev,
      gradePercent: grade3,
      avgSpeedKmh: approachSpeed,
      trafficLevel: 'free',
    },
  ];

  const directPolyline = generateRoadPolyline(originGeo.lat, originGeo.lng, destinationGeo.lat, destinationGeo.lng, 15);

  // Find nearest charger along corridor
  const midLat = (originGeo.lat + destinationGeo.lat) / 2;
  const midLng = (originGeo.lng + destinationGeo.lng) / 2;
  let nearestCharger = CHARGERS[1]; // Default GreenGrid Karamadai Hub
  let minChargerDist = 9999;
  for (const c of CHARGERS) {
    if (c.status !== 'fault') {
      const d = haversineDistanceKm(midLat, midLng, c.lat, c.lng);
      if (d < minChargerDist) {
        minChargerDist = d;
        nearestCharger = c;
      }
    }
  }

  // Route A: Direct Path
  const routeA: RouteCandidate = {
    id: 'custom-route-a-direct',
    name: `Route A — Direct to ${destinationGeo.shortName}`,
    viaName: `Direct Route (${totalDistanceKm} km)`,
    tagline: `Direct path; ${elevationGainM > 100 ? `elevation climb +${elevationGainM}m` : 'nominal terrain'} with stop-and-go urban traffic`,
    isDirect: true,
    totalDistanceKm,
    elevationGainM,
    estDurationMinutes,
    segments: directSegments,
    polyline: directPolyline,
  };

  // Route B: Protected Path with Verified Charger Hub
  const hubDistanceKm = Math.round((totalDistanceKm * 1.15) * 10) / 10;
  const hubDurationMinutes = Math.round(estDurationMinutes * 1.18);
  const hubElevationGainM = Math.round(elevationGainM * 0.85);

  // Interpolate polyline through charger waypoint
  const firstHalfPoly = generateRoadPolyline(originGeo.lat, originGeo.lng, nearestCharger.lat, nearestCharger.lng, 8);
  const secondHalfPoly = generateRoadPolyline(nearestCharger.lat, nearestCharger.lng, destinationGeo.lat, destinationGeo.lng, 8);
  const hubPolyline = [...firstHalfPoly, ...secondHalfPoly.slice(1)];

  const hubSegments: RouteSegment[] = [
    {
      id: 'custom-hub-seg-1',
      distanceKm: Math.round(hubDistanceKm * 0.35 * 10) / 10,
      startElevationM: originGeo.elevationM,
      endElevationM: Math.round(originGeo.elevationM + hubElevationGainM * 0.3),
      gradePercent: Math.round(grade1 * 0.75 * 100) / 100,
      avgSpeedKmh: arterialSpeed,
      trafficLevel: 'moderate',
    },
    {
      id: 'custom-hub-seg-2',
      distanceKm: Math.round(hubDistanceKm * 0.35 * 10) / 10,
      startElevationM: Math.round(originGeo.elevationM + hubElevationGainM * 0.3),
      endElevationM: Math.round(originGeo.elevationM + hubElevationGainM * 0.7),
      gradePercent: Math.round(grade2 * 0.7 * 100) / 100,
      avgSpeedKmh: Math.round(arterialSpeed * 1.1),
      trafficLevel: 'free',
    },
    {
      id: 'custom-hub-seg-3',
      distanceKm: Math.round((hubDistanceKm - Math.round(hubDistanceKm * 0.35 * 10) / 10 * 2) * 10) / 10,
      startElevationM: Math.round(originGeo.elevationM + hubElevationGainM * 0.7),
      endElevationM: destinationGeo.elevationM,
      gradePercent: grade3,
      avgSpeedKmh: approachSpeed,
      trafficLevel: 'free',
    },
  ];

  const routeB: RouteCandidate = {
    id: 'custom-route-b-hub',
    name: `Route B — Via ${nearestCharger.name}`,
    viaName: `Via ${nearestCharger.name} (${hubDistanceKm} km)`,
    tagline: `Recommended: Flatter profile with verified charging stop at ${nearestCharger.name}`,
    isDirect: false,
    totalDistanceKm: hubDistanceKm,
    elevationGainM: hubElevationGainM,
    estDurationMinutes: hubDurationMinutes,
    chargingStopId: nearestCharger.id,
    fallbackStopId: 'ch-kavundampalayam',
    chargeDurationMinutes: 12,
    targetArrivalSoCAtStop: 82,
    segments: hubSegments,
    polyline: hubPolyline,
  };

  return {
    originGeo,
    destinationGeo,
    routes: [routeA, routeB],
  };
}

