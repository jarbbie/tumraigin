export type FoodDataCentralRecord = {
  fdcId: number;
  recordDescription: string;
  sourceUrl: string;
};

export type Provenance =
  | ({ kind: "usda"; checkedAt: string } & FoodDataCentralRecord)
  | { kind: "verified_catalog"; sourceUrl: string; checkedAt: string }
  | {
      kind: "curated_estimate";
      explanation: string;
      checkedAt: string;
      reference?: FoodDataCentralRecord;
    }
  | { kind: "simulated"; explanation: string };

export type NutrientsPer100g = {
  kcal: number | null;
  proteinG: number | null;
  carbG: number | null;
  fatG: number | null;
  fiberG?: number | null;
  sodiumMg?: number | null;
  calciumMg?: number | null;
  ironMg?: number | null;
};

export type Ingredient = {
  id: string;
  nameTh: string;
  nameEn?: string;
  edibleUnit: "g";
  nutrientsPer100g: NutrientsPer100g;
  nutritionSource: Provenance;
};

export type RecipeIngredient = {
  ingredientId: string;
  edibleGrams: number;
};

export type Recipe = {
  id: string;
  slug: string;
  nameTh: string;
  servings: number;
  minutes: number;
  ingredientItems: RecipeIngredient[];
  tags: string[];
  exclusionTags: string[];
  instructions: string[];
  sourceNote: string;
};

export type ProductOffer = {
  id: string;
  ingredientId: string;
  retailerChainId: string;
  displayName: string;
  edibleQuantityGrams: number;
  priceSatang: number;
  provenance: Provenance;
  stockStatus: "unknown";
};

export type Store = {
  id: string;
  displayName: string;
  retailerChainId?: string;
  lat: number;
  lon: number;
  locationSource: "osm" | "demo";
  osmUrl?: string;
};

export type SavedLocation = {
  id: string;
  label: string;
  lat: number;
  lon: number;
};

export type SavedLocationState = {
  version: 1;
  locations: SavedLocation[];
  selectedLocationId: string | null;
};

export type PantryItem = {
  ingredientId: string;
  edibleGrams: number;
};

export type PlanningInput = {
  recipeIds: string[];
  pantry: PantryItem[];
  excludedTags?: string[];
  maxCheckoutBudgetSatang?: number;
  minProteinGPerServing?: number;
};

export type FixtureDataset = {
  ingredients: Ingredient[];
  recipes: Recipe[];
  productOffers: ProductOffer[];
  stores: Store[];
};
