import { API_BASE_URL, getToken } from "@/lib/auth"

type ApiResponse<T> = {
  success: boolean
  message?: string
  data?: T
}

export type BackendProjectStatus = "planning" | "in_progress" | "completed"
export type BackendProjectPriority = "high" | "medium" | "low"
export type BackendSprintStatus = "planned" | "active" | "finished"
export type BackendProjectRole = "project_manager" | "scrum_master" | "developer"

export interface BackendProject {
  id_project: string
  name: string
  description: string | null
  start_date: string
  end_date: string | null
  priority: BackendProjectPriority
  status: BackendProjectStatus
  createdBy: string
  createdAt: string
}

export interface BackendProjectStatsItem {
  id_project: string
  name: string
  status: BackendProjectStatus
  priority: BackendProjectPriority
  start_date: string
  end_date: string | null
  totalTasks: number
  completedTasks: number
  inProgressTasks: number
  pendingTasks: number
  completionPercentage: number
  isOverdue: boolean
  daysRemaining: number | null
}

export interface BackendSprint {
  id_sprint: string
  name: string
  start_date: string
  end_date: string
  status: BackendSprintStatus
  id_project: string
  createdAt: string
}

export interface BackendProjectMember {
  id_mp: string
  id_user: string
  id_project: string
  role: BackendProjectRole
}

export interface BackendUser {
  id: string
  email: string
  name: string
  lastname: string
  profilePhoto?: string | null
  image?: string | null
  avatarUrl?: string | null
  profileImageUrl?: string | null
}

async function requestJson<T>(path: string): Promise<T> {
  const token = getToken()

  if (!token) {
    throw new Error("Sesión expirada. Inicia sesión nuevamente.")
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    cache: "no-store",
  })

  const payload = (await response.json()) as ApiResponse<T>

  if (!response.ok || !payload.success || payload.data === undefined) {
    throw new Error(payload.message || "No se pudo obtener la información del milestone")
  }

  return payload.data
}

export async function getMilestoneProjects(): Promise<BackendProject[]> {
  return requestJson<BackendProject[]>("/projects")
}

export async function getProjectsStats(): Promise<BackendProjectStatsItem[]> {
  const payload = await requestJson<{ projectsChart: BackendProjectStatsItem[] }>("/dashboard/projects-stats")
  return payload.projectsChart
}

export async function getProjectSprints(projectId: string): Promise<BackendSprint[]> {
  return requestJson<BackendSprint[]>(`/projects/${projectId}/sprints`)
}

export async function getProjectMembers(projectId: string): Promise<BackendProjectMember[]> {
  return requestJson<BackendProjectMember[]>(`/projects/${projectId}/members`)
}

export async function getUsers(): Promise<BackendUser[]> {
  return requestJson<BackendUser[]>("/users")
}

export interface MilestonesOverview {
  projects: BackendProject[]
  projectStats: BackendProjectStatsItem[]
  users: BackendUser[]
  members: BackendProjectMember[]
  sprints: BackendSprint[]
}

// 1 request agregada que reemplaza los 3 + 2*N requests que hacía la página de milestones.
// El backend devuelve members/sprints de todos los proyectos en queries bulk.
export async function getMilestonesOverview(): Promise<MilestonesOverview> {
  return requestJson<MilestonesOverview>("/dashboard/milestones-overview")
}