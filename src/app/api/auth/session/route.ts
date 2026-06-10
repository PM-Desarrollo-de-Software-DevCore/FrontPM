import { NextRequest, NextResponse } from "next/server"

import { SESSION_COOKIE_NAME } from "@/lib/sessionCookie"

/**
 * Sincroniza (POST) o expira (DELETE) la cookie httpOnly de sesión `pm_session`,
 * espejo del JWT que el cliente guarda en localStorage (PM-171 Fase 0).
 *
 * IMPORTANTE: esta cookie NO está autenticada. El handler solo decodifica el
 * payload del JWT para alinear el Max-Age con su `exp`; NO verifica la firma.
 * El backend (Render) sigue validando la firma en cada request. El middleware
 * de la Fase 1 solo podrá usar esta cookie para ruteo blando (redirigir a
 * /login), NUNCA para autorizar contenido sensible.
 *
 * Runtime Node por defecto (usa Buffer): NO migrar a `runtime = 'edge'`.
 */

function buildCookieOptions(maxAge: number) {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    // localhost se trata como secure-context aunque sea http, así que `next dev`
    // (NODE_ENV=development) sigue persistiendo la cookie sin Secure.
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge,
  }
}

/** Extrae el `exp` (segundos epoch) del payload del JWT, sin verificar la firma. */
function decodeJwtExp(token: string): number | null {
  const parts = token.split(".")
  if (parts.length !== 3) return null
  try {
    const payload = JSON.parse(
      Buffer.from(parts[1], "base64url").toString("utf8")
    ) as { exp?: unknown }
    return typeof payload.exp === "number" ? payload.exp : null
  } catch {
    return null
  }
}

/**
 * Rechaza requests cross-site (defensa CSRF / session fixation). `sec-fetch-site`
 * lo controla el navegador y no es falsificable desde JS. Fail-open si el header
 * no viene (navegadores antiguos): solo bloqueamos cuando es explícitamente
 * cross-site/same-site, no cuando está ausente.
 */
function isCrossSite(request: NextRequest): boolean {
  const site = request.headers.get("sec-fetch-site")
  return site !== null && site !== "same-origin" && site !== "none"
}

export async function POST(request: NextRequest) {
  if (isCrossSite(request)) {
    return NextResponse.json(
      { success: false, message: "Origen no permitido" },
      { status: 403 }
    )
  }

  const body: unknown = await request.json().catch(() => null)
  const token =
    body && typeof body === "object"
      ? (body as { token?: unknown }).token
      : undefined

  if (typeof token !== "string" || token.length === 0) {
    return NextResponse.json(
      { success: false, message: "Token no proporcionado" },
      { status: 400 }
    )
  }

  const exp = decodeJwtExp(token)
  if (exp === null) {
    return NextResponse.json(
      { success: false, message: "Token inválido" },
      { status: 400 }
    )
  }

  const maxAge = exp - Math.floor(Date.now() / 1000)
  if (maxAge <= 0) {
    // Token ya vencido: no dejar cookie viva.
    const expired = NextResponse.json(
      { success: false, message: "Token expirado" },
      { status: 401 }
    )
    expired.cookies.set(SESSION_COOKIE_NAME, "", buildCookieOptions(0))
    return expired
  }

  const response = NextResponse.json({ success: true, message: "Sesión sincronizada" })
  response.cookies.set(SESSION_COOKIE_NAME, token, buildCookieOptions(maxAge))
  return response
}

export async function DELETE(request: NextRequest) {
  if (isCrossSite(request)) {
    return NextResponse.json(
      { success: false, message: "Origen no permitido" },
      { status: 403 }
    )
  }

  const response = NextResponse.json({ success: true, message: "Sesión cerrada" })
  response.cookies.set(SESSION_COOKIE_NAME, "", buildCookieOptions(0))
  return response
}
