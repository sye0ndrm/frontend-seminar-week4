import type { Recipe, RecipeListResponse } from "../types/recipe.ts";

export const PAGE_SIZE = 6;
const API_BASE_URL = (
  import.meta.env?.VITE_API_BASE_URL ||
  "https://frontend-seminar-week5-server.vercel.app"
).replace(/\/+$/, "");
const BATCH_SIZE = 100;

async function request<T>(path: string, signal?: AbortSignal): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, { signal });
  if (!response.ok) {
    let message = `레시피를 불러오지 못했습니다. (${response.status})`;
    try {
      const body: { message?: string } = await response.json();
      if (typeof body.message === "string") message = body.message;
    } catch {
      // JSON이 아닌 오류 응답에도 재시도 가능한 안내를 표시합니다.
    }
    throw new Error(message);
  }
  return response.json() as Promise<T>;
}

function requestPage(
  path: string,
  limit: number,
  skip: number,
  signal?: AbortSignal,
): Promise<RecipeListResponse> {
  const params = new URLSearchParams({
    limit: String(limit),
    skip: String(skip),
    sortBy: "id",
    order: "asc",
  });
  return request(`${path}?${params}`, signal);
}

async function readPage(
  path: string,
  page: number,
  signal?: AbortSignal,
): Promise<RecipeListResponse> {
  const skip = (page - 1) * PAGE_SIZE;
  const result = await requestPage(path, PAGE_SIZE, skip, signal);
  const lastSkip = Math.max(0, Math.ceil(result.total / PAGE_SIZE) - 1) * PAGE_SIZE;
  return skip > lastSkip
    ? requestPage(path, PAGE_SIZE, lastSkip, signal)
    : result;
}

async function readAllForTag(
  tag: string,
  signal?: AbortSignal,
): Promise<Recipe[]> {
  const path = `/recipes/tag/${encodeURIComponent(tag)}`;
  const recipes: Recipe[] = [];
  let skip = 0;
  while (true) {
    const result = await requestPage(path, BATCH_SIZE, skip, signal);
    recipes.push(...result.recipes);
    skip += result.recipes.length;
    if (skip >= result.total) return recipes;
    if (result.recipes.length === 0) {
      throw new Error("레시피 목록을 모두 불러오지 못했습니다. 다시 시도해 주세요.");
    }
  }
}

async function readTagUnion(
  tags: string[],
  signal?: AbortSignal,
): Promise<Recipe[]> {
  // 태그 API는 한 태그만 지원하므로 모든 페이지를 합친 뒤 OR 조건을 적용합니다.
  const groups = await Promise.all(
    [...new Set(tags)].map((tag) => readAllForTag(tag, signal)),
  );
  return [
    ...new Map(groups.flat().map((recipe) => [recipe.id, recipe])).values(),
  ].sort((a, b) => a.id - b.id);
}

export function getRecipeTags(signal?: AbortSignal): Promise<string[]> {
  return request("/recipes/tags", signal);
}

export async function getRecipes(
  tags: string[],
  page: number,
  signal?: AbortSignal,
): Promise<RecipeListResponse> {
  const validPage = Number.isSafeInteger(page) && page > 0 ? page : 1;
  const uniqueTags = [...new Set(tags)];
  if (uniqueTags.length === 0) return readPage("/recipes", validPage, signal);
  if (uniqueTags.length === 1) {
    return readPage(
      `/recipes/tag/${encodeURIComponent(uniqueTags[0])}`,
      validPage,
      signal,
    );
  }
  const recipes = await readTagUnion(uniqueTags, signal);
  const lastPage = Math.max(1, Math.ceil(recipes.length / PAGE_SIZE));
  const skip = (Math.min(validPage, lastPage) - 1) * PAGE_SIZE;
  return {
    recipes: recipes.slice(skip, skip + PAGE_SIZE),
    total: recipes.length,
    skip,
    limit: PAGE_SIZE,
  };
}

export function getRecipeById(id: number, signal?: AbortSignal): Promise<Recipe> {
  return request(`/recipes/${id}`, signal);
}

export async function getRelatedRecipes(
  recipe: Recipe,
  signal?: AbortSignal,
): Promise<Recipe[]> {
  const recipes = await readTagUnion(recipe.tags, signal);
  return recipes.filter((item) => item.id !== recipe.id);
}
