import assert from "node:assert/strict";
import { afterEach, test } from "node:test";
import {
  getRecipeById,
  getRecipes,
  getRecipeTags,
  getRelatedRecipes,
} from "../src/services/recipeService.ts";

const originalFetch = globalThis.fetch;
afterEach(() => {
  globalThis.fetch = originalFetch;
});

// 100개 제한을 넘고 태그 사이에 중복이 있는 서버 데이터를 구성합니다.
const recipes = Array.from({ length: 125 }, (_, index) => ({
  id: index + 1,
  tags: index < 110 ? ["간편 / 요리", "집밥"] : ["집밥"],
}));
function mockServer() {
  const calls = [];
  globalThis.fetch = async (input, options) => {
    options?.signal?.throwIfAborted();
    const url = new URL(input);
    calls.push(url);
    if (url.pathname === "/recipes/tags") {
      return Response.json(["간편 / 요리", "집밥"]);
    }
    if (/^\/recipes\/\d+$/.test(url.pathname)) {
      const recipe = recipes.find(
        (item) => item.id === Number(url.pathname.split("/").pop()),
      );
      return recipe
        ? Response.json(recipe)
        : Response.json(
            { message: "존재하지 않는 레시피입니다." },
            { status: 404 },
          );
    }
    const tag = url.pathname.startsWith("/recipes/tag/")
      ? decodeURIComponent(url.pathname.slice("/recipes/tag/".length))
      : null;
    const selected = tag
      ? recipes.filter((recipe) => recipe.tags.includes(tag))
      : recipes;
    const skip = Number(url.searchParams.get("skip"));
    const limit = Number(url.searchParams.get("limit"));
    assert.ok(limit >= 1 && limit <= 100);
    assert.equal(url.searchParams.get("sortBy"), "id");
    return Response.json({
      recipes: selected.slice(skip, skip + limit),
      total: selected.length,
      skip,
      limit,
    });
  };
  return calls;
}

test("전체 목록은 서버에 6개 단위의 페이지를 요청한다", async () => {
  const calls = mockServer();
  const result = await getRecipes([], 2);
  assert.deepEqual(
    result.recipes.map((recipe) => recipe.id),
    [7, 8, 9, 10, 11, 12],
  );
  assert.equal(result.total, 125);
  assert.equal(calls.length, 1);
  assert.equal(calls[0].pathname, "/recipes");
  assert.equal(calls[0].searchParams.get("skip"), "6");
});

test("단일 태그는 인코딩된 태그 API에서 페이지를 조회한다", async () => {
  const calls = mockServer();
  const result = await getRecipes(["간편 / 요리"], 2);
  assert.equal(result.total, 110);
  assert.equal(calls.length, 1);
  assert.equal(
    calls[0].pathname,
    `/recipes/tag/${encodeURIComponent("간편 / 요리")}`,
  );
  assert.equal(calls[0].searchParams.get("skip"), "6");
});

test("여러 태그는 모든 서버 페이지를 합치고 중복 제거 후 페이지를 나눈다", async () => {
  const calls = mockServer();
  const result = await getRecipes(["간편 / 요리", "집밥", "집밥"], 19);
  assert.equal(result.total, 125);
  assert.deepEqual(
    result.recipes.map((recipe) => recipe.id),
    [109, 110, 111, 112, 113, 114],
  );
  assert.equal(calls.length, 4);
  assert.equal(
    calls.filter((url) => url.searchParams.get("skip") === "100").length,
    2,
  );
});

test("범위를 벗어난 페이지는 마지막 페이지를 조회한다", async () => {
  const calls = mockServer();
  const result = await getRecipes([], 999);
  assert.equal(result.skip, 120);
  assert.equal(result.recipes.length, 5);
  assert.equal(calls.length, 2);
});

test("결과가 없는 태그는 빈 목록과 total 0을 반환한다", async () => {
  mockServer();
  const result = await getRecipes(["없는태그"], 3);
  assert.deepEqual(result, { recipes: [], total: 0, skip: 0, limit: 6 });
});

test("전체 태그와 레시피 상세는 명세의 별도 API를 사용한다", async () => {
  const calls = mockServer();
  assert.deepEqual(await getRecipeTags(), ["간편 / 요리", "집밥"]);
  assert.equal((await getRecipeById(1)).id, 1);
  assert.deepEqual(
    calls.map((url) => url.pathname),
    ["/recipes/tags", "/recipes/1"],
  );
});

test("관련 레시피는 태그가 겹치는 모든 레시피 중 자기 자신을 제외한다", async () => {
  mockServer();
  const result = await getRelatedRecipes(recipes[0]);
  assert.equal(result.length, 124);
  assert.ok(result.every((recipe) => recipe.id !== 1));
  assert.equal(new Set(result.map((recipe) => recipe.id)).size, result.length);
});

test("404의 서버 오류 메시지를 화면에 전달한다", async () => {
  mockServer();
  await assert.rejects(getRecipeById(999), {
    message: "존재하지 않는 레시피입니다.",
  });
});

test("JSON이 아닌 서버 오류에도 HTTP 상태를 포함한 오류를 반환한다", async () => {
  globalThis.fetch = async () => new Response("Bad Gateway", { status: 502 });
  await assert.rejects(getRecipes([], 1), /502/);
});

test("취소 신호를 실제 요청까지 전달한다", async () => {
  let receivedSignal;
  globalThis.fetch = (_input, { signal }) =>
    new Promise((_resolve, reject) => {
      receivedSignal = signal;
      signal.addEventListener("abort", () => reject(signal.reason), {
        once: true,
      });
    });
  const controller = new AbortController();
  const pending = getRecipes([], 1, controller.signal);
  controller.abort();
  await assert.rejects(pending, { name: "AbortError" });
  assert.equal(receivedSignal, controller.signal);
});
