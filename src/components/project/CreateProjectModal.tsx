"use client";

import { useState } from "react";
import {
  Project,
  ProjectPriority,
  ProjectStatus,
} from "@/types/project";

interface CreateProjectModalProps {
  onCreate: (project: Project) => void;
}

interface ProjectFormState {
  name: string;
  description: string;
  owner: string;
  startDate: string;
  endDate: string;
  priority: ProjectPriority;
  status: ProjectStatus;
  team: string;
}

export default function CreateProjectModal({
  onCreate,
}: CreateProjectModalProps) {
  const [open, setOpen] = useState(false);

  const [form, setForm] = useState<ProjectFormState>({
    name: "",
    description: "",
    owner: "",
    startDate: "",
    endDate: "",
    priority: "Medium",
    status: "Planning",
    team: "",
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const newProject: Project = {
      id: form.name.toLowerCase().trim().replace(/\s+/g, "-"),
      name: form.name,
      description: form.description,
      owner: form.owner,
      startDate: form.startDate,
      endDate: form.endDate,
      priority: form.priority,
      status: form.status,
      tasks: 0,
      progress: 0,
      team: form.team
        .split(",")
        .map((member) => member.trim())
        .filter(Boolean),
    };

    onCreate(newProject);

    setForm({
      name: "",
      description: "",
      owner: "",
      startDate: "",
      endDate: "",
      priority: "Medium",
      status: "Planning",
      team: "",
    });

    setOpen(false);
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="cursor-pointer rounded bg-black px-4 py-2 text-white transition hover:opacity-90"
      >
        + New Project
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/25 p-6 backdrop-blur-sm"
          onClick={() => setOpen(false)}
        >
          <form
            onSubmit={handleSubmit}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-2xl space-y-5 rounded-2xl border bg-white p-8 shadow-xl"
          >
            <h2 className="text-xl font-semibold text-zinc-900">
              Create Project
            </h2>

            <input
              value={form.name}
              placeholder="Project Name"
              onChange={(e) =>
                setForm({ ...form, name: e.target.value })
              }
              className="w-full rounded border p-3"
              required
            />

            <input
              value={form.owner}
              placeholder="Project Manager"
              onChange={(e) =>
                setForm({ ...form, owner: e.target.value })
              }
              className="w-full rounded border p-3"
              required
            />

            <textarea
              value={form.description}
              placeholder="Project Description"
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
              className="w-full rounded border p-3"
              required
            />

            <div>
              <label className="mb-1 block text-sm text-zinc-600">
                Start Date
              </label>
              <input
                type="date"
                value={form.startDate}
                onChange={(e) =>
                  setForm({ ...form, startDate: e.target.value })
                }
                className="w-full rounded border p-3"
                required
              />
            </div>

            <div>
              <label className="mb-1 block text-sm text-zinc-600">
                End Date
              </label>
              <input
                type="date"
                value={form.endDate}
                onChange={(e) =>
                  setForm({ ...form, endDate: e.target.value })
                }
                className="w-full rounded border p-3"
                required
              />
            </div>

            <input
              value={form.team}
              placeholder="Team Members (comma separated)"
              onChange={(e) =>
                setForm({ ...form, team: e.target.value })
              }
              className="w-full rounded border p-3"
              required
            />

            <select
              value={form.priority}
              onChange={(e) =>
                setForm({
                  ...form,
                  priority: e.target.value as ProjectPriority,
                })
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
                setForm({
                  ...form,
                  status: e.target.value as ProjectStatus,
                })
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
                onClick={() => setOpen(false)}
                className="w-full rounded border px-4 py-3"
              >
                Cancel
              </button>

              <button
                type="submit"
                className="w-full rounded bg-black px-4 py-3 text-white"
              >
                Create Project
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}