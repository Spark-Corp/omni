import { useMediaQuery } from "./useMediaQuery";

export function useIsTablet() {
  return useMediaQuery("(min-width: 768px) and (max-width: 1023px)", false);
}
