import { describe, expect, it } from "vitest";
import type { Ingredient, ProductOffer, Recipe } from "../../types";
import {
  rankRecipes,
  type RecipeRankingResult,
} from "./rank-recipes";

function makeIngredient(
  id: string,
  proteinG: number | null,
): Ingredient {
  return {
    id,
    nameTh: `วัตถุดิบ ${id}`,
    edibleUnit: "g",
    nutrientsPer100g: {
      kcal: 100,
      proteinG,
      carbG: 10,
      fatG: 2,
    },
    nutritionSource: {
      kind: "curated_estimate",
      explanation: `Test source for ${id}`,
      checkedAt: "2026-10-31",
    },
  };
}

function makeRecipe(
  id: string,
  ingredientId: string,
  exclusionTags: string[] = [],
): Recipe {
  return {
    id,
    slug: id.replace("recipe:", ""),
    nameTh: `เมนู ${id}`,
    servings: 2,
    minutes: 10,
    ingredientItems: [{ ingredientId, edibleGrams: 100 }],
    tags: [],
    exclusionTags,
    instructions: ["ขั้นตอนทดสอบ"],
    sourceNote: "Test only",
  };
}

function makeOffer(
  ingredientId: string,
  priceSatang = 1_000,
): ProductOffer {
  return {
    id: `offer:${ingredientId}`,
    ingredientId,
    retailerChainId: "chain:demo",
    displayName: "แพ็กจำลอง",
    edibleQuantityGrams: 250,
    priceSatang,
    provenance: { kind: "simulated", explanation: "Synthetic test offer" },
    stockStatus: "unknown",
  };
}

function getData<T>(result: RecipeRankingResult<T>): T {
  if (!result.success) {
    throw new Error(`Unexpected ranking errors: ${result.errors.map((error) => error.code).join(", ")}`);
  }
  return result.data;
}

function getErrorCodes(result: RecipeRankingResult<unknown>): string[] {
  if (result.success) throw new Error("Expected recipe ranking to fail");
  return result.errors.map((error) => error.code);
}

