'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { MapPin, Package, Users, Navigation } from 'lucide-react'
import { OrderStatus } from './OrderStatus'

interface Location {
  lat: number
  lng: number
}

interface Order {
  id: string
  order_number: string
  status: 'pending' | 'assigned' | 'in_transit' | 'delivered' | 'cancelled'
  customer_name: string
  customer_address: string
  customer_location: Location | null
  store_name: string
  delivery_id: string | null
  riders?: {
    full_name: string
  } | null
}

interface Rider {
  id: string
  full_name: string
  phone: string
  status: string
  current_location: Location | null
  is_active: boolean
}

export function OrdersMapView() {
  const [orders, setOrders] = useState<Order[]>([])
  const [riders, setRiders] = useState<Rider[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    fetchData()

    // Suscripción a cambios en tiempo real
    const ordersChannel = supabase
      .channel('orders-map-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'orders' },
        () => {
          fetchData()
        }
      )
      .subscribe()

    const ridersChannel = supabase
      .channel('riders-map-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'riders' },
        () => {
          fetchData()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(ordersChannel)
      supabase.removeChannel(ridersChannel)
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const fetchData = async () => {
    setLoading(true)
    try {
      // Fetch pedidos activos
      const { data: ordersData } = await supabase
        .from('orders')
        .select('*, riders(full_name)')
        .in('status', ['pending', 'assigned', 'in_transit'])
        .order('created_at', { ascending: false })

      // Fetch riders activos
      const { data: ridersData } = await supabase
        .from('riders')
        .select('*')
        .eq('is_active', true)
        .order('full_name')

      setOrders(ordersData || [])
      setRiders(ridersData || [])
    } catch (error) {
      console.error('Error fetching map data:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      available: 'bg-green-500',
      busy: 'bg-orange-500',
      offline: 'bg-gray-500',
    }
    return colors[status] || 'bg-gray-500'
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-8 w-48" />
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-20 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-5 w-5" />
          Vista de Mapa - Pedidos y Riders
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="orders" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="orders" className="gap-2">
              <Package className="h-4 w-4" />
              Pedidos Activos ({orders.length})
            </TabsTrigger>
            <TabsTrigger value="riders" className="gap-2">
              <Users className="h-4 w-4" />
              Riders ({riders.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="orders" className="space-y-3 mt-4">
            {orders.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Package className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-1">
                  No hay pedidos activos
                </h3>
                <p className="text-sm text-muted-foreground">
                  Todos los pedidos han sido entregados
                </p>
              </div>
            ) : (
              orders.map((order) => (
                <div
                  key={order.id}
                  className="flex items-start gap-4 rounded-lg border p-4 transition-colors hover:bg-muted/50"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                    <MapPin className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{order.order_number}</p>
                      <OrderStatus status={order.status} />
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {order.customer_name}
                    </p>
                    <div className="flex items-start gap-1 text-sm text-muted-foreground">
                      <Navigation className="h-4 w-4 mt-0.5 flex-shrink-0" />
                      <span>{order.customer_address}</span>
                    </div>
                    {order.customer_location && (
                      <p className="text-xs text-muted-foreground">
                        Coordenadas: {order.customer_location.lat.toFixed(6)},{' '}
                        {order.customer_location.lng.toFixed(6)}
                      </p>
                    )}
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-muted-foreground">Comercio:</span>
                      <span className="font-medium">{order.store_name}</span>
                    </div>
                    {order.riders && (
                      <div className="flex items-center gap-2 text-sm">
                        <span className="text-muted-foreground">Rider:</span>
                        <span className="font-medium">
                          {order.riders.full_name}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </TabsContent>

          <TabsContent value="riders" className="space-y-3 mt-4">
            {riders.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Users className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-1">
                  No hay riders activos
                </h3>
                <p className="text-sm text-muted-foreground">
                  No hay riders disponibles en este momento
                </p>
              </div>
            ) : (
              riders.map((rider) => (
                <div
                  key={rider.id}
                  className="flex items-start gap-4 rounded-lg border p-4 transition-colors hover:bg-muted/50"
                >
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-full ${getStatusColor(
                      rider.status
                    )}`}
                  >
                    <Users className="h-5 w-5 text-white" />
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{rider.full_name}</p>
                      <Badge
                        variant={
                          rider.status === 'available' ? 'default' : 'secondary'
                        }
                      >
                        {rider.status === 'available' && 'Disponible'}
                        {rider.status === 'busy' && 'Ocupado'}
                        {rider.status === 'offline' && 'Desconectado'}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {rider.phone}
                    </p>
                    {rider.current_location ? (
                      <div className="flex items-start gap-1 text-sm text-muted-foreground">
                        <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />
                        <span>
                          Ubicación: {rider.current_location.lat.toFixed(6)},{' '}
                          {rider.current_location.lng.toFixed(6)}
                        </span>
                      </div>
                    ) : (
                      <p className="text-xs text-muted-foreground">
                        Ubicación no disponible
                      </p>
                    )}
                  </div>
                </div>
              ))
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
