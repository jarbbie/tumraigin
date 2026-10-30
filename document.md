# Tumraigin (ทำไรกิน) — Product & Engineering Specification

> Status: **YWC21 interview prototype (v0.1)**  
> Prepared: **2026-10-29 (Asia/Bangkok)**; product journey revised **2026-10-31**
> Target: A public, interactive, testable deployment and GitHub source for the **2026-10-31** interview.  
> Audience: Owner/developer, Codex, reviewers, and YWC interviewers.  
> Authority: This document defines **what and why**. `BACKLOG.md` defines **when and acceptance criteria**. `AGENTS.md` defines **how Codex works**.

Supporting implementation references are maintained in `docs/specification.md`, `docs/api-spec.md`, `docs/ui-specs.md`, and `docs/tests.md`. They add details for their named areas; this document remains authoritative for product goals, scope, domain rules, privacy, and data truth if a conflict arises.

## 0. Executive summary

**Tumraigin** is **your helper for planning home-cooked meals**. It brings the places that matter to you, your optional preferences, meal choices and details, and a practical shopping list into one flow.

**Interview deliverable:** a deployed Next.js web app with a genuinely functioning end-to-end journey. Use a curated recipe and ingredient dataset, real arithmetic, real or source-attributed store locations where feasible, and **clearly identified demo assumptions** for retailer catalogs and inventory. Do **not** claim to track live branch stock or real-time prices.

**User promise:** "ตัวช่วยการวางแผนทำอาหารกินเองของคุณ" — choose and save places on a map, optionally share what you prefer, explore meal choices and plans with their details, then get a shopping list for what you choose to cook.

**Prototype limitation:** Nutrition and grocery prices are estimates; saved map pins are user-selected places, and nearby store suggestions do not confirm branch inventory or a real-world fulfillment plan.

### Product principles
1. **Honesty over realism:** distinguish measured/verified, curated/estimated, and simulated data everywhere relevant.
2. **Actual calculations:** no fixed recommendations or pre-baked totals masquerading as computation.
3. **Plan from the places that matter:** start with a map and saved user-selected locations, then carry the chosen place through meal planning and shopping.
4. **Explainability:** every nutrient total and cost can be traced to quantities, products, units, and data sources.
5. **Local Thai relevance:** Thai-first labels and plausible Thai meals, with clear currency and serving sizes.
6. **Resilient demo:** never request GPS on launch; keep saved locations and planning usable when map tiles or external services fail.

## 1. Context, problem, and user

### 1.1 Problem statement
People who cook at home juggle where they shop, what they like to eat, what they have on hand, how much a plan may cost, and what they need to buy. Tumraigin helps them plan that whole cooking process, from places they choose on a map through meal options and details to a consolidated shopping list.

### 1.2 Target audience
- Residents of Bangkok and similar Thai urban areas who cook ~3 days/week.
- Access to several chain or independent grocery stores near home, work, or commute.
- Interested in price, convenience, meal choice, calories, and macro-nutrients; nutrition tracking is optional.
- Comfortable using a mobile web app before/after work.

### 1.3 Primary persona and journey
**Mr. A**, an office worker who cooks at home, wants one place to organize familiar shopping locations and plan meals around optional budget, nutrition, and ingredient preferences. He can choose a place on the map, save it for later, review meal choices and details, and finish with only the shopping items his plan needs.

**Product journey:** open to a map -> choose a point and save one or more named locations -> optionally add or skip preferences -> compare meal choices and plans, then inspect recipe details -> generate a consolidated shopping list from the selected plan and pantry.

**YWC v0.1 journey:** view a map centered on a neutral Bangkok demo area -> add, name, save, select, rename, or remove manually chosen map locations -> optionally set budget, protein, exclusions, and pantry (or skip) -> compare available meal choices and inspect plan and recipe details -> calculate ingredient, nutrition, and pack estimates -> produce a shopping list with missing prices and simulated offers clearly marked.

### 1.4 Jobs to be done
- "Help me plan the meals I want to cook at home."
- "Keep the places I choose on a map so I can use them again."
- "Let me explore meal options before I commit to preferences."
- "Show whether a meal fits my protein and calorie goals."
- "Don't tell me to buy ingredients I already have."
- "When planning multiple meals, don't make me buy the same ingredient three times."
- "Tell me which nearby shops are worth checking, without pretending their stock is guaranteed."

## 2. Goals, non-goals, and scope

### 2.1 Release success (must be observable)
- Public HTTPS URL reachable without an account; source repo available on GitHub.
- First visit opens on an interactive map centered on a neutral demo area. The user can add, name, select, edit, and remove manually chosen locations and reuse saved locations in the same browser.
- Location permission is not requested on launch. A first-time visitor can continue with the demo area if they skip adding a location or map tiles fail.
- At least **8 reviewed Thai-inspired recipes** and **20 normalized ingredients**; real calculations using quantities rather than fixed recipe nutrition/cost totals.
- User can optionally adjust **budget**, **minimum protein**, **exclusions**, and **pantry**, or skip preferences and see unfiltered choices.
- User can select a recipe, see nutrition estimates and provenance, and generate a consolidated list of **needed ingredient quantities**.
- When demo product offers are available, checkout cost accounts for real pack sizes and leftover quantity. Every displayed demo price/stock assumption is labeled.
- Show candidate store locations and an external directions link, backed by real OSM data if available and a reliable demo fallback otherwise.
- Explain the core calculations in a README or in app "How estimates work" panel; pass automated unit tests and a production build.

### 2.2 P0 vs P1 vs future
| Category | P0: interview must-have | P1: only after P0 | Post-interview |
| --- | --- | --- | --- |
| Recipes | Search/browse 8+, recipe details | Add up to 3 meals; preparation instructions | Personalization / content tools |
| Preferences | Skippable budget, protein, exclusions and pantry | Cooking time, calorie range | Advanced health profiles |
| Pantry | Quantities of common owned ingredients | Pantry editing/persistence | Inventory expiration tracking |
| Nutrition | Calories, protein, carbs, fat | A few traceable micro-nutrients with unknown handling | Full nutrient coverage / cooking yield models |
| Pricing | Curated **demo offers**, package purchasing arithmetic | Compare 1-store vs up to 2-store plans | Real authorized retail integrations |
| Location | Interactive map; manually chosen named locations saved locally; demo-area fallback | Explicit geolocation, sourced store lookup | Real commute-route optimization |
| Data | Local static source-attributed fixtures | Optional cached OSM discovery | Scheduled ingestion / versioned catalog |
| Account | None; saved locations stay in this browser | Optional local preference memory | Auth/profile sync |

