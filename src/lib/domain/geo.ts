export type GeoPoint = {
  lat: number;
  lon: number;
};

const EARTH_MEAN_RADIUS_METERS = 6_371_008.8;

function isValidGeoPoint(point: GeoPoint): boolean {
  return Number.isFinite(point.lat) &&
    Number.isFinite(point.lon) &&
    point.lat >= -90 &&
    point.lat <= 90 &&
    point.lon >= -180 &&
    point.lon <= 180;
}

/** Returns approximate great-circle distance in meters, or null for invalid coordinates. */
export function haversineMeters(origin: GeoPoint, destination: GeoPoint): number | null {
  if (!isValidGeoPoint(origin) || !isValidGeoPoint(destination)) return null;

  const radians = Math.PI / 180;
  const originLatitude = origin.lat * radians;
  const destinationLatitude = destination.lat * radians;
  const latitudeDelta = (destination.lat - origin.lat) * radians;
  const longitudeDelta = (destination.lon - origin.lon) * radians;
  const latitudeTerm = Math.sin(latitudeDelta / 2);
  const longitudeTerm = Math.sin(longitudeDelta / 2);
  const haversine = latitudeTerm * latitudeTerm +
    Math.cos(originLatitude) *
      Math.cos(destinationLatitude) *
      longitudeTerm * longitudeTerm;
  const centralAngle = 2 * Math.atan2(Math.sqrt(Math.min(1, haversine)), Math.sqrt(Math.max(0, 1 - haversine)));

  return Math.round(EARTH_MEAN_RADIUS_METERS * centralAngle);
}

/** Builds an external Google Maps directions URL only for valid world coordinates. */
export function buildDirectionsUrl(origin: GeoPoint, destination: GeoPoint): string | null {
  if (!isValidGeoPoint(origin) || !isValidGeoPoint(destination)) return null;

  const url = new URL("https://www.google.com/maps/dir/");
  url.searchParams.set("api", "1");
  url.searchParams.set("origin", `${origin.lat},${origin.lon}`);
  url.searchParams.set("destination", `${destination.lat},${destination.lon}`);
  return url.toString();
}
