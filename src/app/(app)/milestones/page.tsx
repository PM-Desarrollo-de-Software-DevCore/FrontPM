"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card/card"
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  ChartOptions,
  Plugin,
} from "chart.js"
import { Doughnut } from "react-chartjs-2"
import { Flag, Check } from "lucide-react"

ChartJS.register(ArcElement, Tooltip)

// Dummy projects data
const initialProjects = [
  {
    id: "apollo-control",
    name: "Apollo Control",
    description: "Real-time project management platform for planning, tracking, and delivery.",
    status: "In Progress" as const,
    progress: 70,
    tasks: 18,
    owner: "DevCore Team",
    startDate: "2026-04-01",
    endDate: "2026-05-15",
    priority: "High" as const,
    team: ["Frontend", "Backend", "QA"],
  },
  {
    id: "mobile-app",
    name: "Mobile App",
    description: "Mobile application for task tracking and team collaboration.",
    status: "Completed" as const,
    progress: 100,
    tasks: 10,
    owner: "UX Team",
    startDate: "2026-04-10",
    endDate: "2026-06-01",
    priority: "Medium" as const,
    team: ["UX", "Frontend"],
  },
  {
    id: "risk-engine",
    name: "Risk Engine",
    description: "Risk calculation and analytics module for project insights.",
    status: "Completed" as const,
    progress: 100,
    tasks: 24,
    owner: "Backend Team",
    startDate: "2026-03-01",
    endDate: "2026-04-05",
    priority: "High" as const,
    team: ["Backend", "Data"],
  },
  {
    id: "dashboard-ui",
    name: "Dashboard UI",
    description: "Design and implementation of the main dashboard interface.",
    status: "In Progress" as const,
    progress: 55,
    tasks: 12,
    owner: "Frontend Team",
    startDate: "2026-04-05",
    endDate: "2026-05-20",
    priority: "Medium" as const,
    team: ["Frontend", "Design"],
  },
  {
    id: "api-integration",
    name: "API Integration",
    description: "Frontend and backend integration for project workflows.",
    status: "Planning" as const,
    progress: 10,
    tasks: 8,
    owner: "Fullstack Team",
    startDate: "2026-04-15",
    endDate: "2026-06-10",
    priority: "High" as const,
    team: ["Frontend", "Backend"],
  },
  {
    id: "client-portal",
    name: "Client Portal",
    description: "Portal for client visibility, updates, and milestone tracking.",
    status: "Planning" as const,
    progress: 15,
    tasks: 14,
    owner: "Product Team",
    startDate: "2026-04-22",
    endDate: "2026-06-18",
    priority: "Low" as const,
    team: ["Product", "Frontend"],
  },
]

const sprints = [
  {
    id: 1,
    name: "Sprint 1: Foundation",
    progress: 85,
    status: "completed",
  },
  {
    id: 2,
    name: "Sprint 2: Core Features",
    progress: 72,
    status: "in-progress",
  },
  {
    id: 3,
    name: "Sprint 3: UI/UX Polish",
    progress: 45,
    status: "in-progress",
  },
  {
    id: 4,
    name: "Sprint 4: Testing & QA",
    progress: 20,
    status: "pending",
  },
  {
    id: 5,
    name: "Sprint 5: Deployment",
    progress: 0,
    status: "pending",
  },
]

const milestones = [
  {
    id: 1,
    date: "2026-04-01",
    description: "Project kickoff and team alignment",
    sprint: "Sprint 1",
  },
  {
    id: 2,
    date: "2026-04-05",
    description: "Database schema finalized",
    sprint: "Sprint 1",
  },
  {
    id: 3,
    date: "2026-04-08",
    description: "Authentication system implemented",
    sprint: "Sprint 1",
  },
  {
    id: 4,
    date: "2026-04-12",
    description: "API endpoints documentation complete",
    sprint: "Sprint 2",
  },
  {
    id: 5,
    date: "2026-04-15",
    description: "Frontend dashboard MVP delivered",
    sprint: "Sprint 2",
  },
  {
    id: 6,
    date: "2026-04-18",
    description: "Integration testing phase started",
    sprint: "Sprint 2",
  },
  {
    id: 7,
    date: "2026-04-22",
    description: "UI components library completed",
    sprint: "Sprint 3",
  },
  {
    id: 8,
    date: "2026-04-25",
    description: "Design review and refinements",
    sprint: "Sprint 3",
  },
  {
    id: 9,
    date: "2026-04-28",
    description: "Performance optimization completed",
    sprint: "Sprint 3",
  },
]

