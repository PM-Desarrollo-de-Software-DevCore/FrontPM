"use client";

import React from "react";
import { useTheme } from "@/hooks/useTheme";

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  const toggle = () => setTheme(theme === "dark" ? "light" : "dark");

  return (
    <button
      aria-label="Toggle theme"
      onClick={toggle}
      className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-border bg-card text-card-foreground hover:bg-muted transition-all duration-200 text-sm font-medium shadow-sm hover:shadow-md"
    >
      <span className="sr-only">Toggle theme</span>
      <span className="hidden sm:inline font-semibold">
        {theme === "dark" ? "☀️ Claro" : "🌙 Oscuro"}
      </span>
    </button>
  );
}