### 2.3 Explicit non-goals
- No scraping retailer sites by default; no bypass of rate limits, robots, authentication, or anti-bot controls.
- No claims of verified real-time branch inventory, prices, purchase reservation, or guaranteed product availability.
- No medical advice, calorie prescription, allergy-safe certification, or micronutrient sufficiency diagnoses.
- No full BTS route optimization, payments, ordering, authentication, live AI recommendation, or microservices for v0.1.
- No unjustified real brand logos/images. Prefer self-created assets, licensed media, or simple icons.

## 3. Product requirements and acceptance tests

| ID | Requirement | Acceptance criterion |
| --- | --- | --- |
| FR-01 | Choose and save locations | The first screen shows an interactive map; the user can add, name, select, edit, and remove map-picked locations saved in this browser. No GPS prompt is required. |
| FR-02 | Skippable preferences | Budget, protein, exclusions, and pantry can be entered or skipped; skipping imposes no hidden filter. |
| FR-03 | Explore meal choices and details | Show available meal choices and plans; recipe details include standardized ingredient amounts, servings, nutrient estimates, and source coverage. |
| FR-04 | Pantry awareness | Entering 100 g of owned rice reduces required purchased rice by 100 g, never below zero. |
| FR-05 | Shopping aggregation | Repeated ingredients aggregate before pack selection; use remaining pantry once. |
| FR-06 | Pack pricing | For each purchased ingredient, choose enough whole packs; show checkout cost and amount left after cooking. |
| FR-07 | Nutrition arithmetic | Scale per-100-g nutrients by raw edible grams; handle missing values as **unknown/partial**, not zero. |
| FR-09 | Provenance disclosure | Every product price identifies `simulated`, `estimate`, or `verified_catalog`; no implicit live-stock claim. |
| FR-10 | Responsive usable UI | On a small phone, core journey is complete without horizontal overflow. |
| FR-11 | Deployable | Production build, deployment, and README/setup instructions verified. |
| FR-12 | Map and location fallback | Map tiles are client-rendered and attributed; saved-location and demo-area choices remain usable if map tiles fail. |
| FR-13 | Candidate stores | When shown, candidate stores use the selected location or demo area; saved pins remain separate from store records and stock claims. |
| NFR-01 | Reliability | Meal calculations and shopping lists use local data; tile failure does not block saved locations, demo-area fallback, or later planning. |
| NFR-02 | Privacy | No account, GPS-on-launch, telemetry, or server sync for saved locations. Explicitly saved map pins and names stay in browser storage and can be edited or deleted. |
| NFR-03 | Correctness | Money in integer satang; amounts in standardized grams/mL; automated edge-case tests. |
| NFR-04 | Accessibility | Semantic buttons/forms, keyboard flow, labels, contrast, focus feedback, reduced-motion support. |
| NFR-05 | Security | Validate inputs, avoid secrets in frontend, render user text safely, avoid untrusted URL injection. |

### 3.1 Acceptance walkthrough (golden path)
1. Open the app and see an interactive map. Choose a point, add a name, and save it; return later and select, rename, or remove a saved location.
2. Continue to preferences. Enter budget, protein, exclusions, or pantry quantities, or skip the step without hidden constraints.
3. Compare the available meal choices and plans; open details to review portions, ingredients, nutrition estimates, and provenance before choosing.
4. Generate the shopping list. Verify quantities, pantry deductions, whole-pack checkout estimates, leftovers, and incomplete-price labels.
5. If map tiles fail or the app is offline, continue from saved locations or the named demo area; no GPS or account is needed.

## 4. UX / information architecture

**Primary sections (mobile-first):**
1. **Places** `/`: an interactive map, map-picked location editor, and saved-location list. Start centered on a named demo area without requesting GPS.
2. **Preferences** `/preferences`: optional budget, protein, exclusions, and pantry controls with a clear skip action.
3. **Meal choices and plans** `/meals`: browsable eligible meals and plan options, with an unfiltered state when preferences are skipped.
4. **Meal details** `/recipes/[slug]`: servings, raw-ingredient quantities, macros, known micro-nutrient coverage, and cost estimate.
5. **Shopping list** `/shopping-list`: selected plan, pantry-adjusted shortages, pack quantities, checkout estimate, and leftovers.
6. **About data** `/about`: what is real vs simulated, source/license acknowledgments, calculation limitations, and location storage behavior.

**Navigation rule:** no required sign-up. Keep the entire core journey accessible in 3–5 meaningful user actions. Expose a "Demo data" marker clearly throughout cost/store views.

**UI language:** Thai-first, with optional English strings only if easily supported. Currency ฿, mass g, volume mL, servings clearly defined. Label *ingredient consumption cost* separately from *checkout cash required*.

**States to design explicitly:** map loading/unavailable, no saved locations, selected-location edit/remove, preferences skipped, empty meal results, no suitable product offers, missing nutrient data, insufficient budget, and stale demo catalog.

## 5. Proposed architecture

### REQ-02 historical interaction contract — 2026-10-30 (superseded by REQ-03)

The following interaction record documents the earlier demo-area-first proposal. It is retained for history only; the REQ-03 contract below is authoritative for current implementation.

This defines intended behavior for implementation and QA; these screens are not yet built. Primary navigation exposes Discover (`/`), Plan (`/plan`), Shops (`/shops`) and About data (`/about`). Recipe cards link to `/recipes/[slug]`; details link back to Discover and forward to Plan. No sign-up or permission dialog interrupts navigation.

Shared session state consists of the selected demo anchor, valid budget/protein/exclusion preferences, one selected recipe ID and pantry quantities in edible grams. Navigation within the app preserves that state; refresh persistence is not required for P0. Switching areas updates store candidates/distances without discarding the recipe or pantry. Selecting another recipe replaces the previous batch; removing it returns Plan to its empty state. All displayed estimates derive from the same fixture/domain calculation inputs.