function SprintProgressChart({ sprint }: { sprint: (typeof sprints)[0] }) {
  const data = {
    labels: ["Complete", "Remaining"],
    datasets: [
      {
        data: [sprint.progress, 100 - sprint.progress],
        backgroundColor: ["#3b82f6", "#e5e7eb"],
        borderWidth: 0,
      },
    ],
  }

  const options: ChartOptions<"doughnut"> = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: "68%",
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: "#ffffff",
        titleColor: "#0f172a",
        bodyColor: "#1f2937",
        borderColor: "#cbd5e1",
        borderWidth: 1,
        padding: 10,
        callbacks: {
          label: function (context: { parsed: number }) {
            return context.parsed + "%"
          },
        },
      },
    },
  }

  const percentagePlugin: Plugin<"pie"> = {
    id: "textCenter",
    beforeDatasetsDraw(chart: { width: number; height: number; ctx: CanvasRenderingContext2D }) {
      const { ctx } = chart
      ctx.save()

      const width = chart.width
      const height = chart.height
      ctx.font = "bold 28px Arial"
      ctx.textAlign = "center"
      ctx.textBaseline = "middle"
      ctx.fillStyle = "#1f2937"
      ctx.fillText(`${sprint.progress}%`, width / 2, height / 2)

      ctx.font = "14px Arial"
      ctx.fillStyle = "#6b7280"
      ctx.fillText("Progress", width / 2, height / 2 + 25)

      ctx.restore()
    },
  }

  return (
    <Doughnut data={data} options={options} plugins={[percentagePlugin as Plugin<"doughnut">]} />
  )
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  })
}

function getProjectStatusClasses(status: string) {
  switch (status) {
    case "Completed":
      return "bg-green-100 text-green-700"
    case "In Progress":
      return "bg-red-100 text-red-700"
    case "Planning":
      return "bg-zinc-200 text-zinc-700"
    default:
      return "bg-zinc-200 text-zinc-700"
  }
}

function ProjectCard({ project }: { project: (typeof initialProjects)[0] }) {
  return (
    <button
      type="button"
      className="w-full rounded-xl border border-zinc-200 bg-white p-4 shadow-sm transition hover:shadow-md text-left focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
    >
      <div className="mb-2 flex items-start justify-between gap-3">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <h3 className="text-lg font-semibold text-zinc-900 truncate">
            {project.name}
          </h3>
        </div>

        <span
          className={`rounded-md px-2 py-0.5 text-[10px] font-semibold shrink-0 ${getProjectStatusClasses(
            project.status
          )}`}
        >
          {project.status}
        </span>
      </div>

      <div className="mb-3 h-px bg-zinc-300" />

      <p className="mb-4 text-xs leading-5 text-zinc-500 line-clamp-2">
        {project.description}
      </p>

      <div className="mb-4">
        <p className="text-xs font-semibold text-red-400">
          Deadline : {formatDate(project.endDate).toUpperCase()}
        </p>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex -space-x-2">
          {project.team.slice(0, 4).map((member, index) => (
            <div
              key={`${project.id}-${member}-${index}`}
              className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-white bg-amber-300 text-[10px] font-semibold text-zinc-800"
              title={member}
            >
              {member.slice(0, 2).toUpperCase()}
            </div>
          ))}

          {project.team.length > 4 && (
            <div className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-white bg-rose-100 text-[10px] font-semibold text-rose-500">
              +{project.team.length - 4}
            </div>
          )}
        </div>

        <div className="flex items-center gap-1 text-xs text-zinc-400">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-3.5 w-3.5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9 12h6m-6 4h6M7 4h10a2 2 0 012 2v12a2 2 0 01-2 2H7a2 2 0 01-2-2V6a2 2 0 012-2z"
            />
          </svg>
          <span>{project.tasks} issues</span>
        </div>
      </div>
    </button>
  )
}

