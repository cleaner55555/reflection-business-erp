import type { ModuleType } from '@/lib/store'
import type { SearchResult, SearchGroup, SearchFilter } from './types'

export const RECENT_KEY = 'rb_recent_searches'
export const MAX_RECENT = 5

export function getFilters(): SearchFilter[] {
  return [
    { key: 'all', label: 'common.all' },
    { key: 'partners', label: 'sidebar.partners' },
    { key: 'products', label: 'warehouse.products' },
    { key: 'invoices', label: 'sidebar.invoices' },
    { key: 'contacts', label: 'crm.contacts' },
    { key: 'employees', label: 'sidebar.employees' },
  ]
}

export async function fetchSearchResults(
  searchQuery: string,
  activeFilter: string,
): Promise<SearchGroup[]> {
  const res = await fetch(
    `/api/search?q=${encodeURIComponent(searchQuery.trim())}&type=${activeFilter}`,
  )
  if (!res.ok) throw new Error('Search failed')
  const data = await res.json()

  const groups: SearchGroup[] = []

  if (data.partners?.length) {
    groups.push({
      type: 'partners',
      label: 'sidebar.partners',
      results: data.partners.map((p: Record<string, unknown>) => ({
        id: p.id as string,
        name: p.name as string,
        subtitle: (p.pib || p.city || '') as string,
        module: 'partneri' as ModuleType,
        icon: 'partner' as const,
      })),
    })
  }

  if (data.products?.length) {
    groups.push({
      type: 'products',
      label: 'sidebar.warehouse',
      results: data.products.map((p: Record<string, unknown>) => ({
        id: p.id as string,
        name: p.name as string,
        subtitle: (p.sku || '') as string,
        module: 'magacin' as ModuleType,
        icon: 'product' as const,
        meta: { amount: p.price as number | undefined },
      })),
    })
  }

  if (data.invoices?.length) {
    groups.push({
      type: 'invoices',
      label: 'sidebar.invoices',
      results: data.invoices.map((inv: Record<string, unknown>) => ({
        id: inv.id as string,
        name: inv.number as string,
        subtitle: (inv.partner_name || inv.subtitle || '') as string,
        module: 'fakture' as ModuleType,
        icon: 'invoice' as const,
        meta: {
          amount: inv.amount as number | undefined,
          status: inv.status as string | undefined,
        },
      })),
    })
  }

  if (data.contacts?.length) {
    groups.push({
      type: 'contacts',
      label: 'crm.contacts',
      results: data.contacts.map((c: Record<string, unknown>) => ({
        id: c.id as string,
        name: c.name as string,
        subtitle: (c.company || c.email || '') as string,
        module: 'crm' as ModuleType,
        icon: 'contact' as const,
        meta: {
          email: c.email as string | undefined,
          phone: c.phone as string | undefined,
        },
      })),
    })
  }

  if (data.employees?.length) {
    groups.push({
      type: 'employees',
      label: 'sidebar.employees',
      results: data.employees.map((e: Record<string, unknown>) => ({
        id: e.id as string,
        name: e.name as string,
        subtitle: (e.position || e.department || '') as string,
        module: 'zaposleni' as ModuleType,
        icon: 'employee' as const,
        meta: {
          email: e.email as string | undefined,
          phone: e.phone as string | undefined,
        },
      })),
    })
  }

  return groups
}
