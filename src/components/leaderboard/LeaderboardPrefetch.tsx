"use client"

import { useEffect } from "react"
import { prefetchGlobalLeaderboard } from "@/services/leaderboardService"

/**
 * Componente invisible que warma la caché del leaderboard apenas el shell de la app
 * monta (con sesión activa). Así, cuando el usuario llega a /profile o al dashboard,
 * la data del leaderboard ya está lista (cache hit) y aparece al instante en vez de
 * esperar el round-trip a Render después de la hidratación de la página.
 */
export default function LeaderboardPrefetch() {
  useEffect(() => {
    prefetchGlobalLeaderboard(5)
  }, [])

  return null
}
