// ============ TYPES FOR CASH REGISTER / POS MODULE ============

/** PDV tax rates used in Serbia */
export type PdvRate = 10 | 20;

/** Payment methods for POS */
export type PaymentMethod = "gotovina" | "kartica" | "tanjava" | "virman";

/** Shift status */
export type ShiftStatus = "otvorena" | "zatvorena";

/** Transaction type (cash flow direction) */
export type TransactionType = "ulaz" | "izlaz";

/** Product category for POS items */
export type ProductCategory =
  | "hrana"
  | "pice"
  | "tobako"
  | "preparati"
  | "kozmetika"
  | "ostalo";

/** POS product item */
export interface PosProduct {
  id: string;
  name: string;
  barcode: string;
  price: number;
  pdvRate: PdvRate;
  category: ProductCategory;
  stock: number;
  unit: string;
  isActive: boolean;
}

/** Item in the current shopping cart */
export interface CartItem {
  product: PosProduct;
  quantity: number;
}

/** Cash register transaction record (from DB) */
export interface CashTransaction {
  id: string;
  companyId?: string;
  date: string;
  type: TransactionType;
  amount: number;
  description: string;
  partnerName?: string | null;
  paymentMethod: PaymentMethod;
  createdAt?: string;
}

/** Receipt line item */
export interface ReceiptLine {
  productName: string;
  quantity: number;
  unitPrice: number;
  pdvRate: PdvRate;
  baseAmount: number;
  pdvAmount: number;
  totalAmount: number;
}

/** Full receipt for preview/print */
export interface Receipt {
  id: string;
  number: string;
  date: string;
  cashier: string;
  paymentMethod: PaymentMethod;
  lines: ReceiptLine[];
  subtotal: number;
  totalPdv: number;
  total: number;
  paid: number;
  change: number;
}

/** Shift model */
export interface Shift {
  id: string;
  cashier: string;
  openedAt: string;
  closedAt?: string;
  status: ShiftStatus;
  openingCash: number;
  closingCash?: number;
  expectedCash?: number;
  difference?: number;
  totalSales: number;
  totalRefunds: number;
  transactionCount: number;
  payments: ShiftPaymentBreakdown;
}

/** Payment breakdown per method */
export interface ShiftPaymentBreakdown {
  gotovina: number;
  kartica: number;
  tanjava: number;
  virman: number;
}

/** Daily stats summary */
export interface DailyStats {
  dnevniPrihod: number;
  brojRacuna: number;
  prosek: number;
  povrat: number;
  pdv10: number;
  pdv20: number;
}

/** Form data for adding/editing a transaction */
export interface TransactionFormData {
  type: TransactionType;
  amount: string;
  description: string;
  partnerName: string;
  paymentMethod: PaymentMethod;
  date: string;
}

/** Form data for adding/editing a product */
export interface ProductFormData {
  name: string;
  barcode: string;
  price: string;
  pdvRate: PdvRate;
  category: ProductCategory;
  stock: string;
  unit: string;
}

/** Filter state for transactions table */
export interface TransactionFilters {
  search: string;
  type: TransactionType | "";
  paymentMethod: PaymentMethod | "";
  dateFrom: string;
  dateTo: string;
}

/** Shift close form data */
export interface ShiftCloseData {
  countedCash: string;
  countedCard: string;
  notes: string;
}
