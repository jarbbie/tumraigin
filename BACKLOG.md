# BACKLOG.md — Tumraigin YWC21 Implementation Backlog

> Created: **2026-10-29**; map-first product direction revised **2026-10-31**, Thailand time. Interview: **2026-10-31**.
> Method: **SDLC with very short, dependency-ordered vertical slices**.  
> Product and domain authority: `document.md`. Supporting feature/API/UI/test references: `docs/specification.md`, `docs/api-spec.md`, `docs/ui-specs.md`, and `docs/tests.md`. Codex rules: `AGENTS.md`.

## Status legend and operating rules
- `[ ]` Todo; `[x]` Done (acceptance criteria verified); mark `[!]` Blocked or `[~]` Partial **in the task heading** when appropriate, but keep checkbox empty until done.
- **P0:** demo/release blocker. **P1:** stretch after P0. **P2:** post-interview only.
- Each task has **Dependencies**, **Deliverables**, **Acceptance**, and often **Tests**. Codex should not start a blocked task.
- Keep actual commands and verification evidence in a short note under the relevant task as work progresses.
- Task IDs are stable. **Do not mark tasks done merely because code exists.**
- Recommended working loop: choose next unblocked task -> inspect -> implement -> test -> owner reviews/understands -> update backlog.

## Milestones / release gates

| Gate | SDLC phase | Required result | Target |
| --- | --- | --- | --- |
| G0 | Requirements/design | Agreement on P0, data truth labels and core data contracts | Oct 29 night |
| G1 | Implementation, vertical slice | Map-first saved locations, core meal calculations, shopping list, shadcn/ui foundation | Oct 30 early |
| G2 | Implementation, integration | Skippable preferences, source labels, selected-place store candidates and fallback states | Oct 30 |
| G3 | Verification/deployment | Test/build pass, mobile smoke test, real public HTTPS URL and GitHub repo | Before Oct 31 interview |
| G4 | Presentation | Owner can explain core math, architecture, provenance, trade-offs and limitations | Interview day |

**Critical-path feature freeze:** If G1 or G2 is delayed, cut all P1 work. The map-first saved-location step is P0; if its tiles fail, show the saved-location list and named demo-area fallback so meal planning can continue. If product data is incomplete, display coverage/unknown rather than inventing totals. Under no circumstance abandon the end-to-end vertical slice.

---

# Phase 0 — Requirements and analysis

### [x] REQ-01 (P0) Confirm v0.1 scope and trade-offs
- **Dependencies:** None.
- **Deliverables:** Review `document.md`; freeze P0; decide two demonstrative location anchors (work/current and home) and explicit product-data disclosure.
- **Acceptance:** Owner agrees that demo prices/stock are not real branch facts; budget means checkout cash; GPS is optional; at least 8 recipes and 20 ingredients planned.
- **Review questions:** What is the problem? Who is Mr. A? What is *not* supported?
- **Completed (2026-10-30):** Owner explicitly agreed (“I agree, you may start now”) to the scope in `document.md` §14: Phaya Thai work/current demo area and On Nut home demo area; checkout cash budget; optional GPS; minimum 8 recipes/20 ingredients; simulated offers with unknown branch stock.
- **Current status:** The named demo-anchor-first journey and optional-map decision were superseded by the owner's REQ-03 amendment on 2026-10-31; the 8-recipe/20-ingredient and data-honesty requirements remain.
- **Verification evidence:** Read `AGENTS.md`, `document.md`, and `BACKLOG.md`; inspected all workspace files. Only these three documents exist. `README.md` is absent and `git status --short` reports that this is not a Git repository. No application/package scripts exist, so lint, typecheck, tests, build and browser smoke checks are not applicable to this requirements-only change. Reviewed proposal against REQ-01 acceptance criteria; each required decision is explicitly listed for agreement.
- **Owner understanding / trade-off:** Mr. A selects an affordable meal and buys pantry-adjusted whole packs. Local fixtures provide a reproducible demo with real calculations; simulated catalog coverage cannot guarantee real shop prices or stock.

### [x] REQ-02 (P0) Define core user journeys and edge states
- **Dependencies:** REQ-01.
- **Deliverables:** Navigation/screens and written golden-path + GPS-denied + no-offer + empty-filter cases.
- **Acceptance:** Every critical action maps to visible screen/state and acceptance criteria in the spec; P1 extras separated.
- **Verification evidence (2026-10-30):** Added `document.md` §5 REQ-02 interaction contract: route/action/visible-result matrix linked to requirement IDs, six-step golden path, edge-state/recovery matrix, shared-session behavior and explicit P1 boundaries. Reviewed coverage for discovery, filters, details, selection/removal, pantry, pack basket, store directions and disclosures, including GPS-denied, no-offer and empty-filter scenarios. Read back the edited sections. No application/package scripts exist; lint/typecheck/test/build and browser verification are not applicable yet. This verifies written requirements, not implemented UI behavior.
- **Owner understanding / trade-off:** Shared session inputs feed the same calculations across screens, so pantry edits change both eligibility and checkout. Refresh persistence is deferred; QA will verify actual behavior during implementation.

