import { API_BASE_URL, getToken } from "@/lib/auth"

type ApiResponse<T> = {
  success: boolean
  message?: string
  data?: T
}

export type ProfileChangeStatus = "pending" | "approved" | "rejected" | "cancelled"

export interface ProfileChangeFields {
  name?: string
  lastname?: string
  email?: string
  skill?: string | null
  area?: string | null
}

export interface ProfileChangeRequest {
  id_request: string
  id_user: string
  proposedChanges: ProfileChangeFields
  status: ProfileChangeStatus
  reviewedBy: string | null
  reviewNote: string | null
  createdAt: string
  reviewedAt: string | null
}

function authHeaders(): Record<string, string> {
  const token = getToken()

  if (!token) {
    throw new Error("Sesión expirada. Inicia sesión nuevamente.")
  }

  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  }
}

async function parseEnvelope<T>(response: Response, fallbackMessage: string): Promise<T> {
  const payload = (await response.json().catch(() => ({}))) as ApiResponse<T>

  if (!response.ok || !payload.success || payload.data === undefined) {
    throw new Error(payload.message || fallbackMessage)
  }

  return payload.data
}

export async function createProfileChangeRequest(
  changes: ProfileChangeFields
): Promise<ProfileChangeRequest> {
  const response = await fetch(`${API_BASE_URL}/profile-change-requests`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(changes),
  })

  return parseEnvelope<ProfileChangeRequest>(response, "No se pudo crear la solicitud de modificación.")
}

export async function getMyProfileChangeRequests(): Promise<ProfileChangeRequest[]> {
  const response = await fetch(`${API_BASE_URL}/profile-change-requests/me`, {
    method: "GET",
    headers: authHeaders(),
    cache: "no-store",
  })

  return parseEnvelope<ProfileChangeRequest[]>(response, "No se pudieron obtener tus solicitudes.")
}

export async function getAllProfileChangeRequests(
  status?: ProfileChangeStatus
): Promise<ProfileChangeRequest[]> {
  const query = status ? `?status=${status}` : ""

  const response = await fetch(`${API_BASE_URL}/profile-change-requests${query}`, {
    method: "GET",
    headers: authHeaders(),
    cache: "no-store",
  })

  return parseEnvelope<ProfileChangeRequest[]>(response, "No se pudieron obtener las solicitudes.")
}

export async function approveProfileChangeRequest(requestId: string): Promise<ProfileChangeRequest> {
  const response = await fetch(`${API_BASE_URL}/profile-change-requests/${requestId}/approve`, {
    method: "POST",
    headers: authHeaders(),
  })

  return parseEnvelope<ProfileChangeRequest>(response, "No se pudo aprobar la solicitud.")
}

export async function rejectProfileChangeRequest(
  requestId: string,
  reviewNote?: string
): Promise<ProfileChangeRequest> {
  const body = reviewNote ? JSON.stringify({ reviewNote }) : undefined

  const response = await fetch(`${API_BASE_URL}/profile-change-requests/${requestId}/reject`, {
    method: "POST",
    headers: authHeaders(),
    body,
  })

  return parseEnvelope<ProfileChangeRequest>(response, "No se pudo rechazar la solicitud.")
}

export async function cancelProfileChangeRequest(requestId: string): Promise<ProfileChangeRequest> {
  const response = await fetch(`${API_BASE_URL}/profile-change-requests/${requestId}`, {
    method: "DELETE",
    headers: authHeaders(),
  })

  return parseEnvelope<ProfileChangeRequest>(response, "No se pudo cancelar la solicitud.")
}

export const PROFILE_CHANGE_FIELDS: Array<{
  key: keyof ProfileChangeFields
  label: string
  nullable: boolean
}> = [
  { key: "name", label: "Nombre", nullable: false },
  { key: "lastname", label: "Apellido", nullable: false },
  { key: "email", label: "Email", nullable: false },
  { key: "skill", label: "Skill principal", nullable: true },
  { key: "area", label: "Área", nullable: true },
]
