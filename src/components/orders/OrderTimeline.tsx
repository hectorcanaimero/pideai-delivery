import { CheckCircle2, Circle, Clock } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface TimelineEvent {
  status: string
  label: string
  timestamp: string | null
  completed: boolean
}

interface OrderTimelineProps {
  status: 'pending' | 'assigned' | 'in_transit' | 'delivered' | 'cancelled'
  createdAt: string
  assignedAt: string | null
  pickedUpAt: string | null
  deliveredAt: string | null
  cancelledAt: string | null
}

export function OrderTimeline({
  status,
  createdAt,
  assignedAt,
  pickedUpAt,
  deliveredAt,
  cancelledAt,
}: OrderTimelineProps) {
  const events: TimelineEvent[] = [
    {
      status: 'created',
      label: 'Pedido creado',
      timestamp: createdAt,
      completed: true,
    },
    {
      status: 'assigned',
      label: 'Asignado a rider',
      timestamp: assignedAt,
      completed: status !== 'pending',
    },
    {
      status: 'in_transit',
      label: 'Rider en camino',
      timestamp: pickedUpAt,
      completed: ['in_transit', 'delivered'].includes(status),
    },
    {
      status: 'delivered',
      label: 'Pedido entregado',
      timestamp: deliveredAt,
      completed: status === 'delivered',
    },
  ]

  // Si está cancelado, mostrar solo creado y cancelado
  if (status === 'cancelled') {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Historial del Pedido</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <TimelineItem
              label="Pedido creado"
              timestamp={createdAt}
              completed={true}
              isLast={false}
            />
            <TimelineItem
              label="Pedido cancelado"
              timestamp={cancelledAt}
              completed={true}
              isLast={true}
              isCancelled={true}
            />
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Historial del Pedido</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {events.map((event, index) => (
            <TimelineItem
              key={event.status}
              label={event.label}
              timestamp={event.timestamp}
              completed={event.completed}
              isLast={index === events.length - 1}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

interface TimelineItemProps {
  label: string
  timestamp: string | null
  completed: boolean
  isLast: boolean
  isCancelled?: boolean
}

function TimelineItem({
  label,
  timestamp,
  completed,
  isLast,
  isCancelled = false,
}: TimelineItemProps) {
  return (
    <div className="flex gap-4">
      {/* Icono y línea */}
      <div className="flex flex-col items-center">
        {completed ? (
          <CheckCircle2
            className={cn(
              'h-6 w-6',
              isCancelled ? 'text-red-500' : 'text-green-500'
            )}
          />
        ) : (
          <Circle className="h-6 w-6 text-muted-foreground" />
        )}
        {!isLast && (
          <div
            className={cn(
              'w-0.5 h-full min-h-[2rem] mt-1',
              completed ? 'bg-green-500' : 'bg-muted'
            )}
          />
        )}
      </div>

      {/* Contenido */}
      <div className="flex-1 pb-4">
        <p
          className={cn(
            'font-medium',
            completed ? 'text-foreground' : 'text-muted-foreground'
          )}
        >
          {label}
        </p>
        {timestamp && (
          <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
            <Clock className="h-3 w-3" />
            {new Date(timestamp).toLocaleDateString('es-ES', {
              day: '2-digit',
              month: 'short',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </p>
        )}
      </div>
    </div>
  )
}
