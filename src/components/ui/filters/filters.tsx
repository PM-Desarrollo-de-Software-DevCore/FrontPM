"use client"

import { useEffect, useRef, useState } from "react"
import { Filter } from "lucide-react"

type FiltersState = {
  project?: string
  dateFrom?: string
  dateTo?: string
}

type FilterOption = {
  value: string
  label: string
}

type FiltersProps = {
  filters: FiltersState
  onChange: (filters: FiltersState) => void
  projects?: Array<string | FilterOption>
}

const fieldItems = ["Proyecto", "Fecha"]

const getToday = () => new Date().toISOString().slice(0, 10)
const getDateNDaysAgo = (days: number) => new Date(Date.now() - days * 864e5).toISOString().slice(0, 10)

export default function Filters({
  filters,
  onChange,
  projects = []
}: FiltersProps) {
  const [open, setOpen] = useState(false)
  const [activeField, setActiveField] = useState("Proyecto")
  const panelRef = useRef<HTMLDivElement | null>(null)

  const projectOptions = projects.map((project) =>
    typeof project === "string"
      ? { value: project, label: project }
      : project
  )

  const defaultProject = projectOptions[0]?.value ?? ""
  const defaultDateFrom = filters.dateFrom || getDateNDaysAgo(7)
  const defaultDateTo = filters.dateTo || getToday()

  useEffect(() => {
    const nextFilters = {
      ...filters,
      project: filters.project || defaultProject,
      dateFrom: filters.dateFrom || defaultDateFrom,
      dateTo: filters.dateTo || defaultDateTo
    }

    if (
      nextFilters.project !== filters.project ||
      nextFilters.dateFrom !== filters.dateFrom ||
      nextFilters.dateTo !== filters.dateTo
    ) {
      onChange(nextFilters)
    }
  }, [filters, defaultProject, defaultDateFrom, defaultDateTo, onChange])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
        setOpen(false)
      }
    }

    if (open) {
      document.addEventListener("mousedown", handleClickOutside)
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [open])

  const handleChange = (key: keyof FiltersState, value: string) => {
    onChange({
      ...filters,
      [key]: value || undefined
    })
  }

  const activeValue =
    activeField === "Proyecto"
      ? filters.project || defaultProject
      : ""

  return (
    <div className="relative inline-block text-left">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-2 text-sm font-semibold text-foreground shadow-sm transition hover:border-primary hover:text-primary"
      >
        <Filter size={18} />
        Filtro
      </button>

      {open ? (
        <div
          ref={panelRef}
          className="absolute right-0 z-50 mt-2 w-[520px] overflow-hidden rounded-3xl border border-border bg-card shadow-xl shadow-black/10"
        >
          <div className="grid sm:grid-cols-[160px_minmax(0,1fr)]">
            <div className="space-y-1 border-l border-border bg-muted p-4">
              {fieldItems.map((item) => (
                <button
                  key={item}
                  type="button"
                  className={`flex w-full items-center justify-between rounded-2xl px-4 py-3 text-left text-sm font-medium transition ${
                    activeField === item
                      ? "bg-card text-primary"
                      : "text-card-foreground hover:bg-card/80"
                  }`}
                  onClick={() => setActiveField(item)}
                >
                  <span>{item}</span>
                  {item !== "Fecha" ? (
                    <span className="rounded-full bg-border px-2 py-0.5 text-[10px] font-semibold text-muted">1</span>
                  ) : null}
                </button>
              ))}
            </div>

            <div className="p-4">
              <div className="mb-4 flex items-center justify-between gap-4 border-b border-border/70 pb-3">
                <div>
                  <p className="text-sm font-semibold text-foreground">{activeField}</p>
                </div>
              </div>

              {activeField === "Proyecto" ? (
                <div className="grid gap-2">
                  {projectOptions.map((project) => (
                    <button
                      key={project.value}
                      type="button"
                      onClick={() => handleChange("project", project.value)}
                      className={`w-full rounded-2xl border px-4 py-3 text-left text-sm transition ${
                        project.value === activeValue
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border bg-card text-foreground hover:bg-muted"
                      }`}
                    >
                      {project.label}
                    </button>
                  ))}
                </div>
              ) : (
                <div className="grid gap-4">
                  <div>
                    <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-muted">
                      Desde
                    </label>
                    <input
                      type="date"
                      value={filters.dateFrom || defaultDateFrom}
                      onChange={(e) => handleChange("dateFrom", e.target.value)}
                      className="w-full rounded-2xl border border-border bg-card px-4 py-3 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-muted">
                      Hasta
                    </label>
                    <input
                      type="date"
                      value={filters.dateTo || defaultDateTo}
                      onChange={(e) => handleChange("dateTo", e.target.value)}
                      className="w-full rounded-2xl border border-border bg-card px-4 py-3 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}
