"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card/card";
import { Button } from "@/components/ui/Button/button";
import TaskChart from "@/components/ui/graphs/taskResume";
import { getGlobalLeaderboard, LeaderboardEntry } from "@/services/leaderboardService";
import { useAuth } from "@/hooks/useAuth";
import { getUserCompletedTodayCount, getMultipleUsersCompletedTodayCount } from "@/services/taskService";
import FramedAvatar from "@/components/ui/avatar/FramedAvatar";
import LeaderboardAvatar from "@/components/ui/avatar/LeaderboardAvatar";
import ThemeToggle from "@/components/ui/ThemeToggle";

export default function ProfileDashboard() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [leaderboardLoading, setLeaderboardLoading] = useState(true);
  const [leaderboardError, setLeaderboardError] = useState<string | null>(null);
  const { user } = useAuth()

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

  return (
    <div className="w-full px-4 sm:px-6 lg:px-10 pt-0 pb-4 max-w-[1400px] mx-auto overflow-x-hidden">

      <div className="grid grid-cols-1 md:grid-cols-6 lg:grid-cols-12 gap-6 items-start w-full">

        <div className="md:col-span-2 lg:col-span-3 flex flex-col gap-4">

          <Card className="rounded-2xl shadow-sm p-4 sm:p-6 text-center border border-gray-100">
            <div className="flex flex-col items-center gap-3">

              <FramedAvatar
                src={user?.avatar ?? "/images/persona.png"}
                alt="profile"
                size={100}
                completedTodayCount={completedLoading ? null : completedToday}
                priority
                frameSize="xl"
              />

              <h2 className="font-semibold text-base sm:text-lg">
                Yash Ghori
              </h2>

              <p className="text-xs sm:text-sm text-gray-500">
                Ahmedabad, Gujarat
              </p>
              <div className="mt-3">
                <ThemeToggle />
              </div>
            </div>
          </Card>

          <Button className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl py-3 sm:py-4 text-sm w-full">
            Request Modification
          </Button>
        </div>

        <div className="md:col-span-4 lg:col-span-6 flex flex-col">

          <Card className="rounded-2xl shadow-sm border border-gray-100 flex flex-col lg:h-[600px]">

            <div className="p-4 sm:p-6 border-b flex justify-between items-center flex-wrap gap-2">
              <h2 className="text-lg sm:text-xl font-semibold">
                Tasks
              </h2>
            </div>

            <div className="flex-1 overflow-y-auto p-4 sm:p-6 flex flex-col gap-4 sm:gap-6">

              {[...Array(8)].map((_, i) => (
                <div
                  key={i}
                  className="rounded-xl border border-gray-100 px-4 sm:px-6 py-4 shadow-sm"
                >
                  <p className="font-semibold text-sm sm:text-base">
                    Make an Automatic Payment System
                  </p>

                  <p className="text-xs sm:text-sm text-gray-500 mt-1">
                    Opened 10 days ago
                  </p>

                  <div className="flex gap-2 mt-3 flex-wrap">
                    <span className="bg-green-100 text-green-600 text-xs px-3 py-1 rounded-full">
                      Completed
                    </span>
                  </div>
                </div>
              ))}

            </div>
          </Card>
        </div>

        <div className="md:col-span-6 lg:col-span-3 flex flex-col gap-4">

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

          <Card className="rounded-2xl shadow-sm p-4 sm:p-6 border border-gray-100 flex flex-col items-center">

            <h2 className="font-semibold text-sm sm:text-base mb-4 text-center">
              Tasks
            </h2>

            <div className="w-[160px] h-[160px] sm:w-[200px] sm:h-[200px] flex items-center justify-center">
              <TaskChart />
            </div>

          </Card>
        </div>

      </div>
    </div>
  );
}
