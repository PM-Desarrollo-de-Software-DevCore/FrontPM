"use client";

import { PropsWithChildren, useEffect } from "react";

export default function ThemeProvider({ children }: PropsWithChildren) {
  useEffect(() => {
    try {
      // Sincroniza el estado visual con localStorage
      const stored = localStorage.getItem("theme");
      if (stored === "dark" || stored === "light") {
        document.documentElement.classList.toggle("dark", stored === "dark");
        return;
      }

      // Fallback a prefers-color-scheme
      const prefersDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
      document.documentElement.classList.toggle("dark", prefersDark);
    } catch {
      /* ignore */
    }
  }, []);

  // Sincroniza cambios de tema entre pestañas
  useEffect(() => {
    const handleStorageChange = (e?: StorageEvent) => {
      try {
        // Si proviene del evento storage puede contener newValue
        const stored = e?.newValue ?? localStorage.getItem("theme");
        if (stored === "dark") {
          document.documentElement.classList.add("dark");
        } else if (stored === "light") {
          document.documentElement.classList.remove("dark");
        }
      } catch {
        /* ignore */
      }
    };

    const handleCustomTheme = (ev: Event) => {
      try {
        const theme = (ev as CustomEvent<{ theme?: string }>).detail?.theme;
        if (theme === "dark") document.documentElement.classList.add("dark");
        else if (theme === "light") document.documentElement.classList.remove("dark");
      } catch {
        /* ignore */
      }
    };

    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("themechange", handleCustomTheme);
    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("themechange", handleCustomTheme);
    };
  }, []);

  return <>{children}</>;
}
