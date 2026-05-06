import type { ReturnItem } from "./types";

export const INITIAL_DATA: ReturnItem[] = [
  {
    id: "1",
    returnNumber: "RET-2024-001",
    orderNumber: "ORD-4521",
    customerName: "Jelena Marković",
    customerEmail: "jelena@email.com",
    customerPhone: "+381 63 111 2222",
    status: "received",
    returnReason: "defective",
    items: [
      {
        productName: "Bluetooth zvučnik",
        sku: "BTS-001",
        quantity: 1,
        unitPrice: 8990,
        condition: "used",
      },
    ],
    refundAmount: 8990,
    refundMethod: "original",
    shippingCost: 450,
    restockingFee: 0,
    netRefund: 8990,
    requestedDate: "2024-06-12",
    receivedDate: "2024-06-14",
    processedDate: null,
    notes: "Zvučnik ne radi - distorzija zvuka",
    internalNotes: "Poslato za inspekciju kvaliteta",
  },
  {
    id: "2",
    returnNumber: "RET-2024-002",
    orderNumber: "ORD-4518",
    customerName: "Stefan Ilić",
    customerEmail: "stefan@email.com",
    customerPhone: "+381 64 333 4444",
    status: "refunded",
    returnReason: "wrong_item",
    items: [
      {
        productName: "Tenisice vel. 43",
        sku: "SHO-043",
        quantity: 1,
        unitPrice: 12500,
        condition: "new",
      },
      {
        productName: "Tenisice vel. 44",
        sku: "SHO-044",
        quantity: 1,
        unitPrice: 12500,
        condition: "new",
      },
    ],
    refundAmount: 25000,
    refundMethod: "original",
    shippingCost: 0,
    restockingFee: 0,
    netRefund: 25000,
    requestedDate: "2024-06-10",
    receivedDate: "2024-06-12",
    processedDate: "2024-06-13",
    notes: "Stigla pogrešna veličina (42 umesto 43 i 44)",
    internalNotes: "Greška magacionera - kompenzacija za transport",
  },
  {
    id: "3",
    returnNumber: "RET-2024-003",
    orderNumber: "ORD-4525",
    customerName: "Ana Đorđević",
    customerEmail: "ana@email.com",
    customerPhone: "+381 65 555 6666",
    status: "requested",
    returnReason: "change_of_mind",
    items: [
      {
        productName: "Majica - crna",
        sku: "TSH-BLK",
        quantity: 2,
        unitPrice: 2490,
        condition: "new",
      },
    ],
    refundAmount: 4980,
    refundMethod: "store_credit",
    shippingCost: 450,
    restockingFee: 250,
    netRefund: 4280,
    requestedDate: "2024-06-15",
    receivedDate: null,
    processedDate: null,
    notes: "Nije odgovara veličina",
    internalNotes: "",
  },
  {
    id: "4",
    returnNumber: "RET-2024-004",
    orderNumber: "ORD-4510",
    customerName: "Petar Stanković",
    customerEmail: "petar@email.com",
    customerPhone: "+381 66 777 8888",
    status: "rejected",
    returnReason: "not_as_described",
    items: [
      {
        productName: "Drvena stolica",
        sku: "CHR-W01",
        quantity: 2,
        unitPrice: 18500,
        condition: "damaged",
      },
    ],
    refundAmount: 0,
    refundMethod: "original",
    shippingCost: 0,
    restockingFee: 0,
    netRefund: 0,
    requestedDate: "2024-06-08",
    receivedDate: "2024-06-10",
    processedDate: "2024-06-11",
    notes: "Stolica je oštećena pri transportu",
    internalNotes:
      "Oštećenje nije naša greška - kupac je odbio da plati transport povratka",
  },
  {
    id: "5",
    returnNumber: "RET-2024-005",
    orderNumber: "ORD-4505",
    customerName: "Miroslav Jovanović",
    customerEmail: "miroslav@email.com",
    customerPhone: "+381 62 999 0000",
    status: "inspecting",
    returnReason: "warranty",
    items: [
      {
        productName: "Bosch bušilica",
        sku: "DRL-BOS01",
        quantity: 1,
        unitPrice: 35900,
        condition: "used",
      },
    ],
    refundAmount: 35900,
    refundMethod: "replacement",
    shippingCost: 0,
    restockingFee: 0,
    netRefund: 0,
    requestedDate: "2024-06-13",
    receivedDate: "2024-06-14",
    processedDate: null,
    notes: "Garancija 2 godine - motor ne radi",
    internalNotes: "Poslato servisu Bosch za dijagnostiku",
  },
  {
    id: "6",
    returnNumber: "RET-2024-006",
    orderNumber: "ORD-4530",
    customerName: "Ljubica Perić",
    customerEmail: "ljubica@email.com",
    customerPhone: "+381 61 123 4567",
    status: "exchanged",
    returnReason: "damaged",
    items: [
      {
        productName: "Keramičke šolje set (6 kom)",
        sku: "CUP-SET6",
        quantity: 1,
        unitPrice: 4200,
        condition: "damaged",
      },
    ],
    refundAmount: 0,
    refundMethod: "replacement",
    shippingCost: 0,
    restockingFee: 0,
    netRefund: 4200,
    requestedDate: "2024-06-11",
    receivedDate: "2024-06-13",
    processedDate: "2024-06-14",
    notes: "2 šolje nastradale u transportu",
    internalNotes: "Zamena poslata - nove šolje pakovane bolje",
  },
];

export const STATUSES: Record<string, { color: string; label: string }> = {
  requested: {
    color: "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300",
    label: "Zahtev",
  },
  approved: {
    color: "bg-sky-100 text-sky-800 dark:bg-sky-900 dark:text-sky-300",
    label: "Odobren",
  },
  rejected: {
    color: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
    label: "Odbijen",
  },
  received: {
    color: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
    label: "Primljen",
  },
  inspecting: {
    color: "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300",
    label: "Inspekcija",
  },
  refunded: {
    color:
      "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-300",
    label: "Refundiran",
  },
  exchanged: {
    color:
      "bg-violet-100 text-violet-800 dark:bg-violet-900 dark:text-violet-300",
    label: "Zamena",
  },
  completed: {
    color:
      "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-300",
    label: "Završeno",
  },
};

export const REASONS: Record<string, { label: string }> = {
  defective: { label: "Defektan" },
  wrong_item: { label: "Pogrešan artikal" },
  damaged: { label: "Oštećen" },
  not_as_described: { label: "Nije po opisu" },
  change_of_mind: { label: "Promena mišljenja" },
  warranty: { label: "Garancija" },
  other: { label: "Ostalo" },
};

export const REFUND_METHODS: Record<string, { label: string }> = {
  original: { label: "Originalna plaćanja" },
  store_credit: { label: "Bon kupovine" },
  bank_transfer: { label: "Bankovni transfer" },
  replacement: { label: "Zamena" },
};

export function formatCurrency(n: number) {
  return new Intl.NumberFormat("sr-RS", {
    style: "currency",
    currency: "RSD",
    minimumFractionDigits: 0,
  }).format(n);
}
