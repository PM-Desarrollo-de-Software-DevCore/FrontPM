"use client"

import { useEffect, useMemo, useState } from "react"
import { Card, CardContent } from "@/components/ui/card/card"
import HoursChart from "@/components/ui/graphs/hours_perTM"
import VelocityChart from "@/components/ui/graphs/velocity"
import FlowChart from "@/components/ui/graphs/flow"
import { CheckCircle2, CheckSquare, Filter, Users } from "lucide-react"
import FramedAvatar from "@/components/ui/avatar/FramedAvatar"
import { getProjects } from "@/services/projectService"
import { getProjectMembers, ProjectMember } from "@/services/memberService"
import { getUsersDirectory, UserDirectoryEntry } from "@/services/userService"
import { useDashboardStats } from "@/hooks/useDashboardStats"
import {
  getProjectWorklogTasks,
  getWeeklyProgress,
  getWeeklyVelocitySeries,
  WeeklyProgressData,
} from "@/services/worklogsService"
import type { Project } from "@/types/project"
import type { Task } from "@/types/task"

type MemberCard = ProjectMember & {
  id: string
  name: string
  lastname: string
  email: string
  profileImageUrl: string | null
}

const dayFormatter = new Intl.DateTimeFormat("es-ES", {
  weekday: "short",
  day: "2-digit",
  month: "short",
})

const monthFormatter = new Intl.DateTimeFormat("es-ES", {
  day: "2-digit",
  month: "short",
})

function formatDateLabel(value?: string | null) {
  if (!value) return "Sin fecha"

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return "Sin fecha"

  return dayFormatter.format(date)
}

function formatMonthLabel(value?: string | null) {
  if (!value) return ""

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ""

  return monthFormatter.format(date)
}

function formatMemberName(member: Pick<UserDirectoryEntry, "name" | "lastname" | "email">) {
  return `${member.name} ${member.lastname}`.trim() || member.email
}

