# Tumraigin (ทำไรกิน)

Tumraigin is **ตัวช่วยการวางแผนทำอาหารกินเองของคุณ** — a Thai-first helper for planning home-cooked meals. The planned flow is map and saved places -> optional preferences -> meal choices, plans and details -> shopping list. Product and domain requirements live in [`document.md`](./document.md), implementation status lives in [`BACKLOG.md`](./BACKLOG.md), and supporting references live in [`docs/`](./docs/).

## Source repository

The canonical source repository is the private GitHub project at <https://github.com/jarbbie/tumraigin>.

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

The `/` page implements the first step of the map-first flow: browse an OpenStreetMap view, click to choose a point or enter coordinates, name and save it, and select, rename or delete saved places. Places and the selected place are stored in this browser only. No GPS permission, geocoding, account or app API is used. If tile loading fails, coordinate entry, saved places and the demo-area option remain available.

Preferences, meal choices, recipe details, shopping-list calculations, recipe/ingredient fixtures and store suggestions are still in progress. The current map pin is a user-selected place, not a store or a stock claim.

## UI foundation

`components.json` records the shadcn/ui Base UI/Nova setup. Generated, locally owned primitives live in `src/components/ui/` (`button`, `card`, `input`, `label`, `badge`, and `checkbox`); `src/lib/utils.ts` exports the `cn` class-merging helper. The UI dependencies include `@base-ui/react`, `class-variance-authority`, `cn`, `shadcn`, `tw-animate-css`, and `lucide-react`. The map uses Leaflet directly, loaded client-side to avoid server-rendering browser APIs. The global theme uses cool blue-green surfaces, pandan-green actions, a restrained papaya-gold pin and local Thai font fallbacks; it does not fetch a web font at runtime or during build.

## Run locally

Requires Node.js 22 or newer and pnpm 10.14 or newer. The current shadcn-generated `cn` utility requires Node.js 22.

```bash
pnpm install
pnpm dev
```

The development server is available at `http://localhost:3000`.

## Checks

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

Vitest runs the repository unit tests. Add focused domain and interaction coverage as each backlog item is implemented.

The lockfile is present. Install, lint, typecheck, the current test suite, and the Webpack production build have been verified; see [`docs/tests.md`](./docs/tests.md) for task-specific evidence.

## Data and limitations

No recipe, nutrition, price, product or store fixtures have been added yet. Shared entity types are defined under `src/types/`, with runtime fixture, planning-input and saved-location validation under `src/lib/data/`. Validation requires explicit units and provenance, preserves unknown nutrients as `null`, rejects invalid saved coordinates, and rejects unverified branch-stock claims. Future curated recipes and simulated retailer offers must be labeled; do not interpret this prototype as evidence of live prices, stock or nutritional measurements.

Saved locations and future meal calculations are designed to work without an account, GPS, application API, or hosted database. Map tiles are external and may fail; coordinate entry, saved locations and the demo area provide a fallback. Tile requests reveal the viewed map area to the provider. OSM attribution and the ODbL notice are linked on the map. Data sources, licenses, calculation assumptions and known limitations must be documented as each feature is implemented.
