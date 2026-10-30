import { describe, expect, it } from "vitest";
import type { Ingredient, NutrientsPer100g, Recipe } from "../../types";
import {
  calculateRecipeNutrients,
  type RecipeNutrientCalculationResult,
} from "./calculate-recipe-nutrients";

const knownNutrients: NutrientsPer100g = {
  kcal: 120,
  proteinG: 8,
  carbG: 12,
  fatG: 4,
  fiberG: 2,
  sodiumMg: 30,
  calciumMg: 15,
  ironMg: 0.5,
};

function makeIngredient(
  id: string,
  nutrientsPer100g: NutrientsPer100g = knownNutrients,
): Ingredient {
  return {
    id,
    nameTh: `วัตถุดิบ ${id}`,
    edibleUnit: "g",
    nutrientsPer100g,
    nutritionSource: {
      kind: "curated_estimate",
      explanation: `Test source for ${id}`,
      checkedAt: "2026-10-31",
    },
  };
}

function makeRecipe(
  ingredientItems: Recipe["ingredientItems"],
  servings = 2,
): Recipe {
  return {
    id: "recipe:test",
    slug: "test",
    nameTh: "สูตรทดสอบ",
    servings,
    minutes: 10,
    ingredientItems,
    tags: [],
    exclusionTags: [],
    instructions: ["ขั้นตอนทดสอบ"],
    sourceNote: "Test only",
  };
}

function getData(
  result: RecipeNutrientCalculationResult,
): Extract<RecipeNutrientCalculationResult, { success: true }>['data'] {
  if (!result.success) throw new Error(`Unexpected calculation errors: ${result.errors.map((error) => error.code).join(", ")}`);
  return result.data;
}

function getErrorCodes(result: RecipeNutrientCalculationResult): string[] {
  if (result.success) throw new Error("Expected nutrition calculation to fail");
  return result.errors.map((error) => error.code);
}

