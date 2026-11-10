export function LoadingState({ message }: { message: string }) {
  return (
    <div className="request-state" aria-live="polite">
      <span className="spinner" aria-hidden="true" />
      <p>{message}</p>
    </div>
  );
}
export function ErrorState({
  message,
  onRetry,
}: {
  message: string;
  onRetry: () => void;
}) {
  return (
    <div className="request-state error-state">
      <p role="alert">{message}</p>
      <button className="button button-primary" type="button" onClick={onRetry}>
        다시 불러오기
      </button>
    </div>
  );
}
