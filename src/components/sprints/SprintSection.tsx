// src/components/sprints/SprintSection.tsx

"use client"

import { useMemo, useState } from "react"

import {
  Droppable,
  type DropResult,
} from "@hello-pangea/dnd"

import {
  Sprint,
} from "@/types/sprint"

import {
  Task,
} from "@/types/task"

import TaskCard from "../tasks/TaskCard"

interface Props {

  sprint: Sprint

  tasks: Task[]

  users: {
    id: string
    name: string
    lastname: string
  }[]

  onTaskClickAction: (
    task: Task
  ) => void

  onCreateTaskAction: (
    sprintId: string,
    status: Task["status"]
  ) => void

  onTaskMoveAction: (
    result: DropResult
  ) => void

  onUpdateSprintAction: (
    sprintId: string,
    data: Partial<Sprint>
  ) => void

  onCompleteSprintAction: (
    sprintId: string
  ) => void

  isCollapsed?: boolean

  onToggleCollapseAction?: (
    sprintId: string
  ) => void
}

export default function SprintSection({

  sprint,

  tasks,

  users,

  onTaskClickAction,

  onCreateTaskAction,

  onUpdateSprintAction,

  onCompleteSprintAction,

  isCollapsed: isCollapsedFromProps,

  onToggleCollapseAction,

}: Props) {

  const [
    isEditing,

    setIsEditing,

  ] = useState(false)

  const [
    name,

    setName,

  ] = useState(
    sprint.name
  )

  const [
    startDate,

    setStartDate,

  ] = useState(
    sprint.start_date
      ?.split("T")[0]
  )

  const [
    endDate,

    setEndDate,

  ] = useState(
    sprint.end_date
      ?.split("T")[0]
  )

  const [
    isCollapsedLocal,

    setIsCollapsedLocal,

  ] = useState(false)

  const isCollapsed =
    isCollapsedFromProps ??
    isCollapsedLocal

  const toggleCollapse =
    () => {
      if (
        onToggleCollapseAction
      ) {
        onToggleCollapseAction(
          sprint.id
        )
        return
      }

      setIsCollapsedLocal(
        (prev) => !prev
      )
    }

  const groupedTasks =
    useMemo(() => {

      return {

        pending:
          tasks.filter(
            (task) =>
              task.status ===
              "pending"
          ),

        in_progress:
          tasks.filter(
            (task) =>
              task.status ===
              "in_progress"
          ),

        completed:
          tasks.filter(
            (task) =>
              task.status ===
              "completed"
          ),
      }
    }, [tasks])

  const columns = [

    {
      id: "pending",

      title: "Pending",

      color:
        "bg-yellow-400",

      tasks:
        groupedTasks.pending,
    },

    {
      id: "in_progress",

      title:
        "In Progress",

      color:
        "bg-blue-500",

      tasks:
        groupedTasks.in_progress,
    },

    {
      id: "completed",

      title:
        "Completed",

      color:
        "bg-green-500",

      tasks:
        groupedTasks.completed,
    },
  ]

  const progress =
    tasks.length === 0
      ? 0
      : Math.round(
          (groupedTasks
            .completed
            .length /
            tasks.length) *
            100
        )

  const handleSave =
    () => {

      onUpdateSprintAction(
        sprint.id,
        {
          name,

          start_date:
            startDate,

          end_date:
            endDate,
        }
      )

      setIsEditing(
        false
      )
    }

  return (
    <div id={`sprint-${sprint.id}`} className="scroll-mt-24 rounded-[36px] border border-gray-200 bg-white p-6 shadow-sm">

      {/* HEADER */}

      <div className="mb-6 flex items-start justify-between">

        <div>

          <div className="mb-2 flex items-center gap-3">

            <div
            className={`h-4 w-4 rounded-full ${
                sprint.status === "completed"
                ? "bg-gray-400"
                : "bg-blue-500"
            }`}
            />

            {isEditing ? (

              <input
                value={name}
                onChange={(
                  e
                ) =>
                  setName(
                    e.target
                      .value
                  )
                }
                className="rounded-xl border border-gray-200 px-3 py-2 text-[20px] font-semibold outline-none"
              />

            ) : (

              <h2 className="text-[20px] font-semibold text-black">

                {
                  sprint.name
                }
              </h2>
            )}
          </div>

          <div className="flex items-center gap-3 text-sm text-gray-400">

            {isEditing ? (

              <>
                <input
                  type="date"
                  value={
                    startDate
                  }
                  onChange={(
                    e
                  ) =>
                    setStartDate(
                      e.target
                        .value
                    )
                  }
                  className="rounded-lg border border-gray-200 px-2 py-1"
                />

                <span>
                  -
                </span>

                <input
                  type="date"
                  value={
                    endDate
                  }
                  onChange={(
                    e
                  ) =>
                    setEndDate(
                      e.target
                        .value
                    )
                  }
                  className="rounded-lg border border-gray-200 px-2 py-1"
                />
              </>

            ) : (

              <>
                <span>
                  {new Date(
                    sprint.start_date
                  ).toLocaleDateString()}
                </span>

                <span>
                  -
                </span>

                <span>
                  {new Date(
                    sprint.end_date
                  ).toLocaleDateString()}
                </span>
              </>
            )}
          </div>
        </div>

        {/* ACTIONS */}

        <div className="flex items-center gap-3">

          <button
            onClick={toggleCollapse}
            className="rounded-2xl border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100"
          >
            {isCollapsed ? "Expand" : "Collapse"}
          </button>

          {sprint.id !==
            "backlog" &&
            sprint.status !== "completed" && (

              <button
                onClick={() =>
                  onCompleteSprintAction(
                    sprint.id
                  )
                }
                className="rounded-2xl bg-green-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-green-600"
              >
                Complete Sprint
              </button>
            )}

          {isEditing ? (

            <button
              onClick={
                handleSave
              }
              className="rounded-2xl bg-black px-4 py-2 text-sm font-medium text-white"
            >
              Save
            </button>

          ) : (

            sprint.id !==
              "backlog" && (
              <button
                onClick={() =>
                  setIsEditing(
                    true
                  )
                }
                className="rounded-2xl border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100"
              >
                Edit Sprint
              </button>
            )
          )}

          <div className="rounded-2xl bg-gray-100 px-4 py-2 text-sm font-semibold text-gray-500">

            {tasks.length} Tasks
          </div>
        </div>
      </div>

      {isCollapsed ? null : (
        <>

      {/* PROGRESS */}

      <div className="mb-6">

        <div className="mb-2 flex items-center justify-between">

          <span className="text-sm text-gray-500">

            Sprint Progress
          </span>

          <span className="text-sm font-semibold text-black">

            {progress}%
          </span>
        </div>

        <div className="h-3 overflow-hidden rounded-full bg-gray-100">

          <div
            style={{
              width: `${progress}%`,
            }}
            className="h-full rounded-full bg-green-500 transition-all"
          />
        </div>
      </div>

      {/* COLUMNS */}

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">

        {columns.map(
          (column) => (

            <Droppable
              key={
                `${sprint.id}-${column.id}`
              }
              droppableId={`${sprint.id}:${column.id}`}
            >
              {(
                provided
              ) => (

                <div
                  ref={
                    provided.innerRef
                  }

                  {...provided.droppableProps}

                  className="min-h-62.5 rounded-[30px] border border-gray-200 bg-[#fcfcfc] p-4"
                >

                  {/* COLUMN HEADER */}

                  <div className="mb-4 flex items-center justify-between">

                    <div className="flex items-center gap-3">

                      <div
                        className={`h-3 w-3 rounded-full ${column.color}`}
                      />

                      <h3 className="text-[20px] font-semibold text-black">

                        {
                          column.title
                        }
                      </h3>
                    </div>

                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-xs font-semibold text-gray-500">

                      {
                        column.tasks
                          .length
                      }
                    </div>
                  </div>

                  {/* TASKS */}

                  <div className="space-y-4">

                    {column.tasks.map(
                      (
                        task,
                        index
                      ) => (

                        <TaskCard
                          key={
                            task.id
                          }

                          task={
                            task
                          }

                          index={
                            index
                          }

                          assignedUser={users.find(
                            (
                              user
                            ) =>
                              user.id ===
                              task.assignedTo
                          )}

                          onClickAction={() =>
                            onTaskClickAction(
                              task
                            )
                          }
                        />
                      )
                    )}

                    {
                      provided.placeholder
                    }

                    {/* ADD TASK */}

                    <button
                      onClick={() =>
                        onCreateTaskAction(
                          sprint.id,
                          column.id as Task["status"]
                        )
                      }
                      className="mt-3 flex h-12 w-full items-center justify-center rounded-2xl border-2 border-dashed border-red-300 text-lg font-semibold text-red-400 transition hover:bg-red-50"
                    >
                      + Add Task
                    </button>
                  </div>
                </div>
              )}
            </Droppable>
          )
        )}
      </div>
        </>
      )}
    </div>
  )
}