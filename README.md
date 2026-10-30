# Tumraigin (ทำไรกิน)

Tumraigin is a Thai-first meal discovery and grocery planning prototype. Product and domain requirements live in [`document.md`](./document.md), implementation status lives in [`BACKLOG.md`](./BACKLOG.md), and supporting references live in [`docs/`](./docs/).

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

The repository contains the Next.js App Router and Tailwind CSS bootstrap, plus an initialized shadcn/ui foundation. The `/` page is a representative UI preview: its form controls are examples and do not calculate or filter meals. The meal planning journey, domain calculations, fixtures, prices and store suggestions are not implemented. No nutrition or retailer data is included.

## UI foundation

`components.json` records the shadcn/ui Base UI/Nova setup. Generated, locally owned primitives live in `src/components/ui/` (`button`, `card`, `input`, `label`, `badge`, and `checkbox`); `src/lib/utils.ts` exports the `cn` class-merging helper. The UI dependencies include `@base-ui/react`, `class-variance-authority`, `cn`, `shadcn`, `tw-animate-css`, and `lucide-react`. The global theme uses cool blue-green surfaces, pandan-green actions, a restrained papaya-gold accent and local Thai font fallbacks; it does not fetch a web font at runtime or during build.

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

The test command currently exits successfully with no test files. Add meaningful tests as domain logic is implemented.

The bootstrap lockfile is present. `pnpm install`, lint, typecheck, the empty-suite test command, and the Webpack production build have been verified. The production server returned HTTP 200 for `/`, and the response contained the expected Thai heading and page copy; see [`docs/tests.md`](./docs/tests.md) for the exact evidence.

## Data and limitations

No recipe, nutrition, price, product or store fixtures have been added yet. The approved prototype scope plans curated ingredient and recipe data, simulated retailer offers with unknown branch stock, and clearly labeled demo locations. Do not interpret this scaffold as evidence of live prices, stock or nutritional measurements.

The core journey is planned to work from local data without an account, location permission, network API or hosted database. Data sources, licenses, calculation assumptions and known limitations must be documented when those fixtures and features are implemented.
