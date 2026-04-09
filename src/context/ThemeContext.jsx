import { createContext, useContext, useEffect, useMemo, useState } from "react";

const STORAGE_KEY = "max-ai-theme";
const DEFAULT_MODE = "system";

const ThemeContext = createContext({
  themeMode: DEFAULT_MODE,
  resolvedTheme: "dark",
  setThemeMode: () => {},
});

function getSystemTheme() {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
    return "dark";
  }

  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function readStoredThemeMode() {
  if (typeof window === "undefined") {
    return DEFAULT_MODE;
  }

  const saved = window.localStorage.getItem(STORAGE_KEY);
  return saved === "light" || saved === "dark" || saved === "system"
    ? saved
    : DEFAULT_MODE;
}

function resolveTheme(mode) {
  return mode === "system" ? getSystemTheme() : mode;
}

export function ThemeProvider({ children }) {
  const [themeMode, setThemeModeState] = useState(readStoredThemeMode);
  const [resolvedTheme, setResolvedTheme] = useState(() => resolveTheme(readStoredThemeMode()));

  useEffect(() => {
    const nextResolvedTheme = resolveTheme(themeMode);
    setResolvedTheme(nextResolvedTheme);

    if (typeof window !== "undefined") {
      window.localStorage.setItem(STORAGE_KEY, themeMode);
    }

    if (typeof document !== "undefined") {
      document.documentElement.classList.remove("theme-light", "theme-dark");
      document.documentElement.classList.add(`theme-${nextResolvedTheme}`);
      document.documentElement.style.colorScheme = nextResolvedTheme;

      if (document.body) {
        document.body.classList.remove("theme-light", "theme-dark");
        document.body.classList.add(`theme-${nextResolvedTheme}`);
      }

      const themeMeta = document.querySelector('meta[name="theme-color"]');
      if (themeMeta) {
        themeMeta.setAttribute("content", nextResolvedTheme === "light" ? "#eef4ff" : "#050816");
      }
    }
  }, [themeMode]);

  useEffect(() => {
    if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
      return undefined;
    }

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = () => {
      if (themeMode === "system") {
        setResolvedTheme(resolveTheme("system"));
      }
    };

    mediaQuery.addEventListener?.("change", handleChange);
    return () => {
      mediaQuery.removeEventListener?.("change", handleChange);
    };
  }, [themeMode]);

  const value = useMemo(
    () => ({
      themeMode,
      resolvedTheme,
      setThemeMode: setThemeModeState,
    }),
    [themeMode, resolvedTheme],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  return useContext(ThemeContext);
}
