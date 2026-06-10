"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { type DropResult } from "@hello-pangea/dnd"
import SummarizeIcon from "@mui/icons-material/Summarize"
import Tooltip from "@mui/material/Tooltip"
import { useParams, useSearchParams } from "next/navigation"
import Link from "next/link"

import CreateSprintModal from "@/components/sprints/CreateSprintModal"
import CreateTaskModal from "@/components/tasks/CreateTaskModal"
import ProjectReportModal from "@/components/tasks/ProjectReportModal"
import TaskDetailsModal from "@/components/tasks/TaskDetailsModal"
import dynamic from "next/dynamic"
// Code-splitting: el workspace de tareas arrastra @hello-pangea/dnd (~1.2MB).
// Se carga bajo demanda (no en el bundle inicial de la ruta) con un skeleton.
const TaskWorkspaceViews = dynamic(() => import("@/components/tasks/TaskWorkspaceViews"), {
  ssr: false,
  loading: () => <div className="min-h-[400px] w-full animate-pulse rounded-2xl bg-slate-100" />,
})
// Solo tipo (se borra en compilacion): no rompe el code-splitting del dynamic import.
import type { KanbanSortKey } from "@/components/tasks/TaskWorkspaceViews"

const KANBAN_SORT_OPTIONS: Array<{ value: KanbanSortKey; label: string }> = [
  { value: "priority", label: "Prioridad (alta → baja)" },
  { value: "date", label: "Fecha (próximas primero)" },
  { value: "sprint", label: "Sprint (más recientes primero)" },
]
import { useNotification } from "@/components/ui/notifications/NotificationProvider"
import { useConfirm } from "@/components/ui/confirm/ConfirmProvider"

import { getProjectById, getProjects } from "@/services/projectService"
import {
  createTask,
  deleteTask,
  getProjectTasks,
  updateTask,
} from "@/services/taskService"
import {
  createSprint,
  getProjectSprints,
  updateSprint,
} from "@/services/sprintService"
import { getProjectMembers } from "@/services/userService"

import { useProjectRole } from "@/hooks/useProjectRole"
import { slugify } from "@/lib/slug"
import { Sprint } from "@/types/sprint"
import { Task } from "@/types/task"

interface ProjectMember {
  id: string
  name: string
  lastname: string
}

interface CreateTaskContext {
  sprintId: string | null
  status: Task["status"]
}

