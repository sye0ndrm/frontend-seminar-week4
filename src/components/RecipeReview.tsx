import { useId, useState } from "react";

function readRating(key: string): number {
  try {
    const value = Number(localStorage.getItem(key));
    return Number.isInteger(value) && value >= 1 && value <= 5 ? value : 0;
  } catch {
    return 0;
  }
}

function RatingEditor({ recipeId }: { recipeId: number }) {
  const storageKey = `recipe-rating:${recipeId}`;
  const groupId = useId();
  const [rating, setRating] = useState(() => readRating(storageKey));
  const [message, setMessage] = useState("");

  const saveRating = (value: number) => {
    setRating(value);

    try {
      localStorage.setItem(storageKey, String(value));
      setMessage(`${value}점으로 저장했어요.`);
    } catch {
      setMessage("별점을 선택했지만 브라우저에 저장하지 못했어요.");
    }
  };

  const clearRating = () => {
    setRating(0);

    try {
      localStorage.removeItem(storageKey);
      setMessage("별점을 지웠어요.");
    } catch {
      setMessage("화면의 별점은 지웠지만 저장된 값을 삭제하지 못했어요.");
    }
  };

  return (
    <section className="review-section" aria-labelledby={`${groupId}-title`}>
      <div className="section-heading">
        <h2 id={`${groupId}-title`}>나의 별점</h2>
        {rating > 0 && (
          <button className="review-reset" type="button" onClick={clearRating}>
            지우기
          </button>
        )}
      </div>

      <fieldset className="rating-fieldset">
        <legend>이 요리는 어땠나요?</legend>

        <div className="rating-stars">
          {[1, 2, 3, 4, 5].map((value) => (
            <label
              key={value}
              className={`rating-choice ${value <= rating ? "is-filled" : ""}`}
            >
              <input
                className="rating-input"
                type="radio"
                name={`${groupId}-rating`}
                value={value}
                checked={rating === value}
                onChange={() => saveRating(value)}
                aria-label={`${value}점`}
              />
              <svg
                width="36"
                height="36"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="m12 3 2.78 5.63 6.22.91-4.5 4.39 1.06 6.2L12 17.2l-5.56 2.93 1.06-6.2L3 9.54l6.22-.91L12 3Z" />
              </svg>
            </label>
          ))}
        </div>
      </fieldset>

      <div className="rating-footer">
        <span className="rating-value">
          {rating > 0 ? `${rating} / 5` : "아직 선택하지 않았어요"}
        </span>
        <p className="rating-message" role="status">
          {message}
        </p>
      </div>

      <p className="review-note">
        별점은 이 브라우저에 저장되며, 기존 평균 평점에는 반영되지 않아요.
      </p>
    </section>
  );
}

export function RecipeReview({ recipeId }: { recipeId: number }) {
  return <RatingEditor key={recipeId} recipeId={recipeId} />;
}