| Action / route | Visible result and acceptance check | Spec coverage |
| --- | --- | --- |
| Open Discover `/` | Phaya Thai work/current demo area is labeled and selected; On Nut home demo area can be selected. Show recipe cards and demo notice without requesting GPS. | FR-01, NFR-01, NFR-02 |
| Search/browse and change budget, protein or exclusions on `/` | Labeled controls update eligible results and explain reasons. Budget label says checkout cash (฿); protein says grams per serving. Exclusions are hard filters. Invalid numbers show an inline error and do not produce a new valid recommendation from that input. | FR-02, NFR-03, NFR-05 |
| Open `/recipes/[slug]` | Show batch servings, raw edible ingredient grams, per-serving calorie/macronutrient estimates, provenance/unknown coverage and demo checkout estimate. Unknown slug shows a useful not-found state with a Discover link. | FR-03, FR-07, FR-09 |
| Select recipe and open `/plan` | One selected recipe batch is visible with a remove action, pantry editor and computed shopping list. Direct entry without a selection shows “ยังไม่ได้เลือกเมนู” and a Discover link. | FR-03, FR-04, FR-05 |
| Edit pantry on `/plan` | Labeled grams inputs recompute shortages, packs, checkout cost and leftovers; returning to Discover recomputes eligibility using the same pantry. Invalid/negative/nonfinite quantities show an error; no negative shortage or misleading updated total is shown. | FR-04, FR-05, FR-06, NFR-03 |
| Inspect basket on `/plan` | Each line distinguishes required/owned/shortage grams, whole packs and purchase leftovers. Checkout cash is prominent; consumption estimate is separately labeled. Zero shortage needs zero packs. Prices show the simulated-data notice. | FR-06, FR-09 |
| Open `/shops`, switch area, open directions | Cards identify location provenance, approximate straight-line distance and demo offer coverage with unknown branch stock. Validated destination coordinates generate an external HTTPS directions link; invalid coordinates disable it with an explanation. Fictitious points visibly say they are fictitious. | FR-01, FR-08, NFR-05 |
| Open `/about` from any cost/store view | Full §8.3 disclosure, calculation definitions, source/license acknowledgments for data actually used, and limitations are accessible. | FR-09 |
| Use any route on phone or keyboard | Controls have labels, focus is visible, errors/results are understandable without color alone, navigation works without horizontal overflow, and reduced motion is respected. | FR-10, NFR-04 |

**Golden path for later manual QA:**
1. Open `/` with location permission denied and external APIs unavailable. Verify the labeled Phaya Thai demo area, then switch to On Nut and back without a location prompt.
2. Browse the reviewed fixtures; enter a checkout budget and minimum protein that admit a known complete fixture basket. Verify a reason for inclusion and confirm exclusions remove matching recipes.
3. Open an eligible recipe, inspect servings, ingredient quantities and nutrient provenance, then select its batch and continue to Plan.
4. For a fixture requiring 250 g rice, enter 100 g owned rice. Verify 150 g shortage; with a synthetic 250 g rice pack, verify one pack and 100 g purchase leftovers. Enter 500 g owned rice and verify zero shortage, zero packs and zero rice purchase cost. These are test inputs, not claimed nutrient measurements or retailer offers.
5. Return to Discover and check its checkout eligibility matches the updated Plan. Reopen Plan, then Shops; verify candidate coverage is labeled simulated and stock unknown. Check the directions destination against the validated card coordinates.
6. Open About and distinguish curated nutrition, simulated offers and sourced or fictitious locations. The recipe/plan/store cards must still work without external APIs; external navigation requires network access and is outside the offline core.

| Edge case / trigger | Visible state and recovery | Acceptance check |
| --- | --- | --- |
| No recipes meet current filters | Discover shows “ไม่พบเมนูที่ตรงเงื่อนไข” with current constraints and actions to edit/reset filters. | No invented recommendation; hard exclusions remain applied until explicitly changed (FR-02). |
| Missing offer for a positive shortage | Recipe/Plan marks the ingredient unpriced and basket “ราคารวมยังไม่ครบ”; any known subtotal is labeled partial. Keep the needed grams visible. | Never show a complete checkout total or claim budget compliance; Shops cannot claim complete coverage. Pantry sufficient for that ingredient removes its purchase need (FR-06, FR-08, FR-09). |
| Missing nutrient value | Details show unknown/partial coverage and known subtotal only if clearly labeled. | No automatic zero; if a constrained nutrient is unknown, do not claim the recipe meets that goal (FR-07). |
| Tight budget or changed pantry makes selected meal ineligible | Keep the selected recipe visible with an over-budget/unknown explanation and links to edit preferences or choose another meal. | No silent selection replacement; budget result agrees with Plan (FR-02, FR-06). |
| GPS denied, unavailable or timed out | P0 uses demo anchors and never calls GPS. If the P1 location action is later added, show a failure message and “ใช้พื้นที่สาธิต” to continue with the selected anchor. | Core recipes, pantry and Plan stay usable; do not request permission repeatedly (FR-01, NFR-02). |
| Map/lookup/network failure | Retain local store cards, provenance, demo labels and directions links. If an optional map exists, show its failure and the list. | No API required for calculations or fixture candidates; no asserted travel ETA (NFR-01, FR-08). |
| No complete store candidate | Shops lists uncovered ingredients and available location-only candidates with unknown stock. | Do not invent a complete shopping stop or quietly combine stores (FR-08). |
| Loading or local data error | Announce loading where asynchronous work exists. On failure show an explanation and retry/reload action; retain valid user inputs where possible. | Do not substitute fake totals or leave an endless spinner (NFR-01). |

**P1 boundary:** GPS and live lookup belong to `GEO-02`; three selected meals to `ENG-05`; two-store comparison to `ENG-06`; additional sourced micronutrients to `NUT-01`. A map remains optional after store cards work. P0 routes must not depend on these enhancements.

**Design trade-off:** a single shared session state and shared domain calculations prevent the recipe card and final basket from disagreeing after pantry edits. P0 accepts a session reset on refresh to avoid adding persistence before the core journey is proven.

### REQ-03 current interaction contract — 2026-10-31

The first screen is Places (`/`) and opens with an interactive map centered on a neutral, clearly named demo area. The map lets the user choose a point, name it, and save it to a local list. Saved locations can be selected, renamed, and deleted. The map pin is a user-selected coordinate, not device GPS, a verified store, or evidence of retailer inventory. Do not add geocoding or an account requirement.

The ordered flow is: **map and saved locations -> optional preferences -> meal choices, plans and details -> shopping list**. Preferences include checkout budget, minimum protein, exclusions, and pantry quantities. Skipping preferences leaves constraints unset and displays all available choices. Meal calculations and shopping amounts continue to come from validated fixtures and pure domain functions.

