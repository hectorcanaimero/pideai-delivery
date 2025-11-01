'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { OrderStatus } from './OrderStatus'
import { OrderFilters, OrderFiltersState } from './OrderFilters'
import { SearchBar } from '@/components/shared/SearchBar'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { ChevronLeft, ChevronRight, Package, Eye } from 'lucide-react'

interface Order {
  id: string
  order_number: string
  status: 'pending' | 'assigned' | 'in_transit' | 'delivered' | 'cancelled'
  customer_name: string
  customer_phone: string
  store_name: string
  total_amount: number
  is_urgent: boolean
  created_at: string
  delivery_id: string | null
  riders?: {
    full_name: string
  } | null
}

const ITEMS_PER_PAGE = 10

export function OrdersTable() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filters, setFilters] = useState<OrderFiltersState>({
    status: 'all',
    riderId: 'all',
    storeId: 'all',
  })
  const [currentPage, setCurrentPage] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const supabase = createClient()

  const fetchOrders = async () => {
    setLoading(true)
    try {
      let query = supabase
        .from('orders')
        .select('*, riders(full_name)', { count: 'exact' })
        .order('created_at', { ascending: false })

      // Aplicar filtro de búsqueda por order_number
      if (search) {
        query = query.ilike('order_number', `%${search}%`)
      }

      // Aplicar filtro de estado
      if (filters.status !== 'all') {
        query = query.eq('status', filters.status)
      }

      // Aplicar filtro de rider
      if (filters.riderId !== 'all') {
        query = query.eq('delivery_id', filters.riderId)
      }

      // Aplicar filtro de store
      if (filters.storeId !== 'all') {
        query = query.eq('store_id', filters.storeId)
      }

      // Paginación
      const from = (currentPage - 1) * ITEMS_PER_PAGE
      const to = from + ITEMS_PER_PAGE - 1
      query = query.range(from, to)

      const { data, count, error } = await query

      if (error) throw error

      setOrders(data || [])
      setTotalCount(count || 0)
    } catch (error) {
      console.error('Error fetching orders:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchOrders()
  }, [search, filters, currentPage]) // eslint-disable-line react-hooks/exhaustive-deps

  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE)

  const handleFilterChange = (newFilters: OrderFiltersState) => {
    setFilters(newFilters)
    setCurrentPage(1) // Reset a primera página
  }

  const handleSearchChange = (value: string) => {
    setSearch(value)
    setCurrentPage(1) // Reset a primera página
  }

  if (loading && orders.length === 0) {
    return (
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-48" />
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Búsqueda */}
      <SearchBar
        value={search}
        onChange={handleSearchChange}
        placeholder="Buscar por ID de pedido..."
        className="max-w-md"
      />

      {/* Filtros */}
      <OrderFilters onFilterChange={handleFilterChange} />

      {/* Tabla */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Pedidos ({totalCount})
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          {orders.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Package className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-1">No hay pedidos</h3>
              <p className="text-sm text-muted-foreground">
                {search || filters.status !== 'all' || filters.riderId !== 'all' || filters.storeId !== 'all'
                  ? 'No se encontraron pedidos con los filtros aplicados'
                  : 'Aún no hay pedidos registrados'}
              </p>
            </div>
          ) : (
            <>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Cliente</TableHead>
                      <TableHead>Comercio</TableHead>
                      <TableHead>Rider</TableHead>
                      <TableHead>Total</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead>Fecha</TableHead>
                      <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {orders.map((order) => (
                      <TableRow key={order.id}>
                        <TableCell className="font-medium">
                          {order.order_number}
                          {order.is_urgent && (
                            <span className="ml-2 text-xs text-red-600 font-semibold">
                              URGENTE
                            </span>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="font-medium">{order.customer_name}</span>
                            <span className="text-xs text-muted-foreground">
                              {order.customer_phone}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>{order.store_name}</TableCell>
                        <TableCell>
                          {order.riders?.full_name || (
                            <span className="text-muted-foreground">Sin asignar</span>
                          )}
                        </TableCell>
                        <TableCell className="font-medium">
                          ${order.total_amount.toFixed(2)}
                        </TableCell>
                        <TableCell>
                          <OrderStatus status={order.status} />
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {new Date(order.created_at).toLocaleDateString('es-ES', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </TableCell>
                        <TableCell className="text-right">
                          <Link href={`/orders/${order.id}`}>
                            <Button variant="ghost" size="sm" className="gap-2">
                              <Eye className="h-4 w-4" />
                              Ver
                            </Button>
                          </Link>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Paginación */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-4">
                  <div className="text-sm text-muted-foreground">
                    Mostrando {(currentPage - 1) * ITEMS_PER_PAGE + 1} -{' '}
                    {Math.min(currentPage * ITEMS_PER_PAGE, totalCount)} de {totalCount}{' '}
                    pedidos
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                    >
                      <ChevronLeft className="h-4 w-4" />
                      Anterior
                    </Button>
                    <span className="text-sm">
                      Página {currentPage} de {totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                    >
                      Siguiente
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
