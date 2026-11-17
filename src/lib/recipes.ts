import type { Recipe } from "../types/recipe.ts";

export function getTotalTime(recipe: Recipe): number {
  return recipe.prepTimeMinutes + recipe.cookTimeMinutes;
}