export default function TasksPage() {
  const { notifyError, notifySuccess } = useNotification()
  const confirm = useConfirm()
  const params = useParams()
  const searchParams = useSearchParams()
  const projectId = params.projectId as string

  const [resolvedProjectId, setResolvedProjectId] = useState("")
  const { canManageSprints } = useProjectRole(resolvedProjectId || null)
  const [projectName, setProjectName] = useState("")
  const [projectStartDate, setProjectStartDate] = useState("")
  const [projectEndDate, setProjectEndDate] = useState("")
  const [tasks, setTasks] = useState<Task[]>([])
  const [sprints, setSprints] = useState<Sprint[]>([])
  const [users, setUsers] = useState<ProjectMember[]>([])
  const [token] = useState(() => {
    if (typeof window === "undefined") {
      return ""
    }

    return localStorage.getItem("authToken") || ""
  })
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [dismissedTaskQueryId, setDismissedTaskQueryId] = useState<string | null>(null)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isCreateSprintModalOpen, setIsCreateSprintModalOpen] = useState(false)
  const [isReportModalOpen, setIsReportModalOpen] = useState(false)
  const [createTaskContext, setCreateTaskContext] = useState<CreateTaskContext>({
    sprintId: null,
    status: "pending",
  })
  const [kanbanSort, setKanbanSort] = useState<KanbanSortKey>("priority")

  useEffect(() => {
    const resolveProject = async () => {
      if (!projectId) {
        setResolvedProjectId("")
        return
      }

      try {
        const projects = await getProjects()
        const project = projects.find(
          (item) => item.id === projectId || slugify(item.name) === projectId
        )

        const resolvedId = project?.id || projectId
        setProjectName(project?.name || "")
        setResolvedProjectId(resolvedId)

        try {
          const fullProject = await getProjectById(resolvedId)
          setProjectStartDate(fullProject.startDate || "")
          setProjectEndDate(fullProject.endDate || "")
        } catch {
          setProjectStartDate("")
          setProjectEndDate("")
        }
      } catch {
        setProjectName("")
        setResolvedProjectId(projectId)
        setProjectStartDate("")
        setProjectEndDate("")
      }
    }

    resolveProject()
  }, [projectId])

  const loadData = useCallback(async () => {
    if (!token || !resolvedProjectId) {
      return
    }

    try {
      const [taskData, sprintData, memberData] = await Promise.all([
        getProjectTasks(resolvedProjectId, token),
        getProjectSprints(resolvedProjectId, token),
        getProjectMembers(resolvedProjectId),
      ])

      setTasks(taskData)
      setSprints(sprintData)
      setUsers(memberData)
    } catch {
      notifyError("Data could not be loaded", "Please try again.")
    }
  }, [notifyError, resolvedProjectId, token])

  useEffect(() => {
    // Reusa loadData (mismo batch de tasks+sprints+members) en lugar de duplicar
    // la logica de fetch en el montaje. loadData ya valida token/resolvedProjectId.
    void loadData()
  }, [loadData])

  const requestedTaskId = searchParams.get("taskId")
  const requestedSprintId = searchParams.get("sprintId")

  const queryTask = useMemo(() => {
    if (!requestedTaskId || requestedTaskId === dismissedTaskQueryId) {
      return null
    }

    return tasks.find((task) => task.id === requestedTaskId) ?? null
  }, [dismissedTaskQueryId, requestedTaskId, tasks])

  const focusSprintId = useMemo(
    () => queryTask?.id_sprint || requestedSprintId || null,
    [queryTask?.id_sprint, requestedSprintId]
  )
  const activeModalTask = selectedTask ?? queryTask

  useEffect(() => {
    if (!resolvedProjectId || !focusSprintId) {
      return
    }

    const collapseKey = `tasks-collapsed:${resolvedProjectId || projectId}`

    try {
      const raw = localStorage.getItem(collapseKey)
      const parsed = raw ? (JSON.parse(raw) as Record<string, boolean>) : {}
      localStorage.setItem(collapseKey, JSON.stringify({ ...parsed, [focusSprintId]: true }))
    } catch {
      localStorage.setItem(collapseKey, JSON.stringify({ [focusSprintId]: true }))
    }
  }, [focusSprintId, projectId, resolvedProjectId])

  const handleDragEnd = async (result: DropResult) => {
    if (!result.destination) return

    const taskId = result.draggableId
    const destination = result.destination.droppableId
    const [scope, statusRaw] = destination.split(":")
    const draggedTask = tasks.find((task) => task.id === taskId) ?? null

    if (
      statusRaw !== "pending" &&
      statusRaw !== "in_progress" &&
      statusRaw !== "completed"
    ) {
      return
    }

    const status: Task["status"] = statusRaw
    const isGeneralBoard = scope === "general"
    const nextSprintId =
      isGeneralBoard
        ? draggedTask?.id_sprint ?? null
        : scope === "backlog"
          ? null
          : scope

    if (!isGeneralBoard && nextSprintId) {
      const targetSprint = sprints.find((sprint) => sprint.id === nextSprintId)
      if (targetSprint?.status === "finished") {
        notifyError(
          "Cannot move task",
          "Tasks cannot be moved into a finished sprint."
        )
        return
      }
    }

    setTasks((currentTasks) =>
      currentTasks.map((task) =>
        task.id === taskId
          ? {
              ...task,
              status,
              ...(isGeneralBoard ? {} : { id_sprint: nextSprintId }),
            }
          : task
      )
    )

    try {
      await updateTask(
        taskId,
        isGeneralBoard
          ? { status }
          : {
              status,
              id_sprint: nextSprintId,
            },
        token
      )
    } catch (error) {
      await loadData()
      notifyError(
        "Task could not be moved",
        error instanceof Error ? error.message : "Please try again."
      )
    }
  }

  const handleCreateTask = async (taskData: Partial<Task>) => {
    try {
      const trimmedTitle = (taskData.title || "").trim()
      if (!trimmedTitle) {
        notifyError("Task not created", "Task title is required.")
        return
      }

      const shouldCreateInBacklog = !taskData.assignedTo || !taskData.end_date

      const cleanedTaskData: Partial<Task> = {
        title: trimmedTitle,
        description: taskData.description,
        priority: taskData.priority,
        status: shouldCreateInBacklog ? "pending" : taskData.status,
        progress: taskData.progress ?? 0,
        ...(taskData.story_points != null ? { story_points: taskData.story_points } : {}),
        ...(taskData.end_date ? { end_date: taskData.end_date } : {}),
        ...(shouldCreateInBacklog ? { id_sprint: null } : {}),
        ...(!shouldCreateInBacklog && taskData.id_sprint ? { id_sprint: taskData.id_sprint } : {}),
        ...(taskData.assignedTo ? { assignedTo: taskData.assignedTo } : {}),
      }

      await createTask(resolvedProjectId, cleanedTaskData, token)
      setIsCreateModalOpen(false)
      await loadData()
      notifySuccess(
        "Task created",
        shouldCreateInBacklog
          ? "Created in backlog because it is missing assignment or due date."
          : "Task was created successfully."
      )
    } catch (error) {
      notifyError(
        "Task could not be created",
        error instanceof Error ? error.message : "Please try again."
      )
    }
  }

  const handleOpenCreateTask = (sprintId: string, status: Task["status"]) => {
    setCreateTaskContext({
      sprintId: sprintId === "backlog" ? null : sprintId,
      status,
    })
    setIsCreateModalOpen(true)
  }

  const handleOpenReport = () => {
    setIsReportModalOpen(true)
  }

  const handleCreateSprint = async (sprintData: Partial<Sprint>) => {
    try {
      await createSprint(resolvedProjectId, sprintData, token)
      setIsCreateSprintModalOpen(false)
      await loadData()
      notifySuccess("Sprint created", "The sprint was created successfully.")
    } catch (error) {
      notifyError(
        "Sprint could not be created",
        error instanceof Error ? error.message : "Please try again."
      )
    }
  }

  // Aplica un cambio de estado de sprint (optimista + backend). Reutilizado por
  // el control manual y por la derivacion automatica de estado.
  const applySprintStatus = useCallback(
    async (sprintId: string, status: string, options?: { silent?: boolean }) => {
      setSprints((current) =>
        current.map((sprint) =>
          sprint.id === sprintId ? { ...sprint, status } : sprint
        )
      )

      try {
        await updateSprint(sprintId, { status }, token)
        if (!options?.silent) {
          notifySuccess("Sprint updated", `The sprint status was set to "${status}".`)
        }
      } catch (error) {
        // Revertir si falla.
        await loadData()
        notifyError(
          "Sprint could not be updated",
          error instanceof Error ? error.message : "Please try again."
        )
      }
    },
    [loadData, notifyError, notifySuccess, token]
  )

  // Mueve al backlog (id_sprint = null) las tareas no completadas de un sprint.
  // Optimista + persistencia por tarea. Devuelve cuantas movio.
  const moveIncompleteTasksToBacklog = useCallback(
    async (sprintId: string) => {
      const incompleteTasks = tasks.filter(
        (task) => task.id_sprint === sprintId && task.status !== "completed"
      )
      if (incompleteTasks.length === 0) return 0

      setTasks((current) =>
        current.map((task) =>
          task.id_sprint === sprintId && task.status !== "completed"
            ? { ...task, id_sprint: null }
            : task
        )
      )

      try {
        await Promise.all(
          incompleteTasks.map((task) => updateTask(task.id, { id_sprint: null }, token))
        )
      } catch (error) {
        await loadData()
        notifyError(
          "Tasks could not be moved",
          error instanceof Error ? error.message : "Please try again."
        )
      }

      return incompleteTasks.length
    },
    [loadData, notifyError, tasks, token]
  )

  const handleChangeSprintStatus = async (sprintId: string, status: string) => {
    const targetSprint = sprints.find((sprint) => sprint.id === sprintId)
    if (!targetSprint || targetSprint.status === status) return

    // Al completar manualmente, las tareas no completadas pasan al backlog.
    if (status === "finished") {
      const incompleteCount = tasks.filter(
        (task) => task.id_sprint === sprintId && task.status !== "completed"
      ).length

      if (incompleteCount > 0) {
        const confirmed = await confirm({
          title: "Complete sprint",
          description: `This sprint has ${incompleteCount} unfinished task(s). Completing it will move them to the backlog. Continue?`,
          confirmLabel: "Complete sprint",
          tone: "danger",
        })
        if (!confirmed) return

        const moved = await moveIncompleteTasksToBacklog(sprintId)
        await applySprintStatus(sprintId, status)
        notifySuccess(
          "Sprint completed",
          `${moved} unfinished task(s) were moved to the backlog.`
        )
        return
      }
    }

    await applySprintStatus(sprintId, status)
  }

  // Deriva automaticamente el estado del sprint segun el porcentaje de tareas
  // completadas: 0% -> planned, parcial -> active, 100% -> finished. Solo aplica
  // a sprints con tareas (los vacios conservan su estado). El guard
  // `status !== derived` evita bucles de render.
  //
  // Solo se ejecuta para quien puede gestionar sprints: el backend rechaza el
  // cambio de estado a developers, y sin este guard el rechazo + loadData()
  // reintentaban en bucle mostrando alertas de permiso.
  useEffect(() => {
    if (!canManageSprints) return
    if (!sprints.length || !tasks.length) return

    sprints.forEach((sprint) => {
      const sprintTasks = tasks.filter((task) => task.id_sprint === sprint.id)
      if (sprintTasks.length === 0) return

      const completed = sprintTasks.filter((task) => task.status === "completed").length
      const derived =
        completed >= sprintTasks.length ? "finished" : completed > 0 ? "active" : "planned"

      if (sprint.status !== derived) {
        void applySprintStatus(sprint.id, derived, { silent: true })
      }
    })
  }, [tasks, sprints, applySprintStatus, canManageSprints])

  const handleDeleteTask = async (taskId: string) => {
    const confirmed = await confirm({
      title: "Delete task",
      description:
        "Are you sure you want to delete this task? This action cannot be undone.",
      confirmLabel: "Delete",
      tone: "danger",
    })

    if (!confirmed) return

    try {
      await deleteTask(taskId, token)
      setTasks((currentTasks) => currentTasks.filter((task) => task.id !== taskId))
      setSelectedTask(null)
      notifySuccess("Task deleted", "The task was removed successfully.")
    } catch (error) {
      notifyError(
        "Task could not be deleted",
        error instanceof Error ? error.message : "An unexpected error occurred."
      )
    }
  }

  // El modal aplica todos los cambios en una sola llamada a updateTask y luego
  // sincroniza el estado local (lista + tarea seleccionada) con este callback.
  const handleTaskUpdated = (taskId: string, changes: Partial<Task>) => {
    setTasks((prev) => prev.map((t) => (t.id === taskId ? { ...t, ...changes } : t)))
    setSelectedTask((prev) => (prev && prev.id === taskId ? { ...prev, ...changes } : prev))
    notifySuccess("Task updated", "Changes were saved successfully.")
  }
  const handleAssignUser = async (taskId: string, userId: string) => {
    try {
      await updateTask(
        taskId,
        {
          assignedTo: userId,
        },
        token
      )

      setTasks((currentTasks) =>
        currentTasks.map((task) =>
          task.id === taskId ? { ...task, assignedTo: userId } : task
        )
      )
      notifySuccess("Task updated", "The assignee was updated successfully.")
    } catch (error) {
      notifyError(
        "Task could not be updated",
        error instanceof Error ? error.message : "Please try again."
      )
      throw error
    }
  }

  const handleOpenTask = (task: Task) => {
    setSelectedTask(task)
  }

  return (
    <div className="p-8">
      <div className="mb-6 flex flex-col gap-4 rounded-[30px] border border-slate-200 bg-white p-5 shadow-sm lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-4xl font-bold text-slate-900">Task workspace</h1>
          <p className="mt-2 text-slate-500">Explora tareas en kanban, timeline, sprint board, tabla, calendario y roadmap.</p>
        </div>

        <div className="flex flex-col gap-3 self-start lg:items-end lg:self-auto">
          <select
            value={kanbanSort}
            onChange={(event) => setKanbanSort(event.target.value as KanbanSortKey)}
            aria-label="Filtrar tareas del kanban"
            className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2 text-xs font-semibold text-slate-600 outline-none transition hover:bg-slate-100"
          >
            {KANBAN_SORT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          <div className="flex flex-wrap items-center gap-3">
          <Link
            href={`/projects/${projectId}/finance`}
            className="rounded-2xl border border-slate-200 bg-white px-5 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:shadow-md"
          >
            Finanzas
          </Link>

          <Tooltip title="Generate Report" arrow placement="top">
            <span>
              <button
                type="button"
                onClick={handleOpenReport}
                disabled={!resolvedProjectId}
                aria-label="Generate Report"
                className="grid h-11 w-11 place-items-center rounded-full bg-slate-900 text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <SummarizeIcon className="h-5 w-5" />
              </button>
            </span>
          </Tooltip>

          <button
            type="button"
            onClick={() => setIsCreateModalOpen(true)}
            className="rounded-2xl border border-slate-200 bg-white px-5 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:shadow-md"
          >
            + Nueva tarea
          </button>

          <button
            type="button"
            onClick={() => setIsCreateSprintModalOpen(true)}
            className="rounded-2xl bg-blue-500 px-5 py-2 text-sm font-semibold text-white transition hover:bg-blue-600"
          >
            + Create Sprint
          </button>
          </div>
        </div>
      </div>

      <TaskWorkspaceViews
        projectName={projectName || projectId}
        projectStartDate={projectStartDate}
        projectEndDate={projectEndDate}
        tasks={tasks}
        sprints={sprints}
        users={users}
        onTaskClickAction={handleOpenTask}
        onCreateTaskAction={handleOpenCreateTask}
        onTaskMoveAction={handleDragEnd}
        onChangeSprintStatusAction={handleChangeSprintStatus}
        canManageSprints={canManageSprints}
        kanbanSort={kanbanSort}
      />

      <CreateTaskModal
        open={isCreateModalOpen}
        projectId={resolvedProjectId}
        users={users}
        initialSprintId={createTaskContext.sprintId}
        initialStatus={createTaskContext.status}
        onCloseAction={() => setIsCreateModalOpen(false)}
        onSubmitAction={handleCreateTask}
      />

      <CreateSprintModal
        open={isCreateSprintModalOpen}
        onCloseAction={() => setIsCreateSprintModalOpen(false)}
        onSubmitAction={handleCreateSprint}
      />

      <ProjectReportModal
        open={isReportModalOpen}
        projectId={resolvedProjectId}
        projectName={projectName || projectId}
        onCloseAction={() => setIsReportModalOpen(false)}
      />

      {activeModalTask && (
        <TaskDetailsModal
          key={activeModalTask.id}
          task={activeModalTask}
          users={users}
          onCloseAction={() => {
            if (queryTask && requestedTaskId) {
              setDismissedTaskQueryId(requestedTaskId)
            }

            setSelectedTask(null)
          }}
          onDeleteAction={handleDeleteTask}
          onTaskUpdatedAction={handleTaskUpdated}
        />
      )}
    </div>
  )
}
