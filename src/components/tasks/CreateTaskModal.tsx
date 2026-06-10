"use client"

import { useEffect, useState } from "react"

import { Task } from "@/types/task"
import { getAssignmentSuggestions, AssignmentSuggestionItem } from "@/services/assignmentSuggestionService"
import { useNotification } from "@/components/ui/notifications/NotificationProvider"

interface UserChoice {
  id: string
  name: string
  lastname: string
}

interface Props {
  open: boolean
  projectId: string
  users: UserChoice[]
  initialSprintId?: string | null
  initialStatus?: Task["status"]
  onCloseAction: () => void
  onSubmitAction: (task: Partial<Task>) => void
}

export default function CreateTaskModal({
  open,
  projectId,
  users,
  initialSprintId = null,
  initialStatus = "pending",
  onCloseAction,
  onSubmitAction,
}: Props) {
  const { notifyError } = useNotification()
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [priority, setPriority] = useState<"low" | "medium" | "high">("medium")
  const [storyPoints, setStoryPoints] = useState("")
  const [endDate, setEndDate] = useState("")
  const [assignedTo, setAssignedTo] = useState("")
  const [selectedSprintId, setSelectedSprintId] = useState<string | null>(null)
  const [selectedStatus, setSelectedStatus] = useState<Task["status"]>("pending")
  const [suggestions, setSuggestions] = useState<AssignmentSuggestionItem[]>([])
  const [suggestionsLoading, setSuggestionsLoading] = useState(false)

  useEffect(() => {
    if (!open) return

    setSelectedSprintId(initialSprintId)
    setSelectedStatus(initialStatus)
  }, [open, initialSprintId, initialStatus])

  useEffect(() => {
    if (!open) return

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = "hidden"

    return () => {
      document.body.style.overflow = previousOverflow
    }
  }, [open])

  useEffect(() => {
    if (!open) {
      setSuggestions([])
      setSuggestionsLoading(false)
      return
    }

    const query = `${title} ${description}`.trim()

    if (query.length < 8) {
      setSuggestions([])
      setSuggestionsLoading(false)
      return
    }

    let cancelled = false
    const timer = window.setTimeout(async () => {
      try {
        setSuggestionsLoading(true)
        const response = await getAssignmentSuggestions({
          scope: "task",
          projectId,
          title,
          description,
          limit: 4,
        })

        if (!cancelled) {
          setSuggestions(response.suggestions)
        }
      } catch (error) {
        if (!cancelled) {
          setSuggestions([])
        }
      } finally {
        if (!cancelled) {
          setSuggestionsLoading(false)
        }
      }
    }, 550)

    return () => {
      cancelled = true
      window.clearTimeout(timer)
    }
  }, [open, title, description, projectId])

  if (!open) {
    return null
  }

  const handleSubmit = async () => {
    const trimmedTitle = title.trim()
    if (!trimmedTitle) {
      notifyError("Task not created", "Task title is required.")
      return
    }

    await onSubmitAction({
      title: trimmedTitle,
      description,
      priority,
      ...(storyPoints ? { story_points: Number(storyPoints) } : {}),
      ...(endDate ? { end_date: endDate } : {}),
      progress: 0,
      status: selectedStatus,
      id_sprint: selectedSprintId,
      ...(assignedTo ? { assignedTo } : {}),
    })

    setTitle("")
    setDescription("")
    setPriority("medium")
    setStoryPoints("")
    setEndDate("")
    setAssignedTo("")
    setSelectedSprintId(null)
    setSelectedStatus("pending")
    setSuggestions([])
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/30 p-6 backdrop-blur-sm">
      <div className="flex w-full max-w-md max-h-[calc(100vh-3rem)] flex-col overflow-hidden rounded-[32px] bg-white p-6 shadow-xl">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-2xl font-semibold text-black">New Task</h2>
          <button
            onClick={onCloseAction}
            className="text-2xl text-gray-400 transition hover:text-black"
          >
            ×
          </button>
        </div>

        <div className="flex-1 space-y-4 overflow-y-auto pr-1">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Task title"
            className="h-12 w-full rounded-2xl border border-gray-200 px-4 text-sm outline-none"
          />

          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Description"
            style={{ minHeight: 120 }}
            className="w-full rounded-2xl border border-gray-200 p-4 text-sm outline-none"
          />

          <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50 p-4">
            <div className="mb-3 flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-gray-900">Smart suggestions</p>
                <p className="text-xs text-gray-500">Based on skills, area and completed tasks</p>
              </div>
              {suggestionsLoading && <span className="text-xs text-gray-400">Analyzing...</span>}
            </div>

            {suggestions.length > 0 ? (
              <div className="space-y-2">
                {suggestions.map((suggestion) => (
                  <button
                    key={suggestion.userId}
                    type="button"
                    onClick={() => setAssignedTo(suggestion.userId)}
                    className={`flex w-full items-center justify-between rounded-2xl border px-3 py-2 text-left transition hover:border-gray-300 ${
                      assignedTo === suggestion.userId
                        ? "border-black bg-white"
                        : "border-gray-200 bg-white"
                    }`}
                  >
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {suggestion.name} {suggestion.lastname}
                      </p>
                      <p className="text-xs text-gray-500">
                        {suggestion.skill || "No skill"}{suggestion.area ? ` · ${suggestion.area}` : ""}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-gray-900">{suggestion.score}</p>
                      <p className="text-[11px] text-gray-500">{suggestion.completedTasks} done</p>
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500">
                {suggestionsLoading
                  ? "Generating recommendations..."
                  : "Write a stronger title or description to get recommendations."}
              </p>
            )}
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-600">Assign To</label>
            <select
              value={assignedTo}
              onChange={(e) => setAssignedTo(e.target.value)}
              className="h-12 w-full rounded-2xl border border-gray-200 px-4 text-sm outline-none"
            >
              <option value="">Unassigned</option>
              {users.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.name} {user.lastname}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-600">Priority</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as Task["priority"])}
                className="h-12 w-full rounded-2xl border border-gray-200 px-4 text-sm outline-none"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-600">Due Date</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="h-12 w-full rounded-2xl border border-gray-200 px-4 text-sm outline-none"
              />
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-600">Story Points</label>
            <select
              value={storyPoints}
              onChange={(e) => setStoryPoints(e.target.value)}
              className="h-12 w-full rounded-2xl border border-gray-200 px-4 text-sm outline-none"
            >
              <option value="">None</option>
              {[1, 2, 3, 4, 5].map((point) => (
                <option key={point} value={point}>
                  {point}
                </option>
              ))}
            </select>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              onClick={onCloseAction}
              className="rounded-2xl border border-gray-200 px-5 py-2 text-sm font-medium text-gray-600 transition hover:bg-gray-100"
            >
              Cancel
            </button>

            <button
              onClick={handleSubmit}
              className="rounded-2xl bg-red-500 px-5 py-2 text-sm font-semibold text-white transition hover:bg-red-600"
            >
              Create Task
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
