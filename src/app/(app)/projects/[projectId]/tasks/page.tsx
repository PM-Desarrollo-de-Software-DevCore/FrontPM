"use client"

import { useCallback, useEffect, useState } from "react"
import { DragDropContext, type DropResult } from "@hello-pangea/dnd"
import { useParams } from "next/navigation"

import SprintBoard from "@/components/sprints/SprintBoard"
import CreateSprintModal from "@/components/sprints/CreateSprintModal"
import CreateTaskModal from "@/components/tasks/CreateTaskModal"
import TaskDetailsModal from "@/components/tasks/TaskDetailsModal"
import { useNotification } from "@/components/ui/notifications/NotificationProvider"

import { getProjects } from "@/services/projectService"
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
  const projectId = params.projectId as string

  const [resolvedProjectId, setResolvedProjectId] = useState("")
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
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isCreateSprintModalOpen, setIsCreateSprintModalOpen] = useState(false)
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

        setResolvedProjectId(project?.id || projectId)
      } catch (error) {
        console.error(error)
        setResolvedProjectId(projectId)
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
    } catch (error) {
      notifyError("Data could not be loaded", "Please try again.")
    }
  }, [notifyError, resolvedProjectId, token])

  useEffect(() => {
    void loadData()
  }, [loadData])

  const handleDragEnd = async (result: DropResult) => {
    if (!result.destination) return

    const taskId = result.draggableId
    const destination = result.destination.droppableId
    const [sprintId, statusRaw] = destination.split(":")

    if (
      statusRaw !== "pending" &&
      statusRaw !== "in_progress" &&
      statusRaw !== "completed"
    ) {
      return
    }

    const status: Task["status"] = statusRaw

    const targetSprint = sprints.find((sprint) => sprint.id === sprintId)
    if (targetSprint?.status === "completed") {
      notifyError(
        "Cannot move task",
        "Tasks cannot be moved into a completed sprint."
      )
      return
    }

    setTasks((currentTasks) =>
      currentTasks.map((task) =>
        task.id === taskId
          ? {
              ...task,
              status,
              id_sprint: sprintId === "backlog" ? null : sprintId,
            }
          : task
      )
    )

    try {
      await updateTask(
        taskId,
        {
          status,
          id_sprint: sprintId === "backlog" ? null : sprintId,
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
    }
  }

  const handleUpdateSprint = async (sprintId: string, data: Partial<Sprint>) => {
    try {
      await updateSprint(sprintId, data, token)
      setSprints((currentSprints) =>
        currentSprints.map((sprint) =>
          sprint.id === sprintId ? { ...sprint, ...data } : sprint
        )
      )
      notifySuccess("Sprint updated", "The sprint was updated successfully.")
    } catch (error) {
      notifyError(
        "Sprint could not be updated",
        error instanceof Error ? error.message : "Please try again."
      )
    }
  }

  const handleCompleteSprint = async (sprintId: string) => {
    const confirmed = window.confirm("Are you sure you want to complete this sprint?")
    if (!confirmed) return

    const sortedSprints = [...sprints].sort(
      (a, b) => new Date(a.start_date).getTime() - new Date(b.start_date).getTime()
    )
    const currentIndex = sortedSprints.findIndex((sprint) => sprint.id === sprintId)
    const nextSprint = sortedSprints[currentIndex + 1]
    const pendingTasks = tasks.filter(
      (task) => task.id_sprint === sprintId && task.status !== "completed"
    )

    try {
      if (nextSprint) {
        for (const task of pendingTasks) {
          await updateTask(task.id, { id_sprint: nextSprint.id }, token)
        }
      }

      await updateSprint(sprintId, { status: "completed" }, token)
      setSprints((currentSprints) =>
        currentSprints.map((sprint) =>
          sprint.id === sprintId ? { ...sprint, status: "completed" } : sprint
        )
      )

      await loadData()
      notifySuccess("Sprint completed", "The sprint was completed successfully.")
    } catch (error) {
      notifyError(
        "Sprint could not be completed",
        error instanceof Error ? error.message : "Please try again."
      )
    }
  }

  const handleOpenTask = (task: Task) => {
    setSelectedTask(task)
  }

  return (
    <div className="bg-[#fafafa] p-8">
      <div className="mb-6">
        <h1 className="text-4xl font-bold text-black">Scrum Board</h1>
        <p className="mt-2 text-gray-400">Manage project sprints and tasks</p>
        <div className="mt-5 flex gap-3">
          <button
            onClick={() => setIsCreateSprintModalOpen(true)}
            className="rounded-2xl bg-blue-500 px-5 py-2 text-sm font-semibold text-white transition hover:bg-blue-600"
          >
            + Create Sprint
          </button>
        </div>
      </div>

      <DragDropContext onDragEnd={handleDragEnd}>
        <SprintBoard
          sprints={sprints}
          tasks={tasks}
          users={users}
          onTaskClickAction={handleOpenTask}
          onCreateTaskAction={handleOpenCreateTask}
          onTaskMoveAction={handleDragEnd}
          onUpdateSprintAction={handleUpdateSprint}
          onCompleteSprintAction={handleCompleteSprint}
          collapseStorageKey={`tasks-collapsed:${resolvedProjectId || projectId}`}
        />
      </DragDropContext>

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

      {selectedTask && (
        <TaskDetailsModal
          task={selectedTask}
          projectId={resolvedProjectId}
          users={users}
          onCloseAction={() => {
            setSelectedTask(null)
          }}
          onDeleteAction={handleDeleteTask}
          onAssignAction={handleAssignUser}
        />
      )}
    </div>
  )
}
