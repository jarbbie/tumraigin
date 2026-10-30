# UI specifications

**Status:** Requirements for the planned interface. The current app is only a bootstrap page; these screens and interactions are not yet implemented.

## Navigation and routes

| Route | Purpose |
| --- | --- |
| `/` | Discover recipes, choose Phaya Thai or On Nut demo area, and edit budget/protein/exclusion preferences. |
| `/recipes/[slug]` | Recipe batch, servings, ingredient weights, nutrition estimates and provenance. |
| `/plan` | Selected recipe, pantry editor, shortages, pack count, checkout cash and leftovers. |
| `/shops` | Candidate store cards, approximate straight-line distances, demo offer coverage and directions. |
| `/about` | Full data disclosure, calculation explanation, sources/licenses actually used and known limitations. |

## Visible behavior

- Default to the labeled Phaya Thai demo area. Let the user switch to On Nut without requesting GPS or losing recipe/pantry state.
- Budget means estimated checkout cash and is displayed in baht. Protein goal means grams per serving. Exclusions are hard filters.
- Keep the selected recipe visible when preferences change; explain when it becomes over-budget or unknown. Selecting a new recipe replaces the current single batch; removing it returns Plan to an empty state.
- Pantry inputs use labeled edible grams. Invalid values show an inline error and do not produce a misleading new total.
- Distinguish required, owned, shortage and leftover grams. Show whole packs and checkout cash; display consumption cost separately.
- Display **“ราคาสาธิต · ไม่ได้ตรวจสอบสต็อกสาขา”** (“Demo prices · branch stock not checked”) near prices and store coverage. Do not claim guaranteed inventory.
- Missing offer: show the unpriced ingredient and mark the total incomplete. Missing nutrients: show unknown/partial coverage, never zero by default.
- Empty filters, no recipe selection, no complete store candidate, missing data, and optional provider failures each need a helpful recovery action.
- Store distance is labeled approximate straight-line distance. Directions links use validated coordinates and do not imply travel time or route optimization.

## Visual and accessibility rules

- Thai-first copy, mobile-first layout, semantic links/buttons/forms, visible keyboard focus, clear labels and readable contrast.
- No horizontal overflow on small phones. Errors and status must be understandable without color alone. Respect reduced-motion preferences.
- Use Tailwind theme tokens and shadcn/ui primitives after `DES-UI-01` is complete. Keep product calculations out of generic UI components.
- No retailer logos or arbitrary hotlinked product images. Do not claim medical or allergy-safe results.

The six-step golden path and full edge-state matrix are maintained in [`../document.md`](../document.md) §5.
