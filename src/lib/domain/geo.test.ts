import { describe, expect, it } from "vitest";
import { buildDirectionsUrl, haversineMeters } from "./geo";

describe("haversineMeters", () => {
  it("returns zero for the same validated point", () => {
    expect(haversineMeters({ lat: 13.7563, lon: 100.5018 }, { lat: 13.7563, lon: 100.5018 })).toBe(0);
  });

  it("calculates straight-line distance and is symmetric", () => {
    const origin = { lat: 0, lon: 0 };
    const destination = { lat: 0, lon: 1 };

    expect(haversineMeters(origin, destination)).toBeGreaterThan(111_000);
    expect(haversineMeters(origin, destination)).toBeLessThan(111_300);
    expect(haversineMeters(origin, destination)).toBe(haversineMeters(destination, origin));
  });

  it("handles valid coordinate boundaries and an antipodal pair", () => {
    expect(haversineMeters({ lat: 90, lon: 180 }, { lat: -90, lon: 0 })).toBeGreaterThan(20_000_000);
    expect(haversineMeters({ lat: 90, lon: -180 }, { lat: 90, lon: 180 })).toBe(0);
  });

  it.each([
    [{ lat: Number.NaN, lon: 0 }, { lat: 0, lon: 0 }],
    [{ lat: 0, lon: Number.POSITIVE_INFINITY }, { lat: 0, lon: 0 }],
    [{ lat: 90.01, lon: 0 }, { lat: 0, lon: 0 }],
    [{ lat: 0, lon: -180.01 }, { lat: 0, lon: 0 }],
  ])("rejects invalid coordinates", (origin, destination) => {
    expect(haversineMeters(origin, destination)).toBeNull();
  });
});

describe("buildDirectionsUrl", () => {
  it("creates a Google Maps directions URL with validated coordinate pairs", () => {
    const url = buildDirectionsUrl(
      { lat: 13.75, lon: 100.5 },
      { lat: 13.76, lon: 100.51 },
    );

    expect(url).not.toBeNull();
    const parsed = new URL(url ?? "");
    expect(parsed.origin).toBe("https://www.google.com");
    expect(parsed.pathname).toBe("/maps/dir/");
    expect(parsed.searchParams.get("api")).toBe("1");
    expect(parsed.searchParams.get("origin")).toBe("13.75,100.5");
    expect(parsed.searchParams.get("destination")).toBe("13.76,100.51");
  });

  it("does not create a directions URL for invalid coordinates", () => {
    expect(buildDirectionsUrl({ lat: 91, lon: 100 }, { lat: 13, lon: 100 })).toBeNull();
    expect(buildDirectionsUrl({ lat: 13, lon: 100 }, { lat: 13, lon: Number.NaN })).toBeNull();
  });
});
