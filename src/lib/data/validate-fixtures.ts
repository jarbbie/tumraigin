import type {
  FixtureDataset,
  Ingredient,
  NutrientsPer100g,
  PantryItem,
  PlanningInput,
  ProductOffer,
  Provenance,
  Recipe,
  RecipeIngredient,
  Store,
} from "../../types";

export type ValidationIssue = {
  path: string;
  message: string;
};

export type ValidationResult<T> =
  | { success: true; data: T }
  | { success: false; issues: ValidationIssue[] };

type NumberRules = {
  minimum?: number;
  maximum?: number;
  integer?: boolean;
  positive?: boolean;
};

function addIssue(issues: ValidationIssue[], path: string, message: string): void {
  issues.push({ path, message });
}

function hasOwn(record: Record<string, unknown>, key: string): boolean {
  return Object.prototype.hasOwnProperty.call(record, key);
}

function readRecord(
  value: unknown,
  path: string,
  issues: ValidationIssue[],
): Record<string, unknown> | null {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    addIssue(issues, path, "Expected an object");
    return null;
  }

  return value as Record<string, unknown>;
}

function readArray(
  value: unknown,
  path: string,
  issues: ValidationIssue[],
): unknown[] | null {
  if (!Array.isArray(value)) {
    addIssue(issues, path, "Expected an array");
    return null;
  }

  return value as unknown[];
}

function readString(
  record: Record<string, unknown>,
  key: string,
  path: string,
  issues: ValidationIssue[],
): string | null {
  const value = record[key];
  if (typeof value !== "string" || value.trim().length === 0) {
    addIssue(issues, path, "Expected a non-empty string");
    return null;
  }

  return value.trim();
}

function readOptionalString(
  record: Record<string, unknown>,
  key: string,
  path: string,
  issues: ValidationIssue[],
): string | undefined {
  if (!hasOwn(record, key)) return undefined;
  return readString(record, key, path, issues) ?? undefined;
}

function readNumber(
  record: Record<string, unknown>,
  key: string,
  path: string,
  issues: ValidationIssue[],
  rules: NumberRules = {},
): number | null {
  const value = record[key];
  if (typeof value !== "number" || !Number.isFinite(value)) {
    addIssue(issues, path, "Expected a finite number");
    return null;
  }
  if (rules.integer && !Number.isInteger(value)) {
    addIssue(issues, path, "Expected an integer");
    return null;
  }
  if (rules.positive && value <= 0) {
    addIssue(issues, path, "Expected a number greater than zero");
    return null;
  }
  if (rules.minimum !== undefined && value < rules.minimum) {
    addIssue(issues, path, `Expected a number of at least ${rules.minimum}`);
    return null;
  }
  if (rules.maximum !== undefined && value > rules.maximum) {
    addIssue(issues, path, `Expected a number no greater than ${rules.maximum}`);
    return null;
  }

  return value;
}

function readNullableNutrient(
  record: Record<string, unknown>,
  key: string,
  path: string,
  issues: ValidationIssue[],
): number | null {
  const value = record[key];
  if (value === null) return null;
  if (typeof value !== "number" || !Number.isFinite(value) || value < 0) {
    addIssue(issues, path, "Expected a non-negative number or null for unknown");
    return null;
  }

  return value;
}

function readOptionalNullableNutrient(
  record: Record<string, unknown>,
  key: string,
  path: string,
  issues: ValidationIssue[],
): number | null | undefined {
  if (!hasOwn(record, key)) return undefined;
  return readNullableNutrient(record, key, path, issues);
}

function readStringArray(
  value: unknown,
  path: string,
  issues: ValidationIssue[],
): string[] | null {
  const values = readArray(value, path, issues);
  if (!values) return null;

  const result: string[] = [];
  values.forEach((item, index) => {
    if (typeof item !== "string" || item.trim().length === 0) {
      addIssue(issues, `${path}[${index}]`, "Expected a non-empty string");
      return;
    }
    result.push(item.trim());
  });

  return result;
}

function readHttpsUrl(
  record: Record<string, unknown>,
  key: string,
  path: string,
  issues: ValidationIssue[],
): string | null {
  const value = readString(record, key, path, issues);
  if (value === null) return null;

  try {
    if (new URL(value).protocol !== "https:") {
      addIssue(issues, path, "Expected an HTTPS URL");
      return null;
    }
  } catch {
    addIssue(issues, path, "Expected an absolute HTTPS URL");
    return null;
  }

  return value;
}

function readOptionalHttpsUrl(
  record: Record<string, unknown>,
  key: string,
  path: string,
  issues: ValidationIssue[],
): string | undefined {
  if (!hasOwn(record, key)) return undefined;
  return readHttpsUrl(record, key, path, issues) ?? undefined;
}

