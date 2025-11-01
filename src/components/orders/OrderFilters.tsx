'use client'

import { useEffect, useState } from 'react'
import { Filter } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Card } from '@/components/ui/card'
import { createClient } from '@/lib/supabase/client'

interface OrderFiltersProps {
  onFilterChange: (filters: OrderFiltersState) => void
}

export interface OrderFiltersState {
  status: string
  riderId: string
  storeId: string
}

export function OrderFilters({ onFilterChange }: OrderFiltersProps) {
  const [filters, setFilters] = useState<OrderFiltersState>({
    status: 'all',
    riderId: 'all',
    storeId: 'all',
  })
  const [riders, setRiders] = useState<{ id: string; full_name: string }[]>([])
  const [stores, setStores] = useState<{ id: string; name: string }[]>([])
  const supabase = createClient()

  // Cargar riders y stores
  useEffect(() => {
    const loadFiltersData = async () => {
      // Cargar riders activos
      const { data: ridersData } = await supabase
        .from('riders')
        .select('id, full_name')
        .eq('is_active', true)
        .order('full_name')

      if (ridersData) setRiders(ridersData)

      // Cargar stores activos
      const { data: storesData } = await supabase
        .from('stores')
        .select('id, name')
        .eq('is_active', true)
        .order('name')

      if (storesData) setStores(storesData)
    }

    loadFiltersData()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const handleFilterChange = (key: keyof OrderFiltersState, value: string) => {
    const newFilters = { ...filters, [key]: value }
    setFilters(newFilters)
    onFilterChange(newFilters)
  }

  const clearFilters = () => {
    const clearedFilters = { status: 'all', riderId: 'all', storeId: 'all' }
    setFilters(clearedFilters)
    onFilterChange(clearedFilters)
  }

  const hasActiveFilters =
    filters.status !== 'all' ||
    filters.riderId !== 'all' ||
    filters.storeId !== 'all'

  return (
    <Card className="p-4">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">Filtros:</span>
        </div>

        {/* Estado */}
        <Select
          value={filters.status}
          onValueChange={(value) => handleFilterChange('status', value)}
        >
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Estado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="pending">Pendiente</SelectItem>
            <SelectItem value="assigned">Asignado</SelectItem>
            <SelectItem value="in_transit">En Camino</SelectItem>
            <SelectItem value="delivered">Entregado</SelectItem>
            <SelectItem value="cancelled">Cancelado</SelectItem>
          </SelectContent>
        </Select>

        {/* Rider */}
        <Select
          value={filters.riderId}
          onValueChange={(value) => handleFilterChange('riderId', value)}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Rider" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los Riders</SelectItem>
            {riders.map((rider) => (
              <SelectItem key={rider.id} value={rider.id}>
                {rider.full_name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Comercio */}
        <Select
          value={filters.storeId}
          onValueChange={(value) => handleFilterChange('storeId', value)}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Comercio" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los Comercios</SelectItem>
            {stores.map((store) => (
              <SelectItem key={store.id} value={store.id}>
                {store.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Limpiar Filtros */}
        {hasActiveFilters && (
          <Button variant="outline" size="sm" onClick={clearFilters}>
            Limpiar
          </Button>
        )}
      </div>
    </Card>
  )
}
