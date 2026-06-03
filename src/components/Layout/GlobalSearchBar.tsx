"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { useRouter } from "next/navigation"

import { useAuth } from "@/hooks/useAuth"
import { getProjects } from "@/services/projectService"
import { getSearchIndex } from "@/services/searchService"
import { getUsersDirectory, type UserDirectoryEntry } from "@/services/userService"
import { Input } from "@/components/ui/topbar/input"
import type { Project } from "@/types/project"
import type { Sprint } from "@/types/sprint"
import type { Task } from "@/types/task"

type SearchProject = Project

type SearchSprint = Sprint & {
  projectId: string
  projectName: string
}

type SearchTask = Task & {
  projectId: string
  projectName: string
}

type SearchEntry =
  | {
      id: string
      kind: "project"
      label: string
      description: string
      project: SearchProject
    }
  | {
      id: string
      kind: "sprint"
      label: string
      description: string
      sprint: SearchSprint
    }
  | {
      id: string
      kind: "task"
      label: string
      description: string
      task: SearchTask
    }
  | {
      id: string
      kind: "user"
      label: string
      description: string
      user: UserDirectoryEntry
    }

function normalizeText(value: string) {
  return value
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
}

function scoreMatch(value: string, query: string) {
  const normalizedValue = normalizeText(value)
  const normalizedQuery = normalizeText(query)

  if (!normalizedQuery) {
    return 1
  }

  if (normalizedValue.startsWith(normalizedQuery)) {
    return 0
  }

  if (normalizedValue.includes(normalizedQuery)) {
    return 1
  }

  return 2
}

function toFullName(name?: string, lastname?: string) {
  return [name, lastname].filter(Boolean).join(" ").trim()
}

