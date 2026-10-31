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
- At the ENG-02 checkpoint these functions were pure domain logic with no page wiring or persistence. UX-01 later consumes them; planning state remains in React memory.

## ENG-03 package purchase and basket verification (2026-10-31)

- Added tests for 0, 250, 251, and 500 g shortages against a 250 g simulated pack; positive subnormal demand still buys one pack. Consumed-portion estimates round to integer satang.
- Basket tests cover separate checkout/consumed costs across multiple ingredients, per-chain coverage, a positive shortage with a missing offer (null full totals and a known subtotal), pantry-satisfied demand without an offer, and choosing the lower checkout outlay when a bulk pack has a cheaper per-gram price.
- Offers are validated for positive usable pack size, safe integer satang price, and `unknown` stock; no branch stock claim is inferred. Chain and ingredient output ordering is deterministic.
- `pnpm lint`: passed. `pnpm typecheck`: passed. `pnpm test`: passed, 61 tests across 6 files; Vitest printed the existing Vite config-loader warning. `pnpm build`: passed with Webpack.
- At the ENG-03 checkpoint these functions were pure domain logic and shopping-list UI was pending. UX-01 now uses the basket output on the shopping-list route; branch stock remains unknown.

## ENG-04 recipe ranking verification (2026-10-31)

- Added ranking tests for skipped preferences, exact checkout-budget threshold, per-serving protein threshold, hard exclusion tags, unknown protein and incomplete prices, pantry-covered zero-budget baskets, deterministic ranking, empty recipe sets, invalid preferences, and broken ingredient references.
- Ranking reuses the same nutrition, pantry, and package-cost functions. Incomplete checkout or unknown constrained protein produces `unknown`; neither is treated as a passing constraint. Results remain available with explicit Thai reason strings.
- Extended `PlanningInput` with optional `excludedTags` and updated runtime validation to reject duplicate and unsupported tags while preserving omitted preferences as unset.
- `pnpm lint`: passed. `pnpm typecheck`: passed. `pnpm test`: passed, 71 tests across 7 files; Vitest printed the existing Vite config-loader warning. `pnpm build`: passed with Webpack.
- The ranker is wired to meal choices and the shopping-plan summary; preferences and pantry changes recalculate its results.

## UX-01 planning journey verification (2026-10-31)

- Connected the map-first screen to skippable preferences, calculated meal choices, recipe details and a pantry-adjustable shopping list. Planning state survives route navigation but resets on refresh; saved map locations retain their existing browser-only persistence.
- Firefox 159 headless Marionette walkthrough: open the map-first screen, continue to preferences, skip, verify all eight recipe fixtures appear, inspect a recipe's ingredients/nutrition/source coverage, select the plan and open its shopping list.
- Pantry arithmetic walkthrough: for a 120 g rice demand, entering 100 g owned left 20 g to buy, one simulated 1,000 g pack and 980 g remaining. Entering 120 g left zero to buy, removed the rice pack, and reduced checkout cash from ฿160.00 to ฿105.00. This confirms the page uses the shared pantry and whole-pack functions.
- Preference walkthrough: set a ฿170 checkout budget, 10 g protein goal and pork exclusion. Meal choices reflected the budget/protein reasons and removed pork recipes, while keeping the previously selected recipe visible.
- Removal walkthrough: removing the selected meal returned `/shopping-list` to its empty state and recovery link.
- Headless Firefox screenshots at 390 × 844 were reviewed for preferences, meals and recipe details. A browser layout check at a 488 px content width reported equal viewport, document and body widths on the shopping-list and filtered meal screens. No horizontal overflow was visible in the 390 px screenshots.
- `pnpm lint`, `pnpm typecheck`, `pnpm test` (71 tests across 7 files), and `pnpm build` passed. All five implemented routes returned HTTP 200. No hydration errors or runtime warnings were observed after correcting Base UI link semantics. Vitest continues to print the existing Vite config-loader warning.
- The existing LOC-01 walkthrough covers map-click saving, persistence, attribution and tile failure. UX-01 verified the map-first entry and continue action without adding a map-provider integration.

## GEO-01 store discovery and directions verification (2026-10-31)

