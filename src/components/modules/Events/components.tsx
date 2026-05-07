'use client'

import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Search } from 'lucide-react'
'use client'

import type { EventItem, RegistrationItem, VenueItem, TicketItem } from './types'

function KPICard({ icon: Icon, label, value, subtext, color }: {
  icon: React.ComponentType<{ className?: string }>
  label: string
  value: string | number
  subtext?: string
  color: string
}) {
  return (
    <Card className="p-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs text-muted-foreground">{label}</span>
        <Icon className={`h-4 w-4 ${color}`} />
      </div>
      <p className="text-2xl font-bold">{value}</p>
      {subtext && <p className="text-xs text-muted-foreground mt-1">{subtext}</p>}
    </Card>
  )
}

function FilterBar({ search, onSearchChange, children }: {
  search: string
  onSearchChange: (v: string) => void
  children?: React.ReactNode
}) {
  return (
    <div className="flex flex-col sm:flex-row gap-3">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="..." className="pl-9" value={search} onChange={(e) => onSearchChange(e.target.value)} />
      </div>
      {children}
    </div>
  )
}

function StatusBadge({ statusKey, colorMap }: {
  statusKey: string
  colorMap: Record<string, string>
}) {
  return (
    <Badge variant="outline" className={colorMap[statusKey] || 'bg-gray-100 text-gray-700'}>
      {statusKey}
    </Badge>
  )
}
