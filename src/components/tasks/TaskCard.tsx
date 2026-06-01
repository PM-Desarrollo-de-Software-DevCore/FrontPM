// src/components/tasks/TaskCard.tsx

"use client"

import {
  Draggable,
} from "@hello-pangea/dnd"

import {
  Task,
} from "@/types/task"

interface Props {

  task: Task

  index: number

  contextLabel?: string

  assignedUser?: {
    id: string
    name: string
    lastname: string
  }

  onClickAction: () => void
}

export default function TaskCard({

  task,

  index,

  contextLabel,

  assignedUser,

  onClickAction,

}: Props) {

  const priorityColors = {

    high:
      "bg-red-100 text-red-500",

    medium:
      "bg-yellow-100 text-yellow-600",

    low:
      "bg-green-100 text-green-600",
  }

  return (
    <Draggable
      draggableId={
        task.id
      }
      index={index}
    >
      {(
        provided
      ) => (
        <div
          ref={
            provided.innerRef
          }

          {...provided.draggableProps}

          {...provided.dragHandleProps}

          onClick={
            onClickAction
          }

          className="cursor-pointer rounded-3xl border border-gray-100 bg-white p-4 shadow-sm transition hover:shadow-md"
        >

          {/* TOP */}

          <div className="mb-2 flex items-start justify-between gap-3">

            <h3 className="line-clamp-2 text-[18px] font-bold text-black">

              {task.title}
            </h3>

            <div className="flex flex-col items-end gap-2">
              <div
                className={`rounded-full px-3 py-1 text-xs font-semibold ${
                  priorityColors[
                    task.priority
                  ]
                }`}
              >
                {
                  task.priority
                }
              </div>

              {contextLabel && (
                <div className="rounded-full bg-slate-100 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">
                  {contextLabel}
                </div>
              )}
            </div>
          </div>

          {/* ASSIGNED */}

          <p className="mb-2 text-xs text-gray-400">

            {assignedUser
              ? `${assignedUser.name} ${assignedUser.lastname}`
              : "Unassigned"}
          </p>

          {/* DESCRIPTION */}

          <p className="mb-4 line-clamp-2 text-sm text-gray-500">

            {
              task.description
            }
          </p>

          {/* FOOTER */}

          <div className="flex items-center justify-between">

            <span className="text-xs text-gray-400">

              {task.end_date
                ? new Date(
                    task.end_date
                  ).toLocaleDateString()
                : "No date"}
            </span>

            <div className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-500">

              {
                task.progress
              }
              %
            </div>
          </div>
        </div>
      )}
    </Draggable>
  )
}