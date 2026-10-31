import { RouteCandidate } from './types';
import { HERO_ROUTES } from './routes';

export interface LocationHub {
  id: string;
  name: string;
  shortName: string;
  elevationM: number;
  lat: number;
  lng: number;
  description: string;
}

export interface DestinationCorridor {
  id: string;
  name: string;
  shortName: string;
  elevationM: number;
  elevationGainM: number;
  distanceKm: number;
  lat: number;
  lng: number;
  badge: string;
  description: string;
  routes: RouteCandidate[];
}

export const ORIGIN_HUBS: LocationHub[] = [
  {
    id: 'origin-gandhipuram',
    name: 'Gandhipuram Transit Center, Coimbatore',
    shortName: 'Gandhipuram Transit',
    elevationM: 410,
    lat: 11.0182,
    lng: 76.9725,
    description: 'Central urban transit terminal (410m AMSL)',
  },
  {
    id: 'origin-railway',
    name: 'Coimbatore Central Railway Junction',
    shortName: 'Coimbatore Jn',
    elevationM: 412,
    lat: 10.9985,
    lng: 76.9660,
    description: 'Main railway terminus hub (412m AMSL)',
  },
  {
    id: 'origin-peelamedu',
    name: 'Peelamedu IT Corridor (TIDEL Park)',
    shortName: 'Peelamedu IT Hub',
    elevationM: 418,
    lat: 11.0255,
    lng: 77.0040,
    description: 'Eastern electronics & tech zone (418m AMSL)',
  },
  {
    id: 'origin-rspuram',
    name: 'RS Puram Commercial Center',
    shortName: 'RS Puram Hub',
    elevationM: 425,
    lat: 11.0090,
    lng: 76.9450,
    description: 'Western commercial district (425m AMSL)',
  },
];

