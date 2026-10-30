# Tumraigin (ทำไรกิน) — Product & Engineering Specification

> Status: **YWC21 interview prototype (v0.1)**  
> Prepared: **2026-10-29 (Asia/Bangkok)**; UI stack updated **2026-10-30**  
> Target: A public, interactive, testable deployment and GitHub source for the **2026-10-31** interview.  
> Audience: Owner/developer, Codex, reviewers, and YWC interviewers.  
> Authority: This document defines **what and why**. `BACKLOG.md` defines **when and acceptance criteria**. `AGENTS.md` defines **how Codex works**.

Supporting implementation references are maintained in `docs/specification.md`, `docs/api-spec.md`, `docs/ui-specs.md`, and `docs/tests.md`. They add details for their named areas; this document remains authoritative for product goals, scope, domain rules, privacy, and data truth if a conflict arises.

## 0. Executive summary

**Tumraigin** helps people who cook several times per week decide **what to cook, what it will approximately cost, what nutrition it provides, what to purchase, and which nearby stores are plausible shopping stops**.

**Interview deliverable:** a deployed Next.js web app with a genuinely functioning end-to-end journey. Use a curated recipe and ingredient dataset, real arithmetic, real or source-attributed store locations where feasible, and **clearly identified demo assumptions** for retailer catalogs and inventory. Do **not** claim to track live branch stock or real-time prices.

**User promise:** "Pick meals that fit your budget and nutrition preferences, then get one consolidated shopping list and nearby store suggestions."  
**Prototype limitation:** The app produces **estimates and candidate shopping locations**, not a confirmed real-world fulfillment plan.

### Product principles
1. **Honesty over realism:** distinguish measured/verified, curated/estimated, and simulated data everywhere relevant.
2. **Actual calculations:** no fixed recommendations or pre-baked totals masquerading as computation.
3. **Complete journey over breadth:** finish one usable vertical slice before maps, micro-nutrients, AI, or multi-store optimization.
4. **Explainability:** every nutrient total and cost can be traced to quantities, products, units, and data sources.
5. **Local Thai relevance:** Thai-first labels and plausible Thai meals, with clear currency and serving sizes.
6. **Resilient demo:** the core journey works without external services or location permission.

## 1. Context, problem, and user

### 1.1 Problem statement
Urban home cooks encounter menu indecision, budget uncertainty, conflicting nutrition goals, leftover ingredients, and multiple nearby grocery options. A recipe site gives cooking instructions but generally does not translate a chosen meal into a coherent **purchasing plan** based on available package sizes and existing pantry stock.

### 1.2 Target audience
- Residents of Bangkok and similar Thai urban areas who cook ~3 days/week.
- Access to several chain or independent grocery stores near home, work, or commute.
- Interested in price, convenience, meal choice, calories, and macro-nutrients; nutrition tracking is optional.
- Comfortable using a mobile web app before/after work.

### 1.3 Primary persona and journey
**Mr. A**, an office worker, commutes by BTS between an apartment and office. Before returning home, he can stop at several supermarkets or convenience stores. His goal is to select a few dishes he wants to cook this week and buy only what he needs while respecting nutrition and budget preferences.

**Ideal future journey:** detect candidate stores near current and home locations -> specify constraints and pantry -> explore recipes -> choose up to 3 meals -> compute quantities/nutrients/prices -> consolidate basket -> compare shopping stops -> navigate to stores.

**YWC v0.1 journey:** choose one of **two named demo location anchors** ("near work/current" and "near home"), or optionally use current location -> browse curated recipes -> set basic constraints -> select a recipe (and, if ready, up to 3) -> compute real ingredient/nutrition totals -> subtract pantry -> build shopping basket from demo pack offers -> display candidate stores and directions, with availability disclaimer.

### 1.4 Jobs to be done
- "Help me figure out what I can cook tonight without spending too much."
- "Show whether a meal fits my protein and calorie goals."
- "Don't tell me to buy ingredients I already have."
- "When planning multiple meals, don't make me buy the same ingredient three times."
- "Tell me which nearby shops are worth checking, without pretending their stock is guaranteed."

## 2. Goals, non-goals, and scope

### 2.1 Release success (must be observable)
- Public HTTPS URL reachable without an account; source repo available on GitHub.
- User can choose between demo **work/current and home** anchors without giving location permission.
- At least **8 reviewed Thai-inspired recipes** and **20 normalized ingredients**; real calculations using quantities rather than fixed recipe nutrition/cost totals.
- User can adjust at least **budget**, **minimum protein**, and **pantry**; results respond deterministically.
- User can select a recipe, see nutrition estimates and provenance, and generate a consolidated list of **needed ingredient quantities**.
- When demo product offers are available, checkout cost accounts for real pack sizes and leftover quantity. Every displayed demo price/stock assumption is labeled.
- Show candidate store locations and an external directions link, backed by real OSM data if available and a reliable demo fallback otherwise.
- Explain the core calculations in a README or in app "How estimates work" panel; pass automated unit tests and a production build.

