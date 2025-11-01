'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Package, Users, DollarSign, TrendingUp } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface Metrics {
  activeOrders: number
  availableRiders: number
  todayRevenue: number
  completedToday: number
}

export function MetricsCards() {
  const [metrics, setMetrics] = useState<Metrics>({
    activeOrders: 0,
    availableRiders: 0,
    todayRevenue: 0,
    completedToday: 0,
  })
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  const fetchMetrics = async () => {
    try {
      // 1. Pedidos Activos (pending, assigned, in_transit)
      const { count: activeOrders } = await supabase
        .from('orders')
        .select('*', { count: 'exact', head: true })
        .in('status', ['pending', 'assigned', 'in_transit'])

      // 2. Riders Disponibles (available y activos)
      const { count: availableRiders } = await supabase
        .from('riders')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'available')
        .eq('is_active', true)

      // 3. Ingresos del Día (suma de total_amount de pedidos delivered hoy)
      const today = new Date()
      today.setHours(0, 0, 0, 0)

      const { data: revenueData } = await supabase
        .from('orders')
        .select('total_amount')
        .eq('status', 'delivered')
        .gte('delivered_at', today.toISOString())

      const todayRevenue = revenueData?.reduce(
        (sum, order) => sum + (order.total_amount || 0),
        0
      ) || 0

      // 4. Completados Hoy (count de pedidos delivered hoy)
      const { count: completedToday } = await supabase
        .from('orders')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'delivered')
        .gte('delivered_at', today.toISOString())

      setMetrics({
        activeOrders: activeOrders || 0,
        availableRiders: availableRiders || 0,
        todayRevenue: todayRevenue,
        completedToday: completedToday || 0,
      })
    } catch (error) {
      console.error('Error fetching metrics:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    // Cargar métricas iniciales
    fetchMetrics()

    // Suscribirse a cambios en orders
    const ordersChannel = supabase
      .channel('orders-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'orders' },
        () => {
          fetchMetrics()
        }
      )
      .subscribe()

    // Suscribirse a cambios en riders
    const ridersChannel = supabase
      .channel('riders-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'riders' },
        () => {
          fetchMetrics()
        }
      )
      .subscribe()

    // Cleanup: cancelar suscripciones al desmontar
    return () => {
      supabase.removeChannel(ordersChannel)
      supabase.removeChannel(ridersChannel)
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const stats = [
    {
      title: 'Pedidos Activos',
      value: metrics.activeOrders.toString(),
      icon: Package,
      description: 'En proceso de entrega',
    },
    {
      title: 'Riders Disponibles',
      value: metrics.availableRiders.toString(),
      icon: Users,
      description: 'Listos para asignar',
    },
    {
      title: 'Ingresos Hoy',
      value: `$${metrics.todayRevenue.toFixed(2)}`,
      icon: DollarSign,
      description: 'Total del día',
    },
    {
      title: 'Completados Hoy',
      value: metrics.completedToday.toString(),
      icon: TrendingUp,
      description: 'Entregas exitosas',
    },
  ]

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-4 rounded" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-16 mb-1" />
              <Skeleton className="h-3 w-32" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => {
        const Icon = stat.icon
        return (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <Icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">
                {stat.description}
              </p>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
