"use client"

import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card/card"
import dynamic from "next/dynamic"
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
  getMilestonesOverview,
} from "@/services/milestonesService"

// Code-splitting: el doughnut (chart.js) se carga bajo demanda, fuera del bundle inicial de /milestones.
const SprintProgressChart = dynamic(() => import("@/components/ui/graphs/SprintProgressChart"), {
  ssr: false,
  loading: () => <div className="h-full w-full min-h-[160px] animate-pulse rounded-full bg-slate-100" />,
})

type FrontProjectStatus = "Planning" | "In Progress" | "Completed"
type FrontProjectPriority = "High" | "Medium" | "Low"
type FrontSprintStatus = "planned" | "active" | "finished"

interface MilestoneTeamMember {
  id: string
  label: string
  initials: string
  image?: string | null
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
      return "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400"
    case "In Progress":
      return "bg-blue-50 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400"
    case "Planning":
      return "bg-zinc-50 text-zinc-700 dark:bg-zinc-800/30 dark:text-zinc-300"
    default:
      return "bg-zinc-50 text-zinc-700 dark:bg-zinc-800/30 dark:text-zinc-300"
  }
}

function getProjectPriorityClasses(priority: FrontProjectPriority) {
  switch (priority) {
    case "High":
      return "bg-rose-50 text-rose-700 dark:bg-rose-950/30 dark:text-rose-400"
    case "Medium":
      return "bg-amber-50 text-amber-800 dark:bg-amber-950/30 dark:text-amber-300"
    case "Low":
      return "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400"
    default:
      return "bg-zinc-50 text-zinc-700 dark:bg-zinc-800/30 dark:text-zinc-300"
  }
}

