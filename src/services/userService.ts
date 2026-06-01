import { ApiError, apiFetch, parseJsonResponse } from "@/lib/api";

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

type BackendMember = {
  id_user: string;
};

type BackendDataResponse<T> = {
  success?: boolean;
  data?: T;
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

function userDirectoryFromBackendFormat(user: BackendUser): UserDirectoryEntry {
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

function mapProfileUser(user: BackendUser): UserProfileDetails {
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

async function getAuthenticatedProfileFromMeEndpoint(): Promise<UserProfileDetails | null> {
  let response: Response;

  try {
    response = await apiFetch("/auth/me", {
      method: "GET",
      requireAuth: true,
      cache: "no-store",
    });
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) {
      return null;
    }

    throw error;
  }

  if (!response.ok) {
    return null;
  }

  const payload = await parseJsonResponse<BackendDataResponse<BackendUser>>(response);
  if (!payload.success || !payload.data) {
    return null;
  }

  return mapProfileUser(payload.data);
}

export async function getNonAdminUsers(): Promise<UserOption[]> {
  const response = await apiFetch("/users", {
    method: "GET",
    requireAuth: true,
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("No se pudieron obtener los usuarios");
  }

  const data = await parseJsonResponse<BackendDataResponse<BackendUser[]> | BackendUser[]>(response);
  const users = Array.isArray(data) ? data : data.data || [];

  return users
    .map(userFromBackendFormat)
    .filter((user: UserOption) => user.role === "user");
}

export async function getUsersDirectory(): Promise<UserDirectoryEntry[]> {
  let response: Response;

  try {
    response = await apiFetch("/users", {
      method: "GET",
      requireAuth: true,
      cache: "no-store",
    });
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) {
      return [];
    }

    throw error;
  }

  if (response.status === 401) {
    return [];
  }

  if (!response.ok) {
    throw new Error("No se pudieron obtener los usuarios");
  }

  const data = await parseJsonResponse<BackendDataResponse<BackendUser[]> | BackendUser[]>(response);
  const users = Array.isArray(data) ? data : data.data || [];

  return users.map(userDirectoryFromBackendFormat);
}

export async function getUserProfileDetails(userId: string): Promise<UserProfileDetails> {
  try {
    const users = await getUsersDirectory();
    const user = users.find((entry) => entry.id === userId);

    if (user) {
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
  } catch {
    // Si /users no está disponible para el rol actual, usamos /auth/me como fallback.
  }

  const meProfile = await getAuthenticatedProfileFromMeEndpoint();
  if (meProfile && meProfile.id === userId) {
    return meProfile;
  }

  throw new Error("Usuario no encontrado");
}

export async function getUserTechnologies(userId: string): Promise<UserTechnologyEntry[]> {
  let response: Response;

  try {
    response = await apiFetch(`/users/${userId}/technologies`, {
      method: "GET",
      requireAuth: true,
      cache: "no-store",
    });
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) {
      return [];
    }

    throw error;
  }

  if (!response.ok) {
    return [];
  }

  const data = await parseJsonResponse<BackendDataResponse<UserTechnologyEntry[]> | UserTechnologyEntry[]>(response);
  return Array.isArray(data) ? data : data.data || [];
}

export async function uploadUserProfileImage(userId: string, imageFile: File): Promise<UserProfileDetails> {
  const formData = new FormData();
  formData.append("image", imageFile);

  const response = await apiFetch(`/users/${userId}/profile-image`, {
    method: "POST",
    requireAuth: true,
    body: formData,
  });

  if (!response.ok) {
    const errorPayload = await parseJsonResponse<{ message?: string }>(response);
    throw new Error(errorPayload.message || "No se pudo subir la imagen de perfil");
  }

  const data = await parseJsonResponse<BackendDataResponse<BackendUser> | BackendUser>(response);
  const user = Array.isArray(data)
    ? (data[0] as BackendUser)
    : (data as BackendDataResponse<BackendUser>).data || (data as BackendUser);

  return mapProfileUser(user);
}

export async function deleteUserProfileImage(userId: string): Promise<UserProfileDetails> {
  const response = await apiFetch(`/users/${userId}/profile-image`, {
    method: "DELETE",
    requireAuth: true,
  });

  if (!response.ok) {
    const errorPayload = await parseJsonResponse<{ message?: string }>(response);
    throw new Error(errorPayload.message || "No se pudo eliminar la imagen de perfil");
  }

  const data = await parseJsonResponse<BackendDataResponse<BackendUser> | BackendUser>(response);
  const user = Array.isArray(data)
    ? (data[0] as BackendUser)
    : (data as BackendDataResponse<BackendUser>).data || (data as BackendUser);

  return mapProfileUser(user);
}

export async function getProjectMembers(projectId: string): Promise<UserOption[]> {
  const membersResponse = await apiFetch(`/projects/${projectId}/members`, {
    method: "GET",
    requireAuth: true,
    cache: "no-store",
  });

  if (!membersResponse.ok) {
    throw new Error("No se pudieron obtener los miembros");
  }

  const membersData = await parseJsonResponse<BackendDataResponse<BackendMember[]> | BackendMember[]>(membersResponse);
  const members = Array.isArray(membersData) ? membersData : membersData.data || [];

  const usersResponse = await apiFetch("/users", {
    method: "GET",
    requireAuth: true,
    cache: "no-store",
  });

  if (!usersResponse.ok) {
    throw new Error("No se pudieron obtener los usuarios");
  }

  const usersData = await parseJsonResponse<BackendDataResponse<BackendUser[]> | BackendUser[]>(usersResponse);
  const users = Array.isArray(usersData) ? usersData : usersData.data || [];

  return members
    .map((member) => {
      const fullUser = users.find((u) => u.id === member.id_user);

      if (!fullUser) return null;

      return {
        id: fullUser.id,
        name: fullUser.name || "",
        lastname: fullUser.lastname || "",
        email: fullUser.email || "",
        role: normalizeRole(fullUser.globalRole || fullUser.role),
      };
    })
    .filter(Boolean) as UserOption[];
}