| Step / route | Visible result and acceptance check |
| --- | --- |
| Open Places `/` | Show the map first, a neutral demo-area label, saved-location list, and a clear add-location action. Do not request GPS. Include OSM attribution and a link to its license when OSM data is shown. |
| Select and save a map point | A user can place a marker, enter a human-readable name, and save it. Explain that the name and coordinates stay in this browser. The saved entry can be selected, renamed, and removed. |
| Continue when the map fails | Keep saved locations and the demo-area choice visible; allow the user to continue planning. A first-time visitor can use the named demo area without saving a point. |
| Open Preferences `/preferences` | Show budget, protein, exclusions, and pantry as optional controls. “ข้ามก่อน” continues with no hidden filter; invalid values are not applied. |
| Open Meal choices `/meals` | Show available choices, eligibility reasons when preferences were set, and plan actions. If preferences were skipped, label that results are unfiltered. |
| Inspect `/recipes/[slug]` | Show servings, ingredient amounts, estimated nutrition with provenance/unknown flags, and a selection action. An unknown slug has a useful return path. |
| Open Shopping list `/shopping-list` | Recompute required and pantry quantities, shortage, whole packs, estimated checkout cash, and leftovers. Missing offers keep the basket visibly incomplete. |
| Return to Places or another step | Keep the saved-location list in browser storage and the current planning session intact. Selecting a different saved location does not silently replace the chosen meals or pantry. |
| Use any step on phone or keyboard | Controls remain labeled and focusable; map selection also has a keyboard-accessible location-entry fallback; no horizontal overflow or color-only status. |

**Privacy and map fallback:** only a user-submitted map pin and its name are saved in `localStorage`; the app does not send the saved-location record to its server or log it. Map tile requests reveal the viewed map area to the tile provider, so disclose external tiles. Provide edit, delete-one, and clear-all controls. Never request `navigator.geolocation` on launch. Request only tiles for the visible map, honor the selected tile provider's usage policy, and do not offer tile downloads or prefetch. If tiles are unavailable, saved-location selection and the named demo area still work.

**Design trade-off:** the map is now the first screen as requested, but tile delivery remains an external dependency. Keeping saved pins and the meal-planning data local means a tile outage does not erase locations or block the rest of the flow.

### 5.1 Engineering decisions
- **Modular monolith** using Next.js App Router + TypeScript + Tailwind CSS + **shadcn/ui** for the application UI, with Lucide icons.
- Use shadcn/ui as **owned component source** generated into the repository, not as a remotely hosted theme or a replacement for the calculation engine. Adapt components to the product design, but keep domain logic separate.
- **Deterministic domain functions** under `src/lib/domain/` independent of React and network APIs.
- **Static reviewed JSON/TS fixtures** for recipe, ingredient, nutrient and offer records: easiest to test and deploy without a database.
- **Local React state** for preferences, selected meals, and pantry; `localStorage` stores only explicitly saved, manually map-picked location names and coordinates plus the selected saved-location ID. No server sync or telemetry.
- **Leaflet / react-leaflet** for the first-step location map; load client-side to avoid SSR issues. Request only visible tiles, display provider attribution/license, and follow the provider's usage policy. No geocoding is needed to save a pin.
- **Optional Next.js Route Handler** for OSM/Overpass store discovery with explicit endpoint validation, bounded radius, caching and graceful fallback. This is P1 if it threatens P0.
- **Vitest** for numeric domain tests; TypeScript strict; ESLint. E2E may be a stretch goal.
- Set a small, consistent design system using Tailwind CSS variables (background/foreground, primary, muted, border, destructive) and shadcn/ui components. Focus on mobile-first, Thai text legibility, accessibility, and visible estimates/provenance; do not simply copy a generic dashboard style.
- No server DB, auth, distributed services, queue, live AI, or arbitrary user-generated recipe claims in v0.1.

### 5.2 Data/control flow
```text
[User selects area, preferences, pantry]
               |
               v
    [Typed client application state]
               |
     +---------+----------+
     |                    |
[Recipe selector]    [Store lookup adapter]
     |                    |  -> optional Overpass -> OSM results
     v                    |  -> fallback demo locations
[Recipe + ingredient fixture]|
     |                    |
     v                    v
[Pure nutrition + needs + offer engine]
     |
     +--> [Eligibility and ranked recipe results]
     +--> [Aggregated shortages + package basket]
     +--> [Candidate store plan (assumptions shown)]
     |
     v
[UI: recipe / detail / plan / store cards / disclosures]
```

### 5.3 Suggested repository structure
```text
/
  AGENTS.md
  document.md
  BACKLOG.md
  README.md                 # created during implementation
  .env.example              # only if external services enabled
  src/
    app/
      page.tsx
      recipes/[slug]/page.tsx
      plan/page.tsx
      shops/page.tsx
      about/page.tsx
      api/stores/route.ts    # OPTIONAL: P1, not required for core
    components/
      ui/                    # generated/locally owned shadcn/ui primitives
      shared/                # app-level reusable composition built from primitives
    features/recipes/       # recipe presentation
    features/planner/       # pantry / shopping UI
    features/stores/        # store list/map
    lib/
      utils.ts              # `cn` helper generated by shadcn CLI
      domain/               # pure business logic; no browser imports
        nutrition.ts
        recipes.ts
        pantry.ts
        shopping.ts
        ranking.ts
      geo/                  # distance, geospatial adapters
    data/                   # reviewed fixture files + provenance
      recipes.ts
      ingredients.ts
      offers.ts
      demo-stores.ts
    types/                  # shared schema contracts
  tests/                    # pure domain tests, optional UI tests
```
**Dependency rule:** UI imports domain functions; domain functions never import React, browser APIs, or fetch. Data adapters are replaceable.

### 5.4 UI component system: shadcn/ui (P0)

**Decision:** Use **shadcn/ui + Tailwind CSS + Lucide icons** for common accessible React UI primitives. The framework remains **Next.js App Router**; shadcn/ui is **not a router, a backend, or a substitute for domain services**. Generated components are source files in `src/components/ui/` that the project can inspect and customize.

**Bootstrapping order for a new repository** (already defined as tasks `DES-01` then `DES-UI-01` in `BACKLOG.md`):

```bash
# From the repository root, after Next.js + Tailwind + @/* alias are configured:
pnpm dlx shadcn@latest init

# Start small; add components as they are needed by an implemented screen:
pnpm dlx shadcn@latest add button card input label badge checkbox
```

Prefer the CLI's current supported defaults over hardcoding package versions or copying stale configuration. Confirm it creates `components.json`, `src/lib/utils.ts` (`cn`), theme variables in the global stylesheet, and components in `src/components/ui/`. With a `src/` project, `@/*` must resolve to `./src/*`. Check the generated files after running the CLI and commit them with the application source when the owner authorizes version control actions.

