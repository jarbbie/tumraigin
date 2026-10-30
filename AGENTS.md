# AGENTS.md — Codex instructions for Tumraigin (ทำไรกิน)

You are a coding assistant contributing to **Tumraigin**, a Thai-first helper for planning home-cooked meals and the groceries needed for them. Its v0.1 release is a **deployed interactive YWC21 interview prototype** due **2026-10-31** (Asia/Bangkok).

## 1. Read these before any changes
1. `document.md`: product objective, user journey, scope, data contracts, calculations, accuracy/privacy rules, architectural decisions.
2. `BACKLOG.md`: current task status, priority, dependencies, tests, and release gates.
3. `README.md` and the current codebase, if present.
4. Read the supporting references in `docs/` when present: `specification.md` for feature requirements, `api-spec.md` for API contracts, `ui-specs.md` for screen behavior and visual/accessibility decisions, and `tests.md` for test coverage and verification expectations.

`document.md` remains the product and domain source of truth. The files under `docs/` add implementation detail within their named areas; they must not silently change product scope, calculations, privacy rules, or provenance requirements. If the docs disagree, report the conflict and preserve `document.md` until the owner decides.

**Do not start implementing the whole backlog in one pass.** Select **one small, highest-priority unblocked task**, explain the approach and affected files, then implement and verify it. Wait for the owner's choice if there are multiple reasonable architectural/product directions.

If the codebase contradicts these documents, **report the conflict before changing assumptions**. Do not silently rewrite the product scope. Maintain files as the source of truth.

## 2. Product invariant: what we must never misrepresent
- **Real calculations** are required. Never hardcode nutrition totals, prices, recommendation output, or shopping lists merely to make the UI appear functional.
- **Simulated grocery offers and stock are not real retailer facts.** Every UI that refers to example price or store coverage must visibly label the assumption. A physical store's OSM location does not prove inventory in that branch.
- Do not fabricate USDA FoodData Central IDs, provenance URLs, licensing statements, quotes, store branches, or nutrition measurements. Prefer `null`/"unknown" to invented data. If fixtures are temporary, label them `simulated` or `curated_estimate`.
- No default retailer scraping or unauthorized APIs. Never bypass protections or flood OSM/Nominatim/Overpass or tile servers. Read service policies before integration.
- This is **not** a medical or allergen-certifying application. Show estimates and uncertainty appropriately.
- The core journey must work without location permission, external API connectivity, or a server database.

## 3. Technical direction (unless owner explicitly approves a change)
- Next.js **App Router**, TypeScript with `strict: true`, Tailwind CSS, **shadcn/ui**, Lucide icons, pnpm.
- `DES-01` bootstraps Next.js/Tailwind; `DES-UI-01` initializes shadcn/ui and verifies generated component imports. **Do not claim shadcn/ui is already installed before the repository exists or the CLI runs.**
- A **modular monolith**. No microservices, separate Rust/Go server, auth, payments, queues, Kafka, Kubernetes, model training, or managed DB in v0.1.
- Domain functions under `src/lib/domain/` are **pure**, typed, deterministic, and independent of React, fetch, browser state, and external providers.
- Static reviewed fixture data under `src/data/`; validate shape, uniqueness, references and provenance.
- Client state is enough for v0.1. Per the owner's explicit updated requirement, browser `localStorage` may retain only locations that a user manually picked and explicitly named on the map, plus the selected saved-location ID; never retain device GPS coordinates. Provide rename, delete-one, and clear-all actions. Keep preferences and selected recipe IDs local as before.
- Use integer `priceSatang` internally and raw edible grams for calculations; convert for display at the edges.
- Use `null` for unavailable nutrients, never automatic zero. Missing-priced ingredients cause an **incomplete** basket total.
- The map is the P0 first step and must be client-rendered to avoid SSR issues. If Leaflet/tiles fail, render the saved-location list and named demo-area path so the user can continue; store cards remain available when relevant.
- Prefer no new dependency if a small, well-tested pure function suffices.

