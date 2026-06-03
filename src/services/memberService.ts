import { getToken } from "@/lib/auth";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export type ProjectMemberRole = "project_manager" | "scrum_master" | "developer";

interface MemberRecord {
  id_user?: string;
  role?: ProjectMemberRole;
}

export interface ProjectMember {
  userId: string;
  role: ProjectMemberRole;
}

function getAuthHeaders(): Record<string, string> {
  const token = getToken();
  return {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
  };
}

export async function getProjectMemberIds(projectId: string): Promise<string[]> {
  const members = await getProjectMembers(projectId);
  return members.map((member) => member.userId);
}

export async function getProjectMembers(projectId: string): Promise<ProjectMember[]> {
  const response = await fetch(`${API_URL}/projects/${projectId}/members`, {
    method: "GET",
    headers: getAuthHeaders(),
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("No se pudieron obtener los miembros del proyecto");
  }

  const data = await response.json();
  const members = Array.isArray(data) ? data : data.data || [];

  return (members as MemberRecord[])
    .filter((member) => Boolean(member.id_user))
    .map((member) => ({
      userId: member.id_user as string,
      role: member.role ?? "developer",
    }));
}

interface BulkMemberRecord {
  id_project?: string;
  id_user?: string;
  role?: ProjectMemberRole;
}

// Trae los miembros de TODOS los proyectos del usuario en 1 request y los agrupa
// por proyecto. Reemplaza el N+1 de la lista de proyectos (un getProjectMembers
// por tarjeta => 2+N requests).
export async function getAllProjectMembers(): Promise<Record<string, ProjectMember[]>> {
  const response = await fetch(`${API_URL}/dashboard/projects-members`, {
    method: "GET",
    headers: getAuthHeaders(),
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("No se pudieron obtener los miembros de los proyectos");
  }

  const data = await response.json();
  const payload = data?.data ?? data;
  const list: BulkMemberRecord[] = Array.isArray(payload?.members) ? payload.members : [];

  const grouped: Record<string, ProjectMember[]> = {};
  for (const member of list) {
    if (!member.id_project || !member.id_user) continue;
    if (!grouped[member.id_project]) grouped[member.id_project] = [];
    grouped[member.id_project].push({
      userId: member.id_user,
      role: member.role ?? "developer",
    });
  }

  return grouped;
}

export interface MemberSyncOp {
  userId: string;
  role: ProjectMemberRole;
}

export interface MemberSyncPayload {
  add: MemberSyncOp[];
  update: MemberSyncOp[];
  remove: string[];
}

// Sincroniza altas/cambios de rol/bajas en UNA request transaccional (todo o nada),
// en vez de un request por operación. El backend revierte todo si algo falla.
export async function syncProjectMembers(projectId: string, payload: MemberSyncPayload): Promise<void> {
  const response = await fetch(`${API_URL}/projects/${projectId}/members/sync`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || "No se pudieron sincronizar los miembros del proyecto");
  }
}

export async function addProjectMember(
  projectId: string,
  userId: string,
  role: ProjectMemberRole = "developer"
): Promise<void> {
  const response = await fetch(`${API_URL}/projects/${projectId}/members`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify({ userId, role }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || "No se pudo agregar miembro al proyecto");
  }
}

export async function removeProjectMember(projectId: string, userId: string): Promise<void> {
  const response = await fetch(`${API_URL}/projects/${projectId}/members/${userId}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || "No se pudo eliminar miembro del proyecto");
  }
}

export async function updateProjectMemberRole(
  projectId: string,
  userId: string,
  role: ProjectMemberRole
): Promise<void> {
  const response = await fetch(`${API_URL}/projects/${projectId}/members/${userId}`, {
    method: "PATCH",
    headers: getAuthHeaders(),
    body: JSON.stringify({ role }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || "No se pudo actualizar rol del miembro");
  }
}
