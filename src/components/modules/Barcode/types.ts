export interface BarcodeItem {
  id: string
  code: string
  type: 'EAN13' | 'EAN8' | 'QR' | 'CODE128' | 'UPC'
  productName: string
  productId: string
  category: string
  createdAt: string
}
