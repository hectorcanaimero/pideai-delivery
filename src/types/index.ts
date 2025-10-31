/**
 * Tipos centralizados de la aplicación PideAI Admin
 *
 * Este archivo re-exporta y extiende los tipos de la base de datos
 * con tipos de utilidad adicionales para facilitar el desarrollo.
 *
 * @module types
 *
 * Uso:
 * ```tsx
 * import type { Order, Rider, Store, OrderWithItems } from '@/types'
 * ```
 *
 * Principios SOLID:
 * - Single Responsibility: Cada tipo tiene una responsabilidad específica
 * - Open/Closed: Fácil de extender sin modificar código existente
 */

import { Database } from './database.types'

// ============================================================================
// Tipos de Tablas (Row types)
// ============================================================================

/**
 * Tipos de lectura de las tablas principales
 * Estos son los tipos que obtienes al hacer SELECT
 */
export type Profile = Database['public']['Tables']['profiles']['Row']
export type Order = Database['public']['Tables']['orders']['Row']
export type Rider = Database['public']['Tables']['riders']['Row']
export type Store = Database['public']['Tables']['stores']['Row']
export type Product = Database['public']['Tables']['products']['Row']
export type OrderItem = Database['public']['Tables']['order_items']['Row']
export type OrderStatusHistory = Database['public']['Tables']['order_status_history']['Row']
export type AppConfig = Database['public']['Tables']['app_config']['Row']

// ============================================================================
// Tipos de Inserción (Insert types)
// ============================================================================

/**
 * Tipos para crear nuevos registros
 * Estos son los tipos que usas al hacer INSERT
 */
export type ProfileInsert = Database['public']['Tables']['profiles']['Insert']
export type OrderInsert = Database['public']['Tables']['orders']['Insert']
export type RiderInsert = Database['public']['Tables']['riders']['Insert']
export type StoreInsert = Database['public']['Tables']['stores']['Insert']
export type ProductInsert = Database['public']['Tables']['products']['Insert']
export type OrderItemInsert = Database['public']['Tables']['order_items']['Insert']
export type OrderStatusHistoryInsert = Database['public']['Tables']['order_status_history']['Insert']
export type AppConfigInsert = Database['public']['Tables']['app_config']['Insert']

// ============================================================================
// Tipos de Actualización (Update types)
// ============================================================================

/**
 * Tipos para actualizar registros existentes
 * Estos son los tipos que usas al hacer UPDATE
 */
export type ProfileUpdate = Database['public']['Tables']['profiles']['Update']
export type OrderUpdate = Database['public']['Tables']['orders']['Update']
export type RiderUpdate = Database['public']['Tables']['riders']['Update']
export type StoreUpdate = Database['public']['Tables']['stores']['Update']
export type ProductUpdate = Database['public']['Tables']['products']['Update']
export type OrderItemUpdate = Database['public']['Tables']['order_items']['Update']
export type OrderStatusHistoryUpdate = Database['public']['Tables']['order_status_history']['Update']
export type AppConfigUpdate = Database['public']['Tables']['app_config']['Update']

// ============================================================================
// Enums
// ============================================================================

/**
 * Enumeraciones de la base de datos
 */
export type OrderStatus = Database['public']['Enums']['order_status']
export type RiderStatus = Database['public']['Enums']['rider_status']
export type UserRole = Database['public']['Enums']['user_role']
export type VehicleType = Database['public']['Enums']['vehicle_type']

// ============================================================================
// Tipos Compuestos (Relaciones y Joins)
// ============================================================================

/**
 * Pedido con sus ítems incluidos
 * Útil cuando necesitas mostrar el pedido completo con productos
 */
export interface OrderWithItems extends Order {
  items: OrderItem[]
}

/**
 * Pedido con información completa (rider, store, items)
 * Útil para la página de detalles del pedido
 */
export interface OrderWithDetails extends Order {
  rider: Rider | null
  store: Store
  items: OrderItem[]
  status_history: OrderStatusHistory[]
}

/**
 * Rider con estadísticas
 * Útil para mostrar información completa del rider
 */
export interface RiderWithStats extends Rider {
  active_orders: number
  completed_today: number
  earnings_today: number
}

/**
 * Store con estadísticas
 * Útil para mostrar información completa del comercio
 */
export interface StoreWithStats extends Store {
  total_products: number
  active_orders: number
  revenue_today: number
}

// ============================================================================
// Tipos de Ubicación (Location)
// ============================================================================

/**
 * Tipo para coordenadas geográficas
 * Usado en location fields de varias tablas
 */
export interface Coordinates {
  lat: number
  lng: number
}

/**
 * Tipo para horarios de apertura
 * Usado en opening_hours de stores
 */
export interface OpeningHours {
  monday?: DayHours
  tuesday?: DayHours
  wednesday?: DayHours
  thursday?: DayHours
  friday?: DayHours
  saturday?: DayHours
  sunday?: DayHours
}

export interface DayHours {
  open: string // "09:00"
  close: string // "18:00"
  closed?: boolean
}

// ============================================================================
// Tipos de Filtros y Queries
// ============================================================================

/**
 * Filtros para la lista de pedidos
 */
export interface OrderFilters {
  status?: OrderStatus | OrderStatus[]
  store_id?: string
  delivery_id?: string
  is_urgent?: boolean
  date_from?: string
  date_to?: string
  search?: string // Busca por order_number o customer_name
}

/**
 * Filtros para la lista de riders
 */
export interface RiderFilters {
  status?: RiderStatus | RiderStatus[]
  is_active?: boolean
  vehicle_type?: VehicleType
  search?: string // Busca por full_name o phone
}

/**
 * Filtros para la lista de comercios
 */
export interface StoreFilters {
  is_active?: boolean
  category?: string
  search?: string // Busca por name
}

/**
 * Opciones de paginación
 */
export interface PaginationOptions {
  page: number
  per_page: number
}

/**
 * Resultado paginado genérico
 */
export interface PaginatedResult<T> {
  data: T[]
  total: number
  page: number
  per_page: number
  total_pages: number
}

// ============================================================================
// Tipos de Respuestas API
// ============================================================================

/**
 * Respuesta estándar de la API
 */
export interface ApiResponse<T = any> {
  data?: T
  error?: string
  message?: string
}

/**
 * Respuesta de error de la API
 */
export interface ApiError {
  error: string
  message: string
  statusCode: number
}

// ============================================================================
// Tipos de Métricas del Dashboard
// ============================================================================

/**
 * Métricas principales del dashboard
 */
export interface DashboardMetrics {
  activeOrders: number
  availableRiders: number
  todayRevenue: number
  completedToday: number
}

/**
 * Datos para gráficos de pedidos
 */
export interface OrderChartData {
  hour: string // "09:00"
  count: number
  revenue: number
}

/**
 * Estadísticas de rider para reportes
 */
export interface RiderStats {
  rider_id: string
  rider_name: string
  total_deliveries: number
  completed_deliveries: number
  average_delivery_time: number // en minutos
  total_earnings: number
  rating: number
}

/**
 * Estadísticas de store para reportes
 */
export interface StoreStats {
  store_id: string
  store_name: string
  total_orders: number
  total_revenue: number
  average_order_value: number
  rating: number
}

// ============================================================================
// Re-exportar Database type
// ============================================================================

export type { Database } from './database.types'
export type { Json } from './database.types'
