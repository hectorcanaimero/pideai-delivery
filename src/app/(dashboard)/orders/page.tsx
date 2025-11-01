/**
 * Página de Pedidos - PideAI Admin
 *
 * Lista de pedidos de la plataforma.
 *
 * @module app/(dashboard)/orders/page
 */

import { OrdersTable } from '@/components/orders/OrdersTable'

export default function OrdersPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Pedidos</h2>
        <p className="text-muted-foreground">
          Gestiona todos los pedidos de la plataforma
        </p>
      </div>

      {/* Tabla de pedidos */}
      <OrdersTable />
    </div>
  )
}
