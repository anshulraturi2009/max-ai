import { createContext, useContext, useEffect, useMemo, useState } from "react";

const PerformanceContext = createContext({
  isMobile: false,
  isLowPerformance: false,
  prefersReducedMotion: false,
});

function getPerformanceProfile() {
  if (typeof window === "undefined") {
    return {
      isMobile: false,
      isLowPerformance: false,
      prefersReducedMotion: false,
    };
  }

  const isMobile = window.innerWidth < 768;
  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;
  const hasCoarsePointer = window.matchMedia("(pointer: coarse)").matches;
  const deviceMemory = navigator.deviceMemory ?? 4;
  const cpuCores = navigator.hardwareConcurrency ?? 8;
  const isLowPerformance =
    prefersReducedMotion ||
    deviceMemory <= 2 ||
    cpuCores <= 4 ||
    (isMobile && hasCoarsePointer);

  return {
    isMobile,
    isLowPerformance,
    prefersReducedMotion,
  };
}

export function PerformanceProvider({ children }) {
  const [profile, setProfile] = useState(getPerformanceProfile);

  useEffect(() => {
    function updateProfile() {
      setProfile(getPerformanceProfile());
    }

    const reducedMotionQuery = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    );
    const pointerQuery = window.matchMedia("(pointer: coarse)");

    updateProfile();
    window.addEventListener("resize", updateProfile);

    if (typeof reducedMotionQuery.addEventListener === "function") {
      reducedMotionQuery.addEventListener("change", updateProfile);
      pointerQuery.addEventListener("change", updateProfile);
    } else {
      reducedMotionQuery.addListener(updateProfile);
      pointerQuery.addListener(updateProfile);
    }

    return () => {
      window.removeEventListener("resize", updateProfile);

      if (typeof reducedMotionQuery.removeEventListener === "function") {
        reducedMotionQuery.removeEventListener("change", updateProfile);
        pointerQuery.removeEventListener("change", updateProfile);
      } else {
        reducedMotionQuery.removeListener(updateProfile);
        pointerQuery.removeListener(updateProfile);
      }
    };
  }, []);

  useEffect(() => {
    document.documentElement.dataset.performance = profile.isLowPerformance
      ? "lite"
      : "full";
    document.documentElement.dataset.motion = profile.prefersReducedMotion
      ? "reduce"
      : "full";
  }, [profile.isLowPerformance, profile.prefersReducedMotion]);

  const value = useMemo(() => profile, [profile]);

  return (
    <PerformanceContext.Provider value={value}>
      {children}
    </PerformanceContext.Provider>
  );
}

export function usePerformance() {
  return useContext(PerformanceContext);
}
