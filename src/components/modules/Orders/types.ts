export type Order = {
  id: string; orderNo: string; client: string; date: string; deliveryDate: string
  type: 'purchase' | 'sale' | 'internal'
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
  items: number; totalAmount: number; warehouse: string; supplier: string
  priority: 'low' | 'medium' | 'high' | 'urgent'; notes: string
}