function readCheckedAt(
  record: Record<string, unknown>,
  path: string,
  issues: ValidationIssue[],
): string | null {
  const checkedAt = readString(record, "checkedAt", path, issues);
  const isIsoDateOrTimestamp =
    checkedAt !== null &&
    /^\d{4}-\d{2}-\d{2}(?:T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})?)?$/.test(
      checkedAt,
    );
  if (checkedAt !== null && (!isIsoDateOrTimestamp || !Number.isFinite(Date.parse(checkedAt)))) {
    addIssue(issues, path, "Expected a parseable ISO date or timestamp");
    return null;
  }
  return checkedAt;
}

function parseProvenance(
  value: unknown,
  path: string,
  issues: ValidationIssue[],
): Provenance | null {
  const initialIssueCount = issues.length;
  const record = readRecord(value, path, issues);
  if (!record) return null;

  const kind = readString(record, "kind", `${path}.kind`, issues);
  if (kind === null) return null;

  let provenance: Provenance | null = null;
  if (kind === "usda") {
    const fdcId = readNumber(record, "fdcId", `${path}.fdcId`, issues, {
      integer: true,
      positive: true,
    });
    const sourceUrl = readHttpsUrl(record, "sourceUrl", `${path}.sourceUrl`, issues);
    const checkedAt = readCheckedAt(record, `${path}.checkedAt`, issues);
    if (fdcId !== null && sourceUrl !== null && checkedAt !== null) {
      provenance = { kind, fdcId, sourceUrl, checkedAt };
    }
  } else if (kind === "verified_catalog") {
    const sourceUrl = readHttpsUrl(record, "sourceUrl", `${path}.sourceUrl`, issues);
    const checkedAt = readCheckedAt(record, `${path}.checkedAt`, issues);
    if (sourceUrl !== null && checkedAt !== null) {
      provenance = { kind, sourceUrl, checkedAt };
    }
  } else if (kind === "curated_estimate") {
    const explanation = readString(record, "explanation", `${path}.explanation`, issues);
    const checkedAt = readCheckedAt(record, `${path}.checkedAt`, issues);
    if (explanation !== null && checkedAt !== null) {
      provenance = { kind, explanation, checkedAt };
    }
  } else if (kind === "simulated") {
    const explanation = readString(record, "explanation", `${path}.explanation`, issues);
    if (explanation !== null) provenance = { kind, explanation };
  } else {
    addIssue(issues, `${path}.kind`, "Expected a supported provenance kind");
  }

  return issues.length === initialIssueCount ? provenance : null;
}

function parseNutrientsPer100g(
  value: unknown,
  path: string,
  issues: ValidationIssue[],
): NutrientsPer100g | null {
  const initialIssueCount = issues.length;
  const record = readRecord(value, path, issues);
  if (!record) return null;

  const kcal = readNullableNutrient(record, "kcal", `${path}.kcal`, issues);
  const proteinG = readNullableNutrient(record, "proteinG", `${path}.proteinG`, issues);
  const carbG = readNullableNutrient(record, "carbG", `${path}.carbG`, issues);
  const fatG = readNullableNutrient(record, "fatG", `${path}.fatG`, issues);
  const fiberG = readOptionalNullableNutrient(record, "fiberG", `${path}.fiberG`, issues);
  const sodiumMg = readOptionalNullableNutrient(record, "sodiumMg", `${path}.sodiumMg`, issues);
  const calciumMg = readOptionalNullableNutrient(record, "calciumMg", `${path}.calciumMg`, issues);
  const ironMg = readOptionalNullableNutrient(record, "ironMg", `${path}.ironMg`, issues);

  if (issues.length !== initialIssueCount) return null;

  return {
    kcal,
    proteinG,
    carbG,
    fatG,
    ...(fiberG === undefined ? {} : { fiberG }),
    ...(sodiumMg === undefined ? {} : { sodiumMg }),
    ...(calciumMg === undefined ? {} : { calciumMg }),
    ...(ironMg === undefined ? {} : { ironMg }),
  };
}

