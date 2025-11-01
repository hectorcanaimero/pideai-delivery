/**
 * Página de Pedidos - PideAI Admin
 *
 * Lista completa de pedidos con filtros, búsqueda, paginación y vista de mapa.
 * Permite gestionar todos los pedidos de la plataforma.
 *
 * @module app/(dashboard)/orders/page
 */

'use client'

import { useState } from 'react'
import { OrdersTable } from '@/components/orders/OrdersTable'
import { OrdersMapView } from '@/components/orders/OrdersMapView'
import { Button } from '@/components/ui/button'
import { List, Map } from 'lucide-react'

/**
 * Componente de página de Pedidos
 *
 * @returns {JSX.Element} Página de pedidos con tabla y mapa
 */
export default function OrdersPage() {
  const [view, setView] = useState<'table' | 'map'>('table')

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Pedidos</h2>
          <p className="text-muted-foreground">
            Gestiona todos los pedidos de la plataforma
          </p>
        </div>

        {/* Toggle de vista */}
        <div className="flex gap-2">
          <Button
            variant={view === 'table' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setView('table')}
            className="gap-2"
          >
            <List className="h-4 w-4" />
            Tabla
          </Button>
          <Button
            variant={view === 'map' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setView('map')}
            className="gap-2"
          >
            <Map className="h-4 w-4" />
            Mapa
          </Button>
        </div>
      </div>

      {/* Vista condicional */}
      {view === 'table' ? <OrdersTable /> : <OrdersMapView />}
    </div>
  )
}
