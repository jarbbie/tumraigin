export type PlaceSearchResult = {
  id: string;
  name: string;
  context: string;
  lat: number;
  lon: number;
};

type Coordinates = { lat: number; lon: number };

const PHOTON_SEARCH_URL = "https://photon.komoot.io/api/";
const MAX_RESULTS = 5;
const MAX_CACHED_SEARCHES = 20;
const MIN_REQUEST_INTERVAL_MS = 1_000;

const resultCache = new Map<string, PlaceSearchResult[]>();
let lastRequestStartedAt = 0;
let requestQueue: Promise<void> = Promise.resolve();

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function readText(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const text = value.trim();
  return text.length > 0 ? text : null;
}

function parseCoordinates(lon: unknown, lat: unknown): Coordinates | null {
  if (
    typeof lon !== "number" ||
    !Number.isFinite(lon) ||
    lon < -180 ||
    lon > 180 ||
    typeof lat !== "number" ||
    !Number.isFinite(lat) ||
    lat < -90 ||
    lat > 90
  ) {
    return null;
  }
  return { lat, lon };
}

function uniqueText(values: unknown[]): string[] {
  const seen = new Set<string>();
  const parts: string[] = [];

  for (const value of values) {
    const text = readText(value);
    if (!text) continue;
    const key = text.toLocaleLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    parts.push(text);
  }

  return parts;
}

function parsePhotonFeature(value: unknown): PlaceSearchResult | null {
  if (!isRecord(value) || !isRecord(value.geometry) || !isRecord(value.properties)) return null;

  const coordinates = value.geometry.coordinates;
  if (!Array.isArray(coordinates) || coordinates.length < 2) return null;
  const parsedCoordinates = parseCoordinates(coordinates[0], coordinates[1]);
  if (!parsedCoordinates) return null;
  const { lat, lon } = parsedCoordinates;

  const properties = value.properties;
  const street = [readText(properties.housenumber), readText(properties.street)]
    .filter((part): part is string => part !== null)
    .join(" ");
  const contextParts = uniqueText([
    properties.district,
    properties.city,
    properties.county,
    properties.state,
    properties.country,
  ]);
  const name = readText(properties.name) ?? (street || contextParts[0] || null);
  if (!name) return null;

  const context = contextParts.filter((part) => part.toLocaleLowerCase() !== name.toLocaleLowerCase())
    .slice(0, 3)
    .join(" · ");
  const sourceType = readText(properties.osm_type) ?? "place";
  const sourceId = readText(properties.osm_id) ?? `${name}:${lat}:${lon}`;

  return {
    id: `${sourceType}:${sourceId}`,
    name: name.slice(0, 120),
    context,
    lat,
    lon,
  };
}

/** Validate the small, displayable subset of a Photon GeoJSON response. */
export function parsePhotonSearchResponse(value: unknown): PlaceSearchResult[] {
  if (!isRecord(value) || value.type !== "FeatureCollection" || !Array.isArray(value.features)) {
    return [];
  }

  const results: PlaceSearchResult[] = [];
  const seen = new Set<string>();
  for (const feature of value.features) {
    const result = parsePhotonFeature(feature);
    if (!result || seen.has(result.id)) continue;
    seen.add(result.id);
    results.push(result);
    if (results.length === MAX_RESULTS) break;
  }

  return results;
}

function normalizeQuery(query: string): { cacheKey: string; requestQuery: string } {
  const requestQuery = query.trim().replace(/\s+/g, " ");
  if (requestQuery.length < 2 || requestQuery.length > 120) {
    throw new Error("Enter a place name between 2 and 120 characters.");
  }
  return { cacheKey: requestQuery.toLocaleLowerCase(), requestQuery };
}

function getCachedResults(cacheKey: string): PlaceSearchResult[] | null {
  const cached = resultCache.get(cacheKey);
  if (!cached) return null;
  resultCache.delete(cacheKey);
  resultCache.set(cacheKey, cached);
  return cached.map((result) => ({ ...result }));
}

function cacheResults(cacheKey: string, results: PlaceSearchResult[]) {
  resultCache.delete(cacheKey);
  resultCache.set(cacheKey, results.map((result) => ({ ...result })));
  if (resultCache.size > MAX_CACHED_SEARCHES) {
    const oldestKey = resultCache.keys().next().value;
    if (oldestKey !== undefined) resultCache.delete(oldestKey);
  }
}

function wait(milliseconds: number): Promise<void> {
  return new Promise((resolve) => globalThis.setTimeout(resolve, milliseconds));
}

/** Run a submitted lookup, spacing calls and caching results for this page runtime. */
export async function searchPlaces(query: string): Promise<PlaceSearchResult[]> {
  const { cacheKey, requestQuery } = normalizeQuery(query);
  const cached = getCachedResults(cacheKey);
  if (cached) return cached;

  const task = requestQueue.then(async () => {
    const queuedCache = getCachedResults(cacheKey);
    if (queuedCache) return queuedCache;

    const waitForRateLimit = Math.max(0, MIN_REQUEST_INTERVAL_MS - (Date.now() - lastRequestStartedAt));
    if (waitForRateLimit > 0) await wait(waitForRateLimit);

    const url = new URL(PHOTON_SEARCH_URL);
    url.searchParams.set("q", requestQuery);
    url.searchParams.set("lang", "th");
    url.searchParams.set("limit", String(MAX_RESULTS));

    lastRequestStartedAt = Date.now();
    const response = await fetch(url, {
      headers: { Accept: "application/geo+json, application/json" },
      cache: "default",
      referrerPolicy: "strict-origin-when-cross-origin",
    });
    if (!response.ok) throw new Error("Place search service is unavailable.");

    const results = parsePhotonSearchResponse(await response.json());
    cacheResults(cacheKey, results);
    return results.map((result) => ({ ...result }));
  });

  requestQueue = task.then(() => undefined, () => undefined);
  return task;
}
