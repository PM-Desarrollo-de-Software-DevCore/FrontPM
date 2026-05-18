"use client"

import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card/card"
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  ChartOptions,
  Plugin,
} from "chart.js"
import { Doughnut } from "react-chartjs-2"
import { Check, Flag } from "lucide-react"
import {
  type BackendProject,
  type BackendProjectMember,
  type BackendProjectPriority,
  type BackendProjectStatsItem,
  type BackendProjectStatus,
  type BackendSprint,
  type BackendSprintStatus,
  type BackendUser,
  getMilestoneProjects,
  getProjectMembers,
  getProjectSprints,
  getProjectsStats,
  getUsers,
} from "@/services/milestonesService"

ChartJS.register(ArcElement, Tooltip)

type FrontProjectStatus = "Planning" | "In Progress" | "Completed"
type FrontProjectPriority = "High" | "Medium" | "Low"
type FrontSprintStatus = "planned" | "active" | "finished"

interface MilestoneTeamMember {
  id: string
  label: string
  initials: string
}

interface MilestoneSprint {
  id: string
  name: string
  startDate: string
  endDate: string
  status: FrontSprintStatus
  progress: number
}

interface MilestoneProjectView {
  id: string
  name: string
  description: string
  status: FrontProjectStatus
  priority: FrontProjectPriority
  owner: string
  startDate: string
  endDate: string | null
  progress: number
  tasks: number
  teamMembers: MilestoneTeamMember[]
  sprints: MilestoneSprint[]
}

interface MilestoneTimelineItem {
  id: string
  date: string
  title: string
  description: string
  sprint: string
  kind: "start" | "end"
}

function mapProjectStatus(status: BackendProjectStatus): FrontProjectStatus {
  switch (status) {
    case "planning":
      return "Planning"
    case "in_progress":
      return "In Progress"
    case "completed":
      return "Completed"
    default:
      return "Planning"
  }
}

function mapProjectPriority(priority: BackendProjectPriority): FrontProjectPriority {
  switch (priority) {
    case "high":
      return "High"
    case "medium":
      return "Medium"
    case "low":
      return "Low"
    default:
      return "Medium"
  }
}

function mapSprintStatus(status: BackendSprintStatus): FrontSprintStatus {
  switch (status) {
    case "planned":
      return "planned"
    case "active":
      return "active"
    case "finished":
      return "finished"
    default:
      return "planned"
  }
}

function formatDate(date: string | null, locale = "en-GB") {
  if (!date) return "TBD"

  return new Date(date).toLocaleDateString(locale, {
    day: "2-digit",
    month: "short",
    year: "numeric",
  })
}

function formatShortDate(date: string) {
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  })
}

function formatRoleLabel(role: BackendProjectMember["role"]) {
  switch (role) {
    case "project_manager":
      return "Project Manager"
    case "scrum_master":
      return "Scrum Master"
    case "developer":
      return "Developer"
    default:
      return "Member"
  }
}

function getInitials(label: string) {
  return label
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("")
}

function getProjectStatusClasses(status: FrontProjectStatus) {
  switch (status) {
    case "Completed":
      return "bg-emerald-100 text-emerald-700"
    case "In Progress":
      return "bg-blue-100 text-blue-700"
    case "Planning":
      return "bg-zinc-100 text-zinc-700"
    default:
      return "bg-zinc-100 text-zinc-700"
  }
}

function getProjectPriorityClasses(priority: FrontProjectPriority) {
  switch (priority) {
    case "High":
      return "bg-rose-100 text-rose-700"
    case "Medium":
      return "bg-amber-100 text-amber-800"
    case "Low":
      return "bg-emerald-100 text-emerald-700"
    default:
      return "bg-zinc-100 text-zinc-700"
  }
}

