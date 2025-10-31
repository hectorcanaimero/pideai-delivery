/**
 * Página de Login - PideAI Admin
 *
 * Página de autenticación para administradores del panel de PideAI.
 * Permite a usuarios con roles admin, sub-admin o soporte iniciar sesión.
 *
 * @module app/(auth)/login/page
 *
 * Flujo de autenticación:
 * 1. Usuario ingresa email y contraseña
 * 2. Se llama a supabase.auth.signInWithPassword()
 * 3. Se valida que el usuario tenga rol de administrador en la tabla profiles
 * 4. Si el rol no es válido, se hace signOut y se muestra error
 * 5. Si es válido, se redirige a /dashboard
 *
 * Características:
 * - Validación de formulario en tiempo real
 * - Mensajes de error amigables
 * - Loading states durante autenticación
 * - Diseño limpio inspirado en resend.com
 *
 * Principios SOLID:
 * - Single Responsibility: Solo maneja el login
 * - Dependency Inversion: Depende de abstracciones (createClient)
 */

'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import type { UserRole } from '@/types'

/**
 * Componente de página de Login
 *
 * @returns {JSX.Element} Página de login
 */
export default function LoginPage() {
  // State del formulario
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)

  // Hooks de Next.js
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  // Cliente de Supabase
  const supabase = createClient()

  /**
   * Maneja el envío del formulario de login
   *
   * Proceso:
   * 1. Valida que email y password no estén vacíos
   * 2. Intenta autenticar con Supabase
   * 3. Obtiene el perfil del usuario desde la tabla profiles
   * 4. Valida que el usuario tenga un rol de administrador
   * 5. Redirige a /dashboard si todo es válido
   *
   * @param {React.FormEvent} e - Evento del formulario
   */
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    // Validación básica
    if (!email || !password) {
      setError('Por favor ingresa email y contraseña')
      return
    }

    startTransition(async () => {
      try {
        // Paso 1: Autenticar con Supabase
        const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
          email,
          password,
        })

        if (authError) {
          throw new Error(authError.message)
        }

        if (!authData.user) {
          throw new Error('No se pudo autenticar el usuario')
        }

        // Paso 2: Obtener perfil del usuario desde la tabla profiles
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', authData.user.id)
          .single()

        // Si no hay perfil o hay error, el usuario no tiene acceso
        if (profileError || !profile) {
          // Cerrar sesión porque el usuario no tiene perfil de admin
          await supabase.auth.signOut()
          throw new Error('No se encontró un perfil de administrador para este usuario')
        }

        // Paso 3: Validar que el rol sea de administrador
        const validRoles: UserRole[] = ['admin', 'sub-admin', 'soporte']

        if (!validRoles.includes(profile.role as UserRole)) {
          // Cerrar sesión porque el rol no es válido
          await supabase.auth.signOut()
          throw new Error('No tienes permisos de administrador para acceder a este panel')
        }

        // Paso 4: Redirigir al dashboard
        // Usar router.push con refresh para que el middleware detecte la nueva sesión
        router.push('/dashboard')
        router.refresh()

      } catch (err: any) {
        // Manejar errores de forma amigable
        console.error('Error de autenticación:', err)

        // Personalizar mensajes de error comunes
        let errorMessage = err.message

        if (err.message.includes('Invalid login credentials')) {
          errorMessage = 'Email o contraseña incorrectos'
        } else if (err.message.includes('Email not confirmed')) {
          errorMessage = 'Por favor confirma tu email antes de iniciar sesión'
        } else if (err.message.includes('Too many requests')) {
          errorMessage = 'Demasiados intentos. Por favor espera un momento e intenta de nuevo'
        }

        setError(errorMessage)
      }
    })
  }

  return (
    <Card className="border-border/50 shadow-lg">
      <CardHeader className="space-y-1">
        <div className="flex items-center justify-center mb-4">
          {/* Logo de PideAI - Puedes reemplazar esto con tu logo real */}
          <div className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-xl">P</span>
            </div>
            <span className="text-2xl font-bold">PideAI</span>
          </div>
        </div>
        <CardTitle className="text-2xl text-center">
          Panel de Administración
        </CardTitle>
        <CardDescription className="text-center">
          Inicia sesión para continuar
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleLogin} className="space-y-4">
          {/* Campo de Email */}
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="admin@pideai.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isPending}
              required
              autoComplete="email"
              className="h-11"
            />
          </div>

          {/* Campo de Contraseña */}
          <div className="space-y-2">
            <Label htmlFor="password">Contraseña</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isPending}
              required
              autoComplete="current-password"
              className="h-11"
            />
          </div>

          {/* Mensaje de Error */}
          {error && (
            <div className="bg-destructive/10 border border-destructive/20 rounded-md p-3">
              <p className="text-sm text-destructive font-medium">{error}</p>
            </div>
          )}

          {/* Botón de Submit */}
          <Button
            type="submit"
            className="w-full h-11"
            disabled={isPending}
          >
            {isPending ? (
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                <span>Iniciando sesión...</span>
              </div>
            ) : (
              'Iniciar sesión'
            )}
          </Button>
        </form>

        {/* Link de recuperación de contraseña (futuro) */}
        <div className="mt-4 text-center">
          <button
            type="button"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            disabled
          >
            ¿Olvidaste tu contraseña?
          </button>
        </div>

        {/* Nota de seguridad */}
        <div className="mt-6 pt-4 border-t border-border/50">
          <p className="text-xs text-muted-foreground text-center">
            Solo usuarios con permisos de administrador pueden acceder a este panel
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
