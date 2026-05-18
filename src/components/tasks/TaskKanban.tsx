"use client"

import { useEffect, useState } from "react"

import { Task } from "@/types/task"

import {
  getProjectTasks,
  updateTask,
  deleteTask,
} from "@/services/taskService"

interface Props {
  projectId: string
  token: string
}

export default function TaskKanban({
  projectId,
  token,
}: Props) {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadTasks()
  }, [])

  async function loadTasks() {
    try {
      setLoading(true)

      const data = await getProjectTasks(
        projectId,
        token
      )

      setTasks(data)
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  async function handleStatusChange(
    taskId: string,
    status: Task["status"]
  ) {
    try {
      await updateTask(
        taskId,
        {
          status,
        },
        token
      )

      setTasks((prev) =>
        prev.map((task) =>
          task.id === taskId
            ? { ...task, status }
            : task
        )
      )
    } catch (error) {
      console.error(error)
    }
  }

  async function handleDelete(
    taskId: string
  ) {
    try {
      await deleteTask(taskId, token)

      setTasks((prev) =>
        prev.filter(
          (task) => task.id !== taskId
        )
      )
    } catch (error) {
      console.error(error)
    }
  }

  const backlogTasks = tasks.filter(
    (task) => task.status === "pending"
  )

  const progressTasks = tasks.filter(
    (task) =>
      task.status === "in_progress"
  )

  const completedTasks = tasks.filter(
    (task) => task.status === "completed"
  )

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[400px]">
        <p className="text-gray-500">
          Loading tasks...
        </p>
      </div>
    )
  }

  return (
    <div className="w-full">
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 w-full">
        <TaskColumn
          title="Backlog"
          color="border-l-gray-400"
          tasks={backlogTasks}
          onStatusChange={
            handleStatusChange
          }
          onDelete={handleDelete}
        />

        <TaskColumn
          title="In Progress"
          color="border-l-yellow-500"
          tasks={progressTasks}
          onStatusChange={
            handleStatusChange
          }
          onDelete={handleDelete}
        />

        <TaskColumn
          title="Completed"
          color="border-l-green-500"
          tasks={completedTasks}
          onStatusChange={
            handleStatusChange
          }
          onDelete={handleDelete}
        />
      </div>
    </div>
  )
}

interface TaskColumnProps {
  title: string
  color: string
  tasks: Task[]

  onStatusChange: (
    taskId: string,
    status: Task["status"]
  ) => void

  onDelete: (
    taskId: string
  ) => void
}

function TaskColumn({
  title,
  color,
  tasks,
  onStatusChange,
  onDelete,
}: TaskColumnProps) {
  return (
    <div className="bg-white border border-gray-200 rounded-3xl p-5 min-h-[700px] shadow-sm">
      <div
        className={`flex items-center justify-between border border-gray-200 rounded-2xl p-4 mb-5 border-l-4 ${color}`}
      >
        <div className="flex items-center gap-3">
          <h2 className="text-2xl font-bold">
            {title}
          </h2>

          <span className="w-10 h-10 rounded-full border flex items-center justify-center text-sm font-semibold">
            {tasks.length}
          </span>
        </div>

        <button className="text-gray-400 text-2xl">
          ...
        </button>
      </div>

      <button className="border-2 border-dashed border-red-500 hover:border-red-600 hover:bg-red-50 transition rounded-2xl h-16 flex items-center justify-center text-red-500 hover:text-red-600 text-3xl font-bold mb-5 w-full">
        +
      </button>

      <div className="space-y-5">
        {tasks.map((task) => (
          <TaskCard
            key={task.id}
            task={task}
            onStatusChange={
              onStatusChange
            }
            onDelete={onDelete}
          />
        ))}
      </div>
    </div>
  )
}

interface TaskCardProps {
  task: Task

  onStatusChange: (
    taskId: string,
    status: Task["status"]
  ) => void

  onDelete: (
    taskId: string
  ) => void
}

function TaskCard({
  task,
  onStatusChange,
  onDelete,
}: TaskCardProps) {
  return (
    <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-sm hover:shadow-md transition">
      <div className="flex justify-between items-start">
        <h3 className="text-3xl font-bold">
          {task.title}
        </h3>

        <span className="text-gray-400 text-sm">
          Due today
        </span>
      </div>

      <p className="text-gray-500 mt-4 text-lg leading-relaxed">
        {task.description}
      </p>

      <div className="mt-5">
        <div className="flex justify-between text-sm mb-2">
          <span className="text-gray-500">
            Progress
          </span>

          <span className="font-semibold">
            {task.progress}%
          </span>
        </div>

        <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-black rounded-full"
            style={{
              width: `${task.progress}%`,
            }}
          />
        </div>
      </div>

      <div className="flex items-center justify-between mt-6">
        <select
          value={task.status}
          onChange={(e) =>
            onStatusChange(
              task.id,
              e.target
                .value as Task["status"]
            )
          }
          className="border border-gray-200 rounded-xl px-4 py-2 text-sm"
        >
          <option value="pending">
            Backlog
          </option>

          <option value="in_progress">
            In Progress
          </option>

          <option value="completed">
            Completed
          </option>
        </select>

        <button
          onClick={() =>
            onDelete(task.id)
          }
          className="text-red-500 hover:text-red-700 text-sm font-medium"
        >
          Delete
        </button>
      </div>

      <div className="flex items-center justify-between mt-6">
        <span
          className={`px-4 py-2 rounded-full text-sm font-medium ${
            task.priority === "high"
              ? "bg-red-100 text-red-600"
              : task.priority ===
                "medium"
              ? "bg-yellow-100 text-yellow-700"
              : "bg-green-100 text-green-600"
          }`}
        >
          {task.priority}
        </span>

        <div className="flex -space-x-2">
          <div className="w-10 h-10 rounded-full bg-yellow-200 border flex items-center justify-center text-xs font-bold">
            A
          </div>

          <div className="w-10 h-10 rounded-full bg-orange-200 border flex items-center justify-center text-xs font-bold">
            B
          </div>
        </div>
      </div>
    </div>
  )
}