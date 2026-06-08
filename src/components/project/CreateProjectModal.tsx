"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Project,
  ProjectPriority,
  ProjectStatus,
} from "@/types/project";
import { createProject, ProjectPayload, updateProject } from "@/services/projectService";
import {
  AssignmentSuggestionItem,
  getAssignmentSuggestions,
} from "@/services/assignmentSuggestionService";
import { getNonAdminUsers, UserOption } from "@/services/userService";
import {
  getProjectMembers,
  ProjectMemberRole,
  syncProjectMembers,
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
  client: string;
  projectType: string;
  projectObjective: string;
  methodology: string;
  startDate: string;
  endDate: string;
  priority: ProjectPriority;
  status: ProjectStatus;
  estimatedSprints: string;
  budget: string;
  monthlyCost: string;
  billingModel: string;
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
  const [advancedSettingsOpen, setAdvancedSettingsOpen] = useState(false);

  const emptyFormState: ProjectFormState = {
    name: "",
    description: "",
    client: "",
    projectType: "Web app",
    projectObjective: "",
    methodology: "scrum",
    startDate: "",
    endDate: "",
    priority: "Medium",
    status: "Planning",
    estimatedSprints: "",
    budget: "",
    monthlyCost: "",
    billingModel: "fixed_price",
  };

  const labelClass = "mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-200";
  const fieldClass =
    "w-full rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-zinc-400 dark:border-white/10 dark:bg-slate-950/60 dark:text-zinc-100 dark:placeholder:text-zinc-500 dark:focus:border-sky-400";
  const textareaClass =
    "min-h-28 w-full rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-zinc-400 dark:border-white/10 dark:bg-slate-950/60 dark:text-zinc-100 dark:placeholder:text-zinc-500 dark:focus:border-sky-400";

  useEffect(() => {
    if (!isOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen]);

  const [form, setForm] = useState<ProjectFormState>(emptyFormState);

  const parseOptionalNumber = (value: string): number | undefined => {
    if (!value.trim()) return undefined;
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : undefined;
  };

  const closeModal = () => {
    setError(null);
    setUsersError(null);
    setMemberSyncWarning(null);
    setUserQuery("");
    setAdvancedSettingsOpen(false);

    if (isEditMode) {
      onClose?.();
      return;
    }

    setInternalOpen(false);
    setSelectedUsers([]);
    setInitialMembers([]);
    setForm(emptyFormState);
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

      const hasAdvancedData =
        project.estimatedSprints !== undefined ||
        project.budget !== undefined ||
        project.monthlyCost !== undefined ||
        Boolean(project.billingModel);

      setForm({
        name: project.name,
        description: project.description,
        client: project.client || "",
        projectType: project.projectType || "Web app",
        projectObjective: project.projectObjective || "",
        methodology: project.methodology || "scrum",
        startDate: formatDate(project.startDate),
        endDate: formatDate(project.endDate),
        priority: project.priority,
        status: project.status,
        estimatedSprints: project.estimatedSprints?.toString() || "",
        budget: project.budget?.toString() || "",
        monthlyCost: project.monthlyCost?.toString() || "",
        billingModel: project.billingModel || "fixed_price",
      });
      setAdvancedSettingsOpen(hasAdvancedData);
    } else {
      setForm(emptyFormState);
      setSelectedUsers([]);
      setInitialMembers([]);
      setAdvancedSettingsOpen(false);
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
      const trimmedName = form.name.trim();
      const trimmedDescription = form.description.trim();
      const trimmedClient = form.client.trim();
      const trimmedProjectType = form.projectType.trim();
      const trimmedObjective = form.projectObjective.trim();

      if (!trimmedName || !trimmedDescription || !trimmedClient || !trimmedProjectType || !trimmedObjective) {
        setError("Completa los campos esenciales del proyecto antes de guardar.");
        setLoading(false);
        return;
      }

      // Validar que la fecha de inicio sea anterior a la de fin
      const startDate = new Date(form.startDate);
      const endDate = new Date(form.endDate);
      
      if (startDate >= endDate) {
        setError("La fecha de inicio debe ser anterior a la fecha de fin");
        setLoading(false);
        return;
      }

      const projectPayload: ProjectPayload = {
        name: trimmedName,
        description: trimmedDescription,
        client: trimmedClient,
        projectType: trimmedProjectType,
        projectObjective: trimmedObjective,
        methodology: form.methodology.trim(),
        estimatedSprints: parseOptionalNumber(form.estimatedSprints),
        budget: parseOptionalNumber(form.budget),
        monthlyCost: parseOptionalNumber(form.monthlyCost),
        billingModel: form.billingModel.trim(),
        startDate: form.startDate,
        endDate: form.endDate,
        priority: form.priority,
        status: form.status,
      };

      if (isEditMode && project) {
        const updatedProject = await updateProject(project.id, projectPayload);

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

        // Sincronización transaccional de miembros (todo o nada) en UNA request.
        let memberSyncFailed = false;
        let memberSyncError = "";
        if (toAdd.length || toUpdateRole.length || toRemove.length) {
          try {
            await syncProjectMembers(project.id, {
              add: toAdd.map((member) => ({ userId: member.id, role: member.projectRole })),
              update: toUpdateRole.map((member) => ({ userId: member.id, role: member.projectRole })),
              remove: toRemove.map((member) => member.userId),
            });
          } catch (err) {
            memberSyncFailed = true;
            memberSyncError = err instanceof Error ? err.message : "";
          }
        }

        if (memberSyncFailed) {
          setMemberSyncWarning(
            memberSyncError
              ? `El proyecto se actualizó, pero los miembros no pudieron sincronizarse: ${memberSyncError}`
              : "El proyecto se actualizó, pero los miembros no pudieron sincronizarse."
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

        if (!memberSyncFailed) {
          closeModal();
        }

        return;
      }

      // Crear el proyecto usando el endpoint
      const newProject = await createProject(projectPayload);

      // Altas de miembros en UNA request transaccional.
      let memberSyncFailed = false;
      let memberSyncError = "";
      if (selectedUsers.length > 0) {
        try {
          await syncProjectMembers(newProject.id, {
            add: selectedUsers.map((member) => ({ userId: member.id, role: member.projectRole })),
            update: [],
            remove: [],
          });
        } catch (err) {
          memberSyncFailed = true;
          memberSyncError = err instanceof Error ? err.message : "";
        }
      }

      if (memberSyncFailed) {
        setMemberSyncWarning(
          memberSyncError
            ? `El proyecto se creó, pero los miembros no pudieron agregarse: ${memberSyncError}`
            : "El proyecto se creó, pero los miembros no pudieron agregarse."
        );
      }

      onCreate?.({
        ...newProject,
        team: selectedUsers.map((user) =>
          `${user.name} ${user.lastname}`.trim() || user.email
        ),
      });

      if (!memberSyncFailed) {
        closeModal();
      }
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
          className="cursor-pointer rounded-full bg-black px-4 py-2 text-white transition hover:bg-zinc-800"
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
            className="flex w-full max-w-4xl max-h-[calc(100vh-3rem)] flex-col overflow-hidden rounded-3xl border border-zinc-200 bg-white p-6 shadow-2xl dark:border-white/10 dark:bg-slate-900 md:p-8"
          >
            <div className="mb-5 border-b border-zinc-100 pb-5 dark:border-white/10">
              <p className="text-sm font-medium uppercase tracking-[0.2em] text-zinc-500 dark:text-zinc-300">
                {isEditMode ? "Edit Project" : "New Project"}
              </p>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight text-zinc-950 dark:text-zinc-100">
                {isEditMode ? "Edit Project" : "Create Project"}
              </h2>
              <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-300">
                Fill out the essentials first, then open advanced settings if you need budget or billing details.
              </p>
            </div>

            <div className="flex-1 space-y-5 overflow-y-auto pr-1">
              {error && (
                <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-300">
                  {error}
                </div>
              )}

              {memberSyncWarning && (
                <div className="rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-700 dark:border-amber-900/40 dark:bg-amber-950/30 dark:text-amber-300">
                  {memberSyncWarning}
                </div>
              )}

              <section className="rounded-3xl border border-zinc-200 bg-zinc-50/70 p-5 dark:border-white/10 dark:bg-slate-800/60">
                <div className="mb-4 flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-zinc-950 dark:text-zinc-100">Project basics</p>
                    <p className="text-xs text-zinc-500 dark:text-zinc-300">What defines the project and its timeline.</p>
                  </div>
                  <span className="rounded-full bg-white px-3 py-1 text-[11px] font-medium text-zinc-500 shadow-sm dark:bg-slate-900 dark:text-zinc-200">Required</span>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="md:col-span-2">
                    <label className={labelClass}>Project Name</label>
                    <input
                      value={form.name}
                      placeholder="Project Name"
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      className={fieldClass}
                      required
                      disabled={loading}
                    />
                  </div>

                  <div>
                    <label className={labelClass}>Client</label>
                    <input
                      value={form.client}
                      placeholder="Corporate Client"
                      onChange={(e) => setForm({ ...form, client: e.target.value })}
                      className={fieldClass}
                      required
                      disabled={loading}
                    />
                  </div>

                  <div>
                    <label className={labelClass}>Project Type</label>
                    <input
                      value={form.projectType}
                      placeholder="Web app"
                      onChange={(e) => setForm({ ...form, projectType: e.target.value })}
                      className={fieldClass}
                      required
                      disabled={loading}
                    />
                  </div>

                  {/* <div>
                    <label className={labelClass}>Methodology</label>
                    <select
                      value={form.methodology}
                      onChange={(e) => setForm({ ...form, methodology: e.target.value })}
                      className={fieldClass}
                      required
                      disabled={loading}
                    >
                      <option value="scrum">Scrum</option>
                      <option value="kanban">Kanban</option>
                      <option value="waterfall">Waterfall</option>
                      <option value="hybrid">Hybrid</option>
                    </select>
                  </div> */}

                  <div>
                    <label className={labelClass}>Start Date</label>
                    <input
                      type="date"
                      value={form.startDate}
                      onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                      className={`${fieldClass} dark:[color-scheme:dark]`}
                      required
                      disabled={loading}
                    />
                  </div>

                  <div>
                    <label className={labelClass}>End Date</label>
                    <input
                      type="date"
                      value={form.endDate}
                      onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                      className={`${fieldClass} dark:[color-scheme:dark]`}
                      required
                      disabled={loading}
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className={labelClass}>Project Description</label>
                    <textarea
                      value={form.description}
                      placeholder="Project Description"
                      onChange={(e) => setForm({ ...form, description: e.target.value })}
                      className={textareaClass}
                      required
                      disabled={loading}
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className={labelClass}>Project Objective</label>
                    <textarea
                      value={form.projectObjective}
                      placeholder="Launch a central portal for customer onboarding"
                      onChange={(e) => setForm({ ...form, projectObjective: e.target.value })}
                      className={textareaClass}
                      required
                      disabled={loading}
                    />
                  </div>

                  <div>
                    <label className={labelClass}>Priority</label>
                    <select
                      value={form.priority}
                      onChange={(e) => setForm({ ...form, priority: e.target.value as ProjectPriority })}
                      className={fieldClass}
                      disabled={loading}
                    >
                      <option value="High">High Priority</option>
                      <option value="Medium">Medium Priority</option>
                      <option value="Low">Low Priority</option>
                    </select>
                  </div>

                  {/* <div>
                    <label className={labelClass}>Status</label>
                    <select
                      value={form.status}
                      onChange={(e) => setForm({ ...form, status: e.target.value as ProjectStatus })}
                      className={fieldClass}
                      disabled={loading}
                    >
                      <option value="Planning">Planning</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Completed">Completed</option>
                    </select>
                  </div> */}
                </div>
              </section>

              <section className="rounded-3xl border border-zinc-200 bg-white p-5 dark:border-white/10 dark:bg-slate-900/70">
                <div className="mb-4 flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-zinc-950 dark:text-zinc-100">Smart member suggestions</p>
                    <p className="text-xs text-zinc-500 dark:text-zinc-300">Ranked by skill fit and completed tasks</p>
                  </div>
                  {suggestionsLoading && <span className="text-xs text-zinc-400 dark:text-zinc-300">Analyzing...</span>}
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
                          className="flex w-full items-center justify-between rounded-2xl border border-zinc-200 bg-zinc-50 px-3 py-3 text-left transition hover:border-zinc-300 hover:bg-white dark:border-white/10 dark:bg-slate-800 dark:hover:bg-slate-700"
                        >
                          <div>
                            <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                              {suggestion.name} {suggestion.lastname}
                            </p>
                            <p className="text-xs text-zinc-500 dark:text-zinc-300">
                              {suggestion.skill || "No skill"}{suggestion.area ? ` · ${suggestion.area}` : ""}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">{suggestion.score}</p>
                            <p className="text-[11px] text-zinc-500 dark:text-zinc-300">{suggestion.completedTasks} done</p>
                          </div>
                        </button>
                      ))}
                  </div>
                ) : (
                  <p className="text-sm text-zinc-500 dark:text-zinc-300">
                    {suggestionsLoading
                      ? "Generating recommendations..."
                      : "Write a stronger title or description to get recommendations."}
                  </p>
                )}

                <div className="relative mt-5">
                  <label className={labelClass}>Project Users</label>

                  <input
                    value={userQuery}
                    onChange={(e) => setUserQuery(e.target.value)}
                    placeholder="Search by name or email"
                    className={fieldClass}
                    disabled={loading || usersLoading}
                  />

                  {usersError && (
                    <p className="mt-2 text-sm text-red-600">{usersError}</p>
                  )}

                  {!usersError && userQuery.trim().length > 0 && (
                    <div className="absolute left-0 right-0 top-full z-50 mt-1 max-h-44 overflow-auto rounded-2xl border border-zinc-200 bg-white shadow-lg dark:border-white/10 dark:bg-slate-900">
                      {filteredUsers.length > 0 ? (
                        filteredUsers.map((user) => (
                          <button
                            key={user.id}
                            type="button"
                            onClick={() => handleSelectUser(user)}
                            className="flex w-full items-center justify-between border-b border-zinc-100 px-3 py-2 text-left text-sm last:border-b-0 hover:bg-zinc-50 dark:border-white/10 dark:text-zinc-100 dark:hover:bg-slate-800"
                          >
                            <span>{`${user.name} ${user.lastname}`.trim()}</span>
                            <span className="text-zinc-500 dark:text-zinc-300">{user.email}</span>
                          </button>
                        ))
                      ) : (
                        <p className="px-3 py-2 text-sm text-zinc-500 dark:text-zinc-300">No se encontraron usuarios.</p>
                      )}
                    </div>
                  )}

                  {selectedUsers.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {selectedUsers.map((user) => (
                        <span
                          key={user.id}
                          className="inline-flex items-center gap-2 rounded-full bg-zinc-100 px-3 py-1 text-xs text-zinc-700 dark:bg-slate-800 dark:text-zinc-100"
                        >
                          {`${user.name} ${user.lastname}`.trim() || user.email}
                          <select
                            value={user.projectRole}
                            onChange={(e) => handleRoleChange(user.id, e.target.value as ProjectMemberRole)}
                            className="rounded border border-zinc-300 bg-white px-2 py-0.5 text-[11px] text-zinc-700 dark:border-white/10 dark:bg-slate-900 dark:text-zinc-100"
                            disabled={loading}
                          >
                            <option value="developer">Developer</option>
                            <option value="scrum_master">Scrum Master</option>
                            <option value="project_manager">Project Manager</option>
                          </select>
                          <button
                            type="button"
                            onClick={() => handleRemoveUser(user.id)}
                            className="text-zinc-500 hover:text-zinc-800 dark:text-zinc-300 dark:hover:text-zinc-100"
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
              </section>

              <section className="overflow-hidden rounded-3xl border border-zinc-200 bg-zinc-50/70 dark:border-white/10 dark:bg-slate-800/60">
                <button
                  type="button"
                  onClick={() => setAdvancedSettingsOpen((current) => !current)}
                  className="flex w-full items-center justify-between px-5 py-4 text-left"
                >
                  <div>
                    <p className="text-sm font-semibold text-zinc-950 dark:text-zinc-100">Advanced settings</p>
                    <p className="text-xs text-zinc-500 dark:text-zinc-300">Optional fields for planning, finance, and billing.</p>
                  </div>
                  <span className={`text-zinc-500 transition-transform dark:text-zinc-300 ${advancedSettingsOpen ? "rotate-180" : ""}`}>
                    ▾
                  </span>
                </button>

                {advancedSettingsOpen && (
                  <div className="border-t border-zinc-200 bg-white px-5 py-5 dark:border-white/10 dark:bg-slate-900/70">
                    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                      <div>
                        <label className={labelClass}>Estimated sprints</label>
                        <input
                          type="number"
                          min="0"
                          step="1"
                          value={form.estimatedSprints}
                          onChange={(e) => setForm({ ...form, estimatedSprints: e.target.value })}
                          placeholder="6"
                          className={fieldClass}
                          disabled={loading}
                        />
                      </div>

                      <div>
                        <label className={labelClass}>Budget</label>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={form.budget}
                          onChange={(e) => setForm({ ...form, budget: e.target.value })}
                          placeholder="25000"
                          className={fieldClass}
                          disabled={loading}
                        />
                      </div>

                      <div>
                        <label className={labelClass}>Monthly cost</label>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={form.monthlyCost}
                          onChange={(e) => setForm({ ...form, monthlyCost: e.target.value })}
                          placeholder="3200"
                          className={fieldClass}
                          disabled={loading}
                        />
                      </div>

                      <div>
                        <label className={labelClass}>Billing model</label>
                        <select
                          value={form.billingModel}
                          onChange={(e) => setForm({ ...form, billingModel: e.target.value })}
                          className={fieldClass}
                          disabled={loading}
                        >
                          <option value="fixed_price">Fixed price</option>
                          <option value="monthly_retainer">Monthly retainer</option>
                          <option value="time_and_materials">Time and materials</option>
                          <option value="other">Other</option>
                        </select>
                      </div>
                    </div>
                  </div>
                )}
              </section>
            </div>

            <div className="mt-6 flex flex-col gap-3 border-t border-zinc-100 pt-5 dark:border-white/10 sm:flex-row">
              <button
                type="button"
                onClick={closeModal}
                className="w-full rounded-2xl border border-zinc-200 px-4 py-3 font-medium text-zinc-700 transition hover:bg-zinc-50 disabled:opacity-50 dark:border-white/15 dark:text-zinc-200 dark:hover:bg-slate-800"
                disabled={loading}
              >
                Cancel
              </button>

              <button
                type="submit"
                className="w-full rounded-2xl bg-black px-4 py-3 font-medium text-white transition hover:bg-zinc-800 disabled:opacity-50 dark:bg-sky-500 dark:text-slate-950 dark:hover:bg-sky-400"
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