### 2.2 P0 vs P1 vs future
| Category | P0: interview must-have | P1: only after P0 | Post-interview |
| --- | --- | --- | --- |
| Recipes | Search/browse 8+, recipe details | Add up to 3 meals; preparation instructions | Personalization / content tools |
| Preferences | Budget, protein, exclusions; optional kcal | Cooking time, calorie range | Advanced health profiles |
| Pantry | Quantities of common owned ingredients | Pantry editing/persistence | Inventory expiration tracking |
| Nutrition | Calories, protein, carbs, fat | A few traceable micro-nutrients with unknown handling | Full nutrient coverage / cooking yield models |
| Pricing | Curated **demo offers**, package purchasing arithmetic | Compare 1-store vs up to 2-store plans | Real authorized retail integrations |
| Location | Demo area + nearby candidates and links | Explicit geolocation, manual home anchor | Real commute-route optimization |
| Data | Local static source-attributed fixtures | Optional cached OSM discovery | Scheduled ingestion / versioned catalog |
| Account | None | None | Auth/profile persistence |

### 2.3 Explicit non-goals
- No scraping retailer sites by default; no bypass of rate limits, robots, authentication, or anti-bot controls.
- No claims of verified real-time branch inventory, prices, purchase reservation, or guaranteed product availability.
- No medical advice, calorie prescription, allergy-safe certification, or micronutrient sufficiency diagnoses.
- No full BTS route optimization, payments, ordering, authentication, live AI recommendation, or microservices for v0.1.
- No unjustified real brand logos/images. Prefer self-created assets, licensed media, or simple icons.

## 3. Product requirements and acceptance tests

| ID | Requirement | Acceptance criterion |
| --- | --- | --- |
| FR-01 | Select location | Two named demo anchors (work/current and home) work; denial of GPS does not block app. |
| FR-02 | Browse and filter recipes | Filtering budget/protein/dietary exclusions has immediate, explainable results and useful empty state. |
| FR-03 | Select a recipe | Details contain ingredient amounts in standardized units, servings, nutrients and source coverage. |
| FR-04 | Pantry awareness | Entering 100 g of owned rice reduces required purchased rice by 100 g, never below zero. |
| FR-05 | Shopping aggregation | Repeated ingredients aggregate before pack selection; use remaining pantry once. |
| FR-06 | Pack pricing | For each purchased ingredient, choose enough whole packs; show checkout cost and amount left after cooking. |
| FR-07 | Nutrition arithmetic | Scale per-100-g nutrients by raw edible grams; handle missing values as **unknown/partial**, not zero. |
| FR-08 | Candidate stores | Show location, attribution and directions; mark price/stock as demo/unverified. |
| FR-09 | Provenance disclosure | Every product price identifies `simulated`, `estimate`, or `verified_catalog`; no implicit live-stock claim. |
| FR-10 | Responsive usable UI | On a small phone, core journey is complete without horizontal overflow. |
| FR-11 | Deployable | Production build, deployment, and README/setup instructions verified. |
| NFR-01 | Reliability | Core flow operates with no external calls; store lookup gracefully falls back. |
| NFR-02 | Privacy | No account or telemetry by default; geolocation only on explicit action; don't persist precise home/current coordinates. |
| NFR-03 | Correctness | Money in integer satang; amounts in standardized grams/mL; automated edge-case tests. |
| NFR-04 | Accessibility | Semantic buttons/forms, keyboard flow, labels, contrast, focus feedback, reduced-motion support. |
| NFR-05 | Security | Validate inputs, avoid secrets in frontend, render user text safely, avoid untrusted URL injection. |

### 3.1 Acceptance walkthrough (golden path)
1. Start with a **clearly labeled Bangkok demo area**. Explore available recipes; view a recipe's calories/macros.
2. Set a budget and protein goal; see rankings/eligibility change for understandable reasons.
3. Mark rice or eggs already owned with a quantity; select a recipe.
4. Open "Shopping list"; verify shortage, number of packages, checkout cost, and leftovers change.
5. View nearby stores; distinguish real mapped store places from demo offers and unverified inventory. Open a directions link.
6. Disconnect external APIs or deny location access; repeat the main flow successfully.

## 4. UX / information architecture

**Primary sections (mobile-first):**
1. **Discover** `/`: work/current vs home demo-area picker, quick goals, curated recipe cards, estimates.
2. **Recipe details** `/recipes/[slug]`: servings, raw-ingredient quantities, macros, known micro-nutrient coverage, cost breakdown.
3. **Plan** `/plan`: selected recipes, pantry editor, consolidated shortage and package basket.
4. **Shops** `/shops`: candidate store cards/map; external navigation links; no guaranteed stock.
5. **About data** `/about`: what is real vs simulated, source/license acknowledgments, calculation limitations.

