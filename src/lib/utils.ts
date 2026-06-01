import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Formatea un monto sin divisa fija (el backend no guarda divisa).
 * Prefijo `$` + locale es-MX. Devuelve `fallback` ("N/A") si es null/NaN.
 */
export function formatMoney(value: number | null | undefined, fallback = "N/A"): string {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return fallback
  }

  return `$${value.toLocaleString("es-MX", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })}`
}

/** Formatea un ratio 0..1 como porcentaje (0.42 -> "42%"). */
export function formatRatio(value: number | null | undefined, fallback = "N/A"): string {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return fallback
  }

  return `${(value * 100).toLocaleString("es-MX", { maximumFractionDigits: 1 })}%`
}

/** Formatea un número plano con decimales acotados; null/NaN -> fallback. */
export function formatNumber(
  value: number | null | undefined,
  fallback = "N/A",
  maximumFractionDigits = 1
): string {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return fallback
  }

  return value.toLocaleString("es-MX", { maximumFractionDigits })
}
