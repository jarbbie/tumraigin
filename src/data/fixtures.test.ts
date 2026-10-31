import { describe, expect, it } from "vitest";
import { demoPlanningScenarios } from "./demo-scenarios";
import { fixtureDataset } from "./fixtures";

describe("curated prototype fixtures", () => {
  it("loads a validated dataset with the minimum recipe and ingredient coverage", () => {
    expect(fixtureDataset.ingredients.length).toBeGreaterThanOrEqual(20);
    expect(fixtureDataset.recipes.length).toBeGreaterThanOrEqual(8);
    expect(fixtureDataset.productOffers.length).toBeGreaterThan(0);
    expect(fixtureDataset.stores).toHaveLength(1);
  });

  it("uses normalized raw edible quantities with plausible per-serving totals", () => {
    const riceId = "ingredient:jasmine-rice";

    for (const recipe of fixtureDataset.recipes) {
      const totalRawGrams = recipe.ingredientItems.reduce(
        (total, item) => total + item.edibleGrams,
        0,
      );
      const gramsPerServing = totalRawGrams / recipe.servings;
      const riceAmount = recipe.ingredientItems.find((item) => item.ingredientId === riceId);

      expect(recipe.servings).toBe(2);
      expect(gramsPerServing).toBeGreaterThanOrEqual(100);
      expect(gramsPerServing).toBeLessThanOrEqual(300);
      expect(riceAmount?.edibleGrams).toBe(120);
      expect(recipe.ingredientItems.every((item) => item.edibleGrams > 0)).toBe(true);
    }
  });

  it("preserves unavailable nutrient values as null and retains reported values", () => {
    const chicken = fixtureDataset.ingredients.find(
      (ingredient) => ingredient.id === "ingredient:chicken-breast",
    );
    const oysterMushroom = fixtureDataset.ingredients.find(
      (ingredient) => ingredient.id === "ingredient:oyster-mushroom",
    );
    const lemongrass = fixtureDataset.ingredients.find(
      (ingredient) => ingredient.id === "ingredient:lemongrass",
    );

    expect(chicken?.nutrientsPer100g.carbG).toBeNull();
    expect(chicken?.nutrientsPer100g.fiberG).toBeNull();
    expect(oysterMushroom?.nutrientsPer100g.fiberG).toBe(2.3);
    expect(lemongrass?.nutrientsPer100g.fiberG).toBeNull();
  });

  it("traces every ingredient to a reviewed USDA FDC SR Legacy record", () => {
    const expectedFdcIds = new Set([
      169756, 171474, 168312, 171287, 169230, 172232, 170106, 170379,
      169979, 169975, 168580, 169961, 169231, 168573, 174529, 174277,
      171605, 170499, 172476, 170393, 168409, 172370,
    ]);
    const direct = fixtureDataset.ingredients.filter(
      (ingredient) => ingredient.nutritionSource.kind === "usda",
    );
    const proxies = fixtureDataset.ingredients.filter(
      (ingredient) => ingredient.nutritionSource.kind === "curated_estimate",
    );

    expect(direct).toHaveLength(14);
    expect(proxies).toHaveLength(9);

    for (const ingredient of fixtureDataset.ingredients) {
      const source = ingredient.nutritionSource;
      const reference = source.kind === "usda"
        ? source
        : source.kind === "curated_estimate" ? source.reference : undefined;

      expect(reference).toBeDefined();
      if (!reference) continue;
      expect(expectedFdcIds.has(reference.fdcId)).toBe(true);
      expect(reference.recordDescription.trim().length).toBeGreaterThan(0);
      expect(reference.sourceUrl).toBe("https://fdc.nal.usda.gov/download-datasets/");
      if (source.kind === "curated_estimate") {
        expect(source.explanation).toContain("proxy");
        expect(source.explanation).toContain("may differ");
      }
    }
  });

  it("labels every offer simulated with unknown stock and keeps the demo point fictitious", () => {
    expect(
      fixtureDataset.productOffers.every(
        (offer) =>
          offer.provenance.kind === "simulated" &&
          offer.stockStatus === "unknown" &&
          offer.displayName.includes("จำลอง") &&
          Number.isInteger(offer.priceSatang),
      ),
    ).toBe(true);

    const demoStore = fixtureDataset.stores[0];
    expect(demoStore?.locationSource).toBe("demo");
    expect(demoStore?.displayName).toContain("ไม่ใช่สาขาจริง");
    expect(demoStore?.osmUrl).toBeUndefined();
  });

  it("has a simulated offer for every ingredient used by a recipe", () => {
    const offeredIngredientIds = new Set(
      fixtureDataset.productOffers.map((offer) => offer.ingredientId),
    );
    const usedIngredientIds = new Set(
      fixtureDataset.recipes.flatMap((recipe) =>
        recipe.ingredientItems.map((item) => item.ingredientId),
      ),
    );

    expect([...usedIngredientIds].every((ingredientId) => offeredIngredientIds.has(ingredientId))).toBe(
      true,
    );
  });

  it("provides three distinct preference input profiles without hardcoded outputs", () => {
    const profiles = demoPlanningScenarios.map(
      ({ maxCheckoutBudgetSatang, minProteinGPerServing }) =>
        `${maxCheckoutBudgetSatang}:${minProteinGPerServing}`,
    );
    const ids = demoPlanningScenarios.map((scenario) => scenario.id);

    expect(demoPlanningScenarios).toHaveLength(3);
    expect(new Set(profiles).size).toBe(3);
    expect(new Set(ids).size).toBe(3);
    expect(
      demoPlanningScenarios.every(
        (scenario) =>
          Number.isInteger(scenario.maxCheckoutBudgetSatang) &&
          scenario.maxCheckoutBudgetSatang >= 0 &&
          scenario.minProteinGPerServing > 0,
      ),
    ).toBe(true);
  });
});
