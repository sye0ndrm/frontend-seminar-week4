import { recipes } from "../data/recipes.ts";

export const getAllRecipes = () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(recipes);
    }, 1000);
  });
};
