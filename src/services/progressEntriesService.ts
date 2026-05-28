import { API_BASE_URL, getToken } from "@/lib/auth"

type ApiResponse<T> = {
  success: boolean
  message?: string
  data?: T
}

export type ProgressEntryType = "progress" | "blocker"

export interface ProgressEntry {
  id_entry: string
  type: ProgressEntryType
  description: string
  date: string
  id_project: string
  id_sprint: string | null
  createdBy: string
  createdAt: string
}

export interface CreateProgressEntryPayload {
  type: ProgressEntryType
  description: string
  date?: string
  id_sprint?: string | null
}

export interface ListProgressEntriesFilters {
  type?: ProgressEntryType
  sprintId?: string
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

export async function getProjectProgressEntries(
  projectId: string,
  filters: ListProgressEntriesFilters = {}
): Promise<ProgressEntry[]> {
  const params = new URLSearchParams()
  if (filters.type) params.set("type", filters.type)
  if (filters.sprintId) params.set("sprintId", filters.sprintId)

  const query = params.toString() ? `?${params.toString()}` : ""

  const response = await fetch(`${API_BASE_URL}/projects/${projectId}/progress-entries${query}`, {
    method: "GET",
    headers: authHeaders(),
    cache: "no-store",
  })

  return parseEnvelope<ProgressEntry[]>(response, "No se pudieron obtener los avances y bloqueadores.")
}

export async function createProjectProgressEntry(
  projectId: string,
  payload: CreateProgressEntryPayload
): Promise<ProgressEntry> {
  const response = await fetch(`${API_BASE_URL}/projects/${projectId}/progress-entries`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(payload),
  })

  return parseEnvelope<ProgressEntry>(response, "No se pudo registrar el avance o bloqueador.")
}

export async function deleteProgressEntry(entryId: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/progress-entries/${entryId}`, {
    method: "DELETE",
    headers: authHeaders(),
  })

  await parseEnvelope<unknown>(response, "No se pudo eliminar el registro.")
}
