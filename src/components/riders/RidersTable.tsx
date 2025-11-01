'use client'

import { useState } from 'react'
import { useRiderStatus, type Rider } from '@/hooks/useRiderStatus'
import { RiderStatus } from './RiderStatus'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Users, MapPin, Package, Star } from 'lucide-react'

type StatusFilter = 'all' | 'available' | 'busy' | 'offline'

export function RidersTable() {
  const { riders, loading, error } = useRiderStatus()
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')

  const filteredRiders = riders.filter((rider) => {
    if (statusFilter === 'all') return true
    return rider.status === statusFilter
  })

  const getVehicleLabel = (type: string) => {
    const labels: Record<string, string> = {
      bike: 'Bicicleta',
      motorcycle: 'Moto',
      car: 'Auto',
    }
    return labels[type] || type
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-8 w-48" />
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-20 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardContent className="py-12">
          <div className="text-center text-red-500">
            <p>Error al cargar riders: {error}</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {/* Filtros */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium">Filtrar por estado:</span>
            <Select
              value={statusFilter}
              onValueChange={(value) => setStatusFilter(value as StatusFilter)}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="available">Disponibles</SelectItem>
                <SelectItem value="busy">Ocupados</SelectItem>
                <SelectItem value="offline">Desconectados</SelectItem>
              </SelectContent>
            </Select>
            <span className="text-sm text-muted-foreground">
              {filteredRiders.length} rider{filteredRiders.length !== 1 ? 's' : ''}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Tabla */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Riders ({filteredRiders.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredRiders.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Users className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-1">No hay riders</h3>
              <p className="text-sm text-muted-foreground">
                {statusFilter === 'all'
                  ? 'Aún no hay riders registrados'
                  : `No hay riders con estado "${statusFilter}"`}
              </p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Rider</TableHead>
                    <TableHead>Contacto</TableHead>
                    <TableHead>Vehículo</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Pedidos Activos</TableHead>
                    <TableHead>Ubicación</TableHead>
                    <TableHead>Rating</TableHead>
                    <TableHead>Entregas</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRiders.map((rider) => {
                    const initials = rider.full_name
                      .split(' ')
                      .map((n) => n[0])
                      .join('')
                      .toUpperCase()
                      .slice(0, 2)

                    return (
                      <TableRow key={rider.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-10 w-10">
                              <AvatarImage src={rider.avatar_url || undefined} />
                              <AvatarFallback>{initials}</AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium">{rider.full_name}</p>
                              {!rider.is_active && (
                                <Badge variant="outline" className="text-xs mt-1">
                                  Inactivo
                                </Badge>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <p className="text-sm">{rider.phone}</p>
                            {rider.email && (
                              <p className="text-xs text-muted-foreground">
                                {rider.email}
                              </p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <p className="text-sm font-medium">
                              {getVehicleLabel(rider.vehicle_type)}
                            </p>
                            {rider.vehicle_plate && (
                              <p className="text-xs text-muted-foreground">
                                {rider.vehicle_plate}
                              </p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <RiderStatus status={rider.status} />
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Package className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">
                              {rider.orders?.length || 0}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          {rider.current_location ? (
                            <div className="flex items-start gap-1 text-xs text-muted-foreground max-w-[200px]">
                              <MapPin className="h-3 w-3 mt-0.5 flex-shrink-0" />
                              <span className="truncate">
                                {rider.current_location.lat.toFixed(4)},{' '}
                                {rider.current_location.lng.toFixed(4)}
                              </span>
                            </div>
                          ) : (
                            <span className="text-xs text-muted-foreground">
                              Sin ubicación
                            </span>
                          )}
                        </TableCell>
                        <TableCell>
                          {rider.rating ? (
                            <div className="flex items-center gap-1">
                              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                              <span className="font-medium">
                                {rider.rating.toFixed(1)}
                              </span>
                            </div>
                          ) : (
                            <span className="text-xs text-muted-foreground">
                              Sin rating
                            </span>
                          )}
                        </TableCell>
                        <TableCell>
                          <span className="font-medium">
                            {rider.total_deliveries}
                          </span>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
