export type StoreItem = {
  id: string; name: string; code: string; city: string; address: string; phone: string; email: string; manager: string
  type: 'retail' | 'warehouse' | 'office' | 'factory'
  status: 'active' | 'closed' | 'renovation'
  openDate: string; area: number; employees: number; monthlyRevenue: number; notes: string
}
