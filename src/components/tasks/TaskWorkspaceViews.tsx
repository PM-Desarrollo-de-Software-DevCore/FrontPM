"use client"

import { useMemo, useState } from "react"

import { DragDropContext, Droppable, Draggable, type DropResult } from "@hello-pangea/dnd"

import { useLanguage } from "@/components/i18n/LanguageProvider"
import { Sprint } from "@/types/sprint"
import { Task } from "@/types/task"

import TaskCard from "./TaskCard"

type TaskUser = {
  id: string
  name: string
  lastname: string
}

type ViewKey = "kanban" | "timeline" | "scrum" | "table" | "calendar" | "roadmap"

type Props = {
  projectName: string
  projectStartDate?: string
  projectEndDate?: string
  tasks: Task[]
  sprints: Sprint[]
  users: TaskUser[]
  onTaskMoveAction: (result: DropResult) => void
  onTaskClickAction: (task: Task) => void
  onCreateTaskAction: (sprintId: string, status: Task["status"]) => void
}

const viewTabs: Array<{ key: ViewKey; label: string; description: string }> = [
  { key: "kanban", label: "Kanban", description: "Vista general por estado" },
  { key: "timeline", label: "Timeline", description: "Gantt simplificado" },
  { key: "scrum", label: "Scrum board", description: "Lista por sprint" },
  { key: "table", label: "Table view", description: "Filtros y detalle" },
  { key: "calendar", label: "Calendar", description: "Mes actual navegable" },
  { key: "roadmap", label: "Roadmap", description: "Planificación y workload" },
]

const statusMeta: Record<Task["status"], { label: string; color: string }> = {
  pending: { label: "Pending", color: "bg-amber-400" },
  in_progress: { label: "In progress", color: "bg-sky-500" },
  completed: { label: "Completed", color: "bg-emerald-500" },
}

function formatDateLabel(value?: string | null) {
  if (!value) return "Sin fecha"
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return "Sin fecha"
  return date.toLocaleDateString("es-ES", { day: "2-digit", month: "short", year: "numeric" })
}

function formatCompactDate(value?: string | null) {
  if (!value) return "--"
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return "--"
  return date.toLocaleDateString("es-ES", { day: "2-digit", month: "2-digit" })
}

function startOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1)
}

function endOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0)
}

function addMonths(date: Date, amount: number) {
  return new Date(date.getFullYear(), date.getMonth() + amount, 1)
}

function startOfWeek(date: Date) {
  const copy = new Date(date)
  const day = copy.getDay()
  const diff = (day + 6) % 7
  copy.setDate(copy.getDate() - diff)
  copy.setHours(0, 0, 0, 0)
  return copy
}

function endOfWeek(date: Date) {
  const copy = startOfWeek(date)
  copy.setDate(copy.getDate() + 6)
  copy.setHours(23, 59, 59, 999)
  return copy
}

function safeDate(value?: string | null) {
  if (!value) return null
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? null : date
}

function getSprintLabel(task: Task, sprintsById: Map<string, Sprint>) {
  if (!task.id_sprint) return "Backlog"
  return sprintsById.get(task.id_sprint)?.name || "Sprint"
}

function getAssignee(task: Task, usersById: Map<string, TaskUser>) {
  if (!task.assignedTo) return null
  return usersById.get(task.assignedTo) || null
}

function getTaskTimelineRange(task: Task, sprintsById: Map<string, Sprint>) {
  const sprint = task.id_sprint ? sprintsById.get(task.id_sprint) : null
  const start = safeDate(task.createdAt) || safeDate(task.updatedAt) || safeDate(task.completedAt) || safeDate(sprint?.start_date) || new Date()
  const endCandidate = safeDate(task.completedAt) || safeDate(task.end_date) || safeDate(task.updatedAt) || start
  const end = endCandidate.getTime() < start.getTime() ? new Date(start.getTime() + 24 * 60 * 60 * 1000) : endCandidate

  return { start, end }
}

