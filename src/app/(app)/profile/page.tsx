"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card/card";
import { Button } from "@/components/ui/Button/button";
import TaskChart from "@/components/ui/graphs/taskResume";
import { getGlobalLeaderboard, LeaderboardEntry } from "@/services/leaderboardService";
import { useAuth } from "@/hooks/useAuth";
import { getUserCompletedTodayCount, getMultipleUsersCompletedTodayCount, getMyTasks } from "@/services/taskService";
import FramedAvatar from "@/components/ui/avatar/FramedAvatar";
import LeaderboardAvatar from "@/components/ui/avatar/LeaderboardAvatar";
<<<<<<< HEAD
import {
  getUserProfileDetails,
  getUserTechnologies,
  UserProfileDetails,
  UserTechnologyEntry,
} from "@/services/userService";
  import ThemeToggle from "@/components/ui/ThemeToggle";
import { useLanguage } from "@/components/i18n/LanguageProvider";
import { Task } from "@/types/task";

function splitValues(value: string | null | undefined): string[] {
  if (!value) return [];

  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function formatTaskDate(value?: string | null): string {
  if (!value) return "Sin fecha"

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return "Sin fecha"

  return new Intl.DateTimeFormat("es-ES", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date)
}

function getTaskStatusLabel(status: Task["status"]): string {
  switch (status) {
    case "completed":
      return "Completada"
    case "in_progress":
      return "En progreso"
    default:
      return "Pendiente"
  }
}

function getTaskStatusStyles(status: Task["status"]): string {
  switch (status) {
    case "completed":
      return "bg-emerald-100 text-emerald-700"
    case "in_progress":
      return "bg-sky-100 text-sky-700"
    default:
      return "bg-amber-100 text-amber-700"
  }
}

function getPriorityLabel(priority: Task["priority"]): string {
  switch (priority) {
    case "high":
      return "Alta"
    case "medium":
      return "Media"
    default:
      return "Baja"
  }
}

function getTaskProgressColor(status: Task["status"]): string {
  switch (status) {
    case "completed":
      return "bg-emerald-500"
    case "in_progress":
      return "bg-sky-500"
    default:
      return "bg-amber-500"
  }
}
=======
import ThemeToggle from "@/components/ui/ThemeToggle";
>>>>>>> PM-57_Modo-oscuro

export default function ProfileDashboard() {
  const { language, toggleLanguage } = useLanguage();
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [leaderboardLoading, setLeaderboardLoading] = useState(true);
  const [leaderboardError, setLeaderboardError] = useState<string | null>(null);
  const { user } = useAuth()

  const [profile, setProfile] = useState<UserProfileDetails | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [technologies, setTechnologies] = useState<UserTechnologyEntry[]>([]);
  const [myTasks, setMyTasks] = useState<Task[]>([])
  const [tasksLoading, setTasksLoading] = useState(true)
  const [tasksError, setTasksError] = useState<string | null>(null)

  const [completedToday, setCompletedToday] = useState<number>(0)
  const [completedLoading, setCompletedLoading] = useState<boolean>(true)
  const [leaderboardCounts, setLeaderboardCounts] = useState<Map<string, number>>(new Map())

  useEffect(() => {
    let cancelled = false;
    getGlobalLeaderboard(5)
      .then((data) => {
        if (!cancelled) {
          setLeaderboard(data);
          
          // Cargar conteos de tareas para todos los usuarios del leaderboard
          const userIds = data.map(entry => entry.userId)
          getMultipleUsersCompletedTodayCount(userIds).then(counts => {
            if (!cancelled) setLeaderboardCounts(counts)
          })
        }
      })
      .catch((err: Error) => {
        if (!cancelled) setLeaderboardError(err.message);
      })
      .finally(() => {
        if (!cancelled) setLeaderboardLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false

    async function fetchCount() {
      if (!user) {
        setCompletedToday(0)
        setCompletedLoading(false)
        return
      }

      setCompletedLoading(true)
      try {
        const count = await getUserCompletedTodayCount()
        if (!cancelled) setCompletedToday(count)
      } catch (err) {
        console.error(err)
        if (!cancelled) setCompletedToday(0)
      } finally {
        if (!cancelled) setCompletedLoading(false)
      }
    }

    fetchCount()

    return () => {
      cancelled = true
    }
  }, [user])

  useEffect(() => {
    let cancelled = false;

    async function loadProfile() {
      if (!user?.id) {
        setProfile(null);
        setTechnologies([]);
        setProfileLoading(false);
        return;
      }

      setProfileLoading(true);
      setProfileError(null);

      try {
        const [profileData, technologiesData] = await Promise.all([
          getUserProfileDetails(user.id),
          getUserTechnologies(user.id),
        ]);

        if (!cancelled) {
          setProfile(profileData);
          setTechnologies(technologiesData);
        }
      } catch (err) {
        if (!cancelled) {
          setProfileError(err instanceof Error ? err.message : "No se pudo cargar el perfil");
          setProfile(null);
          setTechnologies([]);
        }
      } finally {
        if (!cancelled) {
          setProfileLoading(false);
        }
      }
    }

    loadProfile();

    return () => {
      cancelled = true;
    };
  }, [user?.id]);

  const displayName = profile ? `${profile.name} ${profile.lastname}`.trim() : `${user?.name ?? ""} ${user?.lastname ?? ""}`.trim();
  const email = profile?.email ?? user?.email ?? "Sin correo disponible";
  const avatarSrc = profile?.profileImageUrl ?? user?.avatar ?? "/images/persona.png";
  const mainSkill = profile?.skill?.trim() || "No definida";
  const areaList = splitValues(profile?.area);
  const technologyNames = technologies.map((item) => item.technology.trim()).filter(Boolean);
  const isAdmin = user?.role === "admin"

  useEffect(() => {
    let cancelled = false

    async function loadMyTasks() {
      if (isAdmin) {
        setMyTasks([])
        setTasksError(null)
        setTasksLoading(false)
        return
      }

      setTasksLoading(true)
      setTasksError(null)

      try {
        const tasks = await getMyTasks()
        if (!cancelled) {
          setMyTasks(tasks)
        }
      } catch (err) {
        if (!cancelled) {
          setTasksError(err instanceof Error ? err.message : "No se pudieron cargar las tareas")
          setMyTasks([])
        }
      } finally {
        if (!cancelled) {
          setTasksLoading(false)
        }
      }
    }

    loadMyTasks()

    return () => {
      cancelled = true
    }
  }, [isAdmin])

  const taskStats = myTasks.reduce(
    (acc, task) => {
      acc.total += 1
      if (task.status === "completed") acc.completed += 1
      else if (task.status === "in_progress") acc.inProgress += 1
      else acc.pending += 1
      return acc
    },
    { total: 0, completed: 0, inProgress: 0, pending: 0 }
  )

  return (
    <div className="w-full px-4 sm:px-6 lg:px-10 pt-0 pb-4 max-w-350 mx-auto overflow-x-hidden">

      <div className="grid grid-cols-1 md:grid-cols-6 lg:grid-cols-12 gap-6 items-start w-full">

        <div className="md:col-span-2 lg:col-span-3 flex flex-col gap-4">

          <Card className="rounded-2xl shadow-sm p-4 sm:p-6 text-center border border-gray-100">
            <div className="flex flex-col items-center gap-3">

              <FramedAvatar
                src={avatarSrc}
                alt="profile"
                size={100}
                completedTodayCount={completedLoading ? null : completedToday}
                priority
                frameSize="xl"
              />

              <div className="space-y-1">
                <h2 className="font-semibold text-base sm:text-lg">
                  {profileLoading ? "Cargando perfil..." : displayName || "Usuario"}
                </h2>

<<<<<<< HEAD
                <p className="text-xs sm:text-sm text-gray-500">
                  {profileLoading ? "Obteniendo datos del usuario" : email}
                </p>
              </div>

              <div className="grid w-full grid-cols-1 gap-3 pt-2 text-left sm:grid-cols-2">
                <div className="rounded-xl border border-gray-100 bg-gray-50 px-3 py-3">
                  <p className="text-[11px] uppercase tracking-wide text-gray-400">Skill principal</p>
                  <p className="mt-1 text-sm font-medium text-gray-800">{profileLoading ? "..." : mainSkill}</p>
                </div>

                <div className="rounded-xl border border-gray-100 bg-gray-50 px-3 py-3">
                  <p className="text-[11px] uppercase tracking-wide text-gray-400">Area</p>
                  <p className="mt-1 text-sm font-medium text-gray-800">
                    {profileLoading ? "..." : areaList.length > 0 ? areaList.join(", ") : "No definida"}
                  </p>
                </div>
              </div>

              {profileError && (
                <p className="w-full rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-left text-xs text-red-600">
                  {profileError}
                </p>
              )}
            </div>
          </Card>

          <Card className="rounded-2xl shadow-sm p-4 sm:p-6 border border-gray-100">
            <div className="flex items-center justify-between gap-2">
              <h2 className="font-semibold text-sm sm:text-base">Skills</h2>
              <span className="text-xs text-gray-400">{technologyNames.length} registradas</span>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              {technologyNames.length > 0 ? (
                technologyNames.map((technology) => (
                  <span
                    key={technology}
                    className="rounded-full border border-blue-100 bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700"
                  >
                    {technology}
                  </span>
                ))
              ) : (
                <p className="text-xs text-gray-500">No hay skills registradas todavía.</p>
              )}
=======
              <p className="text-xs sm:text-sm text-gray-500">
                Ahmedabad, Gujarat
              </p>
              <div className="mt-3">
                <ThemeToggle />
              </div>
>>>>>>> PM-57_Modo-oscuro
            </div>
          </Card>

          <Button className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl py-3 sm:py-4 text-sm w-full">
            Request Modification
          </Button>

          <Button
            type="button"
            data-no-i18n="true"
            onClick={toggleLanguage}
            className="bg-slate-900 hover:bg-slate-800 text-white rounded-xl py-3 sm:py-4 text-sm w-full"
          >
            {language === "en" ? "Switch to Spanish" : "Cambiar a Ingles"}
          </Button>
        </div>

        {!isAdmin && (
          <div className="md:col-span-4 lg:col-span-6 flex flex-col">

            <Card className="rounded-2xl shadow-sm border border-gray-100 flex flex-col lg:h-150">

              <div className="p-4 sm:p-6 border-b flex justify-between items-center flex-wrap gap-2">
                <h2 className="text-lg sm:text-xl font-semibold">
                  Tasks
                </h2>
                <span className="text-xs text-gray-400">
                  {tasksLoading ? "Cargando..." : `${taskStats.total} tareas`}
                </span>
              </div>

              <div className="flex-1 overflow-y-auto p-4 sm:p-6 flex flex-col gap-4 sm:gap-6">
                {tasksError ? (
                  <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                    {tasksError}
                  </p>
                ) : tasksLoading ? (
                  <p className="text-sm text-gray-500">Cargando tareas...</p>
                ) : myTasks.length === 0 ? (
                  <p className="text-sm text-gray-500">No tienes tareas asignadas todavía.</p>
                ) : (
                  myTasks.map((task) => (
                    <div
                      key={task.id}
                      className="rounded-xl border border-gray-100 px-4 sm:px-6 py-4 shadow-sm bg-white"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-semibold text-sm sm:text-base text-slate-900">
                            {task.title}
                          </p>
                          <p className="text-xs sm:text-sm text-gray-500 mt-1">
                            {task.description?.trim() || "Sin descripción"}
                          </p>
                        </div>

                        <span className={`rounded-full px-3 py-1 text-xs font-medium ${getTaskStatusStyles(task.status)}`}>
                          {getTaskStatusLabel(task.status)}
                        </span>
                      </div>

                      <div className="mt-3 flex flex-wrap gap-2 text-xs">
                        <span className="rounded-full bg-slate-100 px-3 py-1 text-slate-600">
                          Prioridad: {getPriorityLabel(task.priority)}
                        </span>
                        <span className="rounded-full bg-slate-100 px-3 py-1 text-slate-600">
                          Vence: {formatTaskDate(task.end_date)}
                        </span>
                      </div>

                    </div>
                  ))
                )}
              </div>
            </Card>
          </div>
        )}

        <div className={isAdmin ? "md:col-span-4 lg:col-span-9 flex flex-col gap-4" : "md:col-span-6 lg:col-span-3 flex flex-col gap-4"}>

          <Card className="rounded-2xl shadow-sm p-4 sm:p-6 border border-gray-100">

            <h2 className="font-semibold mb-4 text-sm sm:text-base">
              Leaderboard
            </h2>

            {leaderboardLoading ? (
              <p className="text-xs sm:text-sm text-gray-500">Cargando...</p>
            ) : leaderboardError ? (
              <p className="text-xs sm:text-sm text-red-500">{leaderboardError}</p>
            ) : leaderboard.length === 0 ? (
              <p className="text-xs sm:text-sm text-gray-500">Sin datos todavía</p>
            ) : (
              <div className="flex flex-col gap-3 sm:gap-4">
                {leaderboard.map((entry) => (
                  <div key={entry.userId} className="flex justify-between items-center">

                    <div className="flex items-center gap-2 sm:gap-3">
                      <LeaderboardAvatar
                        src={entry.profileImageUrl ?? "/images/persona.png"}
                        alt={`${entry.name} ${entry.lastname}`}
                        size={48}
                        completedTodayCount={leaderboardCounts.get(entry.userId) ?? 0}
                      />
                      <span className="text-xs sm:text-sm">
                        {entry.name} {entry.lastname}
                      </span>
                    </div>

                    <span className="text-xs sm:text-sm font-medium">
                      {entry.points}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {!isAdmin && (
            <Card className="rounded-2xl shadow-sm p-4 sm:p-6 border border-gray-100 flex flex-col items-center">

              <h2 className="font-semibold text-sm sm:text-base mb-4 text-center">
                Tasks
              </h2>

              <div className="w-40 h-40 sm:w-50 sm:h-50 flex items-center justify-center">
                <TaskChart
                  completed={taskStats.completed}
                  inProgress={taskStats.inProgress}
                  pending={taskStats.pending}
                />
              </div>

              <div className="mt-4 flex w-full justify-between text-xs text-gray-500">
                <span>Completadas: {taskStats.completed}</span>
                <span>En progreso: {taskStats.inProgress}</span>
                <span>Pendientes: {taskStats.pending}</span>
              </div>

            </Card>
          )}
        </div>

      </div>
    </div>
  );
}
