"use client"
import { slugify } from "@/lib/slug";
import { useRef, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { getProjects } from "@/services/projectService"
import { getUsersDirectory, UserDirectoryEntry } from "@/services/userService"
import { getAllProjectMembers, ProjectMember } from "@/services/memberService"
import FramedAvatar from "@/components/ui/avatar/FramedAvatar"
import type { Project as ProjectType } from '@/types/project'

type Risk = "low" | "medium" | "high"

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

function SkeletonCard() {
  return (
    <div
      className="flex-shrink-0 rounded-xl border border-zinc-200 bg-zinc-50 p-4 animate-pulse"
      style={{ width: '340px', height: '170px' }}
    >
      <div className="h-3 w-2/3 bg-zinc-200 rounded mb-2" />
      <div className="h-2.5 w-full bg-zinc-100 rounded mb-1" />
      <div className="h-2.5 w-4/5 bg-zinc-100 rounded mb-auto" />
      <div className="mt-auto pt-6 flex items-center justify-between">
        <div className="flex gap-1">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-6 w-6 rounded-full bg-zinc-200" />
          ))}
        </div>
        <div className="h-6 w-16 rounded-md bg-zinc-200" />
      </div>
    </div>
  )
}
  
function ProjectCard({ project, usersById, members }: { project: ProjectType; usersById: Record<string, UserDirectoryEntry>; members: ProjectMember[] }) {
  const router = useRouter()
  const [expanded, setExpanded] = useState(false)
  const [isOverflowing, setIsOverflowing] = useState(false)
  const descRef = useRef<HTMLParagraphElement>(null)

  useEffect(() => {
    if (descRef.current) {
      setIsOverflowing(descRef.current.scrollHeight > descRef.current.clientHeight)
    }
  }, [])

  const priority = project.priority || 'Medium'
  const riskKey = (priority as string).toLowerCase() as Risk
  const risk = riskConfig[riskKey]

  const displayMembers = members
    .map((member) => {
      const user = usersById[member.userId]
      if (!user) return null
      return {
        id: member.userId,
        label: `${user.name} ${user.lastname}`.trim() || user.email,
        profileImageUrl: user.profileImageUrl,
      }
    })
    .filter((m): m is { id: string; label: string; profileImageUrl: string | null } => Boolean(m))

  return (
    <div
      onClick={() => router.push(`/projects/${slugify(project.name)}/tasks`)}
      className="flex-shrink-0 flex flex-col justify-between rounded-xl border border-zinc-200 bg-zinc-50 p-4 transition-all duration-200 cursor-pointer hover:border-zinc-300 hover:shadow-sm"
      style={{ width: '340px', minHeight: '170px', height: expanded ? 'auto' : '170px' }}
    >
      <div className="flex flex-col gap-1">
        <p className="text-sm font-semibold text-zinc-900">{project.name}</p>
        <p
          ref={descRef}
          className={`text-xs text-zinc-500 leading-relaxed ${!expanded ? 'line-clamp-1' : ''}`}
        >
          {project.description}
        </p>
        {isOverflowing && (
          <button
            onClick={(e) => { e.stopPropagation(); setExpanded(v => !v) }}
            className="text-[11px] text-zinc-400 hover:text-zinc-600 text-left w-fit"
          >
            {expanded ? 'see less' : 'see more'}
          </button>
        )}
      </div>

      <div className="flex items-center justify-between">
        <div className="flex -ml-1.5">
          {(project.team ?? []).slice(0, 3).map((member, i) => (
            <div
              key={i}
              className="first:ml-0 -ml-1.5 flex h-6 w-6 items-center justify-center rounded-full border-2 border-white bg-amber-300 text-[9px] font-semibold text-amber-900"
            >
              {member.slice(0, 2).toUpperCase()}
            </div>
          ))}
          {project.team && project.team.length > 3 && (
            <div className="-ml-1.5 flex h-6 w-6 items-center justify-center rounded-full border-2 border-white bg-amber-200 text-[9px] font-semibold text-amber-900">
              +{project.team.length - 3}
            </div>
          )}
        </div>

        <div className="flex flex-col items-end gap-2">
          <span className={`inline-flex w-fit items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium ${risk.badge}`}>
            <span className={`h-1.5 w-1.5 rounded-full ${risk.dot}`} />
            {risk.label}
          </span>
          <p className="text-[11px] text-zinc-400">{formatDate(project.endDate)}</p>
        </div>
      </div>
    </div>
  )
}

export default function Carrousel() {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [projects, setProjects] = useState<ProjectType[] | null>(null)
  const [loading, setLoading] = useState(true)
  const [usersById, setUsersById] = useState<Record<string, UserDirectoryEntry>>({})
  const [membersByProject, setMembersByProject] = useState<Record<string, ProjectMember[]>>({})

  useEffect(() => {
    let mounted = true

    async function load() {
      try {
        const data = await getProjects()
        if (!mounted) return
        setProjects(data)
      } catch {
        if (!mounted) return
        setProjects([])
      } finally {
        if (mounted) setLoading(false)
      }
    }

    load()
    return () => { mounted = false }
  }, [])

  useEffect(() => {
    let mounted = true

    async function loadMembers() {
      try {
        const [users, grouped] = await Promise.all([
          getUsersDirectory(),
          getAllProjectMembers(),
        ])
        if (!mounted) return
        setUsersById(
          users.reduce<Record<string, UserDirectoryEntry>>((acc, u) => {
            acc[u.id] = u
            return acc
          }, {})
        )
        setMembersByProject(grouped)
      } catch {
        // Sin miembros/fotos: las tarjetas caen al placeholder de avatar.
      }
    }

    loadMembers()

    return () => { mounted = false }
  }, [])

  return (
    <div className="w-full py-4">
      <div
        ref={scrollRef}
        className="overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden px-8"
      >
        <div className="flex gap-3 items-stretch">
          {loading
            ? [...Array(3)].map((_, i) => <SkeletonCard key={i} />)
            : projects?.map((project) => (
                <ProjectCard key={project.id} project={project} usersById={usersById} members={membersByProject[project.id] || []} />
              ))
          }
          <div className="flex-shrink-0 w-4" />
        </div>
      </div>
    </div>
  )
}