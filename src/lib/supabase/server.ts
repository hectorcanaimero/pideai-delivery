/**
 * Cliente de Supabase para Server Components y Server Actions
 *
 * Este archivo proporciona una función para crear una instancia del cliente de Supabase
 * que se utiliza en Server Components, Route Handlers y Server Actions de Next.js.
 *
 * @module lib/supabase/server
 *
 * Uso en Server Components:
 * ```tsx
 * import { createClient } from '@/lib/supabase/server'
 *
 * export default async function Page() {
 *   const supabase = await createClient()
 *   const { data } = await supabase.from('users').select()
 *   return <div>{JSON.stringify(data)}</div>
 * }
 * ```
 *
 * Uso en Server Actions:
 * ```tsx
 * 'use server'
 * import { createClient } from '@/lib/supabase/server'
 *
 * export async function myAction() {
 *   const supabase = await createClient()
 *   // ... lógica del servidor
 * }
 * ```
 *
 * Características:
 * - Manejo seguro de cookies en el servidor
 * - Soporte para autenticación en SSR
 * - Acceso a datos con Row Level Security (RLS)
 * - Tipado completo con TypeScript
 *
 * Principios SOLID aplicados:
 * - Single Responsibility: Solo se encarga de crear el cliente para el servidor
 * - Open/Closed: Abierto para extensión, cerrado para modificación
 * - Dependency Inversion: Depende de abstracciones (cookies de Next.js)
 *
 * Seguridad:
 * - Las cookies se manejan de forma segura en el servidor
 * - No expone información sensible al cliente
 * - Respeta las políticas RLS de Supabase
 */

import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

/**
 * Crea y retorna una instancia del cliente de Supabase para el servidor
 *
 * Esta función debe ser llamada en:
 * - Server Components (async function)
 * - Route Handlers (GET, POST, etc.)
 * - Server Actions ('use server')
 *
 * La función es asíncrona porque necesita acceder a las cookies del servidor.
 *
 * @returns {Promise<SupabaseClient>} Promesa que resuelve a la instancia del cliente
 *
 * @throws {Error} Si las variables de entorno no están definidas
 *
 * @example
 * ```tsx
 * // En un Server Component
 * const supabase = await createClient()
 * const { data: orders } = await supabase
 *   .from('orders')
 *   .select('*')
 *   .eq('status', 'active')
 * ```
 *
 * @example
 * ```tsx
 * // En un Route Handler
 * export async function GET() {
 *   const supabase = await createClient()
 *   const { data } = await supabase.from('users').select()
 *   return Response.json(data)
 * }
 * ```
 */
export async function createClient() {
  // Validar que las variables de entorno estén definidas
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    throw new Error('NEXT_PUBLIC_SUPABASE_URL no está definida en las variables de entorno')
  }

  if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    throw new Error('NEXT_PUBLIC_SUPABASE_ANON_KEY no está definida en las variables de entorno')
  }

  // Obtener el store de cookies de Next.js
  // cookies() es una función asíncrona en Next.js 15+
  const cookieStore = await cookies()

  /**
   * Crear el cliente de Supabase con configuración de cookies
   *
   * El objeto de configuración de cookies permite que Supabase:
   * 1. Lea cookies existentes (para mantener la sesión)
   * 2. Escriba nuevas cookies (para actualizar la sesión)
   * 3. Maneje la autenticación de forma segura en el servidor
   */
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        /**
         * Obtiene todas las cookies disponibles
         *
         * @returns {Array} Array de objetos con name y value de cada cookie
         */
        getAll() {
          return cookieStore.getAll()
        },

        /**
         * Establece múltiples cookies a la vez
         *
         * Este método es llamado por Supabase cuando necesita actualizar
         * las cookies de autenticación (ej: después de login/logout)
         *
         * @param {Array} cookiesToSet - Array de cookies a establecer
         * @param {string} cookiesToSet[].name - Nombre de la cookie
         * @param {string} cookiesToSet[].value - Valor de la cookie
         * @param {Object} cookiesToSet[].options - Opciones de la cookie (httpOnly, secure, etc.)
         */
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch (error) {
            /**
             * Los errores al establecer cookies pueden ocurrir en ciertos contextos
             * de Next.js (ej: en middleware después de que la respuesta ya se envió).
             * Estos errores no son críticos para el funcionamiento de la aplicación.
             *
             * En producción, podrías querer loggear estos errores para debugging:
             * console.error('Error setting cookies:', error)
             */
          }
        },
      },
    }
  )
}