**Suggested UI mapping (install only as implemented):**
- Discover: `Card` for recipes, `Button` for actions, `Input` + `Label` for nutrition/budget, `Badge` for demo-data flags.
- Preferences/pantry: `Checkbox` for options, labeled numeric `Input` for quantities; add `Select` or `Slider` only when useful and accessible.
- Plan/shops: `Card`, `Badge`, `Button`; an actual map is Leaflet and remains an optional integration, not a shadcn component.
- Feedback: simple in-page empty/error states first; only add `Dialog`, `Skeleton`, `Sonner` or other primitives where an actual flow needs them.

**Design and correctness constraints:**
1. Preserve the site's Thai-first design rather than blindly applying default shadcn aesthetics. Set coherent spacing, typography, accessible color contrast, visible focus and reduced-motion support.
2. Reuse generated primitives rather than recreating buttons, checkboxes, and inputs ad hoc. Feature components belong under `src/features/` or `src/components/shared/`; avoid putting product-specific business logic in `src/components/ui/`.
3. Prefer native semantic elements and simple composition to adding shadcn components everywhere. Only install the components that are used; avoid `add --all`, unrelated registry blocks, and large component catalogs.
4. Validate actual user interaction, keyboard behavior and mobile layout. UI never hardcodes nutrient, cost, stock, or location facts.
5. CLI instructions are documented at https://ui.shadcn.com/docs/installation/next and https://ui.shadcn.com/docs/cli; recheck the official documentation if the CLI changes.


## 6. Canonical domain data model

All IDs must be stable strings. All quantities stored in canonical units; **integer satang** for money. `0` and `null` mean different things: unknown is `null`.

```ts
export type Provenance =
  | { kind: "usda"; fdcId: number; sourceUrl: string; checkedAt: string }
  | { kind: "verified_catalog"; sourceUrl: string; checkedAt: string }
  | { kind: "curated_estimate"; explanation: string; checkedAt: string }
  | { kind: "simulated"; explanation: string };

export type NutrientsPer100g = {
  kcal: number | null;
  proteinG: number | null;
  carbG: number | null;
  fatG: number | null;
  fiberG?: number | null;
  sodiumMg?: number | null;
  calciumMg?: number | null;
  ironMg?: number | null;
};

export type Ingredient = {
  id: string;
  nameTh: string;
  nameEn?: string;
  edibleUnit: "g"; // nutrition base is edible/raw grams
  nutrientsPer100g: NutrientsPer100g;
  nutritionSource: Provenance;
};

export type RecipeIngredient = {
  ingredientId: string;
  edibleGrams: number; // raw edible portion per recipe batch
};

export type Recipe = {
  id: string;
  slug: string;
  nameTh: string;
  servings: number;
  minutes: number;
  ingredientItems: RecipeIngredient[];
  tags: string[];
  exclusionTags: string[]; // e.g. egg, soy, dairy (not certified allergen-safe)
  instructions: string[];
  sourceNote: string;
};

export type ProductOffer = {
  id: string;
  ingredientId: string;
  retailerChainId: string; // NOT proof of specific branch stock
  displayName: string;
  edibleQuantityGrams: number; // purchased edible usable quantity
  priceSatang: number;
  provenance: Provenance;
  stockStatus: "unknown"; // no simulated "in_stock"
};

export type Store = {
  id: string;
  displayName: string;
  retailerChainId?: string;
  lat: number;
  lon: number;
  locationSource: "osm" | "demo";
  osmUrl?: string;
};

// User-submitted map pins; persisted only in this browser, separate from Store.
export type SavedLocation = {
  id: string;
  label: string;
  lat: number;
  lon: number;
};

export type PantryItem = { ingredientId: string; edibleGrams: number };
export type PlanningInput = {
  recipeIds: string[];
  pantry: PantryItem[];
  maxCheckoutBudgetSatang?: number;
  minProteinGPerServing?: number;
};
```

**Data modeling cautions:**
- Store (physical location), retailer chain (brand), ProductOffer (retailer-level demo catalog), Ingredient (canonical edible food), Recipe (batch), and RecipeIngredient (required amount) are **different entities**.
- Retailer chain's example offer is **not evidence that a specific branch stocks it**.
- Treat piece/pack conversions explicitly in fixtures (e.g., egg edible grams per unit). Do not assume `1 egg = 100 g` or convert a bottle's full nominal volume to edible grams without density/source.
- Food composition may describe raw or cooked food; do not combine inconsistent states silently. For v0.1 use raw edible ingredient weights, and note oil/water and cooking changes are approximate.
- Store ID from OSM should be namespaced (e.g., `osm:node:123`) to avoid collisions.

## 7. Core business logic: precise definitions

### 7.1 Nutrient calculation
For each recipe ingredient with edible amount `q` grams and source nutrient value `n` per 100 g:

`contribution = (q / 100) * n`.

For batch totals, sum contributions. Per-serving total = batch total / `servings`.

**Missing-data rule:** when any positive-quantity ingredient has a `null` value for a requested nutrient, the **total for that nutrient is unknown/partial**, not a fully known sum; optionally display known subtotal plus coverage. Never replace missing values with zero. Include source and "estimate" label. Do not calculate energy from macro 4/4/9 unless deliberately documented as a separate approximation.

### 7.2 Consolidated ingredient demand
For selected recipes (including their batch serving counts), sum `edibleGrams` by `ingredientId`.

`shortageGrams = max(0, totalDemandGrams - pantryGrams)`.

Do **not** subtract the same pantry item independently for every recipe; aggregate demand first. Support shortage 0 as "already have enough".

### 7.3 Checkout price vs consumption price
For a product offer, `packsNeeded = ceil(shortageGrams / edibleQuantityGrams)` (0 if shortage = 0); `cashNeededSatang = packsNeeded * priceSatang`; `leftoverGrams = packsNeeded * edibleQuantityGrams - shortageGrams`.

- **Checkout cash required** is sum of pack prices and is the primary shopping budget constraint.
- **Consumed ingredient estimate** is `shortageGrams / edibleQuantityGrams * packPrice` (or an explicitly specified unit-price assumption); it excludes leftover package value and is informational.
- Only compare available eligible **demo offers**, with consistent comparable units and stock unknown.
- A naive per-ingredient cheapest offer may be a viable P0 heuristic; explain its limitations. Prefer per-ingredient offers from a **single selected retailer** for a predictable P0 basket. Multi-store split is P1.
- If no offer for an ingredient, show **unpriced / unavailable in demo catalog**, not a fake zero price. The basket total is then **incomplete** and must not be presented as a full checkout price.