function buildCalendarDays(referenceDate: Date) {
  const monthStart = startOfMonth(referenceDate)
  const monthEnd = endOfMonth(referenceDate)
  const firstGridDay = startOfWeek(monthStart)
  const lastGridDay = endOfWeek(monthEnd)
  const days: Date[] = []
  const cursor = new Date(firstGridDay)

  while (cursor <= lastGridDay) {
    days.push(new Date(cursor))
    cursor.setDate(cursor.getDate() + 1)
  }

  return { monthStart, monthEnd, days }
}

function TaskKanbanView({
  tasks,
  usersById,
  sprintsById,
  onTaskMoveAction,
  onTaskClickAction,
  onCreateTaskAction,
}: {
  tasks: Task[]
  usersById: Map<string, TaskUser>
  sprintsById: Map<string, Sprint>
  onTaskMoveAction: (result: DropResult) => void
  onTaskClickAction: (task: Task) => void
  onCreateTaskAction: (sprintId: string, status: Task["status"]) => void
}) {
  const columns: Task["status"][] = ["pending", "in_progress", "completed"]

  return (
    <DragDropContext onDragEnd={onTaskMoveAction}>
      <div className="grid grid-cols-1 gap-5 xl:grid-cols-3">
        {columns.map((status) => {
          const statusTasks = tasks.filter((task) => task.status === status)

          return (
            <div key={status} className="rounded-[30px] border border-slate-200 bg-white p-5 shadow-sm">
              <div className="mb-5 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className={`h-3 w-3 rounded-full ${statusMeta[status].color}`} />
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900">{statusMeta[status].label}</h3>
                    <p className="text-xs text-slate-500">{statusTasks.length} tareas</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => onCreateTaskAction("backlog", status)}
                  className="rounded-full border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:bg-slate-50"
                >
                  + Nueva
                </button>
              </div>

              <Droppable droppableId={`general:${status}`}>
                {(provided) => (
                  <div ref={provided.innerRef} {...provided.droppableProps} className="min-h-80 space-y-4">
                    {statusTasks.map((task, index) => {
                      const assignedUser = getAssignee(task, usersById)

                      return (
                        <TaskCard
                          key={task.id}
                          task={task}
                          index={index}
                          contextLabel={getSprintLabel(task, sprintsById)}
                          assignedUser={assignedUser || undefined}
                          onClickAction={() => onTaskClickAction(task)}
                        />
                      )
                    })}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </div>
          )
        })}
      </div>
    </DragDropContext>
  )
}

function ScrumBoardView({
  tasks,
  sprints,
  usersById,
  onTaskClickAction,
  onTaskMoveAction,
}: {
  tasks: Task[]
  sprints: Sprint[]
  usersById: Map<string, TaskUser>
  onTaskClickAction: (task: Task) => void
  onTaskMoveAction: (result: DropResult) => void
}) {
  const orderedSprints = [...sprints].sort((left, right) => new Date(left.start_date).getTime() - new Date(right.start_date).getTime())
  const backlogTasks = tasks.filter((task) => !task.id_sprint)

  return (
    <DragDropContext onDragEnd={onTaskMoveAction}>
      <div className="space-y-4">
        <section className="rounded-[30px] border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <h3 className="text-lg font-semibold text-slate-900">Backlog</h3>
              <p className="text-sm text-slate-500">Tareas sin sprint asignado.</p>
            </div>
            <div className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-500">
              {backlogTasks.length} tareas
            </div>
          </div>

          <Droppable droppableId="backlog:pending">
            {(provided, snapshot) => (
              <div
                ref={provided.innerRef}
                {...provided.droppableProps}
                className={`min-h-20 space-y-3 rounded-2xl p-2 transition ${snapshot.isDraggingOver ? "bg-slate-100" : ""}`}
              >
                {backlogTasks.map((task, index) => {
                  const assignee = getAssignee(task, usersById)

                  return (
                    <Draggable key={task.id} draggableId={task.id} index={index}>
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          onClick={() => onTaskClickAction(task)}
                          className={`flex w-full items-center justify-between gap-4 rounded-3xl border border-slate-100 bg-slate-50 px-4 py-3 text-left transition cursor-move ${
                            snapshot.isDragging ? "shadow-lg bg-white border-slate-300" : "hover:border-slate-300 hover:bg-white"
                          }`}
                        >
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-semibold text-slate-900">{task.title}</p>
                            <p className="mt-1 text-xs text-slate-500">
                              {assignee ? `${assignee.name} ${assignee.lastname}` : "Sin asignar"} · {formatDateLabel(task.end_date)} · {task.status}
                            </p>
                          </div>
                          <div className="flex shrink-0 items-center gap-2 text-xs text-slate-500">
                            <span className="rounded-full bg-white px-3 py-1 font-semibold">{task.priority}</span>
                            <span className="rounded-full bg-white px-3 py-1 font-semibold">{task.story_points ?? 0} pts</span>
                          </div>
                        </div>
                      )}
                    </Draggable>
                  )
                })}
                {provided.placeholder}
                {backlogTasks.length === 0 && (
                  <p className="rounded-3xl border border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-sm text-slate-500">
                    No hay tareas en el backlog. Crea una nueva tarea para empezar.
                  </p>
                )}
              </div>
            )}
          </Droppable>
        </section>

        {orderedSprints.map((sprint) => {
          const sprintTasks = tasks.filter((task) => task.id_sprint === sprint.id)

          return (
            <section key={sprint.id} className="rounded-[30px] border border-slate-200 bg-white p-5 shadow-sm">
              <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-slate-900">{sprint.name}</h3>
                  <p className="text-sm text-slate-500">
                    {formatDateLabel(sprint.start_date)} - {formatDateLabel(sprint.end_date)}
                  </p>
                </div>

                <div className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-500">
                  {sprintTasks.length} tareas
                </div>
              </div>

              <Droppable droppableId={`${sprint.id}:pending`}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={`min-h-20 space-y-3 rounded-2xl p-2 transition ${snapshot.isDraggingOver ? "bg-slate-100" : ""}`}
                  >
                    {sprintTasks.length > 0 ? (
                      sprintTasks.map((task, index) => {
                        const assignee = getAssignee(task, usersById)

                        return (
                          <Draggable key={task.id} draggableId={task.id} index={index}>
                            {(provided, snapshot) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                onClick={() => onTaskClickAction(task)}
                                className={`flex w-full items-center justify-between gap-4 rounded-3xl border border-slate-100 bg-slate-50 px-4 py-3 text-left transition cursor-move ${
                                  snapshot.isDragging ? "shadow-lg bg-white border-slate-300" : "hover:border-slate-300 hover:bg-white"
                                }`}
                              >
                                <div className="min-w-0 flex-1">
                                  <p className="truncate text-sm font-semibold text-slate-900">{task.title}</p>
                                  <p className="mt-1 text-xs text-slate-500">
                                    {assignee ? `${assignee.name} ${assignee.lastname}` : "Sin asignar"} · {statusMeta[task.status].label} · {formatDateLabel(task.end_date)}
                                  </p>
                                </div>
                                <div className="flex shrink-0 items-center gap-2 text-xs text-slate-500">
                                  <span className="rounded-full bg-white px-3 py-1 font-semibold">{task.priority}</span>
                                  <span className="rounded-full bg-white px-3 py-1 font-semibold">{task.story_points ?? 0} pts</span>
                                </div>
                              </div>
                            )}
                          </Draggable>
                        )
                      })
                    ) : (
                      <p className="rounded-3xl border border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-sm text-slate-500">
                        No hay tareas en este sprint.
                      </p>
                    )}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </section>
          )
        })}
      </div>
    </DragDropContext>
  )
}

