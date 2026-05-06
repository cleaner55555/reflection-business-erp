export type KitchenItem = {
  id: string
  name: string
  category: 'ingredient' | 'spice' | 'dairy' | 'meat' | 'vegetable' | 'fruit' | 'grain' | 'beverage' | 'condiment' | 'frozen' | 'packaging'
  unit: string
  quantity: number
  minQuantity: number
  maxQuantity: number
  unitPrice: number
  supplier: string
  storageArea: string
  expiryDate: string
  receivedDate: string
  status: 'in_stock' | 'low_stock' | 'out_of_stock' | 'expired'
  allergens: string[]
  notes: string
}