- Added pure geospatial helpers for validated Haversine straight-line distance and Google Maps directions URL construction. Tests cover identical points, a known one-degree equatorial distance, symmetry, coordinate bounds, antipodes, required URL parameters, decoded origin/destination coordinates, and rejection of invalid points.
- Added `/shops`, which reads the selected saved place from browser storage and falls back to the named demo area when none is selected, storage is blocked, or saved data is invalid. The local candidate card stays available without a map, API request, or GPS prompt.
- The only store fixture is shown as a fictitious demo point, not a physical branch. Its 23 simulated offer records are described as catalog data, never as a branch price or stock claim. The directions disclosure states that the coordinates are shared with Google Maps only after the link is opened.
- Added `/shopping-list` links to the store discovery page, including the empty-plan state.
- Headless Firefox Marionette checked the selected saved-place origin, the demo fallback, malformed saved state, visible demo/stock/privacy labels, a map-independent store list, no horizontal overflow, and the link's separate-tab attributes and decoded Google Maps origin/destination. All 14 assertions passed at the observed 488 px viewport; Firefox had clamped the requested 390 px viewport. The external link itself was inspected without sending coordinates to Google Maps. A true 390 × 844 Chromium run is recorded under QA-01 below.
- `pnpm lint`: passed without warnings. `pnpm typecheck`: passed. `pnpm test`: passed, 80 tests across 8 files; Vitest printed the existing Vite config-loader warning. `pnpm build`: passed and generated `/shops` as a static route.

## UX-02 transparency, fallback, and accessibility verification (2026-10-31)

- Added `/about` with live fixture counts; the required demo notice; nutrition sources, unknown-value handling and calculation method; simulated offers/store point; pack and pantry calculations; source and reuse terms; location storage and external directions privacy; and medical, allergy, inventory and route limitations. Shared navigation exposes it on every route without presenting it as a fifth planning step.
- Added a global reduced-motion media rule and audited the existing labeled inputs, demo-price disclosures, nutrition unknown/source states, empty-filter recovery, unselected shopping-list recovery, and visible error regions.
- Headless Firefox Marionette passed 20 checks covering the disclosure content/counts, source/license/reuse terms, location privacy, calculation notes, no horizontal overflow, four-step navigation, reduced-motion CSS, keyboard-visible focus, header access from `/meals` and `/shopping-list`, labeled preference controls, empty-filter recovery, and invalid-budget error announcement. The observed viewport was 488 px; Firefox had clamped the requested 390 px viewport. True 390 × 844 layout coverage is recorded under QA-01 below.
- Theme contrast checks for light muted text/background, primary/background, foreground/card and primary button text/background measured 5.65:1, 5.93:1, 12.71:1 and 6.52:1. Dark muted text/background and primary button pairs measured 8.95:1 and 7.20:1.
- `pnpm lint`, `pnpm typecheck`, `pnpm test` (80 tests / 8 files), and `pnpm build` passed; the build generated `/about`. Vitest printed the existing Vite config-loader warning.

## QA-01 full verification (2026-10-31)

- On `feature/qa-01-full-verification`, `pnpm lint`, `pnpm typecheck`, `pnpm test` (80 passing tests across 8 files), and `pnpm build` passed. The build generated `/`, `/about`, `/meals`, `/preferences`, `/shopping-list`, and `/shops` as static routes plus `/recipes/[slug]`. Vitest printed its existing Vite config-loader warning.
- Headless Chromium Playwright exercised the local production build at an actual 390 × 844 viewport. All 38 assertions passed, with no horizontal overflow on the map, preferences, meals, shopping list, store discovery, or about screens.
- The golden path selected a point on the interactive map, saved and reused a named location, skipped preferences and saw all eight recipes, inspected nutrition provenance and unknown coverage, selected a recipe, and edited pantry quantities. For the selected 120 g rice demand, 100 g in the pantry left a 20 g shortage, one simulated 1,000 g pack, and 980 g remainder. Raising pantry quantity to 120 g removed that purchase and recalculated checkout from ฿160.00 to ฿105.00. Budget/protein preferences and pork exclusion then changed eligibility as expected; removing the recipe returned the shopping list to its empty state.
- Store discovery used the saved location and labeled the point fictitious with unknown branch stock. The Google Maps directions URL contained the saved origin and fixture destination; it was inspected locally without opening the external link. `/about` remained reachable from the shared header and disclosed data sources and limitations.
- Simulated OpenStreetMap tile failures produced the visible map fallback while coordinate entry, saving, and planning continued. The app made zero geolocation calls, and the only failed browser requests were the deliberately blocked map tiles. The run recorded zero uncaught browser errors and zero unexpected JavaScript console errors. Reduced-motion preference was recognized.
- This checks the P0 fallback when external map imagery is unavailable; it does not claim an end-to-end test with the local app server offline. The core flow intentionally never requests device location, so denied permission is not a step users encounter. QA used a local production preview and headless Chromium, not a hosted release or a physical phone.
- Screenshot evidence from the true 390 × 844 Chromium viewport: `/tmp/tumraigin-qa-shops-real-390.png` and `/tmp/tumraigin-qa-about-real-390.png`.

