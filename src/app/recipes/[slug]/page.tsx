import { RecipeDetailsScreen } from "@/features/planning/RecipeDetailsScreen";
import { fixtureDataset } from "@/data/fixtures";

export function generateStaticParams() {
  return fixtureDataset.recipes.map((recipe) => ({ slug: recipe.slug }));
}

export const dynamicParams = false;

export default function RecipeDetailsPage() {
  return <RecipeDetailsScreen />;
}
