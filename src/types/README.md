# Tipos de TypeScript para PideAI Admin

Este directorio contiene todos los tipos de TypeScript para la aplicación, incluyendo los tipos generados desde la base de datos de Supabase.

## 📁 Estructura

```
src/types/
├── database.types.ts   # Tipos generados desde Supabase
├── index.ts            # Tipos de utilidad y re-exportaciones
└── README.md           # Esta documentación
```

## 🔄 Generación de Tipos

Los tipos de la base de datos se generan automáticamente desde el esquema de Supabase usando el CLI de Supabase.

### Generar tipos por primera vez

Necesitarás el `PROJECT_ID` de tu proyecto de Supabase. Puedes encontrarlo en:
- Dashboard de Supabase → Settings → General → Reference ID

```bash
# Usando variable de entorno
SUPABASE_PROJECT_ID=tu-project-id pnpm types:generate

# O directamente
npx supabase gen types typescript --project-id tu-project-id > src/types/database.types.ts
```

### Regenerar tipos después de cambios en la BD

Cada vez que modifiques el esquema de la base de datos (agregar tablas, columnas, etc.), debes regenerar los tipos:

```bash
SUPABASE_PROJECT_ID=tu-project-id pnpm types:generate
```

### Ver ayuda del comando

```bash
pnpm types:generate:help
```

## 📚 Uso de los Tipos

### Importar tipos de tablas

Los tipos más comunes ya están exportados desde `@/types`:

```tsx
import type { Order, Rider, Store, Product } from '@/types'

// Usar en componentes
const order: Order = {
  id: '123',
  order_number: 'ORD-001',
  status: 'pending',
  // ... otros campos
}
```

### Tipos de Insert y Update

Cuando necesites crear o actualizar registros:

```tsx
import type { OrderInsert, OrderUpdate } from '@/types'

// Para crear un nuevo pedido
const newOrder: OrderInsert = {
  order_number: 'ORD-002',
  customer_name: 'Juan Pérez',
  // ... campos requeridos
}

// Para actualizar un pedido
const updateData: OrderUpdate = {
  status: 'delivered',
  delivered_at: new Date().toISOString()
}
```

### Usar con Supabase Client

Los tipos se integran automáticamente con el cliente de Supabase:

```tsx
import { createClient } from '@/lib/supabase/client'
import type { Order } from '@/types'

const supabase = createClient()

// TypeScript inferirá el tipo correctamente
const { data, error } = await supabase
  .from('orders')
  .select('*')
  .eq('status', 'pending')

// data tendrá tipo Order[] | null
if (data) {
  data.forEach((order: Order) => {
    console.log(order.order_number)
  })
}
```

### Tipos Compuestos

Para queries con joins o relaciones:

```tsx
import type { OrderWithDetails, OrderWithItems } from '@/types'

// Pedido con items
const { data: orderWithItems } = await supabase
  .from('orders')
  .select(`
    *,
    items:order_items(*)
  `)
  .eq('id', orderId)
  .single()

// Pedido completo con rider, store, items e historial
const { data: orderDetails } = await supabase
  .from('orders')
  .select(`
    *,
    rider:riders(*),
    store:stores(*),
    items:order_items(*),
    status_history:order_status_history(*)
  `)
  .eq('id', orderId)
  .single()
```

### Enums

Los enums están disponibles para validación:

```tsx
import type { OrderStatus, RiderStatus, UserRole } from '@/types'

// Usar en validaciones
const status: OrderStatus = 'pending' // ✅ Válido
const status: OrderStatus = 'invalid' // ❌ Error de TypeScript

// Usar en componentes
interface Props {
  status: OrderStatus
}

// Usar en validaciones con Zod
import { z } from 'zod'

const orderSchema = z.object({
  status: z.enum(['pending', 'assigned', 'in_transit', 'delivered', 'cancelled'])
})
```

### Tipos de Filtros

Para filtros de listas:

```tsx
import type { OrderFilters, RiderFilters, PaginationOptions } from '@/types'

const filters: OrderFilters = {
  status: ['pending', 'assigned'],
  store_id: 'store-123',
  date_from: '2025-01-01',
  is_urgent: true
}

const pagination: PaginationOptions = {
  page: 1,
  per_page: 20
}
```

### Tipos de Métricas

Para el dashboard:

```tsx
import type { DashboardMetrics, OrderChartData, RiderStats } from '@/types'

const metrics: DashboardMetrics = {
  activeOrders: 15,
  availableRiders: 8,
  todayRevenue: 1250.50,
  completedToday: 42
}

const chartData: OrderChartData[] = [
  { hour: '09:00', count: 5, revenue: 125 },
  { hour: '10:00', count: 8, revenue: 200 },
  // ...
]
```

