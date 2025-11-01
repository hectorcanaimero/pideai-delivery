'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { OrderStatus } from './OrderStatus'
import { OrderTimeline } from './OrderTimeline'
import {
  MapPin,
  Phone,
  Store,
  User,
  Package,
  AlertCircle,
} from 'lucide-react'

interface OrderItem {
  id: string
  product_name: string
  quantity: number
  unit_price: number
  total_price: number
  notes: string | null
}

interface Rider {
  id: string
  full_name: string
  phone: string
  status: string
}

interface Store {
  id: string
  name: string
  phone: string
  address: string
}

interface Order {
  id: string
  order_number: string
  status: 'pending' | 'assigned' | 'in_transit' | 'delivered' | 'cancelled'
  customer_name: string
  customer_phone: string
  customer_address: string
  store_name: string
  total_amount: number
  delivery_fee: number
  is_urgent: boolean
  notes: string | null
  created_at: string
  assigned_at: string | null
  picked_up_at: string | null
  delivered_at: string | null
  cancelled_at: string | null
  order_items?: OrderItem[]
  riders?: Rider | null
  stores?: Store | null
}

interface OrderDetailsProps {
  order: Order
}

export function OrderDetails({ order }: OrderDetailsProps) {
  const subtotal = order.total_amount - order.delivery_fee

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold">{order.order_number}</h1>
            <OrderStatus status={order.status} />
            {order.is_urgent && (
              <Badge variant="destructive" className="flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                URGENTE
              </Badge>
            )}
          </div>
          <p className="text-muted-foreground mt-1">
            Creado el{' '}
            {new Date(order.created_at).toLocaleDateString('es-ES', {
              day: '2-digit',
              month: 'long',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Columna Principal */}
        <div className="lg:col-span-2 space-y-6">
          {/* Información del Cliente */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Información del Cliente
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm text-muted-foreground">Nombre</p>
                <p className="font-medium">{order.customer_name}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Teléfono</p>
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <p className="font-medium">{order.customer_phone}</p>
                </div>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Dirección de Entrega</p>
                <div className="flex items-start gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground mt-1" />
                  <p className="font-medium">{order.customer_address}</p>
                </div>
              </div>
              {order.notes && (
                <div>
                  <p className="text-sm text-muted-foreground">Notas</p>
                  <p className="text-sm">{order.notes}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Información del Comercio */}
          {order.stores && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Store className="h-5 w-5" />
                  Información del Comercio
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm text-muted-foreground">Comercio</p>
                  <p className="font-medium">{order.stores.name}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Teléfono</p>
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <p className="font-medium">{order.stores.phone}</p>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Dirección</p>
                  <div className="flex items-start gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground mt-1" />
                    <p className="font-medium">{order.stores.address}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Productos */}
          {order.order_items && order.order_items.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Productos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Producto</TableHead>
                      <TableHead className="text-right">Cantidad</TableHead>
                      <TableHead className="text-right">Precio Unit.</TableHead>
                      <TableHead className="text-right">Subtotal</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {order.order_items.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{item.product_name}</p>
                            {item.notes && (
                              <p className="text-xs text-muted-foreground">
                                {item.notes}
                              </p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          {item.quantity}
                        </TableCell>
                        <TableCell className="text-right">
                          ${item.unit_price.toFixed(2)}
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          ${item.total_price.toFixed(2)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                  <TableFooter>
                    <TableRow>
                      <TableCell colSpan={3}>Subtotal</TableCell>
                      <TableCell className="text-right font-medium">
                        ${subtotal.toFixed(2)}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell colSpan={3}>Tarifa de Entrega</TableCell>
                      <TableCell className="text-right font-medium">
                        ${order.delivery_fee.toFixed(2)}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell colSpan={3} className="text-lg font-bold">
                        Total
                      </TableCell>
                      <TableCell className="text-right text-lg font-bold">
                        ${order.total_amount.toFixed(2)}
                      </TableCell>
                    </TableRow>
                  </TableFooter>
                </Table>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Columna Lateral */}
        <div className="space-y-6">
          {/* Rider Asignado */}
          {order.riders ? (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Rider Asignado</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm text-muted-foreground">Nombre</p>
                  <p className="font-medium">{order.riders.full_name}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Teléfono</p>
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <p className="font-medium">{order.riders.phone}</p>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Estado</p>
                  <Badge className="mt-1">
                    {order.riders.status === 'available' && 'Disponible'}
                    {order.riders.status === 'busy' && 'Ocupado'}
                    {order.riders.status === 'offline' && 'Desconectado'}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Rider</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Sin rider asignado
                </p>
              </CardContent>
            </Card>
          )}

          {/* Timeline */}
          <OrderTimeline
            status={order.status}
            createdAt={order.created_at}
            assignedAt={order.assigned_at}
            pickedUpAt={order.picked_up_at}
            deliveredAt={order.delivered_at}
            cancelledAt={order.cancelled_at}
          />
        </div>
      </div>
    </div>
  )
}
