/**
 * Página de Riders - PideAI Admin
 *
 * Lista completa de riders con estados, ubicaciones y pedidos activos.
 * Actualización en tiempo real.
 *
 * @module app/(dashboard)/riders/page
 */

import { RidersTable } from '@/components/riders/RidersTable'

/**
 * Componente de página de Riders
 *
 * @returns {JSX.Element} Página de riders con tabla
 */
export default function RidersPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Riders</h2>
        <p className="text-muted-foreground">
          Gestiona los repartidores de la plataforma
        </p>
      </div>

      {/* Tabla de riders */}
      <RidersTable />
    </div>
  )
}
