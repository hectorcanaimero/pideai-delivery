# Hooks Personalizados - PideAI Admin

Este directorio contiene hooks personalizados reutilizables para la aplicación.

## 📁 Estructura

```
src/hooks/
├── useAuth.ts          # Hook de autenticación
└── README.md           # Esta documentación
```

## 🔐 useAuth

Hook para manejar la autenticación del usuario en toda la aplicación.

### Características

- ✅ Obtiene usuario actual y perfil automáticamente
- ✅ Detecta cambios de sesión en tiempo real
- ✅ Sistema de permisos jerárquico por rol
- ✅ Función signOut integrada
- ✅ Helpers booleanos para roles
- ✅ Type safety completo
- ✅ Manejo de errores robusto

### Uso Básico

```tsx
'use client'
import { useAuth } from '@/hooks/useAuth'

export default function MyComponent() {
  const { user, profile, loading } = useAuth()

  if (loading) {
    return <div>Cargando...</div>
  }

  if (!user) {
    return <div>No autenticado</div>
  }

  return (
    <div>
      <h1>Hola {profile?.full_name || user.email}</h1>
      <p>Rol: {profile?.role}</p>
    </div>
  )
}
```

### API del Hook

#### Valores Retornados

```typescript
interface UseAuthReturn {
  user: User | null              // Usuario de Supabase Auth
  profile: Profile | null        // Perfil desde tabla profiles
  loading: boolean               // Estado de carga inicial
  signOut: () => Promise<void>   // Función para cerrar sesión
  hasPermission: (role: UserRole) => boolean  // Verifica permisos
  isAdmin: boolean               // Helper: true si es admin
  isSubAdmin: boolean            // Helper: true si es sub-admin
  isSoporte: boolean             // Helper: true si es soporte
}
```

### Ejemplos de Uso

#### 1. Mostrar Información del Usuario

```tsx
'use client'
import { useAuth } from '@/hooks/useAuth'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'

export function UserProfile() {
  const { profile, loading } = useAuth()

  if (loading) return <div>Cargando perfil...</div>

  return (
    <div className="flex items-center space-x-3">
      <Avatar>
        <AvatarFallback>
          {profile?.full_name?.charAt(0) || 'U'}
        </AvatarFallback>
      </Avatar>
      <div>
        <p className="font-medium">{profile?.full_name}</p>
        <p className="text-sm text-muted-foreground">{profile?.email}</p>
      </div>
    </div>
  )
}
```

#### 2. Proteger Componentes por Rol

```tsx
'use client'
import { useAuth } from '@/hooks/useAuth'

export function AdminPanel() {
  const { isAdmin, loading } = useAuth()

  if (loading) return null

  if (!isAdmin) {
    return (
      <div className="text-destructive">
        No tienes permisos de administrador
      </div>
    )
  }

  return (
    <div>
      <h2>Panel de Administrador</h2>
      {/* Contenido solo para admins */}
    </div>
  )
}
```

#### 3. Verificar Permisos Jerárquicos

```tsx
'use client'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'

export function ActionButtons() {
  const { hasPermission } = useAuth()

  return (
    <div className="space-x-2">
      {/* Todos los roles pueden ver pedidos */}
      {hasPermission('soporte') && (
        <Button>Ver Pedidos</Button>
      )}

      {/* Solo sub-admin y admin pueden editar */}
      {hasPermission('sub-admin') && (
        <Button>Editar Pedido</Button>
      )}

      {/* Solo admin puede eliminar */}
      {hasPermission('admin') && (
        <Button variant="destructive">Eliminar Pedido</Button>
      )}
    </div>
  )
}
```

#### 4. Botón de Cerrar Sesión

```tsx
'use client'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'
import { LogOut } from 'lucide-react'

export function LogoutButton() {
  const { signOut } = useAuth()

  return (
    <Button variant="ghost" onClick={signOut}>
      <LogOut className="mr-2 h-4 w-4" />
      Cerrar Sesión
    </Button>
  )
}
```

#### 5. Redirección Condicional

```tsx
'use client'
import { useAuth } from '@/hooks/useAuth'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export function ProtectedPage() {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login')
    }
  }, [user, loading, router])

  if (loading) return <div>Verificando autenticación...</div>
  if (!user) return null // Redirigiendo...

  return (
    <div>
      {/* Contenido protegido */}
    </div>
  )
}
```

#### 6. Mostrar Diferentes UIs por Rol

```tsx
'use client'
import { useAuth } from '@/hooks/useAuth'

export function RoleBasedDashboard() {
  const { profile, loading } = useAuth()

  if (loading) return <div>Cargando...</div>

  // Dashboard según rol
  switch (profile?.role) {
    case 'admin':
      return <AdminDashboard />
    case 'sub-admin':
      return <SubAdminDashboard />
    case 'soporte':
      return <SoporteDashboard />
    default:
      return <div>Rol no reconocido</div>
  }
}
```

#### 7. Hook en Server Actions (indirecto)

```tsx
// En un Client Component
'use client'
import { useAuth } from '@/hooks/useAuth'
import { updateOrder } from '@/app/actions'

export function OrderForm({ orderId }: { orderId: string }) {
  const { hasPermission } = useAuth()

  const handleSubmit = async (formData: FormData) => {
    if (!hasPermission('sub-admin')) {
      alert('No tienes permisos')
      return
    }

    await updateOrder(orderId, formData)
  }

  return <form action={handleSubmit}>...</form>
}
```

