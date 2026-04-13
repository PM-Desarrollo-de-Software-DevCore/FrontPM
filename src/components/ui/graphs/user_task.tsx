"use client"

import { useState } from "react"
import { Button } from "../Button/button"

type Status = "completed" | "onhold" | "onprogress" | "pending"
type Priority = "low" | "med" | "high"

type Project = {
  id: number
  name: string
  status: Status
  priority: Priority
}

const projects: Project[] = [
  { id: 1, name: "Endpoints Dashboard", status: "completed", priority: "high" },
  { id: 2, name: "API", status: "onprogress", priority: "med" },
  { id: 3, name: "Deployment", status: "onhold", priority: "high" },
  { id: 4, name: "Front of Profile", status: "completed", priority: "low" },
  { id: 5, name: "Settings", status: "pending", priority: "med" },
  { id: 6, name: "Database connection", status: "onhold", priority: "high" },
  { id: 7, name: "Endpoints Profile", status: "completed", priority: "low" },
  { id: 8, name: "Login", status: "onprogress", priority: "med" }
]

const getStatusColor = (status: Status) => {
  switch (status) {
    case "completed":
      return "bg-green-500"
    case "onhold":
      return "bg-red-500"
    case "onprogress":
      return "bg-blue-500"
    case "pending":
      return "bg-yellow-500"
    default:
      return "bg-gray-500"
  }
}

const getPriorityStyles = (priority: Priority) => {
  switch (priority) {
    case "high":
      return "bg-red-100 text-red-600"
    case "med":
      return "bg-yellow-100 text-yellow-700"
    case "low":
      return "bg-green-100 text-green-600"
  }
}

const formatLabel = (text: string) =>
  text.charAt(0).toUpperCase() + text.slice(1)

const formatStatus = (status: Status) => {
  switch (status) {
    case "onhold":
      return "On Hold"
    case "onprogress":
      return "In Progress"
    case "completed":
      return "Completed"
    case "pending":
      return "Pending"
  }
}

export default function ProjectsList() {
  const [filter, setFilter] = useState<Status | "all">("all")

  const priorityOrder = { high: 0, med: 1, low: 2 }

  const filteredProjects =
    (filter === "all"
      ? projects
      : projects.filter((p) => p.status === filter)
    ).sort(
      (a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]
    )

  const countByStatus = (status: Status) =>
    projects.filter((p) => p.status === status).length

  return (
    <div className="flex flex-col gap-4">
      

      <div>
        <h2 className="text-xl font-semibold">Tasks</h2>
      </div>


      <div className="flex flex-wrap gap-2">
        {[
          { key: "all", label: "All" },
          { key: "completed", label: `Completed (${countByStatus("completed")})` },
          { key: "onprogress", label: `In Progress (${countByStatus("onprogress")})` },
          { key: "pending", label: `Pending (${countByStatus("pending")})` },
          { key: "onhold", label: `On Hold (${countByStatus("onhold")})` },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key as any)}
            className={`px-3 py-1.5 text-sm rounded-full border transition
              ${
                filter === tab.key
                  ? "bg-gray-200 text-gray-800 border-gray-300"
                  : "bg-white text-gray-600 hover:bg-gray-100"
              }`}
          >
            {tab.label}
          </button>
        ))}
      </div>


      <div className="flex flex-col gap-3">
        {filteredProjects.map((project) => (
          <Button
            key={project.id}
            variant="outline"
            className="flex items-center justify-between rounded-xl border border-gray-100 px-4 py-4 shadow-sm hover:shadow-md transition w-full"
          >
 
            <span className="font-medium text-sm">
              {project.name}
            </span>


            <div className="flex items-center gap-3 relative group">
              

              <span
                className={`text-xs px-2 py-0.5 rounded-full font-medium ${getPriorityStyles(
                  project.priority
                )}`}
              >
                {formatLabel(project.priority)}
              </span>


              <div
                className={`w-3 h-3 rounded-full ${getStatusColor(
                  project.status
                )}`}
              />


              <div className="absolute right-0 top-8 translate-y-1 opacity-0 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-200 ease-out pointer-events-none z-10">
                <div className="bg-black text-white text-xs px-3 py-1.5 rounded-md shadow-md">
                  Priority: {formatLabel(project.priority)} | Status: {formatStatus(project.status)}
                </div>
              </div>

            </div>
          </Button>
        ))}
      </div>


      {filteredProjects.length === 0 && (
        <div className="text-sm text-gray-400 text-center py-6">
          No tasks found
        </div>
      )}
    </div>
  )
}