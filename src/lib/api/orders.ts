/**
 * API de Pedidos - PideAI Admin
 *
 * Funciones para gestionar pedidos: asignar riders, cambiar estados, etc.
 *
 * @module lib/api/orders
 */

import { createClient } from '@/lib/supabase/client'

/**
 * Resultado de la asignación de rider
 */
export interface AssignRiderResult {
  success: boolean
  error?: string
}

/**
 * Asigna un pedido a un rider disponible
 *
 * @param orderId - ID del pedido a asignar
 * @param riderId - ID del rider al que asignar
 * @returns Resultado de la operación
 */
export async function assignOrderToRider(
  orderId: string,
  riderId: string
): Promise<AssignRiderResult> {
  const supabase = createClient()

  try {
    // 1. Verificar que el rider esté disponible
    const { data: rider, error: riderCheckError } = await supabase
      .from('riders')
      .select('status, is_active')
      .eq('id', riderId)
      .single()

    if (riderCheckError) {
      return { success: false, error: 'Rider no encontrado' }
    }

    if (!rider.is_active) {
      return { success: false, error: 'Rider no está activo' }
    }

    if (rider.status !== 'available') {
      return { success: false, error: 'Rider no está disponible' }
    }

    // 2. Verificar que el pedido esté pendiente
    const { data: order, error: orderCheckError } = await supabase
      .from('orders')
      .select('status')
      .eq('id', orderId)
      .single()

    if (orderCheckError) {
      return { success: false, error: 'Pedido no encontrado' }
    }

    if (order.status !== 'pending') {
      return { success: false, error: 'Pedido ya fue asignado o completado' }
    }

    // 3. Actualizar el pedido
    const { error: orderUpdateError } = await supabase
      .from('orders')
      .update({
        delivery_id: riderId,
        status: 'assigned',
        assigned_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', orderId)

    if (orderUpdateError) {
      console.error('Error updating order:', orderUpdateError)
      return { success: false, error: 'Error al actualizar el pedido' }
    }

    // 4. Actualizar el estado del rider a 'busy'
    const { error: riderUpdateError } = await supabase
      .from('riders')
      .update({
        status: 'busy',
        updated_at: new Date().toISOString(),
      })
      .eq('id', riderId)

    if (riderUpdateError) {
      console.error('Error updating rider:', riderUpdateError)
      // No revertimos el pedido porque es más crítico
      // En producción, esto debería ser una transacción
    }

    // 5. TODO: Enviar notificación push al rider
    // await sendPushNotification(riderId, 'Nuevo pedido asignado', orderDetails)

    return { success: true }
  } catch (error) {
    console.error('Error in assignOrderToRider:', error)
    return { success: false, error: 'Error inesperado al asignar rider' }
  }
}

/**
 * Obtiene la lista de riders disponibles para asignar
 *
 * @returns Lista de riders disponibles
 */
export async function getAvailableRiders() {
  const supabase = createClient()

  try {
    const { data: riders, error } = await supabase
      .from('riders')
      .select(
        `
        *,
        orders!delivery_id(id, status)
      `
      )
      .eq('status', 'available')
      .eq('is_active', true)
      .order('full_name')

    if (error) {
      console.error('Error fetching available riders:', error)
      return []
    }

    // Contar pedidos activos de cada rider
    const ridersWithActiveOrders = (riders || []).map((rider) => {
      const activeOrders =
        rider.orders?.filter((order: { status: string }) =>
          ['assigned', 'in_transit'].includes(order.status)
        ).length || 0

      return {
        ...rider,
        activeOrders,
      }
    })

    // Ordenar por cantidad de pedidos activos (menos pedidos primero)
    return ridersWithActiveOrders.sort((a, b) => a.activeOrders - b.activeOrders)
  } catch (error) {
    console.error('Error in getAvailableRiders:', error)
    return []
  }
}

/**
 * Cancela un pedido
 *
 * @param orderId - ID del pedido a cancelar
 * @param reason - Razón de la cancelación
 * @returns Resultado de la operación
 */
export async function cancelOrder(
  orderId: string,
  reason?: string
): Promise<AssignRiderResult> {
  const supabase = createClient()

  try {
    // 1. Obtener el pedido con rider asignado
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('delivery_id, status')
      .eq('id', orderId)
      .single()

    if (orderError || !order) {
      return { success: false, error: 'Pedido no encontrado' }
    }

    if (order.status === 'cancelled') {
      return { success: false, error: 'Pedido ya está cancelado' }
    }

    if (order.status === 'delivered') {
      return { success: false, error: 'No se puede cancelar un pedido entregado' }
    }

    // 2. Actualizar el pedido
    const { error: updateError } = await supabase
      .from('orders')
      .update({
        status: 'cancelled',
        cancelled_at: new Date().toISOString(),
        notes: reason
          ? `Cancelado: ${reason}`
          : 'Cancelado por el administrador',
        updated_at: new Date().toISOString(),
      })
      .eq('id', orderId)

    if (updateError) {
      console.error('Error cancelling order:', updateError)
      return { success: false, error: 'Error al cancelar el pedido' }
    }

    // 3. Si tenía rider asignado, liberar al rider
    if (order.delivery_id) {
      // Verificar si el rider tiene más pedidos activos
      const { data: otherOrders } = await supabase
        .from('orders')
        .select('id')
        .eq('delivery_id', order.delivery_id)
        .in('status', ['assigned', 'in_transit'])
        .neq('id', orderId)

      // Si no tiene más pedidos, marcarlo como disponible
      if (!otherOrders || otherOrders.length === 0) {
        await supabase
          .from('riders')
          .update({
            status: 'available',
            updated_at: new Date().toISOString(),
          })
          .eq('id', order.delivery_id)
      }
    }

    return { success: true }
  } catch (error) {
    console.error('Error in cancelOrder:', error)
    return { success: false, error: 'Error inesperado al cancelar pedido' }
  }
}
