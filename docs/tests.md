# Test and verification plan

**Status:** Verification plan only. Test infrastructure is configured in the scaffold, but dependencies could not be installed in the current environment and no application tests have run yet. See current evidence in [`../BACKLOG.md`](../BACKLOG.md).

## Project checks

Run from the repository root after dependencies install:

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

`pnpm test` may pass with an empty initial suite; once domain functions exist, add meaningful numeric and behavior tests before marking those tasks complete.

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

- Golden path: demo area -> preferences -> recipe details -> select -> pantry -> basket -> stores -> directions -> About.
- Empty filters, missing offer, unknown nutrients, invalid pantry/budget values, no selection, no complete store candidate and data loading/error states.
- GPS is not requested at launch. If an optional P1 location action is later added, test denied, unavailable and timeout recovery to the selected demo area.
- Narrow phone and desktop layout, keyboard-only navigation, visible focus, input labels, reduced motion, and no horizontal overflow.
- Core fixtures/calculations remain usable when external APIs are unavailable.

Use the acceptance criteria for the related item in [`../BACKLOG.md`](../BACKLOG.md) and the product data/correctness rules in [`../document.md`](../document.md) as the final authority.
