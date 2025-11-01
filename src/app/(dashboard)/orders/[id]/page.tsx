/**
 * Página de Detalles de Pedido - PideAI Admin
 *
 * Muestra toda la información completa de un pedido específico.
 * Incluye datos del cliente, comercio, productos, rider y timeline.
 *
 * @module app/(dashboard)/orders/[id]/page
 */

import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { OrderDetails } from '@/components/orders/OrderDetails'
import { Button } from '@/components/ui/button'
import { ChevronLeft } from 'lucide-react'

interface OrderPageProps {
  params: {
    id: string
  }
}

/**
 * Componente de página de detalles de pedido
 *
 * @param {OrderPageProps} props - Props con el ID del pedido
 * @returns {Promise<JSX.Element>} Página de detalles del pedido
 */
export default async function OrderPage({ params }: OrderPageProps) {
  const supabase = await createClient()

  // Fetch completo del pedido con todas las relaciones
  const { data: order, error } = await supabase
    .from('orders')
    .select(
      `
      *,
      riders (
        id,
        full_name,
        phone,
        status
      ),
      stores (
        id,
        name,
        phone,
        address
      ),
      order_items (
        id,
        product_name,
        quantity,
        unit_price,
        total_price,
        notes
      )
    `
    )
    .eq('id', params.id)
    .single()

  // Si no existe el pedido, mostrar 404
  if (error || !order) {
    notFound()
  }

  return (
    <div className="space-y-6">
      {/* Botón de regreso */}
      <Link href="/orders">
        <Button variant="ghost" size="sm" className="gap-2">
          <ChevronLeft className="h-4 w-4" />
          Volver a Pedidos
        </Button>
      </Link>

      {/* Detalles del pedido */}
      <OrderDetails order={order} />
    </div>
  )
}
