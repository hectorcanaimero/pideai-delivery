/**
 * Layout para rutas de autenticación
 *
 * Este layout envuelve todas las páginas del grupo (auth), que incluye:
 * - /login
 * - /signup (futuro)
 * - /forgot-password (futuro)
 * - /reset-password (futuro)
 *
 * @module app/(auth)/layout
 *
 * Características:
 * - Layout minimalista centrado para formularios
 * - Sin header ni sidebar (solo contenido)
 * - Fondo con gradiente sutil
 *
 * Principios SOLID:
 * - Single Responsibility: Solo se encarga del layout de autenticación
 * - Open/Closed: Fácil de extender con nuevas páginas de auth
 */

import type { Metadata } from 'next'

/**
 * Metadata para las páginas de autenticación
 */
export const metadata: Metadata = {
  title: 'Autenticación - PideAI Admin',
  description: 'Inicia sesión en el panel de administración de PideAI',
}

/**
 * Props del AuthLayout
 */
interface AuthLayoutProps {
  children: React.ReactNode
}

/**
 * Layout de autenticación
 *
 * Proporciona un contenedor centrado y limpio para las páginas de login,
 * signup y recuperación de contraseña.
 *
 * @param {AuthLayoutProps} props - Props del componente
 * @returns {JSX.Element} Layout de autenticación
 *
 * @example
 * ```tsx
 * // Las páginas en (auth)/login/page.tsx usarán este layout automáticamente
 * ```
 */
export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-secondary/5 p-4">
      <div className="w-full max-w-md">
        {children}
      </div>
    </div>
  )
}
