// ============ SERBIAN BUSINESS DATA, CONSTANTS & HELPERS ============

import type {
  PosProduct,
  ProductCategory,
  PaymentMethod,
  PdvRate,
  TransactionType,
  ReceiptLine,
  DailyStats,
  ShiftPaymentBreakdown,
} from "./types";

// ---- PDV TAX RATES (Serbia) ----
export const PDV_RATES: { value: PdvRate; label: string }[] = [
  { value: 10, label: "PDV 10%" },
  { value: 20, label: "PDV 20%" },
];
// ---- PAYMENT METHODS ----
export const PAYMENT_METHODS: {
  value: PaymentMethod;
  label: string;
  icon: string;
}[] = [
  { value: "gotovina", label: "Готовина", icon: "Banknote" },
  { value: "kartica", label: "Кирица", icon: "CreditCard" },
  { value: "tanjava", label: "Танрава", icon: "Smartphone" },
  { value: "virman", label: "Вирман", icon: "Building2" },
];
// ---- PRODUCT CATEGORIES ----
export const PRODUCT_CATEGORIES: { value: ProductCategory; label: string }[] = [
  { value: "hrana", label: "Храна" },
  { value: "pice", label: "Пиће" },
  { value: "tobako", label: "Дуван" },
  { value: "preparati", label: "Препарати" },
  { value: "kozmetika", label: "Козметика" },
  { value: "ostalo", label: "Остало" },
];
// ---- UNITS OF MEASURE ----
export const UNITS = ["kom", "kg", "l", "m", "pak", "torba"] as const;

