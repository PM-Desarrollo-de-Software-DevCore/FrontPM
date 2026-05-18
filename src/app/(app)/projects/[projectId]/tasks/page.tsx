"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
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

  const [priority, setPriority] =
    useState("medium")

  const [loading, setLoading] =
    useState(false)

  const [refreshKey, setRefreshKey] =
    useState(0)

  const [openModal, setOpenModal] =
    useState(false)

  useEffect(() => {
    const storedToken =
      localStorage.getItem("token") || ""

    setToken(storedToken)
  }, [])

  async function handleCreateTask() {
    if (!title || !description) return

    try {
      setLoading(true)

      await createTask(
        projectId,
        {
          title,
          description,
          progress: 0,
          priority:
            priority as
              | "low"
              | "medium"
              | "high",
          status: "pending",
        },
        token
      )

      setTitle("")
      setDescription("")
      setPriority("medium")

      setRefreshKey((prev) => prev + 1)

      setOpenModal(false)
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full min-h-screen px-8 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <Link
            href="/projects"
            className="text-gray-500 hover:text-black transition"
          >
            ← Back to Projects
          </Link>

          <h1 className="text-5xl font-bold mt-3">
            Tasks
          </h1>
        </div>

        <button
          onClick={() =>
            setOpenModal(true)
          }
          className="bg-white border border-gray-300 rounded-2xl px-6 py-3 shadow-sm hover:shadow-md transition font-medium"
        >
          + New Task
        </button>
      </div>

      <TaskKanban
        key={refreshKey}
        projectId={projectId}
        token={token}
      />

      {openModal && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-6">
          <div className="bg-white w-full max-w-4xl rounded-[30px] p-10 shadow-2xl">
            <h2 className="text-4xl font-bold mb-8">
              Create Task
            </h2>

            <div className="space-y-5">
              <input
                type="text"
                placeholder="Task Title"
                value={title}
                onChange={(e) =>
                  setTitle(
                    e.target.value
                  )
                }
                className="w-full border border-gray-200 rounded-2xl p-5 text-lg outline-none focus:ring-2 focus:ring-black"
              />

              <input
                type="text"
                placeholder="Assignee"
                className="w-full border border-gray-200 rounded-2xl p-5 text-lg outline-none focus:ring-2 focus:ring-black"
              />

              <input
                type="text"
                placeholder="Manager"
                className="w-full border border-gray-200 rounded-2xl p-5 text-lg outline-none focus:ring-2 focus:ring-black"
              />

              <textarea
                placeholder="Task Description"
                value={description}
                onChange={(e) =>
                  setDescription(
                    e.target.value
                  )
                }
                className="w-full border border-gray-200 rounded-2xl p-5 text-lg min-h-[140px] outline-none focus:ring-2 focus:ring-black"
              />

              <input
                type="date"
                className="w-full border border-gray-200 rounded-2xl p-5 text-lg outline-none focus:ring-2 focus:ring-black"
              />

              <select
                value={priority}
                onChange={(e) =>
                  setPriority(
                    e.target.value
                  )
                }
                className="w-full border border-gray-200 rounded-2xl p-5 text-lg outline-none focus:ring-2 focus:ring-black"
              >
                <option value="low">
                  Low Priority
                </option>

                <option value="medium">
                  Medium Priority
                </option>

                <option value="high">
                  High Priority
                </option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-5 mt-10">
              <button
                onClick={() =>
                  setOpenModal(false)
                }
                className="border border-gray-300 rounded-2xl py-5 text-xl font-medium hover:bg-gray-50 transition"
              >
                Cancel
              </button>

              <button
                onClick={
                  handleCreateTask
                }
                disabled={loading}
                className="bg-black text-white rounded-2xl py-5 text-xl font-medium hover:opacity-90 transition"
              >
                {loading
                  ? "Creating..."
                  : "Create Task"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}