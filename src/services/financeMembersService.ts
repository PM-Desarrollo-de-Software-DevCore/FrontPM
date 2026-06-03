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
import { invalidateProjectMembersCache } from "@/services/memberService"

export interface UpdateMemberPayload {
  role?: ProjectMemberRole
  fte?: number | null
  monthly_rate?: number | null
}

// Caché + dedup in-flight por-proyecto de los miembros con datos financieros.
// Se invalida tras actualizar un miembro (rate/rol) abajo.
const FINANCE_MEMBERS_TTL_MS = 30_000
const financeMembersCache = new Map<string, { data: ProjectMemberFinance[]; ts: number }>()
const financeMembersInflight = new Map<string, Promise<ProjectMemberFinance[]>>()

export function invalidateFinanceMembersCache(projectId?: string): void {
  if (projectId) {
    financeMembersCache.delete(projectId)
    financeMembersInflight.delete(projectId)
  } else {
    financeMembersCache.clear()
    financeMembersInflight.clear()
  }
}

/** GET /projects/:id/members — incluye fte y monthly_rate (rate = null si no autorizado). */
export async function getProjectFinanceMembers(projectId: string): Promise<ProjectMemberFinance[]> {
  const cached = financeMembersCache.get(projectId)
  if (cached && Date.now() - cached.ts < FINANCE_MEMBERS_TTL_MS) {
    return cached.data
  }
  const inflight = financeMembersInflight.get(projectId)
  if (inflight) {
    return inflight
  }

  const promise = (async () => {
    const response = await fetch(`${API_BASE_URL}/projects/${projectId}/members`, {
      method: "GET",
      headers: authHeaders(),
      cache: "no-store",
    })

    if (!response.ok) {
      throw new Error("No se pudieron obtener los miembros del proyecto.")
    }

    const data = await response.json()
    const members: ProjectMemberFinance[] = Array.isArray(data) ? data : data.data || []
    financeMembersCache.set(projectId, { data: members, ts: Date.now() })
    return members
  })()

  financeMembersInflight.set(projectId, promise)
  try {
    return await promise
  } finally {
    financeMembersInflight.delete(projectId)
  }
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

  // Cambió rate y/o rol: invalidar ambas cachés (finance-members y roles de useProjectRole).
  invalidateFinanceMembersCache(projectId)
  invalidateProjectMembersCache(projectId)
}
