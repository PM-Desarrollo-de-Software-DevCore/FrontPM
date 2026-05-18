"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"

import TaskKanban from "@/components/tasks/TaskKanban"

import {
  createTask,
} from "@/services/taskService"

export default function ProjectTasksPage() {
  const params = useParams()

  const projectId = params.projectId as string

  const [token, setToken] = useState("")

  const [title, setTitle] = useState("")
  const [description, setDescription] =
    useState("")

  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const storedToken =
      localStorage.getItem("token") || ""

    setToken(storedToken)
  }, [])

  async function handleCreateTask() {
    try {
      setLoading(true)

      await createTask(
        projectId,
        {
          title,
          description,
          progress: 0,
          priority: "medium",
          status: "pending",
        },
        token
      )

      setTitle("")
      setDescription("")

      window.location.reload()
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full min-h-screen px-6 py-6">
      <div className="w-full">
        <div className="mb-8">
          <h1 className="text-4xl font-bold">
            Project Tasks
          </h1>

          <p className="text-gray-500 mt-2">
            Manage all project tasks
          </p>
        </div>

        <div className="w-full bg-white rounded-2xl border border-gray-200 p-6 mb-8">
          <h2 className="text-2xl font-bold mb-6">
            Create Task
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Task title"
              value={title}
              onChange={(e) =>
                setTitle(e.target.value)
              }
              className="border rounded-xl p-4 w-full"
            />

            <input
              type="text"
              placeholder="Task description"
              value={description}
              onChange={(e) =>
                setDescription(e.target.value)
              }
              className="border rounded-xl p-4 w-full"
            />
          </div>

          <button
            onClick={handleCreateTask}
            disabled={loading}
            className="mt-6 bg-black text-white px-8 py-4 rounded-xl hover:opacity-90 transition"
          >
            {loading
              ? "Creating..."
              : "Create Task"}
          </button>
        </div>

        <div className="w-full">
          <TaskKanban
            projectId={projectId}
            token={token}
          />
        </div>
      </div>
    </div>
  )
}