"use client"

import { useEffect, useState } from "react"
import { getGlobalLeaderboard, LeaderboardEntry } from "@/services/leaderboardService"
import { getMultipleUsersCompletedTodayCount } from "@/services/taskService"
import LeaderboardAvatar from "@/components/ui/avatar/LeaderboardAvatar"

export default function BugsResolved() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [leaderboardLoading, setLeaderboardLoading] = useState(true)
  const [leaderboardError, setLeaderboardError] = useState<string | null>(null)
  const [leaderboardCounts, setLeaderboardCounts] = useState<Map<string, number>>(new Map())

  useEffect(() => {
    let cancelled = false
    getGlobalLeaderboard()
      .then((data) => {
        if (!cancelled) {
          setLeaderboard(data)
          const userIds = data.map(entry => entry.userId)
          getMultipleUsersCompletedTodayCount(userIds)
            .then(counts => {
              if (!cancelled) setLeaderboardCounts(counts)
            })
            .catch(() => {
              /* conteo complementario; si falla no rompe el leaderboard */
            })
        }
      })
      .catch((err: Error) => {
        if (!cancelled) setLeaderboardError(err.message)
      })
      .finally(() => {
        if (!cancelled) setLeaderboardLoading(false)
      })
    return () => { cancelled = true }
  }, [])

  return (
    <div className="w-full h-full flex flex-col">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-slate-900">Leaderboard</h3>
        <p className="text-sm text-gray-500">Top performers this sprint</p>
      </div>

      <div className="flex-1 overflow-y-auto">
        {leaderboardLoading ? (
          <p className="text-sm text-gray-500">Cargando...</p>
        ) : leaderboardError ? (
          <p className="text-sm text-red-500">{leaderboardError}</p>
        ) : leaderboard.length === 0 ? (
          <p className="text-sm text-gray-500">Sin datos todavía</p>
        ) : (
          <div className="flex flex-col gap-3">
            {leaderboard.map((entry, index) => (
              <div key={entry.userId} className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <span className="w-4 shrink-0 text-center text-xs font-semibold text-gray-400">
                    {index + 1}
                  </span>
                  <LeaderboardAvatar
                    src={entry.profileImageUrl ?? "/images/persona.png"}
                    alt={`${entry.name} ${entry.lastname}`}
                    size={48}
                    rank={index + 1}
                    completedTodayCount={leaderboardCounts.get(entry.userId) ?? 0}
                  />
                  <span className="text-sm">{entry.name} {entry.lastname}</span>
                </div>
                <span className="text-sm font-medium">{entry.points}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}