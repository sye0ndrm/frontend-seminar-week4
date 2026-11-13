import { useCallback } from "react";
import { RecipeImage } from "../components/RecipeCard.tsx";
import { RecipeReview } from "../components/RecipeReview.tsx";
import { RelatedRecipes } from "../components/RelatedRecipes.tsx";
import { ErrorState, LoadingState } from "../components/RequestState.tsx";
import { useRecipeRequest } from "../hooks/useRecipeRequest.ts";
import { getTotalTime } from "../lib/recipes.ts";
import { getRecipeById } from "../services/recipeService.ts";
export function RecipeDetailPage({
  recipeId,
  backHref,
  canGoBack,
}: {
  recipeId: number;
  backHref: string;
  canGoBack: boolean;
}) {
  const load = useCallback(() => getRecipeById(recipeId), [recipeId]);
  const { data: recipe, loading, error, retry } = useRecipeRequest(load);
  return (
    <>
      <div className="detail-navigation">
        <button
          className="back-link back-button"
          type="button"
          onClick={() => {
            if (canGoBack) {
              window.history.back();
            } else {
              window.location.hash = backHref;
            }
          }}
        >
          ← 뒤로가기
        </button>

        <a className="back-link list-return-link" href={backHref}>
          레시피 목록으로
        </a>
      </div>
      {loading && <LoadingState message="요리 정보를 불러오는 중입니다." />}
      {error && <ErrorState message={error} onRetry={retry} />}
      {recipe && (
        <>
          <section className="detail-hero" aria-labelledby="recipe-title">
            <RecipeImage recipe={recipe} className="detail-image" />
            <div className="detail-intro">
              <p className="eyebrow">오늘의 레시피</p>
              <h1 id="recipe-title">{recipe.name}</h1>
              <div className="detail-rating">
                <span
                  className={`difficulty difficulty-${recipe.difficulty.toLowerCase()}`}
                >
                  {recipe.difficulty}
                </span>
                <span>
                  ★ {recipe.rating.toFixed(1)}{" "}
                  <span className="muted">({recipe.reviewCount}개 리뷰)</span>
                </span>
              </div>
              <dl className="time-summary">
                <div>
                  <dt>총 요리시간</dt>
                  <dd>
                    {getTotalTime(recipe)}
                    <span>분</span>
                  </dd>
                </div>
                <div>
                  <dt>준비시간</dt>
                  <dd>
                    {recipe.prepTimeMinutes}
                    <span>분</span>
                  </dd>
                </div>
                <div>
                  <dt>조리시간</dt>
                  <dd>
                    {recipe.cookTimeMinutes}
                    <span>분</span>
                  </dd>
                </div>
              </dl>
              <div className="detail-tags">
                {recipe.tags.map((tag) => (
                  <span key={tag}>{tag}</span>
                ))}
              </div>
            </div>
          </section>
          <div className="recipe-body">
            <section
              className="ingredients-section"
              aria-labelledby="ingredients-heading"
            >
              <div className="section-heading">
                <h2 id="ingredients-heading">재료</h2>
                <span className="muted">{recipe.servings}인분 기준</span>
              </div>
              <ul className="ingredients-list">
                {recipe.ingredients.map((ingredient) => (
                  <li key={ingredient}>{ingredient}</li>
                ))}
              </ul>
            </section>
            <section
              className="instructions-section"
              aria-labelledby="instructions-heading"
            >
              <h2 id="instructions-heading">만드는 순서</h2>
              <ol className="instructions-list">
                {recipe.instructions.map((instruction, index) => (
                  <li key={instruction}>
                    <span className="step-number" aria-hidden="true">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <p>{instruction}</p>
                  </li>
                ))}
              </ol>
            </section>
          </div>
          <section className="recipe-info" aria-labelledby="info-heading">
            <h2 id="info-heading">요리 정보</h2>
            <dl className="info-grid">
              <div>
                <dt>요리 유형</dt>
                <dd>{recipe.cuisine}</dd>
              </div>
              <div>
                <dt>식사 종류</dt>
                <dd>{recipe.mealType.join(", ")}</dd>
              </div>
              <div>
                <dt>1인분 칼로리</dt>
                <dd>{recipe.caloriesPerServing} kcal</dd>
              </div>
              <div>
                <dt>별점</dt>
                <dd>{recipe.rating.toFixed(1)} / 5</dd>
              </div>
              <div>
                <dt>인분</dt>
                <dd>{recipe.servings}인분</dd>
              </div>
              <div>
                <dt>리뷰</dt>
                <dd>{recipe.reviewCount}개</dd>
              </div>
            </dl>
          </section>
          <RecipeReview recipeId={recipe.id} />
          <RelatedRecipes key={recipe.id} recipeId={recipe.id} />
        </>
      )}
    </>
  );
}
