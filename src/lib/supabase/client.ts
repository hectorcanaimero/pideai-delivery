/**
 * Cliente de Supabase para componentes del lado del cliente (Client Components)
 *
 * Este archivo proporciona una función para crear una instancia del cliente de Supabase
 * que se utiliza en componentes de React que se ejecutan en el navegador.
 *
 * @module lib/supabase/client
 *
 * Uso:
 * ```tsx
 * 'use client'
 * import { createClient } from '@/lib/supabase/client'
 *
 * export default function MyComponent() {
 *   const supabase = createClient()
 *   // ... usar supabase
 * }
 * ```
 *
 * Características:
 * - Manejo automático de cookies para autenticación
 * - Soporte para Supabase Realtime
 * - Tipado completo con TypeScript
 *
 * Principios SOLID aplicados:
 * - Single Responsibility: Solo se encarga de crear el cliente para el navegador
 * - Dependency Inversion: Depende de abstracciones (@supabase/ssr)
 */

import { createBrowserClient } from '@supabase/ssr'

/**
 * Crea y retorna una instancia del cliente de Supabase para el navegador
 *
 * Esta función debe ser llamada dentro de componentes que usen 'use client'
 * o en archivos que se ejecuten en el navegador.
 *
 * @returns {SupabaseClient} Instancia del cliente de Supabase
 *
 * @throws {Error} Si las variables de entorno no están definidas
 *
 * @example
 * ```tsx
 * const supabase = createClient()
 * const { data, error } = await supabase.from('users').select()
 * ```
 */
export function createClient() {
  // Validar que las variables de entorno estén definidas
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    throw new Error('NEXT_PUBLIC_SUPABASE_URL no está definida en las variables de entorno')
  }

  if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    throw new Error('NEXT_PUBLIC_SUPABASE_ANON_KEY no está definida en las variables de entorno')
  }

  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  )
}
