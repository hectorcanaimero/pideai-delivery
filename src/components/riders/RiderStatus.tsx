import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

type RiderStatus = 'available' | 'busy' | 'offline'

interface RiderStatusProps {
  status: RiderStatus
  className?: string
}

const statusConfig: Record<RiderStatus, { label: string; className: string }> = {
  available: {
    label: 'Disponible',
    className: 'bg-green-500 hover:bg-green-600 text-white',
  },
  busy: {
    label: 'Ocupado',
    className: 'bg-orange-500 hover:bg-orange-600 text-white',
  },
  offline: {
    label: 'Desconectado',
    className: 'bg-gray-500 hover:bg-gray-600 text-white',
  },
}

export function RiderStatus({ status, className }: RiderStatusProps) {
  const config = statusConfig[status]

  return (
    <Badge className={cn('font-medium', config.className, className)}>
      {config.label}
    </Badge>
  )
}
