import type {
  Client, Project, Employee,
  TimeBillingSettings,
} from './types'

// ---------- Default Settings ----------

export const DEFAULT_SETTINGS: TimeBillingSettings = {
  defaultHourlyRate: 5000,
  pdvRate: 20,
  paymentTerms: 'net30',
  currency: 'RSD',
  invoicePrefix: 'Fakt',
  nextInvoiceNumber: 1,
  roundTo: '0.5',
  workDayHours: 8,
}

// ---------- Mock Clients ----------

export const mockClients: Client[] = [
  { id: 'cl-1', name: 'Delta Inženjering DOO', pib: '108001234', mb: '20045678', address: 'Булевар Михајла Пупина 10', city: 'Београд', defaultRate: 5500, isActive: true },
  { id: 'cl-2', name: 'Nexe Telekomunikacije DOO', pib: '108005678', mb: '20078901', address: 'Улица Краља Милана 24', city: 'Нови Сад', defaultRate: 6000, isActive: true },
  { id: 'cl-3', name: 'Vega Solutions DOO', pib: '108009012', mb: '20012345', address: 'Студентски трг 5', city: 'Ниш', defaultRate: 4500, isActive: true },
  { id: 'cl-4', name: 'Alfa Banka AD', pib: '108001345', mb: '20123456', address: 'Теразије 3', city: 'Београд', defaultRate: 7000, isActive: true },
  { id: 'cl-5', name: 'Horizont Invest DOO', pib: '108001678', mb: '20034567', address: 'Булевар ослобођења 85', city: 'Суботица', defaultRate: 4800, isActive: false },
]

// ---------- Mock Projects ----------

export const mockProjects: Project[] = [
  { id: 'pr-1', clientId: 'cl-1', name: 'ERP Мigracija', code: 'PRJ-2024-001', description: 'Миграција старог ERP система на нову платформу', hourlyRate: 5500, isBillable: true, isCompleted: false, startDate: '2024-01-15', endDate: null },
  { id: 'pr-2', clientId: 'cl-2', name: 'Мобилна апликација', code: 'PRJ-2024-002', description: 'Развој мобилне апликације за клијенте', hourlyRate: 6000, isBillable: true, isCompleted: false, startDate: '2024-02-01', endDate: '2024-06-30' },
  { id: 'pr-3', clientId: 'cl-3', name: 'Web Портал', code: 'PRJ-2024-003', description: 'Корпоративни web портал', hourlyRate: 4500, isBillable: true, isCompleted: true, startDate: '2023-09-01', endDate: '2024-03-31' },
  { id: 'pr-4', clientId: 'cl-4', name: 'Безбедносни аудит', code: 'PRJ-2024-004', description: 'Безбедносни аудит и поправке', hourlyRate: 7000, isBillable: true, isCompleted: false, startDate: '2024-03-10', endDate: null },
  { id: 'pr-5', clientId: 'cl-1', name: 'CRM Интеграција', code: 'PRJ-2024-005', description: 'Интеграција CRM са ERP системом', hourlyRate: 5200, isBillable: true, isCompleted: false, startDate: '2024-04-01', endDate: null },
]

// ---------- Mock Employees ----------

export const mockEmployees: Employee[] = [
  { id: 'emp-1', name: 'Марко Петровић', role: 'Сениор програмер', defaultRate: 5500, isActive: true },
  { id: 'emp-2', name: 'Јована Николић', role: 'Програмер', defaultRate: 4500, isActive: true },
  { id: 'emp-3', name: 'Александар Стојановић', role: 'Пројект менаџер', defaultRate: 6500, isActive: true },
  { id: 'emp-4', name: 'Маја Јовановић', role: 'UI/UX Дизајнер', defaultRate: 5000, isActive: true },
  { id: 'emp-5', name: 'Ненад Ристић', role: 'QA Инжењер', defaultRate: 4000, isActive: false },
]

// ---------- Formatting Helpers ----------

export function formatRSD(amount: number): string {
  return new Intl.NumberFormat('sr-RS', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount) + ' RSD'
}

export function formatHours(hours: number): string {
  return hours.toFixed(2).replace('.', ',')
}

export function formatDate(dateStr: string): string {
  return new Intl.DateTimeFormat('sr-RS', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(new Date(dateStr))
}

// ---------- Report Helpers ----------

export function calculateRevenueByClient() { return [] }
export function calculateRevenueByProject() { return [] }
export function calculateRevenueByEmployee() { return [] }
export function calculateMonthlySummary() { return [] }