### 7.4 Recommendation engine (v0.1)
1. Validate constraints; dietary exclusions are hard filters.
2. Calculate known nutrient amounts per serving; mark insufficient/missing data.
3. Estimate a basket for the recipe using the same shopping engine as the final plan.
4. Filter only when sufficient data exists to assess a **hard** constraint; otherwise label unknown and make conservative ranking decisions.
5. Rank eligible candidates by affordability/goal match using a transparent deterministic scoring function; stable tie-breaker `recipe.id`.
6. Show reasons: "meets protein goal", "uses pantry rice", "estimated checkout cost below budget".

**Important UX rule:** budget must clearly mean **checkout budget** or **ingredient consumption budget**; v0.1 defaults to **checkout budget** and uses the same metric in filtering, recipe cards, and shopping plan.

### 7.5 Store discovery and assignment
- Use the selected user-saved location as the planning origin where store candidates are shown. A saved pin is a user-selected place, not a physical store record. Provide a clearly named demo-area origin when the user has no saved location or tiles are unavailable.
- Keep physical `Store` records separate from user `SavedLocation` records, retailer chains, and offers. Show candidate cards and directions from validated coordinates; do not claim a map pin is a nearby shop.
- If live OSM lookup is implemented, user explicitly triggers it; server-side bounded search by `shop=supermarket|convenience|greengrocer` and other relevant tags, cap results, validate coordinates/radius, cache responses, and observe provider usage policies. Do not harvest full Thai store directories.
- Use `haversineMeters` for **straight-line distance**, not walking/driving ETA. Display label "approx. straight-line distance".
- Open a directions URL using a safe, validated map provider or OSM directions link; do not imply route optimization.
- Candidate stores may have **matching retailer chain demo offers**, but no branch-level stock guarantee. Independents without offers remain location-only candidates.
- P0 planning strategy: show a single-store candidate basket when the retailer demo catalog covers all shortages; if no complete candidate, present incomplete coverage and an ingredient list rather than inventing a solution.
- P1: show a two-store split heuristic, including number-of-stops penalty; label all assumptions and compare to single-store alternatives.

## 8. Data sourcing and ethical/legal boundaries

### 8.1 Dataset tiers
| Dataset | v0.1 implementation | Trust statement |
| --- | --- | --- |
| Recipes | Author-reviewed handwritten Thai recipes | Curated demonstration recipes; not medical guidance |
| Nutrients | Verified USDA FDC records with `fdcId` and record date, optionally source-labeled estimates | Ingredient composition, approximate cooking outcome |
| Prices/products | Small synthetic catalog, optional manually linked authorized public examples | **Simulated retailer-level offers**, not quotes/availability |
| Store points | Optional OSM results or visibly marked static demo points | Locations may be real, inventory unverified |
| User data | Session planning state; explicitly saved named map pins stored in this browser only | No account, server sync, or location analytics |

Never create a `verified_catalog` claim without an actual retrievable URL, observed price and unit, and permission or permissible usage determination. Never present AI-generated nutrient numbers as verified measurements.

### 8.2 External sources and safeguards
- **USDA FoodData Central**: CC0/public-domain data; include attribution and source-specific `fdcId` in seed records. API requires a key; seed from reviewed records **before** demo and do not depend on live nutrient calls for user navigation. https://fdc.nal.usda.gov/api-guide/
- **ASEANFOODS Concise ASEAN Food Composition Tables (2014)**: DAT-01 uses selected, source-coded typical food values with attribution and `curated_estimate` provenance; no FDC IDs are claimed for these records. The source states noncommercial use is allowed with acknowledgement; reproduction for resale or other commercial uses, including educational purposes, may incur fees. Confirm permission or replace these values before commercial/educational product use or broader redistribution. https://inmu.mahidol.ac.th/aseanfoods/doc/OnlineASEAN_FCD_V1_2014.pdf
- **OpenStreetMap data**: ODbL attribution and license notice; distinguish data license from map tile service policy. https://www.openstreetmap.org/copyright
- **OSM tiles**: obey tile usage and attribution; do not bulk prefetch/scrape. https://operations.osmfoundation.org/policies/tiles/
- **Overpass**: small, throttled bounded queries only and fallbacks; public instances are best-effort. https://wiki.openstreetmap.org/wiki/Overpass_API
- **Nominatim public service**: do **not** implement client-side autocomplete; strict application-wide aggregate limit (max 1 rps), proper identification, caching; preferably avoid it for the demo by using a predetermined area. https://operations.osmfoundation.org/policies/nominatim/
- **Retailers**: public pages are **not** automatically authorized APIs or permission to scrape/redistribute; no automated bulk extraction without reviewing terms/permissions. Never imply affiliation with Lotus's, Makro, Tops, 7-Eleven, or independent stores.

### 8.3 Required user-facing disclosure
> **Demo notice:** Recipes and calculations use curated ingredient data. Grocery prices and assumed retailer product selections in this prototype are simulated examples. Store locations may be real, but product availability is not checked at individual branches. Confirm prices and stock before shopping. Nutrition values are approximate.

Show a shortened version on cards/plan and a complete version on `/about`.

## 9. Security, privacy, safety, and reliability

- Never request geolocation on launch. The user may manually choose a map point and explicitly save its name and coordinates in browser `localStorage` for future use. Provide rename, delete-one, and clear-all actions. Do not send saved-location records to the app server or log them; do not store device GPS coordinates. Tile requests reveal the viewed area to the map provider, as disclosed in §5. Keep a named demo-area option for visitors who skip location setup.
- Validate and clamp numeric constraints (`budget`, `grams`, `radius`, `lat`, `lon`, `servings`) with Zod at input/API boundaries. Reject NaN, infinities, negative masses/prices, zero pack sizes/servings, unreasonable search radius.
- Use server-side proxy only for external calls that need security/usage controls. Keep API keys in private environment variables; never expose a USDA key via `NEXT_PUBLIC_`.
- Do not treat client-supplied product prices as authoritative when serving computations from an API; P0 pure client domain functions only consume immutable reviewed fixture records.
- Safely build external navigation URLs; validate numeric lat/lon; default to HTTPS; do not interpolate unchecked values into HTML.
- Keep unit conversions explicit; handle incomplete nutrition and unpriced ingredients gracefully.
- Support reduced motion and readable contrast; avoid medical claims or unsupported allergen guarantees.
- Meal calculations use local fixtures without live API dependencies. Map tiles may require network access; on failure show the saved-location list and demo-area fallback with a clear recovery message.

## 10. Verification plan

