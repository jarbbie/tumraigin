# API specification

**Status:** No application API routes are implemented or required for P0. Map tiles are requested directly from the configured tile provider; saved locations and meal planning use browser storage and local fixtures. This file records the boundary that future endpoints must follow; it does not define a live integration.

## P0 data flow

The browser uses reviewed local fixtures and pure domain functions. Recipe discovery, nutrition, pantry subtraction, pack arithmetic, budget eligibility, shopping lists, and saved-location management must not depend on an application API request. Do not add a server database or external place-search API to the P0 flow. Map tiles are a separate, visible external dependency and must have a demo-area/saved-list fallback.

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

- Do not request GPS in the P0 flow. The user manually selects, names, and saves a map point; only that user-submitted record is kept in browser `localStorage`.
- Saved locations are never sent to an app server or logged. Map tile requests reveal the viewed map viewport to the tile provider; disclose this external request in the UI.
- The client requests only tiles needed for the visible map. Follow the provider's current usage and caching policies; do not prefetch or offer offline tile downloads. With OSM data, show visible `© OpenStreetMap contributors` attribution and link the ODbL/license page.
- LOC-01 uses `https://tile.openstreetmap.org/{z}/{x}/{y}.png` with Leaflet 1.9.4, `keepBuffer: 0`, and no tile prefetch. User data is versioned as `SavedLocationState` (`version: 1`, named `locations`, and a nullable `selectedLocationId`) under the browser key `tumraigin.saved-locations.v1`; runtime validation rejects malformed IDs, labels, selection references, and out-of-range coordinates.
- No geocoder is needed for map-pin selection. Do not add client-side autocomplete against public Nominatim.
- Any future OSM store lookup must be bounded, validated, cached, attributed, and compliant with the selected service policy. Store places and retailer-level offers are separate data; a user pin or location result never proves branch inventory.

No endpoint path or provider integration is approved by this planning document. Add concrete request/response contracts here before implementing a network route.
