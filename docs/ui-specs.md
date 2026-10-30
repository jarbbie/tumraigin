# UI specifications

**Status:** Requirements for the map-first planning flow. The current app has an initialized shadcn/ui foundation; saved locations and planning interactions are not yet implemented.

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
- Store only user-submitted names and manually selected coordinates in this browser. Explain that the tile provider receives requests for the visible map area; no saved-location record is sent to the app server.
- If tiles fail, keep saved locations and a demo-area path visible. The map must not block preferences, meal choices, or the shopping list.
- Give keyboard users a labeled coordinate-entry option alongside map clicking; validate latitude and longitude before saving.
- Preferences are skippable. If skipped, show all available meal choices without silently applying default budget, protein, exclusions, or pantry quantities.
- Meal choices show why each result is eligible when constraints are set; details provide a way to select a plan.
- Budget means estimated checkout cash and is displayed in baht. Protein goal means grams per serving. Exclusions are hard filters.
- Keep the selected meal plan visible when preferences change; explain when it becomes over-budget or unknown. Selecting a new recipe replaces the current single batch; removing it returns the Shopping List to an empty state.
- Pantry inputs use labeled edible grams. Invalid values show an inline error and do not produce a misleading new total.
- Distinguish required, owned, shortage and leftover grams. Show whole packs and checkout cash; display consumption cost separately.
- Display **“ราคาสาธิต · ไม่ได้ตรวจสอบสต็อกสาขา”** (“Demo prices · branch stock not checked”) near prices and store coverage. Do not claim guaranteed inventory.
- Missing offer: show the unpriced ingredient and mark the total incomplete. Missing nutrients: show unknown/partial coverage, never zero by default.
- A saved user pin is not a store, retailer branch, product offer, or proof of branch stock.
- Empty filters, no recipe selection, no complete store candidate, missing data, and optional provider failures each need a helpful recovery action.
- Store distance is labeled approximate straight-line distance. Directions links use validated coordinates and do not imply travel time or route optimization.

## Visual and accessibility rules

- Thai-first copy, mobile-first layout, semantic links/buttons/forms, visible keyboard focus, clear labels and readable contrast.
- Map attribution/license is visible and remains on screen; map controls work by touch and keyboard, and non-map location entry stays available.
- Keep the map as a purposeful full-width first step rather than a generic dashboard card. Use map markers for saved choices and clear focus/selection state.
- No horizontal overflow on small phones. Errors and status must be understandable without color alone. Respect reduced-motion preferences.
- Use Tailwind theme tokens and shadcn/ui primitives after `DES-UI-01` is complete. Keep product calculations out of generic UI components.
- No retailer logos or arbitrary hotlinked product images. Do not claim medical or allergy-safe results.

The current four-step journey and full edge-state matrix are maintained in [`../document.md`](../document.md) §5; the earlier REQ-02 journey is explicitly marked historical.

