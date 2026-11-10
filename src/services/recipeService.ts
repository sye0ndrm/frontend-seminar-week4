import { recipes } from "../data/recipes.ts";
import type { Recipe } from "../types/recipe.ts";

function respondAfterDelay<T>(read: () => T): Promise<T> {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      try {
        resolve(read());
      } catch (error) {
        reject(error);
      }
    }, 1000);
  });
}
function findRecipe(id: number): Recipe {
  const recipe = recipes.find((item) => item.id === id);
  if (!recipe)
    throw new Error(
      "요리 정보를 찾을 수 없습니다. 목록에서 다른 요리를 골라 주세요.",
    );
  return recipe;
}
export function getAllRecipes(): Promise<Recipe[]> {
  return respondAfterDelay(() => recipes);
}
export function getRecipeById(id: number): Promise<Recipe> {
  return respondAfterDelay(() => findRecipe(id));
}
export function getRelatedRecipes(id: number): Promise<Recipe[]> {
  return respondAfterDelay(() => {
    const current = findRecipe(id);
    return recipes.filter(
      (recipe) =>
        recipe.id !== current.id &&
        recipe.tags.some((tag) => current.tags.includes(tag)),
    );
  });
}