function parseIngredient(
  value: unknown,
  path: string,
  issues: ValidationIssue[],
): Ingredient | null {
  const initialIssueCount = issues.length;
  const record = readRecord(value, path, issues);
  if (!record) return null;

  const id = readString(record, "id", `${path}.id`, issues);
  const nameTh = readString(record, "nameTh", `${path}.nameTh`, issues);
  const nameEn = readOptionalString(record, "nameEn", `${path}.nameEn`, issues);
  if (record.edibleUnit !== "g") {
    addIssue(issues, `${path}.edibleUnit`, 'Expected canonical edible unit "g"');
  }
  const nutrientsPer100g = parseNutrientsPer100g(
    record.nutrientsPer100g,
    `${path}.nutrientsPer100g`,
    issues,
  );
  const nutritionSource = parseProvenance(
    record.nutritionSource,
    `${path}.nutritionSource`,
    issues,
  );

  if (
    issues.length !== initialIssueCount ||
    id === null ||
    nameTh === null ||
    nutrientsPer100g === null ||
    nutritionSource === null
  ) {
    return null;
  }

  return {
    id,
    nameTh,
    ...(nameEn === undefined ? {} : { nameEn }),
    edibleUnit: "g",
    nutrientsPer100g,
    nutritionSource,
  };
}

function parseRecipeIngredient(
  value: unknown,
  path: string,
  issues: ValidationIssue[],
): RecipeIngredient | null {
  const initialIssueCount = issues.length;
  const record = readRecord(value, path, issues);
  if (!record) return null;

  const ingredientId = readString(record, "ingredientId", `${path}.ingredientId`, issues);
  const edibleGrams = readNumber(record, "edibleGrams", `${path}.edibleGrams`, issues, {
    positive: true,
  });
  if (issues.length !== initialIssueCount || ingredientId === null || edibleGrams === null) {
    return null;
  }

  return { ingredientId, edibleGrams };
}

function parseRecipe(
  value: unknown,
  path: string,
  issues: ValidationIssue[],
): Recipe | null {
  const initialIssueCount = issues.length;
  const record = readRecord(value, path, issues);
  if (!record) return null;

  const id = readString(record, "id", `${path}.id`, issues);
  const slug = readString(record, "slug", `${path}.slug`, issues);
  const nameTh = readString(record, "nameTh", `${path}.nameTh`, issues);
  const servings = readNumber(record, "servings", `${path}.servings`, issues, {
    integer: true,
    positive: true,
  });
  const minutes = readNumber(record, "minutes", `${path}.minutes`, issues, {
    integer: true,
    positive: true,
  });
  const rawIngredientItems = readArray(record.ingredientItems, `${path}.ingredientItems`, issues);
  const ingredientItems = (rawIngredientItems ?? [])
    .map((item, index) => parseRecipeIngredient(item, `${path}.ingredientItems[${index}]`, issues))
    .filter((item): item is RecipeIngredient => item !== null);
  if (rawIngredientItems && rawIngredientItems.length === 0) {
    addIssue(issues, `${path}.ingredientItems`, "Expected at least one recipe ingredient");
  }
  const tags = readStringArray(record.tags, `${path}.tags`, issues);
  const exclusionTags = readStringArray(record.exclusionTags, `${path}.exclusionTags`, issues);
  const instructions = readStringArray(record.instructions, `${path}.instructions`, issues);
  if (instructions && instructions.length === 0) {
    addIssue(issues, `${path}.instructions`, "Expected at least one instruction");
  }
  const sourceNote = readString(record, "sourceNote", `${path}.sourceNote`, issues);

  if (
    issues.length !== initialIssueCount ||
    id === null ||
    slug === null ||
    nameTh === null ||
    servings === null ||
    minutes === null ||
    tags === null ||
    exclusionTags === null ||
    instructions === null ||
    sourceNote === null
  ) {
    return null;
  }

  return {
    id,
    slug,
    nameTh,
    servings,
    minutes,
    ingredientItems,
    tags,
    exclusionTags,
    instructions,
    sourceNote,
  };
}

function parseProductOffer(
  value: unknown,
  path: string,
  issues: ValidationIssue[],
): ProductOffer | null {
  const initialIssueCount = issues.length;
  const record = readRecord(value, path, issues);
  if (!record) return null;

  const id = readString(record, "id", `${path}.id`, issues);
  const ingredientId = readString(record, "ingredientId", `${path}.ingredientId`, issues);
  const retailerChainId = readString(record, "retailerChainId", `${path}.retailerChainId`, issues);
  const displayName = readString(record, "displayName", `${path}.displayName`, issues);
  const edibleQuantityGrams = readNumber(
    record,
    "edibleQuantityGrams",
    `${path}.edibleQuantityGrams`,
    issues,
    { positive: true },
  );
  const priceSatang = readNumber(record, "priceSatang", `${path}.priceSatang`, issues, {
    integer: true,
    positive: true,
  });
  const provenance = parseProvenance(record.provenance, `${path}.provenance`, issues);
  if (record.stockStatus !== "unknown") {
    addIssue(issues, `${path}.stockStatus`, 'Expected "unknown"; branch stock is not verified');
  }

  if (
    issues.length !== initialIssueCount ||
    id === null ||
    ingredientId === null ||
    retailerChainId === null ||
    displayName === null ||
    edibleQuantityGrams === null ||
    priceSatang === null ||
    provenance === null
  ) {
    return null;
  }

  return {
    id,
    ingredientId,
    retailerChainId,
    displayName,
    edibleQuantityGrams,
    priceSatang,
    provenance,
    stockStatus: "unknown",
  };
}

