import { getToken } from "@/lib/auth";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

type BackendUser = {
  id: string;
  name?: string;
  lastname?: string;
  email?: string;
  globalRole?: string;
  role?: string;
  profileImageUrl?: string | null;
  skill?: string | null;
  area?: string | null;
};

export interface UserOption {
  id: string;
  name: string;
  lastname: string;
  email: string;
  role: "admin" | "user";
}

export interface UserDirectoryEntry {
  id: string;
  name: string;
  lastname: string;
  email: string;
  role: "admin" | "user";
  skill: string | null;
  area: string | null;
  profileImageUrl: string | null;
}

export interface UserProfileDetails {
  id: string;
  name: string;
  lastname: string;
  email: string;
  skill: string | null;
  area: string | null;
  profileImageUrl: string | null;
}

export interface UserTechnologyEntry {
  id_user_tech: string;
  id_user: string;
  technology: string;
  yearsOfExperience: number;
  createdAt: string;
}

function normalizeRole(rawRole?: string): UserOption["role"] {
  return rawRole?.toLowerCase() === "admin" ? "admin" : "user";
}

function userFromBackendFormat(user: BackendUser): UserOption {
  return {
    id: user.id,
    name: user.name ?? "",
    lastname: user.lastname ?? "",
    email: user.email ?? "",
    role: normalizeRole(user.globalRole ?? user.role),
  };
}

function userDirectoryFromBackendFormat(user: any): UserDirectoryEntry {
  return {
    id: user.id,
    name: user.name ?? "",
    lastname: user.lastname ?? "",
    email: user.email ?? "",
    role: normalizeRole(user.globalRole ?? user.role),
    skill: user.skill ?? null,
    area: user.area ?? null,
    profileImageUrl: user.profileImageUrl ?? null,
  };
}

function getAuthHeaders(): Record<string, string> {
  const token = getToken();
  return {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
  };
}

function getMultipartAuthHeaders(): Record<string, string> {
  const token = getToken();

  return {
    ...(token && { Authorization: `Bearer ${token}` }),
  };
}

/**
 * fetch con reintentos ante errores de red o 5xx (blips de Render). No reintenta
 * en 4xx (no se recuperan). Hace la carga del perfil confiable en redes inestables.
 */
async function fetchWithRetry(url: string, init: RequestInit, maxAttempts = 3): Promise<Response> {
  let lastError: unknown;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const response = await fetch(url, init);
      if (response.status >= 500 && attempt < maxAttempts) {
        await new Promise((resolve) => setTimeout(resolve, 600 * attempt));
        continue;
      }
      return response;
    } catch (error) {
      lastError = error;
      if (attempt === maxAttempts) break;
      await new Promise((resolve) => setTimeout(resolve, 600 * attempt));
    }
  }

  throw lastError ?? new Error("No se pudo conectar con el servidor");
}

// Caché + dedup in-flight del directorio /users. Varios componentes piden el
// directorio completo casi a la vez (AuthProvider, leaderboard, change-requests,
// selección de miembros...). Sin esto se hacían N fetches del mismo payload pesado,
// saturando las ~6 conexiones del navegador y retrasando otras requests (p.ej. el
// leaderboard). Con dedup in-flight las llamadas concurrentes comparten 1 request;
// el TTL corto evita refetch en navegaciones seguidas. La gestión de usuarios
// (users/create) hace su propio fetch directo, así que siempre ve datos frescos.
const USERS_RAW_TTL_MS = 30_000;
let usersRawCache: { data: any[]; ts: number } | null = null;
let usersRawInflight: Promise<any[]> | null = null;

