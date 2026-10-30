# API specification

**Status:** No application API routes are implemented or required for the P0 core journey. This file records the boundary that future endpoints must follow; it does not define a live integration.

## P0 data flow

The browser uses reviewed local fixtures and pure domain functions. Recipe discovery, nutrition, pantry subtraction, pack arithmetic, budget eligibility, and demo store cards must not depend on a network request. Do not add a server database or external API dependency to the P0 flow.

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

GPS may only be requested after an explicit user action and is outside P0. Any future OSM lookup must be bounded, validated, cached, attributed, and compliant with the selected service policy. Do not add client-side autocomplete against public Nominatim. Store places and retailer-level offers are separate data; a location response never proves branch inventory.

No endpoint path or provider integration is approved by this planning document. Add concrete request/response contracts here before implementing a network route.
