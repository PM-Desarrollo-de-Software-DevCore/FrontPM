"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import CreateProjectModal from "@/components/project/CreateProjectModal";
import { Project } from "@/types/project";
import { getProjects } from "@/services/projectService";
import { getNonAdminUsers, UserOption } from "@/services/userService";
import { getProjectMembers, ProjectMember } from "@/services/memberService";

const initialProjects: Project[] = [
  {
    id: "apollo-control",
    name: "Apollo Control",
    description:
      "Real-time project management platform for planning, tracking, and delivery.",
    status: "In Progress",
    progress: 70,
    tasks: 18,
    owner: "DevCore Team",
    startDate: "2026-04-01",
    endDate: "2026-05-15",
    priority: "High",
    team: ["Frontend", "Backend", "QA"],
  },
  {
    id: "mobile-app",
    name: "Mobile App",
    description: "Mobile application for task tracking and team collaboration.",
    status: "Completed",
    progress: 100,
    tasks: 10,
    owner: "UX Team",
    startDate: "2026-04-10",
    endDate: "2026-06-01",
    priority: "Medium",
    team: ["UX", "Frontend"],
  },
  {
    id: "risk-engine",
    name: "Risk Engine",
    description: "Risk calculation and analytics module for project insights.",
    status: "Completed",
    progress: 100,
    tasks: 24,
    owner: "Backend Team",
    startDate: "2026-03-01",
    endDate: "2026-04-05",
    priority: "High",
    team: ["Backend", "Data"],
  },
  {
    id: "dashboard-ui",
    name: "Dashboard UI",
    description: "Design and implementation of the main dashboard interface.",
    status: "In Progress",
    progress: 55,
    tasks: 12,
    owner: "Frontend Team",
    startDate: "2026-04-05",
    endDate: "2026-05-20",
    priority: "Medium",
    team: ["Frontend", "Design"],
  },
  {
    id: "api-integration",
    name: "API Integration",
    description: "Frontend and backend integration for project workflows.",
    status: "Planning",
    progress: 10,
    tasks: 8,
    owner: "Fullstack Team",
    startDate: "2026-04-15",
    endDate: "2026-06-10",
    priority: "High",
    team: ["Frontend", "Backend"],
  },
  {
    id: "client-portal",
    name: "Client Portal",
    description: "Portal for client visibility, updates, and milestone tracking.",
    status: "Planning",
    progress: 15,
    tasks: 14,
    owner: "Product Team",
    startDate: "2026-04-22",
    endDate: "2026-06-18",
    priority: "Low",
    team: ["Product", "Frontend"],
  },
];

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
  const [projects, setProjects] = useState<Project[]>(initialProjects);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [usersById, setUsersById] = useState<Record<string, UserOption>>({});

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
        // Mantener los datos iniciales en caso de error
        setProjects(initialProjects);
      } finally {
        setLoading(false);
      }
    };

    loadProjects();
  }, []);

  useEffect(() => {
    const loadUsers = async () => {
      try {
        const users = await getNonAdminUsers();
        setUsersById(
          users.reduce<Record<string, UserOption>>((acc, user) => {
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
    <main className="min-h-screen w-full flex-1 bg-white px-8 py-8">
        <div className="w-full">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-700">Projects</h1>
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
          <section className="grid w-full grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
            {projects.map((project, index) => (
              <ProjectCard
                key={`${project.id || project.name}-${index}`}
                project={project}
                onEdit={() => setEditingProject(project)}
                usersById={usersById}
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
      />
    </main>
  );
}

interface ProjectCardProps {
  project: Project;
  usersById: Record<string, UserOption>;
  onEdit: () => void;
}

function ProjectCard({ project, usersById, onEdit }: ProjectCardProps) {
  const [members, setMembers] = useState<ProjectMember[]>([]);

  useEffect(() => {
    let isMounted = true;

    const loadMembers = async () => {
      try {
        const projectMembers = await getProjectMembers(project.id);

        if (isMounted) {
          setMembers(projectMembers);
        }
      } catch (err) {
        console.error(`Error loading members for project ${project.id}:`, err);
        if (isMounted) {
          setMembers([]);
        }
      }
    };

    loadMembers();

    return () => {
      isMounted = false;
    };
  }, [project.id]);

  const displayMembers = members
    .map((member) => {
      const user = usersById[member.userId];

      if (user) {
        return {
          id: member.userId,
          label: `${user.name} ${user.lastname}`.trim() || user.email,
        };
      }

      return null;
    })
    .filter((member): member is { id: string; label: string } => Boolean(member));

  return (
    <article className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm transition hover:shadow-md">
      <div className="mb-2 flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-semibold text-zinc-900">{project.name}</h2>

          <button
            type="button"
            onClick={onEdit}
            className="cursor-pointer text-zinc-500 transition hover:text-zinc-700"
            aria-label={`Edit ${project.name}`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
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
          className={`rounded-md px-2 py-0.5 text-[10px] font-semibold ${getStatusClasses(
            project.status
          )}`}
        >
          {project.status}
        </span>
      </div>

      <div className="mb-3 h-px bg-zinc-300" />

      <p className="mb-4 text-xs leading-5 text-zinc-500">{project.description}</p>

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
              className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-white bg-amber-300 text-[10px] font-semibold text-zinc-800"
              title={member.label}
            >
              {member.label.slice(0, 2).toUpperCase()}
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
          <span>{project.tasks} issues</span>
        </div>
      </div>

      <Link
        href={`/projects/${project.id}/tasks`}
        className="inline-flex w-full items-center justify-center rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm font-semibold text-zinc-700 transition hover:bg-zinc-100"
      >
        View Tasks
      </Link>
    </article>
  );
}