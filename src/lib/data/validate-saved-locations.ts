import type { SavedLocation, SavedLocationState } from "../../types";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isLatitude(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value) && value >= -90 && value <= 90;
}

function isLongitude(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value) && value >= -180 && value <= 180;
}

function parseSavedLocation(value: unknown): SavedLocation | null {
  if (!isRecord(value)) return null;

  const { id, label, lat, lon } = value;
  if (
    typeof id !== "string" ||
    id.trim().length === 0 ||
    id.length > 100 ||
    typeof label !== "string" ||
    label.trim().length === 0 ||
    label.trim().length > 80 ||
    !isLatitude(lat) ||
    !isLongitude(lon)
  ) {
    return null;
  }

  return { id, label: label.trim(), lat, lon };
}

/** Parse local browser data without trusting its shape or numeric values. */
export function validateSavedLocationState(value: unknown): SavedLocationState | null {
  if (!isRecord(value) || value.version !== 1 || !Array.isArray(value.locations)) return null;

  const locations: SavedLocation[] = [];
  const ids = new Set<string>();

  for (const locationValue of value.locations) {
    const location = parseSavedLocation(locationValue);
    if (!location || ids.has(location.id)) return null;
    ids.add(location.id);
    locations.push(location);
  }

  const selectedLocationId = value.selectedLocationId;
  if (
    selectedLocationId !== null &&
    (typeof selectedLocationId !== "string" || !ids.has(selectedLocationId))
  ) {
    return null;
  }

  return { version: 1, locations, selectedLocationId };
}