function parseStore(value: unknown, path: string, issues: ValidationIssue[]): Store | null {
  const initialIssueCount = issues.length;
  const record = readRecord(value, path, issues);
  if (!record) return null;

  const id = readString(record, "id", `${path}.id`, issues);
  const displayName = readString(record, "displayName", `${path}.displayName`, issues);
  const retailerChainId = readOptionalString(
    record,
    "retailerChainId",
    `${path}.retailerChainId`,
    issues,
  );
  const lat = readNumber(record, "lat", `${path}.lat`, issues, { minimum: -90, maximum: 90 });
  const lon = readNumber(record, "lon", `${path}.lon`, issues, { minimum: -180, maximum: 180 });
  const source = record.locationSource;
  const locationSource = source === "osm" || source === "demo" ? source : null;
  if (locationSource === null) {
    addIssue(issues, `${path}.locationSource`, 'Expected "osm" or "demo"');
  }
  const osmUrl = readOptionalHttpsUrl(record, "osmUrl", `${path}.osmUrl`, issues);
  if (locationSource === "osm" && !hasOwn(record, "osmUrl")) {
    addIssue(issues, `${path}.osmUrl`, "OSM locations require a source URL");
  }

  if (
    issues.length !== initialIssueCount ||
    id === null ||
    displayName === null ||
    lat === null ||
    lon === null ||
    locationSource === null
  ) {
    return null;
  }

  return {
    id,
    displayName,
    ...(retailerChainId === undefined ? {} : { retailerChainId }),
    lat,
    lon,
    locationSource,
    ...(osmUrl === undefined ? {} : { osmUrl }),
  };
}

function parsePantryItem(
  value: unknown,
  path: string,
  issues: ValidationIssue[],
): PantryItem | null {
  const initialIssueCount = issues.length;
  const record = readRecord(value, path, issues);
  if (!record) return null;

  const ingredientId = readString(record, "ingredientId", `${path}.ingredientId`, issues);
  const edibleGrams = readNumber(record, "edibleGrams", `${path}.edibleGrams`, issues, {
    minimum: 0,
  });
  if (issues.length !== initialIssueCount || ingredientId === null || edibleGrams === null) {
    return null;
  }

  return { ingredientId, edibleGrams };
}

function parseEntityArray<T>(
  value: unknown,
  path: string,
  parser: (item: unknown, itemPath: string, issues: ValidationIssue[]) => T | null,
  issues: ValidationIssue[],
): T[] {
  const values = readArray(value, path, issues);
  if (!values) return [];

  return values
    .map((item, index) => parser(item, `${path}[${index}]`, issues))
    .filter((item): item is T => item !== null);
}

function reportDuplicateValues(
  values: readonly string[],
  path: string,
  fieldName: string | undefined,
  issues: ValidationIssue[],
): void {
  const seen = new Set<string>();
  values.forEach((value, index) => {
    if (seen.has(value)) {
      const itemPath = fieldName === undefined ? `${path}[${index}]` : `${path}[${index}].${fieldName}`;
      const itemDescription = fieldName ?? "value";
      addIssue(issues, itemPath, `Duplicate ${itemDescription}: ${value}`);
      return;
    }
    seen.add(value);
  });
}

function validateUniqueIds(
  records: readonly { id: string }[],
  path: string,
  issues: ValidationIssue[],
): void {
  reportDuplicateValues(
    records.map((record) => record.id),
    path,
    "id",
    issues,
  );
}