// ---- TRANSACTION TYPES ----
export const TRANSACTION_TYPES: {
  value: TransactionType;
  label: string;
  color: string;
}[] = [
  {
    value: "ulaz",
    label: "Улаз",
    color: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
  },
  {
    value: "izlaz",
    label: "Излаз",
    color: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
  },
];
// ---- MOCK POS PRODUCTS ----
export const INITIAL_PRODUCTS: PosProduct[] = [
  {
    id: "p1",
    name: "Хлеб Београдски",
    barcode: "8606001001",
    price: 80,
    pdvRate: 10,
    category: "hrana",
    stock: 50,
    unit: "kom",
    isActive: true,
  },
  {
    id: "p2",
    name: "Млеко 1L (ИМЛЕК)",
    barcode: "8606101002",
    price: 140,
    pdvRate: 10,
    category: "hrana",
    stock: 30,
    unit: "kom",
    isActive: true,
  },
  {
    id: "p3",
    name: "Јогурт воћни 200г",
    barcode: "8606101003",
    price: 95,
    pdvRate: 10,
    category: "hrana",
    stock: 40,
    unit: "kom",
    isActive: true,
  },
  {
    id: "p4",
    name: "Сир крављи 200г",
    barcode: "8606101004",
    price: 220,
    pdvRate: 10,
    category: "hrana",
    stock: 20,
    unit: "kom",
    isActive: true,
  },
  {
    id: "p5",
    name: "Кобасица Сремска",
    barcode: "8606101005",
    price: 380,
    pdvRate: 20,
    category: "hrana",
    stock: 15,
    unit: "kg",
    isActive: true,
  },
  {
    id: "p6",
    name: "Шлага Кремфреш 200мл",
    barcode: "8606101006",
    price: 165,
    pdvRate: 20,
    category: "hrana",
    stock: 25,
    unit: "kom",
    isActive: true,
  },
  {
    id: "p7",
    name: "Кока-Кола 0.33L",
    barcode: "8606101007",
    price: 110,
    pdvRate: 20,
    category: "pice",
    stock: 100,
    unit: "kom",
    isActive: true,
  },
  {
    id: "p8",
    name: "Јелен Пиво 0.5L",
    barcode: "8606101008",
    price: 140,
    pdvRate: 20,
    category: "pice",
    stock: 80,
    unit: "kom",
    isActive: true,
  },
  {
    id: "p9",
    name: "Роса Вода 0.5L",
    barcode: "8606101009",
    price: 65,
    pdvRate: 20,
    category: "pice",
    stock: 200,
    unit: "kom",
    isActive: true,
  },
  {
    id: "p10",
    name: "Сок Јаффа 1L",
    barcode: "8606101010",
    price: 180,
    pdvRate: 20,
    category: "pice",
    stock: 60,
    unit: "kom",
    isActive: true,
  },
  {
    id: "p11",
    name: "Лук 1kg",
    barcode: "8606101011",
    price: 100,
    pdvRate: 10,
    category: "hrana",
    stock: 50,
    unit: "kg",
    isActive: true,
  },
  {
    id: "p12",
    name: "Кромпир 1kg",
    barcode: "8606101012",
    price: 75,
    pdvRate: 10,
    category: "hrana",
    stock: 100,
    unit: "kg",
    isActive: true,
  },
  {
    id: "p13",
    name: "Шећер 1kg",
    barcode: "8606101013",
    price: 120,
    pdvRate: 10,
    category: "hrana",
    stock: 40,
    unit: "kom",
    isActive: true,
  },
  {
    id: "p14",
    name: "Уље Сунцокрет 1L",
    barcode: "8606101014",
    price: 310,
    pdvRate: 10,
    category: "hrana",
    stock: 30,
    unit: "kom",
    isActive: true,
  },
  {
    id: "p15",
    name: "Чоколада Нештедо",
    barcode: "8606101015",
    price: 90,
    pdvRate: 20,
    category: "hrana",
    stock: 50,
    unit: "kom",
    isActive: true,
  },
  {
    id: "p16",
    name: "Кекс Напредак",
    barcode: "8606101016",
    price: 55,
    pdvRate: 20,
    category: "hrana",
    stock: 60,
    unit: "kom",
    isActive: true,
  },
  {
    id: "p17",
    name: "Цигаре Партисан",
    barcode: "8606101017",
    price: 280,
    pdvRate: 20,
    category: "tobako",
    stock: 100,
    unit: "pak",
    isActive: true,
  },
  {
    id: "p18",
    name: "Цигаре Дукат",
    barcode: "8606101018",
    price: 320,
    pdvRate: 20,
    category: "tobako",
    stock: 80,
    unit: "pak",
    isActive: true,
  },
  {
    id: "p19",
    name: "Шампон Хлербал",
    barcode: "8606101019",
    price: 350,
    pdvRate: 20,
    category: "kozmetika",
    stock: 20,
    unit: "kom",
    isActive: true,
  },
  {
    id: "p20",
    name: "Паста за зубе",
    barcode: "8606101020",
    price: 250,
    pdvRate: 20,
    category: "kozmetika",
    stock: 25,
    unit: "kom",
    isActive: true,
  },
  {
    id: "p21",
    name: "Аспирин 500мг",
    barcode: "8606101021",
    price: 85,
    pdvRate: 10,
    category: "preparati",
    stock: 40,
    unit: "kom",
    isActive: true,
  },
  {
    id: "p22",
    name: "Бранцерин 1L",
    barcode: "8606101022",
    price: 195,
    pdvRate: 20,
    category: "pice",
    stock: 30,
    unit: "kom",
    isActive: true,
  },
  {
    id: "p23",
    name: "Кафа Лео 250г",
    barcode: "8606101023",
    price: 420,
    pdvRate: 20,
    category: "hrana",
    stock: 35,
    unit: "kom",
    isActive: true,
  },
  {
    id: "p24",
    name: "Салвете 100kom",
    barcode: "8606101024",
    price: 130,
    pdvRate: 20,
    category: "ostalo",
    stock: 50,
    unit: "pak",
    isActive: true,
  },
];
// ---- COMPANY INFO (hardcoded for receipt) ----
export const COMPANY_INFO = {
  name: "Reflection Business DOO",
  address: "Кнез Михајлова 24, Београд",
  pib: "112345678",
  maticniBr: "21345678",
  account: "160-123456-78",
  bank: "Банка Интеза а.д. Београд",
};