async function getUsersRaw(): Promise<any[]> {
  if (usersRawCache && Date.now() - usersRawCache.ts < USERS_RAW_TTL_MS) {
    return usersRawCache.data;
  }
  if (usersRawInflight) {
    return usersRawInflight;
  }

  usersRawInflight = (async () => {
    const response = await fetchWithRetry(`${API_URL}/users`, {
      method: "GET",
      headers: getAuthHeaders(),
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error("No se pudieron obtener los usuarios");
    }

    const data = await response.json();
    const users = Array.isArray(data) ? data : data.data || [];
    usersRawCache = { data: users, ts: Date.now() };
    return users;
  })();

  try {
    return await usersRawInflight;
  } finally {
    usersRawInflight = null;
  }
}

// Invalida la caché del directorio (usar tras crear/editar/borrar usuarios si se
// necesita frescura inmediata; el TTL se auto-sana en USERS_RAW_TTL_MS de todos modos).
export function invalidateUsersCache(): void {
  usersRawCache = null;
  usersRawInflight = null;
}

export async function getNonAdminUsers(): Promise<UserOption[]> {
  const users = await getUsersRaw();

  return users
    .map(userFromBackendFormat)
    .filter((user: UserOption) => user.role === "user");
}

export async function getUsersDirectory(): Promise<UserDirectoryEntry[]> {
  const users = await getUsersRaw();

  return users.map(userDirectoryFromBackendFormat);
}

export async function getUserProfileDetails(userId: string): Promise<UserProfileDetails> {
  const users = await getUsersDirectory();
  const user = users.find((entry) => entry.id === userId);

  if (!user) {
    throw new Error("Usuario no encontrado");
  }

  return {
    id: user.id,
    name: user.name ?? "",
    lastname: user.lastname ?? "",
    email: user.email ?? "",
    skill: user.skill ?? null,
    area: user.area ?? null,
    profileImageUrl: user.profileImageUrl ?? null,
  };
}

export async function getUserTechnologies(userId: string): Promise<UserTechnologyEntry[]> {
  const response = await fetchWithRetry(`${API_URL}/users/${userId}/technologies`, {
    method: "GET",
    headers: getAuthHeaders(),
    cache: "no-store",
  });

  if (!response.ok) {
    return [];
  }

  const data = await response.json();
  return Array.isArray(data) ? data : data.data || [];
}

export async function uploadUserProfileImage(userId: string, imageFile: File): Promise<UserProfileDetails> {
  const formData = new FormData();
  formData.append("image", imageFile);

  const response = await fetch(`${API_URL}/users/${userId}/profile-image`, {
    method: "POST",
    headers: getMultipartAuthHeaders(),
    body: formData,
  });

  if (!response.ok) {
    const errorPayload = await response.json().catch(() => ({}));
    throw new Error(errorPayload.message || "No se pudo subir la imagen de perfil");
  }

  const data = await response.json();
  const user = data.data || data;

  return {
    id: user.id,
    name: user.name ?? "",
    lastname: user.lastname ?? "",
    email: user.email ?? "",
    skill: user.skill ?? null,
    area: user.area ?? null,
    profileImageUrl: user.profileImageUrl ?? null,
  };
}

export async function deleteUserProfileImage(userId: string): Promise<UserProfileDetails> {
  const response = await fetch(`${API_URL}/users/${userId}/profile-image`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    const errorPayload = await response.json().catch(() => ({}));
    throw new Error(errorPayload.message || "No se pudo eliminar la imagen de perfil");
  }

  const data = await response.json();
  const user = data.data || data;

  return {
    id: user.id,
    name: user.name ?? "",
    lastname: user.lastname ?? "",
    email: user.email ?? "",
    skill: user.skill ?? null,
    area: user.area ?? null,
    profileImageUrl: user.profileImageUrl ?? null,
  };
}

export async function getProjectMembers(
  projectId: string
): Promise<UserOption[]> {

  // GET MEMBERS

  const membersResponse =
    await fetch(
      `${API_URL}/projects/${projectId}/members`,
      {
        method: "GET",

        headers:
          getAuthHeaders(),

        cache: "no-store",
      }
    )

  if (!membersResponse.ok) {
    throw new Error(
      "No se pudieron obtener los miembros"
    )
  }

  const membersData =
    await membersResponse.json()

  const members =
    Array.isArray(
      membersData
    )
      ? membersData
      : membersData.data ||
        []

  // GET USERS

  const usersResponse =
    await fetch(
      `${API_URL}/users`,
      {
        method: "GET",

        headers:
          getAuthHeaders(),

        cache: "no-store",
      }
    )

  if (!usersResponse.ok) {
    throw new Error(
      "No se pudieron obtener los usuarios"
    )
  }

  const usersData =
    await usersResponse.json()

  const users =
    Array.isArray(
      usersData
    )
      ? usersData
      : usersData.data ||
        []

  // COMBINE MEMBERS + USERS

  return members
    .map((member: any) => {
      const fullUser =
        users.find(
          (u: any) =>
            u.id ===
            member.id_user
        )

      if (!fullUser)
        return null

      return {
        id: fullUser.id,

        name:
          fullUser.name ||
          "",

        lastname:
          fullUser.lastname ||
          "",

        email:
          fullUser.email ||
          "",

        role:
          normalizeRole(
            fullUser.globalRole ||
              fullUser.role
          ),
      }
    })
    .filter(Boolean) as UserOption[]
}