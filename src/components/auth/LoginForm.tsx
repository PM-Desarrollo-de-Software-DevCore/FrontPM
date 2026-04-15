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

import TextField from '@mui/material/TextField'

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
        <div className="absolute top-4 left-4 z-10 flex items-center gap-2 rounded-md px-3 py-2 text-black">
          <Image src="/images/logo/TM_Logo_Monochrome_Neg_RGB.png" alt="DevCore" width={150} height={36} />
        </div>
        <Image src="/images/login/techm_brand-pillar-promise.jpg" alt="Tech M Brand" fill className="object-cover" />
      </div>
      <div className="w-full md:w-1/2 flex relative items-center justify-center p-8">
        <div className="absolute top-4 left-4 z-10 flex items-center gap-2 rounded-md px-3 py-2 text-black">
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

              <TextField
                id="standard-email"
                label="Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                variant="standard"
                
                disabled={isLoading}
                fullWidth
              />
            </div>

            {/* PASSWORD */}
            <div>

              <TextField
                id="standard-password"
                label="Password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                variant="standard"
                disabled={isLoading}
                fullWidth
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