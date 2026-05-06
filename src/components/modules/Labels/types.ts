export type LabelItem = {
  id: string; name: string; sku: string
  category: 'product' | 'shipping' | 'promotion' | 'barcode' | 'qr' | 'price' | 'warning' | 'ingredient'
  status: 'active' | 'inactive'
  size: string; material: string; color: string
  quantity: number; costPerUnit: number; printDate: string; notes: string
}
