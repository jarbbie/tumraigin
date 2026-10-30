import { describe, expect, it } from "vitest";
import { validateSavedLocationState } from "./validate-saved-locations";

const validState = {
  version: 1,
  locations: [{ id: "loc-1", label: "บ้าน", lat: 13.7, lon: 100.5 }],
  selectedLocationId: "loc-1",
};

describe("validateSavedLocationState", () => {
  it("accepts named locations on coordinate boundaries and trims labels", () => {
    const result = validateSavedLocationState({
      version: 1,
      locations: [{ id: "loc-north", label: "  จุดเหนือ  ", lat: 90, lon: -180 }],
      selectedLocationId: "loc-north",
    });

    expect(result?.locations[0]).toEqual({
      id: "loc-north",
      label: "จุดเหนือ",
      lat: 90,
      lon: -180,
    });
  });

  it("accepts an empty list without a selected location", () => {
    expect(
      validateSavedLocationState({ version: 1, locations: [], selectedLocationId: null }),
    ).toEqual({ version: 1, locations: [], selectedLocationId: null });
  });

  it.each([
    ["invalid version", { ...validState, version: 2 }],
    ["duplicate ids", { ...validState, locations: [...validState.locations, ...validState.locations] }],
    ["latitude beyond the world", { ...validState, locations: [{ ...validState.locations[0], lat: 90.01 }] }],
    ["longitude beyond the world", { ...validState, locations: [{ ...validState.locations[0], lon: 180.01 }] }],
    ["non-finite coordinates", { ...validState, locations: [{ ...validState.locations[0], lat: Number.POSITIVE_INFINITY }] }],
    ["empty labels", { ...validState, locations: [{ ...validState.locations[0], label: "   " }] }],
    ["unknown selected ids", { ...validState, selectedLocationId: "missing" }],
    ["malformed JSON shape", null],
  ])("rejects %s", (_name, input) => {
    expect(validateSavedLocationState(input)).toBeNull();
  });
});
