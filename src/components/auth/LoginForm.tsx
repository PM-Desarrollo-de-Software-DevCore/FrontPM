'use client'

/**
 * ======================================================
 * LOGIN FORM COMPONENT
 * ======================================================
 *
 * Este componente renderiza el formulario de login.
 * Maneja:
 *
 * - Inputs controlados
 * - Validación básica
 * - Estados de carga
 * - Errores
 * - Redirección al dashboard
 */

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { useAuth } from '@/hooks/useAuth'

export default function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [formError, setFormError] = useState<string | null>(null)

  const router = useRouter()

  const { login, isLoading, error } = useAuth()

  async function handleSubmit(e: React.FormEvent) {
    // Evita que el navegador recargue la página al enviar el formulario
    e.preventDefault()
    setFormError(null)

    // Validación básica
    if (!email || !password) {
      setFormError('Por favor, ingresa email y contraseña')
      return
    }

    if (!email.includes('@')) {
      setFormError('Ingresa un email válido')
      return
    }

    // Intentar Login
    const result = await login(email, password)

    // Si no hubo error, redirigir
    if (result.success && result.redirectTo) {
      router.push(result.redirectTo)
    }
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row overflow-hidden">
      <div className="w-full md:w-1/2 relative hidden md:block">
        <div className="absolute top-4 left-4 z-10 flex items-center gap-2 rounded-md px-3 py-2 text-zinc-900 dark:text-zinc-100">
          <Image src="/images/logo/TM_Logo_Monochrome_Neg_RGB.png" alt="DevCore" width={150} height={36} />
        </div>
        <Image src="/images/login/techm_brand-pillar-promise.jpg" alt="Tech M Brand" fill className="object-cover" />
      </div>
      <div className="w-full md:w-1/2 flex relative items-center justify-center p-8 text-zinc-900 dark:text-zinc-100">
        <div className="absolute top-4 left-4 z-10 flex items-center gap-2 rounded-md px-3 py-2 text-zinc-900 dark:text-zinc-100">
          <Image src="/images/logo/devcoreIcon.png" alt="DevCore" width={36} height={36} />
          <span className="text-md font-medium">DevCore</span>
        </div>
        <div className="w-full max-w-sm">
          <h2 className="text-4xl font-bold text-center mb-5">
            Inicia Sesión
          </h2>

          {/* Error del formulario */}
          {formError && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              {formError}
            </div>
          )}

          {/* Error del backend */}
          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">

            {/* EMAIL */}
            <div>
              <label htmlFor="email" className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-200">
                Correo electrónico
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nombre@empresa.com"
                disabled={isLoading}
                className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-zinc-900 placeholder:text-zinc-500 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 dark:border-white/15 dark:bg-white/5 dark:text-zinc-100 dark:placeholder:text-zinc-400 dark:focus:border-sky-400"
              />
            </div>

            {/* PASSWORD */}
            <div>
              <label htmlFor="password" className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-200">
                Contraseña
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Ingresa tu contraseña"
                disabled={isLoading}
                className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-zinc-900 placeholder:text-zinc-500 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 dark:border-white/15 dark:bg-white/5 dark:text-zinc-100 dark:placeholder:text-zinc-400 dark:focus:border-sky-400"
              />
            </div>

            {/* BOTÓN LOGIN */}
            <button
              type="submit"
              disabled={isLoading}

              className="
                mt-4
                w-full
                bg-black
                text-white
                py-2
                rounded
                hover:bg-gray-700
                transition
                disabled:opacity-50
                dark:bg-sky-500
                dark:text-slate-950
                dark:hover:bg-sky-400
              "
            >
              {isLoading ? 'Cargando...' : 'Iniciar sesión'}
            </button>

          </form>
        </div>
      </div>
    </div>
  )
}