export default function WorklogsPage() {
  const { data: dashboardStats, loading: dashboardLoading, error: dashboardError } = useDashboardStats()

  const [projects, setProjects] = useState<Project[]>([])
  const [selectedProjectId, setSelectedProjectId] = useState<string>("")
  const [projectsLoading, setProjectsLoading] = useState(true)
  const [projectsError, setProjectsError] = useState<string | null>(null)

  const [tasks, setTasks] = useState<Task[]>([])
  const [members, setMembers] = useState<MemberCard[]>([])
  const [weeklyProgress, setWeeklyProgress] = useState<WeeklyProgressData | null>(null)
  const [velocitySeries, setVelocitySeries] = useState<Array<{ label: string; value: number }>>([])
  const [detailsLoading, setDetailsLoading] = useState(true)
  const [detailsError, setDetailsError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    async function loadProjects() {
      try {
        setProjectsLoading(true)
        setProjectsError(null)

        const data = await getProjects()

        if (cancelled) return

        setProjects(data)
        if (data.length > 0) {
          setSelectedProjectId((current) => current || data[0].id)
        }
      } catch (err) {
        if (!cancelled) {
          setProjectsError(err instanceof Error ? err.message : "No se pudieron cargar los proyectos")
        }
      } finally {
        if (!cancelled) {
          setProjectsLoading(false)
        }
      }
    }

    loadProjects()

    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    if (!selectedProjectId) {
      setTasks([])
      setMembers([])
      setWeeklyProgress(null)
      setVelocitySeries([])
      setDetailsLoading(false)
      return
    }

    let cancelled = false

    async function loadProjectWorklogs() {
      try {
        setDetailsLoading(true)
        setDetailsError(null)

        const [projectTasks, projectMembers, directory, progress, velocity] = await Promise.all([
          getProjectWorklogTasks(selectedProjectId),
          getProjectMembers(selectedProjectId),
          getUsersDirectory(),
          getWeeklyProgress(selectedProjectId),
          getWeeklyVelocitySeries(selectedProjectId),
        ])

        if (cancelled) return

        const directoryById = new Map(directory.map((user) => [user.id, user]))

        setTasks(projectTasks)
        setWeeklyProgress(progress)
        setVelocitySeries(velocity)
        setMembers(
          projectMembers
            .map((member) => {
              const user = directoryById.get(member.userId)

              if (!user) return null

              return {
                id: user.id,
                userId: member.userId,
                role: member.role,
                name: user.name,
                lastname: user.lastname,
                email: user.email,
                profileImageUrl: user.profileImageUrl,
              }
            })
            .filter((member): member is MemberCard => Boolean(member))
        )
      } catch (err) {
        if (!cancelled) {
          setDetailsError(err instanceof Error ? err.message : "No se pudieron cargar los datos del proyecto")
          setTasks([])
          setMembers([])
          setWeeklyProgress(null)
          setVelocitySeries([])
        }
      } finally {
        if (!cancelled) {
          setDetailsLoading(false)
        }
      }
    }

    loadProjectWorklogs()

    return () => {
      cancelled = true
    }
  }, [selectedProjectId])

  const selectedProject = useMemo(
    () => projects.find((project) => project.id === selectedProjectId) ?? null,
    [projects, selectedProjectId]
  )

  const completedTasks = useMemo(
    () => tasks.filter((task) => task.status === "completed"),
    [tasks]
  )

  const assignedUserById = useMemo(() => {
    return new Map(members.map((member) => [member.userId, member]))
  }, [members])

  const summary = useMemo(() => {
    const totalTasks = tasks.length
    const completed = completedTasks.length
    const inProgress = tasks.filter((task) => task.status === "in_progress").length
    const pending = tasks.filter((task) => task.status === "pending").length
    const membersCount = members.length

    return {
      totalTasks,
      completed,
      inProgress,
      pending,
      membersCount,
      completionPercentage: totalTasks === 0 ? 0 : Math.round((completed / totalTasks) * 100),
      weeklyCompleted: weeklyProgress?.totalCompleted ?? 0,
    }
  }, [completedTasks.length, members.length, tasks, weeklyProgress?.totalCompleted])

  const completedByDay = weeklyProgress?.dailyCompletions ?? []
  const dailyLabels = completedByDay.map((entry) => formatDateLabel(entry.date))
  const dailyValues = completedByDay.map((entry) => entry.completed)

  const velocityLabels = velocitySeries.map((entry) => formatMonthLabel(entry.label))
  const velocityValues = velocitySeries.map((entry) => entry.value)

  const flowLabels = ["Completadas", "En progreso", "Pendientes"]
  const flowValues = [summary.completed, summary.inProgress, summary.pending]

  const recentCompletedTasks = useMemo(() => {
    return [...completedTasks]
      .sort((left, right) => {
        const leftDate = new Date(left.completedAt ?? left.updatedAt ?? left.createdAt ?? "").getTime()
        const rightDate = new Date(right.completedAt ?? right.updatedAt ?? right.createdAt ?? "").getTime()

        return rightDate - leftDate
      })
      .slice(0, 8)
  }, [completedTasks])

  const globalProjectComparison = useMemo(() => {
    const projectsByCompletion = [...(dashboardStats?.tasksByProject ?? [])].sort(
      (left, right) => right.completedTasks - left.completedTasks
    )

    return projectsByCompletion
  }, [dashboardStats?.tasksByProject])

  const globalComparisonLabels = globalProjectComparison.map((project) => project.name)
  const globalComparisonValues = globalProjectComparison.map((project) => project.completedTasks)
  const topProject = globalProjectComparison[0] ?? null

  return (
    <div className="w-full min-h-screen px-4 py-4 sm:px-6 lg:px-8 xl:px-10">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
        <div className="flex flex-col gap-4 rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm xl:flex-row xl:items-end xl:justify-between">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
              <Filter className="h-3.5 w-3.5" />
              Worklogs por proyecto
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">Worklogs</h1>
              <p className="text-sm text-slate-500">
                Revisa tareas completadas, flujo del proyecto y miembros activos.
              </p>
              {selectedProject && (
                <p className="mt-1 text-xs text-slate-400">
                  Proyecto activo: {selectedProject.name}
                </p>
              )}
            </div>
          </div>

          <div className="w-full max-w-md">
            <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
              Proyecto
            </label>
            <select
              value={selectedProjectId}
              onChange={(event) => setSelectedProjectId(event.target.value)}
              disabled={projectsLoading || projects.length === 0}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-slate-400"
            >
              {projects.length === 0 ? (
                <option value="">No hay proyectos disponibles</option>
              ) : (
                projects.map((project) => (
                  <option key={project.id} value={project.id}>
                    {project.name}
                  </option>
                ))
              )}
            </select>
          </div>
        </div>

        {projectsError && (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {projectsError}
          </div>
        )}

        {detailsError && (
          <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
            {detailsError}
          </div>
        )}

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          <Card className="border-slate-200">
            <CardContent className="px-5 pb-5 pt-8">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
                Completadas esta semana
              </p>
              <p className="mt-3 text-3xl font-bold text-slate-900">
                {detailsLoading ? "..." : summary.weeklyCompleted}
              </p>
              <p className="mt-1 text-sm text-slate-500">Según el rango semanal activo.</p>
            </CardContent>
          </Card>

          <Card className="border-slate-200">
            <CardContent className="px-5 pb-5 pt-8">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
                Tareas completadas
              </p>
              <p className="mt-3 text-3xl font-bold text-slate-900">
                {detailsLoading ? "..." : summary.completed}
              </p>
              <p className="mt-1 text-sm text-slate-500">Total de tareas cerradas en el proyecto.</p>
            </CardContent>
          </Card>

          <Card className="border-slate-200">
            <CardContent className="px-5 pb-5 pt-8">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
                Miembros
              </p>
              <p className="mt-3 text-3xl font-bold text-slate-900">
                {detailsLoading ? "..." : summary.membersCount}
              </p>
              <p className="mt-1 text-sm text-slate-500">Personas asignadas al proyecto.</p>
            </CardContent>
          </Card>

          <Card className="border-slate-200">
            <CardContent className="px-5 pb-5 pt-8">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
                Completitud
              </p>
              <p className="mt-3 text-3xl font-bold text-slate-900">
                {detailsLoading ? "..." : `${summary.completionPercentage}%`}
              </p>
              <p className="mt-1 text-sm text-slate-500">Porcentaje de tareas finalizadas.</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
          <Card className="w-full border-slate-200 xl:col-span-1">
            <CardContent className="p-5 sm:p-6">
              <div className="h-80 sm:h-90">
                <HoursChart
                  title="Tasks Completed"
                  description="Tareas completadas por día en el proyecto seleccionado"
                  labels={dailyLabels}
                  values={dailyValues}
                  valueSuffix=" tareas"
                  max={Math.max(5, ...(dailyValues.length ? dailyValues : [0]))}
                />
              </div>
            </CardContent>
          </Card>

          <Card className="w-full border-slate-200 xl:col-span-1">
            <CardContent className="p-5 sm:p-6">
              <div className="h-80 sm:h-90">
                <VelocityChart
                  title="Project Velocity"
                  description="Tareas completadas por semana"
                  labels={velocityLabels}
                  values={velocityValues}
                />
              </div>
            </CardContent>
          </Card>

          <Card className="w-full border-slate-200 xl:col-span-1">
            <CardContent className="p-5 sm:p-6">
              <div className="h-80 sm:h-90">
                <FlowChart
                  title="Task Flow"
                  description="Distribución por estado del proyecto"
                  labels={flowLabels}
                  values={flowValues}
                  colors={["#16a34a", "#0ea5e9", "#f59e0b"]}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
          <Card className="border-slate-200">
            <CardContent className="p-5 sm:p-6">
              <div className="mb-4 flex items-center justify-between gap-3">
                <div>
                  <h2 className="text-lg font-semibold text-slate-900">Miembros del proyecto</h2>
                  <p className="text-sm text-slate-500">Equipo asociado al proyecto seleccionado.</p>
                </div>
                <Users className="h-5 w-5 text-slate-400" />
              </div>

              <div className="flex flex-col gap-3">
                {detailsLoading ? (
                  <p className="text-sm text-slate-500">Cargando miembros...</p>
                ) : members.length > 0 ? (
                  members.map((member) => (
                    <div key={member.userId} className="flex items-center justify-between gap-3 rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3">
                      <div className="flex min-w-0 items-center gap-3">
                        <FramedAvatar
                          src={member.profileImageUrl ?? "/images/persona.png"}
                          alt={formatMemberName(member)}
                          size={42}
                          frameSize="large"
                        />
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-slate-900">
                            {member.name} {member.lastname}
                          </p>
                          <p className="truncate text-xs text-slate-500">{member.email}</p>
                        </div>
                      </div>

                      <span className="shrink-0 rounded-full bg-white px-3 py-1 text-xs font-medium text-slate-600">
                        {member.role.replace("_", " ")}
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-slate-500">No hay miembros asociados al proyecto.</p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-200">
            <CardContent className="p-5 sm:p-6">
              <div className="mb-4 flex items-center justify-between gap-3">
                <div>
                  <h2 className="text-lg font-semibold text-slate-900">Tareas completadas</h2>
                  <p className="text-sm text-slate-500">Últimas tareas cerradas del proyecto.</p>
                </div>
                <CheckCircle2 className="h-5 w-5 text-emerald-500" />
              </div>

              <div className="flex max-h-105 flex-col gap-3 overflow-y-auto pr-1">
                {detailsLoading ? (
                  <p className="text-sm text-slate-500">Cargando tareas...</p>
                ) : recentCompletedTasks.length > 0 ? (
                  recentCompletedTasks.map((task) => {
                    const assignee = task.assignedTo ? assignedUserById.get(task.assignedTo) : null

                    return (
                      <div key={task.id} className="rounded-2xl border border-slate-100 bg-white px-4 py-3 shadow-sm">
                        <div className="flex items-start gap-3">
                          <CheckSquare className="mt-0.5 h-5 w-5 shrink-0 text-blue-500" />
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-semibold text-slate-900">{task.title}</p>
                            <p className="mt-1 text-xs text-slate-500">
                              Asignada a: {assignee ? formatMemberName(assignee) : "Sin asignar"}
                            </p>
                            <p className="mt-1 text-xs text-slate-400">
                              Cerrada: {formatDateLabel(task.completedAt ?? task.updatedAt ?? task.createdAt ?? null)}
                            </p>
                          </div>
                        </div>
                      </div>
                    )
                  })
                ) : (
                  <p className="text-sm text-slate-500">Todavía no hay tareas completadas para este proyecto.</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="border-slate-200">
          <CardContent className="px-5 pb-5 pt-8 sm:px-6 sm:pb-6 sm:pt-10">
            <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
                  Vista global
                </p>
                <h2 className="mt-1 text-xl font-semibold text-slate-900">Comparativa entre proyectos</h2>
                <p className="text-sm text-slate-500">
                  {dashboardLoading
                    ? "Cargando datos globales..."
                    : "Compara la actividad de todos tus proyectos desde el mismo panel."}
                </p>
              </div>

              {topProject && (
                <div className="rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-600">
                  <p className="text-xs uppercase tracking-[0.16em] text-slate-400">Proyecto con más completadas</p>
                  <p className="mt-1 font-semibold text-slate-900">{topProject.name}</p>
                  <p>{topProject.completedTasks} tareas completadas</p>
                </div>
              )}
            </div>

            {dashboardError ? (
              <p className="text-sm text-amber-700">{dashboardError}</p>
            ) : (
              <div className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1.4fr)_minmax(320px,0.6fr)]">
                <div className="h-80 sm:h-90">
                  <HoursChart
                    title="Global project comparison"
                    description="Tareas completadas por proyecto en tu espacio de trabajo"
                    labels={globalComparisonLabels}
                    values={globalComparisonValues}
                    valueSuffix=" tareas"
                    max={Math.max(5, ...(globalComparisonValues.length ? globalComparisonValues : [0]))}
                  />
                </div>

                <div className="flex flex-col gap-3">
                  {(dashboardStats?.tasksByProject ?? []).length > 0 ? (
                    globalProjectComparison.slice(0, 5).map((project) => (
                      <div key={project.id_project} className="rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3">
                        <div className="flex items-center justify-between gap-3">
                          <div className="min-w-0">
                            <p className="truncate text-sm font-semibold text-slate-900">{project.name}</p>
                            <p className="text-xs text-slate-500">
                              {project.completedTasks}/{project.totalTasks} completadas
                            </p>
                          </div>
                          <span className="rounded-full bg-white px-3 py-1 text-xs font-medium text-slate-600">
                            {project.completionPercentage}%
                          </span>
                        </div>
                        <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-200">
                          <div
                            className="h-full rounded-full bg-sky-500"
                            style={{ width: `${project.completionPercentage}%` }}
                          />
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-slate-500">No hay proyectos para comparar todavía.</p>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}