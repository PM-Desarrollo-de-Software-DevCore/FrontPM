"use client";

import { useRef, useState, useEffect } from "react";
import Link from "next/link";
import CreateProjectModal from "@/components/project/CreateProjectModal";
import { Project } from "@/types/project";
import { getProjects } from "@/services/projectService";
import { getProjectsStats } from "@/services/milestonesService";
import { getNonAdminUsers, UserOption } from "@/services/userService";
import { getAllProjectMembers, ProjectMember } from "@/services/memberService";
import FramedAvatar from "@/components/ui/avatar/FramedAvatar";
import { slugify } from "@/lib/slug";

function formatDate(date: string) {
  const parsedDate = new Date(date);

  return parsedDate.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function getStatusClasses(status: Project["status"]) {
  switch (status) {
    case "Completed":
      return "bg-green-100 text-green-700";
    case "In Progress":
      return "bg-red-100 text-red-700";
    case "Planning":
      return "bg-zinc-200 text-zinc-700";
    default:
      return "bg-zinc-200 text-zinc-700";
  }
}

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [usersById, setUsersById] = useState<Record<string, UserDirectoryEntry>>({});
  const [membersByProject, setMembersByProject] = useState<Record<string, ProjectMember[]>>({});
  const [taskCountByProject, setTaskCountByProject] = useState<Record<string, number>>({});

  // Cargar proyectos del backend al montar el componente
  useEffect(() => {
    const loadProjects = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getProjects();
        setProjects(data);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Error al cargar proyectos";
        setError(errorMessage);
        console.error("Error loading projects:", err);
      } finally {
        setLoading(false);
      }
    };

    loadProjects();
  }, []);

  useEffect(() => {
    const loadUsers = async () => {
      try {
        const users = await getUsersDirectory();
        setUsersById(
          users.reduce<Record<string, UserDirectoryEntry>>((acc, user) => {
            acc[user.id] = user;
            return acc;
          }, {})
        );
      } catch (err) {
        console.error("Error loading users for project members:", err);
      }
    };

    loadUsers();
  }, []);

  // Miembros de TODOS los proyectos en 1 request (antes: getProjectMembers por tarjeta = N requests)
  useEffect(() => {
    const loadMembers = async () => {
      try {
        const grouped = await getAllProjectMembers();
        setMembersByProject(grouped);
      } catch (err) {
        console.error("Error loading project members:", err);
      }
    };

    loadMembers();
  }, []);

  // Conteo real de tareas por proyecto (el endpoint /projects no lo devuelve).
  // Se obtiene del agregado de dashboard projects-stats.
  useEffect(() => {
    const loadTaskCounts = async () => {
      try {
        const stats = await getProjectsStats();
        setTaskCountByProject(
          stats.reduce<Record<string, number>>((acc, item) => {
            acc[item.id_project] = item.totalTasks;
            return acc;
          }, {})
        );
      } catch (err) {
        console.error("Error loading project task counts:", err);
      }
    };

    loadTaskCounts();
  }, []);

  const handleCreateProject = (project: Project) => {
    setProjects((prevProjects) => [project, ...prevProjects]);
  };

  const handleSaveProject = (updatedProject: Project) => {
    setProjects((prevProjects) =>
      prevProjects.map((project) =>
        project.id === updatedProject.id ? updatedProject : project
      )
    );
    setEditingProject(null);
  };

  return (
    <main className="min-h-screen w-full flex-1 px-8 py-8">
        <div className="w-full">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-strong">Projects</h1>
          </div>

          <CreateProjectModal onCreate={handleCreateProject} />
        </div>

        {error && (
          <div className="mb-5 rounded-md bg-red-50 p-4 text-sm text-red-700 border border-red-200">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="mb-3 inline-block">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-zinc-300 border-t-black"></div>
              </div>
              <p className="text-zinc-600">Cargando proyectos...</p>
            </div>
          </div>
        ) : (
          <section className="grid w-full auto-rows-fr grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
            {projects.map((project, index) => (
              <ProjectCard
                key={`${project.id || project.name}-${index}`}
                project={project}
                onEdit={() => setEditingProject(project)}
                usersById={usersById}
                members={membersByProject[project.id] || []}
                taskCount={taskCountByProject[project.id] ?? project.tasks}
              />
            ))}
          </section>
        )}
      </div>

      <CreateProjectModal
        project={editingProject}
        open={Boolean(editingProject)}
        onClose={() => setEditingProject(null)}
        onUpdate={handleSaveProject}
        showTrigger={false}
      />
    </main>
  );
}

interface ProjectCardProps {
  project: Project;
  usersById: Record<string, UserDirectoryEntry>;
  members: ProjectMember[];
  taskCount: number;
  onEdit: () => void;
}

