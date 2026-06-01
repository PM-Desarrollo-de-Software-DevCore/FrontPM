"use client"

import { useEffect, useState } from "react"

import { Task } from "@/types/task"
import { getToken } from "@/lib/auth"
import {
  getTaskComments,
  createTaskComment,
  updateComment,
  deleteComment,
} from "@/services/commentService"
import { Comment } from "@/types/comment"

interface User {
  id: string
  name: string
  lastname: string
}

interface Props {
  task: Task
  users: User[]
  onCloseAction: () => void
  onDeleteAction: (taskId: string) => void
  onAssignAction: (taskId: string, userId: string) => void
}

export default function TaskDetailsModal({
  task,
  users,
  onCloseAction,
  onDeleteAction,
  onAssignAction,
}: Props) {
  const [selectedUser, setSelectedUser] = useState(task.assignedTo || "")
  const [successMessage, setSuccessMessage] = useState("")

  const [comments, setComments] = useState<Comment[]>([])
  const [newComment, setNewComment] = useState("")
  const [commentsLoading, setCommentsLoading] = useState(false)
  const [commentError, setCommentError] = useState("")
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null)
  const [editingContent, setEditingContent] = useState("")

  const taskId = task.id

  useEffect(() => {
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = "hidden"

    return () => {
      document.body.style.overflow = previousOverflow
    }
  }, [])

  useEffect(() => {
    setSelectedUser(task.assignedTo || "")
  }, [task.id, task.assignedTo])

  useEffect(() => {
    async function loadComments() {
      try {
        const token = getToken()
        if (!token) return

        setCommentsLoading(true)
        setCommentError("")

        const data = await getTaskComments(taskId, token)
        setComments(data)
      } catch {
        setCommentError("Error loading comments.")
      } finally {
        setCommentsLoading(false)
      }
    }

    loadComments()
  }, [taskId])

  useEffect(() => {
    const query = `${task.title} ${task.description || ""}`.trim()
    // Suggestions removed from detail modal — keep comments and assignment UI only
    return undefined
  }, [task.id, task.title, task.description])

  async function handleCreateComment() {
  if (!newComment.trim()) return

  try {
    const token = getToken()
    if (!token) return

    setCommentError("")

    await createTaskComment(taskId, newComment, token)

    const updatedComments = await getTaskComments(taskId, token)
    setComments(updatedComments)

    setNewComment("")
  } catch {
    setCommentError("Error creating comment.")
  }
}

  async function handleUpdateComment(commentId: string) {
  if (!editingContent.trim()) return

  try {
    const token = getToken()
    if (!token) return

    setCommentError("")

    await updateComment(commentId, editingContent, token)

    const updatedComments = await getTaskComments(taskId, token)
    setComments(updatedComments)

    setEditingCommentId(null)
    setEditingContent("")
  } catch {
    setCommentError("Error updating comment.")
  }
}

  async function handleDeleteComment(commentId: string) {
    const confirmed = window.confirm("Are you sure you want to delete this comment?")
    if (!confirmed) return

    try {
      const token = getToken()
      if (!token) return

      setCommentError("")

      await deleteComment(commentId, token)

      setComments((prevComments) =>
        prevComments.filter((comment) => {
          const currentCommentId = comment.id || comment.commentId
          return currentCommentId !== commentId
        })
      )
    } catch {
      setCommentError("Error deleting comment.")
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/20 p-6 backdrop-blur-sm">
      <div className="flex w-175 max-h-[calc(100vh-3rem)] flex-col overflow-hidden rounded-[28px] bg-white p-6 shadow-2xl">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-gray-400">Task Details</p>
            <h1 className="mt-1 text-3xl font-bold text-black">{task.title}</h1>
          </div>

          <button
            onClick={onCloseAction}
            className="text-3xl text-gray-400 hover:text-black"
          >
            ×
          </button>
        </div>

        <div className="mt-8 flex-1 overflow-y-auto pr-1">
          <div className="grid grid-cols-2 gap-8">
            <div>
              <p className="mb-2 text-sm text-gray-400">Priority</p>
              <div className="inline-flex rounded-full bg-red-100 px-4 py-1 text-sm text-red-500">
                {task.priority}
              </div>
            </div>

            <div>
              <p className="mb-2 text-sm text-gray-400">Status</p>
              <div className="inline-flex rounded-full bg-green-100 px-4 py-1 text-sm text-green-600">
                {task.status}
              </div>
            </div>

            <div>
              <p className="mb-2 text-sm text-gray-400">Due Date</p>
              <p className="text-lg font-medium">
                {new Date(task.end_date).toLocaleDateString()}
              </p>
            </div>

            <div>
              <p className="mb-2 text-sm text-gray-400">Progress</p>
              <p className="text-lg font-medium">{task.progress}%</p>
            </div>
          </div>

          {successMessage && (
            <div className="mt-6 rounded-2xl bg-green-100 px-4 py-3 text-sm font-medium text-green-700">
              {successMessage}
            </div>
          )}

          {/* Smart suggestions removed from details modal; suggestions remain in CreateTaskModal */}

          <div className="mt-8">
            <p className="mb-2 text-sm text-gray-400">Assign User</p>

            <div className="flex gap-3">
              <select
                value={selectedUser}
                onChange={(e) => setSelectedUser(e.target.value)}
                className="flex-1 h-10 rounded-2xl border border-gray-200 px-4 text-sm outline-none"
              >
                <option value="">Select user</option>

                {users.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.name} {user.lastname}
                  </option>
                ))}
              </select>

              <button
                onClick={() => {
                  if (!selectedUser) return

                  onAssignAction(taskId, selectedUser)
                  setSuccessMessage("User assigned successfully.")

                  setTimeout(() => {
                    setSuccessMessage("")
                  }, 3000)
                }}
                className="h-10 rounded-2xl bg-black px-4 text-sm font-medium text-white transition hover:opacity-90"
              >
                Confirm
              </button>
            </div>
          </div>

          <div className="mt-8">
            <p className="mb-2 text-sm text-gray-400">Description</p>
            <div className="rounded-2xl bg-gray-50 p-4 text-sm text-gray-700">
              {task.description || "No description available."}
            </div>
          </div>

          <div className="mt-8">
            <p className="mb-2 text-sm text-gray-400">Comments</p>

            {commentError && (
              <div className="mb-3 rounded-2xl bg-red-100 px-4 py-3 text-sm font-medium text-red-700">
                {commentError}
              </div>
            )}

            <div className="flex gap-3">
              <input
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Write a comment..."
                className="flex-1 h-10 rounded-2xl border border-gray-200 px-4 text-sm outline-none"
              />

              <button
                onClick={handleCreateComment}
                className="h-10
                  rounded-2xl
                  bg-black
                  px-5
                  text-sm
                  font-semibold
                  text-white
                  transition-all
                  duration-150
                  hover:bg-neutral-800
                  hover:shadow-lg
                  active:scale-95
                  active:bg-neutral-900
                  cursor-pointer"
              >
                Add
              </button>
            </div>

            <div className="mt-4 space-y-3">
              {commentsLoading ? (
                <p className="text-sm text-gray-500">Loading comments...</p>
              ) : comments.length === 0 ? (
                <p className="text-sm text-gray-500">No comments yet.</p>
              ) : (
                comments.map((comment) => {
                const commentId = comment.id || comment.commentId || comment.id_comment
                const commentText =
                  comment.content || comment.description || comment.comment || ""

                const authorName =
                  comment.author?.name ||
                  comment.user?.name ||
                  "User"

                const authorLastName =
                  comment.author?.lastname ||
                  comment.user?.lastname ||
                  ""

                const authorInitials = `${authorName[0] || "U"}${authorLastName[0] || ""}`

                const authorPhoto =
                  comment.author?.profilePhoto ||
                  comment.author?.image ||
                  comment.user?.profilePhoto ||
                  comment.user?.image ||
                  ""

                  if (!commentId) return null

                  return (
                  <div
                    key={commentId}
                    className="rounded-2xl border border-gray-200 bg-white p-4"
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-gray-200 text-sm font-semibold text-gray-700">
                        {authorPhoto ? (
                          <img
                            src={authorPhoto}
                            alt={authorName}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          authorInitials
                        )}
                      </div>

                      <div className="flex-1">
                        <p className="text-sm font-semibold text-gray-900">
                          {authorName} {authorLastName}
                        </p>

                        {editingCommentId === commentId ? (
                          <>
                            <input
                              value={editingContent}
                              onChange={(e) => setEditingContent(e.target.value)}
                              className="mt-2 w-full rounded-2xl border border-gray-200 px-4 py-2 text-sm outline-none"
                            />

                            <div className="mt-3 flex gap-2">
                              <button
                                onClick={() => handleUpdateComment(commentId)}
                                className="h-8 rounded-xl bg-black px-3 text-xs font-medium text-white"
                              >
                                Save
                              </button>

                              <button
                                onClick={() => {
                                  setEditingCommentId(null)
                                  setEditingContent("")
                                }}
                                className="h-8 rounded-xl border border-gray-200 px-3 text-xs font-medium"
                              >
                                Cancel
                              </button>
                            </div>
                          </>
                        ) : (
                          <>
                            <p className="mt-1 text-sm text-gray-800">{commentText}</p>

                            <div className="mt-3 flex gap-3">
                              <button
                                onClick={() => {
                                  setEditingCommentId(commentId)
                                  setEditingContent(commentText)
                                }}
                                className="
                                    text-xs
                                    font-medium
                                    text-blue-600
                                    hover:underline
                                    active:scale-95
                                    transition
                                    cursor-pointer
                                    "
                              >
                                Edit
                              </button>

                              <button
                                onClick={() => handleDeleteComment(commentId)}
                                className="
                                    text-xs
                                    font-medium
                                    text-red-500
                                    hover:underline
                                    active:scale-95
                                    transition
                                    cursor-pointer
                                    "
                              >
                                Delete
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                )
                })
              )}
            </div>
          </div>
        </div>

        <div className="mt-8 flex justify-end gap-3">
          <button
            onClick={() => onDeleteAction(taskId)}
            className="h-10 rounded-2xl bg-red-500 px-5 text-sm font-medium text-white transition hover:bg-red-600"
          >
            Delete
          </button>

          <button
            onClick={onCloseAction}
            className="h-10 rounded-2xl border border-gray-200 px-5 text-sm font-medium transition hover:bg-gray-100"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}