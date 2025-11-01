/**
 * Página de Pedidos - PideAI Admin
 *
 * Lista completa de pedidos con filtros, búsqueda y paginación.
 * Permite gestionar todos los pedidos de la plataforma.
 *
 * @module app/(dashboard)/orders/page
 */

import { OrdersTable } from '@/components/orders/OrdersTable'

/**
 * Componente de página de Pedidos
 *
 * @returns {JSX.Element} Página de pedidos con tabla filtrable
 */
export default function OrdersPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Pedidos</h2>
        <p className="text-muted-foreground">
          Gestiona todos los pedidos de la plataforma
        </p>
      </div>

      {/* Tabla de pedidos con filtros */}
      <OrdersTable />
    </div>
  )
}
