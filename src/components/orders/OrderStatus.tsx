import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

type OrderStatus = 'pending' | 'assigned' | 'in_transit' | 'delivered' | 'cancelled'

interface OrderStatusProps {
  status: OrderStatus
}

const statusConfig: Record<OrderStatus, { label: string; className: string }> = {
  pending: {
    label: 'Pendiente',
    className: 'bg-yellow-500 hover:bg-yellow-600 text-white',
  },
  assigned: {
    label: 'Asignado',
    className: 'bg-blue-500 hover:bg-blue-600 text-white',
  },
  in_transit: {
    label: 'En Camino',
    className: 'bg-purple-500 hover:bg-purple-600 text-white',
  },
  delivered: {
    label: 'Entregado',
    className: 'bg-green-500 hover:bg-green-600 text-white',
  },
  cancelled: {
    label: 'Cancelado',
    className: 'bg-red-500 hover:bg-red-600 text-white',
  },
}

export function OrderStatus({ status }: OrderStatusProps) {
  const config = statusConfig[status]

  return (
    <Badge className={cn('font-medium', config.className)}>
      {config.label}
    </Badge>
  )
}