function ProjectCard({ project, usersById, members, taskCount, onEdit }: ProjectCardProps) {
  const [expanded, setExpanded] = useState(false);
  const descRef = useRef<HTMLParagraphElement>(null);
  const [isOverflowing, setIsOverflowing] = useState(false);

  useEffect(() => {
    if (descRef.current) {
      setIsOverflowing(descRef.current.scrollHeight > descRef.current.clientHeight)
    }
  }, [])

  const displayMembers = members
    .map((member) => {
      const user = usersById[member.userId];

      if (user) {
        return {
          id: member.userId,
          label: `${user.name} ${user.lastname}`.trim() || user.email,
          image: user.profileImageUrl ?? null,
        };
      }

      return null;
    })
    .filter(
      (member): member is { id: string; label: string; image: string | null } =>
        Boolean(member)
    );

  return (
    <article className="flex h-full flex-col rounded-xl border border-zinc-200 bg-white p-4 shadow-sm transition hover:shadow-md">
      <div className="mb-2 flex items-start justify-between gap-3">
        <div className="flex min-w-0 flex-1 items-center gap-2">
          <h2
            className="min-w-0 flex-1 truncate text-lg font-semibold text-zinc-900"
            title={project.name}
          >
            {project.name}
          </h2>

          <button
            type="button"
            onClick={onEdit}
            className="shrink-0 cursor-pointer text-zinc-500 transition hover:text-zinc-700"
            aria-label={`Edit ${project.name}`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15.232 5.232l3.536 3.536M9 11l6.768-6.768a2.5 2.5 0 113.536 3.536L12.536 14.536A2 2 0 0111.121 15H8v-3.121A2 2 0 018.586 10.95L9 11z"
              />
            </svg>
          </button>
        </div>

        <span
          className={`shrink-0 rounded-md px-2 py-0.5 text-[10px] font-semibold ${getStatusClasses(
            project.status
          )}`}
        >
          {project.status}
        </span>
      </div>

      <div className="mb-3 h-px bg-zinc-300" />

      
      {/* <p className="mb-4 text-xs leading-5 text-zinc-500">{project.description}</p> */}
      <div className="hrink-0 flex flex-col justify-between  transition-all duration-200"
        style={{ minHeight: 50, height: expanded ? 'auto' : 50 }}>
        <div className="flex flex-col gap-1">
          <p
            ref={descRef}
            className={`text-xs text-zinc-500 leading-relaxed ${!expanded ? 'line-clamp-1' : ''}`}
          >
            {project.description}
          </p>
          {isOverflowing && (
            <button
              onClick={() => setExpanded(e => !e)}
              className="text-[11px] text-zinc-400 hover:text-zinc-600 text-left w-fit"
            >
              {expanded ? 'see less' : 'see more'}
            </button>
          )}
        </div>
      </div>
      

      <div className="mb-4">
        <p className="text-xs font-semibold text-red-400">
          Deadline : {formatDate(project.endDate).toUpperCase()}
        </p>
      </div>

      <div className="mb-4 flex items-center justify-between">
        <div className="flex -space-x-2">
          {displayMembers.slice(0, 4).map((member, index) => (
            <div
              key={`${project.id}-${member.id}-${index}`}
              className="flex h-7 w-7 items-center justify-center overflow-hidden rounded-full border-2 border-white bg-amber-300 text-[10px] font-semibold text-zinc-800"
              title={member.label}
            >
              {member.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={member.image}
                  alt={member.label}
                  className="h-full w-full object-cover"
                />
              ) : (
                member.label.slice(0, 2).toUpperCase()
              )}
            </div>
          ))}

          {displayMembers.length > 4 && (
            <div className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-white bg-rose-100 text-[10px] font-semibold text-rose-500">
              +{displayMembers.length - 4}
            </div>
          )}
        </div>

        <div className="flex items-center gap-1 text-xs text-zinc-400">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-3.5 w-3.5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9 12h6m-6 4h6M7 4h10a2 2 0 012 2v12a2 2 0 01-2 2H7a2 2 0 01-2-2V6a2 2 0 012-2z"
            />
          </svg>
          <span>{taskCount} tasks</span>
        </div>
      </div>

      <div className="mt-auto flex gap-2">
        <Link
          href={`/projects/${slugify(project.name)}/tasks`}
          className="inline-flex flex-1 items-center justify-center rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm font-semibold text-zinc-700 transition hover:bg-zinc-100"
        >
          View Tasks
        </Link>

        <Link
          href={`/projects/${slugify(project.name)}/progress`}
          className="inline-flex flex-1 items-center justify-center rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm font-semibold text-zinc-700 transition hover:bg-zinc-100"
        >
          Progress
        </Link>
      </div>
    </article>
  );
}