### 10.1 Domain unit test matrix (P0)
- Nutrition: 100 g base equals source; 250 g scales ×2.5; 2-serving recipe halves per-serving totals; unknown micro remains unknown even with another known ingredient.
- Pantry: demand 250 g, pantry 100 g => shortage 150 g; pantry 500 g => shortage 0; shared ingredient across two recipes is aggregated before pantry subtraction.
- Package: demand 0 => 0 packs and ฿0; demand 251 g with 250 g packs => 2 packs; 250 g exactly => 1; no offer => incomplete basket, **not zero total**.
- Currency: `priceSatang` arithmetic is integer; display rounding only at UI boundary.
- Rank/filter: hard exclusions respected; deterministic tie order; missing nutrition does not silently count as zero; tight budget changes eligible recipes.
- Geospatial: identical coordinates => 0 distance; distance is labeled straight-line; invalid coordinates rejected.
- Dataset validation: all IDs unique; all referenced ingredient IDs exist; positive serving counts, prices and pack amounts; source provenance present.

### 10.2 Integration/manual tests (P0)
- Browser: open to map without a user account or GPS prompt; choose/name/save a pin; reload and select it; rename and delete; then skip preferences -> compare meal choices/plans -> inspect details -> generate the shopping list.
- Responsive: narrow phone viewport and desktop. Keyboard interaction, visible focus, labels, readable error states.
- Permission denied: irrelevant to the default flow because GPS is never requested; saved pins and the demo area remain selectable.
- Map tiles unavailable or offline: existing saved locations and demo area remain visible, and meal calculations continue locally.
- Data labeling: sampled offer says simulated; no branch "in stock" claims; nutrition source/unknown fields visible.
- `pnpm lint`, `pnpm typecheck`, `pnpm test`, `pnpm build` (configure scripts if missing).
- Smoke-test deployed HTTPS URL and open GitHub repo with source code & setup instructions.

### 10.3 Definition of done (DoD)
A task is done when code, tests, accessible states, provenance labels (if data-related), and docs are updated; static checks and relevant automated tests pass or the exact unverified checks are documented. No task becomes "done" solely because the UI looks complete.

## 11. SDLC and release gates

| Phase | Artifact / activity | Exit gate |
| --- | --- | --- |
| Requirements | This spec, persona, P0 scope | User journey, disclaimers and success criteria defined |
| Design | Types, domain contracts, navigation and data model | One coherent data-flow and fixture schema |
| Implementation | Vertical slices in `BACKLOG.md` | One complete user journey works locally |
| Verification | Unit + manual tests | Correctness, resilience, privacy and labeling checked |
| Deployment | Vercel live build + public repo | URL works on phone and desktop; no secrets exposed |
| Maintenance | README known limitations + future backlog | Future capabilities clearly separate from shipped claims |

**Schedule reality (as of Oct 29 night):** October 30 is the principal build/test day; October 31 is interview/demo day. Protect a release candidate before the interview. If behind, cut live place lookup, extra micronutrients, multi-meal selection, and multi-store optimization before cutting the map-first saved-location flow or core calculations.

## 12. Main risks & decisions

| Risk | Impact | Mitigation / decision |
| --- | --- | --- |
| Retail inventory data inaccessible | Very high | Synthetic catalog with prominent disclaimers; never promise live availability |
| Wrong nutrition totals | High | Reviewed data, standardized grams, provenance, unit tests, unknown handling |
| Cost calculation mismatch | High | Separate consumption vs pack checkout; integer satang; aggregation first |
| Map tile provider fails | Medium | Keep saved-location list and named demo-area fallback usable; do not make tile success a prerequisite for meal planning |
| Scope expansion | Very high | P0 freeze; P1 only after vertical slice passes |
| API/legal misuse | High | No default scraping; honor OSM/USDA terms; no retailer affiliation |
| Developer cannot explain AI code | High | Codex must explain decisions, tests, alternatives; owner reviews each task |

### Architecture decision record (ADR-lite)
- **ADR-001**: Static curated data instead of a live DB for v0.1. *Reason:* deterministic deploy/demo and low integration risk. *Trade-off:* limited catalog coverage and no fresh inventory.
- **ADR-002**: Modular Next.js monolith instead of separate Rust/Go backend. *Reason:* deploy one functional stack quickly; separate pure domain services for later migration.
- **ADR-003**: Integer money and standardized edible grams. *Reason:* reproducible calculations. *Trade-off:* explicit conversions needed for volume/units.
- **ADR-004**: Candidate store recommendations only. *Reason:* chain-level demo prices cannot establish branch inventory.
- **ADR-005**: No AI in critical numerical calculations. *Reason:* deterministic, explainable and testable results; AI may help writing/ideation but not fabricate source data.
- **ADR-006**: shadcn/ui + Tailwind CSS for UI primitives (not a separate framework). *Reason:* accessible, customizable, locally owned components accelerate a coherent interview-quality interface. *Trade-off:* generated source and dependencies must be maintained; install only what is used.
- **ADR-007**: Explicitly saved, manually map-picked locations live in browser `localStorage`, separate from store fixtures. *Reason:* users asked to reuse places without accounts. *Trade-off:* places are not synced across devices, and the external tile provider sees the viewed map area.

## 13. Interview preparation / developer understanding

The owner must be able to answer, without Codex:
1. Why did we choose a modular monolith and no database yet?
2. How are `Ingredient`, `RecipeIngredient`, `ProductOffer`, and `Store` different?
3. How do pantry quantities change shopping cost? Why aggregate before subtraction?
4. Why is `ceil(required / packSize)` necessary? Why is consumption cost not checkout cost?
5. Where do calories, macro- and micro-nutrients come from? What happens when data is missing?
6. How do exclusions and hard/soft constraints work? Can recommendations be reproduced?
7. What exactly is simulated versus verified? Why isn't branch availability guaranteed?
8. Why is straight-line distance different from route distance/ETA?
9. How do saved places and the demo-area fallback work when map tiles are unavailable?
10. What tests protect the core calculations? What would change when moving to production?

**90-second suggested demo:** state the home-cooking planning problem -> choose and save a map location -> skip or set preferences -> compare meal choices and inspect details -> show the pantry-adjusted shopping list and demo-data disclosure -> finish with privacy and calculation trade-offs.

## 14. Open decisions / assumptions

### REQ-01 historical scope approval — 2026-10-30 (superseded by REQ-03)

The owner agreed to the then-current scope and two demo areas on 2026-10-30 (“I agree, you may start now”). This is a historical approval record. Its demo-area-first journey and optional-map decision were revised by REQ-03 on 2026-10-31.

