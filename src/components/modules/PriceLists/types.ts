export type PriceListItem = {
  id: string; name: string; category: string
  type: 'retail' | 'wholesale' | 'special'
  validFrom: string; validUntil: string; items: number
  status: 'active' | 'draft' | 'archived'
  createdBy: string; notes: string
}
