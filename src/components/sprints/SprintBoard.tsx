// src/components/sprints/SprintBoard.tsx

"use client"

import { useCallback, useEffect, useState } from "react"

import {
  type DropResult,
} from "@hello-pangea/dnd"

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

  collapseStorageKey: string

  focusSprintId?: string | null
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

  collapseStorageKey,

  focusSprintId,

}: Props) {
  const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>(() => {
    if (typeof window === "undefined") {
      return {}
    }

    try {
      const raw = localStorage.getItem(collapseStorageKey)
      if (!raw) {
        return {}
      }

      return JSON.parse(raw) as Record<string, boolean>
    } catch {
      return {}
    }
  })

  useEffect(() => {
    if (!focusSprintId) {
      return
    }

    const element = document.getElementById(`sprint-${focusSprintId}`)
    if (!element) {
      return
    }

    element.scrollIntoView({ behavior: "smooth", block: "start" })
  }, [focusSprintId, sprints, tasks])

  const toggleSectionCollapse = useCallback(
    (sectionId: string) => {
      setCollapsedSections((prev) => {
        const next = {
          ...prev,
          [sectionId]: !prev[sectionId],
        }

        localStorage.setItem(collapseStorageKey, JSON.stringify(next))
        return next
      })
    },
    [collapseStorageKey]
  )

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

        isCollapsed={Boolean(collapsedSections.backlog)}

        onToggleCollapseAction={toggleSectionCollapse}

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

              isCollapsed={Boolean(collapsedSections[sprint.id])}

              onToggleCollapseAction={toggleSectionCollapse}

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

                    isCollapsed={Boolean(collapsedSections[sprint.id])}

                    onToggleCollapseAction={toggleSectionCollapse}

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