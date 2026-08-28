import React from "react";

export const useMobileNavVisibility = (locationKey) => {
  const [isVisible, setIsVisible] = React.useState(true);
  const lastScrollY = React.useRef(0);
  const direction = React.useRef(null);
  const distance = React.useRef(0);
  const frame = React.useRef(null);
  const routeFrame = React.useRef(null);

  React.useEffect(() => {
    routeFrame.current = window.requestAnimationFrame(() => {
      setIsVisible(true);
      lastScrollY.current = Math.max(window.scrollY, 0);
      direction.current = null;
      distance.current = 0;
      routeFrame.current = null;
    });

    return () => {
      if (routeFrame.current !== null) {
        window.cancelAnimationFrame(routeFrame.current);
      }
    };
  }, [locationKey]);

  React.useEffect(() => {
    const updateVisibility = () => {
      const currentScrollY = Math.max(window.scrollY, 0);
      const delta = currentScrollY - lastScrollY.current;
      const nextDirection = delta > 0 ? "down" : delta < 0 ? "up" : null;

      if (currentScrollY <= 48) {
        setIsVisible(true);
        direction.current = null;
        distance.current = 0;
      } else if (nextDirection) {
        if (direction.current !== nextDirection) {
          direction.current = nextDirection;
          distance.current = 0;
        }

        distance.current += Math.abs(delta);

        if (
          nextDirection === "down" &&
          currentScrollY > 96 &&
          distance.current >= 18
        ) {
          setIsVisible(false);
          distance.current = 0;
        } else if (nextDirection === "up" && distance.current >= 8) {
          setIsVisible(true);
          distance.current = 0;
        }
      }

      lastScrollY.current = currentScrollY;
      frame.current = null;
    };

    const handleScroll = () => {
      if (frame.current === null) {
        frame.current = window.requestAnimationFrame(updateVisibility);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (frame.current !== null) {
        window.cancelAnimationFrame(frame.current);
      }
    };
  }, []);

  return isVisible;
};

export function useMediaQuery(query = "(max-width: 767px)") {
  const [matches, setMatches] = React.useState(false);

  React.useEffect(() => {
    if (typeof window === "undefined") return undefined;

    const mediaQuery = window.matchMedia(query);
    const handleChange = () => setMatches(mediaQuery.matches);

    handleChange();
    mediaQuery.addEventListener("change", handleChange);

    return () => mediaQuery.removeEventListener("change", handleChange);
  }, [query]);

  return matches;
}
