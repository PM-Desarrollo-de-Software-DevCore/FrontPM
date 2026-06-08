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
import { useNotification } from "@/components/ui/notifications/NotificationProvider"

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
} from "@/services/sprintService"
import { getProjectMembers } from "@/services/userService"

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
  const params = useParams()
  const searchParams = useSearchParams()
  const projectId = params.projectId as string

  const [resolvedProjectId, setResolvedProjectId] = useState("")
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
      if (targetSprint?.status === "completed") {
        notifyError(
          "Cannot move task",
          "Tasks cannot be moved into a completed sprint."
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

  const handleDeleteTask = async (taskId: string) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this task? This action cannot be undone."
    )

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

        <div className="flex flex-wrap items-center gap-3 self-start lg:self-auto">
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
          onAssignAction={handleAssignUser}
        />
      )}
    </div>
  )
}
