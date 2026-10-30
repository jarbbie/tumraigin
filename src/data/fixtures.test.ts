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

  it("accepts null nutrient coverage and never encodes 0p as a measured zero", () => {
    const chicken = fixtureDataset.ingredients.find(
      (ingredient) => ingredient.id === "ingredient:chicken-breast",
    );
    const oysterMushroom = fixtureDataset.ingredients.find(
      (ingredient) => ingredient.id === "ingredient:oyster-mushroom",
    );

    expect(chicken?.nutrientsPer100g.carbG).toBeNull();
    expect(chicken?.nutrientsPer100g.fiberG).toBeNull();
    expect(oysterMushroom?.nutrientsPer100g.fiberG).toBeNull();
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
