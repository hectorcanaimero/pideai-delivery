/**
 * Página de Dashboard - PideAI Admin
 *
 * Página principal del dashboard con métricas en tiempo real.
 * Muestra estadísticas clave de la plataforma que se actualizan automáticamente.
 *
 * @module app/(dashboard)/dashboard/page
 */

import { MetricsCards } from '@/components/dashboard/MetricsCards'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

/**
 * Componente de página de Dashboard
 *
 * @returns {JSX.Element} Página de dashboard con métricas en tiempo real
 */
export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <p className="text-muted-foreground">
          Resumen general de tu plataforma de delivery
        </p>
      </div>

      {/* Métricas en tiempo real */}
      <MetricsCards />

      {/* Actividad Reciente - Placeholder */}
      <Card>
        <CardHeader>
          <CardTitle>Actividad Reciente</CardTitle>
          <CardDescription>
            Últimos pedidos y actualizaciones del sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Las métricas se actualizan en tiempo real cuando hay cambios en pedidos o riders.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
