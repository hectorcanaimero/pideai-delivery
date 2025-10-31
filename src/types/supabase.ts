/**
 * Tipos y utilidades para Supabase
 *
 * Este archivo contiene tipos reutilizables y utilidades para trabajar
 * con Supabase en toda la aplicación.
 *
 * @module types/supabase
 *
 * Principios SOLID:
 * - Single Responsibility: Solo define tipos relacionados con Supabase
 * - Open/Closed: Fácil de extender con nuevos tipos
 */

import { SupabaseClient } from '@supabase/supabase-js'

/**
 * Tipo genérico para el cliente de Supabase
 *
 * Este tipo puede ser usado cuando necesites tipar el cliente de Supabase
 * en funciones o componentes.
 *
 * @example
 * ```tsx
 * function fetchUsers(supabase: TypedSupabaseClient) {
 *   return supabase.from('users').select()
 * }
 * ```
 */
export type TypedSupabaseClient = SupabaseClient

/**
 * Tipo para los posibles estados de autenticación
 */
export type AuthStatus = 'authenticated' | 'unauthenticated' | 'loading'

/**
 * Tipo para los roles de usuario en la aplicación
 *
 * - admin: Acceso completo a todas las funcionalidades
 * - sub-admin: Acceso limitado (sin configuración global)
 * - soporte: Solo lectura y actualización de estado de pedidos
 */
export type UserRole = 'admin' | 'sub-admin' | 'soporte'

/**
 * Interfaz para el perfil de usuario
 *
 * Representa los datos del perfil de un usuario almacenados
 * en la tabla 'profiles' de Supabase.
 */
export interface UserProfile {
  id: string
  role: UserRole
  email: string
  full_name?: string
  avatar_url?: string
  created_at?: string
  updated_at?: string
}

/**
 * Tipo de respuesta genérico para operaciones de Supabase
 *
 * Útil para tipar respuestas de queries personalizadas.
 *
 * @template T - El tipo de datos que retorna la query
 */
export type SupabaseResponse<T> = {
  data: T | null
  error: Error | null
}

/**
 * Tipo para configuración de políticas de RLS (Row Level Security)
 *
 * Usado principalmente para documentación y referencia.
 */
export type RLSPolicy = {
  name: string
  table: string
  command: 'SELECT' | 'INSERT' | 'UPDATE' | 'DELETE' | 'ALL'
  roles: UserRole[]
  using?: string
  withCheck?: string
}
