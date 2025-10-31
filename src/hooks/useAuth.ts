/**
 * Hook de Autenticación - useAuth
 *
 * Hook personalizado para manejar la autenticación en toda la aplicación.
 * Proporciona acceso al usuario actual, su perfil, y funciones para
 * gestionar la sesión y permisos.
 *
 * @module hooks/useAuth
 *
 * Uso:
 * ```tsx
 * 'use client'
 * import { useAuth } from '@/hooks/useAuth'
 *
 * export default function MyComponent() {
 *   const { user, profile, loading, signOut, isAdmin } = useAuth()
 *
 *   if (loading) return <div>Cargando...</div>
 *   if (!user) return <div>No autenticado</div>
 *
 *   return <div>Hola {profile?.full_name}</div>
 * }
 * ```
 *
 * Características:
 * - Detecta cambios de sesión en tiempo real con Supabase Realtime
 * - Sistema de permisos jerárquico por rol
 * - Helpers booleanos para verificar roles
 * - Función signOut integrada
 * - Type safety completo con TypeScript
 *
 * Principios SOLID aplicados:
 * - Single Responsibility: Solo maneja autenticación y permisos
 * - Open/Closed: Fácil extender con nuevas funcionalidades
 * - Dependency Inversion: Depende de abstracciones (createClient)
 */

'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { User } from '@supabase/supabase-js'
import type { Profile, UserRole } from '@/types'

/**
 * Interfaz de retorno del hook useAuth
 *
 * Define todos los valores y funciones que el hook expone.
 */
interface UseAuthReturn {
  /** Usuario actual de Supabase Auth (null si no está autenticado) */
  user: User | null

  /** Perfil del usuario desde la tabla profiles (null si no está autenticado) */
  profile: Profile | null

  /** Indica si el hook está cargando datos (true durante la carga inicial) */
  loading: boolean

  /** Función para cerrar sesión */
  signOut: () => Promise<void>

  /**
   * Verifica si el usuario actual tiene permisos para un rol específico
   *
   * Sistema jerárquico:
   * - admin (nivel 3) puede todo
   * - sub-admin (nivel 2) puede acceder a sub-admin y soporte
   * - soporte (nivel 1) solo acceso de soporte
   *
   * @param requiredRole - Rol requerido
   * @returns true si el usuario tiene el permiso, false en caso contrario
   */
  hasPermission: (requiredRole: UserRole) => boolean

  /** Helper: true si el usuario es admin */
  isAdmin: boolean

  /** Helper: true si el usuario es sub-admin */
  isSubAdmin: boolean

  /** Helper: true si el usuario es soporte */
  isSoporte: boolean
}

/**
 * Hook useAuth
 *
 * Maneja la autenticación del usuario en la aplicación.
 * Se suscribe a cambios de sesión en tiempo real y obtiene el perfil
 * del usuario desde la tabla profiles.
 *
 * @returns {UseAuthReturn} Objeto con usuario, perfil, estado y funciones
 *
 * @example
 * ```tsx
 * function ProfileCard() {
 *   const { user, profile, loading, isAdmin } = useAuth()
 *
 *   if (loading) return <Skeleton />
 *   if (!user) return <LoginPrompt />
 *
 *   return (
 *     <div>
 *       <h2>{profile?.full_name}</h2>
 *       <p>Role: {profile?.role}</p>
 *       {isAdmin && <AdminPanel />}
 *     </div>
 *   )
 * }
 * ```
 *
 * @example
 * ```tsx
 * function ProtectedAction() {
 *   const { hasPermission, signOut } = useAuth()
 *
 *   if (!hasPermission('admin')) {
 *     return <p>No tienes permisos</p>
 *   }
 *
 *   return (
 *     <div>
 *       <button onClick={performAction}>Acción de Admin</button>
 *       <button onClick={signOut}>Cerrar Sesión</button>
 *     </div>
 *   )
 * }
 * ```
 */
