import { getToken } from "@/lib/auth"
import { mapSprint } from "./sprintService"
import { mapBackendTask } from "./taskService"
import type { Sprint } from "@/types/sprint"
import type { Task } from "@/types/task"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"

export interface SearchIndex {
  sprints: (Sprint & { projectId: string })[]
  tasks: (Task & { projectId: string })[]
}

// 1 request agregada que reemplaza el 1 + 2*N requests del buscador global
// (antes: por cada proyecto, getProjectSprints + getProjectTasks). El backend
// devuelve sprints y tasks de todos los proyectos del usuario en queries bulk;
// projectName se resuelve en memoria en el cliente desde la lista de proyectos.
export async function getSearchIndex(): Promise<SearchIndex> {
  const token = getToken()

  const response = await fetch(`${API_URL}/dashboard/search-index`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    },
    cache: "no-store",
  })

  if (!response.ok) {
    throw new Error("No se pudo cargar el índice de búsqueda")
  }

  const data = await response.json()
  const payload = data?.data ?? data
  const rawSprints: any[] = Array.isArray(payload?.sprints) ? payload.sprints : []
  const rawTasks: any[] = Array.isArray(payload?.tasks) ? payload.tasks : []

  return {
    sprints: rawSprints.map((sprint) => ({ ...mapSprint(sprint), projectId: sprint.id_project })),
    tasks: rawTasks.map((task) => ({ ...mapBackendTask(task), projectId: task.id_project })),
  }
}
