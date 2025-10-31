/**
 * Layout para el Dashboard
 *
 * Este layout envuelve todas las páginas del dashboard.
 * Por ahora es un layout simple que será extendido en TASK-006.
 *
 * @module app/(dashboard)/layout
 */

import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Dashboard - PideAI Admin',
  description: 'Panel de administración de PideAI Delivery',
}

interface DashboardLayoutProps {
  children: React.ReactNode
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      {/* Por ahora solo renderizamos children */}
      {/* En TASK-006 se agregará Sidebar y Header */}
      {children}
    </div>
  )
}
