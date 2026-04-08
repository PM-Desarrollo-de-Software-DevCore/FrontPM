"use client"

import { Button } from "../Button/button"

type Status = "green" | "yellow" | "red"

type Project = {
  id: number
  name: string
  status: Status
}

const projects: Project[] = [
  { id: 1, name: "Payment System", status: "green" },
  { id: 2, name: "Mobile App", status: "yellow" },
  { id: 3, name: "Dashboard", status: "red" },
  { id: 4, name: "Multiagent System", status: "green" },
  { id: 5, name: "IOS App", status: "yellow" },
  { id: 6, name: "Unity", status: "red" },
  { id: 7, name: "API", status: "green" },
  { id: 8, name: "Enviormental Web App", status: "yellow" }
]

const getStatusColor = (status: "green" | "yellow" | "red") => {
  switch (status) {
    case "green":
      return "bg-green-500"
    case "yellow":
      return "bg-yellow-500"
    case "red":
      return "bg-red-500"
    default:
      return "bg-gray-500"
  }
}

export default function ProjectsList() {
  return (
    <div className="flex flex-col gap-4">
      
      <div className="flex flex-col gap-1">
        <h2 className="text-xl font-semibold">Projects</h2>
        <p className="text-sm text-gray-500">
          Project state
        </p>
      </div>

      <div className="flex flex-col gap-3">
        {projects.map((project) => (
          <Button
            key={project.id}
            variant="outline"
            className="flex items-center justify-between rounded-xl border border-gray-100 px-4 py-4 shadow-sm hover:shadow-md transition w-full"
            onClick={() => {}}
          >
            <span className="font-medium text-sm">
              {project.name}
            </span>

            <div
              className={`w-3 h-3 rounded-full ${getStatusColor(
                project.status
              )}`}
            />
          </Button>
        ))}
      </div>

    </div>
  )
}