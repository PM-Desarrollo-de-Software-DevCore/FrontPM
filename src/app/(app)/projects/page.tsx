"use client";

import { useState } from "react";
import Link from "next/link";
import CreateProjectModal from "@/components/project/CreateProjectModal";
import { Project, ProjectPriority, ProjectStatus } from "@/types/project";

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

interface EditProjectModalProps {
  project: Project | null;
  onClose: () => void;
  onSave: (updatedProject: Project) => void;
}

function EditProjectModal({
  project,
  onClose,
  onSave,
}: EditProjectModalProps) {
  const [form, setForm] = useState<Project | null>(project);

  if (!project || !form) return null;

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    onSave({
      ...form,
      team: Array.isArray(form.team)
        ? form.team
        : String(form.team)
            .split(",")
            .map((member) => member.trim())
            .filter(Boolean),
    });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/25 p-6 backdrop-blur-sm"
      onClick={onClose}
    >
      <form
        onSubmit={handleSubmit}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-2xl space-y-5 rounded-2xl border bg-white p-8 shadow-xl"
      >
        <h2 className="text-xl font-semibold text-zinc-900">Edit Project</h2>

        <input
          value={form.name}
          placeholder="Project Name"
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          className="w-full rounded border p-3"
          required
        />

        <input
          value={form.owner}
          placeholder="Project Manager"
          onChange={(e) => setForm({ ...form, owner: e.target.value })}
          className="w-full rounded border p-3"
          required
        />

        <textarea
          value={form.description}
          placeholder="Project Description"
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          className="w-full rounded border p-3"
          required
        />

        <div>
          <label className="mb-1 block text-sm text-zinc-600">Start Date</label>
          <input
            type="date"
            value={form.startDate}
            onChange={(e) => setForm({ ...form, startDate: e.target.value })}
            className="w-full rounded border p-3"
            required
          />
        </div>

        <div>
          <label className="mb-1 block text-sm text-zinc-600">End Date</label>
          <input
            type="date"
            value={form.endDate}
            onChange={(e) => setForm({ ...form, endDate: e.target.value })}
            className="w-full rounded border p-3"
            required
          />
        </div>

        <input
          value={form.team.join(", ")}
          placeholder="Team Members (comma separated)"
          onChange={(e) =>
            setForm({
              ...form,
              team: e.target.value
                .split(",")
                .map((member) => member.trim())
                .filter(Boolean),
            })
          }
          className="w-full rounded border p-3"
          required
        />

        <select
          value={form.priority}
          onChange={(e) =>
            setForm({ ...form, priority: e.target.value as ProjectPriority })
          }
          className="w-full rounded border p-3"
        >
          <option value="High">High Priority</option>
          <option value="Medium">Medium Priority</option>
          <option value="Low">Low Priority</option>
        </select>

        <select
          value={form.status}
          onChange={(e) =>
            setForm({ ...form, status: e.target.value as ProjectStatus })
          }
          className="w-full rounded border p-3"
        >
          <option value="Planning">Planning</option>
          <option value="In Progress">In Progress</option>
          <option value="Completed">Completed</option>
        </select>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="w-full rounded border px-4 py-3"
          >
            Cancel
          </button>

          <button
            type="submit"
            className="w-full rounded bg-black px-4 py-3 text-white"
          >
            Save Changes
          </button>
        </div>
      </form>
    </div>
  );
}

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
    <main className="min-h-screen w-full bg-white px-5 py-6">
      <div className="w-full">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-700">Projects</h1>
          </div>

          <CreateProjectModal onCreate={handleCreateProject} />
        </div>

        <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {projects.map((project) => (
            <article
              key={project.id}
              className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm transition hover:shadow-md"
            >
              <div className="mb-2 flex items-start justify-between gap-3">
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-semibold text-zinc-900">
                    {project.name}
                  </h2>

                  <button
                    type="button"
                    onClick={() => setEditingProject(project)}
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

              <p className="mb-4 text-xs leading-5 text-zinc-500">
                {project.description}
              </p>

              <div className="mb-4">
                <p className="text-xs font-semibold text-red-400">
                  Deadline : {formatDate(project.endDate).toUpperCase()}
                </p>
              </div>

              <div className="mb-4 flex items-center justify-between">
                <div className="flex -space-x-2">
                  {project.team.slice(0, 4).map((member, index) => (
                    <div
                      key={`${project.id}-${member}-${index}`}
                      className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-white bg-amber-300 text-[10px] font-semibold text-zinc-800"
                      title={member}
                    >
                      {member.slice(0, 2).toUpperCase()}
                    </div>
                  ))}

                  {project.team.length > 4 && (
                    <div className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-white bg-rose-100 text-[10px] font-semibold text-rose-500">
                      +{project.team.length - 4}
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
          ))}
        </section>
      </div>

      <EditProjectModal
        project={editingProject}
        onClose={() => setEditingProject(null)}
        onSave={handleSaveProject}
      />
    </main>
  );
}