### Tipos de Ubicación

Para coordenadas geográficas:

```tsx
import type { Coordinates, OpeningHours } from '@/types'

const location: Coordinates = {
  lat: -34.603722,
  lng: -58.381592
}

const hours: OpeningHours = {
  monday: { open: '09:00', close: '18:00' },
  tuesday: { open: '09:00', close: '18:00' },
  sunday: { closed: true }
}
```

## 🎯 Tipos Disponibles

### Tablas Principales

- `Profile` / `ProfileInsert` / `ProfileUpdate`
- `Order` / `OrderInsert` / `OrderUpdate`
- `Rider` / `RiderInsert` / `RiderUpdate`
- `Store` / `StoreInsert` / `StoreUpdate`
- `Product` / `ProductInsert` / `ProductUpdate`
- `OrderItem` / `OrderItemInsert` / `OrderItemUpdate`
- `OrderStatusHistory` / `OrderStatusHistoryInsert` / `OrderStatusHistoryUpdate`
- `AppConfig` / `AppConfigInsert` / `AppConfigUpdate`

### Enums

- `OrderStatus`: 'pending' | 'assigned' | 'in_transit' | 'delivered' | 'cancelled'
- `RiderStatus`: 'available' | 'busy' | 'offline'
- `UserRole`: 'admin' | 'sub-admin' | 'soporte'
- `VehicleType`: 'bike' | 'motorcycle' | 'car'

### Tipos Compuestos

- `OrderWithItems`: Pedido con sus ítems
- `OrderWithDetails`: Pedido con rider, store, items e historial
- `RiderWithStats`: Rider con estadísticas
- `StoreWithStats`: Store con estadísticas

### Filtros

- `OrderFilters`: Filtros para lista de pedidos
- `RiderFilters`: Filtros para lista de riders
- `StoreFilters`: Filtros para lista de stores
- `PaginationOptions`: Opciones de paginación
- `PaginatedResult<T>`: Resultado paginado genérico

### Métricas

- `DashboardMetrics`: Métricas del dashboard principal
- `OrderChartData`: Datos para gráficos de pedidos
- `RiderStats`: Estadísticas de rider
- `StoreStats`: Estadísticas de store

### Utilidades

- `Coordinates`: Coordenadas geográficas
- `OpeningHours`: Horarios de apertura
- `ApiResponse<T>`: Respuesta estándar de API
- `ApiError`: Error de API

## 🔒 Type Safety

Los tipos garantizan:

1. **Validación en tiempo de compilación**: Errores de tipo se detectan antes de ejecutar
2. **Autocompletado**: Tu IDE sugerirá campos y métodos disponibles
3. **Refactoring seguro**: Cambios en tipos se propagan automáticamente
4. **Documentación inline**: JSDoc proporciona información sobre cada tipo

## 📝 Mejores Prácticas

### ✅ Hacer

```tsx
// Importar tipos específicos que necesitas
import type { Order, OrderStatus } from '@/types'

// Usar tipos para props de componentes
interface OrderCardProps {
  order: Order
}

// Usar tipos para respuestas de API
async function fetchOrders(): Promise<Order[]> {
  // ...
}
```

### ❌ Evitar

```tsx
// No usar 'any'
const order: any = await fetchOrder()

// No duplicar definiciones de tipos
type MyOrder = {
  id: string
  status: string
  // ... (usar el tipo Order existente)
}

// No ignorrar errores de tipo
// @ts-ignore
order.nonexistent = 'value'
```

## 🐛 Troubleshooting

### Los tipos no se actualizan

```bash
# 1. Regenerar tipos
SUPABASE_PROJECT_ID=tu-project-id pnpm types:generate

# 2. Reiniciar TypeScript server en VS Code
# Cmd/Ctrl + Shift + P → "TypeScript: Restart TS Server"
```

### Error: "Cannot find module '@/types'"

Verifica que `tsconfig.json` tenga el alias configurado:

```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

### Tipos no coinciden con la BD

Asegúrate de haber regenerado los tipos después de modificar el esquema de Supabase.

## 📚 Referencias

- [Supabase TypeScript Support](https://supabase.com/docs/guides/api/generating-types)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html)
- [TypeScript con Next.js](https://nextjs.org/docs/basic-features/typescript)

---

**Última actualización:** 2025-10-31
**Versión:** 1.0
