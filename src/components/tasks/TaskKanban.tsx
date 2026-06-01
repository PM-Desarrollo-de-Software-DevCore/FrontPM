// src/components/tasks/TaskKanban.tsx

"use client"

import {
  Droppable,
} from "@hello-pangea/dnd"

import TaskCard from "./TaskCard"

import {
  Task,
} from "@/types/task"

const columns = [
  {
    id: "pending",
    title: "Pending",
    color:
      "bg-yellow-400",
  },

  {
    id: "in_progress",
    title:
      "In Progress",
    color:
      "bg-blue-500",
  },

  {
    id: "completed",
    title:
      "Completed",
    color:
      "bg-green-500",
  },
]

interface Props {

  tasks: Task[]

  users: {
    id: string
    name: string
    lastname: string
  }[]

  sprintId?: string

  onTaskMoveAction: (
    result: any
  ) => void

  onTaskClickAction: (
    task: Task
  ) => void

  onCreateTaskAction: () => void
}

export default function TaskKanban({

  tasks,

  users,

  sprintId,

  onTaskClickAction,

  onCreateTaskAction,

}: Props) {

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">

      {columns.map(
        (column) => {

          const columnTasks =
            tasks.filter(
              (task) =>
                task.status ===
                column.id
            )

          return (
            <div
              key={
                column.id
              }
              className="rounded-[32px] border border-gray-100 bg-white p-5 shadow-sm"
            >

              {/* HEADER */}

              <div className="mb-5 flex items-center justify-between">

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
                    columnTasks.length
                  }
                </div>
              </div>

              {/* DROPPABLE */}

              <Droppable
                droppableId={`${sprintId}__${column.id}`}
              >
                {(
                  provided
                ) => (
                  <div
                    ref={
                      provided.innerRef
                    }
                    {...provided.droppableProps}
                    className="min-h-[250px] space-y-4"
                  >

                    {columnTasks.map(
                      (
                        task,
                        index
                      ) => {

                        const assignedUser =
                          users.find(
                            (
                              user
                            ) =>
                              user.id ===
                              task.assignedTo
                          )

                        return (
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
                            assignedUser={
                              assignedUser
                            }
                            onClickAction={() =>
                              onTaskClickAction(
                                task
                              )
                            }
                          />
                        )
                      }
                    )}

                    {
                      provided.placeholder
                    }

                    {/* ADD TASK */}

                    <button
                      onClick={
                        onCreateTaskAction
                      }
                      className="mt-3 flex h-12 w-full items-center justify-center rounded-2xl border-2 border-dashed border-red-300 text-lg font-semibold text-red-400 transition hover:bg-red-50"
                    >
                      + Add Task
                    </button>
                  </div>
                )}
              </Droppable>
            </div>
          )
        }
      )}
    </div>
  )
}