import type { Ingredient, PantryItem, ProductOffer, Recipe } from "../../types";
import { calculateRecipeNutrients, type RecipeNutrientReport } from "./calculate-recipe-nutrients";
import { aggregateRequiredIngredients, subtractPantry } from "./pantry";
import {
  buildShoppingBasket,
  type ShoppingBasketCandidate,
} from "./shopping";

export type RecipeRankingPreferences = {
  pantry?: readonly PantryItem[];
  excludedTags?: readonly string[];
  maxCheckoutBudgetSatang?: number;
  minProteinGPerServing?: number;
};

export type RankRecipesInput = {
  recipes: readonly Recipe[];
  ingredients: readonly Ingredient[];
  offers: readonly ProductOffer[];
  candidateRetailerChainIds: readonly string[];
  preferences?: RecipeRankingPreferences;
};

export type RecipeEligibilityStatus = "eligible" | "unknown" | "ineligible";
export type ProteinAssessment = "not_applied" | "meets" | "below" | "unknown";
export type BudgetAssessment = "not_applied" | "meets" | "exceeds" | "unknown";

export type RecipeEligibilityReasonCode =
  | "preferences_skipped"
  | "excluded_tag"
  | "protein_meets_goal"
  | "protein_below_goal"
  | "protein_unknown"
  | "checkout_within_budget"
  | "checkout_over_budget"
  | "checkout_unknown"
  | "uses_pantry";

export type RecipeEligibilityReason = {
  code: RecipeEligibilityReasonCode;
  message: string;
  tag?: string;
  ingredientId?: string;
};

export type RankedRecipe = {
  rank: number;
  recipeId: string;
  recipe: Recipe;
  eligibility: RecipeEligibilityStatus;
  proteinAssessment: ProteinAssessment;
  budgetAssessment: BudgetAssessment;
  proteinGPerServing: number | null;
  checkoutCostSatang: number | null;
  nutrition: RecipeNutrientReport;
  selectedBasketCandidate: ShoppingBasketCandidate | null;
  basketCandidates: ShoppingBasketCandidate[];
  reasons: RecipeEligibilityReason[];
};

export type RecipeRankingData = {
  rankedRecipes: RankedRecipe[];
  eligibleRecipeIds: string[];
  unknownRecipeIds: string[];
  ineligibleRecipeIds: string[];
};

export type RecipeRankingErrorCode =
  | "invalid_input"
  | "invalid_preferences"
  | "duplicate_recipe_id"
  | "domain_calculation_failed";

export type RecipeRankingError = {
  code: RecipeRankingErrorCode;
  message: string;
  recipeId?: string;
  calculationStep?: "nutrition" | "aggregation" | "pantry" | "basket";
  detailCodes?: string[];
};

export type RecipeRankingResult<T = unknown> =
  | { success: true; data: T }
  | { success: false; errors: RecipeRankingError[] };

type InternalRankedRecipe = Omit<RankedRecipe, "rank">;

