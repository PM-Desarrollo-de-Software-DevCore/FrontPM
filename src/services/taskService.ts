// src/services/taskService.ts

import { Task } from "@/types/task"

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

    if (!response.ok) {
      console.error(
        text
      )

      throw new Error(
        "Error creating task"
      )
    }

    return JSON.parse(text)
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