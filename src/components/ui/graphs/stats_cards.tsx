import { useState, useEffect } from 'react'
import { getProjects } from '@/services/projectService'
import { getProjectTasks } from '@/services/taskService'
import { getToken } from '@/lib/auth'

interface Stat {
  label: string
  value: number
}

export default function StatsRow() {
  const [stats, setStats] = useState<Stat[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchStats() {
      try {
        const token = getToken()!
        const projects = await getProjects()

        const allTasks = await Promise.all(
          projects.map((p) => getProjectTasks(p.id, token))
        )

        const totalTareas = allTasks.reduce((acc, tasks) => acc + tasks.length, 0)

        setStats([
          { label: 'Proyectos', value: projects.length },
          { label: 'Tareas',    value: totalTareas },
        ])
      } catch {
        setError('No se pudieron cargar las estadísticas')
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-3">
        {[...Array(2)].map((_, i) => (
          <div key={i} className="rounded-xl border border-zinc-200 bg-white shadow-sm px-4 py-4 animate-pulse">
            <div className="h-3 w-20 bg-zinc-100 rounded mb-3" />
            <div className="h-8 w-12 bg-zinc-100 rounded" />
          </div>
        ))}
      </div>
    )
  }

  if (error) {
    return <p className="text-sm text-red-500">{error}</p>
  }

  return (
    <div className="grid grid-cols-1 gap-7">
      {stats.map((s) => (
        <div key={s.label} className="rounded-xl border border-zinc-200 bg-white shadow-sm px-4 py-4">
          <p className="text-xs text-zinc-400">{s.label}</p>
          <p className="text-3xl font-semibold text-zinc-900 mt-1">{s.value}</p>
        </div>
      ))}
    </div>
  )
}