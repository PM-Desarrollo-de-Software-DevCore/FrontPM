import { getToken } from "@/lib/auth"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"

export type AssignmentScope = "project" | "task"

export interface AssignmentSuggestionItem {
  userId: string
  name: string
  lastname: string
  email: string
  skill: string | null
  area: string | null
  points: number
  completedTasks: number
  score: number
  reasons: string[]
}

export interface AssignmentSignals {
  keywords: string[]
  skills: string[]
  areas: string[]
  tools: string[]
}

export interface AssignmentSuggestionResponse {
  signals: AssignmentSignals
  suggestions: AssignmentSuggestionItem[]
}

export interface AssignmentSuggestionRequest {
  scope: AssignmentScope
  title: string
  description?: string | null
  projectId?: string | null
  limit?: number
}

function getAuthHeaders(): Record<string, string> {
  const token = getToken()

  return {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
  }
}

export async function getAssignmentSuggestions(
  payload: AssignmentSuggestionRequest
): Promise<AssignmentSuggestionResponse> {
  const response = await fetch(`${API_URL}/recommendations/assignment-suggestions`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
    cache: "no-store",
  })

  if (!response.ok) {
    const errorPayload = await response.json().catch(() => ({}))
    throw new Error(errorPayload.message || "No se pudieron obtener sugerencias de asignación")
  }

  const data = await response.json()
  return data.data || data
}