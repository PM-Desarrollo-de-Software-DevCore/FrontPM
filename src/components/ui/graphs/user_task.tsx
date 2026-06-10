"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useUserTasks, UserTask } from "@/hooks/useDashboardStats"
import { slugify } from "@/lib/slug"

type FilterStatus = "all" | "pending" | "in_progress" | "completed" | "overdue"

const getStatusColor = (status: UserTask["status"], isOverdue: boolean) => {
  if (isOverdue || status === "on_hold") {
    return "bg-red-500"
  }

  switch (status) {
    case "completed":   return "bg-green-500"
    case "in_progress": return "bg-blue-500"
    case "pending":     return "bg-yellow-500"
    default:            return "bg-gray-500"
  }
}

const getPriorityStyles = (priority: UserTask["priority"]) => {
  switch (priority) {
    case "high":   return "bg-red-100 text-red-600"
    case "medium": return "bg-yellow-100 text-yellow-700"
    case "low":    return "bg-green-100 text-green-600"
  }
}

const formatStatus = (status: UserTask["status"], isOverdue: boolean) => {
  if (isOverdue || status === "on_hold") return "Overdue"
  switch (status) {
    case "in_progress": return "In Progress"
    case "completed":   return "Completed"
    case "pending":     return "Pending"
  }
}

const formatPriority = (priority: UserTask["priority"]) =>
  priority.charAt(0).toUpperCase() + priority.slice(1)

type Props = {
  filters?: { sprint?: string; project?: string }
}

export default function ProjectsList({ filters }: Props) {
  const router = useRouter()
  const [filter, setFilter] = useState<FilterStatus>("all")
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

  const filteredTasks = projectFilteredTasks.filter((t) => {
    if (filter === "all") return true
    if (filter === "overdue") return t.isOverdue || t.status === "on_hold"
    return t.status === filter
  })

  const countByStatus = (status: FilterStatus) =>
    projectFilteredTasks.filter((t) => {
      if (status === "overdue") return t.isOverdue || t.status === "on_hold"
      if (status === "all") return true
      return t.status === status
    }).length

  if (loading) {
    return (
      <div className="flex flex-col gap-4">
        <h2 className="text-xl font-semibold">Tasks</h2>
        <div className="flex flex-col gap-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-16 rounded-xl bg-slate-100 animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col gap-4">
        <h2 className="text-xl font-semibold">Tasks</h2>
        <p className="text-sm text-red-500">{error}</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">

      <div>
        <h2 className="text-xl font-semibold">Tasks</h2>
      </div>

      <div className="flex flex-wrap gap-2">
        {[
          { key: "all",         label: "All" },
          { key: "completed",   label: `Completed (${countByStatus("completed")})` },
          { key: "in_progress", label: `In Progress (${countByStatus("in_progress")})` },
          { key: "pending",     label: `Pending (${countByStatus("pending")})` },
          { key: "overdue",     label: `Overdue (${countByStatus("overdue")})` },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key as FilterStatus)}
            className={`px-3 py-1.5 text-sm rounded-full border transition
              ${filter === tab.key
                ? "bg-muted text-strong border-border"
                : "bg-card text-muted-foreground hover:bg-muted border-border"
              }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="flex flex-col gap-3">
        {filteredTasks.map((task) => (
          <div
            key={task.id_task}
            onClick={() => {
              const projectSlug = slugify(task.project.name)
              router.push(`/projects/${projectSlug}/tasks?taskId=${task.id_task}`)
            }}
            className="flex items-center justify-between rounded-xl border border-border bg-card px-4 py-4 shadow-sm hover:shadow-md transition w-full min-w-0 cursor-pointer"
          >

            <div className="flex flex-col items-start gap-1 min-w-0 flex-1 pr-3">
              <span className="font-medium text-sm text-left truncate w-full">{task.title}</span>
              <span className="text-xs text-muted text-left truncate w-full">{task.project.name}</span>
            </div>


            <div className="flex items-center gap-3 flex-shrink-0 relative group">
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${getPriorityStyles(task.priority)}`}>
                {formatPriority(task.priority)}
              </span>

              <div className={`w-3 h-3 rounded-full ${getStatusColor(task.status, task.isOverdue)}`} />

              <div className="absolute right-0 top-8 translate-y-1 opacity-0 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-200 ease-out pointer-events-none z-10">
                <div className="bg-black text-white text-xs px-3 py-1.5 rounded-md shadow-md whitespace-nowrap">
                  Priority: {formatPriority(task.priority)} | Status: {formatStatus(task.status, task.isOverdue)}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredTasks.length === 0 && (
        <div className="text-sm text-muted text-center py-6">
          No tasks found
        </div>
      )}
    </div>
  )
}