function compareIds(left: string, right: string): number {
  if (left < right) return -1;
  if (left > right) return 1;
  return 0;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function validateRankInput(input: RankRecipesInput): RecipeRankingError[] {
  const errors: RecipeRankingError[] = [];
  if (
    !Array.isArray(input?.recipes)
    || !Array.isArray(input?.ingredients)
    || !Array.isArray(input?.offers)
    || !Array.isArray(input?.candidateRetailerChainIds)
  ) {
    return [{ code: "invalid_input", message: "Recipes, ingredients, offers, and candidate chains must be arrays" }];
  }

  const recipeIds = new Set<string>();
  input.recipes.forEach((recipe, index) => {
    if (!isRecord(recipe) || !isNonEmptyString(recipe.id)) {
      errors.push({ code: "invalid_input", message: `Recipe at index ${index} must have a non-empty ID` });
      return;
    }
    if (recipeIds.has(recipe.id)) {
      errors.push({
        code: "duplicate_recipe_id",
        recipeId: recipe.id,
        message: `Duplicate recipe ID: ${recipe.id}`,
      });
      return;
    }
    recipeIds.add(recipe.id);
    if (!Array.isArray(recipe.exclusionTags) || !recipe.exclusionTags.every(isNonEmptyString)) {
      errors.push({
        code: "invalid_input",
        recipeId: recipe.id,
        message: `Recipe ${recipe.id} must have non-empty exclusion tags in an array`,
      });
    }
  });

  const ingredientIds = new Set<string>();
  input.ingredients.forEach((ingredient, index) => {
    if (!isRecord(ingredient) || !isNonEmptyString(ingredient.id)) {
      errors.push({ code: "invalid_input", message: `Ingredient at index ${index} must have a non-empty ID` });
      return;
    }
    if (ingredientIds.has(ingredient.id)) {
      errors.push({ code: "invalid_input", message: `Duplicate ingredient ID: ${ingredient.id}` });
      return;
    }
    ingredientIds.add(ingredient.id);
  });

  if (input.preferences !== undefined) {
    if (!isRecord(input.preferences)) {
      errors.push({ code: "invalid_preferences", message: "Preferences must be an object when provided" });
    } else {
      const { maxCheckoutBudgetSatang, minProteinGPerServing, excludedTags, pantry } = input.preferences;
      if (
        maxCheckoutBudgetSatang !== undefined
        && (typeof maxCheckoutBudgetSatang !== "number"
          || !Number.isSafeInteger(maxCheckoutBudgetSatang)
          || maxCheckoutBudgetSatang < 0)
      ) {
        errors.push({
          code: "invalid_preferences",
          message: "Checkout budget must be a non-negative safe integer number of satang",
        });
      }
      if (
        minProteinGPerServing !== undefined
        && (typeof minProteinGPerServing !== "number"
          || !Number.isFinite(minProteinGPerServing)
          || minProteinGPerServing < 0)
      ) {
        errors.push({
          code: "invalid_preferences",
          message: "Minimum protein must be a finite non-negative number of grams per serving",
        });
      }
      if (excludedTags !== undefined) {
        if (!Array.isArray(excludedTags)) {
          errors.push({ code: "invalid_preferences", message: "Excluded tags must be an array" });
        } else {
          const knownTags = new Set<string>();
          input.recipes.forEach((recipe) => {
            if (isRecord(recipe) && Array.isArray(recipe.exclusionTags)) {
              recipe.exclusionTags.forEach((tag) => {
                if (typeof tag === "string") knownTags.add(tag);
              });
            }
          });
          const seenTags = new Set<string>();
          excludedTags.forEach((tag) => {
            if (!isNonEmptyString(tag) || !knownTags.has(tag)) {
              errors.push({ code: "invalid_preferences", message: `Unsupported exclusion tag: ${String(tag)}` });
            } else if (seenTags.has(tag)) {
              errors.push({ code: "invalid_preferences", message: `Duplicate exclusion tag: ${tag}` });
            } else {
              seenTags.add(tag);
            }
          });
        }
      }
      if (pantry !== undefined) {
        if (!Array.isArray(pantry)) {
          errors.push({ code: "invalid_preferences", message: "Pantry must be an array" });
        } else {
          const seenPantryIds = new Set<string>();
          const knownIngredientIds = new Set<string>();
          input.ingredients.forEach((ingredient) => {
            if (isRecord(ingredient) && isNonEmptyString(ingredient.id)) {
              knownIngredientIds.add(ingredient.id);
            }
          });
          pantry.forEach((item) => {
            if (!isRecord(item) || !isNonEmptyString(item.ingredientId)) {
              errors.push({ code: "invalid_preferences", message: "Pantry entries need a non-empty ingredient ID" });
              return;
            }
            if (
              typeof item.edibleGrams !== "number"
              || !Number.isFinite(item.edibleGrams)
              || item.edibleGrams < 0
              || !knownIngredientIds.has(item.ingredientId)
            ) {
              errors.push({
                code: "invalid_preferences",
                message: `Pantry grams or ingredient reference is invalid for ${item.ingredientId}`,
              });
              return;
            }
            if (seenPantryIds.has(item.ingredientId)) {
              errors.push({
                code: "invalid_preferences",
                message: `Duplicate pantry ingredient ID: ${item.ingredientId}`,
              });
              return;
            }
            seenPantryIds.add(item.ingredientId);
          });
        }
      }
    }
  }

  return errors;
}

function mapDomainErrors(
  recipeId: string,
  calculationStep: RecipeRankingError["calculationStep"],
  errors: readonly { code: string; message: string }[],
): RecipeRankingError[] {
  return errors.map((error) => ({
    code: "domain_calculation_failed",
    recipeId,
    calculationStep,
    detailCodes: [error.code],
    message: error.message,
  }));
}

function chooseBasket(candidates: readonly ShoppingBasketCandidate[]): ShoppingBasketCandidate | null {
  return [...candidates].sort((left, right) => {
    if (left.complete !== right.complete) return left.complete ? -1 : 1;
    if (left.complete && right.complete) {
      const leftCost = left.checkoutCostSatang ?? Number.POSITIVE_INFINITY;
      const rightCost = right.checkoutCostSatang ?? Number.POSITIVE_INFINITY;
      if (leftCost !== rightCost) return leftCost - rightCost;
    } else if (left.coverage.pricedIngredientCount !== right.coverage.pricedIngredientCount) {
      return right.coverage.pricedIngredientCount - left.coverage.pricedIngredientCount;
    }
    if (left.knownCheckoutSubtotalSatang !== right.knownCheckoutSubtotalSatang) {
      return left.knownCheckoutSubtotalSatang - right.knownCheckoutSubtotalSatang;
    }
    return compareIds(left.retailerChainId, right.retailerChainId);
  })[0] ?? null;
}

function getEligibilityStatus(
  excludedTags: readonly string[],
  proteinAssessment: ProteinAssessment,
  budgetAssessment: BudgetAssessment,
): RecipeEligibilityStatus {
  if (excludedTags.length > 0 || proteinAssessment === "below" || budgetAssessment === "exceeds") {
    return "ineligible";
  }
  if (proteinAssessment === "unknown" || budgetAssessment === "unknown") return "unknown";
  return "eligible";
}

function makeReasons(
  excludedTags: readonly string[],
  proteinAssessment: ProteinAssessment,
  budgetAssessment: BudgetAssessment,
  shortages: readonly { ingredientId: string; requiredGrams: number; pantryGrams: number }[],
  ingredientsById: ReadonlyMap<string, Ingredient>,
  preferencesSkipped: boolean,
): RecipeEligibilityReason[] {
  const reasons: RecipeEligibilityReason[] = [];
  if (preferencesSkipped) {
    reasons.push({
      code: "preferences_skipped",
      message: "ยังไม่ได้ตั้งตัวกรอง จึงแสดงเมนูทั้งหมด",
    });
  }
  [...excludedTags].sort(compareIds).forEach((tag) => {
    reasons.push({
      code: "excluded_tag",
      tag,
      message: `ตรงกับวัตถุดิบที่เลือกตัดออก: ${tag}`,
    });
  });

  if (proteinAssessment === "meets") {
    reasons.push({ code: "protein_meets_goal", message: "โปรตีนต่อหนึ่งหน่วยบริโภคถึงเป้าหมาย" });
  } else if (proteinAssessment === "below") {
    reasons.push({ code: "protein_below_goal", message: "โปรตีนต่อหนึ่งหน่วยบริโภคต่ำกว่าเป้าหมาย" });
  } else if (proteinAssessment === "unknown") {
    reasons.push({ code: "protein_unknown", message: "ข้อมูลโปรตีนไม่ครบ จึงยืนยันเป้าหมายไม่ได้" });
  }

  if (budgetAssessment === "meets") {
    reasons.push({ code: "checkout_within_budget", message: "เงินที่ต้องจ่ายตอนซื้อไม่เกินงบ" });
  } else if (budgetAssessment === "exceeds") {
    reasons.push({ code: "checkout_over_budget", message: "เงินที่ต้องจ่ายตอนซื้อเกินงบ" });
  } else if (budgetAssessment === "unknown") {
    reasons.push({ code: "checkout_unknown", message: "ราคารวมที่จ่ายตอนซื้อยังคำนวณไม่ครบ" });
  }

  shortages
    .filter((shortage) => Math.min(shortage.requiredGrams, shortage.pantryGrams) > 0)
    .forEach((shortage) => {
      const nameTh = ingredientsById.get(shortage.ingredientId)?.nameTh;
      const ingredientName = isNonEmptyString(nameTh) ? nameTh : shortage.ingredientId;
      reasons.push({
        code: "uses_pantry",
        ingredientId: shortage.ingredientId,
        message: `ใช้${ingredientName}ที่มีในครัว ช่วยลดปริมาณที่ต้องซื้อ`,
      });
    });

  return reasons;
}

function compareRankedRecipes(
  left: InternalRankedRecipe,
  right: InternalRankedRecipe,
  minProteinGPerServing: number | undefined,
): number {
  const eligibilityOrder: Record<RecipeEligibilityStatus, number> = {
    eligible: 0,
    unknown: 1,
    ineligible: 2,
  };
  const eligibilityDifference = eligibilityOrder[left.eligibility] - eligibilityOrder[right.eligibility];
  if (eligibilityDifference !== 0) return eligibilityDifference;

  if (minProteinGPerServing !== undefined) {
    const leftProtein = left.proteinGPerServing;
    const rightProtein = right.proteinGPerServing;
    if (leftProtein === null && rightProtein !== null) return 1;
    if (leftProtein !== null && rightProtein === null) return -1;
    if (leftProtein !== null && rightProtein !== null && leftProtein !== rightProtein) {
      return rightProtein - leftProtein;
    }
  }

  if (left.checkoutCostSatang === null && right.checkoutCostSatang !== null) return 1;
  if (left.checkoutCostSatang !== null && right.checkoutCostSatang === null) return -1;
  if (
    left.checkoutCostSatang !== null
    && right.checkoutCostSatang !== null
    && left.checkoutCostSatang !== right.checkoutCostSatang
  ) {
    return left.checkoutCostSatang - right.checkoutCostSatang;
  }

  return compareIds(left.recipeId, right.recipeId);
}

/** Rank every available recipe without treating unknown nutrients or prices as a pass. */
export function rankRecipes(input: RankRecipesInput): RecipeRankingResult<RecipeRankingData> {
  const inputErrors = validateRankInput(input);
  if (inputErrors.length > 0) return { success: false, errors: inputErrors };

  const setup = buildShoppingBasket({
    shortages: [],
    offers: input.offers,
    candidateRetailerChainIds: input.candidateRetailerChainIds,
  });
  if (!setup.success) {
    return {
      success: false,
      errors: setup.errors.map((error) => ({ code: "invalid_input", message: error.message })),
    };
  }

  const preferences = input.preferences;
  const pantry = preferences?.pantry ?? [];
  const excludedTags = preferences?.excludedTags ?? [];
  const ingredientsById = new Map(input.ingredients.map((ingredient) => [ingredient.id, ingredient]));
  const recipes: InternalRankedRecipe[] = [];
  const errors: RecipeRankingError[] = [];

  input.recipes.forEach((recipe) => {
    const nutrition = calculateRecipeNutrients({ recipe, ingredients: input.ingredients });
    if (!nutrition.success) {
      errors.push(...mapDomainErrors(recipe.id, "nutrition", nutrition.errors));
      return;
    }
    const aggregate = aggregateRequiredIngredients({ recipes: [recipe] });
    if (!aggregate.success) {
      errors.push(...mapDomainErrors(recipe.id, "aggregation", aggregate.errors));
      return;
    }
    const pantryResult = subtractPantry({
      requiredIngredients: aggregate.data.requiredIngredients,
      pantry,
    });
    if (!pantryResult.success) {
      errors.push(...mapDomainErrors(recipe.id, "pantry", pantryResult.errors));
      return;
    }
    const basketResult = buildShoppingBasket({
      shortages: pantryResult.data.shortages,
      offers: input.offers,
      candidateRetailerChainIds: input.candidateRetailerChainIds,
    });
    if (!basketResult.success) {
      errors.push(...mapDomainErrors(recipe.id, "basket", basketResult.errors));
      return;
    }

    const proteinGPerServing = nutrition.data.perServingTotals.proteinG;
    const proteinAssessment: ProteinAssessment = preferences?.minProteinGPerServing === undefined
      ? "not_applied"
      : proteinGPerServing === null || !nutrition.data.completeness.proteinG
        ? "unknown"
        : proteinGPerServing >= preferences.minProteinGPerServing
          ? "meets"
          : "below";

    const selectedBasketCandidate = chooseBasket(basketResult.data.candidates);
    const completeCandidates = basketResult.data.candidates
      .filter((candidate) => candidate.complete && candidate.checkoutCostSatang !== null)
      .sort((left, right) => {
        const costDifference = (left.checkoutCostSatang ?? 0) - (right.checkoutCostSatang ?? 0);
        return costDifference !== 0 ? costDifference : compareIds(left.retailerChainId, right.retailerChainId);
      });
    const cheapestCompleteCandidate = completeCandidates[0] ?? null;
    const checkoutCostSatang = cheapestCompleteCandidate?.checkoutCostSatang ?? null;
    const budgetAssessment: BudgetAssessment = preferences?.maxCheckoutBudgetSatang === undefined
      ? "not_applied"
      : checkoutCostSatang === null
        ? "unknown"
        : checkoutCostSatang <= preferences.maxCheckoutBudgetSatang
          ? "meets"
          : "exceeds";

    const matchingExcludedTags = recipe.exclusionTags.filter((tag) => excludedTags.includes(tag));
    const eligibility = getEligibilityStatus(matchingExcludedTags, proteinAssessment, budgetAssessment);

    recipes.push({
      recipeId: recipe.id,
      recipe,
      eligibility,
      proteinAssessment,
      budgetAssessment,
      proteinGPerServing,
      checkoutCostSatang,
      nutrition: nutrition.data,
      selectedBasketCandidate,
      basketCandidates: basketResult.data.candidates,
      reasons: makeReasons(
        matchingExcludedTags,
        proteinAssessment,
        budgetAssessment,
        pantryResult.data.shortages,
        ingredientsById,
        input.preferences === undefined,
      ),
    });
  });

  if (errors.length > 0) return { success: false, errors };

  const rankedRecipes: RankedRecipe[] = recipes
    .sort((left, right) => compareRankedRecipes(
      left,
      right,
      preferences?.minProteinGPerServing,
    ))
    .map((recipe, index) => ({ ...recipe, rank: index + 1 }));

  return {
    success: true,
    data: {
      rankedRecipes,
      eligibleRecipeIds: rankedRecipes
        .filter((recipe) => recipe.eligibility === "eligible")
        .map((recipe) => recipe.recipeId),
      unknownRecipeIds: rankedRecipes
        .filter((recipe) => recipe.eligibility === "unknown")
        .map((recipe) => recipe.recipeId),
      ineligibleRecipeIds: rankedRecipes
        .filter((recipe) => recipe.eligibility === "ineligible")
        .map((recipe) => recipe.recipeId),
    },
  };
}
