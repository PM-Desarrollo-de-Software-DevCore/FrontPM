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

  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")

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

  async function handleDelete(taskId: string) {
    try {
      await deleteTask(taskId, token)

      setTasks((prev) =>
        prev.filter((task) => task.id !== taskId)
      )
    } catch (error) {
      console.error(error)
    }
  }

  const pendingTasks = tasks.filter(
    (task) => task.status === "pending"
  )

  const progressTasks = tasks.filter(
    (task) => task.status === "in_progress"
  )

  const completedTasks = tasks.filter(
    (task) => task.status === "completed"
  )

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[300px]">
        <p className="text-gray-500">
          Loading tasks...
        </p>
      </div>
    )
  }

  return (
    <div className="w-full mt-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold">
          Tasks Board
        </h2>

        <p className="text-gray-500 mt-1">
          Manage project tasks
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 w-full">
        <TaskColumn
          title="Pending"
          tasks={pendingTasks}
          onStatusChange={handleStatusChange}
          onDelete={handleDelete}
        />

        <TaskColumn
          title="In Progress"
          tasks={progressTasks}
          onStatusChange={handleStatusChange}
          onDelete={handleDelete}
        />

        <TaskColumn
          title="Completed"
          tasks={completedTasks}
          onStatusChange={handleStatusChange}
          onDelete={handleDelete}
        />
      </div>
    </div>
  )
}

interface TaskColumnProps {
  title: string
  tasks: Task[]
  onStatusChange: (
    taskId: string,
    status: Task["status"]
  ) => void
  onDelete: (taskId: string) => void
}

function TaskColumn({
  title,
  tasks,
  onStatusChange,
  onDelete,
}: TaskColumnProps) {
  return (
    <div className="bg-[#f5f5f5] rounded-2xl p-4 min-h-[600px] w-full">
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-lg font-bold">
          {title}
        </h3>

        <span className="bg-black text-white text-xs px-2 py-1 rounded-full">
          {tasks.length}
        </span>
      </div>

      <div className="space-y-4">
        {tasks.map((task) => (
          <TaskCard
            key={task.id}
            task={task}
            onStatusChange={onStatusChange}
            onDelete={onDelete}
          />
        ))}

        {tasks.length === 0 && (
          <div className="border border-dashed rounded-xl p-6 text-center text-gray-400">
            No tasks
          </div>
        )}
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
  onDelete: (taskId: string) => void
}

function TaskCard({
  task,
  onStatusChange,
  onDelete,
}: TaskCardProps) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm">
      <div className="flex items-start justify-between">
        <h4 className="font-semibold text-black">
          {task.title}
        </h4>

        <button
          onClick={() => onDelete(task.id)}
          className="text-red-500 text-sm"
        >
          Delete
        </button>
      </div>

      <p className="text-sm text-gray-500 mt-2">
        {task.description}
      </p>

      <div className="mt-4 flex items-center justify-between">
        <span
          className={`text-xs px-2 py-1 rounded-full ${
            task.priority === "high"
              ? "bg-red-100 text-red-600"
              : task.priority === "medium"
              ? "bg-yellow-100 text-yellow-700"
              : "bg-green-100 text-green-600"
          }`}
        >
          {task.priority}
        </span>

        <select
          value={task.status}
          onChange={(e) =>
            onStatusChange(
              task.id,
              e.target.value as Task["status"]
            )
          }
          className="border rounded-lg px-2 py-1 text-sm"
        >
          <option value="pending">
            Pending
          </option>

          <option value="in_progress">
            In Progress
          </option>

          <option value="completed">
            Completed
          </option>
        </select>
      </div>

      <div className="mt-4">
        <div className="flex justify-between text-xs mb-1">
          <span>Progress</span>

          <span>{task.progress}%</span>
        </div>

        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-black h-2 rounded-full"
            style={{
              width: `${task.progress}%`,
            }}
          />
        </div>
      </div>
    </div>
  )
}