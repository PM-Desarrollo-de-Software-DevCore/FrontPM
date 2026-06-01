/**
 * Miembros de proyecto con datos financieros (FTE / monthly_rate).
 * Contrato: docs/finanzas-frontend.md sección 4.
 *
 * El endpoint /projects/:id/members es compartido con el resto de la app y
 * puede responder un array crudo o el envelope {success,data}; por eso el GET
 * es tolerante a ambas formas (igual que userService/memberService).
 */

import { API_BASE_URL } from "@/lib/auth"
import { authHeaders } from "@/lib/api"
import { ProjectMemberFinance, ProjectMemberRole } from "@/types/finance"

export interface UpdateMemberPayload {
  role?: ProjectMemberRole
  fte?: number | null
  monthly_rate?: number | null
}

/** GET /projects/:id/members — incluye fte y monthly_rate (rate = null si no autorizado). */
export async function getProjectFinanceMembers(projectId: string): Promise<ProjectMemberFinance[]> {
  const response = await fetch(`${API_BASE_URL}/projects/${projectId}/members`, {
    method: "GET",
    headers: authHeaders(),
    cache: "no-store",
  })

  if (!response.ok) {
    throw new Error("No se pudieron obtener los miembros del proyecto.")
  }

  const data = await response.json()
  return Array.isArray(data) ? data : data.data || []
}

/** PATCH /projects/:id/members/:userId — rol/fte/rate (solo admin). La UI refetchea tras éxito. */
export async function updateProjectFinanceMember(
  projectId: string,
  userId: string,
  payload: UpdateMemberPayload
): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/projects/${projectId}/members/${userId}`, {
    method: "PATCH",
    headers: authHeaders(),
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({}))
    throw new Error(error.message || "No se pudo actualizar el miembro.")
  }
}
