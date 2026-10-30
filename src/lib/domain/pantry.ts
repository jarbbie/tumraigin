import type { PantryItem, Recipe } from "../../types";

export type RequiredIngredientAmount = {
  ingredientId: string;
  edibleGrams: number;
};

export type IngredientShortage = {
  ingredientId: string;
  requiredGrams: number;
  pantryGrams: number;
  shortageGrams: number;
};

export type PantryCalculationErrorCode =
  | "invalid_recipe"
  | "empty_recipe"
  | "invalid_required_ingredients"
  | "invalid_pantry"
  | "invalid_ingredient_id"
  | "invalid_recipe_quantity"
  | "invalid_required_quantity"
  | "invalid_pantry_quantity"
  | "duplicate_required_ingredient_id"
  | "duplicate_pantry_ingredient_id"
  | "quantity_overflow";

export type PantryCalculationError = {
  code: PantryCalculationErrorCode;
  message: string;
  recipeId?: string;
  recipeIndex?: number;
  ingredientId?: string;
  ingredientIndex?: number;
};

export type PantryCalculationResult<T = unknown> =
  | { success: true; data: T }
  | { success: false; errors: PantryCalculationError[] };

export type AggregateRequiredIngredientsInput = {
  recipes: readonly Recipe[];
};

export type AggregateRequiredIngredientsData = {
  requiredIngredients: RequiredIngredientAmount[];
};

export type SubtractPantryInput = {
  requiredIngredients: readonly RequiredIngredientAmount[];
  pantry: readonly PantryItem[];
};

export type SubtractPantryData = {
  shortages: IngredientShortage[];
};

