"use client";

import { createContext, useContext, useEffect, useSyncExternalStore } from "react";

type Theme = "light" | "dark";

const THEME_KEY = "dk-theme";

const ThemeContext = createContext<{ theme: Theme; toggleTheme: () => void }>({
  theme: "light",
  toggleTheme: () => {},
});

let cachedRaw: string | null = null;
let cachedTheme: Theme = "light";

function getThemeSnapshot(): Theme {
  if (typeof window === "undefined") return cachedTheme;
  try {
    const raw = localStorage.getItem(THEME_KEY);
    if (raw === cachedRaw) return cachedTheme;
    cachedRaw = raw;
    cachedTheme = raw === "dark" ? "dark" : "light";
    return cachedTheme;
  } catch {
    return cachedTheme;
  }
}

function subscribeTheme(cb: () => void) {
  window.addEventListener("dk-theme-changed", cb);
  window.addEventListener("storage", cb);
  return () => {
    window.removeEventListener("dk-theme-changed", cb);
    window.removeEventListener("storage", cb);
  };
}

function applyTheme(theme: Theme) {
  document.documentElement.dataset.theme = theme;
  try {
    localStorage.setItem(THEME_KEY, theme);
  } catch {}
  window.dispatchEvent(new Event("dk-theme-changed"));
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const theme = useSyncExternalStore<Theme>(subscribeTheme, getThemeSnapshot, () => "light");

  // Keep <html data-theme> in sync (covers cross-tab storage events).
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  function toggleTheme() {
    applyTheme(theme === "light" ? "dark" : "light");
  }

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
