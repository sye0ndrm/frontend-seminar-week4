import { useCallback, useEffect, useRef } from "react";
import { useRecipeRequest } from "../hooks/useRecipeRequest.ts";
import { getRelatedRecipes } from "../services/recipeService.ts";
import { RecipeCard } from "./RecipeCard.tsx";
import { ErrorState, LoadingState } from "./RequestState.tsx";
export function RelatedRecipes({ recipeId }: { recipeId: number }) {
  const load = useCallback(() => getRelatedRecipes(recipeId), [recipeId]);
  const { data, loading, error, retry } = useRecipeRequest(load);
  const viewport = useRef<HTMLDivElement>(null);
  const firstGroup = useRef<HTMLDivElement>(null);
  const hovered = useRef(false);
  const focused = useRef(false);
  const dragging = useRef(false);
  const pauseUntil = useRef(0);
  useEffect(() => {
    if (!data?.length) return;
    const container = viewport.current;
    const group = firstGroup.current;
    if (!container || !group) return;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let frame = 0;
    let previous = performance.now();
    const tick = (now: number) => {
      const elapsed = Math.min(now - previous, 100);
      previous = now;
      const width = group.offsetWidth;
      if (
        width > container.clientWidth &&
        !reducedMotion.matches &&
        !document.hidden &&
        !hovered.current &&
        !focused.current &&
        !dragging.current &&
        now > pauseUntil.current
      ) {
        container.scrollLeft = (container.scrollLeft + elapsed * 0.04) % width;
      }
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [data]);
  const move = (direction: number) => {
    const container = viewport.current;
    const width = firstGroup.current?.offsetWidth;
    if (!container || !width) return;
    pauseUntil.current = performance.now() + 2500;
    const target =
      container.scrollLeft +
      direction * Math.min(container.clientWidth * 0.8, 560);
    container.scrollLeft = ((target % width) + width) % width;
  };
  return (
    <section
      className="related-section"
      aria-labelledby="related-heading"
      onMouseEnter={() => {
        hovered.current = true;
      }}
      onMouseLeave={() => {
        hovered.current = false;
      }}
      onFocusCapture={() => {
        focused.current = true;
      }}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget))
          focused.current = false;
      }}
    >
      <div className="section-heading">
        <div>
          <p className="eyebrow">다음 요리도 골라보세요</p>
          <h2 id="related-heading">이 요리와 연관 있는 레시피</h2>
        </div>
        {!!data?.length && (
          <div className="carousel-controls">
            <button
              className="icon-button"
              type="button"
              aria-label="이전 관련 요리"
              onClick={() => move(-1)}
            >
              ←
            </button>
            <button
              className="icon-button"
              type="button"
              aria-label="다음 관련 요리"
              onClick={() => move(1)}
            >
              →
            </button>
          </div>
        )}
      </div>
      {loading && <LoadingState message="연관 레시피를 불러오는 중입니다." />}
      {error && <ErrorState message={error} onRetry={retry} />}
      {data && data.length === 0 && (
        <p className="empty-message">태그가 겹치는 다른 요리가 아직 없어요.</p>
      )}
      {!!data?.length && (
        <>
          <p className="related-hint">
            같은 태그의 요리예요. 마우스를 올리면 움직임이 멈춰요.
          </p>
          <div
            ref={viewport}
            className="carousel-viewport"
            onWheel={() => {
              pauseUntil.current = performance.now() + 2500;
            }}
            onPointerDown={() => {
              dragging.current = true;
            }}
            onPointerUp={() => {
              dragging.current = false;
            }}
            onPointerCancel={() => {
              dragging.current = false;
            }}
            onPointerLeave={() => {
              dragging.current = false;
            }}
          >
            <div className="carousel-track">
              <div ref={firstGroup} className="carousel-group">
                {data.map((recipe) => (
                  <RecipeCard key={recipe.id} recipe={recipe} />
                ))}
              </div>
              <div className="carousel-group" aria-hidden="true">
                {data.map((recipe) => (
                  <RecipeCard key={recipe.id} recipe={recipe} duplicate />
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </section>
  );
}
