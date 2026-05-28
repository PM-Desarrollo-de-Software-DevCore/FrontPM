"use client"

import { useUserTasks } from "@/hooks/useDashboardStats"

type Props = {
  filters?: {
    sprint?: string
    project?: string
  }
}

export default function TotalProgress({ filters }: Props) {
  const { data, loading, error } = useUserTasks(filters)

  const tasks = data?.tasks ?? []

  const sprintFilteredTasks = tasks.filter((task) => {
    if (!filters?.sprint) return true

    if (filters.sprint === "backlog") {
      return !task.id_sprint
    }

    return task.id_sprint === filters.sprint
  })

  const projectFilteredTasks = sprintFilteredTasks.filter(
    (t) => !filters?.project || t.project.id_project === filters.project
  )

  const overdueTasks = projectFilteredTasks.filter(
    (t) => t.isOverdue || t.status === "on_hold"
  )

  const overdueCount = overdueTasks.length

  return (
    <div className="w-full h-full flex flex-col">

      <div className="mb-4">
        <h3 className="text-lg font-semibold text-strong">
          Overdue Tasks
        </h3>

        <p className="text-sm text-muted">
          Total overdue
        </p>
      </div>

      <div className="flex-1 flex flex-col justify-center">

        <div className="flex items-end gap-2">
          {loading ? (
            <div className="h-12 w-20 animate-pulse bg-slate-200 rounded-md" />
          ) : error ? (
            <span className="text-sm text-red-600">
              Error
            </span>
          ) : (
            <span className="text-5xl font-bold text-red-600">
              {overdueCount}
            </span>
          )}
        </div>

        <div className="mt-4">
          <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-red-600 rounded-full transition-all duration-700"
              style={{
                width: `${
                  projectFilteredTasks.length > 0
                    ? (overdueCount / projectFilteredTasks.length) * 100
                    : 0
                }%`,
              }}
            />
          </div>

          <p className="text-xs text-muted mt-2">
            {projectFilteredTasks.length > 0
              ? `${Math.round(
                  (overdueCount / projectFilteredTasks.length) * 100
                )}% of tasks are overdue`
              : "No tasks available"}
          </p>
        </div>

      </div>
    </div>
  )
}