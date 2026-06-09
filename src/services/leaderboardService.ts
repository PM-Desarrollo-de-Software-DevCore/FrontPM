import { getToken } from "@/lib/auth";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

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

// Caché + dedup in-flight del leaderboard global. Permite "prefetchear" la data
// desde el shell de la app (apenas hay sesión) para que cuando /profile o el
// dashboard monten, el leaderboard aparezca al instante en vez de esperar el
// round-trip a Render tras la hidratación. TTL corto: el ranking no cambia al segundo.
const LB_TTL_MS = 60_000;
const lbCache = new Map<number, { data: LeaderboardEntry[]; ts: number }>();
const lbInflight = new Map<number, Promise<LeaderboardEntry[]>>();

async function fetchGlobalLeaderboard(limit: number): Promise<LeaderboardEntry[]> {
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

export async function getGlobalLeaderboard(limit = 5): Promise<LeaderboardEntry[]> {
  const cached = lbCache.get(limit);
  if (cached && Date.now() - cached.ts < LB_TTL_MS) {
    return cached.data;
  }

  const inflight = lbInflight.get(limit);
  if (inflight) {
    return inflight;
  }

  const promise = fetchGlobalLeaderboard(limit)
    .then((data) => {
      lbCache.set(limit, { data, ts: Date.now() });
      return data;
    })
    .finally(() => {
      lbInflight.delete(limit);
    });

  lbInflight.set(limit, promise);
  return promise;
}

// Prefetch fire-and-forget: warma la caché del leaderboard. Se llama desde el shell
// de la app al montar (con sesión activa) para adelantar el fetch a la hidratación.
export function prefetchGlobalLeaderboard(limit = 5): void {
  if (!getToken()) return;
  const cached = lbCache.get(limit);
  if (cached && Date.now() - cached.ts < LB_TTL_MS) return;
  if (lbInflight.get(limit)) return;
  void getGlobalLeaderboard(limit).catch(() => {});
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