function compareIds(left: string, right: string): number {
  if (left < right) return -1;
  if (left > right) return 1;
  return 0;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function readIngredientId(
  value: unknown,
  errors: PantryCalculationError[],
  context: Pick<PantryCalculationError, "recipeId" | "recipeIndex" | "ingredientIndex">,
): string | null {
  if (!isRecord(value) || typeof value.ingredientId !== "string" || value.ingredientId.trim().length === 0) {
    errors.push({
      ...context,
      code: "invalid_ingredient_id",
      message: "Ingredient ID must be a non-empty string",
    });
    return null;
  }

  return value.ingredientId;
}

function readGrams(
  value: unknown,
): number | null {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

/** Combine raw edible grams for every ingredient across the selected recipe batches. */
export function aggregateRequiredIngredients(
  input: AggregateRequiredIngredientsInput,
): PantryCalculationResult<AggregateRequiredIngredientsData> {
  const errors: PantryCalculationError[] = [];
  const totalsByIngredientId = new Map<string, number>();
  const recipes: readonly unknown[] = Array.isArray(input?.recipes) ? input.recipes : [];

  if (!Array.isArray(input?.recipes)) {
    errors.push({
      code: "invalid_recipe",
      message: "Recipes must be provided as an array",
    });
  }

  recipes.forEach((rawRecipe, recipeIndex) => {
    if (
      !isRecord(rawRecipe)
      || typeof rawRecipe.id !== "string"
      || rawRecipe.id.trim().length === 0
    ) {
      errors.push({
        code: "invalid_recipe",
        recipeIndex,
        message: "Each selected recipe must have a valid record and ID",
      });
      return;
    }

    const recipeId = rawRecipe.id;
    if (!Array.isArray(rawRecipe.ingredientItems)) {
      errors.push({
        code: "invalid_recipe",
        recipeId,
        recipeIndex,
        message: "Recipe ingredient items must be an array",
      });
      return;
    }
    if (rawRecipe.ingredientItems.length === 0) {
      errors.push({
        code: "empty_recipe",
        recipeId,
        recipeIndex,
        message: "A selected recipe must contain at least one ingredient",
      });
      return;
    }

    rawRecipe.ingredientItems.forEach((rawItem, ingredientIndex) => {
      const context = { recipeId, recipeIndex, ingredientIndex };
      const ingredientId = readIngredientId(rawItem, errors, context);
      const grams = isRecord(rawItem) ? readGrams(rawItem.edibleGrams) : null;

      if (grams === null || grams <= 0) {
        errors.push({
          ...context,
          ...(ingredientId === null ? {} : { ingredientId }),
          code: "invalid_recipe_quantity",
          message: "Recipe ingredient grams must be a finite number greater than zero",
        });
      }
      if (ingredientId === null || grams === null || grams <= 0) return;

      const total = (totalsByIngredientId.get(ingredientId) ?? 0) + grams;
      if (!Number.isFinite(total)) {
        errors.push({
          ...context,
          ingredientId,
          code: "quantity_overflow",
          message: `Combined quantity for ${ingredientId} exceeds finite grams`,
        });
        return;
      }

      totalsByIngredientId.set(ingredientId, total);
    });
  });

  if (errors.length > 0) return { success: false, errors };

  const requiredIngredients = [...totalsByIngredientId.entries()]
    .sort(([leftId], [rightId]) => compareIds(leftId, rightId))
    .map(([ingredientId, edibleGrams]) => ({ ingredientId, edibleGrams }));

  return { success: true, data: { requiredIngredients } };
}

/** Subtract owned grams once from unique aggregate ingredient demand, never below zero. */
export function subtractPantry(
  input: SubtractPantryInput,
): PantryCalculationResult<SubtractPantryData> {
  const errors: PantryCalculationError[] = [];
  const requiredByIngredientId = new Map<string, number>();
  const pantryByIngredientId = new Map<string, number>();
  const requiredIngredients: readonly unknown[] = Array.isArray(input?.requiredIngredients)
    ? input.requiredIngredients
    : [];
  const pantry: readonly unknown[] = Array.isArray(input?.pantry) ? input.pantry : [];

  if (!Array.isArray(input?.requiredIngredients)) {
    errors.push({
      code: "invalid_required_ingredients",
      message: "Required ingredients must be provided as an array",
    });
  }
  if (!Array.isArray(input?.pantry)) {
    errors.push({
      code: "invalid_pantry",
      message: "Pantry must be provided as an array",
    });
  }

  requiredIngredients.forEach((entry, ingredientIndex) => {
    const ingredientId = readIngredientId(entry, errors, { ingredientIndex });
    const grams = isRecord(entry) ? readGrams(entry.edibleGrams) : null;

    if (grams === null || grams <= 0) {
      errors.push({
        ...(ingredientId === null ? {} : { ingredientId }),
        ingredientIndex,
        code: "invalid_required_quantity",
        message: "Required ingredient grams must be a finite number greater than zero",
      });
    }
    if (ingredientId === null || grams === null || grams <= 0) return;
    if (requiredByIngredientId.has(ingredientId)) {
      errors.push({
        ingredientId,
        ingredientIndex,
        code: "duplicate_required_ingredient_id",
        message: `Required ingredients must be aggregated before pantry subtraction: ${ingredientId}`,
      });
      return;
    }

    requiredByIngredientId.set(ingredientId, grams);
  });

  pantry.forEach((entry, ingredientIndex) => {
    const ingredientId = readIngredientId(entry, errors, { ingredientIndex });
    const grams = isRecord(entry) ? readGrams(entry.edibleGrams) : null;

    if (grams === null || grams < 0) {
      errors.push({
        ...(ingredientId === null ? {} : { ingredientId }),
        ingredientIndex,
        code: "invalid_pantry_quantity",
        message: "Pantry grams must be a finite number greater than or equal to zero",
      });
    }
    if (ingredientId === null || grams === null || grams < 0) return;
    if (pantryByIngredientId.has(ingredientId)) {
      errors.push({
        ingredientId,
        ingredientIndex,
        code: "duplicate_pantry_ingredient_id",
        message: `Pantry must contain at most one quantity per ingredient: ${ingredientId}`,
      });
      return;
    }

    pantryByIngredientId.set(ingredientId, grams);
  });

  if (errors.length > 0) return { success: false, errors };

  const shortages = [...requiredByIngredientId.entries()]
    .sort(([leftId], [rightId]) => compareIds(leftId, rightId))
    .map(([ingredientId, requiredGrams]) => {
      const pantryGrams = pantryByIngredientId.get(ingredientId) ?? 0;
      return {
        ingredientId,
        requiredGrams,
        pantryGrams,
        shortageGrams: Math.max(requiredGrams - pantryGrams, 0),
      };
    });

  return { success: true, data: { shortages } };
}
