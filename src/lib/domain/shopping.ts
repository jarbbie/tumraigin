import type { ProductOffer } from "../../types";
import type { IngredientShortage } from "./pantry";

export type ShoppingCalculationErrorCode =
  | "invalid_shortage"
  | "invalid_offer"
  | "missing_offer"
  | "invalid_candidate_chain_id"
  | "duplicate_candidate_chain_id"
  | "duplicate_offer_id"
  | "duplicate_shortage_ingredient_id"
  | "cost_overflow";

export type ShoppingCalculationError = {
  code: ShoppingCalculationErrorCode;
  message: string;
  ingredientId?: string;
  retailerChainId?: string;
  itemIndex?: number;
};

export type ShoppingCalculationResult<T = unknown> =
  | { success: true; data: T }
  | { success: false; errors: ShoppingCalculationError[] };

export type CalculatePackPurchaseInput = {
  shortageGrams: number;
  offer: ProductOffer | null;
};

export type PackPurchase = {
  status: "not_needed" | "priced";
  offer: ProductOffer | null;
  packsNeeded: number;
  cashNeededSatang: number;
  consumedCostSatang: number;
  leftoverGrams: number;
};

export type BuildShoppingBasketInput = {
  shortages: readonly IngredientShortage[];
  offers: readonly ProductOffer[];
  candidateRetailerChainIds: readonly string[];
};

export type ShoppingBasketLine = IngredientShortage & {
  offer: ProductOffer | null;
  purchase: PackPurchase | null;
};

export type ShoppingBasketCandidate = {
  retailerChainId: string;
  lines: ShoppingBasketLine[];
  complete: boolean;
  coverage: {
    neededIngredientCount: number;
    pricedIngredientCount: number;
  };
  checkoutCostSatang: number | null;
  knownCheckoutSubtotalSatang: number;
  consumedCostSatang: number | null;
  knownConsumedSubtotalSatang: number;
  unpricedIngredientIds: string[];
};

export type BuildShoppingBasketData = {
  candidates: ShoppingBasketCandidate[];
};

export type BuildShoppingBasketErrorContext = {
  ingredientId?: string;
  retailerChainId?: string;
  itemIndex?: number;
};

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

function isValidOffer(value: unknown): value is ProductOffer {
  if (!isRecord(value) || !isRecord(value.provenance)) return false;

  return isNonEmptyString(value.id)
    && isNonEmptyString(value.ingredientId)
    && isNonEmptyString(value.retailerChainId)
    && isNonEmptyString(value.displayName)
    && typeof value.edibleQuantityGrams === "number"
    && Number.isFinite(value.edibleQuantityGrams)
    && value.edibleQuantityGrams > 0
    && typeof value.priceSatang === "number"
    && Number.isSafeInteger(value.priceSatang)
    && value.priceSatang > 0
    && value.stockStatus === "unknown"
    && ["usda", "verified_catalog", "curated_estimate", "simulated"].includes(
      String(value.provenance.kind),
    );
}

function failure(
  code: ShoppingCalculationErrorCode,
  message: string,
  context: BuildShoppingBasketErrorContext = {},
): ShoppingCalculationError {
  return { code, message, ...context };
}

/** Price the whole packs needed for a shortage, preserving checkout and consumption separately. */
export function calculatePackPurchase(
  input: CalculatePackPurchaseInput,
): ShoppingCalculationResult<PackPurchase> {
  if (typeof input?.shortageGrams !== "number" || !Number.isFinite(input.shortageGrams) || input.shortageGrams < 0) {
    return {
      success: false,
      errors: [failure("invalid_shortage", "Shortage grams must be a finite number greater than or equal to zero")],
    };
  }

  if (input.shortageGrams === 0) {
    return {
      success: true,
      data: {
        status: "not_needed",
        offer: null,
        packsNeeded: 0,
        cashNeededSatang: 0,
        consumedCostSatang: 0,
        leftoverGrams: 0,
      },
    };
  }

  if (input.offer === null) {
    return {
      success: false,
      errors: [failure("missing_offer", "A positive shortage requires a product offer")],
    };
  }
  if (!isValidOffer(input.offer)) {
    return {
      success: false,
      errors: [failure("invalid_offer", "Offer must have a valid pack size, integer satang price, provenance, and unknown stock")],
    };
  }

  const packsNeeded = Math.max(
    1,
    Math.ceil(input.shortageGrams / input.offer.edibleQuantityGrams),
  );
  if (!Number.isSafeInteger(packsNeeded)) {
    return {
      success: false,
      errors: [failure("cost_overflow", "Required pack count exceeds the safe integer range", {
        ingredientId: input.offer.ingredientId,
        retailerChainId: input.offer.retailerChainId,
      })],
    };
  }

  const cashNeededSatang = packsNeeded * input.offer.priceSatang;
  const purchasedGrams = packsNeeded * input.offer.edibleQuantityGrams;
  const consumedCostSatang = Math.round(
    (input.shortageGrams / input.offer.edibleQuantityGrams) * input.offer.priceSatang,
  );
  if (
    !Number.isSafeInteger(cashNeededSatang)
    || !Number.isFinite(purchasedGrams)
    || !Number.isSafeInteger(consumedCostSatang)
  ) {
    return {
      success: false,
      errors: [failure("cost_overflow", "Pack cost or purchase quantity exceeds the safe calculation range", {
        ingredientId: input.offer.ingredientId,
        retailerChainId: input.offer.retailerChainId,
      })],
    };
  }

  return {
    success: true,
    data: {
      status: "priced",
      offer: input.offer,
      packsNeeded,
      cashNeededSatang,
      consumedCostSatang,
      leftoverGrams: Math.max(purchasedGrams - input.shortageGrams, 0),
    },
  };
}