### [x] REQ-03 (P0) Reframe Tumraigin as a home-cooking planning helper
- **Dependencies:** REQ-02.
- **Deliverables:** Update the product promise, visible hero copy, map-first four-step journey, local saved-location privacy rule, supporting UI/API/test references, and backlog sequence.
- **Acceptance:** The visible product promise and `document.md` agree and stay consistent with `AGENTS.md`, `README.md`, and `docs/`; map pins are manual user choices, preferences are skippable, the map has an explicit fallback, and a user pin is never confused with a store or verified inventory.
- **Verification evidence (2026-10-31):** Read the current source of truth and supporting requirements before editing. Updated the main document, privacy instructions, UI routes/states, API boundary, manual QA flow, README positioning, visible hero copy, and backlog. Cross-checked the four requested steps and saved-location rules across all files. Read the official OSM tile usage and copyright pages to document visible attribution, policy compliance, and the fact that the tile provider sees the viewed map area. Ran `pnpm lint`, `pnpm typecheck`, `pnpm test` (11 passed), and `pnpm build` after the copy change.
- **Owner teach-back:** Product input is the owner's four-step journey; it becomes a current user promise, requirements, privacy boundary, and ordered backlog. Explicitly saved map pins stay in browser storage; a map pin is not a store. No domain calculations changed, so numeric tests do not apply to this requirements-and-copy change. The trade-off is an external tile dependency for map viewing, mitigated by a saved-list/demo-area fallback.

# Phase 1 — System and data design

### [x] DES-01 (P0) Bootstrap strict TypeScript Next.js project
- **Dependencies:** REQ-01.
- **Deliverables:** pnpm Next.js App Router project, Tailwind, ESLint, `typecheck` and test scripts, Vitest setup, `@/*` alias pointing to `./src/*`, `.gitignore`, basic README. Component library is initialized in `DES-UI-01`.
- **Acceptance:** Local page renders; `pnpm lint`, `pnpm typecheck`, `pnpm test`, and `pnpm build` are defined and can run (empty initial test suite okay if configured responsibly); no secrets committed.
- **Tests:** Production build and smoke open.
- **Progress (2026-10-30):** Added the Next.js App Router, strict TypeScript, Tailwind CSS v4/PostCSS, `@/*` alias, ESLint/Vitest configs, package scripts and a Thai-first scaffold page. Dependency installation now succeeds and `pnpm-lock.yaml` is present. Added a direct `ReactNode` layout prop type so standalone typechecking works, and set ESLint's React version from the installed React package to avoid its ESLint 10 auto-detection incompatibility. The build script uses Next's supported Webpack mode.
- **Verification evidence:** `pnpm install`, `pnpm lint`, `pnpm typecheck`, and `pnpm build` pass. `pnpm test` exits 0; Vitest reports no test files, which is acceptable for this bootstrap task. `pnpm start --hostname 127.0.0.1 --port 3100` started the production server; an HTTP smoke request returned 200 and the response contained the expected Thai heading and page copy. `pnpm build` uses Webpack because this sandbox denies the worker-port binding Turbopack requests.
- **Owner understanding / trade-off:** Next.js App Router owns page routing and rendering; Tailwind utilities style the minimal Thai-first shell. The layout uses the stable React `ReactNode` type rather than a Next-generated global so `pnpm typecheck` works before a build. The lint config reads React's installed version instead of duplicating it. Webpack keeps the production build working in this restricted workspace, with a slower build than Turbopack. The starter avoids remote font fetching; the trade-off is relying on system Thai fonts until product typography is chosen.

