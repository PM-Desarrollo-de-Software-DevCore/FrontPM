// src/services/taskService.ts

import { Task } from "@/types/task"
import { getToken } from "@/lib/auth"

const API_URL =
  process.env
    .NEXT_PUBLIC_API_URL ||
  "http://localhost:3001"

type BackendTask =
  Omit<Task, "id"> & {
    id_task?: string

    task_number?: number

    createdAt?: string

    updatedAt?: string

    completedAt?: string | null
  }

function mapBackendTask(
  task: BackendTask
): Task {
  return {
    id: task.id_task || "",

    title: task.title,

    description:
      task.description,

    progress:
      task.progress,

    assignedTo:
      task.assignedTo,

    end_date:
      task.end_date,

    priority:
      task.priority,

    status: task.status,

    id_sprint:
      task.id_sprint,

    createdAt:
      task.createdAt,

    updatedAt:
      task.updatedAt,

    completedAt:
      task.completedAt,
  }
}

export async function getProjectTasks(
  projectId: string,
  token: string
) {
  try {
    const response = await fetch(
      `${API_URL}/projects/${projectId}/tasks`,
      {
        method: "GET",

        headers: {
          Authorization: `Bearer ${token}`,

          "Content-Type":
            "application/json",
        },
      }
    )

    if (!response.ok) {
      console.error(
        "FETCH FAILED:",
        response.status
      )

      return []
    }

    const data =
      await response.json()

    const tasks = Array.isArray(data)
      ? data
      : data.data ||
        data.tasks ||
        []

    return tasks.map(
      mapBackendTask
    )
  } catch (error) {
    console.error(
      "GET TASKS ERROR:",
      error
    )

    return []
  }
}

export async function createTask(
  projectId: string,
  taskData: Partial<Task>,
  token: string
) {
  try {
    const response = await fetch(
      `${API_URL}/projects/${projectId}/tasks`,
      {
        method: "POST",

        headers: {
          "Content-Type":
            "application/json",

          Authorization: `Bearer ${token}`,
        },

        body: JSON.stringify(
          taskData
        ),
      }
    )

    const text =
      await response.text()

    let parsedBody: Record<string, unknown> | null = null
    try {
      parsedBody = text ? JSON.parse(text) : null
    } catch {
      parsedBody = null
    }

    if (!response.ok) {
      console.error(text)

      const messageFromBody =
        typeof parsedBody?.message === "string"
          ? parsedBody.message
          : null

      const errorFromBody =
        typeof parsedBody?.error === "string"
          ? parsedBody.error
          : null

      const backendMessage =
        messageFromBody ||
        errorFromBody ||
        "Error creating task"

      throw new Error(backendMessage)
    }

    return parsedBody ?? text
  } catch (error) {
    console.error(
      "CREATE TASK ERROR:",
      error
    )

    throw error
  }
}

export async function updateTask(
  taskId: string,
  taskData: Partial<Task>,
  token: string
) {
  const response = await fetch(
    `${API_URL}/tasks/${taskId}`,
    {
      method: "PATCH",

      headers: {
        "Content-Type":
          "application/json",

        Authorization: `Bearer ${token}`,
      },

      body: JSON.stringify(
        taskData
      ),
    }
  )

  const text =
    await response.text()

  console.log(
    "UPDATE TASK RESPONSE:",
    text
  )

  if (!response.ok) {
    throw new Error(
      "Error updating task"
    )
  }

  return JSON.parse(text)
}

export async function deleteTask(
  taskId: string,
  token: string
) {
  const response = await fetch(
    `${API_URL}/tasks/${taskId}`,
    {
      method: "DELETE",

      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  )

  if (!response.ok) {
    throw new Error(
      "Error deleting task"
    )
  }

  return response.json()
}

function isSameCalendarDay(dateValue?: string | null) {
  if (!dateValue) return false

  const date = new Date(dateValue)
  const today = new Date()

  return (
    date.getFullYear() === today.getFullYear() &&
    date.getMonth() === today.getMonth() &&
    date.getDate() === today.getDate()
  )
}

type MeTaskResponse = {
  success?: boolean
  data?: unknown[]
}

type CompletedTodayTask = {
  status?: string
  completedAt?: string | null
  completed_at?: string | null
  updatedAt?: string | null
  updated_at?: string | null
}

type CompletedTodayCountItem = {
  userId?: string
  count?: number
}

/*
  Obtener el número de tareas completadas hoy por el usuario autenticado.
  Usa `/users/me/tasks`, que es el endpoint real del backend.
*/
export async function getUserCompletedTodayCount() {
  try {
    const token = getToken()
    if (!token) {
      return 0
    }

    const response = await fetch(`${API_URL}/users/me/tasks`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    })

    if (!response.ok) {
      return 0
    }

    const data: MeTaskResponse = await response.json()
    const tasks = Array.isArray(data) ? data : data.data || []

    const completedToday = (tasks as CompletedTodayTask[]).filter((t) => {
      const status = String(t.status || "").toLowerCase()
      const updatedAt =
        t.completedAt ||
        t.completed_at ||
        t.updatedAt ||
        t.updated_at

      return status === "completed" && isSameCalendarDay(updatedAt)
    })

    return completedToday.length
  } catch (error) {
    console.error("Error fetching user tasks for today:", error)
    return 0
  }
}

/*
  Obtener el número de tareas completadas hoy por un usuario específico.
  Intenta varios endpoints: /users/{userId}/tasks, /users/{userId}/completed-today, etc.
*/
export async function getUserCompletedTodayCountById(userId: string) {
  try {
    const token = getToken()
    if (!token || !userId) {
      return 0
    }

    // Intenta el endpoint directo para un usuario específico
    const response = await fetch(`${API_URL}/users/${userId}/tasks`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    })

    if (!response.ok) {
      return 0
    }

    const data: MeTaskResponse = await response.json()
    const tasks = Array.isArray(data) ? data : data.data || []

    const completedToday = (tasks as CompletedTodayTask[]).filter((t) => {
      const status = String(t.status || "").toLowerCase()
      const updatedAt =
        t.completedAt ||
        t.completed_at ||
        t.updatedAt ||
        t.updated_at

      return status === "completed" && isSameCalendarDay(updatedAt)
    })

    return completedToday.length
  } catch (error) {
    console.error(`Error fetching tasks for user ${userId}:`, error)
    return 0
  }
}

/*
  Obtener conteos de tareas completadas hoy para múltiples usuarios.
  Carga todas las tareas y devuelve un Map de userId -> count
*/
export async function getMultipleUsersCompletedTodayCount(userIds: string[]): Promise<Map<string, number>> {
  const result = new Map<string, number>()
  
  try {
    const token = getToken()
    if (!token || !userIds.length) {
      return result
    }

    // Intenta cargar las tareas de todos los usuarios
    const response = await fetch(`${API_URL}/tasks/completed-today`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ userIds }),
      cache: "no-store",
    })

    if (response.ok) {
      const data = await response.json()
      const counts = Array.isArray(data) ? data : data.data || {}
      
      // Si es un array, mapear por userId
      if (Array.isArray(counts)) {
        counts.forEach((item) => {
          const row = item as CompletedTodayCountItem
          if (!row.userId) return
          result.set(row.userId, row.count || 0)
        })
      } else if (typeof counts === "object") {
        // Si es un objeto, usar como Map directo
        Object.entries(counts).forEach(([userId, count]) => {
          result.set(userId, count as number)
        })
      }
    }
  } catch (error) {
    console.error("Error fetching completed counts for multiple users:", error)
  }

  return result
}