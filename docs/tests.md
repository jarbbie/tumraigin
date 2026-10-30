# Test and verification plan

**Status:** Verification plan with implemented fixture-contract coverage. Test infrastructure is configured and dependencies are installed; see current evidence in [`../BACKLOG.md`](../BACKLOG.md).

## Project checks

Run from the repository root after dependencies install:

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

`pnpm test` may pass with an empty initial suite; once domain functions exist, add meaningful numeric and behavior tests before marking those tasks complete.

## Bootstrap verification (2026-10-30)

- `pnpm install`: passed; generated `pnpm-lock.yaml`.
- `pnpm lint`: passed after configuring the React plugin with the installed React version.
- `pnpm typecheck`: passed with explicit `ReactNode` layout props.
- `pnpm test`: exited 0; Vitest reported no test files.
- `pnpm build`: passed with `next build --webpack`; the static `/` route was generated and its HTML contains the expected page text.
- Live server smoke: `pnpm start --hostname 127.0.0.1 --port 3100` started the production server. An HTTP request to `/` returned 200, and the response included the expected Thai heading and page copy.

## DES-UI-01 verification (2026-10-30)

- Ran the official shadcn CLI `init --defaults`, then `add button card input label badge checkbox`; it created `components.json`, `src/lib/utils.ts`, and the six local primitives under `src/components/ui/`.
- Customized the generated theme with Tumraigin cream/green tokens and retained the system Thai font stack; removed the generated Google font import to keep builds independent of remote font fetches.
- `pnpm lint`: passed.
- `pnpm typecheck`: passed.
- `pnpm test`: exited 0; Vitest reported no test files.
- `pnpm build`: passed with Webpack.
- Production route smoke: `/` returned HTTP 200 and included the representative card, labeled budget input, pantry checkbox, and prototype notice.
- Owner-provided narrow-screen screenshot shows the heading, card, and controls fitting without horizontal overflow. The keyboard check (visible focus through Tab/Shift+Tab and checkbox toggling with Space) is still awaiting confirmation; the CUA browser access host remains unavailable in this session.

## DES-UI-01 visual refinement (2026-10-31)

- Reworked the representative `/` page with a Thai-first “market ledger” direction: cool blue-green surfaces, pandan-green actions, a restrained papaya-gold marker and a single form surface instead of a decorative gradient and repeated card styling.
- Kept all controls visibly labeled and marked the form as a nonfunctional preview; no meal, nutrition, price or store results are fabricated.
- `pnpm lint`: passed.
- `pnpm typecheck`: passed.
- `pnpm test`: exited 0; Vitest reported no test files (and printed a Vite config-loader warning).
- `pnpm build`: passed with Webpack.
- Production smoke: `/` returned HTTP 200.
- Headless Firefox screenshots at 1440 × 1000 and 390 × 844 were reviewed. Content stacks without horizontal overflow; the form appears before the explanatory steps on mobile.
- Headless Chromium verified keyboard navigation in production: Tab reached each control in order with a visible focus indicator, Shift+Tab returned to the preceding field, and Space toggled the checkbox false → true → false. At a 390 × 844 viewport, document and body widths were both 390px with no horizontal overflow. The browser automation host was unavailable, so this check used the cached local Chromium binary through its DevTools protocol.

## DES-02 data-contract verification (2026-10-31)

- Added shared TypeScript contracts for ingredients, nutrients, provenance, recipes, recipe ingredients, product offers, stores, pantry items, planning input and the fixture dataset.
- Added runtime validation for fixture shape, canonical grams/satang fields, positive servings/pack sizes/prices, nullable nutrients, HTTPS provenance, dates, coordinate bounds, uniqueness and ingredient references. Planning-input references are checked against the validated recipe and ingredient collections.
- `pnpm install --offline --frozen-lockfile`: passed in the isolated feature worktree.
- `pnpm lint`: passed.
- `pnpm typecheck`: passed.
- `pnpm test`: passed; 11 tests cover accepted unknown nutrients and rejection of zero pack size, invalid coordinates, duplicate IDs, unknown recipe/offer/planning references, fractional satang, claimed stock and invalid pantry/budget values. Vitest printed a Vite config-loader warning.
- `pnpm build`: passed with Webpack.
- No production fixture data was added; test-only data is explicitly labeled as test/simulated.

## LOC-01 map and saved-location verification (2026-10-31)

- Added ten validator tests for empty and populated state, trimmed labels, valid coordinate boundaries, wrong schema version, duplicate IDs, invalid latitude/longitude, non-finite coordinates, blank labels, missing selected IDs, and malformed input.
- `pnpm lint`: passed. `pnpm typecheck`: passed. `pnpm test`: passed, 21 total tests. `pnpm build`: passed with Webpack.
- Firefox production-preview walkthrough: map click populated coordinate fields; a named place saved to localStorage and remained selected after reload; another place was added, selected, renamed, and deleted; clear-all asked for confirmation and persisted an empty state. A preload spy recorded zero GPS calls.
- Simulated map failure by intercepting four OpenStreetMap tile requests. The failure status appeared while the map region, coordinate entry, saved-location list, and demo-area control remained usable.
- Keyboard walkthrough: Tab reached the map region/zoom controls and coordinate fields. Typed a coordinate value through browser keyboard actions and observed the visible focus ring.
- At a 390 px phone viewport, document scroll width was 378 px, so the page had no horizontal overflow. Reviewed a phone screenshot with loaded tiles and the OpenStreetMap attribution link visible.
- Remaining UI walkthrough coverage: after the later preferences, meal, recipe, store and shopping-list tasks are implemented, run the complete golden path in the P0 UI checklist below.

