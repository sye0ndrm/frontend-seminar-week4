import { useCallback, useEffect, useRef, useState } from "react";

type Loader<T> = (signal: AbortSignal) => Promise<T>;
type RequestState<T> = {
  load: Loader<T>;
  data: T | null;
  loading: boolean;
  error: string;
};
export function useRecipeRequest<T>(load: Loader<T>) {
  const latestRequest = useRef(0);
  const controller = useRef<AbortController | null>(null);
  const [state, setState] = useState<RequestState<T>>({
    load,
    data: null,
    loading: true,
    error: "",
  });
  const retry = useCallback(() => {
    controller.current?.abort();
    const current = new AbortController();
    controller.current = current;
    const requestId = ++latestRequest.current;
    setState({ load, data: null, loading: true, error: "" });
    Promise.resolve()
      .then(() => {
        current.signal.throwIfAborted();
        return load(current.signal);
      })
      .then((data) => {
        if (requestId === latestRequest.current && !current.signal.aborted)
          setState({ load, data, loading: false, error: "" });
      })
      .catch((error: unknown) => {
        if (requestId === latestRequest.current && !current.signal.aborted)
          setState({
            load,
            data: null,
            loading: false,
            error:
              error instanceof Error
                ? error.message
                : "레시피를 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.",
          });
      });
  }, [load]);
  useEffect(() => {
    retry();
    return () => {
      latestRequest.current += 1;
      controller.current?.abort();
    };
  }, [retry]);
  // 새 조건으로 렌더된 직후에도 이전 조건의 데이터를 표시하지 않습니다.
  return {
    data: state.load === load ? state.data : null,
    loading: state.load !== load || state.loading,
    error: state.load === load ? state.error : "",
    retry,
  };
}
