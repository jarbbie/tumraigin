# BACKLOG.md — Tumraigin YWC21 Implementation Backlog

> Created: **2026-10-29**; shadcn/ui task added **2026-10-30**, Thailand time. Interview: **2026-10-31**.  
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
| G1 | Implementation, vertical slice | Core calculation journey works on screen; shadcn/ui primitives initialized and verified | Oct 30 early |
| G2 | Implementation, integration | Preferences, source labels, demo area and store candidate flow | Oct 30 |
| G3 | Verification/deployment | Test/build pass, mobile smoke test, real public HTTPS URL and GitHub repo | Before Oct 31 interview |
| G4 | Presentation | Owner can explain core math, architecture, provenance, trade-offs and limitations | Interview day |

**Critical-path feature freeze:** If G1 or G2 is delayed, cut all P1 work. If a live map fails, present store cards and external directions. If product data is incomplete, display coverage/unknown rather than inventing totals. Under no circumstance abandon the end-to-end vertical slice.

---

# Phase 0 — Requirements and analysis

### [x] REQ-01 (P0) Confirm v0.1 scope and trade-offs
- **Dependencies:** None.
- **Deliverables:** Review `document.md`; freeze P0; decide two demonstrative location anchors (work/current and home) and explicit product-data disclosure.
- **Acceptance:** Owner agrees that demo prices/stock are not real branch facts; budget means checkout cash; GPS is optional; at least 8 recipes and 20 ingredients planned.
- **Review questions:** What is the problem? Who is Mr. A? What is *not* supported?
- **Completed (2026-10-30):** Owner explicitly agreed (“I agree, you may start now”) to the scope in `document.md` §14: Phaya Thai work/current demo area and On Nut home demo area; checkout cash budget; optional GPS; minimum 8 recipes/20 ingredients; simulated offers with unknown branch stock.
- **Verification evidence:** Read `AGENTS.md`, `document.md`, and `BACKLOG.md`; inspected all workspace files. Only these three documents exist. `README.md` is absent and `git status --short` reports that this is not a Git repository. No application/package scripts exist, so lint, typecheck, tests, build and browser smoke checks are not applicable to this requirements-only change. Reviewed proposal against REQ-01 acceptance criteria; each required decision is explicitly listed for agreement.
- **Owner understanding / trade-off:** Mr. A selects an affordable meal and buys pantry-adjusted whole packs. Local fixtures provide a reproducible demo with real calculations; simulated catalog coverage cannot guarantee real shop prices or stock.

### [x] REQ-02 (P0) Define core user journeys and edge states
- **Dependencies:** REQ-01.
- **Deliverables:** Navigation/screens and written golden-path + GPS-denied + no-offer + empty-filter cases.
- **Acceptance:** Every critical action maps to visible screen/state and acceptance criteria in the spec; P1 extras separated.
- **Verification evidence (2026-10-30):** Added `document.md` §5 REQ-02 interaction contract: route/action/visible-result matrix linked to requirement IDs, six-step golden path, edge-state/recovery matrix, shared-session behavior and explicit P1 boundaries. Reviewed coverage for discovery, filters, details, selection/removal, pantry, pack basket, store directions and disclosures, including GPS-denied, no-offer and empty-filter scenarios. Read back the edited sections. No application/package scripts exist; lint/typecheck/test/build and browser verification are not applicable yet. This verifies written requirements, not implemented UI behavior.
- **Owner understanding / trade-off:** Shared session inputs feed the same calculations across screens, so pantry edits change both eligibility and checkout. Refresh persistence is deferred; QA will verify actual behavior during implementation.

# Phase 1 — System and data design

