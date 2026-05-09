'use client'
import { Badge } from '@/components/ui/badge'
import { STATUSES } from './data'

export function getStatusBadge(s: string) {
  const r = STATUSES[s]
  return r ? <Badge className={`${r.color} text-xs`}>{r.label}</Badge> : <Badge className="text-xs">{s}</Badge>
}

export function formatAmount(a: number, c: string) {
  return new Intl.NumberFormat('sr-RS', { style: 'currency', currency: c, maximumFractionDigits: 0 }).format(a)
}
