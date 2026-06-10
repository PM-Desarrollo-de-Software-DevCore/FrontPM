/**
 * Mappers puros de milestones: transforman el `MilestonesOverview` del backend en
 * las vistas que pinta la página. Sin `'use client'` → se usan tanto en el Server
 * Component (page.tsx, prefetch SSR) como en el cliente (MilestonesClient, fallback).
 * Solo importa TIPOS de milestonesService, así que no arrastra `lib/auth`/localStorage.
 */
import type {
  BackendProject,
  BackendProjectMember,
  BackendProjectPriority,
  BackendProjectStatsItem,
  BackendProjectStatus,
  BackendSprint,
  BackendSprintStatus,
  BackendUser,
  MilestonesOverview,
} from "@/services/milestonesService"

export type FrontProjectStatus = "Planning" | "In Progress" | "Completed"
export type FrontProjectPriority = "High" | "Medium" | "Low"
export type FrontSprintStatus = "planned" | "active" | "finished"

export interface MilestoneTeamMember {
  id: string
  label: string
  initials: string
  image?: string | null
}

export interface MilestoneSprint {
  id: string
  name: string
  startDate: string
  endDate: string
  status: FrontSprintStatus
  progress: number
}

export interface MilestoneProjectView {
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

/** Construye las vistas de proyecto a partir del overview agregado del backend. */
export function buildMilestoneViews(overview: MilestonesOverview): MilestoneProjectView[] {
  const usersById = new Map(overview.users.map((user) => [user.id, user]))
  const statsByProjectId = new Map(overview.projectStats.map((item) => [item.id_project, item]))

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

  return overview.projects.map((project) =>
    toProjectView(
      project,
      statsByProjectId.get(project.id_project),
      membersByProject.get(project.id_project) ?? [],
      usersById,
      sprintsByProject.get(project.id_project) ?? []
    )
  )
}