### [x] DES-UI-01 (P0) Initialize shadcn/ui and establish Tumraigin UI primitives
- **Dependencies:** DES-01.
- **Deliverables:** Run `pnpm dlx shadcn@latest init` in the initialized Next.js project. Install the small initial set with `pnpm dlx shadcn@latest add button card input label badge checkbox` (remove any unused primitives if requirements change). Configure/preserve Tailwind CSS variables, Thai-first design tokens and Lucide icons; inspect the generated files.
- **Acceptance:** `components.json` exists; `src/components/ui/` has the actually used components; `src/lib/utils.ts` provides `cn`; `@/*` resolves to `./src/*`; global theme styling works. A representative route renders a shadcn/ui `Button`, `Card`, and labeled input without hydration errors. Works on mobile with keyboard focus visible. No domain logic in UI primitives and no `add --all`.
- **Tests:** `pnpm lint`, `pnpm typecheck`, `pnpm build` (where configured), plus manual keyboard/mobile check on the representative UI. Record real results; never mark done on configuration alone.
- **Progress (2026-10-30):** Initialized shadcn/ui with the official CLI using its Base UI/Nova preset; added the six planned primitives and a Thai-first preview route. Customized cream/green theme tokens and kept system Thai fonts so the page does not require remote font fetching.
- **Verification evidence:** `pnpm lint`, `pnpm typecheck`, and `pnpm build` pass. `pnpm test` exits 0 with no test files. Production `GET /` returned HTTP 200 and rendered the heading, card, labeled input, checkbox, and prototype notice. The owner-provided narrow-screen screenshot shows no horizontal overflow. Keyboard focus and checkbox toggling have not yet been confirmed.
- **Progress (2026-10-31):** Reworked the representative route using a Thai-first market-ledger layout, cool blue-green surfaces, pandan-green actions, a papaya-gold location marker and a focused form preview. Replaced the decorative gradient and leaf mark; kept the preview explicit that it does not calculate or filter meals.
- **Verification evidence (2026-10-31):** `pnpm lint`, `pnpm typecheck`, and `pnpm build` passed. `pnpm test` exited 0 with no test files (Vite printed a config-loader warning). Production `GET /` returned HTTP 200. Reviewed headless Firefox screenshots at 1440 × 1000 and 390 × 844; no horizontal overflow, and the form precedes explanatory steps on mobile. Headless Chromium verified the Tab sequence through the logo link, area selector, budget, protein, exclusion input and checkbox, with a visible focus indicator at each stop; Shift+Tab returned to the exclusion input. Space toggled the checkbox false → true → false. At a 390 × 844 viewport, document and body widths were both 390px. The CUA browser host was unavailable, so the checks used local Chromium DevTools instead.
- **Owner understanding / trade-off:** shadcn/ui contributes editable component source under `src/components/ui/`; Base UI supplies the interaction primitives, and `cn` merges Tailwind classes. The theme stays in global CSS variables so components can share product tokens. Local Thai font fallbacks avoid a remote font dependency, with the trade-off that exact typography varies by device. The generated `cn` package requires Node 22, so `package.json` and README now state that runtime minimum. The preview shows layout and primitive styling only; the meal calculations remain in later domain tasks.
- **Owner teach-back:** Explain how shadcn/ui differs from a component package, where generated component code lives, how `cn` and Tailwind class tokens work, and why the app still uses Next.js App Router.

### [x] DES-02 (P0) Typed schema, fixture contracts and validation
- **Dependencies:** DES-01, REQ-01.
- **Deliverables:** `Ingredient`, `Recipe`, `RecipeIngredient`, `ProductOffer`, `Store`, `PantryItem`, `PlanningInput`, `Provenance` types and Zod/validation where appropriate.
- **Acceptance:** Explicit units and satang; no implicit stock; unknown nutrients nullable; all IDs and links validated. Separate `Store` from `ProductOffer` and `Ingredient`.
- **Tests:** Invalid pack size, malformed coordinates, duplicate IDs and unknown ingredient references rejected.
- **Progress (2026-10-31):** Added typed domain contracts in `src/types/` and pure runtime validators in `src/lib/data/`; no new dependency or production fixture values were introduced.
- **Verification evidence (2026-10-31):** `pnpm install --offline --frozen-lockfile`, `pnpm lint`, `pnpm typecheck`, `pnpm test`, and `pnpm build` passed in the isolated DES-02 worktree. Vitest ran 11 tests and printed the existing Vite config-loader warning. Coverage includes pack size, coordinates, duplicate IDs, unknown recipe/offer/planning references, integer satang, unknown nutrients, stock status, and invalid pantry/budget inputs.
- **Owner teach-back:** Raw fixture or planning input enters as `unknown`; parsing checks shape, units, provenance and numeric bounds, then a reference pass checks IDs and links. Success returns typed records; failure returns path-specific issues and no partial dataset. Unknown nutrient values stay `null`. Validation is linear in entities plus references, using `Set` lookups for uniqueness and links; tests prove both accepted unknowns and rejected malformed values/links.

### [x] LOC-01 (P0) Interactive map and saved user locations
- **Dependencies:** REQ-03, DES-UI-01.
- **Deliverables:** Client-rendered, interactive map on the first screen; manual map pin or keyboard coordinate entry; name and save locations in browser `localStorage`; select, rename, delete-one, and clear-all actions; a neutral demo-area fallback.
- **Acceptance:** Map appears first without GPS. Reload retains explicitly saved locations on the same browser. Saved pins remain separate from `Store` fixtures and never imply a retailer or stock. OSM attribution/ODbL link is visible if OSM data is used; tile requests follow the provider policy and request only the visible map. Tile failure leaves saved locations and the demo area usable.
- **Tests:** Coordinate bounds; pin selection and naming; reload persistence; selection/edit/delete/clear; no `navigator.geolocation` call; map failure fallback; no horizontal overflow or keyboard dead-end.
- **Privacy:** Tile requests disclose the viewed viewport to the provider; app APIs and analytics receive no saved-location record. No geocoding/autocomplete.
- **Implementation:** Added a Leaflet 1.9.4 map in a client-only module, manual point selection and labeled coordinate entry, a named demo-area reset, and versioned browser storage for selected/saved user locations. The list supports select, rename, delete-one, and clear-all. Storage shape and world coordinate bounds are validated before use. No geocoder, GPS, app API or store data was added.
- **Verification evidence (2026-10-31):** `pnpm lint`, `pnpm typecheck`, `pnpm test` (21 passed, including 10 saved-location validation tests), and `pnpm build` passed. A Firefox production-preview session verified: actual map pointer click populates coordinates; a named place saves and remains selected after reload; a second place can be selected/renamed/deleted; clear-all requires confirmation and clears storage; a preload spy observed zero geolocation calls. A WebDriver BiDi network intercept failed four OSM tile requests; the visible failure message appeared and the map region, coordinate inputs, and demo-area action remained available. Keyboard Tab reached map controls and coordinate fields; keyboard entry populated coordinates with a visible focus ring. At a 390 px viewport, page scroll width was 378 px (no horizontal overflow); the map and OSM attribution were visible in the reviewed phone screenshot. The browser's normal OSM tiles also rendered during screenshot review.
- **Owner teach-back / trade-off:** A map click or coordinate input supplies latitude/longitude, the user supplies a label, and only an explicit save adds a typed `SavedLocation` to a versioned localStorage record. Reading starts from `unknown`; validation checks the version, unique IDs, non-empty name, world bounds and that the selected ID exists. Saving/editing is O(n) in the small saved list; validation is O(n) using a `Set` for duplicate IDs. Tests prove valid boundary values are accepted and malformed/duplicate/out-of-range data is rejected. The trade-off is reliance on an external tile service for the visual map, with a visible disclosure and coordinate/list/demo fallback if it fails.