// ---- HELPER: Format RSD currency ----
export function formatRsd(amount: number): string {
  return (
    amount.toLocaleString("sr-RS", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }) + " RSD"
  );
}
// ---- HELPER: Format date Serbian style ----
export function formatDateSr(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString("sr-RS", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}
// ---- HELPER: Format date-time Serbian style ----
export function formatDateTimeSr(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString("sr-RS", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
// ---- HELPER: Calculate PDV from gross amount ----
export function calcPdv(
  gross: number,
  pdvRate: PdvRate,
): { base: number; tax: number } {
  const base = (gross / (100 + pdvRate)) * 100;
  const tax = gross - base;
  return {
    base: Math.round(base * 100) / 100,
    tax: Math.round(tax * 100) / 100,
  };
}
// ---- HELPER: Generate receipt number ----
export function generateReceiptNumber(): string {
  const now = new Date();
  const y = now.getFullYear().toString().slice(-2);
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  const rand = Math.floor(Math.random() * 10000)
    .toString()
    .padStart(4, "0");
  return `RAC-${y}${m}${d}-${rand}`;
}
// ---- HELPER: Build receipt lines from cart ----
export function buildReceiptLines(
  items: { product: PosProduct; quantity: number }[],
): ReceiptLine[] {
  return items.map(({ product, quantity }) => {
    const lineGross = product.price * quantity;
    const { base, tax } = calcPdv(lineGross, product.pdvRate);
    return {
      productName: product.name,
      quantity,
      unitPrice: product.price,
      pdvRate: product.pdvRate,
      baseAmount: Math.round(base * 100) / 100,
      pdvAmount: Math.round(tax * 100) / 100,
      totalAmount: Math.round(lineGross * 100) / 100,
    };
  });
}
// ---- HELPER: Calculate daily stats from transactions ----
export function calculateDailyStats(
  transactions: {
    type: TransactionType;
    amount: number;
    paymentMethod: string;
  }[],
): DailyStats {
  const izlaz = transactions.filter((t) => t.type === "izlaz");
  const ulaz = transactions.filter((t) => t.type === "ulaz");
  const totalSales = izlaz.reduce((sum, t) => sum + t.amount, 0);
  const totalRefunds = ulaz.reduce((sum, t) => sum + t.amount, 0);

  return {
    dnevniPrihod: Math.round(totalSales * 100) / 100,
    brojRacuna: izlaz.length,
    prosek:
      izlaz.length > 0
        ? Math.round((totalSales / izlaz.length) * 100) / 100
        : 0,
    povrat: Math.round(totalRefunds * 100) / 100,
    pdv10: 0,
    pdv20: 0,
  };
}
// ---- HELPER: Get empty payment breakdown ----
export function emptyPayments(): ShiftPaymentBreakdown {
  return { gotovina: 0, kartica: 0, tanjava: 0, virman: 0 };
}
// ---- HELPER: Get today's date string YYYY-MM-DD ----
export function todayStr(): string {
  return new Date().toISOString().split("T")[0];
}
// ---- HELPER: Get payment method label ----
export function getPaymentLabel(method: PaymentMethod): string {
  const found = PAYMENT_METHODS.find((p) => p.value === method);
  return found ? found.label : method;
}
// ---- HELPER: Get category label ----
export function getCategoryLabel(cat: ProductCategory): string {
  const found = PRODUCT_CATEGORIES.find((c) => c.value === cat);
  return found ? found.label : cat;
}
// ---- HELPER: Get transaction type label ----
export function getTypeLabel(type: TransactionType): string {
  const found = TRANSACTION_TYPES.find((t) => t.value === type);
  return found ? found.label : type;
}