function getSprintStatusClasses(status: FrontSprintStatus) {
  switch (status) {
    case "finished":
      return "bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100"
    case "active":
      return "bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100"
    case "planned":
      return "bg-zinc-50 border-zinc-200 text-zinc-700 hover:bg-zinc-100"
    default:
      return "bg-zinc-50 border-zinc-200 text-zinc-700 hover:bg-zinc-100"
  }
}

function calculateSprintProgress(sprint: MilestoneSprint) {
  if (sprint.status === "finished") return 100
  if (sprint.status === "planned") return 0

  const start = new Date(sprint.startDate).getTime()
  const end = new Date(sprint.endDate).getTime()
  const now = Date.now()

  if (!Number.isFinite(start) || !Number.isFinite(end) || end <= start) {
    return 0
  }

  if (now <= start) return 0
  if (now >= end) return 100

  const progress = ((now - start) / (end - start)) * 100
  return Math.max(0, Math.min(100, Math.round(progress)))
}

function buildTimelineItems(sprints: MilestoneSprint[]): MilestoneTimelineItem[] {
  return sprints
    .flatMap((sprint) => [
      {
        id: `${sprint.id}-start`,
        date: sprint.startDate,
        title: `${sprint.name} kickoff`,
        description: "Sprint window opened and execution started",
        sprint: sprint.name,
        kind: "start" as const,
      },
      {
        id: `${sprint.id}-end`,
        date: sprint.endDate,
        title: `${sprint.name} closure`,
        description:
          sprint.status === "finished"
            ? "Sprint delivered and closed"
            : "Target closing date for this sprint",
        sprint: sprint.name,
        kind: "end" as const,
      },
    ])
    .sort((left, right) => new Date(left.date).getTime() - new Date(right.date).getTime())
}

function toProjectView(
  project: BackendProject,
  stats: BackendProjectStatsItem | undefined,
  members: BackendProjectMember[],
  usersById: Map<string, BackendUser>,
  sprints: BackendSprint[]
): MilestoneProjectView {
  const ownerUser = usersById.get(project.createdBy)
  const owner = ownerUser ? `${ownerUser.name} ${ownerUser.lastname}`.trim() : `User ${project.createdBy.slice(0, 8)}`

  const teamMembers = members.map((member) => {
    const user = usersById.get(member.id_user)
    const label = user ? `${user.name} ${user.lastname}`.trim() : formatRoleLabel(member.role)

    return {
      id: member.id_mp,
      label,
      initials: getInitials(label),
    }
  })

  const sprintViews = sprints.map((sprint) => ({
    id: sprint.id_sprint,
    name: sprint.name,
    startDate: sprint.start_date,
    endDate: sprint.end_date,
    status: mapSprintStatus(sprint.status),
    progress: calculateSprintProgress({
      id: sprint.id_sprint,
      name: sprint.name,
      startDate: sprint.start_date,
      endDate: sprint.end_date,
      status: mapSprintStatus(sprint.status),
      progress: 0,
    }),
  }))

  return {
    id: project.id_project,
    name: project.name,
    description: project.description ?? "No description available.",
    status: mapProjectStatus(project.status),
    priority: mapProjectPriority(project.priority),
    owner,
    startDate: project.start_date,
    endDate: project.end_date,
    progress: stats?.completionPercentage ?? 0,
    tasks: stats?.totalTasks ?? 0,
    teamMembers,
    sprints: sprintViews,
  }
}

function SprintProgressChart({ sprint }: { sprint: MilestoneSprint }) {
  const data = {
    labels: ["Complete", "Remaining"],
    datasets: [
      {
        data: [sprint.progress, 100 - sprint.progress],
        backgroundColor: ["#2563eb", "#e5e7eb"],
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
          label(context) {
            return `${context.parsed}%`
          },
        },
      },
    },
  }

  const percentagePlugin: Plugin<"doughnut"> = {
    id: "textCenter",
    beforeDatasetsDraw(chart) {
      const { ctx, width, height } = chart
      ctx.save()

      ctx.font = "bold 28px Arial"
      ctx.textAlign = "center"
      ctx.textBaseline = "middle"
      ctx.fillStyle = "#0f172a"
      ctx.fillText(`${sprint.progress}%`, width / 2, height / 2)

      ctx.font = "14px Arial"
      ctx.fillStyle = "#64748b"
      ctx.fillText("Progress", width / 2, height / 2 + 25)

      ctx.restore()
    },
  }

  return <Doughnut data={data} options={options} plugins={[percentagePlugin]} />
}

