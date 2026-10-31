# Product specification summary

**Status:** P0 product direction revised on 2026-10-31. This is a supporting implementation reference; [`../document.md`](../document.md) remains the product and domain source of truth.

## Problem and user

Tumraigin is **“ตัวช่วยการวางแผนทำอาหารกินเองของคุณ”**: a Thai-first helper for planning home-cooked meals from user-selected places through optional preferences and meal choices to a practical shopping list. The primary prototype persona is Mr. A, an office worker who cooks several times per week.

## Current v0.1 journey

1. Open to an interactive map centered on a neutral named demo area. Search by submitting a place name and selecting a result, or place a pin on the map; name and save multiple places. Saved locations remain in this browser and can be selected, renamed, or deleted; do not request GPS on launch.
2. Offer budget, minimum protein, exclusions, and pantry preferences, all skippable. Skipping means no hidden filter.
3. Show meal choices and plan options, with eligibility reasons when preferences exist. Let the user inspect portions, ingredients, nutrition estimates, and provenance before choosing.
4. Generate a shopping list from the selected plan and pantry, calculating shortages, whole-pack purchases, checkout cash, and leftovers.
5. If tiles or Photon search fail, keep map pinning, saved locations, and the demo area usable. If data is incomplete, show unknown or incomplete values.

## Product rules

- Calculations use ingredient quantities and pure deterministic domain functions; no precomputed recommendation, nutrition, price, or basket totals.
- Checkout cash is the budget measure. Consumption cost is separate and informational.
- Money uses integer satang internally; quantities use edible grams.
- Unknown nutrients remain unknown. A missing offer makes the basket incomplete rather than free.
- Demo retailer offers do not establish real retailer pricing or branch availability. Locations do not prove stock.
- A user-saved pin is separate from a physical `Store`; it does not prove a shop, offer, or stock.
- Saved location names and coordinates from an explicitly selected Photon result or map pin stay in browser storage. Place-name queries are sent to Photon only after the user submits the search form; disclose this external request and let users pin sensitive places without sending their name. Tile requests reveal the viewed map area to the tile provider. No saved location record is sent to the app server.
- Meal planning uses local fixtures without an account, GPS, business API, or hosted database. Place-name search and map tiles are external progressive enhancements with map-pin and named demo-area fallbacks.
- Nutrition is approximate and not medical advice or allergy certification.

## P0 boundaries

One selected recipe batch is in scope. Three-meal weekly planning, live store lookup, geolocation, multi-store optimization, and additional micronutrients are deferred to P1 or later as listed in [`../BACKLOG.md`](../BACKLOG.md). Place-name search, interactive map-based location selection, and multi-location saving are P0.

Detailed routes and visible states are in [`ui-specs.md`](./ui-specs.md). Domain entities, calculations, provenance, and privacy requirements remain in [`../document.md`](../document.md).
