"use client"

import { useState } from "react"

import { createTask } from "@/services/taskService"

interface Props {
  projectId: string
  token: string
  onCreated: () => void
}

export default function CreateTaskModal({
  projectId,
  token,
  onCreated,
}: Props) {
  const [title, setTitle] = useState("")
  const [description, setDescription] =
    useState("")

  async function handleCreate() {
    try {
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

      onCreated()

      setTitle("")
      setDescription("")
    } catch (error) {
      console.error(error)
    }
  }

  return (
    <div className="bg-white p-6 rounded-2xl border">
      <h2 className="text-xl font-bold mb-4">
        Create Task
      </h2>

      <input
        placeholder="Title"
        value={title}
        onChange={(e) =>
          setTitle(e.target.value)
        }
        className="border rounded w-full p-2 mb-4"
      />

      <textarea
        placeholder="Description"
        value={description}
        onChange={(e) =>
          setDescription(e.target.value)
        }
        className="border rounded w-full p-2 mb-4"
      />

      <button
        onClick={handleCreate}
        className="bg-black text-white px-4 py-2 rounded"
      >
        Create
      </button>
    </div>
  )
}