function TimelineView({
  tasks,
  sprints,
  usersById,
  projectStartDate,
  projectEndDate,
  onTaskClickAction,
}: {
  tasks: Task[]
  sprints: Sprint[]
  usersById: Map<string, TaskUser>
  projectStartDate?: string
  projectEndDate?: string
  onTaskClickAction: (task: Task) => void
}) {
  const timelineBounds = useMemo(() => {
    const dates = [
      safeDate(projectStartDate),
      safeDate(projectEndDate),
      ...sprints.flatMap((sprint) => [safeDate(sprint.start_date), safeDate(sprint.end_date)]),
      ...tasks.flatMap((task) => {
        const range = getTaskTimelineRange(task, new Map(sprints.map((sprint) => [sprint.id, sprint])))
        return [range.start, range.end]
      }),
    ].filter((value): value is Date => Boolean(value))

    if (dates.length === 0) {
      const today = new Date()
      return { start: startOfMonth(today), end: endOfMonth(addMonths(today, 1)) }
    }

    const start = new Date(Math.min(...dates.map((date) => date.getTime())))
    const end = new Date(Math.max(...dates.map((date) => date.getTime())))
    return { start, end }
  }, [projectEndDate, projectStartDate, sprints, tasks])

  const totalMs = Math.max(1, timelineBounds.end.getTime() - timelineBounds.start.getTime())
  const sprintsById = useMemo(() => new Map(sprints.map((sprint) => [sprint.id, sprint])), [sprints])
  const markers = useMemo(() => {
    const markerCount = 5
    return Array.from({ length: markerCount }, (_, index) => {
      const ratio = index / (markerCount - 1)
      const date = new Date(timelineBounds.start.getTime() + totalMs * ratio)
      return {
        left: `${ratio * 100}%`,
        label: date.toLocaleDateString("es-ES", { month: "short", day: "2-digit" }),
      }
    })
  }, [timelineBounds.start, totalMs])

  return (
    <section className="rounded-[30px] border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">Timeline</h3>
          <p className="text-sm text-slate-500">Vista tipo Gantt simplificada sin overflow horizontal.</p>
        </div>
        <div className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-500">
          {formatDateLabel(timelineBounds.start.toISOString())} - {formatDateLabel(timelineBounds.end.toISOString())}
        </div>
      </div>

      <div className="space-y-4">
        <div className="relative h-10 rounded-3xl border border-slate-100 bg-slate-50 px-4">
          {markers.map((marker) => (
            <div key={marker.left} className="absolute top-2 h-6 -translate-x-1/2 text-[11px] font-semibold text-slate-500" style={{ left: marker.left }}>
              <span className="block whitespace-nowrap rounded-full bg-white px-2 py-1 shadow-sm">{marker.label}</span>
            </div>
          ))}
        </div>

        {tasks
          .slice()
          .sort((left, right) => getTaskTimelineRange(left, sprintsById).start.getTime() - getTaskTimelineRange(right, sprintsById).start.getTime())
          .map((task) => {
            const range = getTaskTimelineRange(task, sprintsById)
            const startRatio = Math.max(0, Math.min(1, (range.start.getTime() - timelineBounds.start.getTime()) / totalMs))
            const endRatio = Math.max(startRatio + 0.02, Math.min(1, (range.end.getTime() - timelineBounds.start.getTime()) / totalMs))
            const sprintLabel = getSprintLabel(task, sprintsById)
            const assignee = getAssignee(task, usersById)

            return (
              <button
                key={task.id}
                type="button"
                onClick={() => onTaskClickAction(task)}
                className="grid gap-3 rounded-[28px] border border-slate-100 bg-slate-50 px-4 py-4 text-left transition hover:border-slate-300 hover:bg-white lg:grid-cols-[minmax(220px,280px)_minmax(0,1fr)]"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-slate-900">{task.title}</p>
                  <p className="mt-1 text-xs text-slate-500">
                    {sprintLabel} · {statusMeta[task.status].label} · {assignee ? `${assignee.name} ${assignee.lastname}` : task.assignedTo ? task.assignedTo : "Sin asignar"}
                  </p>
                </div>

                <div className="relative h-12 overflow-hidden rounded-3xl bg-white">
                  <div className="absolute inset-y-3 left-3 right-3 rounded-full bg-slate-100" />
                  <div
                    className="absolute inset-y-3 rounded-full bg-sky-500/70 shadow-sm"
                    style={{
                      left: `calc(12px + ${startRatio * 100}%)`,
                      width: `max(10px, calc(${(endRatio - startRatio) * 100}% - 24px))`,
                    }}
                  >
                    <div className="flex h-full items-center justify-between gap-3 px-3 text-[11px] font-semibold text-white">
                      <span className="truncate">{formatDateLabel(task.end_date)}</span>
                      <span>{task.progress}%</span>
                    </div>
                  </div>
                </div>
              </button>
            )
          })}
      </div>
    </section>
  )
}