export function useAuth(): UseAuthReturn {
  // Estado del usuario y perfil
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)

  // Hooks de Next.js
  const router = useRouter()

  // Cliente de Supabase
  const supabase = createClient()

  /**
   * Effect para obtener usuario y suscribirse a cambios de sesión
   *
   * Proceso:
   * 1. Obtiene el usuario actual al montar el componente
   * 2. Si hay usuario, obtiene su perfil desde la tabla profiles
   * 3. Se suscribe a cambios de autenticación (login, logout, token refresh)
   * 4. Actualiza el estado cuando hay cambios
   * 5. Limpia la suscripción al desmontar
   */
  useEffect(() => {
    /**
     * Obtiene el usuario actual y su perfil
     */
    const getUser = async () => {
      try {
        // Obtener usuario actual de Supabase Auth
        const {
          data: { user },
        } = await supabase.auth.getUser()

        setUser(user)

        // Si hay usuario, obtener su perfil
        if (user) {
          const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single()

          if (profileError) {
            console.error('Error al obtener perfil:', profileError)
            setProfile(null)
          } else {
            setProfile(profileData)
          }
        } else {
          setProfile(null)
        }
      } catch (error) {
        console.error('Error en getUser:', error)
        setUser(null)
        setProfile(null)
      } finally {
        setLoading(false)
      }
    }

    // Ejecutar al montar
    getUser()

    /**
     * Suscripción a cambios de autenticación
     *
     * Eventos que detecta:
     * - SIGNED_IN: Usuario inició sesión
     * - SIGNED_OUT: Usuario cerró sesión
     * - TOKEN_REFRESHED: Token de acceso renovado
     * - USER_UPDATED: Información del usuario actualizada
     */
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event)

      // Actualizar usuario
      setUser(session?.user ?? null)

      // Si hay sesión, obtener perfil
      if (session?.user) {
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single()

        if (profileError) {
          console.error('Error al obtener perfil:', profileError)
          setProfile(null)
        } else {
          setProfile(profileData)
        }
      } else {
        // No hay sesión, limpiar perfil
        setProfile(null)
      }

      // Ya no estamos cargando después del primer evento
      setLoading(false)
    })

    // Cleanup: desuscribirse al desmontar
    return () => {
      subscription.unsubscribe()
    }
  }, [supabase])

  /**
   * Función para cerrar sesión
   *
   * Proceso:
   * 1. Llama a supabase.auth.signOut()
   * 2. Redirige a la página de login
   * 3. El efecto de arriba detectará el cambio y actualizará el estado
   *
   * @example
   * ```tsx
   * <button onClick={signOut}>Cerrar Sesión</button>
   * ```
   */
  const signOut = async () => {
    try {
      await supabase.auth.signOut()
      router.push('/login')
    } catch (error) {
      console.error('Error al cerrar sesión:', error)
    }
  }

  /**
   * Verifica si el usuario tiene permisos para un rol específico
   *
   * Sistema jerárquico de roles:
   * - admin (nivel 3): Puede todo
   * - sub-admin (nivel 2): Puede sub-admin y soporte
   * - soporte (nivel 1): Solo soporte
   *
   * @param requiredRole - Rol mínimo requerido
   * @returns true si el usuario tiene el permiso
   *
   * @example
   * ```tsx
   * if (hasPermission('admin')) {
   *   // Solo admins pueden hacer esto
   * }
   *
   * if (hasPermission('sub-admin')) {
   *   // Admins y sub-admins pueden hacer esto
   * }
   * ```
   */
  const hasPermission = (requiredRole: UserRole): boolean => {
    if (!profile) return false

    // Jerarquía de roles
    const roleHierarchy: Record<UserRole, number> = {
      admin: 3,
      'sub-admin': 2,
      soporte: 1,
    }

    const userLevel = roleHierarchy[profile.role]
    const requiredLevel = roleHierarchy[requiredRole]

    return userLevel >= requiredLevel
  }

  /**
   * Helpers booleanos para verificar roles específicos
   *
   * Más convenientes que hasPermission() cuando solo necesitas
   * verificar un rol exacto.
   */
  const isAdmin = profile?.role === 'admin'
  const isSubAdmin = profile?.role === 'sub-admin'
  const isSoporte = profile?.role === 'soporte'

  return {
    user,
    profile,
    loading,
    signOut,
    hasPermission,
    isAdmin,
    isSubAdmin,
    isSoporte,
  }
}
