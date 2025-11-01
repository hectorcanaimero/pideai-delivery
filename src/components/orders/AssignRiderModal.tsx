'use client'

import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { UserCheck, MapPin, Package } from 'lucide-react'
import { assignOrderToRider, getAvailableRiders } from '@/lib/api/orders'

interface Rider {
  id: string
  full_name: string
  phone: string
  avatar_url: string | null
  status: string
  vehicle_type: string
  activeOrders: number
}

interface AssignRiderModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  orderId: string
  onSuccess: () => void
}

export function AssignRiderModal({
  open,
  onOpenChange,
  orderId,
  onSuccess,
}: AssignRiderModalProps) {
  const [riders, setRiders] = useState<Rider[]>([])
  const [loading, setLoading] = useState(true)
  const [assigning, setAssigning] = useState(false)

  useEffect(() => {
    if (open) {
      loadRiders()
    }
  }, [open])

  const loadRiders = async () => {
    setLoading(true)
    try {
      const availableRiders = await getAvailableRiders()
      setRiders(availableRiders as Rider[])
    } catch (error) {
      console.error('Error loading riders:', error)
      toast.error('Error al cargar riders disponibles')
    } finally {
      setLoading(false)
    }
  }

  const handleAssign = async (riderId: string, riderName: string) => {
    setAssigning(true)
    try {
      const result = await assignOrderToRider(orderId, riderId)

      if (result.success) {
        toast.success(`Pedido asignado a ${riderName}`)
        onOpenChange(false)
        onSuccess()
      } else {
        toast.error(result.error || 'Error al asignar pedido')
      }
    } catch (error) {
      console.error('Error assigning order:', error)
      toast.error('Error inesperado al asignar pedido')
    } finally {
      setAssigning(false)
    }
  }

  const getVehicleLabel = (type: string) => {
    const labels: Record<string, string> = {
      bike: 'Bicicleta',
      motorcycle: 'Moto',
      car: 'Auto',
    }
    return labels[type] || type
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserCheck className="h-5 w-5" />
            Asignar Rider al Pedido
          </DialogTitle>
          <DialogDescription>
            Selecciona un rider disponible para asignar este pedido
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          {loading ? (
            // Skeleton loader
            <>
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="flex items-center gap-4 rounded-lg border p-4"
                >
                  <Skeleton className="h-12 w-12 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-5 w-32" />
                    <Skeleton className="h-4 w-48" />
                  </div>
                  <Skeleton className="h-9 w-24" />
                </div>
              ))}
            </>
          ) : riders.length === 0 ? (
            // No hay riders disponibles
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Package className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-1">
                No hay riders disponibles
              </h3>
              <p className="text-sm text-muted-foreground">
                Todos los riders están ocupados o desconectados
              </p>
            </div>
          ) : (
            // Lista de riders
            riders.map((rider) => {
              const initials = rider.full_name
                .split(' ')
                .map((n) => n[0])
                .join('')
                .toUpperCase()
                .slice(0, 2)

              return (
                <div
                  key={rider.id}
                  className="flex items-center gap-4 rounded-lg border p-4 transition-colors hover:bg-muted/50"
                >
                  {/* Avatar */}
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={rider.avatar_url || undefined} />
                    <AvatarFallback>{initials}</AvatarFallback>
                  </Avatar>

                  {/* Info */}
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{rider.full_name}</p>
                      <Badge variant="outline" className="text-xs">
                        {getVehicleLabel(rider.vehicle_type)}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {rider.phone}
                      </span>
                      <span className="flex items-center gap-1">
                        <Package className="h-3 w-3" />
                        {rider.activeOrders} pedido
                        {rider.activeOrders !== 1 ? 's' : ''} activo
                        {rider.activeOrders !== 1 ? 's' : ''}
                      </span>
                    </div>
                  </div>

                  {/* Botón asignar */}
                  <Button
                    onClick={() => handleAssign(rider.id, rider.full_name)}
                    disabled={assigning}
                    size="sm"
                  >
                    {assigning ? 'Asignando...' : 'Asignar'}
                  </Button>
                </div>
              )
            })
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
