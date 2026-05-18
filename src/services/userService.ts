import { getToken } from "@/lib/auth";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

type BackendUser = {
  id: string;
  name?: string;
  lastname?: string;
  email?: string;
  globalRole?: string;
  role?: string;
};

export interface UserOption {
  id: string;
  name: string;
  lastname: string;
  email: string;
  role: "admin" | "user";
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

function getAuthHeaders(): Record<string, string> {
  const token = getToken();
  return {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
  };
}

export async function getNonAdminUsers(): Promise<UserOption[]> {
  const response = await fetch(`${API_URL}/users`, {
    method: "GET",
    headers: getAuthHeaders(),
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("No se pudieron obtener los usuarios");
  }

  const data = await response.json();
  const users = Array.isArray(data) ? data : data.data || [];

  return users
    .map(userFromBackendFormat)
    .filter((user: UserOption) => user.role === "user");
}
