import type { ModuleType } from '@/lib/store'

export interface SearchResult {
  id: string
  name: string
  subtitle: string
  module: ModuleType
  icon: 'partner' | 'product' | 'invoice' | 'contact' | 'employee'
  meta?: {
    amount?: number
    status?: string
    email?: string
    phone?: string
  }
}

export interface SearchGroup {
  type: string
  label: string
  results: SearchResult[]
}

export interface SearchFilter {
  key: string
  label: string
}
