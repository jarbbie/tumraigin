# Product specification summary

**Status:** P0 scope agreed on 2026-10-30. This is a supporting implementation reference; [`../document.md`](../document.md) remains the product and domain source of truth.

## Problem and user

Tumraigin helps Bangkok home cooks choose meals that fit a checkout budget, account for ingredients they already own, and plan a grocery stop. The primary prototype persona is Mr. A, an office worker who cooks several times per week.

## Agreed v0.1 journey

1. Start in a named demo area without asking for location permission. The default is Phaya Thai work/current; On Nut is the home option. Neither represents the user's actual address.
2. Browse at least 8 reviewed Thai-inspired recipes supported by at least 20 normalized ingredients.
3. Set maximum checkout cash, minimum protein per serving, and hard dietary exclusions. Recommendations must respond to the input and explain eligibility.
4. Select one recipe batch, inspect per-serving nutrition estimates and provenance, then enter pantry quantities.
5. Calculate shortages, whole-pack purchases, checkout cash, and package leftovers from ingredient quantities and reviewed simulated offers.
6. Inspect candidate store cards and directions. Label demo price/offer assumptions; branch stock stays unknown.

## Product rules

- Calculations use ingredient quantities and pure deterministic domain functions; no precomputed recommendation, nutrition, price, or basket totals.
- Checkout cash is the budget measure. Consumption cost is separate and informational.
- Money uses integer satang internally; quantities use edible grams.
- Unknown nutrients remain unknown. A missing offer makes the basket incomplete rather than free.
- Demo retailer offers do not establish real retailer pricing or branch availability. Locations do not prove stock.
- The journey runs from local fixtures without account, GPS, external APIs, or a hosted database.
- Nutrition is approximate and not medical advice or allergy certification.

## P0 boundaries

One selected recipe batch is in scope. Three-meal selection, live OSM lookup and geolocation, map rendering, multi-store optimization, and additional micronutrients are deferred to P1 or later as listed in [`../BACKLOG.md`](../BACKLOG.md).

Detailed routes and visible states are in [`ui-specs.md`](./ui-specs.md). Domain entities, calculations, provenance, and privacy requirements remain in [`../document.md`](../document.md).
