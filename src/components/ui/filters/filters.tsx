"use client"

import { ChevronDown } from "lucide-react"

type FiltersState = {
  sprint?: string
  project?: string
}

type FiltersProps = {
  filters: FiltersState
  onChange: (filters: FiltersState) => void
  sprints?: string[]
  projects?: string[]
}

export default function Filters({
  filters,
  onChange,
  sprints = [],
  projects = []
}: FiltersProps) {

  const handleChange = (key: keyof FiltersState, value: string) => {
    onChange({
      ...filters,
      [key]: value || undefined
    })
  }

  return (
    <div className="flex flex-col sm:flex-row gap-6 w-full">

    
      <div className="flex flex-col flex-1">
        <label className="text-sm font-medium text-zinc-600 mb-1">
          Sprint
        </label>

        <div className="relative">
          <select
            value={filters.sprint || ""}
            onChange={(e) => handleChange("sprint", e.target.value)}
            className="w-full appearance-none border border-zinc-300 rounded-lg px-4 pr-10 py-3 text-base bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Todos</option>
            {sprints.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>

          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none" size={18} />
        </div>
      </div>


      <div className="flex flex-col flex-1">
        <label className="text-sm font-medium text-zinc-600 mb-1">
          Proyecto
        </label>

        <div className="relative">
          <select
            value={filters.project || ""}
            onChange={(e) => handleChange("project", e.target.value)}
            className="w-full appearance-none border border-zinc-300 rounded-lg px-4 pr-10 py-3 text-base bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Todos</option>
            {projects.map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>

          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none" size={18} />
        </div>
      </div>

    </div>
  )
}