function ProjectButton({
  project,
  isSelected,
  onSelect,
}: {
  project: MilestoneProjectView
  isSelected: boolean
  onSelect: () => void
}) {
  return (
    <button
      type="button"
      aria-pressed={isSelected}
      onClick={onSelect}
      className={`w-full rounded-2xl border p-4 text-left shadow-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
        isSelected
          ? "border-blue-500 bg-blue-50 shadow-md"
          : "border-zinc-200 bg-white hover:border-blue-200 hover:shadow-md"
      }`}
    >
      <div className="mb-3 flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-lg font-semibold text-zinc-900">{project.name}</h3>
          <p className="mt-1 text-xs text-zinc-500">Owner: {project.owner}</p>
        </div>

        <div className="flex shrink-0 flex-col items-end gap-1">
          <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${getProjectStatusClasses(project.status)}`}>
            {project.status}
          </span>
          <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${getProjectPriorityClasses(project.priority)}`}>
            {project.priority}
          </span>
        </div>
      </div>

      <p className="line-clamp-2 text-xs leading-5 text-zinc-500">{project.description}</p>

      <div className="mt-4 flex items-center justify-between gap-3 text-xs text-zinc-500">
        <span>{project.tasks} tasks</span>
        <span>{project.progress}% complete</span>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {project.teamMembers.slice(0, 4).map((member) => (
          <span
            key={member.id}
            title={member.label}
            className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-white bg-zinc-900 text-[10px] font-semibold text-white"
          >
            {member.initials || "?"}
          </span>
        ))}

        {project.teamMembers.length > 4 && (
          <span className="inline-flex h-7 min-w-7 items-center justify-center rounded-full border border-white bg-zinc-100 px-2 text-[10px] font-semibold text-zinc-600">
            +{project.teamMembers.length - 4}
          </span>
        )}
      </div>

      <div className="mt-4 flex items-center justify-between gap-3 text-xs text-zinc-400">
        <span>Deadline: {formatDate(project.endDate, "en-GB").toUpperCase()}</span>
        {isSelected && <span className="font-semibold text-blue-700">Active</span>}
      </div>
    </button>
  )
}

