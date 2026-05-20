

"use client"

import {
  useEffect,
  useState,
} from "react"

import {
  DragDropContext,
} from "@hello-pangea/dnd"

import {
  useParams,
} from "next/navigation"

import SprintBoard from "@/components/sprints/SprintBoard"
import CreateSprintModal from "@/components/sprints/CreateSprintModal"
import CreateTaskModal from "@/components/tasks/CreateTaskModal"

import TaskDetailsModal from "@/components/tasks/TaskDetailsModal"

import {
  getProjectTasks,
  createTask,
  updateTask,
  deleteTask,
} from "@/services/taskService"

import {
  getProjectSprints,
  updateSprint,
  createSprint,
} from "@/services/sprintService"

import {
  getProjectMembers,
} from "@/services/userService"

import {
  Sprint,
} from "@/types/sprint"

import {
  Task,
  TaskStatus,
} from "@/types/task"

export default function TasksPage() {

  const params =
    useParams()

  const projectId =
    params.projectId as string

  const [
    tasks,
    setTasks,
  ] = useState<Task[]>(
    []
  )

  const [
    sprints,
    setSprints,
  ] = useState<Sprint[]>(
    []
  )

  const [
    users,
    setUsers,
  ] = useState<any[]>(
    []
  )

  const [
    token,
    setToken,
  ] = useState("")

  const [
    selectedTask,
    setSelectedTask,
  ] = useState<Task | null>(
    null
  )

  const [
    isTaskModalOpen,
    setIsTaskModalOpen,
  ] = useState(false)

  const [
    isCreateModalOpen,
    setIsCreateModalOpen,
  ] = useState(false)
  
  const [
  isCreateSprintModalOpen,
  setIsCreateSprintModalOpen,
] = useState(false)

  useEffect(() => {

    const storedToken =
      localStorage.getItem(
        "authToken"
      )

    if (storedToken) {
      setToken(
        storedToken
      )
    }

  }, [])

  useEffect(() => {

    if (
      token &&
      projectId
    ) {
      loadData()
    }

  }, [
    token,
    projectId,
  ])

  const loadData =
    async () => {

      try {

        const [
          taskData,
          sprintData,
          memberData,
        ] = await Promise.all(
          [
            getProjectTasks(
              projectId,
              token
            ),

            getProjectSprints(
              projectId,
              token
            ),

            getProjectMembers(
              projectId
            ),
          ]
        )

        setTasks(
          taskData
        )

        setSprints(
          sprintData
        )

        setUsers(
          memberData
        )

      } catch (error) {
        console.error(
          error
        )
      }
    }

  const handleDragEnd =
  async (
    result: any
  ) => {

    if (
      !result.destination
    )
      return

    const taskId =
      result.draggableId

    const destination =
      result.destination
        .droppableId

    // sprintId:status

    const [
      sprintId,
      status,
    ] =
      destination.split(
        ":"
      )

    // FIND TARGET SPRINT

    const targetSprint =
      sprints.find(
        (sprint) =>
          sprint.id ===
          sprintId
      )

    // BLOCK COMPLETED SPRINTS

    if (
      targetSprint?.status ===
      "completed"
    ) {

      alert(
        "Tasks cannot be moved into a completed sprint. Please move the task to an active sprint instead."
      )

      return
    }

    // UPDATE LOCAL STATE

    const updatedTasks =
      tasks.map(
        (task) =>
          task.id ===
          taskId
            ? {
                ...task,

                status,

                id_sprint:
                  sprintId ===
                  "backlog"
                    ? null
                    : sprintId,
              }
            : task
      )

    setTasks(
      updatedTasks
    )

    try {

      await updateTask(
        taskId,
        {
          status,

          id_sprint:
            sprintId ===
            "backlog"
              ? null
              : sprintId,
        },
        token
      )

    } catch (error) {

      console.error(
        error
      )

      loadData()
    }
  }

  const handleCreateTask =
  async (
    taskData: Partial<Task>
  ) => {

    try {

      const cleanedTaskData = {

        title:
          taskData.title,

        description:
          taskData.description,

        priority:
          taskData.priority,

        status:
          taskData.status,

        progress:
          taskData.progress,

        end_date:
          taskData.end_date,

        // ONLY SEND VALID GUID

        ...(taskData.id_sprint
          ? {
              id_sprint:
                taskData.id_sprint,
            }
          : {}),

        ...(taskData.assignedTo
          ? {
              assignedTo:
                taskData.assignedTo,
            }
          : {}),
      }

      console.log(
        "CREATE TASK BODY:",
        cleanedTaskData
      )

      await createTask(
        projectId,
        cleanedTaskData,
        token
      )

      setIsCreateModalOpen(
        false
      )

      loadData()

    } catch (error) {

      console.error(
        error
      )
    }
  }

const handleCreateSprint =
  async (
    sprintData: Partial<Sprint>
  ) => {

    try {

      await createSprint(
        projectId,
        sprintData,
        token
      )

      setIsCreateSprintModalOpen(
        false
      )

      loadData()

    } catch (error) {

      console.error(
        error
      )
    }
  }

const handleDeleteTask =
  async (
    taskId: string
  ) => {

    const confirmed =
      window.confirm(
        "Are you sure you want to delete this task? This action cannot be undone."
      )

    if (!confirmed)
      return

    try {

      await deleteTask(
        taskId,
        token
      )

      setTasks(
        tasks.filter(
          (task) =>
            task.id !==
            taskId
        )
      )

      setIsTaskModalOpen(
        false
      )

      setSelectedTask(
        null
      )

      alert(
        "Task deleted successfully."
      )

    } catch (error) {

      console.error(
        error
      )

      alert(
        "An error occurred while deleting the task."
      )
    }
  }

const handleAssignUser =
  async (
    taskId: string,
    userId: string
  ) => {

    try {

      await updateTask(
        taskId,
        {
          assignedTo:
            userId,
        },
        token
      )

      setTasks(
        tasks.map(
          (task) =>
            task.id ===
            taskId
              ? {
                  ...task,
                  assignedTo:
                    userId,
                }
              : task
        )
      )

    } catch (error) {

      console.error(
        error
      )
    }
  }

const handleUpdateSprint =
  async (
    sprintId: string,
    data: Partial<Sprint>
  ) => {

    try {

      await updateSprint(
        sprintId,
        data,
        token
      )

      setSprints(
        sprints.map(
          (sprint) =>
            sprint.id ===
            sprintId
              ? {
                  ...sprint,
                  ...data,
                }
              : sprint
        )
      )

    } catch (error) {

      console.error(
        error
      )
    }
  }

const handleCompleteSprint =
  async (
    sprintId: string
  ) => {

    const confirmed =
      window.confirm(
        "Are you sure you want to complete this sprint?"
      )

    if (!confirmed)
      return

    const sortedSprints =
      [...sprints].sort(
        (a, b) =>
          new Date(
            a.start_date
          ).getTime() -
          new Date(
            b.start_date
          ).getTime()
      )

    const currentIndex =
      sortedSprints.findIndex(
        (s) =>
          s.id ===
          sprintId
      )

    const nextSprint =
      sortedSprints[
        currentIndex + 1
      ]

    const pendingTasks =
      tasks.filter(
        (task) =>
          task.id_sprint ===
            sprintId &&
          task.status !==
            "completed"
      )

    try {

      if (nextSprint) {

        for (const task of pendingTasks) {

          await updateTask(
            task.id,
            {
              id_sprint:
                nextSprint.id,
            },
            token
          )
        }
      }

      await updateSprint(
        sprintId,
        {
          status: "completed",
        },
        token
      )

      setSprints(
        sprints.map(
          (sprint) =>
            sprint.id ===
            sprintId
              ? {
                  ...sprint,
                  status: "completed",
                }
              : sprint
        )
      )

      loadData()

    } catch (error) {

      console.error(
        error
      )
    }
  }

const handleOpenTask =
  (task: Task) => {

    setSelectedTask(
      task
    )

    setIsTaskModalOpen(
      true
    )
  }

return (
  <div className="bg-[#fafafa] p-8">

    {/* HEADER */}

    <div className="mb-6">

      <h1 className="text-4xl font-bold text-black">
        Scrum Board
      </h1>

      <p className="mt-2 text-gray-400">
        Manage project
        sprints and tasks
      </p>
      <div className="mt-5 flex gap-3">

  <button
    onClick={() =>
      setIsCreateSprintModalOpen(
        true
      )
    }
    className="rounded-2xl bg-blue-500 px-5 py-2 text-sm font-semibold text-white transition hover:bg-blue-600"
  >
    + Create Sprint
  </button>

</div>
    </div>

    {/* BOARD */}

    <DragDropContext
      onDragEnd={
        handleDragEnd
      }
    >

      <SprintBoard
        sprints={sprints}
        tasks={tasks}
        users={users}
        onTaskClickAction={
          handleOpenTask
        }
        onCreateTaskAction={() =>
          setIsCreateModalOpen(
            true
          )
        }
        onTaskMoveAction={
          handleDragEnd
        }
        onUpdateSprintAction={
          handleUpdateSprint
        }
        onCompleteSprintAction={
          handleCompleteSprint
        }
      />

    </DragDropContext>

    {/* CREATE TASK */}

    <CreateTaskModal
      open={
        isCreateModalOpen
      }
      projectId={projectId}
      users={users}
      onCloseAction={() =>
        setIsCreateModalOpen(
          false
        )
      }
      onSubmitAction={
        handleCreateTask
      }
    />

    <CreateSprintModal
      open={
        isCreateSprintModalOpen
      }
      onCloseAction={() =>
        setIsCreateSprintModalOpen(
          false
        )
      }
      onSubmitAction={
        handleCreateSprint
      }
    />

    {/* TASK DETAILS */}

    {selectedTask && (
      <TaskDetailsModal
        task={
          selectedTask
        }
        projectId={projectId}
        users={users}
        onCloseAction={() => {

          setIsTaskModalOpen(
            false
          )

          setSelectedTask(
            null
          )
        }}
        onDeleteAction={
          handleDeleteTask
        }
        onAssignAction={
          handleAssignUser
        }
      />
    )}
  </div>
)
}