export function validateFixtureDataset(input: unknown): ValidationResult<FixtureDataset> {
  const issues: ValidationIssue[] = [];
  const record = readRecord(input, "dataset", issues);
  if (!record) return { success: false, issues };

  const ingredients = parseEntityArray(record.ingredients, "ingredients", parseIngredient, issues);
  const recipes = parseEntityArray(record.recipes, "recipes", parseRecipe, issues);
  const productOffers = parseEntityArray(
    record.productOffers,
    "productOffers",
    parseProductOffer,
    issues,
  );
  const stores = parseEntityArray(record.stores, "stores", parseStore, issues);

  validateUniqueIds(ingredients, "ingredients", issues);
  validateUniqueIds(recipes, "recipes", issues);
  validateUniqueIds(productOffers, "productOffers", issues);
  validateUniqueIds(stores, "stores", issues);
  reportDuplicateValues(
    recipes.map((recipe) => recipe.slug),
    "recipes",
    "slug",
    issues,
  );

  const ingredientIds = new Set(ingredients.map((ingredient) => ingredient.id));
  recipes.forEach((recipe, recipeIndex) => {
    recipe.ingredientItems.forEach((item, itemIndex) => {
      if (!ingredientIds.has(item.ingredientId)) {
        addIssue(
          issues,
          `recipes[${recipeIndex}].ingredientItems[${itemIndex}].ingredientId`,
          `Unknown ingredient ID: ${item.ingredientId}`,
        );
      }
    });
  });
  productOffers.forEach((offer, offerIndex) => {
    if (!ingredientIds.has(offer.ingredientId)) {
      addIssue(
        issues,
        `productOffers[${offerIndex}].ingredientId`,
        `Unknown ingredient ID: ${offer.ingredientId}`,
      );
    }
  });

  if (issues.length > 0) return { success: false, issues };
  return { success: true, data: { ingredients, recipes, productOffers, stores } };
}

export function validatePlanningInput(
  input: unknown,
  references: Pick<FixtureDataset, "recipes" | "ingredients">,
): ValidationResult<PlanningInput> {
  const issues: ValidationIssue[] = [];
  const record = readRecord(input, "planningInput", issues);
  if (!record) return { success: false, issues };

  const recipeIds = readStringArray(record.recipeIds, "recipeIds", issues);
  const pantry = parseEntityArray(record.pantry, "pantry", parsePantryItem, issues);
  const excludedTags = hasOwn(record, "excludedTags")
    ? readStringArray(record.excludedTags, "excludedTags", issues)
    : undefined;
  const maxCheckoutBudgetSatang = hasOwn(record, "maxCheckoutBudgetSatang")
    ? readNumber(record, "maxCheckoutBudgetSatang", "maxCheckoutBudgetSatang", issues, {
        integer: true,
        minimum: 0,
      })
    : undefined;
  const minProteinGPerServing = hasOwn(record, "minProteinGPerServing")
    ? readNumber(record, "minProteinGPerServing", "minProteinGPerServing", issues, {
        minimum: 0,
      })
    : undefined;

  if (recipeIds) reportDuplicateValues(recipeIds, "recipeIds", undefined, issues);
  if (excludedTags) reportDuplicateValues(excludedTags, "excludedTags", undefined, issues);
  reportDuplicateValues(
    pantry.map((item) => item.ingredientId),
    "pantry",
    "ingredientId",
    issues,
  );

  if (recipeIds) {
    const knownRecipeIds = new Set(references.recipes.map((recipe) => recipe.id));
    recipeIds.forEach((recipeId, index) => {
      if (!knownRecipeIds.has(recipeId)) {
        addIssue(issues, `recipeIds[${index}]`, `Unknown recipe ID: ${recipeId}`);
      }
    });
  }
  const knownIngredientIds = new Set(references.ingredients.map((ingredient) => ingredient.id));
  pantry.forEach((item, index) => {
    if (!knownIngredientIds.has(item.ingredientId)) {
      addIssue(
        issues,
        `pantry[${index}].ingredientId`,
        `Unknown ingredient ID: ${item.ingredientId}`,
      );
    }
  });
  if (excludedTags) {
    const knownExclusionTags = new Set(
      references.recipes.flatMap((recipe) => recipe.exclusionTags),
    );
    excludedTags.forEach((tag, index) => {
      if (!knownExclusionTags.has(tag)) {
        addIssue(issues, `excludedTags[${index}]`, `Unsupported exclusion tag: ${tag}`);
      }
    });
  }

  if (
    issues.length > 0 ||
    recipeIds === null ||
    excludedTags === null ||
    maxCheckoutBudgetSatang === null ||
    minProteinGPerServing === null
  ) {
    return { success: false, issues };
  }

  const planningInput: PlanningInput = { recipeIds, pantry };
  if (excludedTags !== undefined) {
    planningInput.excludedTags = excludedTags;
  }
  if (maxCheckoutBudgetSatang !== undefined) {
    planningInput.maxCheckoutBudgetSatang = maxCheckoutBudgetSatang;
  }
  if (minProteinGPerServing !== undefined) {
    planningInput.minProteinGPerServing = minProteinGPerServing;
  }

  return { success: true, data: planningInput };
}