export default function MilestonesPage() {

  const [selectedSprint, setSelectedSprint] = useState(sprints[1])
  const getSprintStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-50 border-green-200 text-green-700 hover:bg-green-100"
      case "in-progress":
        return "bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100"
      case "pending":
        return "bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100"
      default:
        return "bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100"
    }
  }

  return (
    <main className="min-h-screen w-full bg-white px-5 py-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-700">Milestones</h1>
        <p className="text-sm text-gray-500 mt-1">
          Track project progress and key deliverables across sprints
        </p>
      </div>

      {/* Grid with 2 rows */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* ROW 1: Main content cards */}
        {/* CARD 1: Progress Chart (Top Left) */}
        <Card className="col-span-1">
          <CardContent className="pt-4">
            <div className="mb-8">
              <h3 className="text-sm font-semibold text-gray-900">
                {selectedSprint.name}
              </h3>
              <p className="text-xs text-gray-500 mt-1">Sprint Progress</p>
            </div>

            <div className="w-full h-60">
              <SprintProgressChart sprint={selectedSprint} />
            </div>
          </CardContent>
        </Card>

        {/* CARD 2: Sprint Selector (Top Center) */}
        <div className="col-span-1 flex flex-col gap-3">
          <div className="text-sm font-semibold text-gray-900 pt-4">
            Select Sprint
          </div>
          {sprints.map((sprint) => (
            <button
              key={sprint.id}
              onClick={() => setSelectedSprint(sprint)}
              className={`
                w-full rounded-lg border-2 px-4 py-3 text-left transition-all
                ${
                  selectedSprint.id === sprint.id
                    ? "border-blue-500 bg-blue-50 shadow-sm"
                    : `border-gray-200 bg-white ${getSprintStatusColor(sprint.status)}`
                }
              `}
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">
                    {sprint.name}
                  </p>
                  <p className="text-xs text-gray-600 mt-0.5">
                    {sprint.progress}% complete
                  </p>
                </div>
                {sprint.status === "completed" && (
                  <Check className="h-4 w-4 shrink-0" />
                )}
              </div>
            </button>
          ))}
        </div>

        {/* CARD 3: Milestones Log (Top Right, spans 1 column) */}
        <Card className="col-span-1">
          <CardContent className="pt-4">
            <div className="mb-4">
              <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                <Flag className="h-4 w-4" />
                Milestone Timeline
              </h3>
              <p className="text-xs text-gray-500 mt-1">
                Key deliverables and achievements
              </p>
            </div>

            <div className="space-y-4 overflow-y-auto max-h-80">
              {milestones.map((milestone, index) => (
                <div key={milestone.id} className="relative">
                  {/* Timeline line */}
                  {index < milestones.length - 1 && (
                    <div className="absolute left-3 top-8 w-0.5 h-10 bg-gray-200" />
                  )}

                  {/* Timeline dot and content */}
                  <div className="flex gap-3">
                    <div className="flex flex-col items-center shrink-0 pt-1">
                      <div className="w-5 h-5 rounded-full bg-blue-500 border-3 border-white shadow-sm" />
                    </div>

                    <div className="flex-1 pb-1 min-w-0">
                      <div className="flex items-baseline justify-between gap-2 flex-wrap">
                        <p className="text-xs font-semibold text-gray-900 flex-1">
                          {milestone.description}
                        </p>
                        <span className="text-xs text-gray-500 shrink-0">
                          {new Date(milestone.date).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                          })}
                        </span>
                      </div>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {milestone.sprint}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* ROW 2: Projects Carousel */}
        <div className="col-span-1 md:col-span-3">
          <div className="mb-4">
            <h3 className="text-sm font-semibold text-gray-900">
              Related Projects
            </h3>
            <p className="text-xs text-gray-500 mt-1">
              Click to view project details
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 auto-rows-max">
            {initialProjects.map((project) => (
              <div key={project.id}>
                <ProjectCard project={project} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  )
}