## 🔒 Sistema de Permisos

### Jerarquía de Roles

```
admin (nivel 3)
  ↓
sub-admin (nivel 2)
  ↓
soporte (nivel 1)
```

### Funcionamiento de hasPermission()

```tsx
const { hasPermission } = useAuth()

// Si el usuario es 'admin' (nivel 3):
hasPermission('admin')     // ✅ true
hasPermission('sub-admin') // ✅ true (admin puede hacer todo)
hasPermission('soporte')   // ✅ true

// Si el usuario es 'sub-admin' (nivel 2):
hasPermission('admin')     // ❌ false
hasPermission('sub-admin') // ✅ true
hasPermission('soporte')   // ✅ true

// Si el usuario es 'soporte' (nivel 1):
hasPermission('admin')     // ❌ false
hasPermission('sub-admin') // ❌ false
hasPermission('soporte')   // ✅ true
```

### Tabla de Permisos por Rol

| Acción | Admin | Sub-Admin | Soporte |
|--------|-------|-----------|---------|
| Ver pedidos | ✅ | ✅ | ✅ |
| Editar pedidos | ✅ | ✅ | ✅ |
| Eliminar pedidos | ✅ | ✅ | ❌ |
| Gestionar riders | ✅ | ✅ | ❌ |
| Gestionar comercios | ✅ | ✅ | ❌ |
| Ver reportes | ✅ | ✅ | ✅ |
| Configuración global | ✅ | ❌ | ❌ |
| Gestión de usuarios | ✅ | ❌ | ❌ |

## 🎯 Realtime

El hook se suscribe automáticamente a cambios de autenticación:

### Eventos Detectados

1. **SIGNED_IN**: Usuario inició sesión
2. **SIGNED_OUT**: Usuario cerró sesión
3. **TOKEN_REFRESHED**: Token renovado (cada ~50 minutos)
4. **USER_UPDATED**: Info del usuario actualizada

### Ejemplo de Log

```
Auth state changed: SIGNED_IN
Auth state changed: TOKEN_REFRESHED
Auth state changed: SIGNED_OUT
```

## 🐛 Manejo de Errores

El hook maneja errores de forma silenciosa y logea a la consola:

```tsx
// Si hay error al obtener perfil:
console.error('Error al obtener perfil:', profileError)
// El hook establece profile = null y continúa

// Si hay error al cerrar sesión:
console.error('Error al cerrar sesión:', error)
// La función signOut() maneja el error internamente
```

### Verificar Errores en Producción

```tsx
const { user, profile, loading } = useAuth()

if (!loading && user && !profile) {
  // Usuario autenticado pero sin perfil
  // Probablemente un error de configuración
  console.error('Usuario sin perfil en la BD')
}
```

## 📝 Mejores Prácticas

### ✅ Hacer

```tsx
// 1. Usar el hook en Client Components
'use client'
import { useAuth } from '@/hooks/useAuth'

// 2. Verificar loading antes de usar datos
const { user, loading } = useAuth()
if (loading) return <Skeleton />

// 3. Usar helpers para verificar roles
const { isAdmin } = useAuth()
if (isAdmin) { /* ... */ }

// 4. Usar hasPermission() para lógica jerárquica
const { hasPermission } = useAuth()
if (hasPermission('sub-admin')) { /* sub-admins y admins */ }
```

### ❌ Evitar

```tsx
// 1. NO usar en Server Components
// Server Component
import { useAuth } from '@/hooks/useAuth' // ❌ Error
// Usar createClient de @/lib/supabase/server en su lugar

// 2. NO verificar user sin verificar loading
const { user } = useAuth()
if (user) { /* ... */ } // ❌ Podría ser null mientras carga

// 3. NO hacer lógica compleja de roles manualmente
if (profile?.role === 'admin' || profile?.role === 'sub-admin') { /* ... */ }
// ✅ Mejor: if (hasPermission('sub-admin')) { /* ... */ }
```

## 🔄 Ciclo de Vida

```
1. Componente monta
   ↓
2. Hook ejecuta getUser()
   ↓
3. loading = true
   ↓
4. Obtiene usuario de Supabase Auth
   ↓
5. Si hay usuario, obtiene perfil de tabla profiles
   ↓
6. loading = false
   ↓
7. Hook se suscribe a cambios de auth
   ↓
8. Cuando hay cambio → actualiza user y profile
   ↓
9. Componente desmonta → desuscribe
```

## 🧪 Testing

### Simular Usuario Autenticado

```tsx
// En un test o Storybook
const mockAuthValues = {
  user: { id: '123', email: 'test@test.com' },
  profile: { id: '123', role: 'admin', email: 'test@test.com' },
  loading: false,
  signOut: async () => {},
  hasPermission: () => true,
  isAdmin: true,
  isSubAdmin: false,
  isSoporte: false,
}
```

## 🔗 Referencias

- [Supabase Auth](https://supabase.com/docs/guides/auth)
- [Supabase Realtime](https://supabase.com/docs/guides/realtime)
- [React Hooks](https://react.dev/reference/react)

---

**Última actualización:** 2025-10-31
**Versión:** 1.0