## REL-01 static release preparation (2026-10-31; partial)

- Next.js now builds static output to `out/`. `generateStaticParams()` emits one recipe details page per validated fixture slug, and `trailingSlash` creates directory-index routes for static hosting. `GITHUB_PAGES_BASE_PATH=/tumraigin` prefixes the generated route links and assets for an account-level GitHub Pages project URL. No runtime API, database, or location service was introduced.
- Added a main-branch GitHub Actions workflow with separate build/deploy jobs and only the Pages permissions required for deployment. Updated `pnpm start` to serve the built static files on loopback, and documented the production preview workflow in README.
- `pnpm lint`: passed. `pnpm typecheck`: passed. `pnpm test`: passed, 80 tests across 8 files (existing Vite config-loader warning). `GITHUB_PAGES_BASE_PATH=/tumraigin pnpm build`: passed and generated all app routes plus all eight `/recipes/[slug]/` pages.
- Headless Chromium at 390 × 844 passed 13 assertions against the static artifact served through `pnpm start` with the `/tumraigin` base path. It loaded the home route/assets, saved a map-picked location despite deliberately blocked tiles, navigated through preferences and all eight meal choices to a pre-rendered recipe and the shopping list, and reported no overflow, browser errors, or HTTP error responses. Network errors were limited to blocked OpenStreetMap imagery; route prefetches canceled after navigation were `net::ERR_ABORTED` while their server responses were HTTP 200.
- Initial state before Sites publication: the canonical source repository was private and its reachable history contained personal non-noreply author metadata and private issue/PR history, so changing visibility would disclose those records. No known provider-token patterns or credential files were found in the tracked repository. This records the original release blocker; the current public Sites deployment and remaining source/hosted-test gates are recorded below.
- Release promotion PR #46 merged the candidate into `main` at `4a38ca79ec1a6b845902696e49c2d717b657ee61`. The PR E2E run (#41146286604) and main-branch E2E run (#41146472677) passed on the static production build.
- GitHub Pages run #41146472684 passed lint, typecheck, all 80 unit tests, and static generation, then failed at `actions/configure-pages@v5` with `Resource not accessible by integration`. Artifact upload and deploy were skipped. The job log showed the build token had only `contents:read` and `metadata:read`. PR #47 added `pages:read` to the build job. The follow-up Pages run (#41147279285) returned `404 Not Found` at `Configure Pages`; Pages still is not configured, and artifact upload/deploy were skipped.
- The public Sites service reports version 1 live with public access at [https://tumraigin.peeranat-0709.chatgpt.site](https://tumraigin.peeranat-0709.chatgpt.site). An unauthenticated HTTPS HEAD request returned HTTP 200. The deployed static artifact was built with the root path, is 2.4 MiB, contains the generated assets and Site manifest only, has no source maps, and had no matches for the high-confidence credential-pattern scan. Its Site artifact commit is `bbcbda5917492ff62c758ce06a869cf8a43f722d`.
- The Site artifact was generated from the reviewed staging app code, but its artifact commit is not the canonical GitHub commit and does not make the canonical source public. GitHub main still contains personal author metadata and the repo's private issues/PR history, so it remains private.
- At the time of the initial deployment note, the public Site had not been browser-tested. The hosted verification below now covers the root-path public deployment.
- The ASEANFOODS table retains its copyright and reuse terms. The project has source attribution, but its repository does not grant a separate open-data license; commercial use and educational products/services require reviewing the source terms and may incur fees.

## REL-01 hosted Site browser verification (2026-10-31)

- Confirmed the public root URL returned HTTP 200 and the Tumraigin page title and current product promise in its HTML.
- Added `tests/e2e/hosted-planning.spec.ts`, `playwright.hosted.config.ts`, `pnpm test:e2e:hosted`, and a GitHub Actions workflow for release PRs to `main` and pushes to `main`.
- Playwright Chromium passed the full hosted journey against `https://tumraigin.peeranat-0709.chatgpt.site`: click the map, name/save a location, reload and confirm it persists locally, skip preferences, see all eight meal choices, inspect recipe details and provenance, select the plan, and verify that 100 g owned rice leaves 20 g to buy in one simulated 1,000 g pack with 980 g remaining and ฿160.00 checkout.
- OpenStreetMap tile requests are deliberately aborted by the browser test. The test verifies the visible tile-failure fallback and that Leaflet still accepts a map click; it does not test the external tile service. No uncaught page errors were observed.
- `pnpm lint`, `pnpm typecheck`, `pnpm test` (80 tests / 8 files), and `pnpm test:e2e` (2 browser tests) passed. The hosted Playwright command also passed against the public Site. Vitest retains its existing Vite config-loader warning.
- This proves the deployed user flow is interactive at the tested URL. It does not establish that the generated Site artifact corresponds to an exact public GitHub source commit; REL-01 remains partial for that source-publication and provenance requirement.
- Release PR #54 merged into main at `4ade64bbd70e22e08bf2c68d132afb8000a3e164`. The main-push production E2E run (#41160630385) and hosted Site smoke run (#41160630388) both passed. GitHub Pages run #41160630328 still failed at `Configure Pages`, so its deploy job was skipped; the separate public Sites deployment remained available and passed the hosted smoke test.
- Post-release history sync PR #56 merged into staging at `8a7ad7c16c538b6052c00c38058978a627ac8d41` with no file changes. Its PR E2E run (#41160694285) and staging-push E2E run (#41160806416) passed. The resulting staging history contains the current main commit as an ancestor.
- Rebuilt the root-path static export from staging commit `23060acad9b21adfc1658d3c8df2292b934941c6` with `pnpm build`; all app routes and recipe pages were generated. Published Sites version 2 from artifact-repository commit `ac72f03f69b9bc4e69d1c9f46804c270b8154d03`. Sites reported the production deployment succeeded at the existing public URL, and confirmed the Site remains public and active.
- After deployment, `rtk env PLAYWRIGHT_HOSTED_URL=https://tumraigin.peeranat-0709.chatgpt.site pnpm test:e2e:hosted` passed one Chromium journey in 10.7 seconds. The first default-sandbox attempt could not start Chromium (`Operation not permitted`); the same check passed when rerun with browser execution permission.

## REL-03 automated production-browser smoke test (2026-10-31)

- Added `tests/e2e/planning.spec.ts` and `playwright.config.ts`. `pnpm test:e2e` builds the static export with the GitHub Pages `/tumraigin` base path, serves it on loopback, and runs one Chromium journey against the production artifact.
- The test applies the pork exclusion, verifies six remaining meal choices and no pork result, opens the egg-and-basil fried rice details, selects that plan, then checks the rendered shopping values. With 100 g rice owned it shows a 20 g shortage, one simulated 1,000 g pack, 980 g remaining and ฿160.00 checkout. At 120 g owned it shows no rice purchase and ฿105.00 checkout.
- The test passed using Playwright Test 1.64.1 and Chromium 156.0.8078.4. It recorded no uncaught page errors. It begins at the preferences step, so it makes no map-tile request and does not replace the separate QA-01 map/fallback walkthrough.
- Added `.github/workflows/e2e.yml` to run the production smoke test for pull requests and pushes to `staging` and `main`; the workflow installs the matching Chromium browser before running it.
- `pnpm lint`: passed. `pnpm typecheck`: passed. `pnpm test`: passed, 80 tests across eight files (Vitest still prints the existing config-loader warning). `pnpm build`: passed. `pnpm test:e2e`: passed, one browser test after a successful static build.
- The sandbox denied loopback binding with `EPERM`; the verification was rerun with permission to bind only to `127.0.0.1`. The test server and browser remained local.

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
