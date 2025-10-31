/**
 * Página principal - PideAI Admin
 *
 * Redirige automáticamente a la página de login.
 * Los usuarios autenticados serán redirigidos a /dashboard por el middleware.
 *
 * @module app/page
 */

import { redirect } from 'next/navigation'

/**
 * Página de inicio que redirige a login
 */
export default function HomePage() {
  // Redirigir a la página de login
  redirect('/login')
}
