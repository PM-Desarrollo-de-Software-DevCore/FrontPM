// src/components/tasks/CreateTaskModal.tsx

"use client"

import {
  useState,
} from "react"

import {
  Task,
} from "@/types/task"

interface Props {

  open: boolean

  onCloseAction: () => void

  onSubmitAction: (
    task: Partial<Task>
  ) => void
}

export default function CreateTaskModal({

  open,

  onCloseAction,

  onSubmitAction,

}: Props) {

  const [
    title,
    setTitle,
  ] = useState("")

  const [
    description,
    setDescription,
  ] = useState("")

  const [
    priority,
    setPriority,
  ] = useState<
    "low" |
    "medium" |
    "high"
  >("medium")

  const [
    endDate,
    setEndDate,
  ] = useState("")

  if (!open)
    return null

  const handleSubmit =
  async () => {

    await onSubmitAction({

      title,

      description,

      priority,

      end_date:
        endDate,

      progress: 0,

      status:
        "pending",

      id_sprint:
        null,
    })

    // RESET FORM

    setTitle("")

    setDescription("")

    setPriority(
      "medium"
    )

    setEndDate("")
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">

      <div className="w-full max-w-md rounded-[32px] bg-white p-6 shadow-xl">

        {/* HEADER */}

        <div className="mb-5 flex items-center justify-between">

          <h2 className="text-2xl font-semibold text-black">

            New Task
          </h2>

          <button
            onClick={
              onCloseAction
            }
            className="text-2xl text-gray-400 transition hover:text-black"
          >
            ×
          </button>
        </div>

        {/* FORM */}

        <div className="space-y-4">

          <input
            value={title}
            onChange={(e) =>
              setTitle(
                e.target.value
              )
            }
            placeholder="Task title"
            className="h-12 w-full rounded-2xl border border-gray-200 px-4 text-sm outline-none"
          />

          <textarea
            value={
              description
            }
            onChange={(e) =>
              setDescription(
                e.target.value
              )
            }
            placeholder="Description"
            className="min-h-[120px] w-full rounded-2xl border border-gray-200 p-4 text-sm outline-none"
          />

          <div className="grid grid-cols-2 gap-4">

            <label className="mb-2 block text-sm font-medium text-gray-600">

            Priority
          </label>

            <select
              value={
                priority
              }
              onChange={(e) =>
                setPriority(
                  e.target
                    .value as any
                )
              }
              className="h-12 rounded-2xl border border-gray-200 px-4 text-sm outline-none"
            >
              <option value="low">
                Low
              </option>

              <option value="medium">
                Medium
              </option>

              <option value="high">
                High
              </option>
            </select>
            <label className="mb-2 block text-sm font-medium text-gray-600">

            Due Date
          </label>
            <input
              type="date"
              value={
                endDate
              }
              onChange={(e) =>
                setEndDate(
                  e.target.value
                )
              }
              className="h-12 rounded-2xl border border-gray-200 px-4 text-sm outline-none"
            />
          </div>

          {/* BUTTONS */}

          <div className="flex justify-end gap-3 pt-4">

            <button
              onClick={
                onCloseAction
              }
              className="rounded-2xl border border-gray-200 px-5 py-2 text-sm font-medium text-gray-600 transition hover:bg-gray-100"
            >
              Cancel
            </button>

            <button
              onClick={
                handleSubmit
              }
              className="rounded-2xl bg-red-500 px-5 py-2 text-sm font-semibold text-white transition hover:bg-red-600"
            >
              Create Task
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}