### [ ] [~] DES-01 (P0) Bootstrap strict TypeScript Next.js project
- **Dependencies:** REQ-01.
- **Deliverables:** pnpm Next.js App Router project, Tailwind, ESLint, `typecheck` and test scripts, Vitest setup, `@/*` alias pointing to `./src/*`, `.gitignore`, basic README. Component library is initialized in `DES-UI-01`.
- **Acceptance:** Local page renders; `pnpm lint`, `pnpm typecheck`, `pnpm test`, and `pnpm build` are defined and can run (empty initial test suite okay if configured responsibly); no secrets committed.
- **Tests:** Production build and smoke open.
- **Progress (2026-10-30):** Added the Next.js App Router, strict TypeScript, Tailwind CSS v4/PostCSS, `@/*` alias, ESLint/Vitest configs, package scripts and a Thai-first scaffold page. `README.md` documents the current implementation, setup, checks, absent data and limitations. This task remains Partial because dependencies could not be installed, so the required checks and page smoke test have not run.
- **Verification evidence:** `pnpm install --offline` failed because `eslint-config-next@16.2.10` is absent from the local package metadata/store. `pnpm install --fetch-retries=0 --fetch-timeout=5000` failed resolving `registry.npmjs.org` (`EAI_AGAIN`). The cached official `create-next-app` generator created the starter files, but its attempt to write user-level preferences failed because `/home/jb/.config` is read-only; generated project files were available and copied selectively. No lockfile was generated. Invoked `pnpm lint`, `pnpm typecheck`, `pnpm test`, and `pnpm build`; each stopped because `node_modules` is absent (`eslint`, `tsc`, `vitest`, and `next` commands not found). Browser smoke remains unverified. These are blockers, not passes.
- **Owner understanding / trade-off:** Next.js App Router owns page routing and rendering; Tailwind utilities style the minimal Thai-first shell. TypeScript strict mode and `@/*` make later domain modules easier to type and import. The starter avoids remote font fetching so the first render can remain local; the trade-off is relying on system Thai fonts until product typography is deliberately chosen.

### [ ] DES-UI-01 (P0) Initialize shadcn/ui and establish Tumraigin UI primitives
- **Dependencies:** DES-01.
- **Deliverables:** Run `pnpm dlx shadcn@latest init` in the initialized Next.js project. Install the small initial set with `pnpm dlx shadcn@latest add button card input label badge checkbox` (remove any unused primitives if requirements change). Configure/preserve Tailwind CSS variables, Thai-first design tokens and Lucide icons; inspect the generated files.
- **Acceptance:** `components.json` exists; `src/components/ui/` has the actually used components; `src/lib/utils.ts` provides `cn`; `@/*` resolves to `./src/*`; global theme styling works. A representative route renders a shadcn/ui `Button`, `Card`, and labeled input without hydration errors. Works on mobile with keyboard focus visible. No domain logic in UI primitives and no `add --all`.
- **Tests:** `pnpm lint`, `pnpm typecheck`, `pnpm build` (where configured), plus manual keyboard/mobile check on the representative UI. Record real results; never mark done on configuration alone.
- **Owner teach-back:** Explain how shadcn/ui differs from a component package, where generated component code lives, how `cn` and Tailwind class tokens work, and why the app still uses Next.js App Router.

### [ ] DES-02 (P0) Typed schema, fixture contracts and validation
- **Dependencies:** DES-01, REQ-01.
- **Deliverables:** `Ingredient`, `Recipe`, `RecipeIngredient`, `ProductOffer`, `Store`, `PantryItem`, `PlanningInput`, `Provenance` types and Zod/validation where appropriate.
- **Acceptance:** Explicit units and satang; no implicit stock; unknown nutrients nullable; all IDs and links validated. Separate `Store` from `ProductOffer` and `Ingredient`.
- **Tests:** Invalid pack size, malformed coordinates, duplicate IDs and unknown ingredient references rejected.

### [ ] DAT-01 (P0) Curate seed data with provenance
- **Dependencies:** DES-02.
- **Deliverables:** At least 20 normalized ingredients, at least 8 Thai-oriented recipes, reviewed nutrient values, a small product-offer dataset, and a small labeled demo-store fixture. Source URLs/FDC IDs only when verified.
- **Acceptance:** Recipes reference existing ingredients; serving and raw edible quantities consistent; simulated price/stock clearly labeled; do not invent verified USDA IDs. `data/` validates and fixtures are sufficient for 3 distinct budget/protein scenarios.
- **Tests:** Data integrity fixture test, ingredient total sanity checks, `null` micronutrient coverage accepted.
- **Contingency:** If valid USDA record IDs cannot be verified in time, use clearly labeled **curated_estimate** for nutrition values instead of fabricated citations. Do not claim medically precise numbers.

# Phase 2 — Domain implementation (highest-priority coding)

