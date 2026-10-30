# UI specifications

**Status:** UX-01 implements the map-first planning journey through computed shopping lists. LOC-01 supplies saved-place and map-tile fallbacks; preferences, meal ranking, recipe details and pantry-adjusted pack estimates are connected through shared in-memory session state. GEO-01 supplies a local demo-store card and directions link; the full `/about` disclosure remains backlog work.

## Navigation and routes

| Route | Purpose |
| --- | --- |
| `/` | First-step interactive map, choose/name/save locations, and saved-location list. |
| `/preferences` | Optional budget, protein, exclusions, and pantry preferences, with a skip action. |
| `/meals` | Meal choices and plan options; results are unfiltered if preferences were skipped. |
| `/recipes/[slug]` | Recipe servings, ingredient weights, nutrition estimates and provenance. |
| `/shopping-list` | Selected plan, pantry-adjusted quantities, pack count, checkout estimate and leftovers. |
| `/shops` | Candidate store cards, approximate straight-line distances, demo offer coverage and directions for a chosen saved location. |
| `/about` | Full data disclosure, calculation explanation, sources/licenses actually used and known limitations. |

## Visible behavior

- Open `/` with a map centered on a neutral, labeled demo area. Never request GPS on launch.
- Let the user choose a map point, enter a name, and explicitly save it. Show saved locations on the same screen with select, rename, delete-one, and clear-all actions.
- The home screen carries the promise **“ตัวช่วยการวางแผนทำอาหารกินเองของคุณ”** and an explicit continue action after the map and saved-place controls.
- Store only user-submitted names and manually selected coordinates in this browser. Explain that the tile provider receives requests for the visible map area; no saved-location record is sent to the app server.
- Current implementation uses Leaflet 1.9.4 directly in a client-only module and the OpenStreetMap standard tile endpoint. It does not prefetch or download offline tiles and shows Leaflet's visible attribution link to the OpenStreetMap copyright/ODbL page.
- Current implementation stores versioned `SavedLocationState` at `tumraigin.saved-locations.v1`. If storage is unavailable or malformed, the screen reports the state and keeps coordinate entry available; malformed prior data can be explicitly cleared.
- If tiles fail, keep saved locations and a demo-area path visible. The map must not block preferences, meal choices, or the shopping list.
- Give keyboard users a labeled coordinate-entry option alongside map clicking; validate latitude and longitude before saving.
- Preferences are skippable. If skipped, show all available meal choices without silently applying default budget, protein, exclusions, or pantry quantities.
- Meal choices are calculated from recipe and offer fixtures. Show why each result fits or why constrained evidence is unknown. Hide known ineligible recipes while keeping a currently selected recipe visible. When preferences are skipped, show all available choices without a hidden filter.
- Recipe details show per-serving nutrient estimates, null/partial coverage, the raw edible ingredient weights used for calculations, preparation instructions, and grouped source references before a plan is selected.
- Budget means estimated checkout cash and is displayed in baht. Protein goal means grams per serving. Exclusions are hard filters.
- Keep the selected meal plan visible when preferences change; explain when it becomes over-budget or unknown. Selecting a new recipe replaces the current single batch; removing it returns the Shopping List to an empty state.
- Pantry inputs use labeled edible grams. Invalid values show an inline error and do not produce a misleading new total.
- Distinguish required, owned, shortage and leftover grams. Show whole packs and checkout cash; display consumption cost separately.
- Planning preferences, selection and pantry quantities are held in shared React state across routes. A page refresh resets this planning session; explicitly saved places remain in browser storage.
- Display **“ราคาสาธิต · ไม่ได้ตรวจสอบสต็อกสาขา”** (“Demo prices · branch stock not checked”) near prices and store coverage. Do not claim guaranteed inventory.
- Missing offer: show the unpriced ingredient and mark the total incomplete. Missing nutrients: show unknown/partial coverage, never zero by default.
- A saved user pin is not a store, retailer branch, product offer, or proof of branch stock.
- Empty filters, no recipe selection, no complete store candidate, missing data, and optional provider failures each need a helpful recovery action.
- Store distance is labeled approximate straight-line distance. Directions links use validated coordinates and do not imply travel time or route optimization.
- `/shops` reads the selected saved place from the versioned browser storage record; when no place is selected, storage is unavailable, or saved data is invalid, it names the demo-area fallback. The candidate card remains visible without loading a map or calling an API.
- The current store fixture is explicitly a fictitious demo point, not a physical branch. Its offer coverage describes simulated fixture prices only; branch stock remains unknown. A saved pin is only a user-selected origin.
- Opening a Google Maps directions link shares the selected origin and demo destination coordinates with Google Maps. The app does not call a directions API or report driving distance/time.

## Visual and accessibility rules

- Thai-first copy, mobile-first layout, semantic links/buttons/forms, visible keyboard focus, clear labels and readable contrast.
- Map attribution/license is visible and remains on screen; map controls work by touch and keyboard, and non-map location entry stays available.
- Keep the map as a purposeful full-width first step rather than a generic dashboard card. Use map markers for saved choices and clear focus/selection state.
- No horizontal overflow on small phones. Errors and status must be understandable without color alone. Respect reduced-motion preferences.
- Use Tailwind theme tokens and shadcn/ui primitives after `DES-UI-01` is complete. Keep product calculations out of generic UI components.
- No retailer logos or arbitrary hotlinked product images. Do not claim medical or allergy-safe results.

The current four-step journey and full edge-state matrix are maintained in [`../document.md`](../document.md) §5; the earlier REQ-02 journey is explicitly marked historical.

