"use client"

import { useRef } from "react"

type Risk = "low" | "medium" | "high"

type Project = {
  id: number
  name: string
  description: string
  endDate: string
  team: string[]
  tasks: number
  risk: Risk
}

const projects: Project[] = [
  {
    id: 1,
    name: "Sistema de Gestión",
    description: "Administra tareas y equipos",
    endDate: "2026-05-10",
    team: ["Ana", "Luis", "Carlos", "Sofía", "Miguel"],
    tasks: 12,
    risk: "high",
  },
  {
    id: 2,
    name: "App Ecológica",
    description: "Recolección de datos ambientales",
    endDate: "2026-06-01",
    team: ["Laura", "Pedro"],
    tasks: 5,
    risk: "medium",
  },
  {
    id: 3,
    name: "Sistema de Gestión",
    description: "Recolección de datos ambientales",
    endDate: "2026-06-01",
    team: ["Laura", "Pedro"],
    tasks: 5,
    risk: "low",
  },
  {
    id: 4,
    name: "App Ecológica",
    description: "Recolección de datos ambientales",
    endDate: "2026-06-01",
    team: ["Laura", "Pedro"],
    tasks: 5,
    risk: "medium",
  },
]

const riskConfig: Record<Risk, { label: string; dot: string; badge: string }> = {
  low:    { label: "Low",    dot: "bg-green-500",  badge: "bg-green-50 text-green-800" },
  medium: { label: "Medium", dot: "bg-amber-400",  badge: "bg-amber-50 text-amber-800" },
  high:   { label: "High",   dot: "bg-red-400",    badge: "bg-red-50 text-red-800" },
}

function formatDate(date: string) {
  return new Date(date)
    .toLocaleDateString("es-MX", { day: "2-digit", month: "short", year: "numeric" })
    .toUpperCase()
}

export default function Carrousel() {
  const scrollRef = useRef<HTMLDivElement>(null)

  return (
    <div className="w-full p-4">
      <div
        ref={scrollRef}
        className="overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        <div className="flex gap-3">
          {projects.map((project) => {
            const risk = riskConfig[project.risk]
            return (
              <div
                key={project.id}
                // calc(33% - gap) en desktop → siempre se ven ~3 y pico → hay scroll
                // en móvil muestra ~1.2 cards
                className="flex-shrink-0 flex flex-col gap-3 rounded-xl border border-zinc-200 bg-zinc-50 p-4"
                style={{ width: "clamp(240px, 30%, 320px)" }}
              >
                <div className="flex flex-col gap-1">
                  <p className="text-sm font-semibold text-zinc-900">{project.name}</p>
                  <p className="text-xs text-zinc-500 leading-relaxed">{project.description}</p>
                </div>

                <p className="text-[11px] text-zinc-400">{formatDate(project.endDate)}</p>

                <div className="flex items-center justify-between">
                  <div className="flex">
                    {project.team.slice(0, 3).map((member, i) => (
                      <div
                        key={i}
                        className="-ml-1.5 first:ml-0 flex h-6 w-6 items-center justify-center rounded-full border-2 border-white bg-amber-300 text-[9px] font-semibold text-amber-900"
                      >
                        {member.slice(0, 2).toUpperCase()}
                      </div>
                    ))}
                    {project.team.length > 3 && (
                      <div className="-ml-1.5 flex h-6 w-6 items-center justify-center rounded-full border-2 border-white bg-amber-200 text-[9px] font-semibold text-amber-900">
                        +{project.team.length - 3}
                      </div>
                    )}
                  </div>
                  <span className="text-xs text-zinc-400">{project.tasks} issues</span>
                </div>

                <span className={`inline-flex w-fit items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium ${risk.badge}`}>
                  <span className={`h-1.5 w-1.5 rounded-full ${risk.dot}`} />
                  {risk.label}
                </span>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}