describe("calculateRecipeNutrients", () => {
  it("uses per-100-g values for a 100 g raw ingredient and divides a batch by servings", () => {
    const rice = makeIngredient("ingredient:rice");
    const result = calculateRecipeNutrients({
      recipe: makeRecipe([{ ingredientId: rice.id, edibleGrams: 100 }], 2),
      ingredients: [rice],
    });
    const data = getData(result);

    expect(data.batchTotals).toEqual({
      kcal: 120,
      proteinG: 8,
      carbG: 12,
      fatG: 4,
      fiberG: 2,
      sodiumMg: 30,
      calciumMg: 15,
      ironMg: 0.5,
    });
    expect(data.perServingTotals).toEqual({
      kcal: 60,
      proteinG: 4,
      carbG: 6,
      fatG: 2,
      fiberG: 1,
      sodiumMg: 15,
      calciumMg: 7.5,
      ironMg: 0.25,
    });
  });

  it("scales 250 g by 2.5 without changing the source basis", () => {
    const rice = makeIngredient("ingredient:rice");
    const result = calculateRecipeNutrients({
      recipe: makeRecipe([{ ingredientId: rice.id, edibleGrams: 250 }], 1),
      ingredients: [rice],
    });
    const data = getData(result);

    expect(data.batchTotals.kcal).toBe(300);
    expect(data.batchTotals.proteinG).toBe(20);
    expect(data.batchTotals.sodiumMg).toBe(75);
    expect(data.perServingTotals).toEqual(data.batchTotals);
  });

  it("keeps null or unreported micronutrients unknown and marks nutrient coverage", () => {
    const nutrients: NutrientsPer100g = {
      kcal: 100,
      proteinG: 5,
      carbG: 10,
      fatG: 2,
      fiberG: null,
      sodiumMg: null,
      calciumMg: 20,
    };
    const tofu = makeIngredient("ingredient:tofu", nutrients);
    const result = calculateRecipeNutrients({
      recipe: makeRecipe([{ ingredientId: tofu.id, edibleGrams: 100 }]),
      ingredients: [tofu],
    });
    const data = getData(result);

    expect(data.batchTotals.kcal).toBe(100);
    expect(data.batchTotals.sodiumMg).toBeNull();
    expect(data.batchTotals.ironMg).toBeNull();
    expect(data.completeness.sodiumMg).toBe(false);
    expect(data.completeness.ironMg).toBe(false);
    expect(data.completeness.calciumMg).toBe(true);
  });

  it("keeps a known zero distinct from an unknown value", () => {
    const zeroSodium = makeIngredient("ingredient:zero-sodium", {
      ...knownNutrients,
      sodiumMg: 0,
    });
    const result = calculateRecipeNutrients({
      recipe: makeRecipe([{ ingredientId: zeroSodium.id, edibleGrams: 100 }]),
      ingredients: [zeroSodium],
    });
    const data = getData(result);

    expect(data.batchTotals.sodiumMg).toBe(0);
    expect(data.completeness.sodiumMg).toBe(true);
  });

  it("combines repeated recipe entries and returns source references for used ingredients only", () => {
    const rice = makeIngredient("ingredient:rice");
    const bean = makeIngredient("ingredient:bean");
    const unused = makeIngredient("ingredient:unused");
    const result = calculateRecipeNutrients({
      recipe: makeRecipe([
        { ingredientId: bean.id, edibleGrams: 40 },
        { ingredientId: rice.id, edibleGrams: 60 },
        { ingredientId: bean.id, edibleGrams: 60 },
      ]),
      ingredients: [rice, bean, unused],
    });
    const data = getData(result);

    expect(data.batchTotals.kcal).toBe(192);
    expect(data.sources.map((source) => source.ingredientId)).toEqual([
      "ingredient:bean",
      "ingredient:rice",
    ]);
    expect(data.sources[0]?.provenance.kind).toBe("curated_estimate");
  });

  it("rejects zero, negative, and non-finite recipe quantities", () => {
    const rice = makeIngredient("ingredient:rice");

    for (const edibleGrams of [0, -1, Number.POSITIVE_INFINITY, Number.NaN]) {
      const result = calculateRecipeNutrients({
        recipe: makeRecipe([{ ingredientId: rice.id, edibleGrams }]),
        ingredients: [rice],
      });

      expect(getErrorCodes(result)).toContain("invalid_quantity");
    }
  });

  it("rejects invalid servings and an empty recipe", () => {
    const rice = makeIngredient("ingredient:rice");

    expect(
      getErrorCodes(
        calculateRecipeNutrients({
          recipe: makeRecipe([{ ingredientId: rice.id, edibleGrams: 100 }], 0),
          ingredients: [rice],
        }),
      ),
    ).toContain("invalid_servings");
    expect(
      getErrorCodes(
        calculateRecipeNutrients({ recipe: makeRecipe([]), ingredients: [rice] }),
      ),
    ).toContain("empty_recipe");
  });

  it("rejects missing or duplicated ingredient IDs and invalid nutrient values", () => {
    const rice = makeIngredient("ingredient:rice");
    const missingIngredient = calculateRecipeNutrients({
      recipe: makeRecipe([{ ingredientId: "ingredient:missing", edibleGrams: 100 }]),
      ingredients: [rice],
    });
    const duplicatedIngredient = calculateRecipeNutrients({
      recipe: makeRecipe([{ ingredientId: rice.id, edibleGrams: 100 }]),
      ingredients: [rice, { ...rice }],
    });
    const invalidIngredient = makeIngredient("ingredient:bad", {
      ...knownNutrients,
      sodiumMg: -1,
    });
    const invalidNutrient = calculateRecipeNutrients({
      recipe: makeRecipe([{ ingredientId: invalidIngredient.id, edibleGrams: 100 }]),
      ingredients: [invalidIngredient],
    });

    expect(getErrorCodes(missingIngredient)).toContain("missing_ingredient");
    expect(getErrorCodes(duplicatedIngredient)).toContain("duplicate_ingredient_id");
    expect(getErrorCodes(invalidNutrient)).toContain("invalid_nutrient");
  });
});
