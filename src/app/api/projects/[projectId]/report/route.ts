import { NextRequest, NextResponse } from "next/server"

import { SESSION_COOKIE_NAME } from "@/lib/sessionCookie"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ projectId: string }> }
) {
  try {
    const { projectId } = await context.params
    // PM-171 Fase 1: el ?token= (de localStorage, fuente de verdad de la sesión
    // activa) se mantiene PRIMARIO para no cambiar el comportamiento actual ni
    // arriesgar servir el PDF con una cookie stale tras un logout best-effort. La
    // cookie httpOnly pm_session es el FALLBACK, listo para cuando reportService
    // deje de mandar el token en la URL (y deje de filtrar el JWT). El iframe es
    // same-origin, así que SameSite=Lax basta para que la cookie viaje en este GET.
    const token =
      request.nextUrl.searchParams.get("token") ??
      request.cookies.get(SESSION_COOKIE_NAME)?.value
    const download = request.nextUrl.searchParams.get("download")

    if (!token) {
      return NextResponse.json(
        { success: false, message: "Token no proporcionado" },
        { status: 401 }
      )
    }

    const backendUrl = new URL(`${API_URL}/projects/${projectId}/report`)
    if (download === "1" || download === "true") {
      backendUrl.searchParams.set("download", "1")
    }

    const response = await fetch(backendUrl.toString(), {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    })

    if (!response.ok) {
      const errorBody = await response.text()
      return new NextResponse(errorBody || "No se pudo obtener el reporte", {
        status: response.status,
        headers: {
          "Content-Type": response.headers.get("Content-Type") || "application/json",
        },
      })
    }

    const fileBuffer = await response.arrayBuffer()
    const contentType = response.headers.get("Content-Type") || "application/pdf"
    const contentDisposition = response.headers.get("Content-Disposition") || "inline; filename=\"project-report.pdf\""

    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": contentDisposition,
        "Cache-Control": "no-store",
      },
    })
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Error inesperado",
      },
      { status: 500 }
    )
  }
}