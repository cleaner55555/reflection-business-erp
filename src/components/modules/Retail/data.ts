// Retail POS helper types
export interface CartItem {
  productId: string
  name: string
  quantity: number
  unitPrice: number
  discountPct: number
  taxRate: number
  maxStock: number
}

export function calculateSubtotal(cart: CartItem[]): number {
  return cart.reduce((s, i) => {
    const lineTotal = i.quantity * i.unitPrice * (1 - i.discountPct / 100)
    return s + lineTotal / (1 + i.taxRate / 100)
  }, 0)
}

export function calculateTaxTotal(cart: CartItem[]): number {
  return cart.reduce((s, i) => {
    const lineTotal = i.quantity * i.unitPrice * (1 - i.discountPct / 100)
    return s + lineTotal - lineTotal / (1 + i.taxRate / 100)
  }, 0)
}

export function calculateTotal(cart: CartItem[]): number {
  return cart.reduce((s, i) => s + i.quantity * i.unitPrice * (1 - i.discountPct / 100), 0)
}

export function countItems(cart: CartItem[]): number {
  return cart.reduce((s, i) => s + i.quantity, 0)
}