function validateShortage(
  value: unknown,
  itemIndex: number,
  errors: ShoppingCalculationError[],
): value is IngredientShortage {
  if (!isRecord(value)) {
    errors.push(failure("invalid_shortage", "Each shortage must be an object", { itemIndex }));
    return false;
  }

  const { ingredientId, requiredGrams, pantryGrams, shortageGrams } = value;
  if (
    !isNonEmptyString(ingredientId)
    || typeof requiredGrams !== "number"
    || !Number.isFinite(requiredGrams)
    || requiredGrams <= 0
    || typeof pantryGrams !== "number"
    || !Number.isFinite(pantryGrams)
    || pantryGrams < 0
    || typeof shortageGrams !== "number"
    || !Number.isFinite(shortageGrams)
    || shortageGrams < 0
    || shortageGrams !== Math.max(requiredGrams - pantryGrams, 0)
  ) {
    errors.push(failure("invalid_shortage", "Shortage values must be finite, non-negative, and consistent with required and pantry grams", {
      ...(isNonEmptyString(ingredientId) ? { ingredientId } : {}),
      itemIndex,
    }));
    return false;
  }

  return true;
}

function addMoney(
  runningTotal: number,
  amountSatang: number,
  errors: ShoppingCalculationError[],
  context: BuildShoppingBasketErrorContext,
): number {
  const total = runningTotal + amountSatang;
  if (!Number.isSafeInteger(total)) {
    errors.push(failure("cost_overflow", "Basket subtotal exceeds the safe integer range", context));
    return runningTotal;
  }

  return total;
}

function comparePurchases(left: PackPurchase, right: PackPurchase): number {
  if (left.cashNeededSatang !== right.cashNeededSatang) {
    return left.cashNeededSatang - right.cashNeededSatang;
  }
  if (left.leftoverGrams !== right.leftoverGrams) {
    return left.leftoverGrams - right.leftoverGrams;
  }

  return compareIds(left.offer?.id ?? "", right.offer?.id ?? "");
}

