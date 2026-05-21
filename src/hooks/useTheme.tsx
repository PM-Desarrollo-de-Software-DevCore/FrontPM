"use client";

import { useEffect, useState } from "react";

export function useTheme() {
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("theme") as "light" | "dark" | null;
      if (stored) {
        setTheme(stored);
        document.documentElement.classList.toggle("dark", stored === "dark");
        setIsHydrated(true);
        return;
      }

      const prefersDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
      const initialTheme = prefersDark ? "dark" : "light";
      setTheme(initialTheme);
      document.documentElement.classList.toggle("dark", prefersDark);
      setIsHydrated(true);
    } catch (err) {
      setIsHydrated(true);
    }
  }, []);

  useEffect(() => {
    if (!isHydrated) return;
    
    try {
      localStorage.setItem("theme", theme);
      document.documentElement.classList.toggle("dark", theme === "dark");
      window.dispatchEvent(new CustomEvent("themechange", { detail: { theme } }));
    } catch (err) {
      // ignore
    }
  }, [theme, isHydrated]);

  return { theme, setTheme } as const;
}
