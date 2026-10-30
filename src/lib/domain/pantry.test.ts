import { describe, expect, it } from "vitest";
import type { PantryItem, Recipe } from "../../types";
import {
  aggregateRequiredIngredients,
  subtractPantry,
  type PantryCalculationResult,
} from "./pantry";

function makeRecipe(
  id: string,
  ingredientItems: Recipe["ingredientItems"],
): Recipe {
  return {
    id,
    slug: id.replace("recipe:", ""),
    nameTh: "สูตรทดสอบ",
    servings: 2,
    minutes: 10,
    ingredientItems,
    tags: [],
    exclusionTags: [],
    instructions: ["ขั้นตอนทดสอบ"],
    sourceNote: "Test only",
  };
}

function getData<T>(result: PantryCalculationResult<T>): T {
  if (!result.success) {
    throw new Error(`Unexpected pantry calculation errors: ${result.errors.map((error) => error.code).join(", ")}`);
  }
  return result.data;
}

function getErrorCodes(result: PantryCalculationResult<unknown>): string[] {
  if (result.success) throw new Error("Expected pantry calculation to fail");
  return result.errors.map((error) => error.code);
}

describe("aggregateRequiredIngredients", () => {
  it("combines shared ingredients across recipe batches and returns stable ID ordering", () => {
    const result = aggregateRequiredIngredients({
      recipes: [
        makeRecipe("recipe:stir-fry", [
          { ingredientId: "ingredient:rice", edibleGrams: 150 },
          { ingredientId: "ingredient:beans", edibleGrams: 20 },
        ]),
        makeRecipe("recipe:curry", [
          { ingredientId: "ingredient:rice", edibleGrams: 100 },
          { ingredientId: "ingredient:beans", edibleGrams: 30 },
        ]),
      ],
    });

    expect(getData(result).requiredIngredients).toEqual([
      { ingredientId: "ingredient:beans", edibleGrams: 50 },
      { ingredientId: "ingredient:rice", edibleGrams: 250 },
    ]);
  });

  it("combines repeated ingredient rows within a recipe batch", () => {
    const result = aggregateRequiredIngredients({
      recipes: [
        makeRecipe("recipe:split-rice", [
          { ingredientId: "ingredient:rice", edibleGrams: 60 },
          { ingredientId: "ingredient:rice", edibleGrams: 40 },
        ]),
      ],
    });

    expect(getData(result).requiredIngredients).toEqual([
      { ingredientId: "ingredient:rice", edibleGrams: 100 },
    ]);
  });

  it("supports an empty selected plan with no required ingredients", () => {
    const result = aggregateRequiredIngredients({ recipes: [] });

    expect(getData(result).requiredIngredients).toEqual([]);
  });

  it("rejects empty ingredient IDs and non-positive or non-finite recipe quantities", () => {
    for (const edibleGrams of [0, -1, Number.POSITIVE_INFINITY, Number.NaN]) {
      const result = aggregateRequiredIngredients({
        recipes: [
          makeRecipe("recipe:invalid", [
            { ingredientId: "ingredient:rice", edibleGrams },
          ]),
        ],
      });
      expect(getErrorCodes(result)).toContain("invalid_recipe_quantity");
    }

    const missingId = aggregateRequiredIngredients({
      recipes: [makeRecipe("recipe:missing-id", [{ ingredientId: "", edibleGrams: 10 }])],
    });
    expect(getErrorCodes(missingId)).toContain("invalid_ingredient_id");
  });

  it("rejects a recipe whose ingredient total overflows finite grams", () => {
    const result = aggregateRequiredIngredients({
      recipes: [
        makeRecipe("recipe:large-a", [{ ingredientId: "ingredient:rice", edibleGrams: 1e308 }]),
        makeRecipe("recipe:large-b", [{ ingredientId: "ingredient:rice", edibleGrams: 1e308 }]),
      ],
    });

    expect(getErrorCodes(result)).toContain("quantity_overflow");
  });
});

