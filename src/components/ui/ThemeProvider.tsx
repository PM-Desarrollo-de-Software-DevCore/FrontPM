"use client";

import React, { PropsWithChildren, useEffect, useState } from "react";

export default function ThemeProvider({ children }: PropsWithChildren) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);

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
    } catch (err) {
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
      } catch (err) {
        /* ignore */
      }
    };

    const handleCustomTheme = (ev: Event) => {
      try {
        // @ts-ignore
        const theme = ev?.detail?.theme;
        if (theme === "dark") document.documentElement.classList.add("dark");
        else if (theme === "light") document.documentElement.classList.remove("dark");
      } catch (err) {
        /* ignore */
      }
    };

    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("themechange", handleCustomTheme as EventListener);
    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("themechange", handleCustomTheme as EventListener);
    };
  }, []);

  if (!mounted) return <>{children}</>;

  return <>{children}</>;
}