### [x] DAT-01 (P0) Curate seed data with provenance
- **Dependencies:** DES-02.
- **Deliverables:** At least 20 normalized ingredients, at least 8 Thai-oriented recipes, reviewed nutrient values, a small product-offer dataset, and a small labeled demo-store fixture. Source URLs/FDC IDs only when verified.
- **Acceptance:** Recipes reference existing ingredients; serving and raw edible quantities consistent; simulated price/stock clearly labeled; do not invent verified USDA IDs. `data/` validates and fixtures are sufficient for 3 distinct budget/protein scenarios.
- **Tests:** Data integrity fixture test, ingredient total sanity checks, `null` micronutrient coverage accepted.
- **Contingency:** If valid USDA record IDs cannot be verified in time, use clearly labeled **curated_estimate** for nutrition values instead of fabricated citations. Do not claim medically precise numbers.
- **Implementation:** Added 23 normalized ingredient records, eight two-serving Thai-oriented example recipes, synthetic offers for all recipe-used ingredients, three preference input profiles, and a visibly fictitious demo-store point under `src/data/`. Each nutrient record carries the source table ID and URL or the exact USDA SR28 report reference. The data module validates its fixture set at import; no FDC IDs, recommendation results, or precomputed totals are claimed.
- **Verification evidence (2026-10-31):** `pnpm lint` passed; `pnpm typecheck` passed; `pnpm test` passed (27 tests across 3 files; Vitest printed the existing Vite config-loader warning); `pnpm build` passed with Webpack. Fixture tests cover source/null handling, unique references and counts, raw edible amount sanity, simulated offers with unknown stock, offer coverage, demo-store labeling, and distinct budget/protein input profiles.
- **Owner teach-back / trade-off:** Ingredient rows enter as static typed records, then `validateFixtureDataset` checks values, provenance, unique IDs and recipe/offer references before export. Recipes consume raw edible grams and include authored instructions; later calculation functions will scale per-100-g nutrients and pack offers from these inputs. Validation is O(n) in entities and references using `Set` lookups; the tests confirm the seed is accepted and its weights, references and nulls preserve the contract. The trade-off is that the source values are typical composition-table estimates, not measurements of cooked servings; recipes must keep their raw weights and source limitations visible.
- **Reuse limitation:** The ASEANFOODS 2014 source allows attributed noncommercial use and says resale/commercial use, including educational products/services, may incur fees. Confirm permission or replace those values before commercial/educational product use or broader redistribution. See `src/data/README.md`.

# Phase 2 — Domain implementation (highest-priority coding)

### [x] ENG-01 (P0) Nutrition calculation engine
- **Dependencies:** DAT-01.
- **Deliverables:** `calculateRecipeNutrients(recipe, ingredients)` returning batch/per-serving totals plus completeness flags and source references.
- **Acceptance:** Scale quantities from 100 g values; divide by servings; never convert unknown to zero; distinguish kcal, grams and milligrams.
- **Tests:** 100 g/250 g examples, two servings, unknown sodium/iron; zero/invalid quantity handling.
- **Owner teach-back:** Formula, missing nutrient semantics, raw-vs-cooked limitations.
- **Implementation:** Added a pure domain function that validates serving count, positive finite edible grams, ingredient references and source nutrient values; returns batch and per-serving totals, per-nutrient completeness, and stable source references. Unknown required or optional nutrients remain `null`; measured zero remains `0`. No UI or recommendation result is added in this task.
- **Verification evidence (2026-10-31):** `pnpm lint` passed; `pnpm typecheck` passed; `pnpm test` passed (35 tests across 4 files, including 8 nutrition-engine tests; Vitest printed the existing Vite config-loader warning); `pnpm build` passed with Webpack.
- **Owner teach-back / trade-off:** For each raw edible amount `q` grams and a source value `n` per 100 g, the function adds `(q / 100) * n` to the batch; per serving is batch divided by the positive integer serving count. If any used ingredient lacks a nutrient, that nutrient's result is `null` and its completeness flag is false, while complete nutrients still calculate normally. Validation and scaling take O(R × K + N) plus O(U log U) to sort source references, where R is recipe items, K is the fixed eight nutrients, N is the ingredient list, and U is unique used ingredients. Tests verify the 100 g and 250 g scales, serving split, missing micro propagation, known zero, invalid inputs, duplicate entries and sources. The trade-off is that the report preserves source-basis raw values and does not model cooking yield, retention or cooked weight.

