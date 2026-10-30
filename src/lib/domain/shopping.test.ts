import { describe, expect, it } from "vitest";
import type { ProductOffer } from "../../types";
import {
  buildShoppingBasket,
  calculatePackPurchase,
  type ShoppingCalculationResult,
} from "./shopping";

function makeOffer(
  id: string,
  ingredientId: string,
  retailerChainId: string,
  edibleQuantityGrams = 250,
  priceSatang = 2_000,
): ProductOffer {
  return {
    id,
    ingredientId,
    retailerChainId,
    displayName: `${id} · ${edibleQuantityGrams} g (simulated)`,
    edibleQuantityGrams,
    priceSatang,
    provenance: { kind: "simulated", explanation: "Synthetic test offer" },
    stockStatus: "unknown",
  };
}

function getData<T>(result: ShoppingCalculationResult<T>): T {
  if (!result.success) {
    throw new Error(`Unexpected shopping calculation errors: ${result.errors.map((error) => error.code).join(", ")}`);
  }
  return result.data;
}

function getErrorCodes(result: ShoppingCalculationResult<unknown>): string[] {
  if (result.success) throw new Error("Expected shopping calculation to fail");
  return result.errors.map((error) => error.code);
}

describe("calculatePackPurchase", () => {
  it.each([
    [0, 0, 0, 0],
    [250, 1, 2_000, 0],
    [251, 2, 4_000, 249],
    [500, 2, 4_000, 0],
  ])("calculates %i g shortage with whole packs", (shortageGrams, packsNeeded, cashNeededSatang, leftoverGrams) => {
    const result = calculatePackPurchase({
      shortageGrams,
      offer: makeOffer("offer:rice-250", "ingredient:rice", "chain:demo", 250, 2_000),
    });

    expect(getData(result)).toMatchObject({
      packsNeeded,
      cashNeededSatang,
      leftoverGrams,
    });
  });

  it("returns a zero-cost no-purchase result without requiring an offer", () => {
    const result = calculatePackPurchase({ shortageGrams: 0, offer: null });

    expect(getData(result)).toMatchObject({
      status: "not_needed",
      offer: null,
      packsNeeded: 0,
      cashNeededSatang: 0,
      consumedCostSatang: 0,
      leftoverGrams: 0,
    });
  });

  it("rounds consumed-portion estimates to integer satang", () => {
    const result = calculatePackPurchase({
      shortageGrams: 1,
      offer: makeOffer("offer:test-small", "ingredient:test", "chain:demo", 3, 100),
    });

    expect(getData(result).consumedCostSatang).toBe(33);
  });

  it("still buys one pack when a positive ratio underflows to zero", () => {
    const result = calculatePackPurchase({
      shortageGrams: Number.MIN_VALUE,
      offer: makeOffer("offer:huge-pack", "ingredient:test", "chain:demo", Number.MAX_VALUE, 1),
    });

    expect(getData(result).packsNeeded).toBe(1);
  });

  it("rejects invalid shortage, pack size, and non-integer or unsafe satang values", () => {
    const negativeShortage = calculatePackPurchase({
      shortageGrams: -1,
      offer: makeOffer("offer:rice", "ingredient:rice", "chain:demo"),
    });
    const invalidPack = calculatePackPurchase({
      shortageGrams: 100,
      offer: makeOffer("offer:zero-pack", "ingredient:rice", "chain:demo", 0),
    });
    const invalidPrice = calculatePackPurchase({
      shortageGrams: 100,
      offer: makeOffer("offer:fractional-price", "ingredient:rice", "chain:demo", 250, 1.5),
    });

    expect(getErrorCodes(negativeShortage)).toContain("invalid_shortage");
    expect(getErrorCodes(invalidPack)).toContain("invalid_offer");
    expect(getErrorCodes(invalidPrice)).toContain("invalid_offer");
  });
});