export const DESTINATION_CORRIDORS: DestinationCorridor[] = [
  {
    id: 'dest-anaikatti',
    name: 'Anaikatti Foothills (Western Ghats)',
    shortName: 'Anaikatti Foothills',
    elevationM: 730,
    elevationGainM: 320,
    distanceKm: 35.2,
    lat: 11.0990,
    lng: 76.7840,
    badge: 'Mountain Climb Challenge',
    description: '730m AMSL • Sustained +320m uphill ascent into Western Ghats reserve boundary',
    routes: HERO_ROUTES, // 35.2km Direct (rejected at 42% SoC) & 41.5km via GreenGrid Hub
  },
  {
    id: 'dest-marudhamalai',
    name: 'Marudhamalai Temple Hill Ascent',
    shortName: 'Marudhamalai Temple',
    elevationM: 590,
    elevationGainM: 180,
    distanceKm: 22.4,
    lat: 11.0470,
    lng: 76.8520,
    badge: 'Moderate Hill Ascent',
    description: '590m AMSL • +180m hill climb through Vadavalli peri-urban corridor',
    routes: [
      {
        id: 'route-marudhamalai-direct',
        name: 'Route A — Direct (Vadavalli Main Rd)',
        viaName: 'Via Vadavalli Main Road',
        tagline: 'Direct route with dense local traffic and final temple staircase grade',
        isDirect: true,
        totalDistanceKm: 22.4,
        elevationGainM: 180,
        estDurationMinutes: 32,
        polyline: [
          [11.0182, 76.9725],
          [11.0210, 76.9535],
          [11.0270, 76.9205],
          [11.0340, 76.8850],
          [11.0410, 76.8640],
          [11.0470, 76.8520],
        ],
        segments: [
          {
            id: 'seg-m1',
            distanceKm: 6.2,
            startElevationM: 410,
            endElevationM: 428,
            gradePercent: 0.29,
            avgSpeedKmh: 26,
            trafficLevel: 'heavy',
          },
          {
            id: 'seg-m2',
            distanceKm: 9.8,
            startElevationM: 428,
            endElevationM: 490,
            gradePercent: 0.63,
            avgSpeedKmh: 42,
            trafficLevel: 'moderate',
          },
          {
            id: 'seg-m3',
            distanceKm: 6.4,
            startElevationM: 490,
            endElevationM: 590,
            gradePercent: 1.56,
            avgSpeedKmh: 34,
            trafficLevel: 'free',
          },
        ],
      },
      {
        id: 'route-marudhamalai-hub',
        name: 'Route B — Via Kavundampalayam Energy Station',
        viaName: 'Via Kavundampalayam Energy Station',
        tagline: 'Flatter arterial ring with verified 15 kW fast charging buffer',
        isDirect: false,
        totalDistanceKm: 26.8,
        elevationGainM: 110,
        estDurationMinutes: 38,
        chargingStopId: 'ch-kavundampalayam',
        chargeDurationMinutes: 10,
        targetArrivalSoCAtStop: 82,
        polyline: [
          [11.0182, 76.9725],
          [11.0265, 76.9580],
          [11.0420, 76.9310], // Kavundampalayam
          [11.0450, 76.8920],
          [11.0470, 76.8520],
        ],
        segments: [
          {
            id: 'seg-mh1',
            distanceKm: 8.5,
            startElevationM: 410,
            endElevationM: 435,
            gradePercent: 0.29,
            avgSpeedKmh: 38,
            trafficLevel: 'moderate',
          },
          {
            id: 'seg-mh2',
            distanceKm: 10.2,
            startElevationM: 435,
            endElevationM: 480,
            gradePercent: 0.44,
            avgSpeedKmh: 46,
            trafficLevel: 'free',
          },
          {
            id: 'seg-mh3',
            distanceKm: 8.1,
            startElevationM: 480,
            endElevationM: 590,
            gradePercent: 1.35,
            avgSpeedKmh: 36,
            trafficLevel: 'free',
          },
        ],
      },
    ],
  },
  {
    id: 'dest-pollachi',
    name: 'Pollachi Arterial Highway Corridor',
    shortName: 'Pollachi Highway',
    elevationM: 370,
    elevationGainM: 45,
    distanceKm: 44.0,
    lat: 10.6620,
    lng: 77.0080,
    badge: 'Long-Range Highway',
    description: '370m AMSL • Long flat highway corridor • High aerodynamic drag and kinetic regen opportunity',
    routes: [
      {
        id: 'route-pollachi-direct',
        name: 'Route A — Direct (Eachanari Bypass NH 83)',
        viaName: 'Via NH 83 Eachanari Bypass',
        tagline: 'High-speed 4-lane arterial with sustained aerodynamic drag',
        isDirect: true,
        totalDistanceKm: 44.0,
        elevationGainM: 45,
        estDurationMinutes: 48,
        polyline: [
          [11.0182, 76.9725],
          [10.9750, 76.9650],
          [10.9100, 76.9720],
          [10.8200, 76.9850],
          [10.7400, 76.9980],
          [10.6620, 77.0080],
        ],
        segments: [
          {
            id: 'seg-p1',
            distanceKm: 10.5,
            startElevationM: 410,
            endElevationM: 400,
            gradePercent: -0.09,
            avgSpeedKmh: 36,
            trafficLevel: 'moderate',
          },
          {
            id: 'seg-p2',
            distanceKm: 18.5,
            startElevationM: 400,
            endElevationM: 382,
            gradePercent: -0.10,
            avgSpeedKmh: 58,
            trafficLevel: 'free',
          },
          {
            id: 'seg-p3',
            distanceKm: 15.0,
            startElevationM: 382,
            endElevationM: 370,
            gradePercent: -0.08,
            avgSpeedKmh: 54,
            trafficLevel: 'free',
          },
        ],
      },
      {
        id: 'route-pollachi-hub',
        name: 'Route B — Via Malumichampatti Fast Charging Hub',
        viaName: 'Via Malumichampatti Corridor',
        tagline: 'Protected route with fast charging stop midway for secure highway transit',
        isDirect: false,
        totalDistanceKm: 47.8,
        elevationGainM: 55,
        estDurationMinutes: 56,
        chargingStopId: 'ch-greengrid',
        chargeDurationMinutes: 14,
        targetArrivalSoCAtStop: 80,
        polyline: [
          [11.0182, 76.9725],
          [10.9750, 76.9650],
          [10.8800, 76.9750],
          [10.7800, 76.9900],
          [10.6620, 77.0080],
        ],
        segments: [
          {
            id: 'seg-ph1',
            distanceKm: 14.2,
            startElevationM: 410,
            endElevationM: 395,
            gradePercent: -0.10,
            avgSpeedKmh: 42,
            trafficLevel: 'moderate',
          },
          {
            id: 'seg-ph2',
            distanceKm: 17.6,
            startElevationM: 395,
            endElevationM: 380,
            gradePercent: -0.08,
            avgSpeedKmh: 55,
            trafficLevel: 'free',
          },
          {
            id: 'seg-ph3',
            distanceKm: 16.0,
            startElevationM: 380,
            endElevationM: 370,
            gradePercent: -0.06,
            avgSpeedKmh: 52,
            trafficLevel: 'free',
          },
        ],
      },
    ],
  },
  {
    id: 'dest-siruvani',
    name: 'Siruvani Foothills Eco-Trail',
    shortName: 'Siruvani Foothills',
    elevationM: 620,
    elevationGainM: 210,
    distanceKm: 38.6,
    lat: 10.9380,
    lng: 76.7150,
    badge: 'Undulating Forest Trail',
    description: '620m AMSL • +210m elevation gain through scenic Perur & Alandurai forest basin',
    routes: [
      {
        id: 'route-siruvani-direct',
        name: 'Route A — Direct (Via Perur Main Rd)',
        viaName: 'Via Perur Main Road',
        tagline: 'Direct route with heritage corridor traffic and gradual mountain foothills',
        isDirect: true,
        totalDistanceKm: 38.6,
        elevationGainM: 210,
        estDurationMinutes: 49,
        polyline: [
          [11.0182, 76.9725],
          [10.9850, 76.9420],
          [10.9620, 76.8850],
          [10.9480, 76.8120],
          [10.9380, 76.7150],
        ],
        segments: [
          {
            id: 'seg-s1',
            distanceKm: 9.2,
            startElevationM: 410,
            endElevationM: 430,
            gradePercent: 0.22,
            avgSpeedKmh: 28,
            trafficLevel: 'heavy',
          },
          {
            id: 'seg-s2',
            distanceKm: 15.4,
            startElevationM: 430,
            endElevationM: 510,
            gradePercent: 0.52,
            avgSpeedKmh: 44,
            trafficLevel: 'moderate',
          },
          {
            id: 'seg-s3',
            distanceKm: 14.0,
            startElevationM: 510,
            endElevationM: 620,
            gradePercent: 0.78,
            avgSpeedKmh: 40,
            trafficLevel: 'free',
          },
        ],
      },
      {
        id: 'route-siruvani-hub',
        name: 'Route B — Via Alandurai Solar Station',
        viaName: 'Via Alandurai Solar Station',
        tagline: 'Reliable route with wayside fast top-up before deep forest reserve entry',
        isDirect: false,
        totalDistanceKm: 43.2,
        elevationGainM: 140,
        estDurationMinutes: 54,
        chargingStopId: 'ch-greengrid',
        chargeDurationMinutes: 12,
        targetArrivalSoCAtStop: 82,
        polyline: [
          [11.0182, 76.9725],
          [10.9920, 76.9550],
          [10.9580, 76.8620],
          [10.9380, 76.7150],
        ],
        segments: [
          {
            id: 'seg-sh1',
            distanceKm: 12.5,
            startElevationM: 410,
            endElevationM: 440,
            gradePercent: 0.24,
            avgSpeedKmh: 36,
            trafficLevel: 'moderate',
          },
          {
            id: 'seg-sh2',
            distanceKm: 16.2,
            startElevationM: 440,
            endElevationM: 530,
            gradePercent: 0.55,
            avgSpeedKmh: 46,
            trafficLevel: 'free',
          },
          {
            id: 'seg-sh3',
            distanceKm: 14.5,
            startElevationM: 530,
            endElevationM: 620,
            gradePercent: 0.62,
            avgSpeedKmh: 40,
            trafficLevel: 'free',
          },
        ],
      },
    ],
  },
];

