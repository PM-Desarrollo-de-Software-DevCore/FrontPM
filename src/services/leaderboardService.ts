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

// Límite alto para traer la lista COMPLETA de usuarios (el backend la acota a su
// MAX_LIMIT). Se comparte entre el prefetch y los componentes para reusar la
// misma entrada de caché (la key es el limit).
export const FULL_LEADERBOARD_LIMIT = 100;

// El backend en Render tiene cold starts: el primer request tras inactividad puede
// fallar/timeout. Reintentamos con backoff para que el leaderboard no muestre un
// error de fetch transitorio en dashboard/profile.
async function fetchWithRetry(url: string, retries = 2, delayMs = 800): Promise<Response> {
  let lastError: unknown;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const response = await fetch(url, {
        method: "GET",
        headers: getAuthHeaders(),
        cache: "no-store",
      });
      if (response.ok) return response;
      lastError = new Error(`HTTP ${response.status}`);
    } catch (error) {
      lastError = error;
    }

    if (attempt < retries) {
      await new Promise((resolve) => setTimeout(resolve, delayMs * (attempt + 1)));
    }
  }

  throw lastError instanceof Error ? lastError : new Error("No se pudo obtener el leaderboard");
}

async function fetchGlobalLeaderboard(limit: number): Promise<LeaderboardEntry[]> {
  const response = await fetchWithRetry(`${API_URL}/leaderboard?limit=${limit}`);
  const data = await response.json();
  return data.data ?? [];
}

export async function getGlobalLeaderboard(limit = FULL_LEADERBOARD_LIMIT): Promise<LeaderboardEntry[]> {
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
export function prefetchGlobalLeaderboard(limit = FULL_LEADERBOARD_LIMIT): void {
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
