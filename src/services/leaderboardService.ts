import { getToken } from "@/lib/auth";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export interface LeaderboardEntry {
  userId: string;
  name: string;
  lastname: string;
  profileImageUrl: string | null;
  points: number;
}

function getAuthHeaders(): Record<string, string> {
  const token = getToken();
  return {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
  };
}

export async function getGlobalLeaderboard(limit = 5): Promise<LeaderboardEntry[]> {
  const response = await fetch(`${API_URL}/leaderboard?limit=${limit}`, {
    method: "GET",
    headers: getAuthHeaders(),
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("No se pudo obtener el leaderboard");
  }

  const data = await response.json();
  return data.data ?? [];
}

export async function getProjectLeaderboard(projectId: string, limit = 5): Promise<LeaderboardEntry[]> {
  const response = await fetch(`${API_URL}/projects/${projectId}/leaderboard?limit=${limit}`, {
    method: "GET",
    headers: getAuthHeaders(),
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("No se pudo obtener el leaderboard del proyecto");
  }

  const data = await response.json();
  return data.data ?? [];
}
