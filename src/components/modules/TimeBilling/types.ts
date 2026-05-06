// ============================================================
// TimeBilling Module – Types for Serbian ERP (Reflection Business)
// ============================================================

// ---------- Enums / Constants ----------

export type BillingStatus = "unbilled" | "billed" | "invoiced" | "paid";
export type InvoiceStatus = "draft" | "sent" | "paid" | "overdue" | "cancelled";
export type PaymentTerms = "net15" | "net30" | "net45" | "net60" | "on_receipt";

export const BILLING_STATUS_LABELS: Record<BillingStatus, string> = {
  unbilled: "Нефактurисано",
  billed: "Фактurисано",
  invoiced: "Фактurисано",
  paid: "Плаћено",
};

export const BILLING_STATUS_COLORS: Record<BillingStatus, string> = {
  unbilled: "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300",
  billed: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
  invoiced:
    "bg-violet-100 text-violet-800 dark:bg-violet-900 dark:text-violet-300",
  paid: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
};

export const INVOICE_STATUS_LABELS: Record<InvoiceStatus, string> = {
  draft: "Припрема",
  sent: "Послата",
  paid: "Плаћена",
  overdue: "Закаснела",
  cancelled: "Отказана",
};

export const INVOICE_STATUS_COLORS: Record<InvoiceStatus, string> = {
  draft: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300",
  sent: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
  paid: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
  overdue: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
  cancelled:
    "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400",
};

export const PAYMENT_TERMS_LABELS: Record<PaymentTerms, string> = {
  net15: "15 дана",
  net30: "30 дана",
  net45: "45 дана",
  net60: "60 дана",
  on_receipt: "По пријему",
};

// ---------- Core Entities ----------

export interface Client {
  id: string;
  name: string;
  pib: string; // ПИБ – Порески идентификациони број
  mb: string; // МБ – Матични број
  address: string;
  city: string;
  defaultRate: number; // RSD per hour
  isActive: boolean;
}

export interface Project {
  id: string;
  clientId: string;
  name: string;
  code: string; // e.g. "PRJ-2024-001"
  description: string;
  hourlyRate: number; // project-specific rate in RSD
  isBillable: boolean;
  isCompleted: boolean;
  startDate: string;
  endDate: string | null;
}

export interface Employee {
  id: string;
  name: string;
  role: string;
  defaultRate: number; // RSD per hour
  isActive: boolean;
}

export interface TimeEntry {
  id: string;
  employeeId: string;
  clientId: string;
  projectId: string;
  date: string; // YYYY-MM-DD
  hours: number;
  rate: number; // RSD per hour (effective rate at time of entry)
  description: string;
  billingStatus: BillingStatus;
  invoiceId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Invoice {
  id: string;
  invoiceNumber: string; // e.g. "Fakt-2024-001"
  clientId: string;
  projectId: string | null;
  issueDate: string;
  dueDate: string;
  paymentTerms: PaymentTerms;
  items: InvoiceItem[];
  subtotal: number; // pre-PDV
  pdvRate: number; // e.g. 20
  pdvAmount: number;
  total: number; // subtotal + pdvAmount
  status: InvoiceStatus;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export interface InvoiceItem {
  id: string;
  timeEntryId: string;
  description: string;
  hours: number;
  rate: number;
  total: number;
}
// ---------- Settings ----------

export interface TimeBillingSettings {
  defaultHourlyRate: number; // RSD
  pdvRate: number; // e.g. 20 (%)
  paymentTerms: PaymentTerms;
  currency: string; // always 'RSD'
  invoicePrefix: string; // e.g. "Fakt"
  nextInvoiceNumber: number;
  roundTo: "none" | "0.5" | "1"; // rounding for hours
  workDayHours: number; // e.g. 8
}
// ---------- Report Types ----------

export interface RevenueByClient {
  clientId: string;
  clientName: string;
  totalHours: number;
  totalRevenue: number;
  totalPDV: number;
  invoiceCount: number;
}

export interface RevenueByProject {
  projectId: string;
  projectName: string;
  clientName: string;
  totalHours: number;
  totalRevenue: number;
  totalPDV: number;
}

export interface RevenueByEmployee {
  employeeId: string;
  employeeName: string;
  totalHours: number;
  totalRevenue: number;
  billableHours: number;
  nonBillableHours: number;
}

export interface MonthlySummary {
  month: string; // "2024-01"
  label: string; // "Јануар 2024"
  totalHours: number;
  totalRevenue: number;
  invoiceCount: number;
  paidAmount: number;
  outstandingAmount: number;
}
// ---------- Form / DTO types ----------

export type TimeEntryFormData = Omit<
  TimeEntry,
  "id" | "billingStatus" | "invoiceId" | "createdAt" | "updatedAt"
>;
export type InvoiceFormData = Omit<
  Invoice,
  | "id"
  | "invoiceNumber"
  | "subtotal"
  | "pdvAmount"
  | "total"
  | "status"
  | "createdAt"
  | "updatedAt"
>;
export type SettingsFormData = Omit<TimeBillingSettings, "currency">;

// ---------- API response ----------

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  total: number;
  page: number;
  pageSize: number;
}
