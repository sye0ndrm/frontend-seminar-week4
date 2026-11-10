import { useState } from "react";
import { getTotalTime } from "../lib/recipes.ts";
import { detailHref } from "../lib/routes.ts";
import type { Recipe } from "../types/recipe.ts";
export function RecipeImage({
  recipe,
  className = "",
}: {
  recipe: Recipe;
  className?: string;
}) {
  const [failed, setFailed] = useState(false);
  return (
    <div className={`recipe-image ${className}`}>
      {failed ? (
        <span className="image-fallback">사진을 불러오지 못했어요</span>
      ) : (
        <img
          src={recipe.image}
          alt={recipe.name}
          loading="lazy"
          onError={() => setFailed(true)}
        />
      )}
    </div>
  );
}
export function RecipeCard({
  recipe,
  duplicate = false,
}: {
  recipe: Recipe;
  duplicate?: boolean;
}) {
  return (
    <article className="recipe-card">
      <a
        className="recipe-card-link"
        href={detailHref(recipe.id)}
        tabIndex={duplicate ? -1 : undefined}
        aria-label={`${recipe.name} 자세히 보기`}
      >
        <RecipeImage recipe={recipe} />
        <div className="recipe-card-content">
          <div className="recipe-card-heading">
            <h2>{recipe.name}</h2>
            <span
              className={`difficulty difficulty-${recipe.difficulty.toLowerCase()}`}
            >
              {recipe.difficulty}
            </span>
          </div>
          <p className="card-meta">
            {getTotalTime(recipe)}분 <span aria-hidden="true">·</span> ★{" "}
            {recipe.rating.toFixed(1)}
          </p>
          <div className="card-tags">
            {recipe.tags.map((tag) => (
              <span key={tag}>{tag}</span>
            ))}
          </div>
        </div>
      </a>
    </article>
  );
}
