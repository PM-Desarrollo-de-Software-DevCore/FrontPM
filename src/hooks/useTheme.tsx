"use client";

import { useEffect, useState } from "react";

export function useTheme() {
  const [theme, setTheme] = useState<"light" | "dark">(() => {
    if (typeof window === "undefined") {
      return "light";
    }

    try {
      const stored = localStorage.getItem("theme") as "light" | "dark" | null;
      if (stored === "light" || stored === "dark") {
        return stored;
      }

      const prefersDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
      return prefersDark ? "dark" : "light";
    } catch (err) {
      return "light";
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem("theme", theme);
      document.documentElement.classList.toggle("dark", theme === "dark");
      window.dispatchEvent(new CustomEvent("themechange", { detail: { theme } }));
    } catch (err) {
      // ignore
    }
  }, [theme]);

  // Listen to external theme changes (other tabs or dispatched events)
  useEffect(() => {
    const handleStorage = (e?: StorageEvent) => {
      try {
        const stored = e?.newValue ?? localStorage.getItem("theme");
        if (stored === "dark" || stored === "light") {
          setTheme(stored);
        }
      } catch (err) {
        // ignore
      }
    };

    const handleCustom = (ev: Event) => {
      try {
        // @ts-ignore
        const newTheme = ev?.detail?.theme as "dark" | "light" | undefined;
        if (newTheme === "dark" || newTheme === "light") {
          setTheme(newTheme);
        }
      } catch (err) {
        // ignore
      }
    };

    window.addEventListener("storage", handleStorage);
    window.addEventListener("themechange", handleCustom as EventListener);

    return () => {
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener("themechange", handleCustom as EventListener);
    };
  }, []);

  return { theme, setTheme } as const;
}
