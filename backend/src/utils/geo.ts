import type { Waypoint, GeoJSONFeature, GeoJSONFeatureCollection } from '../types/index.js';

const EARTH_RADIUS_KM = 6371;
const DEGREE = Math.PI / 180;
const KNOTS_TO_KMH = 1.852;

export function toRadians(deg: number): number {
  return deg * DEGREE;
}

export function toDegrees(rad: number): number {
  return rad / DEGREE;
}

export function haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) * Math.sin(dLon / 2) ** 2;
  return 2 * EARTH_RADIUS_KM * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function initialBearing(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const dLon = toRadians(lon2 - lon1);
  const y = Math.sin(dLon) * Math.cos(toRadians(lat2));
  const x =
    Math.cos(toRadians(lat1)) * Math.sin(toRadians(lat2)) -
    Math.sin(toRadians(lat1)) * Math.cos(toRadians(lat2)) * Math.cos(dLon);
  return (toDegrees(Math.atan2(y, x)) + 360) % 360;
}

export function greatCircleInterpolation(
  lat1: number, lon1: number,
  lat2: number, lon2: number,
  fraction: number,
): { latitude: number; longitude: number } {
  const d = toRadians(haversineDistance(lat1, lon1, lat2, lon2) / EARTH_RADIUS_KM);
  const φ1 = toRadians(lat1);
  const λ1 = toRadians(lon1);
  const φ2 = toRadians(lat2);
  const λ2 = toRadians(lon2);
  const a = Math.sin((1 - fraction) * d) / Math.sin(d);
  const b = Math.sin(fraction * d) / Math.sin(d);
  const x = a * Math.cos(φ1) * Math.cos(λ1) + b * Math.cos(φ2) * Math.cos(λ2);
  const y = a * Math.cos(φ1) * Math.sin(λ1) + b * Math.cos(φ2) * Math.sin(λ2);
  const z = a * Math.sin(φ1) + b * Math.sin(φ2);
  return {
    latitude: toDegrees(Math.atan2(z, Math.sqrt(x * x + y * y))),
    longitude: toDegrees(Math.atan2(y, x)),
  };
}

export function knotsToKmh(knots: number): number {
  return knots * KNOTS_TO_KMH;
}

export function kmToNauticalMiles(km: number): number {
  return km / 1.852;
}

export function etaHours(distanceKm: number, speedKnots: number): number {
  if (speedKnots <= 0) return Infinity;
  return distanceKm / knotsToKmh(speedKnots);
}

export function pointFeature(
  longitude: number, latitude: number,
  properties: Record<string, unknown> = {},
): GeoJSONFeature {
  return {
    type: 'Feature',
    geometry: { type: 'Point', coordinates: [longitude, latitude] },
    properties,
  };
}

export function lineStringFeature(
  coordinates: number[][],
  properties: Record<string, unknown> = {},
): GeoJSONFeature {
  return {
    type: 'Feature',
    geometry: { type: 'LineString', coordinates },
    properties,
  };
}

export function polygonFeature(
  coordinates: number[][][],
  properties: Record<string, unknown> = {},
): GeoJSONFeature {
  return {
    type: 'Feature',
    geometry: { type: 'Polygon', coordinates },
    properties,
  };
}

export function featureCollection(features: GeoJSONFeature[]): GeoJSONFeatureCollection {
  return { type: 'FeatureCollection', features };
}

export function waypointToCoords(wp: Waypoint): [number, number] {
  return [wp.longitude, wp.latitude];
}