**Navigation rule:** no required sign-up. Keep the entire core journey accessible in 3–5 meaningful user actions. Expose a "Demo data" marker clearly throughout cost/store views.

**UI language:** Thai-first, with optional English strings only if easily supported. Currency ฿, mass g, volume mL, servings clearly defined. Label *ingredient consumption cost* separately from *checkout cash required*.

**States to design explicitly:** loading, empty results, no suitable product offers, GPS denied, external map unavailable, missing nutrient data, insufficient budget, and stale demo catalog.

## 5. Proposed architecture

### REQ-02 interaction contract — 2026-10-30

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

### 5.1 Engineering decisions
- **Modular monolith** using Next.js App Router + TypeScript + Tailwind CSS + **shadcn/ui** for the application UI, with Lucide icons.
- Use shadcn/ui as **owned component source** generated into the repository, not as a remotely hosted theme or a replacement for the calculation engine. Adapt components to the product design, but keep domain logic separate.
- **Deterministic domain functions** under `src/lib/domain/` independent of React and network APIs.
- **Static reviewed JSON/TS fixtures** for recipe, ingredient, nutrient and offer records: easiest to test and deploy without a database.
- **Local React state** for the prototype, optionally `localStorage` for *non-sensitive* preferences and selected recipe IDs only.
- **Leaflet / react-leaflet** for store map; load client-side, with list fallback when map cannot render.
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
- For P0, provide **two preset location anchors** representing work/current and home, each with a small list of labeled demo store fixtures. They are example areas, **not inferred user addresses**. Optionally also show real OSM store locations if preverified and attributed.
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
| User data | Ephemeral session; optionally preferences/selected recipe IDs locally | No personal tracking |

Never create a `verified_catalog` claim without an actual retrievable URL, observed price and unit, and permission or permissible usage determination. Never present AI-generated nutrient numbers as verified measurements.

### 8.2 External sources and safeguards
- **USDA FoodData Central**: CC0/public-domain data; include attribution and source-specific `fdcId` in seed records. API requires a key; seed from reviewed records **before** demo and do not depend on live nutrient calls for user navigation. https://fdc.nal.usda.gov/api-guide/
- **OpenStreetMap data**: ODbL attribution and license notice; distinguish data license from map tile service policy. https://www.openstreetmap.org/copyright
- **OSM tiles**: obey tile usage and attribution; do not bulk prefetch/scrape. https://operations.osmfoundation.org/policies/tiles/
- **Overpass**: small, throttled bounded queries only and fallbacks; public instances are best-effort. https://wiki.openstreetmap.org/wiki/Overpass_API
- **Nominatim public service**: do **not** implement client-side autocomplete; strict application-wide aggregate limit (max 1 rps), proper identification, caching; preferably avoid it for the demo by using a predetermined area. https://operations.osmfoundation.org/policies/nominatim/
- **Retailers**: public pages are **not** automatically authorized APIs or permission to scrape/redistribute; no automated bulk extraction without reviewing terms/permissions. Never imply affiliation with Lotus's, Makro, Tops, 7-Eleven, or independent stores.

### 8.3 Required user-facing disclosure
> **Demo notice:** Recipes and calculations use curated ingredient data. Grocery prices and assumed retailer product selections in this prototype are simulated examples. Store locations may be real, but product availability is not checked at individual branches. Confirm prices and stock before shopping. Nutrition values are approximate.

Show a shortened version on cards/plan and a complete version on `/about`.

## 9. Security, privacy, safety, and reliability

- Location permission must be user-triggered and optional; app must start in demo mode. Do not request/stash a user's exact home address; do not log precise coordinates, and do not save them to localStorage by default.
- Validate and clamp numeric constraints (`budget`, `grams`, `radius`, `lat`, `lon`, `servings`) with Zod at input/API boundaries. Reject NaN, infinities, negative masses/prices, zero pack sizes/servings, unreasonable search radius.
- Use server-side proxy only for external calls that need security/usage controls. Keep API keys in private environment variables; never expose a USDA key via `NEXT_PUBLIC_`.
- Do not treat client-supplied product prices as authoritative when serving computations from an API; P0 pure client domain functions only consume immutable reviewed fixture records.
- Safely build external navigation URLs; validate numeric lat/lon; default to HTTPS; do not interpolate unchecked values into HTML.
- Keep unit conversions explicit; handle incomplete nutrition and unpriced ingredients gracefully.
- Support reduced motion and readable contrast; avoid medical claims or unsupported allergen guarantees.
- Build without live API dependencies; expose a visible recovery message if external store discovery or maps fail.

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
- Browser: load without user account; demo area selected; filter -> recipe -> pantry -> plan -> shops -> directions.
- Responsive: narrow phone viewport and desktop. Keyboard interaction, visible focus, labels, readable error states.
- Permission denied: no uncaught error; user can continue via demo area.
- Offline/external API failure: local recipes, calculations and store fixtures still usable.
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

