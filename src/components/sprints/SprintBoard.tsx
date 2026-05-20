// src/components/sprints/SprintBoard.tsx

"use client"

import {
  Sprint,
} from "@/types/sprint"

import {
  Task,
} from "@/types/task"

import SprintSection from "./SprintSection"

interface Props {

  sprints: Sprint[]

  tasks: Task[]

  users: {
    id: string
    name: string
    lastname: string
  }[]

  onTaskClickAction: (
    task: Task
  ) => void

  onCreateTaskAction: () => void

  onTaskMoveAction: (
    result: any
  ) => void

  onUpdateSprintAction: (
    sprintId: string,
    data: Partial<Sprint>
  ) => void

  onCompleteSprintAction: (
    sprintId: string
  ) => void
}

export default function SprintBoard({

  sprints,

  tasks,

  users,

  onTaskClickAction,

  onCreateTaskAction,

  onTaskMoveAction,

  onUpdateSprintAction,

  onCompleteSprintAction,

}: Props) {

  const backlogTasks =
    tasks.filter(
      (task) =>
        !task.id_sprint
    )

  const activeSprints =
    sprints.filter(
      (sprint) =>
        sprint.status !== "completed"
    )

  const completedSprints =
    sprints.filter(
      (sprint) =>
        sprint.status === "completed"
    )

  return (
    <div className="space-y-8">

      {/* BACKLOG */}

      <SprintSection
        sprint={{
          id: "backlog",

          name: "Backlog",

          start_date:
            new Date().toISOString(),

          end_date:
            new Date().toISOString(),
        }}

        tasks={
          backlogTasks
        }

        users={users}

        onTaskClickAction={
          onTaskClickAction
        }

        onCreateTaskAction={
          onCreateTaskAction
        }

        onTaskMoveAction={
          onTaskMoveAction
        }

        onUpdateSprintAction={() => {}}

        onCompleteSprintAction={() => {}}
      />

      {/* ACTIVE SPRINTS */}

      {activeSprints.map(
        (sprint) => {

          const sprintTasks =
            tasks.filter(
              (task) =>
                task.id_sprint ===
                sprint.id
            )

          return (
            <SprintSection
              key={
                sprint.id
              }

              sprint={
                sprint
              }

              tasks={
                sprintTasks
              }

              users={
                users
              }

              onTaskClickAction={
                onTaskClickAction
              }

              onCreateTaskAction={
                onCreateTaskAction
              }

              onTaskMoveAction={
                onTaskMoveAction
              }

              onUpdateSprintAction={
                onUpdateSprintAction
              }

              onCompleteSprintAction={
                onCompleteSprintAction
              }
            />
          )
        }
      )}

      {/* COMPLETED SPRINTS */}

      {completedSprints.length >
        0 && (

        <div className="mt-12">

          <h2 className="mb-6 text-3xl font-bold text-black">

            Completed Sprints
          </h2>

          <div className="space-y-8">

            {completedSprints.map(
              (sprint) => {

                const sprintTasks =
                  tasks.filter(
                    (
                      task
                    ) =>
                      task.id_sprint ===
                      sprint.id
                  )

                return (
                  <SprintSection
                    key={
                      sprint.id
                    }

                    sprint={
                      sprint
                    }

                    tasks={
                      sprintTasks
                    }

                    users={
                      users
                    }

                    onTaskClickAction={
                      onTaskClickAction
                    }

                    onCreateTaskAction={
                      onCreateTaskAction
                    }

                    onTaskMoveAction={
                      onTaskMoveAction
                    }

                    onUpdateSprintAction={
                      onUpdateSprintAction
                    }

                    onCompleteSprintAction={
                      onCompleteSprintAction
                    }
                  />
                )
              }
            )}
          </div>
        </div>
      )}
    </div>
  )
}