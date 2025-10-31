# Configuración de Supabase

Este directorio contiene la configuración de Supabase para el proyecto PideAI Admin.

## 📁 Estructura

```
src/lib/supabase/
├── client.ts       # Cliente para componentes del navegador
├── server.ts       # Cliente para Server Components
├── middleware.ts   # Middleware para protección de rutas
└── README.md       # Esta documentación
```

## 🔧 Archivos

### `client.ts` - Cliente del Navegador

Úsalo en componentes que requieran `'use client'` (Client Components).

**Ejemplo:**
```tsx
'use client'

import { createClient } from '@/lib/supabase/client'
import { useEffect, useState } from 'react'

export default function MyComponent() {
  const [data, setData] = useState([])
  const supabase = createClient()

  useEffect(() => {
    async function fetchData() {
      const { data } = await supabase
        .from('orders')
        .select('*')
        .eq('status', 'active')

      setData(data || [])
    }

    fetchData()

    // Suscripción en tiempo real
    const channel = supabase
      .channel('orders-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'orders' },
        (payload) => {
          console.log('Change received!', payload)
          fetchData()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  return <div>{/* Render data */}</div>
}
```

### `server.ts` - Cliente del Servidor

Úsalo en Server Components, Route Handlers y Server Actions.

**Ejemplo en Server Component:**
```tsx
import { createClient } from '@/lib/supabase/server'

export default async function Page() {
  const supabase = await createClient()

  const { data: orders } = await supabase
    .from('orders')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(10)

  return (
    <div>
      {orders?.map((order) => (
        <div key={order.id}>{order.id}</div>
      ))}
    </div>
  )
}
```

**Ejemplo en Server Action:**
```tsx
'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function updateOrderStatus(orderId: string, status: string) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('orders')
    .update({ status })
    .eq('id', orderId)

  if (error) {
    throw new Error(error.message)
  }

  revalidatePath('/orders')
}
```

**Ejemplo en Route Handler:**
```tsx
// app/api/orders/route.ts
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('orders')
    .select('*')

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}
```

### `middleware.ts` - Protección de Rutas

Este archivo ya está configurado y se usa automáticamente a través de `middleware.ts` en la raíz del proyecto.

**Configuración:**
- Protege todas las rutas excepto `/login`, `/signup`, etc.
- Redirige usuarios no autenticados a `/login`
- Actualiza la sesión automáticamente en cada request
- Maneja cookies de forma segura

**Rutas públicas configuradas:**
- `/login`
- `/signup`
- `/forgot-password`
- `/reset-password`

Para agregar más rutas públicas, edita el array `PUBLIC_ROUTES` en `middleware.ts`.

## 🔐 Autenticación

### Verificar Usuario en Server Component

```tsx
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function ProtectedPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Usuario está autenticado
  return <div>Bienvenido {user.email}</div>
}
```

### Obtener Perfil del Usuario

```tsx
import { createClient } from '@/lib/supabase/server'

export default async function ProfilePage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return null

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  return (
    <div>
      <p>Nombre: {profile?.full_name}</p>
      <p>Rol: {profile?.role}</p>
    </div>
  )
}
```

## 🎯 Realtime (Tiempo Real)

### Suscribirse a Cambios en una Tabla

```tsx
'use client'

import { createClient } from '@/lib/supabase/client'
import { useEffect } from 'react'

export default function RealtimeOrders() {
  const supabase = createClient()

  useEffect(() => {
    const channel = supabase
      .channel('realtime-orders')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'orders'
        },
        (payload) => {
          console.log('Nuevo pedido!', payload.new)
          // Actualizar estado, mostrar notificación, etc.
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [supabase])

  return <div>Escuchando nuevos pedidos...</div>
}
```

## 🔒 Seguridad

### Variables de Entorno Requeridas

Asegúrate de tener estas variables en tu `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-anon-key-aqui
```

### Row Level Security (RLS)

Todas las consultas respetan las políticas RLS configuradas en Supabase.

**Ejemplo de política:**
```sql
-- Solo admins pueden ver todos los pedidos
CREATE POLICY "Admins can view all orders"
  ON orders FOR SELECT
  TO authenticated
  USING (
    auth.jwt() ->> 'role' IN ('admin', 'sub-admin', 'soporte')
  );
```

## 📚 Recursos

- [Documentación de Supabase](https://supabase.com/docs)
- [Supabase Auth](https://supabase.com/docs/guides/auth)
- [Supabase Realtime](https://supabase.com/docs/guides/realtime)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)

## 🐛 Troubleshooting

### Error: Variables de entorno no definidas

Asegúrate de que `.env.local` existe y contiene las variables correctas.

### Error al actualizar cookies

Este error puede ocurrir en el middleware después de que la respuesta ya fue enviada. No es crítico y está manejado con try-catch.

### Usuario no se autentica

Verifica que:
1. Las credenciales son correctas
2. RLS permite la operación
3. El usuario tiene el rol correcto en la tabla `profiles`

---

**Última actualización:** 2025-10-31
**Versión:** 1.0
