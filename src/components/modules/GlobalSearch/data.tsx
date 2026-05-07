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

}