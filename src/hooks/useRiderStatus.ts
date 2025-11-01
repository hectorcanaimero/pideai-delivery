/**
 * Hook personalizado para gestionar riders con actualización en tiempo real
 *
 * @module hooks/useRiderStatus
 */

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

interface Order {
  id: string
  status: string
}

export interface Rider {
  id: string
  full_name: string
  phone: string
  email: string | null
  status: 'available' | 'busy' | 'offline'
  is_active: boolean
  vehicle_type: string
  vehicle_plate: string | null
  avatar_url: string | null
  rating: number | null
  total_deliveries: number
  current_location: { lat: number; lng: number } | null
  last_location_update: string | null
  created_at: string
  updated_at: string
  orders?: Order[]
}

interface UseRiderStatusResult {
  riders: Rider[]
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
}

/**
 * Hook para obtener riders con suscripción en tiempo real
 *
 * @returns {UseRiderStatusResult} Estado de riders
 */
export function useRiderStatus(): UseRiderStatusResult {
  const [riders, setRiders] = useState<Rider[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  const fetchRiders = async () => {
    try {
      setLoading(true)
      setError(null)

      const { data, error: fetchError } = await supabase
        .from('riders')
        .select(
          `
          *,
          orders!delivery_id(id, status)
        `
        )
        .order('created_at', { ascending: false })

      if (fetchError) {
        throw fetchError
      }

      // Calcular pedidos activos por rider
      const ridersWithActiveOrders = (data || []).map((rider) => {
        const activeOrders = rider.orders?.filter((order: Order) =>
          ['assigned', 'in_transit'].includes(order.status)
        )
        return {
          ...rider,
          orders: activeOrders || [],
        }
      })

      setRiders(ridersWithActiveOrders)
    } catch (err) {
      console.error('Error fetching riders:', err)
      setError(err instanceof Error ? err.message : 'Error al cargar riders')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    // Fetch inicial
    fetchRiders()

    // Suscripción en tiempo real
    const ridersChannel = supabase
      .channel('riders-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'riders',
        },
        () => {
          fetchRiders()
        }
      )
      .subscribe()

    // Suscripción a cambios en orders para actualizar contadores
    const ordersChannel = supabase
      .channel('orders-riders-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'orders',
        },
        () => {
          fetchRiders()
        }
      )
      .subscribe()

    // Cleanup
    return () => {
      supabase.removeChannel(ridersChannel)
      supabase.removeChannel(ordersChannel)
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return {
    riders,
    loading,
    error,
    refetch: fetchRiders,
  }
}
