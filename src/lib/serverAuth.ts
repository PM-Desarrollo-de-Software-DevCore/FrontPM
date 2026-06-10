import "server-only"

import { cookies } from "next/headers"

import { SESSION_COOKIE_NAME } from "@/lib/sessionCookie"

/**
 * Acceso al JWT desde el servidor (PM-171 Fase 1). Lee la cookie httpOnly
 * `pm_session` que Fase 0 puebla en el navegador. En cliente NO se usa (los
 * fetch del cliente siguen tomando el token de localStorage via getToken).
 *
 * `server-only` hace que el build falle si un componente cliente lo importa por
 * error: la cookie httpOnly no es legible desde JS del navegador de todas formas.
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"

export async function getServerToken(): Promise<string | null> {
  const store = await cookies()
  return store.get(SESSION_COOKIE_NAME)?.value ?? null
}

type ApiResponse<T> = {
  success: boolean
  message?: string
  data?: T
}

/**
 * GET autenticado server-side contra el backend, usando el token de la cookie
 * `pm_session`. Per-request (sin cache de módulo) para no compartir datos entre
 * usuarios. Lanza si no hay sesión en la cookie o si el backend falla, para que
 * el caller pueda caer al render cliente (que usa localStorage).
 *
 * `timeoutMs` acota cuánto bloquea el render server-side: el backend (Render)
 * tiene cold-starts de segundos y este fetch corre ANTES del primer byte. Si se
 * agota, aborta y lanza → el caller cae al cliente (skeleton inmediato + fetch),
 * que es el comportamiento actual. Así el SSR solo ayuda cuando el backend está
 * caliente, y nunca empeora el TTFB cuando está frío.
 */
export async function serverFetch<T>(path: string, timeoutMs = 2500): Promise<T> {
  const token = await getServerToken()
  if (!token) {
    throw new Error("Sin sesión server-side (cookie pm_session ausente)")
  }

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), timeoutMs)

  try {
    const response = await fetch(`${API_BASE_URL}${path}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
      signal: controller.signal,
    })

    const payload = (await response.json().catch(() => ({}))) as ApiResponse<T>

    if (!response.ok || !payload.success || payload.data === undefined) {
      throw new Error(payload.message || `serverFetch falló: ${path}`)
    }

    return payload.data
  } finally {
    clearTimeout(timeout)
  }
}
