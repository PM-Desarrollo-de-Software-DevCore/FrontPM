"use client"

import { Sprint } from "@/types/sprint"
import { Task } from "@/types/task"

interface Props {
  sprint: Sprint

  tasks: Task[]
}

export default function SprintCard({
  sprint,
  tasks,
}: Props) {

  const pendingTasks =
    tasks.filter(
      (task) =>
        task.status ===
        "pending"
    )

  const progressTasks =
    tasks.filter(
      (task) =>
        task.status ===
        "in_progress"
    )

  const completedTasks =
    tasks.filter(
      (task) =>
        task.status ===
        "completed"
    )

  return (
    <div className="rounded-[28px] bg-white p-6 shadow-sm">

      {/* HEADER */}

      <div className="mb-6">

        <h2 className="text-2xl font-bold text-black">
          {sprint.name}
        </h2>

        <p className="mt-2 text-sm text-gray-400">
          {new Date(
            sprint.start_date
          ).toLocaleDateString()}{" "}
          -{" "}
          {new Date(
            sprint.end_date
          ).toLocaleDateString()}
        </p>
      </div>

      {/* PENDING */}

      <div className="mb-5">

        <div className="mb-3 flex items-center gap-2">

          <div className="h-3 w-3 rounded-full bg-yellow-400" />

          <h3 className="font-semibold">
            Pending (
            {
              pendingTasks.length
            }
            )
          </h3>
        </div>

        <div className="space-y-2">

          {pendingTasks.map(
            (task) => (
              <div
                key={task.id}
                className="rounded-2xl border border-gray-100 p-3"
              >
                <p className="font-medium">
                  {
                    task.title
                  }
                </p>
              </div>
            )
          )}
        </div>
      </div>

      {/* IN PROGRESS */}

      <div className="mb-5">

        <div className="mb-3 flex items-center gap-2">

          <div className="h-3 w-3 rounded-full bg-blue-500" />

          <h3 className="font-semibold">
            In Progress (
            {
              progressTasks.length
            }
            )
          </h3>
        </div>

        <div className="space-y-2">

          {progressTasks.map(
            (task) => (
              <div
                key={task.id}
                className="rounded-2xl border border-gray-100 p-3"
              >
                <p className="font-medium">
                  {
                    task.title
                  }
                </p>
              </div>
            )
          )}
        </div>
      </div>

      {/* COMPLETED */}

      <div>

        <div className="mb-3 flex items-center gap-2">

          <div className="h-3 w-3 rounded-full bg-green-500" />

          <h3 className="font-semibold">
            Completed (
            {
              completedTasks.length
            }
            )
          </h3>
        </div>

        <div className="space-y-2">

          {completedTasks.map(
            (task) => (
              <div
                key={task.id}
                className="rounded-2xl border border-gray-100 p-3"
              >
                <p className="font-medium">
                  {
                    task.title
                  }
                </p>
              </div>
            )
          )}
        </div>
      </div>
    </div>
  )
}