### [x] ENG-02 (P0) Pantry shortage & multi-recipe aggregator
- **Dependencies:** DAT-01.
- **Deliverables:** `aggregateRequiredIngredients`, `subtractPantry` pure functions.
- **Acceptance:** Shared ingredient quantities combine across selected recipe batches; subtract pantry **once**; shortages are >= 0; stable ordering by ingredient ID.
- **Tests:** Two recipes each use rice; pantry removes amount only once; oversupplied pantry gives zero shortage.
- **Implementation:** Added pure functions in `src/lib/domain/pantry.ts`. Recipe ingredient rows aggregate by ID across recipe batches before pantry is applied. Pantry and aggregate demand IDs must be unique; malformed, negative, non-finite, and overflowing quantities return explicit errors. Shortages preserve required/owned grams and clamp at zero; output order is stable by ingredient ID. No UI wiring or persistence was added.
- **Verification evidence (2026-10-31):** `pnpm lint` passed; `pnpm typecheck` passed; `pnpm test` passed (46 tests across 5 files, including 11 pantry tests; Vitest printed the existing Vite config-loader warning); `pnpm build` passed with Webpack.
- **Owner teach-back / trade-off:** Each selected recipe batch supplies raw edible grams per ingredient; a `Map` sums repeated IDs, then the combined totals are sorted for deterministic output. `subtractPantry` receives that unique demand and a unique pantry list, then calculates `max(requiredGrams - pantryGrams, 0)` once per ingredient. Aggregation is O(T + U log U), where T is recipe ingredient rows and U is unique ingredients; subtraction is O(R + P + R log R), where R is required ingredients and P is pantry rows. Tests show two rice demands of 150 g and 100 g become 250 g, then 100 g in pantry leaves 150 g to buy; a larger pantry amount leaves zero shortage. The trade-off is strict rejection of duplicate pantry/demand rows so callers must preserve the validated planning-input contract.

### [x] ENG-03 (P0) Package purchase / cost engine
- **Dependencies:** ENG-02, DAT-01.
- **Deliverables:** `calculatePackPurchase` and `buildShoppingBasket` using example offers and per-chain candidate coverage.
- **Acceptance:** Integer satang; `ceil` pack count; leftovers displayed; separate checkout and consumed-portion estimates; missing offers produce **incomplete** cost rather than zero. Chain-level offers do not imply branch stock.
- **Tests:** 0, 250 g, 251 g, 500 g with 250 g pack; multiple ingredient costs; missing offer; pantry impacts basket.
- **Implementation:** Added `calculatePackPurchase` and `buildShoppingBasket` in `src/lib/domain/shopping.ts`. Checkout uses whole-pack prices; consumed-portion estimates are rounded to the nearest satang. Chain candidates choose the lowest whole-pack checkout outlay per ingredient, then break ties by leftover grams and offer ID. Missing positive-shortage offers produce `null` full totals plus known subtotals and coverage counts; zero shortages need no offer. Offer stock remains `unknown`; no branch inventory is inferred.
- **Verification evidence (2026-10-31):** `pnpm lint` passed; `pnpm typecheck` passed; `pnpm test` passed (61 tests across 6 files, including 15 shopping tests; Vitest printed the existing Vite config-loader warning); `pnpm build` passed with Webpack.
- **Owner teach-back / trade-off:** Given shortage `s`, pack quantity `q`, and price `p` in satang, the engine buys `ceil(s / q)` packs, charges packs × `p` at checkout, calculates leftover grams, and estimates the consumed portion as `round((s / q) × p)` satang. Pack arithmetic is O(1). Basket construction checks offers for each candidate chain and ingredient, then sorts lines and offer choices for stable output; its current scan is O(C × R × O) for C chains, R required ingredients, and O offers, plus sorting. Tests cover 0/250/251/500 g against 250 g packs, multi-ingredient totals, missing offers, pantry-covered ingredients, and chain coverage. The trade-off is choosing the lowest cash outlay within each chain, even when a larger package has a lower per-gram price, because checkout cash is the budget measure.

