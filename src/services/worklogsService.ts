import { getToken } from "@/lib/auth";
import { getProjectTasks } from "@/services/taskService";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

export type WeeklyCompletionDay = {
  date: string;
  dayOfWeek: string;
  completed: number;
};

export type WeeklyProgressData = {
  weekRange: {
    start: string;
    end: string;
    weekOffset: number;
  };
  totalCompleted: number;
  dailyCompletions: WeeklyCompletionDay[];
};

function getAuthHeaders(): Record<string, string> {
  const token = getToken();

  return {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
  };
}

export async function getWeeklyProgress(projectId: string, weekOffset = 0): Promise<WeeklyProgressData> {
  const params = new URLSearchParams();
  params.set("projectId", projectId);
  params.set("weekOffset", String(weekOffset));

  const response = await fetch(`${API_URL}/dashboard/weekly-progress?${params.toString()}`, {
    method: "GET",
    headers: getAuthHeaders(),
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("No se pudo obtener el progreso semanal");
  }

  const data = await response.json();

  if (!data.success || !data.data) {
    throw new Error("La respuesta del progreso semanal no es válida");
  }

  return data.data;
}

export async function getWeeklyVelocitySeries(projectId: string, weeks = 5): Promise<Array<{ label: string; value: number }>> {
  const offsets = Array.from({ length: weeks }, (_, index) => -index).reverse();
  const results = await Promise.all(
    offsets.map(async (offset) => {
      const progress = await getWeeklyProgress(projectId, offset);
      return {
        label: progress.weekRange.start,
        value: progress.totalCompleted,
      };
    })
  );

  return results;
}

export async function getProjectWorklogTasks(projectId: string) {
  const token = getToken();

  if (!token) {
    throw new Error("No hay sesión activa");
  }

  return getProjectTasks(projectId, token);
}