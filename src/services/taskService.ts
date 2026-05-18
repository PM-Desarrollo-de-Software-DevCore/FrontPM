import { Task } from "@/types/task"

const API_URL = process.env.NEXT_PUBLIC_API_URL

export async function getProjectTasks(
  projectId: string,
  token: string
) {
  const response = await fetch(
    `${API_URL}/projects/${projectId}/tasks`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  )

  if (!response.ok) {
    throw new Error("Error fetching tasks")
  }

  return response.json()
}

export async function createTask(
  projectId: string,
  taskData: Partial<Task>,
  token: string
) {
  const response = await fetch(
    `${API_URL}/projects/${projectId}/tasks`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(taskData),
    }
  )

  if (!response.ok) {
    throw new Error("Error creating task")
  }

  return response.json()
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
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(taskData),
    }
  )

  if (!response.ok) {
    throw new Error("Error updating task")
  }

  return response.json()
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
    throw new Error("Error deleting task")
  }

  return response.json()
}