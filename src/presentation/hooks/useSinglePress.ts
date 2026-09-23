import { useCallback, useRef, useState } from 'react';

 /*
 * @param handler función a ejecutar en el primer toque
 * @param cooldownMs tiempo mínimo antes de aceptar un toque siguiente (default 1000ms)
 */
export function useSinglePress<T extends (...args: any[]) => void>(
  handler: T,
  cooldownMs: number = 1000
): [T, boolean] {
  const [isLocked, setIsLocked] = useState(false);
  const isLockedRef = useRef(false);

  const wrapped = useCallback(
    (...args: Parameters<T>) => {
      if (isLockedRef.current) return;

      isLockedRef.current = true;
      setIsLocked(true);

      handler(...args);

      setTimeout(() => {
        isLockedRef.current = false;
        setIsLocked(false);
      }, cooldownMs);
    },
    [handler, cooldownMs]
  ) as T;

  return [wrapped, isLocked];
}