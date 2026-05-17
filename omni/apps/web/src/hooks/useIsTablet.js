import useMediaQuery from "./useMediaQuery";

export default function useIsTablet() {
  return useMediaQuery("(min-width: 768px) and (max-width: 1023px)", false);
}
