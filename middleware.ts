/**
 * Middleware principal de Next.js para PideAI Admin
 *
 * Este archivo configura el middleware que se ejecuta antes de cada request.
 * Actualmente se encarga de:
 * - Verificar la autenticación del usuario
 * - Actualizar la sesión de Supabase
 * - Proteger rutas que requieren autenticación
 * - Redirigir usuarios no autenticados a /login
 *
 * @see https://nextjs.org/docs/app/building-your-application/routing/middleware
 *
 * Principios SOLID aplicados:
 * - Single Responsibility: Delega la lógica de autenticación a updateSession
 * - Dependency Inversion: Depende de la abstracción updateSession
 */

import { type NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

/**
 * Función de middleware que se ejecuta en cada request
 *
 * @param {NextRequest} request - El request de Next.js
 * @returns {Promise<NextResponse>} La respuesta procesada
 */
export async function middleware(request: NextRequest) {
  return await updateSession(request)
}

/**
 * Configuración del matcher para el middleware
 *
 * Define en qué rutas se ejecutará el middleware.
 * Actualmente se ejecuta en todas las rutas excepto:
 * - Archivos estáticos de Next.js (_next/static)
 * - Imágenes de Next.js (_next/image)
 * - Favicon
 * - Archivos de imagen (svg, png, jpg, jpeg, gif, webp)
 *
 * Esto optimiza el rendimiento al no ejecutar el middleware en archivos estáticos.
 *
 * @see https://nextjs.org/docs/app/building-your-application/routing/middleware#matcher
 */
export const config = {
  matcher: [
    /*
     * Ejecutar en todas las rutas excepto:
     * - _next/static (archivos estáticos de Next.js)
     * - _next/image (optimización de imágenes de Next.js)
     * - favicon.ico (icono del sitio)
     * - Archivos de imagen (svg, png, jpg, jpeg, gif, webp)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
