export interface Product {
  id: string; name: string; sku: string; currentStock: number; isActive: boolean;
  purchasePrice: number; sellingPrice: number; minStock: number; category: string | null;

}
export interface WarehouseLocation {
  id: string; name: string; code: string; type: string; parentId: string | null; isActive: boolean;

}
export interface StockMovement {
  id: string; productId: string; type: string; quantity: number; date: string; notes: string | null;

}
export interface LotData {
  id: string; lotNumber: string; quantity: number; expiryDate: string | null
  locationId: string | null; purchaseDate: string; purchasePrice: number
  supplier: string | null; notes: string | null
  product: { name: string; sku: string }

}
export interface InventoryCountData {
  id: string; name: string; status: string; startDate: string | null; endDate: string | null
  countedBy: string | null; notes: string | null; createdAt: string
  location: { name: string; code: string }

}