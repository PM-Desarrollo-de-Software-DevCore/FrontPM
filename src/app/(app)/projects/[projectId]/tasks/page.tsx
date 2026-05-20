"use client"

import { useEffect, useState } from "react"
import { DragDropContext } from "@hello-pangea/dnd"
import { useParams } from "next/navigation"

import SprintBoard from "@/components/sprints/SprintBoard"
import CreateSprintModal from "@/components/sprints/CreateSprintModal"
import CreateTaskModal from "@/components/tasks/CreateTaskModal"
import TaskDetailsModal from "@/components/tasks/TaskDetailsModal"

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

export default function TasksPage() {
  const params = useParams()
  const projectId = params.projectId as string

  const [resolvedProjectId, setResolvedProjectId] = useState("")
  const [tasks, setTasks] = useState<Task[]>([])
  const [sprints, setSprints] = useState<Sprint[]>([])
  const [users, setUsers] = useState<any[]>([])
  const [token, setToken] = useState("")
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isCreateSprintModalOpen, setIsCreateSprintModalOpen] = useState(false)

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

  useEffect(() => {
    const storedToken = localStorage.getItem("authToken")

    if (storedToken) {
      setToken(storedToken)
    }
  }, [])

  useEffect(() => {
    if (token && resolvedProjectId) {
      loadData()
    }
  }, [token, resolvedProjectId])

  const loadData = async () => {
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
      console.error(error)
    }
  }

  const handleDragEnd = async (result: any) => {
    if (!result.destination) return

    const taskId = result.draggableId
    const destination = result.destination.droppableId
    const [sprintId, status] = destination.split(":")

    const targetSprint = sprints.find((sprint) => sprint.id === sprintId)
    if (targetSprint?.status === "completed") {
      alert("Tasks cannot be moved into a completed sprint. Please move the task to an active sprint instead.")
      return
    }

    const updatedTasks = tasks.map((task) =>
      task.id === taskId
        ? {
            ...task,
            status,
            id_sprint: sprintId === "backlog" ? null : sprintId,
          }
        : task
    )

    setTasks(updatedTasks)

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
      console.error(error)
      loadData()
    }
  }

  const handleCreateTask = async (taskData: Partial<Task>) => {
    try {
      const cleanedTaskData = {
        title: taskData.title,
        description: taskData.description,
        priority: taskData.priority,
        status: taskData.status,
        progress: taskData.progress,
        end_date: taskData.end_date,
        ...(taskData.id_sprint ? { id_sprint: taskData.id_sprint } : {}),
        ...(taskData.assignedTo ? { assignedTo: taskData.assignedTo } : {}),
      }

      await createTask(resolvedProjectId, cleanedTaskData, token)
      setIsCreateModalOpen(false)
      loadData()
    } catch (error) {
      console.error(error)
    }
  }

  const handleCreateSprint = async (sprintData: Partial<Sprint>) => {
    try {
      await createSprint(resolvedProjectId, sprintData, token)
      setIsCreateSprintModalOpen(false)
      loadData()
    } catch (error) {
      console.error(error)
    }
  }

  const handleDeleteTask = async (taskId: string) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this task? This action cannot be undone."
    )

    if (!confirmed) return

    try {
      await deleteTask(taskId, token)
      setTasks(tasks.filter((task) => task.id !== taskId))
      setIsTaskModalOpen(false)
      setSelectedTask(null)
      alert("Task deleted successfully.")
    } catch (error) {
      console.error(error)
      alert("An error occurred while deleting the task.")
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

      setTasks(
        tasks.map((task) =>
          task.id === taskId ? { ...task, assignedTo: userId } : task
        )
      )
    } catch (error) {
      console.error(error)
    }
  }

  const handleUpdateSprint = async (sprintId: string, data: Partial<Sprint>) => {
    try {
      await updateSprint(sprintId, data, token)
      setSprints(
        sprints.map((sprint) =>
          sprint.id === sprintId ? { ...sprint, ...data } : sprint
        )
      )
    } catch (error) {
      console.error(error)
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
      setSprints(
        sprints.map((sprint) =>
          sprint.id === sprintId ? { ...sprint, status: "completed" } : sprint
        )
      )

      loadData()
    } catch (error) {
      console.error(error)
    }
  }

  const handleOpenTask = (task: Task) => {
    setSelectedTask(task)
    setIsTaskModalOpen(true)
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
          onCreateTaskAction={() => setIsCreateModalOpen(true)}
          onTaskMoveAction={handleDragEnd}
          onUpdateSprintAction={handleUpdateSprint}
          onCompleteSprintAction={handleCompleteSprint}
        />
      </DragDropContext>

      <CreateTaskModal
        open={isCreateModalOpen}
        projectId={resolvedProjectId}
        users={users}
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
            setIsTaskModalOpen(false)
            setSelectedTask(null)
          }}
          onDeleteAction={handleDeleteTask}
          onAssignAction={handleAssignUser}
        />
      )}
    </div>
  )
}
