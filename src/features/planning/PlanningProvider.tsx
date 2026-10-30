"use client";

import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import { fixtureDataset } from "@/data/fixtures";
import { rankRecipes, type RankedRecipe, type RecipeRankingPreferences } from "@/lib/domain/rank-recipes";
import type { PantryItem } from "@/types";

type PlanningContextValue = {
  preferences: RecipeRankingPreferences | null;
  pantry: PantryItem[];
  preferencesSkipped: boolean;
  selectedRecipeId: string | null;
  rankedRecipes: RankedRecipe[] | null;
  rankingError: string | null;
  savePreferences: (preferences: RecipeRankingPreferences, pantry: PantryItem[]) => void;
  skipPreferences: () => void;
  selectRecipe: (recipeId: string) => void;
  removeSelectedRecipe: () => void;
  setPantryQuantity: (ingredientId: string, edibleGrams: number) => void;
};

const PlanningContext = createContext<PlanningContextValue | null>(null);

const candidateRetailerChainIds = [...new Set(
  fixtureDataset.productOffers.map((offer) => offer.retailerChainId),
)].sort();

export function PlanningProvider({ children }: { children: ReactNode }) {
  const [preferences, setPreferences] = useState<RecipeRankingPreferences | null>(null);
  const [pantry, setPantry] = useState<PantryItem[]>([]);
  const [preferencesSkipped, setPreferencesSkipped] = useState(true);
  const [selectedRecipeId, setSelectedRecipeId] = useState<string | null>(null);

  const rankingResult = useMemo(() => rankRecipes({
    recipes: fixtureDataset.recipes,
    ingredients: fixtureDataset.ingredients,
    offers: fixtureDataset.productOffers,
    candidateRetailerChainIds,
    preferences: preferences === null && pantry.length === 0
      ? undefined
      : { ...preferences, pantry },
  }), [pantry, preferences]);

  const contextValue = useMemo<PlanningContextValue>(() => ({
    preferences,
    pantry,
    preferencesSkipped,
    selectedRecipeId,
    rankedRecipes: rankingResult.success ? rankingResult.data.rankedRecipes : null,
    rankingError: rankingResult.success ? null : rankingResult.errors.map((error) => error.message).join(" "),
    savePreferences: (nextPreferences, nextPantry) => {
      setPreferences(nextPreferences);
      setPantry(nextPantry.filter((item) => item.edibleGrams > 0));
      setPreferencesSkipped(false);
    },
    skipPreferences: () => {
      setPreferences(null);
      setPantry([]);
      setPreferencesSkipped(true);
    },
    selectRecipe: (recipeId) => setSelectedRecipeId(recipeId),
    removeSelectedRecipe: () => setSelectedRecipeId(null),
    setPantryQuantity: (ingredientId, edibleGrams) => {
      setPantry((current) => {
        if (edibleGrams === 0) return current.filter((item) => item.ingredientId !== ingredientId);
        const found = current.some((item) => item.ingredientId === ingredientId);
        return found
          ? current.map((item) => item.ingredientId === ingredientId ? { ingredientId, edibleGrams } : item)
          : [...current, { ingredientId, edibleGrams }].sort((left, right) => left.ingredientId.localeCompare(right.ingredientId));
      });
      if (preferences === null) setPreferences({});
    },
  }), [pantry, preferences, preferencesSkipped, rankingResult, selectedRecipeId]);

  return <PlanningContext.Provider value={contextValue}>{children}</PlanningContext.Provider>;
}

export function usePlanning(): PlanningContextValue {
  const context = useContext(PlanningContext);
  if (!context) throw new Error("usePlanning must be used inside PlanningProvider");
  return context;
}
