import { getToken } from "@/lib/auth"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"

export type NotificationCategory =
  | "project_created"
  | "project_completed"
  | "project_member_added"
  | "task_assigned"
  | "task_commented"
  | "task_overdue"
  | "admin_user_created"
  | "admin_user_updated"
  | "admin_user_deleted"

export interface NotificationRecord {
  id_notification: string
  recipientUserId: string
  actorUserId: string | null
  category: NotificationCategory | string
  title: string
  message: string
  relatedType: string | null
  relatedId: string | null
  dedupeKey: string | null
  readAt: string | null
  createdAt: string
}

export interface NotificationFeed {
  notifications: NotificationRecord[]
  unreadCount: number
}

function getAuthHeaders(): Record<string, string> {
  const token = getToken()
  return {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
  }
}

export async function getMyNotifications(limit = 20): Promise<NotificationFeed> {
  const response = await fetch(`${API_URL}/notifications/me?limit=${limit}`, {
    method: "GET",
    headers: getAuthHeaders(),
    cache: "no-store",
  })

  if (!response.ok) {
    return { notifications: [], unreadCount: 0 }
  }

  const data = await response.json()
  return data.data || data || { notifications: [], unreadCount: 0 }
}

export async function markAllNotificationsAsRead(): Promise<number> {
  const response = await fetch(`${API_URL}/notifications/me/read-all`, {
    method: "PATCH",
    headers: getAuthHeaders(),
  })

  if (!response.ok) {
    return 0
  }

  const data = await response.json()
  return data.data?.updated ?? 0
}