"use client";

import { useCallback, useSyncExternalStore } from "react";

type Theme = "light" | "dark";

/* El tema vive fuera de React (localStorage + clase `dark` en <html>), así que
 * se lee con useSyncExternalStore en lugar de duplicarlo en un useState. */
function readTheme(): Theme {
  try {
    const stored = localStorage.getItem("theme");
    if (stored === "dark" || stored === "light") return stored;
    const prefersDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
    return prefersDark ? "dark" : "light";
  } catch {
    return "light";
  }
}

function subscribe(onChange: () => void) {
  window.addEventListener("themechange", onChange);
  window.addEventListener("storage", onChange);
  return () => {
    window.removeEventListener("themechange", onChange);
    window.removeEventListener("storage", onChange);
  };
}

export function useTheme() {
  const theme = useSyncExternalStore<Theme>(subscribe, readTheme, () => "light");

  const setTheme = useCallback((next: Theme) => {
    try {
      localStorage.setItem("theme", next);
      document.documentElement.classList.toggle("dark", next === "dark");
      window.dispatchEvent(new CustomEvent("themechange", { detail: { theme: next } }));
    } catch {
      // ignore
    }
  }, []);

  return { theme, setTheme } as const;
}