- **Problem/persona:** Mr. A is a Bangkok office worker who cooks several times per week and needs to choose an affordable meal, use pantry ingredients, and understand what to buy before stopping at a candidate shop.
- **P0 journey:** choose a demo area -> browse at least 8 reviewed Thai-inspired recipes -> filter by checkout budget, minimum protein per serving and exclusions -> select one recipe batch -> enter pantry quantities -> see calculated nutrients, shortages, whole packs, checkout cost and leftovers -> inspect candidate store cards and directions. At least 20 normalized ingredients support the recipes. Unknown nutrients remain unknown; missing offers make the basket incomplete.
- **Proposed work/current anchor:** `demo-work-phaya-thai`, displayed as **ใกล้ที่ทำงาน (พื้นที่สาธิต: พญาไท)** / “Near work/current — Phaya Thai demo area.”
- **Proposed home anchor:** `demo-home-on-nut`, displayed as **ใกล้บ้าน (พื้นที่สาธิต: อ่อนนุช)** / “Near home — On Nut demo area.”
- **Anchor boundary:** these are illustrative Bangkok areas, not a detected current position or the user's actual workplace/home. Exact preset coordinates and store points will be recorded and validated in `DAT-01`/`GEO-01`; no verified branch or coordinate is asserted here. Any fictitious store point must visibly say it is fictitious.
- **Budget:** maximum cash required to buy whole packs after pantry subtraction, stored in integer satang. Use the same checkout calculation in filtering and the final basket. Show consumption cost separately as informational.
- **Data disclosure:** all initial product offers are `simulated`; branch stock is `unknown`. Display **“ราคาสาธิต · ไม่ได้ตรวจสอบสต็อกสาขา”** (“Demo prices · branch stock not checked”) alongside prices and store coverage, with the full notice from §8.3 on `/about`. Label nutrition estimates and show provenance/unknown coverage.
- **Resilience/privacy:** meal planning uses local fixtures without GPS, app APIs, or a database. The user may explicitly save manually selected pins in browser storage. The map tile provider receives visible map-tile requests; the app server receives no saved-location record. GPS is not used in the P0 flow.
- **Implementation boundary:** Next.js App Router, strict TypeScript, pnpm, Tailwind CSS, shadcn/ui and Lucide; pure domain functions consume reviewed static fixtures. Bootstrap in `DES-01`, then run the shadcn CLI and verify generated primitives in `DES-UI-01`.
- **Deferred:** three-meal selection, multiple-store comparison, live OSM lookup/geolocation, optional map and extra micronutrients. Accounts, payments, scraping, live inventory, medical/allergen certification and route optimization remain outside v0.1.

**Trade-off for owner review:** local fixtures and simulated offers keep the interview flow reproducible and allow real arithmetic without network access. Catalog coverage is limited and cannot establish actual branch prices or availability.

**REQ-01 approval recorded:** the original P0 scope, Phaya Thai and On Nut demo areas, checkout-budget semantics, optional GPS, the 8-recipe/20-ingredient minimum and simulated-price/unknown-stock disclosure were agreed on 2026-10-30. Current requirements are recorded below.

### REQ-03 current product direction — 2026-10-31

The owner revised the product promise to **“ตัวช่วยการวางแผนทำอาหารกินเองของคุณ”** (“your helper for planning home-cooked meals”) and specified this ordered journey: **(1) open to a map, choose and save named locations for future use; (2) ask preferences, but allow skipping; (3) offer choices, plans, and details; (4) produce the shopping list.** This supersedes the earlier demo-anchor-first flow.

- **Location choice:** map points are manually selected and named by the user; no launch-time GPS. The browser retains only the saved names and coordinates and the selected saved-location ID. The user can select, rename, delete one, or clear all saved locations. The app does not send the saved-location record to its server or log it. Map tile requests reveal the viewed map area to the tile provider.
- **Map fallback:** show a neutral demo-area map on first visit. If map tiles fail, the saved list and demo-area option remain usable, and the user can continue. Tile requests are limited to the visible map; provider policies and attribution/licensing are mandatory. No geocoding is required.
- **Preferences:** budget, minimum protein, exclusions, and pantry can be set or skipped; skip means no hidden filter.
- **Choices and plans:** show recipe choices, explain eligibility when preferences exist, and expose servings, ingredients, nutrition estimates, and provenance before a plan is selected.
- **Shopping list:** compute quantities from selected meals and pantry, then show whole-pack purchase estimates, checkout cash, leftovers, and incomplete price coverage honestly.
- **Data boundary:** saved user locations are not `Store` fixtures. A user pin does not prove a shop, offer, stock, or retailer relationship.
- **Unchanged domain rules:** nutrition remains source-backed or explicitly estimated, unknown stays `null`, money remains integer satang, and simulated retailer offers never claim branch availability.

**Trade-off:** a live tile map provides the first-step location experience while relying on an external service. Saved coordinates and all meal calculations stay client-local, so tile failure does not erase places or prevent planning.

These assumptions describe the original MVP scope approved 2026-10-30; REQ-03 records the owner's later amendment:
- Demo locations: select two reproducible Bangkok-area anchors representing work/current and home (they may be near a BTS route); fixture locations must be real sourced OSM locations or **clearly fictitious** demo points. Do not imply these are the user's actual office/apartment.
- Recipe batch amount: ingredients refer to a defined batch; nutrition displayed per serving. Multi-meal planning (P1) uses one batch per selected recipe unless the user adjusts counts.
- Language: Thai-first UI; code, types and documentation in English.
- Pricing: all offer figures simulated until provenance and redistribution permission verified; no retailer logo or claimed stock.
- Default budget: **estimated checkout cash**, not nutritional cost. Unpriced baskets are incomplete.
- Runtime/API dependencies: offline core, optional OSM only; no hosted DB required.

## 15. Primary technical/reference links (review before enabling an integration)
- Next.js App Router: https://nextjs.org/docs/app
- Next.js Route Handlers: https://nextjs.org/docs/app/getting-started/route-handlers
- shadcn/ui Next.js setup: https://ui.shadcn.com/docs/installation/next
- shadcn/ui CLI reference: https://ui.shadcn.com/docs/cli
- USDA FoodData Central API/data license: https://fdc.nal.usda.gov/api-guide/
- USDA food data documentation: https://fdc.nal.usda.gov/data-documentation/
- OpenStreetMap data copyright/license: https://www.openstreetmap.org/copyright
- OSM tile service policy: https://operations.osmfoundation.org/policies/tiles/
- Nominatim public usage policy: https://operations.osmfoundation.org/policies/nominatim/
- Overpass API and public-service caution: https://wiki.openstreetmap.org/wiki/Overpass_API
- Codex repository instructions: https://developers.openai.com/cookbook/examples/gpt-5/codex_prompting_guide

**This is an engineering specification and implementation plan, not legal advice or a guarantee that third-party services will continue to be available.**