/** Build separate chain-level baskets; chain coverage never asserts branch stock. */
export function buildShoppingBasket(
  input: BuildShoppingBasketInput,
): ShoppingCalculationResult<BuildShoppingBasketData> {
  const errors: ShoppingCalculationError[] = [];
  const rawShortages: readonly unknown[] = Array.isArray(input?.shortages) ? input.shortages : [];
  const rawOffers: readonly unknown[] = Array.isArray(input?.offers) ? input.offers : [];
  const rawChainIds: readonly unknown[] = Array.isArray(input?.candidateRetailerChainIds)
    ? input.candidateRetailerChainIds
    : [];

  if (!Array.isArray(input?.shortages)) {
    errors.push(failure("invalid_shortage", "Shortages must be provided as an array"));
  }
  if (!Array.isArray(input?.offers)) {
    errors.push(failure("invalid_offer", "Offers must be provided as an array"));
  }
  if (!Array.isArray(input?.candidateRetailerChainIds)) {
    errors.push(failure("invalid_candidate_chain_id", "Candidate retailer chain IDs must be provided as an array"));
  }

  const shortages: IngredientShortage[] = [];
  const shortageIds = new Set<string>();
  rawShortages.forEach((shortage, itemIndex) => {
    if (!validateShortage(shortage, itemIndex, errors)) return;
    if (shortageIds.has(shortage.ingredientId)) {
      errors.push(failure("duplicate_shortage_ingredient_id", `Duplicate shortage for ${shortage.ingredientId}`, {
        ingredientId: shortage.ingredientId,
        itemIndex,
      }));
      return;
    }
    shortageIds.add(shortage.ingredientId);
    shortages.push(shortage);
  });

  const candidateRetailerChainIds: string[] = [];
  const chainIds = new Set<string>();
  rawChainIds.forEach((rawChainId, itemIndex) => {
    if (!isNonEmptyString(rawChainId)) {
      errors.push(failure("invalid_candidate_chain_id", "Retailer chain ID must be a non-empty string", { itemIndex }));
      return;
    }
    if (chainIds.has(rawChainId)) {
      errors.push(failure("duplicate_candidate_chain_id", `Duplicate candidate retailer chain ID: ${rawChainId}`, {
        retailerChainId: rawChainId,
        itemIndex,
      }));
      return;
    }
    chainIds.add(rawChainId);
    candidateRetailerChainIds.push(rawChainId);
  });

  const offers: ProductOffer[] = [];
  const offerIds = new Set<string>();
  rawOffers.forEach((rawOffer, itemIndex) => {
    if (!isValidOffer(rawOffer)) {
      errors.push(failure("invalid_offer", "Offer must have a valid pack size, integer satang price, provenance, and unknown stock", { itemIndex }));
      return;
    }
    if (offerIds.has(rawOffer.id)) {
      errors.push(failure("duplicate_offer_id", `Duplicate product offer ID: ${rawOffer.id}`, {
        ingredientId: rawOffer.ingredientId,
        retailerChainId: rawOffer.retailerChainId,
        itemIndex,
      }));
      return;
    }
    offerIds.add(rawOffer.id);
    offers.push(rawOffer);
  });

  if (errors.length > 0) return { success: false, errors };

  const candidates: ShoppingBasketCandidate[] = [];
  candidateRetailerChainIds.sort(compareIds).forEach((retailerChainId) => {
    let knownCheckoutSubtotalSatang = 0;
    let knownConsumedSubtotalSatang = 0;
    let neededIngredientCount = 0;
    let pricedIngredientCount = 0;
    const unpricedIngredientIds: string[] = [];
    const lines: ShoppingBasketLine[] = [];

    [...shortages]
      .sort((left, right) => compareIds(left.ingredientId, right.ingredientId))
      .forEach((shortage) => {
        if (shortage.shortageGrams === 0) {
          const result = calculatePackPurchase({ shortageGrams: 0, offer: null });
          if (!result.success) {
            errors.push(...result.errors);
            return;
          }
          lines.push({ ...shortage, offer: null, purchase: result.data });
          return;
        }

        neededIngredientCount += 1;
        const matchingOffers = offers.filter(
          (offer) => offer.ingredientId === shortage.ingredientId
            && offer.retailerChainId === retailerChainId,
        );
        const purchases: PackPurchase[] = [];
        matchingOffers.forEach((offer) => {
          const result = calculatePackPurchase({ shortageGrams: shortage.shortageGrams, offer });
          if (!result.success) {
            errors.push(...result.errors);
            return;
          }
          purchases.push(result.data);
        });

        if (purchases.length === 0) {
          unpricedIngredientIds.push(shortage.ingredientId);
          lines.push({ ...shortage, offer: null, purchase: null });
          return;
        }

        purchases.sort(comparePurchases);
        const purchase = purchases[0];
        if (!purchase) return;
        pricedIngredientCount += 1;
        const context = { ingredientId: shortage.ingredientId, retailerChainId };
        knownCheckoutSubtotalSatang = addMoney(
          knownCheckoutSubtotalSatang,
          purchase.cashNeededSatang,
          errors,
          context,
        );
        knownConsumedSubtotalSatang = addMoney(
          knownConsumedSubtotalSatang,
          purchase.consumedCostSatang,
          errors,
          context,
        );
        lines.push({
          ...shortage,
          offer: purchase.offer,
          purchase,
        });
      });

    const complete = unpricedIngredientIds.length === 0;
    candidates.push({
      retailerChainId,
      lines,
      complete,
      coverage: { neededIngredientCount, pricedIngredientCount },
      checkoutCostSatang: complete ? knownCheckoutSubtotalSatang : null,
      knownCheckoutSubtotalSatang,
      consumedCostSatang: complete ? knownConsumedSubtotalSatang : null,
      knownConsumedSubtotalSatang,
      unpricedIngredientIds,
    });
  });

  if (errors.length > 0) return { success: false, errors };
  return { success: true, data: { candidates } };
}
