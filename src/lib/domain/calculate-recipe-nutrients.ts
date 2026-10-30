import type { Ingredient, NutrientsPer100g, Provenance, Recipe } from "../../types";

export type NutrientKey =
  | "kcal"
  | "proteinG"
  | "carbG"
  | "fatG"
  | "fiberG"
  | "sodiumMg"
  | "calciumMg"
  | "ironMg";

export type NutrientTotals = Record<NutrientKey, number | null>;
export type NutrientCompleteness = Record<NutrientKey, boolean>;

export type NutritionSourceReference = {
  ingredientId: string;
  provenance: Provenance;
};

export type RecipeNutrientReport = {
  servings: number;
  batchTotals: NutrientTotals;
  perServingTotals: NutrientTotals;
  completeness: NutrientCompleteness;
  sources: NutritionSourceReference[];
};

export type RecipeNutrientCalculationErrorCode =
  | "invalid_servings"
  | "empty_recipe"
  | "invalid_quantity"
  | "missing_ingredient"
  | "duplicate_ingredient_id"
  | "invalid_nutrient";

export type RecipeNutrientCalculationError = {
  code: RecipeNutrientCalculationErrorCode;
  message: string;
  ingredientId?: string;
  ingredientIndex?: number;
  nutrient?: NutrientKey;
};

export type RecipeNutrientCalculationResult =
  | { success: true; data: RecipeNutrientReport }
  | { success: false; errors: RecipeNutrientCalculationError[] };

export type CalculateRecipeNutrientsInput = {
  recipe: Recipe;
  ingredients: readonly Ingredient[];
};

const nutrientKeys: readonly NutrientKey[] = [
  "kcal",
  "proteinG",
  "carbG",
  "fatG",
  "fiberG",
  "sodiumMg",
  "calciumMg",
  "ironMg",
];

const optionalNutrientKeys = new Set<NutrientKey>([
  "fiberG",
  "sodiumMg",
  "calciumMg",
  "ironMg",
]);

const requiredNutrientKeys = new Set<NutrientKey>([
  "kcal",
  "proteinG",
  "carbG",
  "fatG",
]);

function emptyNutrientTotals(): NutrientTotals {
  return {
    kcal: null,
    proteinG: null,
    carbG: null,
    fatG: null,
    fiberG: null,
    sodiumMg: null,
    calciumMg: null,
    ironMg: null,
  };
}

function emptyCompleteness(): NutrientCompleteness {
  return {
    kcal: false,
    proteinG: false,
    carbG: false,
    fatG: false,
    fiberG: false,
    sodiumMg: false,
    calciumMg: false,
    ironMg: false,
  };
}

function compareIds(left: string, right: string): number {
  if (left < right) return -1;
  if (left > right) return 1;
  return 0;
}

function validateIngredientNutrients(
  ingredient: Ingredient,
): RecipeNutrientCalculationError[] {
  const errors: RecipeNutrientCalculationError[] = [];
  const nutrients: NutrientsPer100g | null | undefined = ingredient.nutrientsPer100g;

  if (typeof nutrients !== "object" || nutrients === null) {
    return nutrientKeys.map((nutrient) => ({
      code: "invalid_nutrient",
      ingredientId: ingredient.id,
      nutrient,
      message: `Ingredient ${ingredient.id} has no nutrient record`,
    }));
  }

  for (const nutrient of nutrientKeys) {
    const value = nutrients[nutrient];
    if (value === null) continue;
    if (value === undefined && optionalNutrientKeys.has(nutrient)) continue;
    if (typeof value === "number" && Number.isFinite(value) && value >= 0) continue;

    const requiredMessage = requiredNutrientKeys.has(nutrient)
      ? "must be present as a number or null"
      : "must be a non-negative number, null, or omitted when unknown";
    errors.push({
      code: "invalid_nutrient",
      ingredientId: ingredient.id,
      nutrient,
      message: `Nutrient ${nutrient} for ${ingredient.id} ${requiredMessage}`,
    });
  }

  return errors;
}

/** Scale source nutrients from per-100-g values using each recipe batch's raw edible grams. */
export function calculateRecipeNutrients(
  input: CalculateRecipeNutrientsInput,
): RecipeNutrientCalculationResult {
  const { recipe, ingredients } = input;
  const errors: RecipeNutrientCalculationError[] = [];
  const recipeItems = Array.isArray(recipe.ingredientItems) ? recipe.ingredientItems : [];

  if (!Number.isInteger(recipe.servings) || recipe.servings <= 0) {
    errors.push({
      code: "invalid_servings",
      message: "Recipe servings must be a positive integer",
    });
  }
  if (recipeItems.length === 0) {
    errors.push({ code: "empty_recipe", message: "Recipe must contain at least one ingredient" });
  }

  const ingredientById = new Map<string, Ingredient>();
  ingredients.forEach((ingredient, ingredientIndex) => {
    if (ingredientById.has(ingredient.id)) {
      errors.push({
        code: "duplicate_ingredient_id",
        ingredientId: ingredient.id,
        ingredientIndex,
        message: `Duplicate ingredient ID: ${ingredient.id}`,
      });
      return;
    }
    ingredientById.set(ingredient.id, ingredient);
  });

  const usedIngredients = new Map<string, Ingredient>();
  recipeItems.forEach((item, ingredientIndex) => {
    if (typeof item.edibleGrams !== "number" || !Number.isFinite(item.edibleGrams) || item.edibleGrams <= 0) {
      errors.push({
        code: "invalid_quantity",
        ingredientId: item.ingredientId,
        ingredientIndex,
        message: "Recipe ingredient grams must be a finite number greater than zero",
      });
    }

    const ingredient = ingredientById.get(item.ingredientId);
    if (!ingredient) {
      errors.push({
        code: "missing_ingredient",
        ingredientId: item.ingredientId,
        ingredientIndex,
        message: `Recipe references unknown ingredient ID: ${item.ingredientId}`,
      });
      return;
    }

    usedIngredients.set(ingredient.id, ingredient);
  });

  for (const ingredient of usedIngredients.values()) {
    errors.push(...validateIngredientNutrients(ingredient));
  }

  if (errors.length > 0) return { success: false, errors };

  const batchTotals = emptyNutrientTotals();
  const perServingTotals = emptyNutrientTotals();
  const completeness = emptyCompleteness();

  for (const nutrient of nutrientKeys) {
    let total = 0;
    let isComplete = true;

    for (const item of recipeItems) {
      const ingredient = ingredientById.get(item.ingredientId);
      if (!ingredient) continue;

      const value = ingredient.nutrientsPer100g[nutrient];
      if (value === null || value === undefined) {
        isComplete = false;
        continue;
      }

      total += (item.edibleGrams / 100) * value;
    }

    if (isComplete) {
      batchTotals[nutrient] = total;
      perServingTotals[nutrient] = total / recipe.servings;
      completeness[nutrient] = true;
    }
  }

  const sources = [...usedIngredients.values()]
    .sort((left, right) => compareIds(left.id, right.id))
    .map((ingredient) => ({
      ingredientId: ingredient.id,
      provenance: ingredient.nutritionSource,
    }));

  return {
    success: true,
    data: {
      servings: recipe.servings,
      batchTotals,
      perServingTotals,
      completeness,
      sources,
    },
  };
}
