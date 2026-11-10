import { useCallback, useEffect, useRef, useState } from "react";

type RequestState<T> = {
  data: T | null;
  loading: boolean;
  error: string;
};
export function useRecipeRequest<T>(load: () => Promise<T>) {
  const latestRequest = useRef(0);
  const [state, setState] = useState<RequestState<T>>({
    data: null,
    loading: true,
    error: "",
  });
  const retry = useCallback(() => {
    const requestId = ++latestRequest.current;
    setState({
      data: null,
      loading: true,
      error: "",
    });
    Promise.resolve()
      .then(load)
      .then((data) => {
        if (requestId === latestRequest.current)
          setState({
            data,
            loading: false,
            error: "",
          });
      })
      .catch((error: unknown) => {
        if (requestId === latestRequest.current)
          setState({
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
    };
  }, [retry]);
  return {
    ...state,
    retry,
  };
}
