'use client'

import { Building2, FileText, Package, Search, User, Users } from 'lucide-react'
'use client'

import type { SearchResult, SearchGroup } from './types'

function ResultIcon({
  type,
  className,
}: {
  type: string
  className?: string
}) {
  const classes = className || 'h-4 w-4'
  switch (type) {
    case 'partner':
      return <Building2 className={`${classes} text-amber-600`} />
    case 'product':
      return <Package className={`${classes} text-emerald-600`} />
    case 'invoice':
      return <FileText className={`${classes} text-violet-600`} />
    case 'contact':
      return <User className={`${classes} text-sky-600`} />
    case 'employee':
      return <Users className={`${classes} text-orange-600`} />
    default:
      return <Search className={`${classes} text-muted-foreground`} />
  }
}

function GroupIcon({ type, className }: { type: string; className?: string }) {
  const classes = className || 'h-4 w-4'
  switch (type) {
    case 'partners':
      return <Building2 className={`${classes} text-amber-600`} />
    case 'products':
      return <Package className={`${classes} text-emerald-600`} />
    case 'invoices':
      return <FileText className={`${classes} text-violet-600`} />
    case 'contacts':
      return <User className={`${classes} text-sky-600`} />
    case 'employees':
      return <Users className={`${classes} text-orange-600`} />
    default:
      return <Search className={`${classes} text-muted-foreground`} />
  }
}
