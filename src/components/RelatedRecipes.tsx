import type { PointerEvent as ReactPointerEvent } from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useRecipeRequest } from "../hooks/useRecipeRequest.ts";
import { getRelatedRecipes } from "../services/recipeService.ts";
import { RecipeCard } from "./RecipeCard.tsx";
import { ErrorState, LoadingState } from "./RequestState.tsx";

export function RelatedRecipes({ recipeId }: { recipeId: number }) {
  const load = useCallback(() => getRelatedRecipes(recipeId), [recipeId]);
  const { data, loading, error, retry } = useRecipeRequest(load);

  const viewport = useRef<HTMLDivElement>(null);
  const firstGroup = useRef<HTMLDivElement>(null);
  const resumeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const keyboardMode = useRef(false);

  const [hovered, setHovered] = useState(false);
  const [keyboardFocused, setKeyboardFocused] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [waiting, setWaiting] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  const pauseBriefly = () => {
    if (resumeTimer.current !== null) {
      clearTimeout(resumeTimer.current);
    }

    setWaiting(true);
    resumeTimer.current = setTimeout(() => {
      setWaiting(false);
      resumeTimer.current = null;
    }, 2500);
  };

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updateMotion = () => setReducedMotion(media.matches);
    const stopDragging = () => setDragging(false);
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Tab") keyboardMode.current = true;
    };
    const handlePointer = () => {
      keyboardMode.current = false;
      setKeyboardFocused(false);
    };

    updateMotion();
    media.addEventListener("change", updateMotion);
    window.addEventListener("keydown", handleKey, true);
    window.addEventListener("pointerdown", handlePointer, true);
    window.addEventListener("pointerup", stopDragging);
    window.addEventListener("pointercancel", stopDragging);
    window.addEventListener("blur", stopDragging);

    return () => {
      media.removeEventListener("change", updateMotion);
      window.removeEventListener("keydown", handleKey, true);
      window.removeEventListener("pointerdown", handlePointer, true);
      window.removeEventListener("pointerup", stopDragging);
      window.removeEventListener("pointercancel", stopDragging);
      window.removeEventListener("blur", stopDragging);

      if (resumeTimer.current !== null) {
        clearTimeout(resumeTimer.current);
      }
    };
  }, []);

  // POINTER_POSITION_SYNC_START
  useEffect(() => {
    let point: { x: number; y: number } | null = null;
    let frame: number | null = null;

    const updateHover = () => {
      frame = null;

      const container = viewport.current;

      if (!point || !container || document.hidden) {
        setHovered(false);
        setWaiting(false);
        if (resumeTimer.current !== null) {
          clearTimeout(resumeTimer.current);
          resumeTimer.current = null;
        }

        return;
      }

      const rect = container.getBoundingClientRect();
      const inside =
        point.x >= rect.left &&
        point.x < rect.right &&
        point.y >= rect.top &&
        point.y < rect.bottom;

      if (!inside) {
        setHovered(false);
        setWaiting(false);
        if (resumeTimer.current !== null) {
          clearTimeout(resumeTimer.current);
          resumeTimer.current = null;
        }

        return;
      }

      // 고정 헤더나 다른 요소가 위를 덮고 있는 경우도 구분합니다.
      const target = document.elementFromPoint(point.x, point.y);
      const isOverCarousel = target !== null && container.contains(target);
      setHovered(isOverCarousel);

      if (!isOverCarousel) {
        setWaiting(false);
        if (resumeTimer.current !== null) {
          clearTimeout(resumeTimer.current);
          resumeTimer.current = null;
        }
      }
    };

    const scheduleUpdate = () => {
      if (frame === null) {
        frame = requestAnimationFrame(updateHover);
      }
    };

    const handlePointerMove = (event: PointerEvent) => {
      if (event.pointerType !== "mouse" && event.pointerType !== "pen") {
        point = null;
      } else {
        // 화면 기준 좌표이므로 스크롤 시에도 그대로 비교할 수 있습니다.
        point = { x: event.clientX, y: event.clientY };
      }

      scheduleUpdate();
    };

    const handleScroll = (event: Event) => {
      // 캐러셀 자체의 자동 스크롤은 영역 위치를 바꾸지 않습니다.
      if (event.target === viewport.current) return;
      scheduleUpdate();
    };

    const clearPointer = () => {
      point = null;
      setHovered(false);
      setWaiting(false);
      if (resumeTimer.current !== null) {
        clearTimeout(resumeTimer.current);
        resumeTimer.current = null;
      }
    };

    const handlePointerOut = (event: PointerEvent) => {
      if (event.relatedTarget === null) clearPointer();
    };

    const handleVisibility = () => {
      if (document.hidden) clearPointer();
      else scheduleUpdate();
    };

    window.addEventListener("pointermove", handlePointerMove, {
      passive: true,
    });
    window.addEventListener("pointerout", handlePointerOut);
    window.addEventListener("scroll", handleScroll, {
      capture: true,
      passive: true,
    });
    window.addEventListener("resize", scheduleUpdate);
    window.addEventListener("blur", clearPointer);
    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      if (frame !== null) cancelAnimationFrame(frame);

      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerout", handlePointerOut);
      window.removeEventListener("scroll", handleScroll, true);
      window.removeEventListener("resize", scheduleUpdate);
      window.removeEventListener("blur", clearPointer);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, []);
  // POINTER_POSITION_SYNC_END

  // MOUSE_DRAG_START
  const dragState = useRef<{
    pointerId: number;
    startX: number;
    startScroll: number;
    moved: boolean;
  } | null>(null);
  const suppressClick = useRef(false);

  const startMouseDrag = (event: ReactPointerEvent<HTMLElement>) => {
    suppressClick.current = false;

    if (event.pointerType !== "mouse" || event.button !== 0) return;

    // 이미지 재시도 등 실제 버튼은 평소처럼 작동합니다.
    if (
      event.target instanceof Element &&
      event.target.closest("button, input, textarea, select")
    ) {
      return;
    }

    dragState.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startScroll: event.currentTarget.scrollLeft,
      moved: false,
    };

    setDragging(true);
    pauseBriefly();
  };

  const moveMouseDrag = (event: ReactPointerEvent<HTMLElement>) => {
    const drag = dragState.current;
    if (!drag || drag.pointerId !== event.pointerId) return;

    if (event.buttons === 0) {
      dragState.current = null;
      setDragging(false);
      return;
    }

    const distance = event.clientX - drag.startX;

    // 작은 손떨림은 클릭으로 취급합니다.
    if (!drag.moved && Math.abs(distance) < 6) return;

    if (!drag.moved) {
      drag.moved = true;
      suppressClick.current = true;
      event.currentTarget.setPointerCapture(event.pointerId);
    }

    event.preventDefault();

    const width = firstGroup.current?.offsetWidth ?? 0;
    const target = drag.startScroll - distance;

    // 반복 목록 경계에서도 양방향으로 이동합니다.
    event.currentTarget.scrollLeft =
      width > event.currentTarget.clientWidth
        ? ((target % width) + width) % width
        : target;
  };

  const finishMouseDrag = (event: ReactPointerEvent<HTMLElement>) => {
    const drag = dragState.current;
    if (!drag || drag.pointerId !== event.pointerId) return;

    suppressClick.current = drag.moved;
    dragState.current = null;
    setDragging(false);
    pauseBriefly();

    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  };
  // MOUSE_DRAG_END

  const paused =
    hovered || keyboardFocused || dragging || waiting || reducedMotion;

  useEffect(() => {
    if (!data?.length || paused) return;

    const container = viewport.current;
    const group = firstGroup.current;
    if (!container || !group) return;

    let frame = 0;
    let previous = performance.now();
    let position = container.scrollLeft;

    const tick = (now: number) => {
      const elapsed = Math.min(now - previous, 100);
      previous = now;
      const width = group.offsetWidth;

      if (width > container.clientWidth && !document.hidden) {
        position = (position + elapsed * 0.04) % width;
        container.scrollLeft = position;
      }

      frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [data, paused]);

  const move = (direction: number) => {
    const container = viewport.current;
    const width = firstGroup.current?.offsetWidth;
    if (!container || !width) return;

    pauseBriefly();

    const distance = Math.min(container.clientWidth * 0.8, 560);
    const target = container.scrollLeft + direction * distance;
    container.scrollLeft = ((target % width) + width) % width;
  };

  return (
    <section
      className="related-section"
      aria-labelledby="related-heading"
      onFocusCapture={() => {
        if (keyboardMode.current) setKeyboardFocused(true);
      }}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) {
          setKeyboardFocused(false);
        }
      }}
    >
      <div className="section-heading">
        <div className="related-title">
          <h2 id="related-heading">관련 레시피</h2>
          {!!data?.length && (
            <span
              className="carousel-indicator"
              role="img"
              aria-label={paused ? "자동 이동 일시정지" : "자동 이동 중"}
            >
              <span aria-hidden="true">{paused ? "Ⅱ" : "▶"}</span>
            </span>
          )}
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
      {data?.length === 0 && (
        <p className="empty-message">태그가 겹치는 다른 요리가 없어요.</p>
      )}

      {!!data?.length && (
        <section
          aria-label="관련 레시피 슬라이드"
          ref={viewport}
          className="carousel-viewport"
          onWheel={(event) => {
            // 가로 스크롤 조작에만 짧은 대기를 적용합니다.
            if (Math.abs(event.deltaX) > Math.abs(event.deltaY)) {
              pauseBriefly();
            }
          }}
          data-dragging={dragging}
          onPointerDown={startMouseDrag}
          onPointerMove={moveMouseDrag}
          onPointerUp={finishMouseDrag}
          onPointerCancel={finishMouseDrag}
          onLostPointerCapture={finishMouseDrag}
          onDragStart={(event) => event.preventDefault()}
          onClickCapture={(event) => {
            if (suppressClick.current) {
              event.preventDefault();
              event.stopPropagation();
              suppressClick.current = false;
            }
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
        </section>
      )}
    </section>
  );
}