### [x] ENG-04 (P0) Explainable deterministic recipe eligibility and ranking
- **Dependencies:** ENG-01, ENG-03.
- **Deliverables:** `rankRecipes`/eligibility function with budget, minimum protein, exclusion flags and explanation strings.
- **Acceptance:** Hard exclusions work; budget compares **checkout** prices; incomplete data is not treated as free; stable sort order; displays recommendations and reasons.
- **Tests:** Budget threshold, protein threshold, exclusions, unknown data, stable ties and empty results.
- **Implementation:** Added `rankRecipes` in `src/lib/domain/rank-recipes.ts`. Each recipe reuses the nutrient, pantry, and shopping engines. Exclusions, known below-goal protein, and known over-budget checkout are ineligible; unknown protein or missing complete checkout remains visible as `unknown` and cannot pass a constraint. Skipped preferences leave every recipe eligible. Deterministic ordering is eligibility status, protein descending when a goal is set, complete checkout cost ascending, then recipe ID. Updated `PlanningInput` and its validator with optional supported `excludedTags` to close the product-contract gap.
- **Verification evidence (2026-10-31):** `pnpm lint` passed; `pnpm typecheck` passed; `pnpm test` passed (71 tests across 7 files, including 9 ranking tests and exclusion-contract validation; Vitest printed the existing Vite config-loader warning); `pnpm build` passed with Webpack.
- **Owner teach-back / trade-off:** Each recipe flows through the same per-serving nutrition, ingredient aggregation, one-time pantry subtraction, and per-chain whole-pack basket functions used by the shopping plan. The ranker assesses a protein goal only when its per-serving value is complete, and a checkout budget only when a complete single-chain basket exists. Failed hard constraints become ineligible; unavailable evidence becomes unknown and stays visible, never an automatic pass. Results sort lexicographically by status, protein when requested, checkout cash, and stable recipe ID, avoiding arbitrary weighted magic numbers. Cost is dominated by per-recipe basket offer matching plus a final O(R log R) sort for R recipes; the reviewed fixture catalog is small. The trade-off is that unknown results remain inspectable but are not labeled eligible under the requested constraint.

### [x] UX-01 (P0) End-to-end vertical slice: map -> preferences -> meal plan -> shopping list
- **Dependencies:** REQ-03, LOC-01, DAT-01, ENG-01, ENG-02, ENG-03, ENG-04.
- **Deliverables:** Mobile-first optional Preferences, Meal Choices/Plans, Recipe Details, and Shopping List UI, composed from shared shadcn/ui primitives and the four-step product journey.
- **Acceptance:** A new visitor without sign-up can skip preferences or set budget/protein/exclusions -> compare meal choices -> inspect details -> choose a plan -> change owned ingredient quantities -> see **recomputed** nutrients/shortages/checkout packs and cost. Skipping means no hidden constraint. No fake precomputed totals. Form controls are labeled and keyboard-operable; design remains Thai-first and branded, not a default shadcn demo.
- **Implementation:** Added a shared planning session provider across routes; connected map-first navigation to optional budget/protein/exclusion/pantry inputs; rendered computed, explainable meal choices; added source-aware recipe details; and displayed pantry-adjusted ingredient shortages, whole-pack quantities, checkout cash and consumed cost. The selected meal can be removed to return the shopping list to its empty state. Updated the visible promise to “ตัวช่วยการวางแผนทำอาหารกินเองของคุณ” and brought the README/UI reference up to date. Planning session state resets on refresh; named places keep their existing local browser persistence.
- **Verification evidence (2026-10-31):** `pnpm lint`, `pnpm typecheck`, `pnpm test` (71 tests / 7 files), and `pnpm build` passed. All implemented routes returned HTTP 200. A headless Firefox golden-path walkthrough verified skip -> all 8 meals -> recipe details -> selection -> shopping list. Editing rice pantry from 0 to 100 g reduced 120 g demand to 20 g, required one 1,000 g simulated pack and showed 980 g leftover; editing to 120 g removed that pack and changed checkout from ฿160.00 to ฿105.00. Setting ฿170 budget, 10 g protein and excluding pork updated meal choices while preserving the existing selection. Reviewed 390 × 844 phone screenshots; a 488 px browser content-width check confirmed equal viewport/document/body widths. No hydration errors or runtime warnings after fixing linked Button semantics; the existing Vitest Vite config-loader warning remains.
- **Owner teach-back / trade-off:** Inputs are validated preferences, one selected recipe ID and pantry grams held in the shared provider. `rankRecipes` recalculates nutrition, pantry shortages and per-chain pack baskets from the fixture recipe and ingredient data. The recipe screen shows per-serving values and source coverage; the shopping screen shows the same calculation result with required/owned/shortage grams and package leftovers. A pantry edit changes purchase quantities and cost but leaves the nutrition of the chosen recipe unchanged because the recipe itself did not change. Ranking scans each recipe against the small fixture offer set and sorts the results; no weighted “recommendation score” or stored output was added. The trade-off is that planning inputs reset on refresh, while named places persist in this browser.

# Phase 3 — Stores, provenance and product polish