function TableView({ tasks, sprintsById, usersById, onTaskClickAction }: { tasks: Task[]; sprintsById: Map<string, Sprint>; usersById: Map<string, TaskUser>; onTaskClickAction: (task: Task) => void }) {
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<"all" | Task["status"]>("all")
  const [priorityFilter, setPriorityFilter] = useState<"all" | Task["priority"]>("all")
  const [sprintFilter, setSprintFilter] = useState("all")
  const [assigneeFilter, setAssigneeFilter] = useState("all")

  const filteredTasks = useMemo(() => {
    const query = search.trim().toLowerCase()

    return tasks.filter((task) => {
      const sprintLabel = getSprintLabel(task, sprintsById)
      const assignee = task.assignedTo ? usersById.get(task.assignedTo) : null
      const searchable = [task.title, task.description, sprintLabel, assignee ? `${assignee.name} ${assignee.lastname}` : "", task.status, task.priority]
        .join(" ")
        .toLowerCase()

      if (query && !searchable.includes(query)) return false
      if (statusFilter !== "all" && task.status !== statusFilter) return false
      if (priorityFilter !== "all" && task.priority !== priorityFilter) return false
      if (sprintFilter !== "all" && sprintLabel !== sprintFilter) return false
      if (assigneeFilter !== "all" && task.assignedTo !== assigneeFilter) return false

      return true
    })
  }, [assigneeFilter, priorityFilter, search, sprintFilter, sprintsById, statusFilter, tasks, usersById])

  const sprintOptions = useMemo(() => {
    const labels = new Set<string>(["Backlog"])
    sprintsById.forEach((sprint) => labels.add(sprint.name))
    return [...labels]
  }, [sprintsById])

  return (
    <div className="rounded-[30px] border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">Table view</h3>
          <p className="text-sm text-slate-500">Filtra tareas por estado, sprint, responsable y prioridad.</p>
        </div>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-5">
          <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Buscar tarea" className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none" />
          <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value as typeof statusFilter)} className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none">
            <option value="all">Todos los estados</option>
            {(["pending", "in_progress", "completed"] as Task["status"][]).map((status) => (
              <option key={status} value={status}>{statusMeta[status].label}</option>
            ))}
          </select>
          <select value={priorityFilter} onChange={(event) => setPriorityFilter(event.target.value as typeof priorityFilter)} className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none">
            <option value="all">Todas las prioridades</option>
            {(["low", "medium", "high"] as Task["priority"][]).map((priority) => (
              <option key={priority} value={priority}>{priority}</option>
            ))}
          </select>
          <select value={sprintFilter} onChange={(event) => setSprintFilter(event.target.value)} className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none">
            {sprintOptions.map((label) => (
              <option key={label} value={label}>{label}</option>
            ))}
          </select>
          <select value={assigneeFilter} onChange={(event) => setAssigneeFilter(event.target.value)} className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none">
            <option value="all">Todos los responsables</option>
            {[...usersById.values()].map((user) => (
              <option key={user.id} value={user.id}>{user.name} {user.lastname}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full border-separate border-spacing-y-2">
          <thead>
            <tr className="text-left text-xs uppercase tracking-[0.14em] text-slate-400">
              <th className="px-3 py-2">#</th>
              <th className="px-3 py-2">Tarea</th>
              <th className="px-3 py-2">Sprint</th>
              <th className="px-3 py-2">Responsable</th>
              <th className="px-3 py-2">Estado</th>
              <th className="px-3 py-2">Prioridad</th>
              <th className="px-3 py-2">Fecha</th>
              <th className="px-3 py-2">Story points</th>
            </tr>
          </thead>
          <tbody>
            {filteredTasks.map((task) => {
              const assignee = getAssignee(task, usersById)

              return (
                <tr key={task.id} onClick={() => onTaskClickAction(task)} className="cursor-pointer rounded-2xl border border-slate-100 bg-slate-50 text-sm text-slate-700 hover:bg-white">
                  <td className="rounded-l-2xl px-3 py-4 font-semibold text-slate-400">{task.task_number ?? task.id.slice(0, 8)}</td>
                  <td className="px-3 py-4">
                    <div className="font-semibold text-slate-900">{task.title}</div>
                    <div className="text-xs text-slate-500">{task.description || "Sin descripción"}</div>
                  </td>
                  <td className="px-3 py-4">{getSprintLabel(task, sprintsById)}</td>
                  <td className="px-3 py-4">{assignee ? `${assignee.name} ${assignee.lastname}` : "Sin asignar"}</td>
                  <td className="px-3 py-4">{statusMeta[task.status].label}</td>
                  <td className="px-3 py-4">{task.priority}</td>
                  <td className="px-3 py-4">{formatCompactDate(task.end_date)}</td>
                  <td className="rounded-r-2xl px-3 py-4">{task.story_points ?? 0}</td>
                </tr>
              )
            })}
            {filteredTasks.length === 0 && (
              <tr>
                <td colSpan={8} className="rounded-2xl px-3 py-10 text-center text-sm text-slate-500">No hay tareas con esos filtros.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function CalendarView({ tasks, sprintsById, onTaskClickAction }: { tasks: Task[]; sprintsById: Map<string, Sprint>; onTaskClickAction: (task: Task) => void }) {
  const { language } = useLanguage()
  const [visibleMonth, setVisibleMonth] = useState(() => startOfMonth(new Date()))
  const { monthStart, days } = useMemo(() => buildCalendarDays(visibleMonth), [visibleMonth])
  const locale = language === "es" ? "es-ES" : "en-US"
  const weekdayLabels = language === "es"
    ? ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"]
    : ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]

  const tasksByDay = useMemo(() => {
    const map = new Map<string, Task[]>()

    tasks.forEach((task) => {
      const date = safeDate(task.end_date) || safeDate(task.completedAt)
      if (!date) return
      const key = date.toISOString().slice(0, 10)
      const list = map.get(key) || []
      list.push(task)
      map.set(key, list)
    })

    return map
  }, [tasks])

  return (
    <div className="rounded-[30px] border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">Calendar view</h3>
          <p className="text-sm text-slate-500">Mes actual navegable con las fechas de cierre de las tareas.</p>
        </div>
        <div className="flex items-center gap-2">
          <button type="button" onClick={() => setVisibleMonth((current) => startOfMonth(addMonths(current, -1)))} className="rounded-full border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-600">Anterior</button>
          <button type="button" onClick={() => setVisibleMonth(startOfMonth(new Date()))} className="rounded-full border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-600">Hoy</button>
          <button type="button" onClick={() => setVisibleMonth((current) => startOfMonth(addMonths(current, 1)))} className="rounded-full border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-600">Siguiente</button>
        </div>
      </div>

      <div className="mb-4 text-sm font-semibold text-slate-700">
        {visibleMonth.toLocaleDateString(locale, { month: "long", year: "numeric" })}
      </div>

      <div className="grid grid-cols-7 gap-2 text-center text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">
        {weekdayLabels.map((label) => <div key={label} className="py-2">{label}</div>)}
      </div>

      <div className="mt-2 grid grid-cols-7 gap-2">
        {days.map((day) => {
          const key = day.toISOString().slice(0, 10)
          const dayTasks = tasksByDay.get(key) || []
          const inMonth = day.getMonth() === monthStart.getMonth()
          const today = new Date()
          const isToday = day.toDateString() === today.toDateString()

          return (
            <div key={key} className={`min-h-32 rounded-3xl border p-3 ${inMonth ? "border-slate-200 bg-white" : "border-slate-100 bg-slate-50 text-slate-400"} ${isToday ? "ring-2 ring-sky-300" : ""}`}>
              <div className="flex items-center justify-between text-sm font-semibold">
                <span>{day.getDate()}</span>
                <span className="rounded-full bg-slate-100 px-2 py-1 text-[10px] uppercase tracking-[0.12em] text-slate-500">{dayTasks.length}</span>
              </div>

              <div className="mt-2 space-y-2">
                {dayTasks.slice(0, 3).map((task) => (
                  <button key={task.id} type="button" onClick={() => onTaskClickAction(task)} className="w-full rounded-2xl border border-slate-100 bg-slate-50 px-2 py-2 text-left text-xs shadow-sm transition hover:border-slate-300 hover:bg-white">
                    <p className="line-clamp-2 font-semibold text-slate-900">{task.title}</p>
                    <p className="mt-1 text-[11px] text-slate-500">{getSprintLabel(task, sprintsById)}</p>
                  </button>
                ))}
                {dayTasks.length > 3 && <p className="text-xs text-slate-400">+{dayTasks.length - 3} más</p>}
              </div>
            </div>
          )
        })}
      </div>

      <p className="mt-4 text-xs text-slate-400">Se muestran tareas con fecha de cierre o finalización dentro del mes seleccionado.</p>
    </div>
  )
}

function RoadmapView({
  projectName,
  projectStartDate,
  projectEndDate,
  tasks,
  sprints,
  usersById,
  onTaskClickAction,
}: {
  projectName: string
  projectStartDate?: string
  projectEndDate?: string
  tasks: Task[]
  sprints: Sprint[]
  usersById: Map<string, TaskUser>
  onTaskClickAction: (task: Task) => void
}) {
  const projectStart = useMemo(() => safeDate(projectStartDate) || new Date(), [projectStartDate])
  const projectEnd = useMemo(
    () => safeDate(projectEndDate) || new Date(projectStart.getTime() + 1000 * 60 * 60 * 24 * 90),
    [projectEndDate, projectStart]
  )
  const totalMs = Math.max(1, projectEnd.getTime() - projectStart.getTime())

  const workload = useMemo(() => {
    return [...usersById.values()]
      .map((user) => {
        const assigned = tasks.filter((task) => task.assignedTo === user.id)
        const storyPoints = assigned.reduce((sum, task) => sum + (task.story_points ?? 0), 0)
        return { user, assigned, storyPoints }
      })
      .sort((left, right) => right.storyPoints - left.storyPoints)
  }, [tasks, usersById])

  return (
    <div className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1.35fr)_minmax(320px,0.65fr)]">
      <div className="rounded-[30px] border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-slate-900">Roadmap de {projectName}</h3>
          <p className="text-sm text-slate-500">Sprints y entrega general a lo largo del calendario del proyecto.</p>
        </div>

        <div className="space-y-3">
          <div className="relative h-10 rounded-3xl border border-slate-100 bg-slate-50 px-4">
            {[0, 25, 50, 75, 100].map((percent) => {
              const date = new Date(projectStart.getTime() + totalMs * (percent / 100))
              return (
                <div key={percent} className="absolute top-2 -translate-x-1/2 text-[11px] font-semibold text-slate-500" style={{ left: `${percent}%` }}>
                  <span className="block whitespace-nowrap rounded-full bg-white px-2 py-1 shadow-sm">{date.toLocaleDateString("es-ES", { month: "short", day: "2-digit" })}</span>
                </div>
              )
            })}
          </div>

          {sprints.map((sprint) => {
            const sprintStart = safeDate(sprint.start_date) || projectStart
            const sprintEnd = safeDate(sprint.end_date) || sprintStart
            const sprintTasks = tasks.filter((task) => task.id_sprint === sprint.id)
            const completedCount = sprintTasks.filter((task) => task.status === "completed").length
            const progress = sprintTasks.length === 0 ? 0 : Math.round((completedCount / sprintTasks.length) * 100)
            const left = Math.max(0, ((sprintStart.getTime() - projectStart.getTime()) / totalMs) * 100)
            const width = Math.max(4, ((sprintEnd.getTime() - sprintStart.getTime()) / totalMs) * 100)

            return (
              <button
                key={sprint.id}
                type="button"
                onClick={() => sprintTasks[0] && onTaskClickAction(sprintTasks[0])}
                className="grid gap-3 rounded-[28px] border border-slate-100 bg-slate-50 px-4 py-4 text-left transition hover:border-slate-300 hover:bg-white lg:grid-cols-[minmax(220px,280px)_minmax(0,1fr)]"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-slate-900">{sprint.name}</p>
                  <p className="mt-1 text-xs text-slate-500">
                    {formatDateLabel(sprint.start_date)} - {formatDateLabel(sprint.end_date)} · {sprintTasks.length} tareas · {progress}%
                  </p>
                </div>

                <div className="relative h-14 overflow-hidden rounded-3xl bg-white">
                  <div className="absolute inset-y-4 left-4 right-4 rounded-full bg-slate-100" />
                  <div
                    className="absolute inset-y-4 rounded-full bg-slate-900 shadow-sm"
                    style={{
                      left: `calc(16px + ${left}%)`,
                      width: `max(18px, calc(${width}% - 32px))`,
                    }}
                  >
                    <div className="flex h-full items-center justify-between gap-3 px-3 text-[11px] font-semibold text-white">
                      <span className="truncate">{sprint.status || "planned"}</span>
                      <span>{progress}%</span>
                    </div>
                  </div>
                </div>
              </button>
            )
          })}
        </div>
      </div>

      <div className="rounded-[30px] border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-slate-900">Workload</h3>
          <p className="text-sm text-slate-500">Carga por responsable calculada con story points y tareas activas.</p>
        </div>

        <div className="space-y-3">
          {workload.map(({ user, assigned, storyPoints }) => (
            <div key={user.id} className="rounded-3xl border border-slate-100 bg-slate-50 p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-slate-900">{user.name} {user.lastname}</p>
                  <p className="text-xs text-slate-500">{assigned.length} tareas asignadas</p>
                </div>
                <div className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-600">{storyPoints} pts</div>
              </div>
              <div className="mt-3 h-2 overflow-hidden rounded-full bg-white">
                <div className="h-full rounded-full bg-sky-500" style={{ width: `${Math.min(100, storyPoints * 8)}%` }} />
              </div>
            </div>
          ))}
          {workload.length === 0 && <p className="text-sm text-slate-500">No hay miembros para calcular workload.</p>}
        </div>
      </div>
    </div>
  )
}

export default function TaskWorkspaceViews({
  projectName,
  projectStartDate,
  projectEndDate,
  tasks,
  sprints,
  users,
  onTaskMoveAction,
  onTaskClickAction,
  onCreateTaskAction,
}: Props) {
  const [activeView, setActiveView] = useState<ViewKey>("kanban")

  const usersById = useMemo(() => new Map(users.map((user) => [user.id, user])), [users])
  const sprintsById = useMemo(() => new Map(sprints.map((sprint) => [sprint.id, sprint])), [sprints])

  return (
    <div className="space-y-5">
      <div className="rounded-[30px] border border-slate-200 bg-white p-2 shadow-sm">
        <div className="grid grid-cols-1 gap-2 md:grid-cols-3 xl:grid-cols-6">
          {viewTabs.map((tab) => {
            const isActive = activeView === tab.key

            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveView(tab.key)}
                className={`rounded-[22px] px-4 py-3 text-left transition ${isActive ? "bg-slate-900 text-white" : "bg-slate-50 text-slate-600 hover:bg-slate-100"}`}
              >
                <div className="text-sm font-semibold">{tab.label}</div>
                <div className={`text-xs ${isActive ? "text-slate-300" : "text-slate-400"}`}>{tab.description}</div>
              </button>
            )
          })}
        </div>
      </div>

      {activeView === "kanban" && (
        <TaskKanbanView
          tasks={tasks}
          usersById={usersById}
          sprintsById={sprintsById}
          onTaskMoveAction={onTaskMoveAction}
          onTaskClickAction={onTaskClickAction}
          onCreateTaskAction={onCreateTaskAction}
        />
      )}

      {activeView === "timeline" && (
        <TimelineView
          tasks={tasks}
          sprints={sprints}
          usersById={usersById}
          projectStartDate={projectStartDate}
          projectEndDate={projectEndDate}
          onTaskClickAction={onTaskClickAction}
        />
      )}

      {activeView === "scrum" && (
        <ScrumBoardView tasks={tasks} sprints={sprints} usersById={usersById} onTaskClickAction={onTaskClickAction} onTaskMoveAction={onTaskMoveAction} />
      )}

      {activeView === "table" && <TableView tasks={tasks} sprintsById={sprintsById} usersById={usersById} onTaskClickAction={onTaskClickAction} />}

      {activeView === "calendar" && <CalendarView tasks={tasks} sprintsById={sprintsById} onTaskClickAction={onTaskClickAction} />}

      {activeView === "roadmap" && (
        <RoadmapView
          projectName={projectName}
          projectStartDate={projectStartDate}
          projectEndDate={projectEndDate}
          tasks={tasks}
          sprints={sprints}
          usersById={usersById}
          onTaskClickAction={onTaskClickAction}
        />
      )}
    </div>
  )
}