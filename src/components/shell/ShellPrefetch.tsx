"use client"

import { useEffect } from "react"
import { prefetchGlobalLeaderboard } from "@/services/leaderboardService"
import { prefetchUsersDirectory } from "@/services/userService"
import { prefetchProjects } from "@/services/projectService"

/**
 * Componente invisible que warma cachés de datos compartidos apenas el shell de la
 * app monta (con sesión activa): leaderboard global, directorio de usuarios y lista
 * de proyectos.
 * Así, al navegar a /profile, al dashboard o a la gestión de usuarios, la data ya
 * está lista (cache hit) y aparece al instante en vez de esperar el round-trip a
 * Render después de la hidratación de cada página.
 */
export default function ShellPrefetch() {
  useEffect(() => {
    prefetchGlobalLeaderboard()
    prefetchUsersDirectory()
    prefetchProjects()
  }, [])

  return null
}
