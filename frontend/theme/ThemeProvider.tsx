import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

type Theme = "light" | "dark" | "system";

interface ThemeContextValue {
  theme: Theme;
  isDark: boolean;
  setTheme: (theme: Theme) => void;
  toggle: () => void;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

const STORAGE_KEY = "flexconvert.theme";

function getSystemPrefersDark(): boolean {
  if (typeof window === "undefined" || typeof window.matchMedia === "undefined") return false;
  return window.matchMedia("(prefers-color-scheme: dark)").matches;
}

function applyTheme(theme: Theme) {
  const root = document.documentElement;
  const useDark = theme === "system" ? getSystemPrefersDark() : theme === "dark";
  root.classList.toggle("dark", useDark);
  root.setAttribute("data-theme", useDark ? "dark" : "light");
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(() => {
    if (typeof window === "undefined") return "light";
    const saved = localStorage.getItem(STORAGE_KEY) as Theme | null;
    return saved || "light";
  });

  const isDark = useMemo(() => {
    return theme === "system" ? getSystemPrefersDark() : theme === "dark";
  }, [theme]);

  useEffect(() => {
    // Initial apply
    applyTheme(theme);

    // Watch system changes when using system theme
    const mql = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => {
      if (theme === "system") {
        applyTheme("system");
      }
    };
    mql.addEventListener?.("change", onChange);
    return () => mql.removeEventListener?.("change", onChange);
  }, [theme]);

  // Reduced motion: pause background blob animations in Dashboard when requested
  useEffect(() => {
    const mql = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (mql.matches) {
      document.documentElement.style.setProperty("--reduced-motion", "1");
    } else {
      document.documentElement.style.removeProperty("--reduced-motion");
    }
  }, []);

  const setTheme = useCallback((next: Theme) => {
    setThemeState(next);
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // ignore
    }
    applyTheme(next);
  }, []);

  const toggle = useCallback(() => {
    setTheme((prev) => {
      if (prev === "system") {
        return getSystemPrefersDark() ? "light" : "dark";
      }
      return prev === "dark" ? "light" : "dark";
    });
  }, [setTheme]);

  // Keyboard shortcut: Alt+D to toggle theme
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.altKey || e.metaKey) && e.key.toLowerCase() === "d") {
        e.preventDefault();
        toggle();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [toggle]);

  const value = useMemo<ThemeContextValue>(
    () => ({ theme, isDark, setTheme, toggle }),
    [theme, isDark, setTheme, toggle]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error("useTheme must be used within ThemeProvider");
  }
  return ctx;
}
