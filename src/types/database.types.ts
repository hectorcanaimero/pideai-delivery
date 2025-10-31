/**
 * Tipos de Base de Datos de Supabase para PideAI Admin
 *
 * Este archivo contiene los tipos TypeScript generados desde el esquema de Supabase.
 * Proporciona type safety completo para todas las operaciones de base de datos.
 *
 * @module types/database.types
 *
 * IMPORTANTE: Este archivo debe regenerarse cuando el esquema de la base de datos cambie.
 *
 * Para regenerar los tipos:
 * ```bash
 * npx supabase gen types typescript --project-id YOUR_PROJECT_ID > src/types/database.types.ts
 * ```
 *
 * O usando el PROJECT_REF de tu proyecto:
 * ```bash
 * npx supabase gen types typescript --project-id [PROJECT_REF] --schema public > src/types/database.types.ts
 * ```
 *
 * Uso:
 * ```tsx
 * import { Database } from '@/types/database.types'
 *
 * type Order = Database['public']['Tables']['orders']['Row']
 * type OrderInsert = Database['public']['Tables']['orders']['Insert']
 * type OrderUpdate = Database['public']['Tables']['orders']['Update']
 * ```
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

/**
 * Esquema completo de la base de datos
 */
export interface Database {
  public: {
    Tables: {
      /**
       * Tabla de perfiles de usuario
       * Almacena información adicional de los usuarios admin
       */
      profiles: {
        Row: {
          id: string
          role: 'admin' | 'sub-admin' | 'soporte'
          email: string
          full_name: string | null
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          role?: 'admin' | 'sub-admin' | 'soporte'
          email: string
          full_name?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          role?: 'admin' | 'sub-admin' | 'soporte'
          email?: string
          full_name?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }

      /**
       * Tabla de pedidos
       * Almacena todos los pedidos de la plataforma
       */
      orders: {
        Row: {
          id: string
          order_number: string
          status: 'pending' | 'assigned' | 'in_transit' | 'delivered' | 'cancelled'
          customer_name: string
          customer_phone: string
          customer_address: string
          customer_location: Json | null // { lat: number, lng: number }
          store_id: string
          store_name: string
          delivery_id: string | null
          total_amount: number
          delivery_fee: number
          is_urgent: boolean
          notes: string | null
          created_at: string
          updated_at: string
          assigned_at: string | null
          picked_up_at: string | null
          delivered_at: string | null
          cancelled_at: string | null
        }
        Insert: {
          id?: string
          order_number: string
          status?: 'pending' | 'assigned' | 'in_transit' | 'delivered' | 'cancelled'
          customer_name: string
          customer_phone: string
          customer_address: string
          customer_location?: Json | null
          store_id: string
          store_name: string
          delivery_id?: string | null
          total_amount: number
          delivery_fee?: number
          is_urgent?: boolean
          notes?: string | null
          created_at?: string
          updated_at?: string
          assigned_at?: string | null
          picked_up_at?: string | null
          delivered_at?: string | null
          cancelled_at?: string | null
        }
        Update: {
          id?: string
          order_number?: string
          status?: 'pending' | 'assigned' | 'in_transit' | 'delivered' | 'cancelled'
          customer_name?: string
          customer_phone?: string
          customer_address?: string
          customer_location?: Json | null
          store_id?: string
          store_name?: string
          delivery_id?: string | null
          total_amount?: number
          delivery_fee?: number
          is_urgent?: boolean
          notes?: string | null
          created_at?: string
          updated_at?: string
          assigned_at?: string | null
          picked_up_at?: string | null
          delivered_at?: string | null
          cancelled_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'orders_delivery_id_fkey'
            columns: ['delivery_id']
            isOneToOne: false
            referencedRelation: 'riders'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'orders_store_id_fkey'
            columns: ['store_id']
            isOneToOne: false
            referencedRelation: 'stores'
            referencedColumns: ['id']
          }
        ]
      }

      /**
       * Tabla de riders (repartidores)
       * Almacena información de los riders
       */
      riders: {
        Row: {
          id: string
          full_name: string
          phone: string
          email: string | null
          status: 'available' | 'busy' | 'offline'
          is_active: boolean
          current_location: Json | null // { lat: number, lng: number }
          last_location_update: string | null
          vehicle_type: 'bike' | 'motorcycle' | 'car'
          vehicle_plate: string | null
          avatar_url: string | null
          rating: number | null
          total_deliveries: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          full_name: string
          phone: string
          email?: string | null
          status?: 'available' | 'busy' | 'offline'
          is_active?: boolean
          current_location?: Json | null
          last_location_update?: string | null
          vehicle_type?: 'bike' | 'motorcycle' | 'car'
          vehicle_plate?: string | null
          avatar_url?: string | null
          rating?: number | null
          total_deliveries?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          full_name?: string
          phone?: string
          email?: string | null
          status?: 'available' | 'busy' | 'offline'
          is_active?: boolean
          current_location?: Json | null
          last_location_update?: string | null
          vehicle_type?: 'bike' | 'motorcycle' | 'car'
          vehicle_plate?: string | null
          avatar_url?: string | null
          rating?: number | null
          total_deliveries?: number
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }

      /**
       * Tabla de comercios
       * Almacena información de los comercios/tiendas
       */
      stores: {
        Row: {
          id: string
          name: string
          slug: string
          category: string
          description: string | null
          phone: string
          email: string | null
          address: string
          location: Json | null // { lat: number, lng: number }
          logo_url: string | null
          cover_url: string | null
          is_active: boolean
          delivery_fee: number
          min_order_amount: number | null
          opening_hours: Json | null // { monday: { open: "09:00", close: "18:00" }, ... }
          rating: number | null
          total_orders: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
          category: string
          description?: string | null
          phone: string
          email?: string | null
          address: string
          location?: Json | null
          logo_url?: string | null
          cover_url?: string | null
          is_active?: boolean
          delivery_fee?: number
          min_order_amount?: number | null
          opening_hours?: Json | null
          rating?: number | null
          total_orders?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          category?: string
          description?: string | null
          phone?: string
          email?: string | null
          address?: string
          location?: Json | null
          logo_url?: string | null
          cover_url?: string | null
          is_active?: boolean
          delivery_fee?: number
          min_order_amount?: number | null
          opening_hours?: Json | null
          rating?: number | null
          total_orders?: number
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }

      /**
       * Tabla de productos
       * Almacena los productos de cada comercio
       */
      products: {
        Row: {
          id: string
          store_id: string
          name: string
          description: string | null
          price: number
          image_url: string | null
          category: string
          is_available: boolean
          stock: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          store_id: string
          name: string
          description?: string | null
          price: number
          image_url?: string | null
          category: string
          is_available?: boolean
          stock?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          store_id?: string
          name?: string
          description?: string | null
          price?: number
          image_url?: string | null
          category?: string
          is_available?: boolean
          stock?: number | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'products_store_id_fkey'
            columns: ['store_id']
            isOneToOne: false
            referencedRelation: 'stores'
            referencedColumns: ['id']
          }
        ]
      }

      /**
       * Tabla de ítems de pedido
       * Almacena los productos individuales de cada pedido
       */
      order_items: {
        Row: {
          id: string
          order_id: string
          product_id: string
          product_name: string
          quantity: number
          unit_price: number
          total_price: number
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          order_id: string
          product_id: string
          product_name: string
          quantity: number
          unit_price: number
          total_price: number
          notes?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          order_id?: string
          product_id?: string
          product_name?: string
          quantity?: number
          unit_price?: number
          total_price?: number
          notes?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'order_items_order_id_fkey'
            columns: ['order_id']
            isOneToOne: false
            referencedRelation: 'orders'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'order_items_product_id_fkey'
            columns: ['product_id']
            isOneToOne: false
            referencedRelation: 'products'
            referencedColumns: ['id']
          }
        ]
      }

      /**
       * Tabla de historial de estados de pedidos
       * Almacena cada cambio de estado de un pedido
       */
      order_status_history: {
        Row: {
          id: string
          order_id: string
          status: 'pending' | 'assigned' | 'in_transit' | 'delivered' | 'cancelled'
          notes: string | null
          changed_by: string | null
          created_at: string
        }
        Insert: {
          id?: string
          order_id: string
          status: 'pending' | 'assigned' | 'in_transit' | 'delivered' | 'cancelled'
          notes?: string | null
          changed_by?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          order_id?: string
          status?: 'pending' | 'assigned' | 'in_transit' | 'delivered' | 'cancelled'
          notes?: string | null
          changed_by?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'order_status_history_order_id_fkey'
            columns: ['order_id']
            isOneToOne: false
            referencedRelation: 'orders'
            referencedColumns: ['id']
          }
        ]
      }

      /**
       * Tabla de configuración global de la app
       * Almacena parámetros configurables
       */
      app_config: {
        Row: {
          id: string
          key: string
          value: Json
          description: string | null
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          id?: string
          key: string
          value: Json
          description?: string | null
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          id?: string
          key?: string
          value?: Json
          description?: string | null
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      order_status: 'pending' | 'assigned' | 'in_transit' | 'delivered' | 'cancelled'
      rider_status: 'available' | 'busy' | 'offline'
      user_role: 'admin' | 'sub-admin' | 'soporte'
      vehicle_type: 'bike' | 'motorcycle' | 'car'
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