### [x] GEO-01 (P0) Demo-area store discovery and directions
- **Dependencies:** UX-01, LOC-01, DAT-01.
- **Deliverables:** Candidate store cards for the selected saved location or named demo area, approximate straight-line distances and external directions links.
- **Acceptance:** No geolocation prompt at launch; saved user pins and physical store fixtures are distinct; no false branch-stock claims; store fixture provenance is explicit; directions link uses validated coordinates. Tile/map failure never hides the store list.
- **Tests:** Coordinates validated; link opens intended map; no API connection needed for demo.
- **Implementation:** Added `/shops` with a candidate card sourced from the validated store fixture, selected-location lookup using the shared localStorage key, and named demo-area fallback for missing, blocked, or malformed saved state. Added pure `haversineMeters` and validated Google Maps directions URL helpers, and a shopping-list link to store discovery. The only store remains an explicitly fictitious demo point; its offer count is labeled simulated and branch stock is unknown. Opening directions shares both coordinates with Google Maps.
- **Verification evidence (2026-10-31):** `pnpm lint` and `pnpm typecheck` passed; `pnpm test` passed (80 tests / 8 files); `pnpm build` passed and emitted `/shops`. Headless Firefox at 390 × 844 passed 14 assertions for saved origin, demo fallback, malformed storage fallback, map-independent list visibility, disclosures, no horizontal overflow, and validated directions URL/target. The external link was inspected but not opened, so coordinates were not sent to Google Maps. The only remaining tool warning is Vitest's existing Vite config-loader warning.
- **Owner teach-back / trade-off:** The selected origin comes from a validated browser-saved location; if none is usable, the named demo point is used. The pure Haversine function validates latitude/longitude bounds, converts degrees to radians, computes great-circle distance using the mean Earth radius, and returns meters; invalid coordinates yield `null`. The URL helper rejects invalid points before encoding origin/destination into a Google Maps directions URL. Both calculations are O(1); tests prove zero distance, a known distance, symmetry, bounds, and URL parameters. The trade-off is that the card is a static fictitious point with simulated catalog coverage, so it demonstrates the flow without pretending to identify a nearby physical branch or its inventory.

### [ ] UX-02 (P0) Data transparency, fallback states and accessibility
- **Dependencies:** UX-01, GEO-01, LOC-01.
- **Deliverables:** Visible "Demo prices" label, `/about` data explanation, nutrition source/unknown flags, empty/filter/unpriced/error/permission fallback states; mobile polish.
- **Acceptance:** A reviewer can identify what is real vs simulated within one minute. List remains useful if map fails. Keyboard navigation, input labels, readable contrast, focus indicators and reduced motion are supported.
- **Tests:** Manual accessibility/error checklist; no misleading stock/price labels.

### [ ] GEO-02 (P1) Real OSM store lookup with safe fallback
- **Dependencies:** GEO-01, UX-02; P0 release candidate already working.
- **Deliverables:** User-triggered current-location action and bounded Overpass discovery with server-side validation, cap, caching and fixture fallback.
- **Acceptance:** Explicit permission required; permission denied still works; geographic search constrained; comply with provider policy; separate sourced OSM place data from simulated offers; show OSM attribution.
- **Tests:** Permission denied and rate limit/network failure; radius validation and deduplication.
- **Cut criterion:** Skip if it jeopardizes deployment/test time.

### [ ] ENG-05 (P1) Three-meal consolidated weekly plan
- **Dependencies:** UX-01; complete P0 verified.
- **Deliverables:** Select up to 3 recipe batches and produce one shared shopping basket.
- **Acceptance:** Shared ingredients combined; once-off pantry deduction; cost and nutritional summaries remain consistent; multiple recipes can be removed.
- **Tests:** Two recipes sharing rice/chicken with partial pantry; order independence.

### [ ] ENG-06 (P1) Simple 1-store vs 2-store offer comparison
- **Dependencies:** ENG-03, GEO-01; complete P0 verified.
- **Deliverables:** Compare complete single-chain candidate against at most two-chain split, with explicit extra-stop penalty assumption.
- **Acceptance:** Considers pack costs and stop count; never claims known stock/route ETA; if no feasible coverage, marks plan incomplete.
- **Tests:** Synthetic scenario where one extra stop saves money; scenario where stop penalty dominates.

### [ ] NUT-01 (P1) Source-backed micro-nutrient subset
- **Dependencies:** ENG-01, DAT-01; complete P0 verified.
- **Deliverables:** Sodium/calcium/iron (only if sourced), with unknown coverage marker.
- **Acceptance:** Never claim full micronutrient completeness from partial ingredient records.

# Phase 4 — Verification, deployment and handoff

### [ ] QA-01 (P0) Full verification and regression
- **Dependencies:** UX-02, ENG-01..04, LOC-01, GEO-01.
- **Deliverables:** Passing lint, typecheck, unit tests and production build; complete manual golden path; fix blockers.
- **Acceptance:** No major console errors; mobile end-to-end flow works; arithmetic and provenance labels correct; offline/location-denied fallback demonstrated.
- **Record evidence:** Commands run, result, browser/device tested, known limitations.

### [ ] REL-01 (P0) Deploy public app and publish GitHub source
- **Dependencies:** QA-01.
- **Deliverables:** Accessible HTTPS Vercel (or similar) deployment and public GitHub repository; README containing setup, architecture, actual shipped features, demo/data disclosures, sources/licenses and limitations.
- **Acceptance:** Public link reachable unauthenticated from another device; exact deployed commit matches reviewed source; secrets not committed; sample golden path works on hosted version.
- **Approval:** Only owner authorizes remote repository creation, git push, and deployment.

