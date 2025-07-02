import { useCallback, useRef } from "react";

export function useMemoFn<T extends (...args: any[]) => any>(fn: T) {
  const fnRef = useRef(fn);
  fnRef.current = fn;

  return useCallback((...args: Parameters<T>) => {
    return fnRef.current(...args);
  }, []);
}
