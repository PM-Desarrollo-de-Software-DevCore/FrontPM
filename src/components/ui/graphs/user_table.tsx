"use client"

import { useEffect, useState } from "react"
import { getGlobalLeaderboard, LeaderboardEntry } from "@/services/leaderboardService"
import { getMultipleUsersCompletedTodayCount } from "@/services/taskService"
import LeaderboardAvatar from "@/components/ui/avatar/LeaderboardAvatar"

export default function BugsResolved() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [leaderboardCounts, setLeaderboardCounts] = useState<Map<string, number>>(new Map())

  useEffect(() => {
    let cancelled = false

    getGlobalLeaderboard()
      .then((data) => {
        if (!cancelled) {
          setLeaderboard(data)
          const userIds = data.map((entry) => entry.userId)
          getMultipleUsersCompletedTodayCount(userIds)
            .then((counts) => {
              if (!cancelled) setLeaderboardCounts(counts)
            })
            .catch(() => {
              /* el conteo de hoy es complementario; si falla no rompe el leaderboard */
            })
        }
      })
      .catch((err: Error) => {
        if (!cancelled) setError(err.message)
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false)
      })

    return () => { cancelled = true }
  }, [])

  return (
    <div className="rounded-xl border border-zinc-200 bg-white shadow-sm overflow-hidden flex flex-col h-[420px]">
      <div className="px-4 py-3 border-b border-zinc-200 shrink-0">
        <h2 className="text-sm font-semibold text-zinc-900">Leaderboard</h2>
      </div>

      <div className="flex-1 overflow-y-auto divide-y divide-zinc-200">
        {isLoading ? (
          Array.from({ length: 5 }, (_, i) => (
            <div key={i} className="flex items-center gap-3 px-4 py-3 animate-pulse">
              <div className="h-8 w-8 rounded-full bg-zinc-100 shrink-0" />
              <div className="min-w-0 flex-1 space-y-1.5">
                <div className="h-3 w-1/2 rounded bg-zinc-100" />
                <div className="h-2.5 w-1/4 rounded bg-zinc-100" />
              </div>
              <div className="h-3 w-8 rounded bg-zinc-100" />
            </div>
          ))
        ) : error ? (
          <div className="flex h-full items-center justify-center text-xs text-zinc-400">
            {error}
          </div>
        ) : leaderboard.length === 0 ? (
          <div className="flex h-full items-center justify-center text-xs text-zinc-400">
            Sin datos todavía.
          </div>
        ) : (
          leaderboard.map((entry, index) => (
            <div key={entry.userId} className="flex items-center gap-3 px-4 py-3">
              <span className="text-[11px] font-semibold text-zinc-400 w-4 shrink-0 text-center">
                {index + 1}
              </span>

              <LeaderboardAvatar
                src={entry.profileImageUrl ?? "/images/persona.png"}
                alt={`${entry.name} ${entry.lastname}`}
                size={32}
                rank={index + 1}
                completedTodayCount={leaderboardCounts.get(entry.userId) ?? 0}
              />

              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold text-zinc-900 truncate">
                  {entry.name} {entry.lastname}
                </p>
                <p className="text-[11px] text-zinc-400 mt-0.5">
                  {leaderboardCounts.get(entry.userId) ?? 0} tareas hoy
                </p>
              </div>

              <span className="text-xs font-semibold text-zinc-700 shrink-0 pr-2">
                {entry.points} pts
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  )
}