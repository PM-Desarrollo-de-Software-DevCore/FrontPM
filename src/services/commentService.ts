import { Comment } from "@/types/comment"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"

async function readBackendErrorMessage(response: Response, fallbackMessage: string) {
  const text = await response.text()

  try {
    const data = JSON.parse(text)
    return data.message || data.error || fallbackMessage
  } catch {
    return text || fallbackMessage
  }
}

export async function getTaskComments(taskId: string, token: string): Promise<Comment[]> {
  const response = await fetch(`${API_URL}/tasks/${taskId}/comments`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  })

  if (!response.ok) {
    throw new Error(await readBackendErrorMessage(response, "Error fetching comments"))
  }

  const data = await response.json()

  const commentsArray = Array.isArray(data)
    ? data
    : data.data || data.comments || []

  return commentsArray.map((comment: Comment) => ({
    ...comment,
    id: comment.id || comment.commentId || comment.id_comment,
    commentId: comment.commentId || comment.id || comment.id_comment,
    content: comment.content || comment.description || comment.comment || "",
    taskId: comment.taskId || comment.id_task,
  }))
}

export async function createTaskComment(
  taskId: string,
  content: string,
  token: string
) {
  const response = await fetch(`${API_URL}/tasks/${taskId}/comments`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
   comment: content,
})
  })

  if (!response.ok) {
    throw new Error(await readBackendErrorMessage(response, "Error creating comment"))
  }

  return response.json()
}

export async function updateComment(
  commentId: string,
  content: string,
  token: string
) {
  const response = await fetch(`${API_URL}/comments/${commentId}`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      comment: content,
    }),
  })

  if (!response.ok) {
    throw new Error(await readBackendErrorMessage(response, "Error updating comment"))
  }

  return response.json()
}

export async function deleteComment(commentId: string, token: string) {
  const response = await fetch(`${API_URL}/comments/${commentId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })

  if (!response.ok) {
    throw new Error(await readBackendErrorMessage(response, "Error deleting comment"))
  }

  return response.json()
}