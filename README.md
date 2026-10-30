# Tumraigin (ทำไรกิน)

Tumraigin is **ตัวช่วยการวางแผนทำอาหารกินเองของคุณ** — a Thai-first helper for planning home-cooked meals. The planned flow is map and saved places -> optional preferences -> meal choices, plans and details -> shopping list. Product and domain requirements live in [`document.md`](./document.md), implementation status lives in [`BACKLOG.md`](./BACKLOG.md), and supporting references live in [`docs/`](./docs/).

## Source repository

The canonical source repository is <https://github.com/jarbbie/tumraigin>. It remains private until the REL-01 privacy and publishing gates are complete.

## Project references

- [`docs/specification.md`](./docs/specification.md): agreed P0 scope and feature acceptance summary.
- [`docs/api-spec.md`](./docs/api-spec.md): API boundary and contract status.
- [`docs/ui-specs.md`](./docs/ui-specs.md): routes, user-visible states, and UI/accessibility rules.
- [`docs/tests.md`](./docs/tests.md): verification plan and test coverage expectations.
- [`docs/development-workflow.md`](./docs/development-workflow.md): GitHub branch roles and feature-to-staging release flow.

`document.md` remains authoritative for product goals, domain calculations, data truth and privacy. Supporting docs add details for their area and must stay consistent with it.

## GitHub workflow

Develop each backlog feature on a `feature/<task-id>-<short-name>` branch from `staging`, then open a pull request into `staging`. Promote reviewed and verified release candidates from `staging` to `main` through a separate pull request. See [`docs/development-workflow.md`](./docs/development-workflow.md) for the full process.

## Current implementation

The app implements the core map-first cooking-planning flow:

- `/` opens on an interactive OpenStreetMap view. Click to choose a point or enter coordinates, name and save it, then select, rename or delete saved places. Places are stored in this browser only. There is no GPS prompt, geocoding, account or app API. If tiles fail, coordinate entry, saved places and the demo-area option remain available.
- `/preferences` accepts optional checkout budget, protein goal, exclusions and pantry quantities. Every field can be left blank, or the whole step can be skipped.
- `/meals` calculates and ranks meal choices from the fixture recipes and current planning inputs. It shows why a result fits or why evidence remains unknown. Existing selections stay visible when preferences change.
- `/recipes/[slug]` shows recipe quantities, preparation steps, per-serving nutrition calculated from ingredient data, missing nutrient coverage, source attribution and a simulated checkout estimate.
- `/shopping-list` shows one selected recipe batch, required/owned/shortage grams, pack counts, checkout cash and consumed-portion estimates. Editing pantry grams recalculates the basket.
- `/shops` shows the fixture's clearly fictitious demo point, approximate straight-line distance from the selected saved place (or demo area), simulated offer coverage and a Google Maps directions link. Coordinates are sent to Google Maps only when the user opens that link.
- `/about` explains nutrition sources and unknown values, simulated prices and the demo point, calculation methods, source/reuse terms, and location privacy. A shared header link makes it reachable from every route.

DAT-01 contributes a validated local dataset with 23 ingredients, eight Thai-oriented recipes, synthetic product offers and a fictitious demo-store point. All recipe nutrition, recommendation and shopping outputs are calculated from fixture inputs using the pure domain functions; fixtures do not store precomputed outcomes. Product offers and prices are simulated and branch stock is unknown. The selected planning session is held in React memory and resets on refresh; saved locations persist in this browser. A map pin remains a user-selected place, not a store or a stock claim.

## UI foundation

`components.json` records the shadcn/ui Base UI/Nova setup. Generated, locally owned primitives live in `src/components/ui/` (`button`, `card`, `input`, `label`, `badge`, and `checkbox`); `src/lib/utils.ts` exports the `cn` class-merging helper. The UI dependencies include `@base-ui/react`, `class-variance-authority`, `cn`, `shadcn`, `tw-animate-css`, and `lucide-react`. The map uses Leaflet directly, loaded client-side to avoid server-rendering browser APIs. The global theme uses cool blue-green surfaces, pandan-green actions, a restrained papaya-gold pin and local Thai font fallbacks; it does not fetch a web font at runtime or during build.

## Run locally

Requires Node.js 22 or newer and pnpm 10.14 or newer. The current shadcn-generated `cn` utility requires Node.js 22.

```bash
pnpm install
pnpm dev
```

The development server is available at `http://localhost:3000`.

To preview the production static export locally, run `pnpm build` and then `pnpm start`. The preview server binds only to `127.0.0.1`; it is not used by the GitHub Pages deployment.

## Checks

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

Vitest runs the repository unit tests. Add focused domain and interaction coverage as each backlog item is implemented.

The lockfile is present. Install, lint, typecheck, the current test suite, and the Webpack production build have been verified; see [`docs/tests.md`](./docs/tests.md) for task-specific evidence.

## Static deployment

The production build exports the App Router pages to `out/` for static hosting. Recipe slugs are rendered at build time from the reviewed fixture list; the app has no runtime server API or database. GitHub Pages deployment is defined by [`.github/workflows/deploy-pages.yml`](./.github/workflows/deploy-pages.yml) and runs only from `main` (or when started manually). The workflow prefixes routes and assets with `/tumraigin` for the account Pages URL. Set `GITHUB_PAGES_BASE_PATH` to another path only when publishing under a different project subpath. Hosting is not live until the repository and Pages settings are explicitly enabled and a deployment succeeds.

## Data and limitations

Fixture data lives under `src/data/` and is runtime-validated against shared contracts in `src/types/` and `src/lib/data/`. Most nutrition values are curated from the Concise ASEAN Food Composition Tables (2014); one generic oil estimate uses USDA SR28. Unknown nutrients remain `null`, including source entries marked presumed-zero or missing. The source and reuse terms are documented in [`src/data/README.md`](./src/data/README.md). Prices and pack sizes are invented, visibly simulated inputs and do not represent current retailer prices or branch stock. The demo-store point is fictitious. Do not interpret the prototype as evidence of live prices, stock, medically precise nutrition or allergy safety.

The ASEANFOODS 2014 source permits attributed noncommercial use, while reproduction for resale or other commercial uses (including educational purposes) may incur fees. Confirm permission or replace these values before public/commercial redistribution or an educational product/service. USDA FoodData Central data are public domain/CC0; the oil profile is still labeled as a curated proxy and does not claim a verified FDC ID.

Saved locations and future meal calculations are designed to work without an account, GPS, application API, or hosted database. Map tiles are external and may fail; coordinate entry, saved locations and the demo area provide a fallback. Tile requests reveal the viewed map area to the provider. Opening a directions link sends the selected origin and candidate destination coordinates to Google Maps. OSM attribution and the ODbL notice are linked on the map. Data sources, licenses, calculation assumptions and known limitations must be documented as each feature is implemented.
