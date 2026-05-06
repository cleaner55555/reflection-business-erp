'use client'
import { Badge } from '@/components/ui/badge'
import { STATUSES } from './data'

export function getStatusBadge(s: string) {
  const r = STATUSES[s]
  return r ? <Badge className={`${r.color} text-[10px]`}>{r.label}</Badge> : <Badge className="text-[10px]">{s}</Badge>
}
