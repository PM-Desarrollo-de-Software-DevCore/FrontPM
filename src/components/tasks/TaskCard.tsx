"use client"

import { Task } from "@/types/task"

interface Props {
  task: Task
  onStatusChange: (
    taskId: string,
    status: Task["status"]
  ) => void
}

export default function TaskCard({
  task,
  onStatusChange,
}: Props) {
  return (
    <div className="bg-white rounded-xl border p-4 shadow-sm">
      <h3 className="font-semibold text-black">
        {task.title}
      </h3>

      <p className="text-sm text-gray-500 mt-2">
        {task.description}
      </p>

      <div className="mt-4 flex justify-between items-center">
        <span className="text-xs bg-gray-200 px-2 py-1 rounded">
          {task.priority}
        </span>

        <select
          value={task.status}
          onChange={(e) =>
            onStatusChange(
              task.id,
              e.target.value as Task["status"]
            )
          }
          className="border rounded px-2 py-1 text-sm"
        >
          <option value="pending">Pending</option>
          <option value="in_progress">
            In Progress
          </option>
          <option value="completed">
            Completed
          </option>
        </select>
      </div>
    </div>
  )
}