import { describe, expect, it } from "vitest";
import { validateFixtureDataset, validatePlanningInput } from "./validate-fixtures";

function validFixtureDataset() {
  return {
    ingredients: [
      {
        id: "ingredient:test-rice",
        nameTh: "ข้าว (ข้อมูลทดสอบ)",
        edibleUnit: "g",
        nutrientsPer100g: {
          kcal: null,
          proteinG: null,
          carbG: null,
          fatG: null,
          fiberG: null,
        },
        nutritionSource: {
          kind: "simulated",
          explanation: "Test fixture only",
        },
      },
    ],
    recipes: [
      {
        id: "recipe:test-rice",
        slug: "test-rice",
        nameTh: "เมนูทดสอบ",
        servings: 1,
        minutes: 10,
        ingredientItems: [{ ingredientId: "ingredient:test-rice", edibleGrams: 100 }],
        tags: [],
        exclusionTags: ["poultry"],
        instructions: ["ข้อมูลทดสอบเท่านั้น"],
        sourceNote: "Test fixture only",
      },
    ],
    productOffers: [
      {
        id: "offer:test-rice",
        ingredientId: "ingredient:test-rice",
        retailerChainId: "chain:test",
        displayName: "แพ็กทดสอบ",
        edibleQuantityGrams: 250,
        priceSatang: 100,
        provenance: {
          kind: "simulated",
          explanation: "Test fixture only",
        },
        stockStatus: "unknown",
      },
    ],
    stores: [
      {
        id: "store:test-demo",
        displayName: "จุดทดสอบ",
        retailerChainId: "chain:test",
        lat: 13.75,
        lon: 100.53,
        locationSource: "demo",
      },
    ],
  };
}

function first<T>(items: T[], description: string): T {
  const item = items[0];
  if (!item) throw new Error(`Missing ${description} in test fixture`);
  return item;
}

function checkedFixtureDataset() {
  const result = validateFixtureDataset(validFixtureDataset());
  if (!result.success) throw new Error("The valid test fixture failed validation");
  return result.data;
}

function expectIssueAt(result: ReturnType<typeof validateFixtureDataset>, path: string) {
  if (result.success) {
    throw new Error(`Expected validation to fail at ${path}`);
  }

  expect(result.issues.map((issue) => issue.path)).toContain(path);
}

describe("validateFixtureDataset", () => {
  it("keeps unknown nutrients null and models stores separately from offers", () => {
    const result = validateFixtureDataset(validFixtureDataset());

    expect(result.success).toBe(true);
    if (!result.success) return;

    expect(result.data.ingredients[0]?.nutrientsPer100g.fiberG).toBeNull();
    expect(result.data.productOffers[0]?.stockStatus).toBe("unknown");
    expect(result.data.stores).toHaveLength(1);
  });

  it("rejects an offer with a zero-sized pack", () => {
    const input = validFixtureDataset();
    first(input.productOffers, "offer").edibleQuantityGrams = 0;

    expectIssueAt(validateFixtureDataset(input), "productOffers[0].edibleQuantityGrams");
  });

  it("rejects out-of-range store coordinates", () => {
    const input = validFixtureDataset();
    first(input.stores, "store").lat = 91;

    expectIssueAt(validateFixtureDataset(input), "stores[0].lat");
  });

  it("rejects duplicate IDs within an entity collection", () => {
    const input = validFixtureDataset();
    input.ingredients.push({ ...first(input.ingredients, "ingredient") });

    expectIssueAt(validateFixtureDataset(input), "ingredients[1].id");
  });

  it("rejects recipe references to unknown ingredients", () => {
    const input = validFixtureDataset();
    const recipe = first(input.recipes, "recipe");
    first(recipe.ingredientItems, "recipe ingredient").ingredientId = "ingredient:missing";

    expectIssueAt(
      validateFixtureDataset(input),
      "recipes[0].ingredientItems[0].ingredientId",
    );
  });

  it("rejects offers that reference unknown ingredients", () => {
    const input = validFixtureDataset();
    first(input.productOffers, "offer").ingredientId = "ingredient:missing";

    expectIssueAt(validateFixtureDataset(input), "productOffers[0].ingredientId");
  });

  it("rejects non-integer satang prices", () => {
    const input = validFixtureDataset();
    first(input.productOffers, "offer").priceSatang = 1.5;

    expectIssueAt(validateFixtureDataset(input), "productOffers[0].priceSatang");
  });

  it("rejects offers that imply branch inventory is verified", () => {
    const input = validFixtureDataset();
    first(input.productOffers, "offer").stockStatus = "in_stock";

    expectIssueAt(validateFixtureDataset(input), "productOffers[0].stockStatus");
  });
});

describe("validatePlanningInput", () => {
  it("accepts known IDs and a zero checkout budget", () => {
    const result = validatePlanningInput(
      {
        recipeIds: ["recipe:test-rice"],
        pantry: [{ ingredientId: "ingredient:test-rice", edibleGrams: 0 }],
        excludedTags: ["poultry"],
        maxCheckoutBudgetSatang: 0,
      },
      checkedFixtureDataset(),
    );

    expect(result.success).toBe(true);
    if (result.success) expect(result.data.excludedTags).toEqual(["poultry"]);
  });

  it("rejects duplicate and unsupported exclusion tags", () => {
    const result = validatePlanningInput(
      {
        recipeIds: ["recipe:test-rice"],
        pantry: [],
        excludedTags: ["poultry", "poultry", "unsupported"],
      },
      checkedFixtureDataset(),
    );

    expect(result.success).toBe(false);
    if (result.success) return;

    expect(result.issues.map((issue) => issue.path)).toEqual(
      expect.arrayContaining(["excludedTags[1]", "excludedTags[2]"]),
    );
  });

  it("rejects negative pantry amounts and non-integer checkout budgets", () => {
    const result = validatePlanningInput({
      recipeIds: ["recipe:test-rice"],
      pantry: [{ ingredientId: "ingredient:test-rice", edibleGrams: -1 }],
      maxCheckoutBudgetSatang: 100.5,
    }, checkedFixtureDataset());

    expect(result.success).toBe(false);
    if (result.success) return;

    expect(result.issues.map((issue) => issue.path)).toEqual(
      expect.arrayContaining(["pantry[0].edibleGrams", "maxCheckoutBudgetSatang"]),
    );
  });

  it("rejects unknown recipe and pantry ingredient IDs", () => {
    const result = validatePlanningInput(
      {
        recipeIds: ["recipe:missing"],
        pantry: [{ ingredientId: "ingredient:missing", edibleGrams: 5 }],
      },
      checkedFixtureDataset(),
    );

    expect(result.success).toBe(false);
    if (result.success) return;

    expect(result.issues.map((issue) => issue.path)).toEqual(
      expect.arrayContaining(["recipeIds[0]", "pantry[0].ingredientId"]),
    );
  });
});