### [ ] ENG-01 (P0) Nutrition calculation engine
- **Dependencies:** DAT-01.
- **Deliverables:** `calculateRecipeNutrients(recipe, ingredients)` returning batch/per-serving totals plus completeness flags and source references.
- **Acceptance:** Scale quantities from 100 g values; divide by servings; never convert unknown to zero; distinguish kcal, grams and milligrams.
- **Tests:** 100 g/250 g examples, two servings, unknown sodium/iron; zero/invalid quantity handling.
- **Owner teach-back:** Formula, missing nutrient semantics, raw-vs-cooked limitations.

### [ ] ENG-02 (P0) Pantry shortage & multi-recipe aggregator
- **Dependencies:** DAT-01.
- **Deliverables:** `aggregateRequiredIngredients`, `subtractPantry` pure functions.
- **Acceptance:** Shared ingredient quantities combine across selected recipe batches; subtract pantry **once**; shortages are >= 0; stable ordering by ingredient ID.
- **Tests:** Two recipes each use rice; pantry removes amount only once; oversupplied pantry gives zero shortage.
- **Owner teach-back:** Why doing subtraction recipe-by-recipe causes double counting.

### [ ] ENG-03 (P0) Package purchase / cost engine
- **Dependencies:** ENG-02, DAT-01.
- **Deliverables:** `calculatePackPurchase` and `buildShoppingBasket` using example offers and per-chain candidate coverage.
- **Acceptance:** Integer satang; `ceil` pack count; leftovers displayed; separate checkout and consumed-portion estimates; missing offers produce **incomplete** cost rather than zero. Chain-level offers do not imply branch stock.
- **Tests:** 0, 250 g, 251 g, 500 g with 250 g pack; multiple ingredient costs; missing offer; pantry impacts basket.
- **Owner teach-back:** Why a cheaper per-gram bulk product may require more cash at checkout.

### [ ] ENG-04 (P0) Explainable deterministic recipe eligibility and ranking
- **Dependencies:** ENG-01, ENG-03.
- **Deliverables:** `rankRecipes`/eligibility function with budget, minimum protein, exclusion flags and explanation strings.
- **Acceptance:** Hard exclusions work; budget compares **checkout** prices; incomplete data is not treated as free; stable sort order; displays recommendations and reasons.
- **Tests:** Budget threshold, protein threshold, exclusions, unknown data, stable ties and empty results.

### [ ] UX-01 (P0) End-to-end vertical slice: discover -> recipe -> plan
- **Dependencies:** DES-01, DES-UI-01, ENG-01, ENG-02, ENG-03, ENG-04.
- **Deliverables:** Mobile-first Discover and Recipe Details screens, preference controls, selection, pantry editor, and shopping basket UI, composed from the shared shadcn/ui primitives.
- **Acceptance:** A new visitor without sign-up can change budget/protein -> choose a recipe -> change owned ingredient quantities -> see **recomputed** nutrients/shortages/checkout packs and cost. No fake precomputed totals. Form controls are labeled and keyboard-operable; design remains Thai-first and branded, not a default shadcn demo.
- **Tests:** Manual golden path on phone and desktop; controls labeled; no hydration/console errors.
- **Owner teach-back:** Trace data from fixture -> pure function -> UI state.

# Phase 3 — Stores, provenance and product polish

### [ ] GEO-01 (P0) Demo-area store discovery and directions
- **Dependencies:** UX-01, DAT-01.
- **Deliverables:** Two named Bangkok demo location anchors (work/current and home), candidate store cards per anchor, approximate straight-line distances and external directions links; optional map (only after list works).
- **Acceptance:** No geolocation prompt at launch; user can switch demo work/current vs home anchors; no false branch-stock claims; store fixture location provenance explicit; directions link uses valid coordinates.
- **Tests:** Coordinates validated; link opens intended map; no API connection needed for demo.

### [ ] UX-02 (P0) Data transparency, fallback states and accessibility
- **Dependencies:** UX-01, GEO-01.
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
- **Dependencies:** UX-02, ENG-01..04, GEO-01.
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
REQ-01
  |-- REQ-02 (user journeys)
  +-- DES-01 (Next.js bootstrap)
        |-- DES-UI-01 (shadcn/ui primitives) --+
        +-- DES-02 (data contracts)            |
              +-- DAT-01 (curated data)        |
                    |-- ENG-01 (nutrition)     |
                    +-- ENG-02 (pantry)        |
                          +-- ENG-03 (packs)   |
                                +-- ENG-04 (ranking)
                                       |       |
                                       +-------+--> UX-01 (vertical slice)
                                                        |
                                                      GEO-01
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
