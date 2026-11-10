import type { Recipe } from "../types/recipe.ts";

const PAGE_SIZE = 6;
export function getTags(recipes: Recipe[]): string[] {
  return [...new Set(recipes.flatMap((recipe) => recipe.tags))];
}
export function filterRecipes(recipes: Recipe[], tags: string[]): Recipe[] {
  return tags.length === 0
    ? recipes
    : recipes.filter((recipe) => tags.some((tag) => recipe.tags.includes(tag)));
}
export function getPageCount(recipes: Recipe[]): number {
  return Math.max(1, Math.ceil(recipes.length / PAGE_SIZE));
}
export function getPageRecipes(recipes: Recipe[], page: number): Recipe[] {
  const validPage = Math.min(Math.max(1, page), getPageCount(recipes));
  return recipes.slice((validPage - 1) * PAGE_SIZE, validPage * PAGE_SIZE);
}
export function getTotalTime(recipe: Recipe): number {
  return recipe.prepTimeMinutes + recipe.cookTimeMinutes;
}
