import useMediaQuery from "./useMediaQuery";

export default function useIsMobile() {
  return useMediaQuery("(max-width: 767px)", typeof window === "undefined" ? false : window.innerWidth < 768);
}