describe("rankRecipes", () => {
  it("keeps all choices eligible and labels skipped preferences as unfiltered", () => {
    const ingredient = makeIngredient("ingredient:rice", null);
    const recipes = [makeRecipe("recipe:z", ingredient.id), makeRecipe("recipe:a", ingredient.id)];
    const result = rankRecipes({
      recipes,
      ingredients: [ingredient],
      offers: [],
      candidateRetailerChainIds: ["chain:demo"],
    });
    const data = getData(result);

    expect(data.rankedRecipes.map((entry) => entry.recipeId)).toEqual(["recipe:a", "recipe:z"]);
    expect(data.rankedRecipes.every((entry) => entry.eligibility === "eligible")).toBe(true);
    expect(data.rankedRecipes[0]?.reasons[0]?.code).toBe("preferences_skipped");
    expect(data.eligibleRecipeIds).toEqual(["recipe:a", "recipe:z"]);
  });

  it("uses checkout cash for the budget and accepts an exact threshold", () => {
    const ingredient = makeIngredient("ingredient:rice", 20);
    const recipe = makeRecipe("recipe:rice", ingredient.id);
    const input = {
      recipes: [recipe],
      ingredients: [ingredient],
      offers: [makeOffer(ingredient.id)],
      candidateRetailerChainIds: ["chain:demo"],
    };

    const exact = getData(rankRecipes({ ...input, preferences: { maxCheckoutBudgetSatang: 1_000 } }));
    const over = getData(rankRecipes({ ...input, preferences: { maxCheckoutBudgetSatang: 999 } }));

    expect(exact.rankedRecipes[0]).toMatchObject({
      eligibility: "eligible",
      budgetAssessment: "meets",
      checkoutCostSatang: 1_000,
    });
    expect(over.rankedRecipes[0]).toMatchObject({
      eligibility: "ineligible",
      budgetAssessment: "exceeds",
    });
    expect(over.rankedRecipes[0]?.selectedBasketCandidate?.consumedCostSatang).toBe(400);
  });

  it("checks minimum protein per serving rather than batch protein", () => {
    const ingredient = makeIngredient("ingredient:beans", 20);
    const recipe = makeRecipe("recipe:beans", ingredient.id);
    const result = rankRecipes({
      recipes: [recipe],
      ingredients: [ingredient],
      offers: [makeOffer(ingredient.id)],
      candidateRetailerChainIds: ["chain:demo"],
      preferences: { minProteinGPerServing: 10 },
    });
    const below = rankRecipes({
      recipes: [recipe],
      ingredients: [ingredient],
      offers: [makeOffer(ingredient.id)],
      candidateRetailerChainIds: ["chain:demo"],
      preferences: { minProteinGPerServing: 10.1 },
    });

    expect(getData(result).rankedRecipes[0]).toMatchObject({
      eligibility: "eligible",
      proteinAssessment: "meets",
      proteinGPerServing: 10,
    });
    expect(getData(below).rankedRecipes[0]).toMatchObject({
      eligibility: "ineligible",
      proteinAssessment: "below",
    });
  });

  it("applies dietary exclusion tags as hard filters", () => {
    const ingredient = makeIngredient("ingredient:poultry", 20);
    const recipe = makeRecipe("recipe:poultry", ingredient.id, ["poultry"]);
    const result = rankRecipes({
      recipes: [recipe],
      ingredients: [ingredient],
      offers: [makeOffer(ingredient.id)],
      candidateRetailerChainIds: ["chain:demo"],
      preferences: { excludedTags: ["poultry"] },
    });
    const data = getData(result);

    expect(data.rankedRecipes[0]).toMatchObject({ eligibility: "ineligible" });
    expect(data.rankedRecipes[0]?.reasons.map((reason) => reason.code)).toContain("excluded_tag");
    expect(data.eligibleRecipeIds).toEqual([]);
  });

  it("keeps unknown protein or incomplete checkout out of the eligible set", () => {
    const ingredient = makeIngredient("ingredient:unknown", null);
    const recipe = makeRecipe("recipe:unknown", ingredient.id);
    const result = rankRecipes({
      recipes: [recipe],
      ingredients: [ingredient],
      offers: [],
      candidateRetailerChainIds: ["chain:demo"],
      preferences: {
        minProteinGPerServing: 1,
        maxCheckoutBudgetSatang: 0,
      },
    });
    const entry = getData(result).rankedRecipes[0];

    expect(entry).toMatchObject({
      eligibility: "unknown",
      proteinAssessment: "unknown",
      budgetAssessment: "unknown",
      checkoutCostSatang: null,
    });
    expect(entry?.reasons.map((reason) => reason.code)).toEqual(
      expect.arrayContaining(["protein_unknown", "checkout_unknown"]),
    );
  });

  it("lets pantry-covered ingredients satisfy a zero checkout budget without an offer", () => {
    const ingredient = makeIngredient("ingredient:rice", 20);
    const recipe = makeRecipe("recipe:rice", ingredient.id);
    const result = rankRecipes({
      recipes: [recipe],
      ingredients: [ingredient],
      offers: [],
      candidateRetailerChainIds: ["chain:demo"],
      preferences: {
        maxCheckoutBudgetSatang: 0,
        pantry: [{ ingredientId: ingredient.id, edibleGrams: 100 }],
      },
    });
    const entry = getData(result).rankedRecipes[0];

    expect(entry).toMatchObject({
      eligibility: "eligible",
      budgetAssessment: "meets",
      checkoutCostSatang: 0,
    });
    expect(entry?.reasons.map((reason) => reason.code)).toContain("uses_pantry");
  });

  it("sorts by eligibility, goal match, checkout cost, then recipe ID", () => {
    const lowCost = makeIngredient("ingredient:low-cost", 20);
    const highProtein = makeIngredient("ingredient:high-protein", 40);
    const recipes = [
      makeRecipe("recipe:z-low-cost", lowCost.id),
      makeRecipe("recipe:b-high-protein", highProtein.id),
      makeRecipe("recipe:a-high-protein", highProtein.id),
    ];
    const result = rankRecipes({
      recipes,
      ingredients: [lowCost, highProtein],
      offers: [makeOffer(lowCost.id, 500), makeOffer(highProtein.id, 1_000)],
      candidateRetailerChainIds: ["chain:demo"],
      preferences: { minProteinGPerServing: 10 },
    });

    expect(getData(result).rankedRecipes.map((entry) => entry.recipeId)).toEqual([
      "recipe:a-high-protein",
      "recipe:b-high-protein",
      "recipe:z-low-cost",
    ]);
  });

  it("returns an empty result for an empty recipe set", () => {
    const result = rankRecipes({
      recipes: [],
      ingredients: [],
      offers: [],
      candidateRetailerChainIds: [],
    });

    expect(getData(result)).toMatchObject({
      rankedRecipes: [],
      eligibleRecipeIds: [],
      unknownRecipeIds: [],
      ineligibleRecipeIds: [],
    });
  });

  it("rejects invalid preferences and reports broken recipe references", () => {
    const ingredient = makeIngredient("ingredient:rice", 20);
    const recipe = makeRecipe("recipe:rice", ingredient.id);
    const common = {
      recipes: [recipe],
      ingredients: [ingredient],
      offers: [makeOffer(ingredient.id)],
      candidateRetailerChainIds: ["chain:demo"],
    };
    const invalidPreferences = rankRecipes({
      ...common,
      preferences: { maxCheckoutBudgetSatang: -1, minProteinGPerServing: Number.NaN },
    });
    const unknownExclusion = rankRecipes({
      ...common,
      preferences: { excludedTags: ["unknown-tag"] },
    });
    const missingIngredient = rankRecipes({
      ...common,
      recipes: [makeRecipe("recipe:missing", "ingredient:missing")],
    });

    expect(getErrorCodes(invalidPreferences)).toContain("invalid_preferences");
    expect(getErrorCodes(unknownExclusion)).toContain("invalid_preferences");
    expect(getErrorCodes(missingIngredient)).toContain("domain_calculation_failed");
  });
});
