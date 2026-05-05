'use client'

from '@/components/ui/badge'
from '@/components/ui/button'
from '@/components/ui/card'
from '@/components/ui/dialog'
from '@/components/ui/input'
from '@/components/ui/label'
from '@/components/ui/select'
from '@/components/ui/switch'
from '@/components/ui/table'
from '@/components/ui/tabs'
from '@/components/ui/textarea'
import { , Search } from 'lucide-react'
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
