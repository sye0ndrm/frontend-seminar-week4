import { useEffect, useRef, useState } from "react";
import { getTotalTime } from "../lib/recipes.ts";
import { detailHref } from "../lib/routes.ts";
import type { Recipe } from "../types/recipe.ts";

function ImageAttempt({
  recipe,
  className,
  duplicate,
}: {
  recipe: Recipe;
  className: string;
  duplicate: boolean;
}) {
  const [status, setStatus] = useState<"loading" | "loaded" | "failed">(
    "loading",
  );
  const [attempt, setAttempt] = useState(0);
  const image = useRef<HTMLImageElement>(null);

  useEffect(() => {
    if (status !== "loading") return;

    if (image.current?.complete && image.current.naturalWidth > 0) {
      setStatus("loaded");
      return;
    }

    const timer = setTimeout(() => setStatus("failed"), 10000);
    return () => clearTimeout(timer);
  }, [status]);

  return (
    <div
      className={`recipe-image ${className}`}
      aria-busy={status === "loading"}
    >
      {status === "failed" ? (
        <div className="image-fallback">
          <svg
            width="28"
            height="28"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            aria-hidden="true"
          >
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <circle cx="8" cy="8" r="1.5" />
            <path d="m3 17 5-5 4 4 3-3 6 6" />
          </svg>
          <span>이미지를 불러오지 못했어요</span>
          <button
            className="image-retry"
            type="button"
            tabIndex={duplicate ? -1 : undefined}
            onClick={() => {
              setAttempt((value) => value + 1);
              setStatus("loading");
            }}
          >
            다시 시도
          </button>
        </div>
      ) : (
        <>
          {status === "loading" && (
            <span className="image-loading" role="status">
              이미지 불러오는 중
            </span>
          )}
          <img
            key={attempt}
            ref={image}
            src={recipe.image}
            alt={recipe.name}
            onLoad={() => setStatus("loaded")}
            onError={() => setStatus("failed")}
            style={{ opacity: status === "loaded" ? 1 : 0 }}
          />
        </>
      )}
    </div>
  );
}

export function RecipeImage({
  recipe,
  className = "",
  duplicate = false,
}: {
  recipe: Recipe;
  className?: string;
  duplicate?: boolean;
}) {
  return (
    <ImageAttempt
      key={recipe.image}
      recipe={recipe}
      className={className}
      duplicate={duplicate}
    />
  );
}

export function RecipeCard({
  recipe,
  duplicate = false,
}: {
  recipe: Recipe;
  duplicate?: boolean;
}) {
  const difficulty = {
    Easy: "쉬움",
    Medium: "보통",
    Hard: "어려움",
  }[recipe.difficulty];

  return (
    <article className="recipe-card">
      <RecipeImage recipe={recipe} duplicate={duplicate} />
      <div className="recipe-card-content">
        <h2>
          <a
            className="recipe-card-link"
            href={detailHref(recipe.id)}
            tabIndex={duplicate ? -1 : undefined}
            aria-label={`${recipe.name} 자세히 보기`}
          >
            {recipe.name}
          </a>
        </h2>
        <p className="card-meta">
          총 {getTotalTime(recipe)}분<span aria-hidden="true">·</span>
          {difficulty}
          <span aria-hidden="true">·</span>★ {recipe.rating.toFixed(1)}
        </p>
        <div className="card-tags">
          {recipe.tags.map((tag) => (
            <span key={tag}>{tag}</span>
          ))}
        </div>
      </div>
    </article>
  );
}
