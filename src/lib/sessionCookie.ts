/**
 * Nombre de la cookie httpOnly que espeja el JWT de sesión (PM-171 Fase 0).
 *
 * La cookie es first-party del dominio del front (Vercel) y solo podrán leerla
 * el middleware y los route handlers de Next (server-side): los fetch directos
 * al backend (Render, cross-origin) siguen mandando `Authorization: Bearer`
 * desde localStorage. En Fase 0 la cookie NO tiene consumidores: es un espejo
 * que se puebla en producción para habilitar la Fase 1 (Server Components +
 * middleware) sin expulsar a las sesiones ya abiertas.
 *
 * Vive en su propio módulo porque los route handlers no pueden exportar
 * constantes arbitrarias y `lib/auth.ts` es código orientado a cliente.
 */
export const SESSION_COOKIE_NAME = 'pm_session'