## 4. How to work on each backlog item
**Preflight**
1. Read the relevant spec/acceptance criteria and inspect existing code.
2. Report task ID, scope, dependencies, assumptions, files intended to change, and risks.
3. If asked for design/planning only, do not modify code. If asked to implement, proceed only within the selected item.

**Implementation**
4. Add or amend **tests for numeric/domain logic first** when practical. Favor readable functions and small changes over clever abstractions.
5. Use React components for display; keep business logic in domain functions. Validate inputs at boundaries with explicit error states.
6. Preserve accessibility, mobile behavior, data source labels and error fallbacks.
7. Do not introduce new major architecture or additional feature scope without agreement.

**Verification and handoff**
8. Run relevant tests; at checkpoints run `pnpm lint`, `pnpm typecheck`, `pnpm test`, `pnpm build` when scripts are configured. If a command can't run, say why: **never claim a pass you haven't observed**.
9. Summarize what changed, filenames, test output/result, unresolved issues, and how to manually verify.
10. Update only the completed task's checkbox/status and related notes in `BACKLOG.md`. Mark `Done` **only if its acceptance criteria are met**. Otherwise use `Blocked`/`Partial` and state the blocker.
11. Explain **why the solution works** and one key design trade-off in plain language so the student developer can defend it at interview.
12. Stop after the selected task; don't begin the next task unless asked.

## 5. Style and conventions
- Favor explicit function names such as `calculateRecipeNutrients`, `aggregateRequiredIngredients`, `subtractPantry`, `calculatePackPurchase`, `rankRecipes`, `haversineMeters`.
- Use `type` or interfaces consistently and types shared from `src/types/`. Avoid `any`, unsafe non-null assertions, magic numbers, and silent fallbacks.
- Keep domain IO as parameter objects with explicit units (`edibleGrams`, `priceSatang`, `sodiumMg`).
- Keep display math (e.g. Thai baht formatting) out of domain functions. Handle NaN/infinity and invalid data explicitly.
- Use **shadcn/ui** for common interactive primitives (buttons, cards, inputs, labels, checkboxes and other components only as needed), while retaining semantic HTML and native controls whenever simpler. Preserve aria labels, visible focus, keyboard access, motion-reduction support and responsive mobile layouts.
- Initialize shadcn/ui using the current official Next.js CLI after Tailwind and `@/*` alias are set (`pnpm dlx shadcn@latest init`); add only used primitives (`pnpm dlx shadcn@latest add button card input label badge checkbox` initially). Verify `components.json`, `src/components/ui/`, `src/lib/utils.ts`, CSS theme variables, and imports. Do not use `add --all`.
- Treat `src/components/ui/` as locally owned **generic primitives**; compose product-specific UI in `src/features/` or `src/components/shared/`. Do not put nutrition, pricing, recommendation or shopping logic inside generated UI files.
- Use consistent Tailwind/theme tokens rather than scattering arbitrary colors. Customize shadcn components for the Thai-first Tumraigin visual identity; don't blindly keep a stock demo/dashboard aesthetic. Inspect third-party registry components before adoption; avoid unnecessary registries/dependencies.
- Use immutable data transformations and deterministic sorting; avoid time-dependent logic inside ranking tests.
- Comments should clarify **why**; don't restate obvious code.
- Do not dump a giant framework abstraction or generically scaffold unused services.
- Prefer a small, well-explained conventional solution over a complicated "enterprise" pattern.

## 6. Test expectations and examples
Core domain tests must cover these scenarios:
- Per-100-g nutrient scaling and per-serving division; missing micro-nutrient stays unknown.
- Aggregating shared recipe ingredients before subtracting pantry; shortage never negative.
- Exact pack boundaries (250 g requires one 250 g pack; 251 g requires two); zero demand costs zero.
- Missing offer => incomplete cost, not a falsely cheap/full basket.
- Budget consistency (checkout vs consumed), integer satang, stable recommendation tie-breaks.
- Explicit exclusion handling, no suitable recipe, invalid user values.
- Store distance is *straight-line*; invalid coords fail validation.
- No outward claim of verified stock for simulated offers.

