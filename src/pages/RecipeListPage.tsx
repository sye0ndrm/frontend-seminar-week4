import { RecipeCard } from "../components/RecipeCard.tsx";
import { ErrorState, LoadingState } from "../components/RequestState.tsx";
import { useRecipeRequest } from "../hooks/useRecipeRequest.ts";
import {
  filterRecipes,
  getPageCount,
  getPageRecipes,
  getTags,
} from "../lib/recipes.ts";
import { listHref } from "../lib/routes.ts";
import { getAllRecipes } from "../services/recipeService.ts";
export function RecipeListPage({
  tags,
  page,
}: {
  tags: string[];
  page: number;
}) {
  const { data, loading, error, retry } = useRecipeRequest(getAllRecipes);
  const filtered = data ? filterRecipes(data, tags) : [];
  const pageCount = getPageCount(filtered);
  const currentPage = Math.min(page, pageCount);
  const visible = getPageRecipes(filtered, currentPage);
  const toggleTag = (tag: string) => {
    const next = tags.includes(tag)
      ? tags.filter((value) => value !== tag)
      : [...tags, tag];
    window.location.hash = listHref(next);
  };
  const goToPage = (number: number) => {
    window.location.hash = listHref(tags, number);
    window.scrollTo(0, 0);
  };
  return (
    <>
      <section className="list-intro" aria-labelledby="list-heading">
        <h1 id="list-heading">레시피</h1>
        <p>태그를 선택해 원하는 요리를 찾아보세요.</p>
      </section>
      {loading && <LoadingState message="레시피를 불러오는 중입니다." />}
      {error && <ErrorState message={error} onRetry={retry} />}
      {data && (
        <>
          <section className="filter-section" aria-label="요리 태그 필터">
            <div className="filter-heading">
              <h2>태그</h2>
              <span>여러 개 선택할 수 있어요</span>
            </div>
            <div className="tag-filters">
              <button
                type="button"
                className={`filter-button ${tags.length === 0 ? "selected" : ""}`}
                aria-pressed={tags.length === 0}
                onClick={() => {
                  window.location.hash = listHref();
                }}
              >
                전체
              </button>
              {getTags(data).map((tag) => (
                <button
                  key={tag}
                  type="button"
                  className={`filter-button ${tags.includes(tag) ? "selected" : ""}`}
                  aria-pressed={tags.includes(tag)}
                  onClick={() => toggleTag(tag)}
                >
                  {tags.includes(tag) && <span aria-hidden="true">✓ </span>}
                  {tag}
                </button>
              ))}
            </div>
          </section>
          <div className="results-heading" aria-live="polite">
            <p>
              총 <strong>{filtered.length}</strong>개의 레시피
            </p>
            {tags.length > 0 && (
              <p className="filter-summary">
                선택한 태그 중 하나라도 포함한 요리
              </p>
            )}
          </div>
          {visible.length === 0 ? (
            <div className="request-state">
              <h2>조건에 맞는 요리가 없어요.</h2>
              <p>다른 태그를 선택하거나 전체 목록을 확인해 주세요.</p>
              <a className="button button-primary" href={listHref()}>
                전체 레시피 보기
              </a>
            </div>
          ) : (
            <section className="recipe-grid" aria-label="레시피 목록">
              {visible.map((recipe) => (
                <RecipeCard key={recipe.id} recipe={recipe} />
              ))}
            </section>
          )}
          {filtered.length > 0 && (
            <nav className="pagination" aria-label="레시피 페이지 선택">
              <button
                className="page-button page-direction"
                type="button"
                disabled={currentPage === 1}
                onClick={() => {
                  goToPage(currentPage - 1);
                }}
              >
                이전
              </button>
              {Array.from(
                {
                  length: pageCount,
                },
                (_, index) => index + 1,
              ).map((number) => (
                <button
                  key={number}
                  type="button"
                  className={`page-button ${number === currentPage ? "current" : ""}`}
                  aria-label={`${number}페이지`}
                  aria-current={number === currentPage ? "page" : undefined}
                  onClick={() => {
                    goToPage(number);
                  }}
                >
                  {number}
                </button>
              ))}
              <button
                className="page-button page-direction"
                type="button"
                disabled={currentPage === pageCount}
                onClick={() => {
                  goToPage(currentPage + 1);
                }}
              >
                다음
              </button>
            </nav>
          )}
        </>
      )}
    </>
  );
}