**Schedule reality (as of Oct 29 night):** October 30 is the principal build/test day; October 31 is interview/demo day. Protect a release candidate before the interview. If behind, cut optional map API, extra recipes, micros, multi-meal selection, multi-store optimization before cutting the core calculation journey.

## 12. Main risks & decisions

| Risk | Impact | Mitigation / decision |
| --- | --- | --- |
| Retail inventory data inaccessible | Very high | Synthetic catalog with prominent disclaimers; never promise live availability |
| Wrong nutrition totals | High | Reviewed data, standardized grams, provenance, unit tests, unknown handling |
| Cost calculation mismatch | High | Separate consumption vs pack checkout; integer satang; aggregation first |
| External location service fails | Medium | Demo area and store fixtures, basic list/directions |
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
9. How does the app work with geolocation denied or Overpass down?
10. What tests protect the core calculations? What would change when moving to production?

**90-second suggested demo:** state the persona/problem -> select demo area -> set a budget/protein goal -> open a recipe -> show nutrient calculation -> add pantry rice -> show shopping quantities/checkout change -> view candidate shops and demo disclaimer -> finish with architecture trade-offs.

## 14. Open decisions / assumptions

### REQ-01 agreed scope — 2026-10-30

The owner agreed to this scope and the two demo areas on 2026-10-30 (“I agree, you may start now”). This records requirements approval; application functionality is not yet implemented.

- **Problem/persona:** Mr. A is a Bangkok office worker who cooks several times per week and needs to choose an affordable meal, use pantry ingredients, and understand what to buy before stopping at a candidate shop.
- **P0 journey:** choose a demo area -> browse at least 8 reviewed Thai-inspired recipes -> filter by checkout budget, minimum protein per serving and exclusions -> select one recipe batch -> enter pantry quantities -> see calculated nutrients, shortages, whole packs, checkout cost and leftovers -> inspect candidate store cards and directions. At least 20 normalized ingredients support the recipes. Unknown nutrients remain unknown; missing offers make the basket incomplete.
- **Proposed work/current anchor:** `demo-work-phaya-thai`, displayed as **ใกล้ที่ทำงาน (พื้นที่สาธิต: พญาไท)** / “Near work/current — Phaya Thai demo area.”
- **Proposed home anchor:** `demo-home-on-nut`, displayed as **ใกล้บ้าน (พื้นที่สาธิต: อ่อนนุช)** / “Near home — On Nut demo area.”
- **Anchor boundary:** these are illustrative Bangkok areas, not a detected current position or the user's actual workplace/home. Exact preset coordinates and store points will be recorded and validated in `DAT-01`/`GEO-01`; no verified branch or coordinate is asserted here. Any fictitious store point must visibly say it is fictitious.
- **Budget:** maximum cash required to buy whole packs after pantry subtraction, stored in integer satang. Use the same checkout calculation in filtering and the final basket. Show consumption cost separately as informational.
- **Data disclosure:** all initial product offers are `simulated`; branch stock is `unknown`. Display **“ราคาสาธิต · ไม่ได้ตรวจสอบสต็อกสาขา”** (“Demo prices · branch stock not checked”) alongside prices and store coverage, with the full notice from §8.3 on `/about`. Label nutrition estimates and show provenance/unknown coverage.
- **Resilience/privacy:** the core journey uses local fixtures without GPS, external APIs or a database. GPS is optional P1, only after an explicit user action; it is never requested at launch. No precise personal locations are needed for P0.
- **Implementation boundary:** Next.js App Router, strict TypeScript, pnpm, Tailwind CSS, shadcn/ui and Lucide; pure domain functions consume reviewed static fixtures. Bootstrap in `DES-01`, then run the shadcn CLI and verify generated primitives in `DES-UI-01`.
- **Deferred:** three-meal selection, multiple-store comparison, live OSM lookup/geolocation, optional map and extra micronutrients. Accounts, payments, scraping, live inventory, medical/allergen certification and route optimization remain outside v0.1.

**Trade-off for owner review:** local fixtures and simulated offers keep the interview flow reproducible and allow real arithmetic without network access. Catalog coverage is limited and cannot establish actual branch prices or availability.

**REQ-01 approval recorded:** P0 scope, Phaya Thai and On Nut demo areas, checkout-budget semantics, optional GPS, the 8-recipe/20-ingredient minimum and explicit simulated-price/unknown-stock disclosure are agreed. Dependent tasks may proceed in backlog order.

Decisions assumed for MVP; owner may revise **before coding**, not halfway through a vertical slice:
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
