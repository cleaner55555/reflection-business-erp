'use client'

import { Card } from '@/components/ui/card'
'use client'

import {  } from 'lucide-react'
import type { VoipCall, Extension, IvrMenu, IvrEntry, Recording, SipTrunk, CallQueue, ForwardingRule, DialPlan } from './types'

function KpiCard({ icon, label, value, valueColor }: {
  icon: React.ReactNode
  label: string
  value: string
  valueColor?: string
}) {
  return (
    <Card className="p-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs text-muted-foreground">{label}</span>
        {icon}
      </div>
      <p className={`text-2xl font-bold ${valueColor ?? ''}`}>{value}</p>
    </Card>
  )
}