If adding UI tests, assert visible labels and user interaction outcomes rather than internal implementation details.

## 7. External data and location safety
- First screen opens on an interactive map centered on a named **demo area**, not an immediate geolocation prompt. The map is a P0 step; if tiles fail, keep the saved-location list and demo-area path usable.
- `navigator.geolocation` is not used on launch. The owner explicitly requested that users may manually pick, name, and save map locations for future use. Store those user-submitted names and coordinates in browser `localStorage` only, with select, rename, delete-one, and clear-all controls. Do not sync or log saved locations. A map tile provider receives requests for the visible viewport; disclose that external map tiles are loaded.
- Never store device GPS coordinates. If a current-location action is considered later, request it only on user click and provide denied/timeout fallbacks.
- A user-saved pin is not a `Store` fixture and does not establish a retailer, offer, or inventory fact.
- OSM requires attribution and ODbL license link. Public tile servers and Overpass/Nominatim have policies, best-effort availability, and request constraints.
- **No client-side autocomplete against public Nominatim**; if ever used, identify the app, cache, obey aggregate 1 request/second limit and get explicit owner approval for the integration.
- Do not expose USDA or other API keys via `NEXT_PUBLIC_*` or commits. Review `.gitignore` and `.env.example`.
- Do not hotlink arbitrary retailer product images or claim brand affiliation.

## 8. Release and version-control rules
- The priority is a functional deployed v0.1 for Oct 31; **protect the vertical slice**. The map-first saved-location chooser is P0. Defer live place lookup, extra nutrient categories, scraping, route optimization, user accounts, or multi-store solvers if P0 is incomplete.
- Follow [`docs/development-workflow.md`](docs/development-workflow.md): use `main` for releases, `staging` for integration, and one `feature/<task-id>-<short-name>` branch from the latest `staging` for each feature. Commit and push feature work on its feature branch, then propose it to `staging` by pull request; do not develop directly on `main` or `staging`.
- The owner has authorized this branch workflow for project development. Merging to `main`, deploying, changing repository visibility/settings, modifying remote infrastructure, or exposing a key still requires explicit owner authorization.
- Avoid destructive commands or overwriting unrelated local changes. Inspect status/diff before broad edits.
- If a task demands a risky change, explain options and ask for approval. Keep feature flags or an easy fallback when appropriate.
- README must state **what is implemented**, **what is simulated**, **how to run/test**, **data sources/licenses**, and **known limitations**.
- Document shadcn/ui initialization, generated component files, and any changed theme tokens or nonstandard UI dependencies when `DES-UI-01` is completed.

## 9. SDLC ownership
| Phase | Owner decision | Codex assistance |
| --- | --- | --- |
| Requirements | Approves scope/persona/acceptance | Translate to precise cases, reveal ambiguities |
| Design | Approves data and architecture trade-offs | Propose modules/types and sketches |
| Implementation | Reviews and understands code | Implement one backlog item at a time |
| Verification | Verifies behavior and knows why | Run tests, explain failures and corrections |
| Deployment | Controls accounts, credentials, release | Produce checklist, perform authorized actions only |
| Maintenance | Decides what to expand | Track debt, docs, next backlog |

**Learning requirement:** After each important domain task, give the owner a concise teach-back covering: input -> transformation -> output -> edge cases -> time complexity (if meaningful) -> how a test proves correctness. The owner should be able to explain the code without relying on generated text.

## 10. Definition of done
A change is complete only when it meets the corresponding `BACKLOG.md` acceptance criteria, has appropriate tests, compiles/builds as applicable, labels assumptions clearly, and can be explained by the owner. Never mark a task done on code generation alone.