export default function MilestonesPage() {
  const [projects, setProjects] = useState<MilestoneProjectView[]>([])
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null)
  const [selectedSprintId, setSelectedSprintId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let isCancelled = false

    async function loadMilestoneData() {
      try {
        setIsLoading(true)
        setError(null)

        const [projectList, projectStats, users] = await Promise.all([
          getMilestoneProjects(),
          getProjectsStats(),
          getUsers(),
        ])

        const usersById = new Map(users.map((user) => [user.id, user]))
        const statsByProjectId = new Map(projectStats.map((item) => [item.id_project, item]))

        const details = await Promise.all(
          projectList.map(async (project) => {
            const [members, sprints] = await Promise.all([
              getProjectMembers(project.id_project),
              getProjectSprints(project.id_project),
            ])

            return toProjectView(
              project,
              statsByProjectId.get(project.id_project),
              members,
              usersById,
              sprints
            )
          })
        )

        if (isCancelled) return

        setProjects(details)
      } catch (loadError) {
        if (isCancelled) return

        setError(loadError instanceof Error ? loadError.message : "No se pudieron cargar los milestones")
      } finally {
        if (!isCancelled) {
          setIsLoading(false)
        }
      }
    }

    void loadMilestoneData()

    return () => {
      isCancelled = true
    }
  }, [])

  useEffect(() => {
    if (!projects.length) {
      setSelectedProjectId(null)
      setSelectedSprintId(null)
      return
    }

    setSelectedProjectId((currentProjectId) => {
      if (currentProjectId && projects.some((project) => project.id === currentProjectId)) {
        return currentProjectId
      }

      return projects[0]?.id ?? null
    })
  }, [projects])

  useEffect(() => {
    const selectedProject = projects.find((project) => project.id === selectedProjectId)

    if (!selectedProject) {
      setSelectedSprintId(null)
      return
    }

    if (!selectedProject.sprints.length) {
      setSelectedSprintId(null)
      return
    }

    setSelectedSprintId((currentSprintId) => {
      if (currentSprintId && selectedProject.sprints.some((sprint) => sprint.id === currentSprintId)) {
        return currentSprintId
      }

      return selectedProject.sprints.find((sprint) => sprint.status === "active")?.id
        ?? selectedProject.sprints[0]?.id
        ?? null
    })
  }, [projects, selectedProjectId])

  const selectedProject = projects.find((project) => project.id === selectedProjectId) ?? null
  const selectedSprint = selectedProject?.sprints.find((sprint) => sprint.id === selectedSprintId)
    ?? selectedProject?.sprints[0]
    ?? null
  const selectedTimeline = selectedProject ? buildTimelineItems(selectedProject.sprints) : []

  return (
    <main className="min-h-screen w-full bg-linear-to-br from-slate-50 via-white to-blue-50 px-5 py-6 text-slate-900">
      <div className="mb-8 flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Milestones</h1>
        <p className="max-w-2xl text-sm text-slate-500">
          Selecciona un proyecto para cambiar la vista superior, la progresión del sprint y la línea de tiempo sin salir de la página.
        </p>
      </div>

      {isLoading && (
        <div className="rounded-2xl border border-slate-200 bg-white/80 p-6 text-sm text-slate-500 shadow-sm">
          Loading milestone data from backend...
        </div>
      )}

      {!isLoading && error && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-sm text-rose-700 shadow-sm">
          {error}
        </div>
      )}

      {!isLoading && !error && selectedProject && (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <Card className="col-span-1 border-slate-200 bg-white/90 shadow-sm">
            <CardContent className="pt-4">
              <div className="mb-6 flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <h3 className="truncate text-sm font-semibold text-slate-900">{selectedProject.name}</h3>
                  <p className="mt-1 text-xs text-slate-500">Sprint Progress</p>
                </div>

                <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${getProjectStatusClasses(selectedProject.status)}`}>
                  {selectedProject.status}
                </span>
              </div>

              {selectedSprint ? (
                <div className="h-60 w-full">
                  <SprintProgressChart sprint={selectedSprint} />
                </div>
              ) : (
                <div className="flex h-60 w-full items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50 text-sm text-slate-500">
                  No sprint data available for this project yet.
                </div>
              )}

              <div className="mt-5 grid grid-cols-2 gap-3 text-xs">
                <div className="rounded-xl bg-slate-50 p-3">
                  <p className="text-slate-500">Project progress</p>
                  <p className="mt-1 text-sm font-semibold text-slate-900">{selectedProject.progress}%</p>
                </div>
                <div className="rounded-xl bg-slate-50 p-3">
                  <p className="text-slate-500">Tasks</p>
                  <p className="mt-1 text-sm font-semibold text-slate-900">{selectedProject.tasks}</p>
                </div>
                <div className="rounded-xl bg-slate-50 p-3">
                  <p className="text-slate-500">Owner</p>
                  <p className="mt-1 line-clamp-1 text-sm font-semibold text-slate-900">{selectedProject.owner}</p>
                </div>
                <div className="rounded-xl bg-slate-50 p-3">
                  <p className="text-slate-500">Deadline</p>
                  <p className="mt-1 text-sm font-semibold text-slate-900">{formatDate(selectedProject.endDate).toUpperCase()}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="col-span-1 flex flex-col gap-3">
            <div className="pt-1 text-sm font-semibold text-slate-900">Select Project Sprint</div>
            {selectedProject.sprints.length ? (
              selectedProject.sprints.map((sprint) => (
                <button
                  key={sprint.id}
                  type="button"
                  onClick={() => setSelectedSprintId(sprint.id)}
                  className={`w-full rounded-2xl border px-4 py-3 text-left transition-all ${
                    selectedSprint?.id === sprint.id
                      ? "border-blue-500 bg-blue-50 shadow-sm"
                      : getSprintStatusClasses(sprint.status)
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-slate-900">{sprint.name}</p>
                      <p className="mt-0.5 text-xs text-slate-600">{sprint.progress}% complete</p>
                    </div>

                    <div className="flex shrink-0 flex-col items-end gap-2">
                      <span className="rounded-full bg-white/80 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate-600">
                        {sprint.status}
                      </span>
                      {sprint.status === "finished" && <Check className="h-4 w-4 shrink-0" />}
                    </div>
                  </div>

                  <div className="mt-3 text-xs text-slate-500">
                    {formatShortDate(sprint.startDate)} - {formatShortDate(sprint.endDate)}
                  </div>
                </button>
              ))
            ) : (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-4 text-sm text-slate-500">
                Este proyecto todavía no tiene sprints cargados.
              </div>
            )}
          </div>

          <Card className="col-span-1 border-slate-200 bg-white/90 shadow-sm">
            <CardContent className="pt-4">
              <div className="mb-4">
                <h3 className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                  <Flag className="h-4 w-4" />
                  Milestone Timeline
                </h3>
                <p className="mt-1 text-xs text-slate-500">
                  Milestones generados desde los sprints del proyecto seleccionado
                </p>
              </div>

              <div className="max-h-80 space-y-4 overflow-y-auto pr-1">
                {selectedTimeline.length ? (
                  selectedTimeline.map((item, index) => (
                    <div key={item.id} className="relative">
                      {index < selectedTimeline.length - 1 && (
                        <div className="absolute left-3 top-8 h-10 w-0.5 bg-slate-200" />
                      )}

                      <div className="flex gap-3">
                        <div className="flex shrink-0 flex-col items-center pt-1">
                          <div
                            className={`h-5 w-5 rounded-full border-2 border-white shadow-sm ${
                              item.kind === "start" ? "bg-blue-500" : "bg-emerald-500"
                            }`}
                          />
                        </div>

                        <div className="min-w-0 flex-1 pb-1">
                          <div className="flex flex-wrap items-baseline justify-between gap-2">
                            <p className="flex-1 text-xs font-semibold text-slate-900">{item.title}</p>
                            <span className="shrink-0 text-xs text-slate-500">{formatShortDate(item.date)}</span>
                          </div>

                          <p className="mt-0.5 text-xs text-slate-500">{item.description}</p>
                          <p className="mt-1 text-xs text-slate-400">{item.sprint}</p>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-slate-500">
                    Sin milestones para mostrar en este proyecto.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <div className="col-span-1 md:col-span-3">
            <div className="mb-4 flex items-end justify-between gap-3">
              <div>
                <h3 className="text-sm font-semibold text-slate-900">Related Projects</h3>
                <p className="mt-1 text-xs text-slate-500">Los botones funcionan como tabs y actualizan toda la vista superior.</p>
              </div>
              <div className="text-xs text-slate-500">
                {projects.length} projects loaded from backend
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
              {projects.map((project) => (
                <ProjectButton
                  key={project.id}
                  project={project}
                  isSelected={selectedProject.id === project.id}
                  onSelect={() => setSelectedProjectId(project.id)}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {!isLoading && !error && !selectedProject && (
        <div className="rounded-2xl border border-slate-200 bg-white/80 p-6 text-sm text-slate-500 shadow-sm">
          No hay proyectos disponibles para mostrar.
        </div>
      )}
    </main>
  )
}
