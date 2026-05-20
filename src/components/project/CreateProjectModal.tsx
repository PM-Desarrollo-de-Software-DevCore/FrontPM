"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Project,
  ProjectPriority,
  ProjectStatus,
} from "@/types/project";
import { createProject, updateProject } from "@/services/projectService";
import {
  AssignmentSuggestionItem,
  getAssignmentSuggestions,
} from "@/services/assignmentSuggestionService";
import { getNonAdminUsers, UserOption } from "@/services/userService";
import {
  addProjectMember,
  getProjectMembers,
  ProjectMemberRole,
  removeProjectMember,
  updateProjectMemberRole,
} from "@/services/memberService";

interface CreateProjectModalProps {
  onCreate?: (project: Project) => void;
  onUpdate?: (project: Project) => void;
  project?: Project | null;
  open?: boolean;
  onClose?: () => void;
  showTrigger?: boolean;
}

interface ProjectFormState {
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  priority: ProjectPriority;
  status: ProjectStatus;
}

interface SelectedProjectUser extends UserOption {
  projectRole: ProjectMemberRole;
}

export default function CreateProjectModal({
  onCreate,
  onUpdate,
  project,
  open,
  onClose,
  showTrigger = true,
}: CreateProjectModalProps) {
  const isEditMode = Boolean(project);
  const [internalOpen, setInternalOpen] = useState(false);
  const isOpen = isEditMode ? Boolean(open) : internalOpen;

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [memberSyncWarning, setMemberSyncWarning] = useState<string | null>(
    null
  );
  const [usersLoading, setUsersLoading] = useState(false);
  const [usersError, setUsersError] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<AssignmentSuggestionItem[]>([]);
  const [suggestionsLoading, setSuggestionsLoading] = useState(false);
  const [userQuery, setUserQuery] = useState("");
  const [availableUsers, setAvailableUsers] = useState<UserOption[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<SelectedProjectUser[]>([]);
  const [initialMembers, setInitialMembers] = useState<
    Array<{ userId: string; role: ProjectMemberRole }>
  >([]);

  useEffect(() => {
    if (!isOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen]);

  const [form, setForm] = useState<ProjectFormState>({
    name: "",
    description: "",
    startDate: "",
    endDate: "",
    priority: "Medium",
    status: "Planning",
  });

  const closeModal = () => {
    setError(null);
    setUsersError(null);
    setMemberSyncWarning(null);
    setUserQuery("");

    if (isEditMode) {
      onClose?.();
      return;
    }

    setInternalOpen(false);
    setSelectedUsers([]);
    setInitialMembers([]);
    setForm({
      name: "",
      description: "",
      startDate: "",
      endDate: "",
      priority: "Medium",
      status: "Planning",
    });
  };

  useEffect(() => {
    if (!isOpen) return;

    setError(null);
    setUsersError(null);
    setMemberSyncWarning(null);

    if (isEditMode && project) {
      const formatDate = (dateString: string): string => {
        if (!dateString) return "";
        if (dateString.includes("T")) {
          return dateString.split("T")[0];
        }
        return dateString;
      };

      setForm({
        name: project.name,
        description: project.description,
        startDate: formatDate(project.startDate),
        endDate: formatDate(project.endDate),
        priority: project.priority,
        status: project.status,
      });
    } else {
      setForm({
        name: "",
        description: "",
        startDate: "",
        endDate: "",
        priority: "Medium",
        status: "Planning",
      });
      setSelectedUsers([]);
      setInitialMembers([]);
    }

    setUserQuery("");
  }, [isOpen, isEditMode, project]);

  useEffect(() => {
    if (!isOpen) {
      setSuggestions([]);
      setSuggestionsLoading(false);
      return;
    }

    const query = `${form.name} ${form.description}`.trim();
    if (query.length < 8) {
      setSuggestions([]);
      setSuggestionsLoading(false);
      return;
    }

    let cancelled = false;
    const timer = window.setTimeout(async () => {
      try {
        setSuggestionsLoading(true);
        const response = await getAssignmentSuggestions({
          scope: "project",
          title: form.name,
          description: form.description,
          limit: 4,
        });

        if (!cancelled) {
          setSuggestions(response.suggestions);
        }
      } catch (error) {
        if (!cancelled) {
          setSuggestions([]);
        }
      } finally {
        if (!cancelled) {
          setSuggestionsLoading(false);
        }
      }
    }, 550);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [isOpen, form.name, form.description]);

  useEffect(() => {
    if (!isOpen) return;

    const loadUsers = async () => {
      try {
        setUsersLoading(true);
        setUsersError(null);
        const users = await getNonAdminUsers();
        setAvailableUsers(users);

        if (isEditMode && project?.id) {
          const members = await getProjectMembers(project.id);
          setInitialMembers(members);

          const usersById = new Map(users.map((user) => [user.id, user]));
          const selected = members
            .map((member) => {
              const user = usersById.get(member.userId);
              if (!user) return null;

              return {
                ...user,
                projectRole: member.role,
              };
            })
            .filter((user): user is SelectedProjectUser => Boolean(user));

          setSelectedUsers(selected);
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Error al cargar usuarios";
        setUsersError(errorMessage);
      } finally {
        setUsersLoading(false);
      }
    };

    loadUsers();
  }, [isOpen, isEditMode, project?.id]);

  const filteredUsers = useMemo(() => {
    const query = userQuery.trim().toLowerCase();

    return availableUsers
      .filter(
        (user) => !selectedUsers.some((selected) => selected.id === user.id)
      )
      .filter((user) => {
        if (!query) return true;

        const fullName = `${user.name} ${user.lastname}`.toLowerCase();
        return (
          fullName.includes(query) || user.email.toLowerCase().includes(query)
        );
      })
      .slice(0, 8);
  }, [availableUsers, selectedUsers, userQuery]);

  const handleSelectUser = (user: UserOption) => {
    setSelectedUsers((prev) => [
      ...prev,
      {
        ...user,
        projectRole: "developer",
      },
    ]);
    setUserQuery("");
  };

  const handleRemoveUser = (userId: string) => {
    setSelectedUsers((prev) => prev.filter((user) => user.id !== userId));
  };

  const handleRoleChange = (userId: string, role: ProjectMemberRole) => {
    setSelectedUsers((prev) =>
      prev.map((user) => (user.id === userId ? { ...user, projectRole: role } : user))
    );
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMemberSyncWarning(null);

    try {
      // Validar que la fecha de inicio sea anterior a la de fin
      const startDate = new Date(form.startDate);
      const endDate = new Date(form.endDate);
      
      if (startDate >= endDate) {
        setError("La fecha de inicio debe ser anterior a la fecha de fin");
        setLoading(false);
        return;
      }

      if (isEditMode && project) {
        const updatedProject = await updateProject(project.id, {
          name: form.name,
          description: form.description,
          startDate: form.startDate,
          endDate: form.endDate,
          priority: form.priority,
          status: form.status,
        });

        const manageableCurrentMembers = initialMembers.filter((member) =>
          availableUsers.some((user) => user.id === member.userId)
        );

        const currentById = new Map(
          manageableCurrentMembers.map((member) => [member.userId, member.role])
        );
        const selectedById = new Map(
          selectedUsers.map((user) => [user.id, user.projectRole])
        );

        const toAdd = selectedUsers.filter((user) => !currentById.has(user.id));
        const toRemove = manageableCurrentMembers.filter(
          (member) => !selectedById.has(member.userId)
        );
        const toUpdateRole = selectedUsers.filter((user) => {
          const currentRole = currentById.get(user.id);
          return Boolean(currentRole) && currentRole !== user.projectRole;
        });

        let failedMemberOps = 0;

        for (const member of toAdd) {
          try {
            await addProjectMember(project.id, member.id, member.projectRole);
          } catch {
            failedMemberOps += 1;
          }
        }

        for (const member of toUpdateRole) {
          try {
            await updateProjectMemberRole(project.id, member.id, member.projectRole);
          } catch {
            failedMemberOps += 1;
          }
        }

        for (const member of toRemove) {
          try {
            await removeProjectMember(project.id, member.userId);
          } catch {
            failedMemberOps += 1;
          }
        }

        if (failedMemberOps > 0) {
          setMemberSyncWarning(
            "El proyecto se actualizo, pero algunos miembros no pudieron sincronizarse."
          );
        } else {
          setInitialMembers(
            selectedUsers.map((user) => ({
              userId: user.id,
              role: user.projectRole,
            }))
          );
        }

        onUpdate?.({
          ...updatedProject,
          team: selectedUsers.map(
            (user) => `${user.name} ${user.lastname}`.trim() || user.email
          ),
        });

        if (failedMemberOps === 0) {
          closeModal();
        }

        return;
      }

      // Crear el proyecto usando el endpoint
      const newProject = await createProject({
        name: form.name,
        description: form.description,
        startDate: form.startDate,
        endDate: form.endDate,
        priority: form.priority,
        status: form.status,
      });

      let failedMemberOps = 0;

      for (const member of selectedUsers) {
        try {
          await addProjectMember(newProject.id, member.id, member.projectRole);
        } catch {
          failedMemberOps += 1;
        }
      }

      if (failedMemberOps > 0) {
        setMemberSyncWarning(
          "El proyecto se creo, pero algunos miembros no pudieron agregarse."
        );
      }

      onCreate?.({
        ...newProject,
        team: selectedUsers.map((user) =>
          `${user.name} ${user.lastname}`.trim() || user.email
        ),
      });

      closeModal();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Error al crear el proyecto";
      setError(errorMessage);
      console.error("Error creating project:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {!isEditMode && showTrigger && (
        <button
          onClick={() => setInternalOpen(true)}
          className="cursor-pointer rounded bg-black px-4 py-2 text-white transition hover:opacity-90"
        >
          + New Project
        </button>
      )}

      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/25 p-6 backdrop-blur-sm"
          onClick={closeModal}
        >
          <form
            onSubmit={handleSubmit}
            onClick={(e) => e.stopPropagation()}
            className="flex w-full max-w-2xl max-h-[calc(100vh-3rem)] flex-col overflow-hidden rounded-2xl border bg-white p-8 shadow-xl"
          >
            <h2 className="text-xl font-semibold text-zinc-900">
              {isEditMode ? "Edit Project" : "Create Project"}
            </h2>

            <div className="flex-1 space-y-5 overflow-y-auto pr-1">
              {error && (
                <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                  {error}
                </div>
              )}

              {memberSyncWarning && (
                <div className="rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-700">
                  {memberSyncWarning}
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

              <div className="rounded-2xl border border-dashed border-zinc-200 bg-zinc-50 p-4">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-zinc-900">Smart member suggestions</p>
                    <p className="text-xs text-zinc-500">Ranked by skill fit and completed tasks</p>
                  </div>
                  {suggestionsLoading && <span className="text-xs text-zinc-400">Analyzing...</span>}
                </div>

                {suggestions.length > 0 ? (
                  <div className="space-y-2">
                    {suggestions
                      .filter((suggestion) => !selectedUsers.some((user) => user.id === suggestion.userId))
                      .map((suggestion) => (
                        <button
                          key={suggestion.userId}
                          type="button"
                          onClick={() => {
                            const matchingUser = availableUsers.find((user) => user.id === suggestion.userId);
                            if (matchingUser) {
                              handleSelectUser(matchingUser);
                            }
                          }}
                          className="flex w-full items-center justify-between rounded-2xl border border-zinc-200 bg-white px-3 py-2 text-left transition hover:border-zinc-300"
                        >
                          <div>
                            <p className="text-sm font-medium text-zinc-900">
                              {suggestion.name} {suggestion.lastname}
                            </p>
                            <p className="text-xs text-zinc-500">
                              {suggestion.skill || "No skill"}{suggestion.area ? ` · ${suggestion.area}` : ""}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-semibold text-zinc-900">{suggestion.score}</p>
                            <p className="text-[11px] text-zinc-500">{suggestion.completedTasks} done</p>
                          </div>
                        </button>
                      ))}
                  </div>
                ) : (
                  <p className="text-sm text-zinc-500">
                    {suggestionsLoading
                      ? "Generating recommendations..."
                      : "Write a stronger title or description to get recommendations."}
                  </p>
                )}
              </div>

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

              <div className="relative">
                <label className="mb-1 block text-sm text-zinc-600">
                  Project Users
                </label>

                <input
                  value={userQuery}
                  onChange={(e) => setUserQuery(e.target.value)}
                  placeholder="Buscar por nombre o correo"
                  className="w-full rounded border p-3"
                  disabled={loading || usersLoading}
                />

                {usersError && (
                  <p className="mt-2 text-sm text-red-600">{usersError}</p>
                )}

                {!usersError && userQuery.trim().length > 0 && (
                  <div className="absolute left-0 right-0 top-full z-50 mt-1 max-h-44 overflow-auto rounded border border-zinc-200 bg-white shadow-lg">
                    {filteredUsers.length > 0 ? (
                      filteredUsers.map((user) => (
                        <button
                          key={user.id}
                          type="button"
                          onClick={() => handleSelectUser(user)}
                          className="flex w-full items-center justify-between border-b border-zinc-100 px-3 py-2 text-left text-sm last:border-b-0 hover:bg-zinc-50"
                        >
                          <span>{`${user.name} ${user.lastname}`.trim()}</span>
                          <span className="text-zinc-500">{user.email}</span>
                        </button>
                      ))
                    ) : (
                      <p className="px-3 py-2 text-sm text-zinc-500">
                        No se encontraron usuarios.
                      </p>
                    )}
                  </div>
                )}

                {selectedUsers.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {selectedUsers.map((user) => (
                      <span
                        key={user.id}
                        className="inline-flex items-center gap-2 rounded-full bg-zinc-100 px-3 py-1 text-xs text-zinc-700"
                      >
                        {`${user.name} ${user.lastname}`.trim() || user.email}
                        <select
                          value={user.projectRole}
                          onChange={(e) =>
                            handleRoleChange(user.id, e.target.value as ProjectMemberRole)
                          }
                          className="rounded border border-zinc-300 bg-white px-2 py-0.5 text-[11px] text-zinc-700"
                          disabled={loading}
                        >
                          <option value="developer">Developer</option>
                          <option value="scrum_master">Scrum Master</option>
                          <option value="project_manager">Project Manager</option>
                        </select>
                        <button
                          type="button"
                          onClick={() => handleRemoveUser(user.id)}
                          className="text-zinc-500 hover:text-zinc-800"
                          aria-label={`Quitar ${user.name}`}
                          disabled={loading}
                        >
                          x
                        </button>
                      </span>
                    ))}
                  </div>
                )}
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
            </div>

            <div className="mt-5 flex gap-3">
              <button
                type="button"
                onClick={closeModal}
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
                {loading
                  ? isEditMode
                    ? "Saving..."
                    : "Creating..."
                  : isEditMode
                  ? "Save Changes"
                  : "Create Project"}
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}