/**
 * Middleware de Supabase para Next.js
 *
 * Este archivo proporciona funciones de middleware para manejar la autenticación
 * y proteger rutas en la aplicación usando Supabase Auth.
 *
 * @module lib/supabase/middleware
 *
 * Uso en middleware.ts en la raíz del proyecto:
 * ```tsx
 * import { updateSession } from '@/lib/supabase/middleware'
 *
 * export async function middleware(request: NextRequest) {
 *   return await updateSession(request)
 * }
 *
 * export const config = {
 *   matcher: [
 *     '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
 *   ],
 * }
 * ```
 *
 * Características:
 * - Actualiza la sesión del usuario en cada request
 * - Protege rutas autenticadas automáticamente
 * - Redirige a login si el usuario no está autenticado
 * - Maneja cookies de forma segura
 * - Permite acceso público a rutas específicas
 *
 * Principios SOLID aplicados:
 * - Single Responsibility: Solo maneja la autenticación en el middleware
 * - Open/Closed: Fácil de extender con nuevas reglas de protección
 * - Liskov Substitution: Compatible con el sistema de middleware de Next.js
 *
 * Seguridad:
 * - Verifica la sesión en cada request protegido
 * - No expone información sensible en las redirecciones
 * - Respeta las políticas de autenticación de Supabase
 */

import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

/**
 * Lista de rutas públicas que no requieren autenticación
 *
 * Estas rutas son accesibles sin necesidad de estar logueado.
 * Puedes agregar más rutas públicas según las necesidades de tu aplicación.
 *
 * @constant
 */
const PUBLIC_ROUTES = ['/login', '/signup', '/forgot-password', '/reset-password']

/**
 * Actualiza la sesión del usuario y protege rutas autenticadas
 *
 * Esta función debe ser llamada desde el middleware principal de Next.js.
 * Se ejecuta en cada request antes de que llegue a las páginas.
 *
 * Flujo de trabajo:
 * 1. Crea un cliente de Supabase para el middleware
 * 2. Intenta obtener el usuario actual de la sesión
 * 3. Si el usuario no existe y la ruta no es pública, redirige a /login
 * 4. Si el usuario existe, permite el acceso
 * 5. Actualiza las cookies de sesión si es necesario
 *
 * @param {NextRequest} request - El request de Next.js
 * @returns {Promise<NextResponse>} La respuesta con cookies actualizadas o redirección
 *
 * @example
 * ```tsx
 * // En middleware.ts
 * import { updateSession } from '@/lib/supabase/middleware'
 *
 * export async function middleware(request: NextRequest) {
 *   return await updateSession(request)
 * }
 * ```
 */
export async function updateSession(request: NextRequest) {
  // Validar que las variables de entorno estén definidas
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    throw new Error('NEXT_PUBLIC_SUPABASE_URL no está definida en las variables de entorno')
  }

  if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    throw new Error('NEXT_PUBLIC_SUPABASE_ANON_KEY no está definida en las variables de entorno')
  }

  /**
   * Crear una respuesta inicial que permite continuar con el request
   * Esta respuesta se modificará más adelante si es necesario
   */
  let supabaseResponse = NextResponse.next({
    request,
  })

  /**
   * Crear el cliente de Supabase específico para el middleware
   *
   * El middleware tiene su propio manejo de cookies porque se ejecuta
   * en un contexto diferente a los Server Components
   */
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        /**
         * Obtiene todas las cookies del request
         */
        getAll() {
          return request.cookies.getAll()
        },

        /**
         * Establece cookies en el response
         *
         * Este método es más complejo en el middleware porque necesita:
         * 1. Establecer las cookies en el request (para uso inmediato)
         * 2. Establecer las cookies en el response (para enviar al cliente)
         */
        setAll(cookiesToSet) {
          // Establecer cookies en el request para uso inmediato en este request
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))

          // Crear un nuevo response que continúa con el request
          supabaseResponse = NextResponse.next({
            request,
          })

          // Establecer cookies en el response para enviar al cliente
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  /**
   * Intentar obtener el usuario actual
   *
   * Esta llamada también actualiza la sesión si es necesario
   * (ej: si el token de acceso ha expirado pero el refresh token es válido)
   */
  const {
    data: { user },
  } = await supabase.auth.getUser()

  /**
   * Verificar si la ruta actual es pública
   */
  const isPublicRoute = PUBLIC_ROUTES.some((route) =>
    request.nextUrl.pathname.startsWith(route)
  )

  /**
   * Protección de rutas: Redirigir a login si:
   * - No hay usuario autenticado
   * - La ruta no es pública
   * - La ruta no es la página de login
   */
  if (!user && !isPublicRoute && !request.nextUrl.pathname.startsWith('/login')) {
    // Crear la URL de redirección a login
    const url = request.nextUrl.clone()
    url.pathname = '/login'

    /**
     * Opcionalmente, puedes agregar un parámetro de redirección
     * para volver a la página original después del login:
     *
     * url.searchParams.set('redirectedFrom', request.nextUrl.pathname)
     *
     * Luego en la página de login, después de autenticar:
     * const redirectTo = searchParams.get('redirectedFrom') || '/dashboard'
     * router.push(redirectTo)
     */

    return NextResponse.redirect(url)
  }

  /**
   * Si el usuario está autenticado y trata de acceder a /login,
   * redirigir al dashboard
   */
  if (user && request.nextUrl.pathname.startsWith('/login')) {
    const url = request.nextUrl.clone()
    url.pathname = '/dashboard'
    return NextResponse.redirect(url)
  }

  /**
   * Retornar la respuesta con las cookies actualizadas
   *
   * Esta respuesta incluye:
   * - Las cookies de sesión actualizadas (si cambiaron)
   * - El request original que puede continuar su flujo
   */
  return supabaseResponse
}

/**
 * Verifica si un usuario tiene un rol específico
 *
 * Esta función de utilidad puede ser usada en middleware personalizado
 * o en Server Components para verificar permisos.
 *
 * @param {object} user - El objeto de usuario de Supabase
 * @param {string} requiredRole - El rol requerido ('admin', 'sub-admin', 'soporte')
 * @returns {boolean} true si el usuario tiene el rol requerido
 *
 * @example
 * ```tsx
 * const user = await supabase.auth.getUser()
 * if (hasRole(user.data.user, 'admin')) {
 *   // Usuario es admin
 * }
 * ```
 *
 * Nota: Esta es una verificación básica. Para una verificación más robusta,
 * deberías consultar la tabla 'profiles' en la base de datos.
 */
export function hasRole(user: any, requiredRole: string): boolean {
  if (!user) return false

  // El rol se almacena en user_metadata o en app_metadata
  // dependiendo de cómo lo configures en Supabase
  const userRole = user.user_metadata?.role || user.app_metadata?.role

  // Jerarquía de roles
  const roleHierarchy: Record<string, number> = {
    admin: 3,
    'sub-admin': 2,
    soporte: 1,
  }

  return roleHierarchy[userRole] >= roleHierarchy[requiredRole]
}
