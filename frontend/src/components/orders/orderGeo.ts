import { parseGeoCoord, haversineKm } from "../../utils/haversineKm";

export type LatLng = { lat: number; lng: number };

export function coordsFromFields(lat: unknown, lng: unknown): LatLng | null {
  const la = parseGeoCoord(lat);
  const lo = parseGeoCoord(lng);
  if (la === null || lo === null) return null;
  return { lat: la, lng: lo };
}

export function distanceKmBetween(a: LatLng | null, b: LatLng | null): number | null {
  if (!a || !b) return null;
  return haversineKm(a.lat, a.lng, b.lat, b.lng);
}
