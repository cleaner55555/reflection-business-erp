'use client'

from '@/components/ui/badge'
from '@/components/ui/button'
from '@/components/ui/card'
from '@/components/ui/checkbox'
from '@/components/ui/dialog'
from '@/components/ui/input'
from '@/components/ui/label'
from '@/components/ui/select'
from '@/components/ui/separator'
from '@/components/ui/switch'
from '@/components/ui/tabs'
from '@/components/ui/textarea'
import { , Bell, Plus } from 'lucide-react'
import type { Appointment, DashboardData, Client, Service, StaffMember, AppSettings } from './types'

function KpiCard({ label, value, icon, colorClass }: {
  label: string; value: string | number; icon: React.ReactNode; colorClass?: string
}) {
  return (
    <Card className="p-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs text-muted-foreground">{label}</span>
        {icon}
      </div>
      <p className={`text-2xl font-bold ${colorClass || ''}`}>{value}</p>
    </Card>
  )
}

function EmptyState({ icon, message, actionLabel, onAction }: {
  icon: React.ReactNode; message: string; actionLabel?: string; onAction?: () => void
}) {
  return (
    <Card className="p-8 text-center">
      {icon}
      <p className="text-muted-foreground mt-3">{message}</p>
      {actionLabel && onAction && (
        <Button variant="outline" className="mt-3" onClick={onAction}>
          <Plus className="h-4 w-4 mr-1" /> {actionLabel}
        </Button>
      )}
    </Card>
  )
}

function StatusBadge({ status }: { status: string }) {
  const cfg = STATUS_CONFIG[status]
  return (
    <Badge variant="outline" className={`text-[10px] ${cfg?.color || ''}`}>
      {cfg?.label || status}
    </Badge>
  )
}

function ReminderBadge({ status }: { status?: string }) {
  if (!status) return null
  const labels: Record<string, { text: string; color: string }> = {
    sent: { text: 'Poslata', color: 'bg-green-100 text-green-700' },
    pending: { text: 'Na čekanju', color: 'bg-amber-100 text-amber-700' },
    not_sent: { text: 'Nije poslata', color: 'bg-gray-100 text-gray-600' },
  }
  const cfg = labels[status]
  if (!cfg) return null
  return <Badge variant="outline" className={`text-[9px] ml-1 ${cfg.color}`}><Bell className="h-2.5 w-2.5 mr-0.5" />{cfg.text}</Badge>
}
