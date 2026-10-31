import { describe, expect, it, vi } from "vitest";
import { parsePhotonSearchResponse, searchPlaces } from "./place-search";

function photonFeature(options: {
  id: string;
  lon?: number;
  lat?: number;
  name?: string;
  city?: string;
}) {
  return {
    type: "Feature",
    geometry: { type: "Point", coordinates: [options.lon ?? 100.5, options.lat ?? 13.7] },
    properties: {
      osm_type: "node",
      osm_id: options.id,
      ...(options.name ? { name: options.name } : {}),
      ...(options.city ? { city: options.city } : {}),
    },
  };
}

describe("parsePhotonSearchResponse", () => {
  it("reads longitude/latitude order and safe display fields from GeoJSON", () => {
    expect(
      parsePhotonSearchResponse({
        type: "FeatureCollection",
        features: [photonFeature({ id: "123", name: "ตลาดนัด", city: "กรุงเทพมหานคร" })],
      }),
    ).toEqual([
      {
        id: "node:123",
        name: "ตลาดนัด",
        context: "กรุงเทพมหานคร",
        lat: 13.7,
        lon: 100.5,
      },
    ]);
  });

  it("rejects malformed features and coordinates outside world bounds", () => {
    expect(
      parsePhotonSearchResponse({
        type: "FeatureCollection",
        features: [
          null,
          photonFeature({ id: "bad-lat", lat: 91 }),
          photonFeature({ id: "bad-lon", lon: -181 }),
          photonFeature({ id: "missing-name", name: "   " }),
        ],
      }),
    ).toEqual([]);
  });

  it("deduplicates source IDs and caps the visible result count", () => {
    const features = Array.from({ length: 7 }, (_, index) =>
      photonFeature({ id: String(index < 2 ? 0 : index), name: `สถานที่ ${index}` }),
    );

    const results = parsePhotonSearchResponse({ type: "FeatureCollection", features });

    expect(results).toHaveLength(5);
    expect(results.map((result) => result.id)).toEqual([
      "node:0",
      "node:2",
      "node:3",
      "node:4",
      "node:5",
    ]);
  });

  it("treats an unexpected response shape as no results", () => {
    expect(parsePhotonSearchResponse({ features: [] })).toEqual([]);
    expect(parsePhotonSearchResponse(null)).toEqual([]);
  });
});

describe("searchPlaces", () => {
  it("requests only when called and reuses a cloned in-memory result for normalized queries", async () => {
    const responseBody = {
      type: "FeatureCollection",
      features: [photonFeature({ id: "cache-test", name: "ตลาดทดสอบ" })],
    };
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => responseBody,
    });
    vi.stubGlobal("fetch", fetchMock);

    try {
      const firstResults = await searchPlaces("ร้านทดสอบ-แคช");
      const requestUrl = new URL(fetchMock.mock.calls[0][0] as string);
      const secondResults = await searchPlaces("  ร้านทดสอบ-แคช  ");

      expect(requestUrl.origin + requestUrl.pathname).toBe("https://photon.komoot.io/api/");
      expect(requestUrl.searchParams.get("q")).toBe("ร้านทดสอบ-แคช");
      expect(requestUrl.searchParams.get("lang")).toBe("th");
      expect(requestUrl.searchParams.get("limit")).toBe("5");
      expect(fetchMock).toHaveBeenCalledTimes(1);
      expect(secondResults).toEqual(firstResults);

      firstResults[0].name = "แก้ไขสำเนาผลค้นหา";
      expect(secondResults[0].name).toBe("ตลาดทดสอบ");
    } finally {
      vi.unstubAllGlobals();
    }
  });
});
