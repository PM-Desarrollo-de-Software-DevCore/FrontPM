"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card/card"
import { getProjects } from "@/services/projectService"
import type { Project } from "@/types/project"

const statusStyles: Record<Project["status"], string> = {
  Planning: "bg-amber-100 text-amber-700",
  "In Progress": "bg-sky-100 text-sky-700",
  Completed: "bg-emerald-100 text-emerald-700",
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString("es-ES", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  })
}

export default function ProjectsOverview() {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadProjects() {
      try {
        setLoading(true)
        setError(null)
        const data = await getProjects()
        setProjects(data)
      } catch (err) {
        const message = err instanceof Error ? err.message : "Error al cargar proyectos"
        setError(message)
      } finally {
        setLoading(false)
      }
    }

    loadProjects()
  }, [])

  return (
    <Card className="h-full">
      <CardHeader className="flex items-center justify-between gap-4 pb-4">
        <div>
          <CardTitle>Proyectos recientes</CardTitle>
          <p className="text-sm text-muted">
            Cambios hechos en Projects se muestran aquí.
          </p>
        </div>
        <Link
          href="/projects"
          className="text-sm font-medium text-muted transition hover:text-foreground"
        >
          Ver todos
        </Link>
      </CardHeader>

      <CardContent className="p-0">
        {loading ? (
          <div className="flex h-48 items-center justify-center text-sm text-zinc-500">
            Cargando proyectos...
          </div>
        ) : error ? (
          <div className="p-6 text-sm text-red-600">{error}</div>
        ) : projects.length === 0 ? (
          <div className="p-6 text-sm text-zinc-500">
            No hay proyectos disponibles.
          </div>
        ) : (
          <div className="space-y-3 p-4">
            {projects.slice(0, 3).map((project) => (
              <div
                key={project.id}
                className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-zinc-900">{project.name}</p>
                    <p className="text-xs text-zinc-500">{project.owner}</p>
                  </div>
                  <span
                    className={`rounded-full px-2 py-1 text-[10px] font-semibold ${statusStyles[project.status]}`}
                  >
                    {project.status}
                  </span>
                </div>

                <p className="mt-3 text-xs leading-5 text-zinc-500 line-clamp-2">
                  {project.description}
                </p>

                <div className="mt-4 flex flex-wrap gap-2 text-xs text-zinc-500">
                  <span>Fin: {formatDate(project.endDate)}</span>
                  <span>Progreso: {project.progress}%</span>
                  <span>Tareas: {project.tasks}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
