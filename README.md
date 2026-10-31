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

- `/` opens on an interactive OpenStreetMap view. Submit a place name and choose a Photon result, or pin the map; name and save multiple places, then select, rename or delete them. Coordinates are internal and never typed or shown. Saved places stay in this browser. There is no GPS prompt, account or app API route. If tiles or Photon search fail, map pinning, saved places and the demo-area option remain available.
- `/preferences` accepts optional checkout budget, protein goal, exclusions and pantry quantities. Every field can be left blank, or the whole step can be skipped.
- `/meals` calculates and ranks meal choices from the fixture recipes and current planning inputs. It shows why a result fits or why evidence remains unknown. Existing selections stay visible when preferences change.
- `/recipes/[slug]` shows recipe quantities, preparation steps, per-serving nutrition calculated from ingredient data, missing nutrient coverage, source attribution and a simulated checkout estimate.
- `/shopping-list` shows one selected recipe batch, required/owned/shortage grams, pack counts, checkout cash and consumed-portion estimates. Editing pantry grams recalculates the basket.
- `/shops` shows the fixture's clearly fictitious demo point, approximate straight-line distance from the selected saved place (or demo area), simulated offer coverage and a Google Maps directions link. Coordinates are sent to Google Maps only when the user opens that link.
- `/about` explains nutrition sources and unknown values, simulated prices and the demo point, calculation methods, source/reuse terms, and location privacy. A shared header link makes it reachable from every route.

DAT-01 contributes a validated local dataset with 23 ingredients, eight Thai-oriented recipes, synthetic product offers and a fictitious demo-store point. All recipe nutrition, recommendation and shopping outputs are calculated from fixture inputs using the pure domain functions; fixtures do not store precomputed outcomes. Product offers and prices are simulated and branch stock is unknown. The selected planning session is held in React memory and resets on refresh; saved locations persist in this browser. A map pin remains a user-selected place, not a store or a stock claim. Submitted place-name searches go to the public Photon demo; its availability is best-effort and its browser-side request spacing is not a shared traffic limit.

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
pnpm exec playwright install chromium # one time before the browser test
pnpm test:e2e
PLAYWRIGHT_HOSTED_URL=https://tumraigin.peeranat-0709.chatgpt.site pnpm test:e2e:hosted
pnpm build
```

Vitest runs the repository unit tests under `src/`. `pnpm test:e2e` builds the static export with the `/tumraigin` base path and uses Playwright Chromium against the production preview server; it checks submit-to-search, result selection, map pinning, multiple saved places without coordinate fields, the skippable preferences, meal details, pantry subtraction, pack rounding and checkout totals. Search responses are mocked in browser tests so CI does not depend on Photon. `pnpm test:e2e:hosted` uses a separate config for the map-first journey against the public Site at its root path. The hosted test blocks OpenStreetMap tile requests to verify the map fallback. GitHub Actions installs Chromium and runs the hosted check on release PRs to `main` and pushes to `main`.

The lockfile is present. Lint, typecheck, 88 unit tests across 9 files, 3 Playwright production-browser tests, and the Webpack production build have been verified; see [`docs/tests.md`](./docs/tests.md) for task-specific evidence.

## Deployment

The public interview prototype is available at [tumraigin.peeranat-0709.chatgpt.site](https://tumraigin.peeranat-0709.chatgpt.site). The Sites service reports the Site as public and active with version 2 live; its production deployment succeeded on 2026-10-31.

The published app is a static Next.js export built at the root path (without a GitHub Pages base path). Version 2 was built from staging commit 23060acad9b21adfc1658d3c8df2292b934941c6 and saved in the Site artifact repository as commit ac72f03f69b9bc4e69d1c9f46804c270b8154d03. That artifact repository contains generated public assets and the hosting manifest; it is not the canonical GitHub source tree. The canonical source repository remains private while its existing history and issue/PR records are reviewed for a safe public source path.

The GitHub Pages workflow remains in the repository, but its observed release run stopped at Pages configuration because no Pages site is enabled. The public Sites URL is the current demo. The hosted map-to-shopping journey passed the checked-in Playwright smoke test against version 2 on 2026-10-31. REL-01 remains partial because the canonical source repository is private and the public Site artifact does not yet provide a public reviewed source commit.
## Data and limitations

Fixture data lives under `src/data/` and is runtime-validated against shared contracts in `src/types/` and `src/lib/data/`. The 23 per-100-g ingredient profiles use reviewed USDA FoodData Central SR Legacy records (April 2018), with an FDC ID and record description attached to each ingredient. Nine ingredients use an explicitly disclosed close-record proxy without adjusting its source values. Unknown or unreported nutrients remain `null`. FoodData Central states that its data are public domain under CC0 1.0 and requests source attribution; the app uses a reviewed static download and does not call the USDA API. See [`src/data/README.md`](./src/data/README.md) for provenance and limits. Prices and pack sizes are invented, visibly simulated inputs and do not represent current retailer prices or branch stock. The demo-store point is fictitious. Do not interpret the prototype as evidence of live prices, stock, medically precise nutrition or allergy safety.

Saved locations and meal calculations work without an account, GPS, application API, or hosted database. Place-name search calls the Photon public demo only after the user submits a query; requests are serialized and results cached in memory. Photon is best-effort and may throttle excessive use, so map pinning, saved locations, and the demo area provide fallbacks. Search queries go to Photon; map tile requests reveal the viewed map area to the tile provider. Users can pin sensitive places without submitting their name. Opening a directions link sends the selected origin and candidate destination coordinates to Google Maps. OSM attribution and the ODbL notice are linked on the map. See [`docs/api-spec.md`](docs/api-spec.md) for limits and behavior.
