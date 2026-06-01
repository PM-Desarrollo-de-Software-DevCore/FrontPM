"use client"

import { useEffect, useState } from "react"

import { Task } from "@/types/task"

interface User {
  id: string
  name: string
  lastname: string
}

interface Props {
  task: Task
  users: User[]
  onCloseAction: () => void
  onDeleteAction: (taskId: string) => void
  onAssignAction: (taskId: string, userId: string) => void
}

export default function TaskDetailsModal({
  task,
  users,
  onCloseAction,
  onDeleteAction,
  onAssignAction,
}: Props) {
  const [selectedUser, setSelectedUser] = useState(task.assignedTo || "")
  const [successMessage, setSuccessMessage] = useState("")

  useEffect(() => {
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = "hidden"

    return () => {
      document.body.style.overflow = previousOverflow
    }
  }, [])

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/20 p-6 backdrop-blur-sm">
      <div className="flex w-175 max-h-[calc(100vh-3rem)] flex-col overflow-hidden rounded-[28px] bg-white p-6 shadow-2xl">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-gray-400">Task Details</p>
            <h1 className="mt-1 text-3xl font-bold text-black">{task.title}</h1>
          </div>

          <button onClick={onCloseAction} className="text-3xl text-gray-400 hover:text-black">
            ×
          </button>
        </div>

        <div className="mt-8 flex-1 overflow-y-auto pr-1">
          <div className="grid grid-cols-2 gap-8">
            <div>
              <p className="mb-2 text-sm text-gray-400">Priority</p>
              <div className="inline-flex rounded-full bg-red-100 px-4 py-1 text-sm text-red-500">
                {task.priority}
              </div>
            </div>

            <div>
              <p className="mb-2 text-sm text-gray-400">Status</p>
              <div className="inline-flex rounded-full bg-green-100 px-4 py-1 text-sm text-green-600">
                {task.status}
              </div>
            </div>

            <div>
              <p className="mb-2 text-sm text-gray-400">Due Date</p>
              <p className="text-lg font-medium">{new Date(task.end_date).toLocaleDateString()}</p>
            </div>

            <div>
              <p className="mb-2 text-sm text-gray-400">Progress</p>
              <p className="text-lg font-medium">{task.progress}%</p>
            </div>
          </div>

          {successMessage && (
            <div className="mb-4 rounded-2xl bg-green-100 px-4 py-3 text-sm font-medium text-green-700">
              {successMessage}
            </div>
          )}

          <div className="mt-8">
            <p className="mb-2 text-sm text-gray-400">Assign User</p>
            <div className="flex gap-3">
              <select
                value={selectedUser}
                onChange={(e) => setSelectedUser(e.target.value)}
                className="flex-1 h-10 rounded-2xl border border-gray-200 px-4 text-sm outline-none"
              >
                <option value="">Select user</option>
                {users.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.name} {user.lastname}
                  </option>
                ))}
              </select>

              <button
                onClick={() => {
                  if (!selectedUser) return

                  onAssignAction(task.id, selectedUser)
                  setSuccessMessage("User assigned successfully.")

                  setTimeout(() => {
                    setSuccessMessage("")
                  }, 3000)
                }}
                className="h-10 rounded-2xl bg-black px-4 text-sm font-medium text-white transition hover:opacity-90"
              >
                Confirm
              </button>
            </div>
          </div>

          <div className="mt-8">
            <p className="mb-2 text-sm text-gray-400">Description</p>
            <div className="rounded-2xl bg-gray-50 p-4 text-sm text-gray-700">{task.description}</div>
          </div>
        </div>

        <div className="mt-8 flex justify-end gap-3">
          <button
            onClick={() => onDeleteAction(task.id)}
            className="h-10 rounded-2xl bg-red-500 px-5 text-sm font-medium text-white transition hover:bg-red-600"
          >
            Delete
          </button>

          <button
            onClick={onCloseAction}
            className="h-10 rounded-2xl border border-gray-200 px-5 text-sm font-medium transition hover:bg-gray-100"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}