### [ ] REL-02 (P0) YWC interview demonstration and knowledge check
- **Dependencies:** REL-01.
- **Deliverables:** 90-second demo script, one-page architecture overview, answer sheet for 10 technical questions in `document.md` §13.
- **Acceptance:** Owner personally demonstrates and explains: entity model, nutrition computation, pack rounding, pantry aggregation, rank rules, data provenance, mapping limitations, testing and trade-offs.

### [ ] REL-03 (P1) E2E automated smoke tests
- **Dependencies:** QA-01.
- **Deliverables:** Small browser suite for discover/filter -> select -> pantry -> plan.
- **Acceptance:** Runs against production build or development server and asserts computed values, not screenshots alone.

# Phase 5 — Post-interview backlog (not for Oct 31)

- [ ] **FUT-01 (P2):** Source-approved live retailer product ingestion, freshness checks, authorization/license review and data synchronization.
- [ ] **FUT-02 (P2):** Actual per-branch stock integration *only* with authorized data and meaningful freshness/reliability contracts.
- [ ] **FUT-03 (P2):** PostgreSQL schema for products, observed prices, store branches, inventory snapshots and provenance history.
- [ ] **FUT-04 (P2):** Personalized multi-day meal optimization with expiry, leftover inventory, nutrition bounds and mixed-integer optimization.
- [ ] **FUT-05 (P2):** Home/work/commute-aware routing and realistic travel time using an appropriate authorized routing service.
- [ ] **FUT-06 (P2):** Profile accounts, saved pantry, privacy/export/deletion controls.
- [ ] **FUT-07 (P2):** Real recipe editorial system and culturally accurate Thai cooking/ingredient conversions.
- [ ] **FUT-08 (P2):** Observability, analytics opt-in, performance budget and production security reviews.

---

## Dependency overview

```text
REQ-01 -> REQ-02 -> REQ-03 (product promise and map-first journey)
                         |
                         +--> LOC-01 (map and local saved locations) ----+
                                                                         |
DES-01 -> DES-UI-01 ----------------------------------------------------+--> UX-01
  |                                                                      ^
  +--> DES-02 -> DAT-01 -> ENG-01 (nutrition)                            |
                       +-> ENG-02 (pantry) -> ENG-03 (packs) -> ENG-04 --+
                                                                         |
                                                              GEO-01 (candidate stores)
                                                                         |
                                                                      UX-02
                                                                         |
                                                  QA-01 -> REL-01 -> REL-02

P1 tasks GEO-02, ENG-05, ENG-06, NUT-01 begin only after the core slice is stable.
```

## Task completion note template (copy under completed item)
```text
Verification evidence:
- Files changed:
- Commands run + observed results:
- Manual path tested:
- Owner understanding / trade-off:
- Remaining limitations:
```

## Codex prompts (copy/paste)

### Start the repo / first task
> Read `AGENTS.md`, `document.md`, `BACKLOG.md`, `README.md`, and all applicable references under `docs/`. Inspect the repository. Identify the first highest-priority unblocked P0 task. Before editing, summarize its user value, acceptance criteria, architecture dependencies, and files you plan to change. Then implement **only that task**, add appropriate tests, run available checks, report exact results, and update `BACKLOG.md` only if the acceptance criteria are met. Explain the core design to me in plain English. Do not commit, push, or deploy without permission.

### Continue the next task
> Read `AGENTS.md`, `document.md`, `BACKLOG.md`, `README.md`, and all applicable `docs/` references; inspect `git status` and the current implementation. Suggest the single next unblocked P0 backlog item. Implement only that item with tests and explanation. Preserve source/simulation labels and the core demo fallback. Report checks observed and stop afterward.

### Audit before interview
> Read `AGENTS.md`, `document.md`, `BACKLOG.md`, `README.md`, all `docs/` references, and the current repository. Perform a read-first audit for requirements, numeric correctness, provenance honesty, user privacy, responsiveness, and deployment readiness. Run lint, typecheck, tests and build. Provide evidence-backed blocker list ordered by release risk, a manual walkthrough checklist, and a concise technical interview Q&A. Do not silently mark any task done.

## Final release checklist (owner verifies)
- [ ] Deployed HTTPS URL loads on a different device in a private/incognito session.
- [ ] Repository link available; README and source match deployment.
- [ ] Core journey works when geolocation permission is denied.
- [ ] No product/price/stock is misrepresented as verified.
- [ ] Every displayed cost comes from quantities × demo offers; every nutrient estimate from ingredient data.
- [ ] Checkout vs consumption costs clearly distinguished; pantry effects accurate.
- [ ] No secret keys, identifying location logs, or unlicensed assets.
- [ ] OSM attribution/licensing if map/location data displayed; USDA attribution if used.
- [ ] Build, typecheck, lint and tests observed passing (or documented blockers addressed).
- [ ] Owner can explain the algorithms and limitations without reading a script.