describe("subtractPantry", () => {
  it("subtracts each unique pantry amount once after recipe demand is aggregated", () => {
    const aggregated = aggregateRequiredIngredients({
      recipes: [
        makeRecipe("recipe:one", [{ ingredientId: "ingredient:rice", edibleGrams: 150 }]),
        makeRecipe("recipe:two", [{ ingredientId: "ingredient:rice", edibleGrams: 100 }]),
      ],
    });
    const { requiredIngredients } = getData(aggregated);
    const result = subtractPantry({
      requiredIngredients,
      pantry: [{ ingredientId: "ingredient:rice", edibleGrams: 100 }],
    });

    expect(getData(result).shortages).toEqual([
      {
        ingredientId: "ingredient:rice",
        requiredGrams: 250,
        pantryGrams: 100,
        shortageGrams: 150,
      },
    ]);
  });

  it("clamps oversupplied pantry to zero shortage", () => {
    const result = subtractPantry({
      requiredIngredients: [{ ingredientId: "ingredient:rice", edibleGrams: 200 }],
      pantry: [{ ingredientId: "ingredient:rice", edibleGrams: 350 }],
    });

    expect(getData(result).shortages).toEqual([
      {
        ingredientId: "ingredient:rice",
        requiredGrams: 200,
        pantryGrams: 350,
        shortageGrams: 0,
      },
    ]);
  });

  it("treats missing pantry entries and zero amounts as no available grams", () => {
    const pantry: PantryItem[] = [{ ingredientId: "ingredient:beans", edibleGrams: 0 }];
    const result = subtractPantry({
      requiredIngredients: [
        { ingredientId: "ingredient:beans", edibleGrams: 50 },
        { ingredientId: "ingredient:rice", edibleGrams: 100 },
      ],
      pantry,
    });

    expect(getData(result).shortages).toEqual([
      {
        ingredientId: "ingredient:beans",
        requiredGrams: 50,
        pantryGrams: 0,
        shortageGrams: 50,
      },
      {
        ingredientId: "ingredient:rice",
        requiredGrams: 100,
        pantryGrams: 0,
        shortageGrams: 100,
      },
    ]);
  });

  it("returns no rows for an empty plan even when pantry has extra items", () => {
    const result = subtractPantry({
      requiredIngredients: [],
      pantry: [{ ingredientId: "ingredient:rice", edibleGrams: 100 }],
    });

    expect(getData(result).shortages).toEqual([]);
  });

  it("rejects duplicate ingredient rows that violate the planning input contract", () => {
    const duplicateRequired = subtractPantry({
      requiredIngredients: [
        { ingredientId: "ingredient:rice", edibleGrams: 50 },
        { ingredientId: "ingredient:rice", edibleGrams: 50 },
      ],
      pantry: [],
    });
    const duplicatePantry = subtractPantry({
      requiredIngredients: [{ ingredientId: "ingredient:rice", edibleGrams: 100 }],
      pantry: [
        { ingredientId: "ingredient:rice", edibleGrams: 40 },
        { ingredientId: "ingredient:rice", edibleGrams: 60 },
      ],
    });

    expect(getErrorCodes(duplicateRequired)).toContain("duplicate_required_ingredient_id");
    expect(getErrorCodes(duplicatePantry)).toContain("duplicate_pantry_ingredient_id");
  });

  it("rejects negative or non-finite pantry quantities and invalid required quantities", () => {
    for (const edibleGrams of [-1, Number.POSITIVE_INFINITY, Number.NaN]) {
      const result = subtractPantry({
        requiredIngredients: [{ ingredientId: "ingredient:rice", edibleGrams: 100 }],
        pantry: [{ ingredientId: "ingredient:rice", edibleGrams }],
      });
      expect(getErrorCodes(result)).toContain("invalid_pantry_quantity");
    }

    const invalidRequired = subtractPantry({
      requiredIngredients: [{ ingredientId: "ingredient:rice", edibleGrams: 0 }],
      pantry: [],
    });
    expect(getErrorCodes(invalidRequired)).toContain("invalid_required_quantity");
  });
});
