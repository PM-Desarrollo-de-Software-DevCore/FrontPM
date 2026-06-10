import { useState, useEffect } from 'react'
import { getProjects } from '@/services/projectService'
import { getSearchIndex } from '@/services/searchService'
import { getUsersDirectory } from '@/services/userService'

interface Stat {
  label: string
  value: number
  sub?: string
  progress?: number
}

export default function StatsRow() {
  const [stats, setStats] = useState<Stat[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchStats() {
      try {
        const [projects, users, searchIndex] = await Promise.all([
          getProjects(),
          getUsersDirectory(),
          getSearchIndex(),
        ])

        const tasks = searchIndex.tasks
        const assignedUserIds = new Set(
          tasks.map((t) => t.assignedTo).filter(Boolean)
        )
        const usersWithTasks = assignedUserIds.size
        const progress = users.length
          ? Math.round((usersWithTasks / users.length) * 100)
          : 0

        setStats([
          { label: 'Proyectos', value: projects.length },
          { label: 'Tareas', value: tasks.length },
          { label: 'Usuarios', value: users.length },
          {
            label: 'User with assigned tasks',
            value: usersWithTasks,
            sub: `${progress}% of users`,
            progress,
          },
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
      <div className="grid grid-cols-2 gap-3">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="h-24 rounded-xl border border-zinc-200 bg-white shadow-sm p-3 animate-pulse flex flex-col justify-between"
          >
            <div className="h-2.5 w-14 bg-zinc-100 rounded" />
            <div className="h-6 w-8 bg-zinc-100 rounded" />
          </div>
        ))}
      </div>
    )
  }

  if (error) return <p className="text-sm text-red-500">{error}</p>

  return (
    <div className="grid grid-cols-2 gap-3">
      {stats.map((s, i) => (
        <div
          key={s.label}
          className={`h-24 rounded-xl border border-zinc-200 bg-white shadow-sm p-3 flex flex-col justify-between ${i < 2 ? '-mt-0' : 'mt-2'}`}
        >
          <p className="text-xs text-zinc-400 leading-tight">{s.label}</p>
          <div>
            <p className="text-2xl font-semibold text-zinc-900">{s.value}</p>
            {s.progress !== undefined && (
              <div className="mt-1.5 h-1 rounded-full bg-zinc-100 overflow-hidden">
                <div
                  className="h-full rounded-full bg-emerald-500 transition-all"
                  style={{ width: `${s.progress}%` }}
                />
              </div>
            )}
            {s.sub && <p className="text-[10px] text-zinc-400 mt-0.5">{s.sub}</p>}
          </div>
        </div>
      ))}
    </div>
  )
}