function getSprintStatusClasses(status: FrontSprintStatus) {
  switch (status) {
    case "finished":
      return "bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-950/30 dark:border-emerald-800 dark:text-emerald-400 dark:hover:bg-emerald-950/50"
    case "active":
      return "bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100 dark:bg-blue-950/30 dark:border-blue-800 dark:text-blue-400 dark:hover:bg-blue-950/50"
    case "planned":
      return "bg-zinc-50 border-zinc-200 text-zinc-700 hover:bg-zinc-100 dark:bg-zinc-800/30 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800/50"
    default:
      return "bg-zinc-50 border-zinc-200 text-zinc-700 hover:bg-zinc-100 dark:bg-zinc-800/30 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800/50"
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
    image:
      user?.profileImageUrl ||
      user?.profilePhoto ||
      user?.image ||
      user?.avatarUrl ||
      null,
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

// SprintProgressChart se movió a components/ui/graphs/SprintProgressChart.tsx (lazy-loaded)

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
          : "border-border bg-card hover:border-blue-200 hover:shadow-md"
      }`}
    >
          <div className="mb-3 flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-lg font-bold text-strong">{project.name}</h3>
          <p className="mt-1 text-xs text-muted">Owner: {project.owner}</p>
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

      <p className="line-clamp-2 text-xs leading-5 text-muted">{project.description}</p>

      <div className="mt-4 flex items-center justify-between gap-3 text-xs text-muted">
        <span>{project.tasks} tasks</span>
        <span>{project.progress}% complete</span>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {project.teamMembers.slice(0, 4).map((member) => (
  <div
          key={member.id}
          title={member.label}
          className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full border-2 border-white bg-gray-100 text-xs font-semibold text-gray-700 shadow-sm cursor-pointer"
        >
          {member.image ? (
            <img
              src={member.image}
              alt={member.label}
              className="h-full w-full object-cover"
            />
          ) : (
            member.initials || "?"
          )}
        </div>
      ))}

        {project.teamMembers.length > 4 && (
          <span className="inline-flex h-7 min-w-[28px] items-center justify-center rounded-full border border-border bg-muted px-2 text-[10px] font-semibold text-muted-foreground">
            +{project.teamMembers.length - 4}
          </span>
        )}
      </div>

      <div className="mt-4 flex items-center justify-between gap-3 text-xs text-muted">
        <span>Deadline: {formatDate(project.endDate, "en-GB").toUpperCase()}</span>
        {isSelected && <span className="font-semibold text-primary">Active</span>}
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

        // 1 sola request agregada (antes: 3 + 2*N requests al backend remoto).
        const overview = await getMilestonesOverview()

        const usersById = new Map(overview.users.map((user) => [user.id, user]))
        const statsByProjectId = new Map(
          overview.projectStats.map((item) => [item.id_project, item])
        )

        // Agrupación en memoria de members y sprints por proyecto.
        const membersByProject = new Map<string, BackendProjectMember[]>()
        for (const member of overview.members) {
          const list = membersByProject.get(member.id_project)
          if (list) list.push(member)
          else membersByProject.set(member.id_project, [member])
        }

        const sprintsByProject = new Map<string, BackendSprint[]>()
        for (const sprint of overview.sprints) {
          const list = sprintsByProject.get(sprint.id_project)
          if (list) list.push(sprint)
          else sprintsByProject.set(sprint.id_project, [sprint])
        }

        const details = overview.projects.map((project) =>
          toProjectView(
            project,
            statsByProjectId.get(project.id_project),
            membersByProject.get(project.id_project) ?? [],
            usersById,
            sprintsByProject.get(project.id_project) ?? []
          )
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
    <main className="min-h-screen w-full bg-background px-5 py-6 text-foreground">
      <div className="mb-8 flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight text-strong">Milestones</h1>
        <p className="max-w-2xl text-sm text-muted">
          Selecciona un proyecto para cambiar la vista superior, la progresión del sprint y la línea de tiempo sin salir de la página.
        </p>
      </div>

      {isLoading && (
        <div
          className="grid grid-cols-1 gap-6 md:grid-cols-3"
          aria-busy="true"
          aria-label="Cargando milestones"
        >
          <div className="col-span-1 rounded-2xl border border-border bg-card p-6 shadow-sm">
            <div className="mb-6 h-4 w-1/2 animate-pulse rounded bg-muted" />
            <div className="h-60 w-full animate-pulse rounded-2xl bg-muted" />
            <div className="mt-5 grid grid-cols-2 gap-3">
              {Array.from({ length: 4 }).map((_, index) => (
                <div key={`stat-skeleton-${index}`} className="h-14 animate-pulse rounded-xl bg-muted" />
              ))}
            </div>
          </div>
          <div className="col-span-1 flex flex-col gap-3">
            <div className="h-4 w-1/3 animate-pulse rounded bg-muted" />
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={`sprint-skeleton-${index}`} className="h-16 w-full animate-pulse rounded-2xl bg-muted" />
            ))}
          </div>
          <div className="col-span-1 flex flex-col gap-3">
            <div className="h-4 w-1/3 animate-pulse rounded bg-muted" />
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={`project-skeleton-${index}`} className="h-24 w-full animate-pulse rounded-2xl bg-muted" />
            ))}
          </div>
        </div>
      )}

      {!isLoading && error && (
        <div className="rounded-2xl border border-red-500/50 bg-red-50/10 p-6 text-sm text-red-600 dark:bg-red-950/20 dark:border-red-900 dark:text-red-400 shadow-sm">
          {error}
        </div>
      )}

      {!isLoading && !error && selectedProject && (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <Card className="col-span-1 border-border bg-card shadow-sm">
            <CardContent className="pt-4">
              <div className="mb-6 flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <h3 className="truncate text-sm font-semibold text-strong">{selectedProject.name}</h3>
                  <p className="mt-1 text-xs text-muted">Sprint Progress</p>
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
                <div className="flex h-60 w-full items-center justify-center rounded-2xl border border-dashed border-border bg-card text-sm text-muted">
                  No sprint data available for this project yet.
                </div>
              )}

              <div className="mt-5 grid grid-cols-2 gap-3 text-xs">
                <div className="rounded-xl bg-muted p-3">
                  <p className="text-muted-foreground">Project progress</p>
                  <p className="mt-1 text-sm font-semibold text-strong">{selectedProject.progress}%</p>
                </div>
                <div className="rounded-xl bg-muted p-3">
                  <p className="text-muted-foreground">Tasks</p>
                  <p className="mt-1 text-sm font-semibold text-strong">{selectedProject.tasks}</p>
                </div>
                <div className="rounded-xl bg-muted p-3">
                  <p className="text-muted-foreground">Owner</p>
                  <p className="mt-1 line-clamp-1 text-sm font-semibold text-strong">{selectedProject.owner}</p>
                </div>
                <div className="rounded-xl bg-muted p-3">
                  <p className="text-muted-foreground">Deadline</p>
                  <p className="mt-1 text-sm font-semibold text-strong">{formatDate(selectedProject.endDate).toUpperCase()}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="col-span-1 flex flex-col gap-3">
            <div className="pt-1 text-sm font-semibold text-strong">Select Project Sprint</div>
            {selectedProject.sprints.length ? (
              selectedProject.sprints.map((sprint) => (
                <button
                  key={sprint.id}
                  type="button"
                  onClick={() => setSelectedSprintId(sprint.id)}
                  className={`w-full rounded-2xl border px-4 py-3 text-left transition-all ${
                    selectedSprint?.id === sprint.id
                      ? "border-primary bg-muted shadow-sm"
                      : getSprintStatusClasses(sprint.status)
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-strong">{sprint.name}</p>
                      <p className="mt-0.5 text-xs text-muted">{sprint.progress}% complete</p>
                    </div>

                    <div className="flex shrink-0 flex-col items-end gap-2">
                      <span className="rounded-full bg-card px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-muted">
                        {sprint.status}
                      </span>
                      {sprint.status === "finished" && <Check className="h-4 w-4 shrink-0" />}
                    </div>
                  </div>

                  <div className="mt-3 text-xs text-muted">
                    {formatShortDate(sprint.startDate)} - {formatShortDate(sprint.endDate)}
                  </div>
                </button>
              ))
            ) : (
              <div className="rounded-2xl border border-dashed border-border bg-card p-4 text-sm text-muted">
                Este proyecto todavía no tiene sprints cargados.
              </div>
            )}
          </div>

          <Card className="col-span-1 border-border bg-card shadow-sm">
            <CardContent className="pt-4">
              <div className="mb-4">
                <h3 className="flex items-center gap-2 text-sm font-semibold text-strong">
                  <Flag className="h-4 w-4" />
                  Milestone Timeline
                </h3>
                <p className="mt-1 text-xs text-muted">
                  Milestones generados desde los sprints del proyecto seleccionado
                </p>
              </div>

              <div className="max-h-80 space-y-4 overflow-y-auto pr-1">
                {selectedTimeline.length ? (
                  selectedTimeline.map((item, index) => (
                    <div key={item.id} className="relative">
                      {index < selectedTimeline.length - 1 && (
                        <div className="absolute left-3 top-8 h-10 w-0.5 bg-border" />
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
                            <p className="flex-1 text-xs font-semibold text-strong">{item.title}</p>
                            <span className="shrink-0 text-xs text-muted">{formatShortDate(item.date)}</span>
                          </div>

                          <p className="mt-0.5 text-xs text-muted">{item.description}</p>
                          <p className="mt-1 text-xs text-muted-foreground">{item.sprint}</p>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="rounded-2xl border border-dashed border-border bg-card p-4 text-sm text-muted">
                    Sin milestones para mostrar en este proyecto.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <div className="col-span-1 md:col-span-3">
            <div className="mb-4 flex items-end justify-between gap-3">
              <div>
                <h3 className="text-sm font-semibold text-strong">Related Projects</h3>
                <p className="mt-1 text-xs text-muted">Los botones funcionan como tabs y actualizan toda la vista superior.</p>
              </div>
              <div className="text-xs text-muted">
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
        <div className="rounded-2xl border border-border bg-card p-6 text-sm text-muted shadow-sm">
          No hay proyectos disponibles para mostrar.
        </div>
      )}
    </main>
  )
}