## DAT-01 curated seed-data verification (2026-10-31)

- Added 23 runtime-validated ingredient records, eight two-serving Thai-oriented recipe examples, simulated integer-satang pack offers, three distinct preference input profiles, and one visibly fictitious demo-store point. Every recipe-used ingredient has a simulated offer; no recommendation or nutrition output is stored.
- Cross-checked the ASEAN Food IDs and values used in the fixtures against the official Concise ASEAN Food Composition Tables (2014). Per-100-mL light soy sauce is converted to per-100-g with the recorded density; presumed-zero (`0p`), trace, and missing fields remain `null` when not measured/reported.
- Added fixture tests for entity counts, references, raw ingredient weights per serving, nullable nutrient coverage, simulated price/unknown stock labels, demo-store label, offer coverage, and distinct scenario inputs.
- Documented source attribution and reuse terms in `src/data/README.md`; no USDA FDC ID is claimed. The generic cooking oil estimate cites USDA SR28 NDB No. 42289.
- `pnpm lint`: passed. `pnpm typecheck`: passed. `pnpm test`: passed, 27 tests across 3 files. Vitest printed the existing Vite config-loader warning. `pnpm build`: passed with Webpack.
- Remaining limitation: before commercial or broader redistribution, confirm permission or replace the ASEANFOODS values; its source notes that educational product/service use may incur fees. Recipe instructions are editorial prototype examples and have not undergone independent recipe review.

## ENG-01 nutrition calculation verification (2026-10-31)

- Added unit tests for per-100-g scaling at 100 g and 250 g, two-serving division, per-nutrient completeness, null/unreported sodium and iron, known-zero distinction, duplicate recipe entries, stable source references, missing IDs, duplicate ingredient IDs, negative source values, and zero/non-finite quantities or invalid servings.
- `pnpm lint`: passed. `pnpm typecheck`: passed. `pnpm test`: passed, 35 tests across 4 files; Vitest printed the existing Vite config-loader warning. `pnpm build`: passed with Webpack.
- The calculation remains a pure domain function and is not wired to a screen in this task. It uses raw edible grams and the source's per-100-g values; cooked yield/retention is not modeled.

## ENG-02 pantry aggregation verification (2026-10-31)

- Added unit tests for shared ingredients across recipe batches, repeated rows within one batch, stable ingredient-ID sorting, empty plans, and malformed/overflowing quantities.
- Tests aggregate two recipe batches that need 150 g and 100 g of rice to 250 g, subtract one 100 g pantry quantity to leave 150 g, and clamp oversupplied pantry to zero shortage. They also cover missing/zero pantry quantities and duplicate planning-input rows.
- `pnpm lint`: passed. `pnpm typecheck`: passed. `pnpm test`: passed, 46 tests across 5 files; Vitest printed the existing Vite config-loader warning. `pnpm build`: passed with Webpack.
- The functions remain pure domain logic and are not wired to a page or persistence.

## P0 domain coverage

- Nutrition: per-100-g source values, scaling at 250 g, division by servings, and unknown nutrient propagation.
- Pantry: aggregate shared recipe demand before subtracting pantry once; shortage cannot be negative.
- Pack purchasing: zero demand, exact pack boundaries (250 g / 250 g pack), 251 g / 250 g pack, integer satang, and leftover amount.
- Basket completeness: missing offer produces an incomplete total; pantry-satisfied missing offer has no purchase need.
- Ranking: checkout budget consistency, hard exclusions, unknown nutrients, no suitable recipe, deterministic tie breaks, invalid numeric inputs.
- Provenance: simulated retailer offers never display verified branch stock.
- Geo: valid coordinates, zero distance for identical points, straight-line label, safe directions link.
- Fixtures: unique IDs, valid references, positive quantities/servings/pack sizes, and explicit provenance.

## P0 UI and manual coverage

- Golden path: open map -> choose/name/save a place -> reload and select it -> skip or set preferences -> compare meal choices/plans -> inspect details -> generate shopping list.
- Location controls: map click sets a marker; coordinate entry works by keyboard; saved place can be selected, renamed, deleted, and cleared. Verify the app stores the pin locally and does not call geolocation or send the saved-location list to an app API.
- Map failure/offline: show a clear tile failure message, retain saved places, and allow the demo area and later meal-planning steps.
- Empty filters, missing offer, unknown nutrients, invalid pantry/budget values, no selection, no complete store candidate and data loading/error states.
- GPS is not used in the P0 map-first flow. If a separate P1 current-location action is later added, test denied, unavailable, and timeout recovery.
- Keep map attribution and the ODbL/license link visible at phone and desktop sizes; confirm the configured tile provider's policies are followed.
- Narrow phone and desktop layout, keyboard-only navigation, visible focus, input labels, reduced motion, and no horizontal overflow.
- Core fixtures/calculations remain usable when external APIs are unavailable.

Use the acceptance criteria for the related item in [`../BACKLOG.md`](../BACKLOG.md) and the product data/correctness rules in [`../document.md`](../document.md) as the final authority.
