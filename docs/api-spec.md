# API specification

**Status:** No application API routes are implemented or required for P0. Map tiles and user-submitted place-name queries are requested directly from their disclosed providers; saved locations and meal planning use browser storage and local fixtures.

## P0 data flow

The browser uses reviewed local fixtures and pure domain functions. Recipe discovery, nutrition, pantry subtraction, pack arithmetic, budget eligibility, shopping lists, and saved-location management do not depend on an application API request. P0 place-name search is a direct, explicit-submit request from the browser to Photon; it is optional and the map-pin path remains available. Do not add a server database or application API route for this search. Map tiles are a separate, visible external dependency and must have a map-pin/saved-list/demo-area fallback.

## Contract requirements for future endpoints

Before adding an endpoint, document:

- Method, path, purpose, and whether it is P0/P1.
- Request and response schemas, including explicit units and nullable/unknown values.
- Validation and error responses for malformed values and unavailable providers.
- Data source, provenance, freshness, license/usage constraints, and what the response does not prove.
- Cache, request bounds, privacy handling, and fallback behavior.
- Domain and route tests that establish both correct values and failure handling.

All monetary inputs and outputs use integer satang; food quantities use edible grams or explicitly named units. Unknown nutrient values remain `null`; incomplete offers must not become a zero-cost basket. Never accept client-supplied prices as authoritative server data.

## Location and external provider boundary

- Do not request GPS in the P0 flow. The user may select a Photon result or manually pin the map, then name and explicitly save the place; only explicitly saved records and the selected ID are kept in browser `localStorage`.
- Saved-location records and search queries are never sent to an app server or logged. A place-name query is sent to Photon only after submit; map tile requests reveal the viewed map viewport to the tile provider. Disclose both external requests in the UI and offer map pinning for sensitive names/addresses.
- The client requests only tiles needed for the visible map. Follow the provider's current usage and caching policies; do not prefetch or offer offline tile downloads. With OSM data, show visible `© OpenStreetMap contributors` attribution and link the ODbL/license page.
- LOC-01 uses `https://tile.openstreetmap.org/{z}/{x}/{y}.png` with Leaflet 1.9.4, `keepBuffer: 0`, and no tile prefetch. User data is versioned as `SavedLocationState` (`version: 1`, named `locations`, and a nullable `selectedLocationId`) under the browser key `tumraigin.saved-locations.v1`; runtime validation rejects malformed IDs, labels, selection references, and out-of-range coordinates.
- Place-name lookup uses `GET https://photon.komoot.io/api/?q=<query>&lang=th&limit=5`, only on explicit submit. Do not call the search endpoint while typing or send the selected saved coordinates as search bias. Validate the GeoJSON shape and coordinate bounds; show up to five results with OpenStreetMap attribution, cache results in memory, and serialize requests with at least one second between calls per page runtime. This is not a shared cross-visitor rate limit. The public Photon demo is best-effort and may throttle excessive use; no result or network failure must leave map pinning and demo-area fallback usable. Do not use public Nominatim autocomplete.
- Any future OSM store lookup must be bounded, validated, cached, attributed, and compliant with the selected service policy. Store places and retailer-level offers are separate data; a user pin or location result never proves branch inventory.

This external Photon request is not an application endpoint. Any future application route or provider change must add its request/response contract, privacy handling, limits, cache, and tests here before implementation.
