/**
 * Helpers compartidos para consumir el backend con el envelope estándar
 * `{ success, message, data }`. Extrae el patrón que ya usaban servicios
 * como profileChangeRequestService para no duplicarlo en cada nuevo servicio.
 */

import { API_BASE_URL, getToken } from "@/lib/auth"

export type ApiResponse<T> = {
  success: boolean
  message?: string
  data?: T
}

/** Headers con Bearer token; lanza si no hay sesión activa. */
export function authHeaders(): Record<string, string> {
  const token = getToken()

  if (!token) {
    throw new Error("Sesión expirada. Inicia sesión nuevamente.")
  }

  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  }
}

/** Valida el envelope y devuelve `data`, o lanza con el mensaje del backend. */
export async function parseEnvelope<T>(response: Response, fallbackMessage: string): Promise<T> {
  const payload = (await response.json().catch(() => ({}))) as ApiResponse<T>

  if (!response.ok || !payload.success || payload.data === undefined) {
    throw new Error(payload.message || fallbackMessage)
  }

  return payload.data
}

export async function apiGet<T>(path: string, fallbackMessage: string): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: "GET",
    headers: authHeaders(),
    cache: "no-store",
  })

  return parseEnvelope<T>(response, fallbackMessage)
}

async function apiSend<T>(
  method: "POST" | "PATCH" | "PUT",
  path: string,
  body: unknown,
  fallbackMessage: string
): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers: authHeaders(),
    body: body === undefined ? undefined : JSON.stringify(body),
  })

  return parseEnvelope<T>(response, fallbackMessage)
}

export function apiPost<T>(path: string, body: unknown, fallbackMessage: string): Promise<T> {
  return apiSend<T>("POST", path, body, fallbackMessage)
}

export function apiPatch<T>(path: string, body: unknown, fallbackMessage: string): Promise<T> {
  return apiSend<T>("PATCH", path, body, fallbackMessage)
}

/** DELETE que solo verifica `success` (no exige `data` en la respuesta). */
export async function apiDelete(path: string, fallbackMessage: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: "DELETE",
    headers: authHeaders(),
  })

  const payload = (await response.json().catch(() => ({}))) as ApiResponse<unknown>

  if (!response.ok || !payload.success) {
    throw new Error(payload.message || fallbackMessage)
  }
}