export default function GlobalSearchBar() {
  const router = useRouter()
  const { user } = useAuth()
  const wrapperRef = useRef<HTMLDivElement | null>(null)
  const [query, setQuery] = useState("")
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [projects, setProjects] = useState<SearchProject[]>([])
  const [sprints, setSprints] = useState<SearchSprint[]>([])
  const [tasks, setTasks] = useState<SearchTask[]>([])
  const [users, setUsers] = useState<UserDirectoryEntry[]>([])

  const hasLoadedRef = useRef(false)

  // Carga perezosa: en vez de prefetchear proyectos+sprints+tareas+directorio en
  // CADA pagina (el Topbar es global y se monta en todas las rutas), los datos del
  // buscador se cargan una sola vez cuando el usuario interactua con el (focus/typing).
  const ensureSearchData = useCallback(async () => {
    if (hasLoadedRef.current) return
    hasLoadedRef.current = true

    try {
      setIsLoading(true)

      // 1 request agregada (search-index) en vez de 2*N (sprints+tasks por proyecto).
      const [projectList, index] = await Promise.all([getProjects(), getSearchIndex()])
      const projectNameById = new Map(projectList.map((project) => [project.id, project.name]))

      setProjects(projectList)
      setSprints(
        index.sprints.map((sprint) => ({
          ...sprint,
          projectName: projectNameById.get(sprint.projectId) ?? "",
        }))
      )
      setTasks(
        index.tasks.map((task) => ({
          ...task,
          projectName: projectNameById.get(task.projectId) ?? "",
        }))
      )

      if (user?.role === "admin") {
        const directory = await getUsersDirectory()
        setUsers(directory)
      } else {
        setUsers([])
      }
    } catch (error) {
      console.error("Error loading global search data:", error)
      hasLoadedRef.current = false // permite reintentar en el proximo focus si fallo
    } finally {
      setIsLoading(false)
    }
  }, [user?.role])

  useEffect(() => {
    function handleOutsideClick(event: MouseEvent) {
      if (!wrapperRef.current?.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener("mousedown", handleOutsideClick)
    return () => document.removeEventListener("mousedown", handleOutsideClick)
  }, [])

  const trimmedQuery = query.trim()
  const normalizedQuery = normalizeText(trimmedQuery)
  const placeholder = user?.role === "admin"
    ? "Search projects, sprints, tasks, users"
    : "Search projects, sprints, tasks"

  const directResults = useMemo<SearchEntry[]>(() => {
    if (!normalizedQuery) {
      return []
    }

    const projectMatches = projects
      .filter((project) => {
        const haystacks = [project.name, project.description, project.status, project.owner]
        return haystacks.some((value) => normalizeText(value).includes(normalizedQuery))
      })
      .sort((left, right) => scoreMatch(left.name, trimmedQuery) - scoreMatch(right.name, trimmedQuery))
      .slice(0, 4)
      .map<SearchEntry>((project) => ({
        id: `project-${project.id}`,
        kind: "project",
        label: project.name,
        description: project.description || "Proyecto",
        project,
      }))

    const sprintMatches = sprints
      .filter((sprint) => {
        const haystacks = [sprint.name, sprint.status || "", sprint.projectName]
        return haystacks.some((value) => normalizeText(value).includes(normalizedQuery))
      })
      .sort((left, right) => scoreMatch(left.name, trimmedQuery) - scoreMatch(right.name, trimmedQuery))
      .slice(0, 4)
      .map<SearchEntry>((sprint) => ({
        id: `sprint-${sprint.id}`,
        kind: "sprint",
        label: sprint.name,
        description: sprint.projectName,
        sprint,
      }))

    const taskMatches = tasks
      .filter((task) => {
        const haystacks = [task.title, task.description, task.status, task.projectName]
        return haystacks.some((value) => normalizeText(value).includes(normalizedQuery))
      })
      .sort((left, right) => scoreMatch(left.title, trimmedQuery) - scoreMatch(right.title, trimmedQuery))
      .slice(0, 4)
      .map<SearchEntry>((task) => ({
        id: `task-${task.id}`,
        kind: "task",
        label: task.title,
        description: task.projectName,
        task,
      }))

    const userMatches = user?.role === "admin"
      ? users
          .filter((item) => {
            const haystacks = [item.name, item.lastname, item.email, item.role]
            return haystacks.some((value) => normalizeText(value || "").includes(normalizedQuery))
          })
          .sort((left, right) => scoreMatch(toFullName(left.name, left.lastname), trimmedQuery) - scoreMatch(toFullName(right.name, right.lastname), trimmedQuery))
          .slice(0, 4)
          .map<SearchEntry>((userEntry) => ({
            id: `user-${userEntry.id}`,
            kind: "user",
            label: toFullName(userEntry.name, userEntry.lastname) || userEntry.email,
            description: userEntry.email,
            user: userEntry,
          }))
      : []

    return [...projectMatches, ...sprintMatches, ...taskMatches, ...userMatches]
  }, [normalizedQuery, projects, sprints, tasks, trimmedQuery, user?.role, users])

  const visibleResults = useMemo(() => {
    if (!isOpen) {
      return []
    }

    return directResults
  }, [directResults, isOpen])

  const handleSelect = (entry: SearchEntry) => {
    setIsOpen(false)

    if (entry.kind === "project") {
      router.push(`/projects/${entry.project.id}/tasks`)
      return
    }

    if (entry.kind === "sprint") {
      router.push(`/projects/${entry.sprint.projectId}/tasks?sprintId=${entry.sprint.id}`)
      return
    }

    if (entry.kind === "task") {
      const sprintQuery = entry.task.id_sprint ? `&sprintId=${entry.task.id_sprint}` : ""
      router.push(`/projects/${entry.task.projectId}/tasks?taskId=${entry.task.id}${sprintQuery}`)
      return
    }

    router.push(`/users/create?userId=${entry.user.id}`)
  }

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Escape") {
      setIsOpen(false)
      return
    }

    if (event.key === "Enter") {
      event.preventDefault()
      if (visibleResults.length > 0) {
        handleSelect(visibleResults[0]!)
      }
    }
  }

  return (
    <div ref={wrapperRef} className="relative hidden md:block">
      <div className="flex w-64 items-center gap-2 rounded-2xl border border-sidebar-border bg-background px-3 py-2 shadow-sm transition focus-within:border-primary/40 focus-within:ring-2 focus-within:ring-primary/10 lg:w-96">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M16.65 10.5a6.15 6.15 0 11-12.3 0 6.15 6.15 0 0112.3 0z" />
        </svg>

        <Input
          type="search"
          value={query}
          onChange={(event) => {
            setQuery(event.target.value)
            setIsOpen(true)
            void ensureSearchData()
          }}
          onFocus={() => {
            setIsOpen(true)
            void ensureSearchData()
          }}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="h-auto border-0 bg-transparent px-0 py-0 text-sm shadow-none focus-visible:ring-0"
        />
      </div>

      {isOpen && (
        <div className="absolute left-0 top-[calc(100%+0.5rem)] z-50 w-full overflow-hidden rounded-3xl border border-sidebar-border bg-background shadow-2xl">
          <div className="max-h-96 overflow-y-auto p-2">
            {isLoading ? (
              <div className="px-4 py-3 text-sm text-muted-foreground">Cargando sugerencias...</div>
            ) : visibleResults.length > 0 ? (
              visibleResults.map((entry) => (
                <button
                  key={entry.id}
                  type="button"
                  onClick={() => handleSelect(entry)}
                  className="flex w-full items-start gap-3 rounded-2xl px-4 py-3 text-left transition hover:bg-primary/5"
                >
                  <span className="mt-1 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[11px] font-semibold text-primary">
                    {entry.kind.charAt(0).toUpperCase()}
                  </span>

                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-semibold text-sidebar-foreground">
                      {entry.label}
                    </span>
                    <span className="block truncate text-xs text-sidebar-foreground/70">{entry.description}</span>
                  </span>
                </button>
              ))
            ) : trimmedQuery ? (
              <div className="px-4 py-3 text-sm text-muted-foreground">No se encontraron resultados.</div>
            ) : (
              <div className="px-4 py-3 text-sm text-muted-foreground">Escribe para buscar.</div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}