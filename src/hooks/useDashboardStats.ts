"use client"

import { useState, useEffect } from "react"


export type TaskByStatus = {
  status: "pending" | "in_progress" | "completed" | "on_hold"
  count: number
}

export type DashboardSummary = {
  totalTasks: number
  completedTasks: number
  inProgressTasks: number
  pendingTasks: number
  overdueTasks: number
  unassignedTasks: number
  completionPercentage: number
  highPriorityTasks: number
  mediumPriorityTasks: number
  lowPriorityTasks: number
}

export type DashboardData = {
  summary: DashboardSummary
  tasksByStatus: TaskByStatus[]
  tasksByPriority: { priority: string; count: number }[]
  tasksByProject: {
    id_project: string
    name: string
    totalTasks: number
    completedTasks: number
    inProgressTasks: number
    pendingTasks: number
    overdueTasks: number
    completionPercentage: number
  }[]
  myTasks: {
    totalTasks: number
    completedTasks: number
    inProgressTasks: number
    pendingTasks: number
    overdueTasks: number
  }
}


export type UserTask = {
  id_task: string
  title: string
  description: string
  task_number: number
  progress: number
  priority: "low" | "medium" | "high"
  status: "pending" | "in_progress" | "completed" | "on_hold"
  start_date: string
  end_date: string
  project: { id_project: string; name: string }
  isOverdue: boolean
}

export type UserTasksData = {
  total: number
  tasks: UserTask[]
}



type FiltersOptions = {
  sprint?: string
  project?: string
}

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"

const getHeaders = (token: string) => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${token}`,
})


export function useDashboardStats(filters?: FiltersOptions) {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true)
      setError(null)

      const token = localStorage.getItem("authToken")
      if (!token) { setError("No hay sesión activa"); setLoading(false); return }

      try {
        const params = new URLSearchParams()
        if (filters?.sprint) params.append("sprint", filters.sprint)
        if (filters?.project) params.append("project", filters.project)
        const query = params.toString() ? `?${params.toString()}` : ""

        const res = await fetch(`${BASE_URL}/dashboard/tasks-stats${query}`, {
          method: "GET",
          headers: getHeaders(token),
        })

        if (res.status === 401) { setError("Sesión expirada, vuelve a iniciar sesión"); return }
        if (!res.ok) throw new Error(`Error ${res.status}: ${res.statusText}`)

        const json = await res.json()
        if (!json.success) throw new Error("La respuesta del servidor indica fallo")

        setData(json.data)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error desconocido")
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [filters?.sprint, filters?.project])

  return { data, loading, error }
}


export function useUserTasks(filters?: FiltersOptions) {
  const [data, setData] = useState<UserTasksData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchTasks = async () => {
      setLoading(true)
      setError(null)

      const token = localStorage.getItem("authToken")
      if (!token) { setError("No hay sesión activa"); setLoading(false); return }

      try {
        const params = new URLSearchParams()
        if (filters?.sprint) params.append("sprint", filters.sprint)
        if (filters?.project) params.append("project", filters.project)
        const query = params.toString() ? `?${params.toString()}` : ""

        const res = await fetch(`${BASE_URL}/dashboard/user-tasks${query}`, {
          method: "GET",
          headers: getHeaders(token),
        })

        if (res.status === 401) { setError("Sesión expirada, vuelve a iniciar sesión"); return }
        if (!res.ok) throw new Error(`Error ${res.status}: ${res.statusText}`)

        const json = await res.json()
        if (!json.success) throw new Error("La respuesta del servidor indica fallo")

        setData(json.data)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error desconocido")
      } finally {
        setLoading(false)
      }
    }

    fetchTasks()
  }, [filters?.sprint, filters?.project])

  return { data, loading, error }
}

export type DailyCompletion = {
  date: string
  dayOfWeek: string
  completed: number
}

export type WeeklyProgressData = {
  weekRange: {
    start: string
    end: string
    weekOffset: number
  }
  totalCompleted: number
  dailyCompletions: DailyCompletion[]
}

export function useWeeklyProgress() {
  const [data, setData] = useState<WeeklyProgressData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchWeekly = async () => {
      setLoading(true)
      setError(null)

      const token = localStorage.getItem("authToken")
      if (!token) { setError("No hay sesión activa"); setLoading(false); return }

      try {
        const res = await fetch(`${BASE_URL}/dashboard/weekly-progress`, {
          method: "GET",
          headers: getHeaders(token),
          cache: "no-store",
        })

        if (res.status === 401) { setError("Sesión expirada, vuelve a iniciar sesión"); return }
        if (!res.ok) throw new Error(`Error ${res.status}: ${res.statusText}`)

        const json = await res.json()
        if (!json.success) throw new Error("La respuesta del servidor indica fallo")

        setData(json.data)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error desconocido")
      } finally {
        setLoading(false)
      }
    }

    fetchWeekly()
  }, [])

  return { data, loading, error }
}