describe("buildShoppingBasket", () => {
  const shortages = [
    {
      ingredientId: "ingredient:beans",
      requiredGrams: 100,
      pantryGrams: 20,
      shortageGrams: 80,
    },
    {
      ingredientId: "ingredient:rice",
      requiredGrams: 250,
      pantryGrams: 0,
      shortageGrams: 250,
    },
  ];

  it("builds one complete chain basket with separate checkout and consumed costs", () => {
    const result = buildShoppingBasket({
      shortages,
      offers: [
        makeOffer("offer:rice", "ingredient:rice", "chain:demo", 250, 2_000),
        makeOffer("offer:beans", "ingredient:beans", "chain:demo", 100, 1_000),
      ],
      candidateRetailerChainIds: ["chain:demo"],
    });
    const [basket] = getData(result).candidates;

    expect(basket).toMatchObject({
      retailerChainId: "chain:demo",
      complete: true,
      coverage: { neededIngredientCount: 2, pricedIngredientCount: 2 },
      checkoutCostSatang: 3_000,
      knownCheckoutSubtotalSatang: 3_000,
      consumedCostSatang: 2_800,
      knownConsumedSubtotalSatang: 2_800,
      unpricedIngredientIds: [],
    });
    expect(basket?.lines.map((line) => line.ingredientId)).toEqual([
      "ingredient:beans",
      "ingredient:rice",
    ]);
    expect(basket?.lines.every((line) => line.purchase?.offer?.stockStatus === "unknown")).toBe(true);
  });

  it("keeps a chain incomplete when any positive shortage has no offer", () => {
    const result = buildShoppingBasket({
      shortages,
      offers: [makeOffer("offer:beans", "ingredient:beans", "chain:demo", 100, 1_000)],
      candidateRetailerChainIds: ["chain:demo"],
    });
    const [basket] = getData(result).candidates;

    expect(basket).toMatchObject({
      complete: false,
      checkoutCostSatang: null,
      knownCheckoutSubtotalSatang: 1_000,
      consumedCostSatang: null,
      knownConsumedSubtotalSatang: 800,
      unpricedIngredientIds: ["ingredient:rice"],
      coverage: { neededIngredientCount: 2, pricedIngredientCount: 1 },
    });
    expect(basket?.lines.find((line) => line.ingredientId === "ingredient:rice")).toMatchObject({
      shortageGrams: 250,
      offer: null,
      purchase: null,
    });
  });

  it("does not require an offer when pantry leaves no purchase need", () => {
    const result = buildShoppingBasket({
      shortages: [{
        ingredientId: "ingredient:rice",
        requiredGrams: 250,
        pantryGrams: 300,
        shortageGrams: 0,
      }],
      offers: [],
      candidateRetailerChainIds: ["chain:demo"],
    });
    const [basket] = getData(result).candidates;

    expect(basket).toMatchObject({
      complete: true,
      checkoutCostSatang: 0,
      consumedCostSatang: 0,
      coverage: { neededIngredientCount: 0, pricedIngredientCount: 0 },
    });
    expect(basket?.lines[0]?.purchase?.status).toBe("not_needed");
  });

  it("compares coverage independently for each candidate retailer chain", () => {
    const result = buildShoppingBasket({
      shortages,
      offers: [
        makeOffer("offer:demo-rice", "ingredient:rice", "chain:demo", 250, 2_000),
        makeOffer("offer:other-rice", "ingredient:rice", "chain:other", 500, 3_000),
        makeOffer("offer:other-beans", "ingredient:beans", "chain:other", 100, 1_500),
      ],
      candidateRetailerChainIds: ["chain:other", "chain:demo"],
    });
    const { candidates } = getData(result);

    expect(candidates.map((candidate) => candidate.retailerChainId)).toEqual([
      "chain:demo",
      "chain:other",
    ]);
    expect(candidates[0]).toMatchObject({ complete: false, checkoutCostSatang: null });
    expect(candidates[1]).toMatchObject({ complete: true, checkoutCostSatang: 4_500 });
  });

  it("chooses the smaller cash outlay even when a bulk pack has a lower unit price", () => {
    const result = buildShoppingBasket({
      shortages: [{
        ingredientId: "ingredient:rice",
        requiredGrams: 100,
        pantryGrams: 0,
        shortageGrams: 100,
      }],
      offers: [
        makeOffer("offer:small", "ingredient:rice", "chain:demo", 100, 1_000),
        makeOffer("offer:bulk", "ingredient:rice", "chain:demo", 1_000, 5_000),
      ],
      candidateRetailerChainIds: ["chain:demo"],
    });
    const [basket] = getData(result).candidates;

    expect(basket?.checkoutCostSatang).toBe(1_000);
    expect(basket?.lines[0]?.purchase?.offer?.id).toBe("offer:small");
    expect(basket?.lines[0]?.purchase?.leftoverGrams).toBe(0);
  });

  it("breaks equal cash and leftover ties by offer ID", () => {
    const result = buildShoppingBasket({
      shortages: [{
        ingredientId: "ingredient:rice",
        requiredGrams: 100,
        pantryGrams: 0,
        shortageGrams: 100,
      }],
      offers: [
        makeOffer("offer:z", "ingredient:rice", "chain:demo", 250, 2_000),
        makeOffer("offer:a", "ingredient:rice", "chain:demo", 250, 2_000),
      ],
      candidateRetailerChainIds: ["chain:demo"],
    });
    const [basket] = getData(result).candidates;

    expect(basket?.lines[0]?.purchase?.offer?.id).toBe("offer:a");
  });

  it("rejects inconsistent, duplicate, and malformed basket inputs", () => {
    const inconsistent = buildShoppingBasket({
      shortages: [{
        ingredientId: "ingredient:rice",
        requiredGrams: 250,
        pantryGrams: 100,
        shortageGrams: 100,
      }],
      offers: [],
      candidateRetailerChainIds: ["chain:demo"],
    });
    const duplicateChain = buildShoppingBasket({
      shortages: [],
      offers: [],
      candidateRetailerChainIds: ["chain:demo", "chain:demo"],
    });
    const duplicateOffer: ProductOffer = makeOffer("offer:rice", "ingredient:rice", "chain:demo");
    const duplicateOfferIds = buildShoppingBasket({
      shortages: [{
        ingredientId: "ingredient:rice",
        requiredGrams: 100,
        pantryGrams: 0,
        shortageGrams: 100,
      }],
      offers: [duplicateOffer, { ...duplicateOffer }],
      candidateRetailerChainIds: ["chain:demo"],
    });

    expect(getErrorCodes(inconsistent)).toContain("invalid_shortage");
    expect(getErrorCodes(duplicateChain)).toContain("duplicate_candidate_chain_id");
    expect(getErrorCodes(duplicateOfferIds)).toContain("duplicate_offer_id");
  });
});
