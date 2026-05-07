"use client";

import { useState } from "react";
import {
  Project,
  ProjectPriority,
  ProjectStatus,
} from "@/types/project";
import { createProject } from "@/services/projectService";

interface CreateProjectModalProps {
  onCreate: (project: Project) => void;
}

interface ProjectFormState {
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  priority: ProjectPriority;
  status: ProjectStatus;
}

export default function CreateProjectModal({
  onCreate,
}: CreateProjectModalProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState<ProjectFormState>({
    name: "",
    description: "",
    startDate: "",
    endDate: "",
    priority: "Medium",
    status: "Planning",
  });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Validar que la fecha de inicio sea anterior a la de fin
      const startDate = new Date(form.startDate);
      const endDate = new Date(form.endDate);
      
      if (startDate >= endDate) {
        setError("La fecha de inicio debe ser anterior a la fecha de fin");
        setLoading(false);
        return;
      }

      console.log('📝 Datos del formulario:', form);

      // Crear el proyecto usando el endpoint
      const newProject = await createProject({
        name: form.name,
        description: form.description,
        startDate: form.startDate,
        endDate: form.endDate,
        priority: form.priority,
        status: form.status,
      });

      console.log('✅ Proyecto creado en el frontend:', newProject);
      onCreate(newProject);

      setForm({
        name: "",
        description: "",
        startDate: "",
        endDate: "",
        priority: "Medium",
        status: "Planning",
      });

      setOpen(false);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Error al crear el proyecto";
      setError(errorMessage);
      console.error("❌ Error creating project:", err);
    } finally {
      setLoading(false);
    }
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

            {error && (
              <div className="rounded-md bg-red-50 p-3 text-sm text-red-700 border border-red-200">
                {error}
              </div>
            )}

            <input
              value={form.name}
              placeholder="Project Name"
              onChange={(e) =>
                setForm({ ...form, name: e.target.value })
              }
              className="w-full rounded border p-3"
              required
              disabled={loading}
            />

            <textarea
              value={form.description}
              placeholder="Project Description"
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
              className="w-full rounded border p-3"
              required
              disabled={loading}
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
                disabled={loading}
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
                disabled={loading}
              />
            </div>

            <select
              value={form.priority}
              onChange={(e) =>
                setForm({
                  ...form,
                  priority: e.target.value as ProjectPriority,
                })
              }
              className="w-full rounded border p-3"
              disabled={loading}
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
              disabled={loading}
            >
              <option value="Planning">Planning</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
            </select>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => {
                  setOpen(false);
                  setError(null);
                }}
                className="w-full rounded border px-4 py-3 disabled:opacity-50"
                disabled={loading}
              >
                Cancel
              </button>

              <button
                type="submit"
                className="w-full rounded bg-black px-4 py-3 text-white disabled:opacity-50"
                disabled={loading}
              >
                {loading ? "Creating..." : "Create Project"}
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}