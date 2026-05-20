export type TaskStatus =
  | "pending"
  | "in_progress"
  | "completed"

export type TaskPriority =
  | "low"
  | "medium"
  | "high"

export interface Task {
  id: string

  title: string

  description: string

  progress: number

  assignedTo: string

  end_date: string

  priority: TaskPriority

  status: TaskStatus

  id_sprint?: string | null

  createdAt?: string

  updatedAt?: string
}