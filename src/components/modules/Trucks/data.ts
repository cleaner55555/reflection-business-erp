// ============================================================
// Truck Fleet Management — Reflection Business ERP
// Mock data, constants, option lists, and helper functions
// Vozni park · Registracija · Održavanje · Troškovi
// ============================================================

import type {
  Truck,
  TruckStatus,
  FuelType,
  MaintenanceType,
  CostType,
  MaintenanceRecord,
  TruckCost,
  RegistrationItem,
  FleetStats,
  MonthlyCost,
  RegStatus,
} from './types'

// ────────────────────────────────────────────────────────────
// OPTION LISTS (for select dropdowns)
// ────────────────────────────────────────────────────────────

/** Fuel type options for the Serbian market */
export const FUEL_TYPE_OPTIONS: { value: FuelType; label: string }[] = [
  { value: 'dizel', label: 'Дизел' },
  { value: 'benzin', label: 'Бензин' },
  { value: 'gas', label: 'TNG (гас)' },
  { value: 'hibrid', label: 'Хибрид' },
  { value: 'elektricni', label: 'Електрични' },
]

/** Truck status options with badge colors */
export const STATUS_OPTIONS: { value: TruckStatus; label: string; color: string }[] = [
  { value: 'aktivan', label: 'Активан', color: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-300' },
  { value: 'na_servisu', label: 'На сервису', color: 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300' },
  { value: 'u_garazi', label: 'У гаражи', color: 'bg-sky-100 text-sky-800 dark:bg-sky-900 dark:text-sky-300' },
  { value: 'kvar', label: 'Квар', color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300' },
  { value: 'prodato', label: 'Продато', color: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300' },
]

/** Maintenance type options */
export const MAINTENANCE_TYPE_OPTIONS: { value: MaintenanceType; label: string }[] = [
  { value: 'redovni_servis', label: 'Редовни сервис' },
  { value: 'promena_ulja', label: 'Промена уља' },
  { value: 'promena_guma', label: 'Промена гума' },
  { value: 'tehnicki_pregled', label: 'Технички преглед' },
  { value: 'registracija', label: 'Регистрација' },
  { value: 'klima_servis', label: 'Клима сервис' },
  { value: 'kocioni_sistem', label: 'Кочни систем' },
  { value: 'motor', label: 'Мотор' },
  { value: 'menjac', label: 'Мењач' },
  { value: 'elektrika', label: 'Електрика' },
  { value: 'karoserija', label: 'Каросерија' },
  { value: 'adr_oprema', label: 'ADR опрема' },
  { value: 'ostalo', label: 'Остало' },
]

/** Cost / expense type options */
export const COST_TYPE_OPTIONS: { value: CostType; label: string }[] = [
  { value: 'gorivo', label: 'Гориво' },
  { value: 'putarina', label: 'Путарина' },
  { value: 'parking', label: 'Паркинг' },
  { value: 'servis', label: 'Сервис' },
  { value: 'delovi', label: 'Делови' },
  { value: 'osiguranje', label: 'Осигурање' },
  { value: 'registracija', label: 'Регистрација' },
  { value: 'tehnicki', label: 'Тех. преглед' },
  { value: 'gume', label: 'Гуме' },
  { value: 'podmazivanje', label: 'Подмазивање' },
  { value: 'adr_oprema', label: 'ADR опрема' },
  { value: 'ostalo', label: 'Остало' },
]

/** Truck make options (popular European & Asian brands in Serbia) */
export const MAKE_OPTIONS = [
  'Mercedes-Benz', 'MAN', 'Scania', 'Volvo', 'DAF',
  'Iveco', 'Renault Trucks', 'Tatra', 'FAW', 'Hyundai',
  'Isuzu', 'Mitsubishi Fuso', 'Caterpillar', 'Sinotruk',
  'TAM', 'FAP',
]

/** Serbian month abbreviations for charts */
export const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'Maj', 'Jun', 'Jul', 'Avg', 'Sep', 'Okt', 'Nov', 'Dec']

// ────────────────────────────────────────────────────────────
// MOCK DATA — FLEET (8 trucks)
// ────────────────────────────────────────────────────────────

export const MOCK_TRUCKS: Truck[] = [
  {
    id: 'truck-001',
    plate: 'БГ-001-AB',
    make: 'Mercedes-Benz',
    model: 'Actros 1845',
    year: 2021,
    vin: 'WDB9540121K123456',
    fuelType: 'dizel',
    status: 'aktivan',
    mileage: 245000,
    driver: 'Мирко Петровић',
    registrationExpiry: '2025-06-15',
    techInspectionExpiry: '2025-03-20',
    insuranceExpiry: '2025-01-10',
    notes: 'ADR опрема уграђена. Камион за међународни транспорт.',
    companyId: 'comp-001',
    createdAt: '2023-03-15T10:00:00Z',
    updatedAt: '2024-11-01T08:30:00Z',
    totalCosts: 2850000,
    lastServiceDate: '2024-10-15',
    nextServiceDue: '2025-01-15',
  },
  {
    id: 'truck-002',
    plate: 'БГ-012-CD',
    make: 'MAN',
    model: 'TGX 18.500',
    year: 2020,
    vin: 'WMAH34ZZ0CL567890',
    fuelType: 'dizel',
    status: 'aktivan',
    mileage: 312000,
    driver: 'Ненад Николић',
    registrationExpiry: '2025-09-22',
    techInspectionExpiry: '2025-05-10',
    insuranceExpiry: '2025-04-18',
    notes: 'Хладњача — транспорт хране. Температура -18°C.',
    companyId: 'comp-001',
    createdAt: '2023-05-20T14:00:00Z',
    updatedAt: '2024-10-28T16:45:00Z',
    totalCosts: 3420000,
    lastServiceDate: '2024-09-20',
    nextServiceDue: '2024-12-20',
  },
  {
    id: 'truck-003',
    plate: 'НС-045-EF',
    make: 'Scania',
    model: 'R450',
    year: 2019,
    vin: 'YS2R4X2000M345678',
    fuelType: 'dizel',
    status: 'na_servisu',
    mileage: 428000,
    driver: 'Слободан Јовановић',
    registrationExpiry: '2025-11-05',
    techInspectionExpiry: '2025-02-28',
    insuranceExpiry: '2025-07-01',
    notes: 'Промена мотора у току. Сервис Auto-Lend.',
    companyId: 'comp-001',
    createdAt: '2022-08-10T09:15:00Z',
    updatedAt: '2024-11-05T11:20:00Z',
    totalCosts: 4150000,
    lastServiceDate: '2024-11-05',
    nextServiceDue: '2025-02-05',
  },
  {
    id: 'truck-004',
    plate: 'НИ-078-GH',
    make: 'Volvo',
    model: 'FH 500',
    year: 2022,
    vin: 'YV2RT40A1PA456789',
    fuelType: 'dizel',
    status: 'aktivan',
    mileage: 178000,
    driver: 'Драган Станковић',
    registrationExpiry: '2026-03-12',
    techInspectionExpiry: '2026-01-15',
    insuranceExpiry: '2025-08-20',
    notes: 'Нов камион. GPS праћење уграђено.',
    companyId: 'comp-001',
    createdAt: '2023-01-10T08:00:00Z',
    updatedAt: '2024-11-01T07:00:00Z',
    totalCosts: 1250000,
    lastServiceDate: '2024-08-10',
    nextServiceDue: '2024-11-10',
  },
  {
    id: 'truck-005',
    plate: 'КГ-023-IJ',
    make: 'DAF',
    model: 'XF 480',
    year: 2018,
    vin: 'XLRDS45Y0L5678901',
    fuelType: 'dizel',
    status: 'kvar',
    mileage: 520000,
    driver: 'Живорад Милосављевић',
    registrationExpiry: '2025-04-18',
    techInspectionExpiry: '2025-01-30',
    insuranceExpiry: '2025-02-15',
    notes: 'Пукнуће пнеуматика на аутопуту. Чека се Tow.',
    companyId: 'comp-001',
    createdAt: '2022-03-25T12:00:00Z',
    updatedAt: '2024-11-06T15:30:00Z',
    totalCosts: 5180000,
    lastServiceDate: '2024-07-22',
    nextServiceDue: '2024-10-22',
  },
  {
    id: 'truck-006',
    plate: 'СУ-056-KL',
    make: 'Iveco',
    model: 'Hi-Way 500',
    year: 2021,
    vin: 'ZCFC135A006789012',
    fuelType: 'gas',
    status: 'aktivan',
    mileage: 198000,
    driver: 'Милан Тодић',
    registrationExpiry: '2025-12-01',
    techInspectionExpiry: '2025-06-10',
    insuranceExpiry: '2025-05-22',
    notes: 'TNG погон — еколошки. Цистерна за гориво.',
    companyId: 'comp-001',
    createdAt: '2023-06-15T10:30:00Z',
    updatedAt: '2024-10-30T09:00:00Z',
    totalCosts: 1890000,
    lastServiceDate: '2024-09-15',
    nextServiceDue: '2024-12-15',
  },
  {
    id: 'truck-007',
    plate: 'БГ-089-MN',
    make: 'Renault Trucks',
    model: 'T High 460',
    year: 2023,
    vin: 'VR6TEHYZLN7890123',
    fuelType: 'dizel',
    status: 'u_garazi',
    mileage: 85000,
    driver: '',
    registrationExpiry: '2026-07-20',
    techInspectionExpiry: '2026-05-15',
    insuranceExpiry: '2026-03-01',
    notes: 'Резервни камион. Нема додељеног возача.',
    companyId: 'comp-001',
    createdAt: '2024-01-20T08:45:00Z',
    updatedAt: '2024-11-01T10:00:00Z',
    totalCosts: 620000,
    lastServiceDate: '2024-10-20',
    nextServiceDue: '2025-01-20',
  },
  {
    id: 'truck-008',
    plate: 'НС-101-OP',
    make: 'Tatra',
    model: 'Phoenix 28',
    year: 2017,
    vin: 'TATPHO17P89012345',
    fuelType: 'dizel',
    status: 'prodato',
    mileage: 680000,
    driver: '',
    registrationExpiry: '2024-08-15',
    techInspectionExpiry: '2024-06-01',
    insuranceExpiry: '2024-05-10',
    notes: 'Продато августу 2024. Завршна књига.',
    companyId: 'comp-001',
    createdAt: '2021-04-10T07:00:00Z',
    updatedAt: '2024-08-15T14:00:00Z',
    totalCosts: 7200000,
    lastServiceDate: '2024-05-01',
    nextServiceDue: '',
  },
]

// ────────────────────────────────────────────────────────────
// MOCK DATA — MAINTENANCE RECORDS
// ────────────────────────────────────────────────────────────

export const MOCK_MAINTENANCE: MaintenanceRecord[] = [
  {
    id: 'mnt-001', truckId: 'truck-001', truckPlate: 'БГ-001-AB',
    type: 'redovni_servis', description: 'Велики сервис — замена уља, филтера, кочница',
    date: '2024-10-15', cost: 85000, mileage: 240000,
    workshop: 'Auto-Lend d.o.o.', nextDueDate: '2025-01-15', nextDueMileage: 260000,
    status: 'zavrseno', createdAt: '2024-10-15T10:00:00Z',
  },
  {
    id: 'mnt-002', truckId: 'truck-001', truckPlate: 'БГ-001-AB',
    type: 'promena_guma', description: 'Зимске гуме — Комплетна сета 6+1',
    date: '2024-11-01', cost: 320000, mileage: 245000,
    workshop: 'Вулканизер Марко', nextDueDate: '2025-04-01', nextDueMileage: 290000,
    status: 'zavrseno', createdAt: '2024-11-01T09:00:00Z',
  },
  {
    id: 'mnt-003', truckId: 'truck-002', truckPlate: 'БГ-012-CD',
    type: 'redovni_servis', description: 'Мали сервис + контрола хладњаче',
    date: '2024-09-20', cost: 65000, mileage: 305000,
    workshop: 'Фриго Сервис НС', nextDueDate: '2024-12-20', nextDueMileage: 325000,
    status: 'zavrseno', createdAt: '2024-09-20T11:00:00Z',
  },
  {
    id: 'mnt-004', truckId: 'truck-003', truckPlate: 'НС-045-EF',
    type: 'motor', description: 'Генерални ремонт мотора — замена главе',
    date: '2024-11-05', cost: 450000, mileage: 428000,
    workshop: 'Auto-Lend d.o.o.', nextDueDate: '2025-02-05', nextDueMileage: 448000,
    status: 'u_toku', createdAt: '2024-11-05T08:00:00Z',
  },
  {
    id: 'mnt-005', truckId: 'truck-004', truckPlate: 'НИ-078-GH',
    type: 'promena_ulja', description: 'Замена моторног уља + филтери',
    date: '2024-08-10', cost: 35000, mileage: 165000,
    workshop: 'Volvo Service BG', nextDueDate: '2024-11-10', nextDueMileage: 185000,
    status: 'zavrseno', createdAt: '2024-08-10T13:00:00Z',
  },
  {
    id: 'mnt-006', truckId: 'truck-005', truckPlate: 'КГ-023-IJ',
    type: 'kocioni_sistem', description: 'Замена кочних плочица и дискова',
    date: '2024-07-22', cost: 72000, mileage: 510000,
    workshop: 'Камион Сервис Крагујевац', nextDueDate: '2024-10-22', nextDueMileage: 540000,
    status: 'zavrseno', createdAt: '2024-07-22T10:00:00Z',
  },
  {
    id: 'mnt-007', truckId: 'truck-006', truckPlate: 'СУ-056-KL',
    type: 'redovni_servis', description: 'TNG систем контрола + редовни сервис',
    date: '2024-09-15', cost: 55000, mileage: 190000,
    workshop: 'Iveco Servis Subotica', nextDueDate: '2024-12-15', nextDueMileage: 210000,
    status: 'zavrseno', createdAt: '2024-09-15T14:30:00Z',
  },
]

// ────────────────────────────────────────────────────────────
// MOCK DATA — COSTS / EXPENSES
// ────────────────────────────────────────────────────────────

export const MOCK_COSTS: TruckCost[] = [
  { id: 'cost-001', truckId: 'truck-001', truckPlate: 'БГ-001-AB', type: 'gorivo', description: 'Дизел — аутопут БГ-НС', date: '2024-11-01', amount: 28500, mileage: 245200, documentRef: 'RAC-2024-1101', supplier: 'OMV Београд', createdAt: '2024-11-01T16:00:00Z' },
  { id: 'cost-002', truckId: 'truck-001', truckPlate: 'БГ-001-AB', type: 'putarina', description: 'Путарина БГ-Суботица', date: '2024-11-01', amount: 3200, mileage: 245300, documentRef: '', supplier: 'Пут СРБИЈЕ', createdAt: '2024-11-01T16:00:00Z' },
  { id: 'cost-003', truckId: 'truck-002', truckPlate: 'БГ-012-CD', type: 'gorivo', description: 'Дизел — рута БГ-ЦХ', date: '2024-10-28', amount: 42000, mileage: 312500, documentRef: 'RAC-2024-1028', supplier: 'Lukoil', createdAt: '2024-10-28T18:00:00Z' },
  { id: 'cost-004', truckId: 'truck-002', truckPlate: 'БГ-012-CD', type: 'parking', description: 'Паркинг одмориште Градишка', date: '2024-10-28', amount: 800, mileage: 312600, documentRef: '', supplier: 'Одмориште Градишка', createdAt: '2024-10-28T18:00:00Z' },
  { id: 'cost-005', truckId: 'truck-004', truckPlate: 'НИ-078-GH', type: 'gorivo', description: 'Дизел — Ниш-Софија', date: '2024-10-30', amount: 31000, mileage: 178100, documentRef: 'RAC-2024-1030', supplier: 'Gazprom Ниш', createdAt: '2024-10-30T12:00:00Z' },
  { id: 'cost-006', truckId: 'truck-005', truckPlate: 'КГ-023-IJ', type: 'gorivo', description: 'Дизел — Крагујевац-БГ', date: '2024-11-06', amount: 18500, mileage: 520100, documentRef: 'RAC-2024-1106', supplier: 'NIS Petrol', createdAt: '2024-11-06T10:00:00Z' },
  { id: 'cost-007', truckId: 'truck-006', truckPlate: 'СУ-056-KL', type: 'gorivo', description: 'TNG пуњење', date: '2024-10-30', amount: 22000, mileage: 198200, documentRef: 'RAC-2024-1030', supplier: 'Srbijagas', createdAt: '2024-10-30T15:00:00Z' },
  { id: 'cost-008', truckId: 'truck-001', truckPlate: 'БГ-001-AB', type: 'osiguranje', description: 'Каско осигурање годишње', date: '2024-01-10', amount: 185000, mileage: 200000, documentRef: 'POL-2024-001', supplier: 'DDOR Нови Сад', createdAt: '2024-01-10T09:00:00Z' },
  { id: 'cost-009', truckId: 'truck-003', truckPlate: 'НС-045-EF', type: 'servis', description: 'Припрема мотора за ремонт', date: '2024-11-05', amount: 450000, mileage: 428000, documentRef: 'RAC-2024-1105', supplier: 'Auto-Lend d.o.o.', createdAt: '2024-11-05T08:00:00Z' },
  { id: 'cost-010', truckId: 'truck-007', truckPlate: 'БГ-089-MN', type: 'registracija', description: 'Регистрација камиона', date: '2024-07-20', amount: 12500, mileage: 60000, documentRef: 'RG-2024-0720', supplier: 'МУП Београд', createdAt: '2024-07-20T10:00:00Z' },
]

// ────────────────────────────────────────────────────────────
// DERIVED DATA GENERATORS
// ────────────────────────────────────────────────────────────

/** Generate registration tracking items from truck data */
export function generateRegistrationItems(trucks: Truck[]): RegistrationItem[] {
  const items: RegistrationItem[] = []
  const now = new Date()

  trucks.forEach((truck) => {
    const docTypes: Array<{ key: 'registracija' | 'tehnicki' | 'osiguranje'; dateField: string }> = [
      { key: 'registracija', dateField: 'registrationExpiry' },
      { key: 'tehnicki', dateField: 'techInspectionExpiry' },
      { key: 'osiguranje', dateField: 'insuranceExpiry' },
    ]

    docTypes.forEach(({ key, dateField }) => {
      const expiryDate = truck[dateField] as string
      if (!expiryDate) return

      const expiry = new Date(expiryDate)
      const daysRemaining = Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

      let status: RegStatus = 'važeće'
      if (daysRemaining < 0) status = 'isteklo'
      else if (daysRemaining <= 30) status = 'ističe_uskoro'

      const costMap: Record<string, number> = { osiguranje: 185000, registracija: 12500, tehnicki: 8000 }

      items.push({
        id: `reg-${truck.id}-${key}`,
        truckId: truck.id,
        truckPlate: truck.plate,
        type: key,
        expiryDate,
        issueDate: new Date(expiry.getTime() - 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        cost: costMap[key] || 0,
        documentNumber: `DOC-${truck.plate.substring(0, 2)}-2024`,
        status,
        daysRemaining,
      })
    })
  })

  return items.sort((a, b) => a.daysRemaining - b.daysRemaining)
}

// ────────────────────────────────────────────────────────────
// FORMATTING HELPERS
// ────────────────────────────────────────────────────────────

/** Format number as RSD currency (Serbian Dinar) */
export function formatRSD(amount: number): string {
  return new Intl.NumberFormat('sr-RS', {
    style: 'currency',
    currency: 'RSD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

/** Format short RSD for compact display */
export function formatRSDShort(amount: number): string {
  if (amount >= 1_000_000) return `${(amount / 1_000_000).toFixed(1)}M RSD`
  if (amount >= 1_000) return `${(amount / 1_000).toFixed(0)}K RSD`
  return `${amount} RSD`
}

/** Format date string to Serbian locale (DD.MM.YYYY) */
export function formatDate(dateStr: string): string {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString('sr-RS', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

/** Format mileage with thousand separator */
export function formatMileage(km: number): string {
  return new Intl.NumberFormat('sr-RS').format(km) + ' km'
}

// ────────────────────────────────────────────────────────────
// LABEL / COLOR HELPERS
// ────────────────────────────────────────────────────────────

/** Get days remaining from a date string */
export function getDaysRemaining(dateStr: string): number {
  if (!dateStr) return -999
  const now = new Date()
  now.setHours(0, 0, 0, 0)
  const target = new Date(dateStr)
  target.setHours(0, 0, 0, 0)
  return Math.ceil((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
}

/** Get status badge CSS class */
export function getStatusBadgeClass(status: TruckStatus): string {
  return STATUS_OPTIONS.find((s) => s.value === status)?.color || ''
}

/** Get human-readable status label */
export function getStatusLabel(status: TruckStatus): string {
  return STATUS_OPTIONS.find((s) => s.value === status)?.label || status
}

/** Get fuel type label */
export function getFuelLabel(fuelType: FuelType): string {
  return FUEL_TYPE_OPTIONS.find((f) => f.value === fuelType)?.label || fuelType
}

/** Get maintenance type label */
export function getMaintenanceLabel(type: MaintenanceType): string {
  return MAINTENANCE_TYPE_OPTIONS.find((m) => m.value === type)?.label || type
}

/** Get cost type label */
export function getCostLabel(type: CostType): string {
  return COST_TYPE_OPTIONS.find((c) => c.value === type)?.label || type
}

/** Get registration document type label */
export function getRegTypeLabel(type: string): string {
  const map: Record<string, string> = {
    registracija: 'Регистрација',
    tehnicki: 'Тех. преглед',
    osiguranje: 'Осигурање',
  }
  return map[type] || type
}

/** Get registration status badge color */
export function getRegStatusColor(status: RegStatus): string {
  const map: Record<RegStatus, string> = {
    'važeće': 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-300',
    'ističe_uskoro': 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300',
    'isteklo': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
  }
  return map[status] || ''
}

/** Get registration status label */
export function getRegStatusLabel(status: RegStatus): string {
  const map: Record<RegStatus, string> = {
    'važeće': 'Важи',
    'ističe_uskoro': 'Истиче ускоро',
    'isteklo': 'Истекло',
  }
  return map[status] || status
}

/** Get maintenance status badge color */
export function getMaintenanceStatusColor(status: string): string {
  const map: Record<string, string> = {
    zavrseno: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-300',
    u_toku: 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300',
    zakazano: 'bg-sky-100 text-sky-800 dark:bg-sky-900 dark:text-sky-300',
    otkazano: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300',
  }
  return map[status] || ''
}

/** Get maintenance status label */
export function getMaintenanceStatusLabel(status: string): string {
  const map: Record<string, string> = {
    zavrseno: 'Завршено',
    u_toku: 'У току',
    zakazano: 'Заказано',
    otkazano: 'Отказано',
  }
  return map[status] || status
}

// ────────────────────────────────────────────────────────────
// FLEET STATISTICS CALCULATOR
// ────────────────────────────────────────────────────────────

/** Calculate aggregated fleet statistics from raw data */
export function calculateFleetStats(
  trucks: Truck[],
  maintenance: MaintenanceRecord[],
  costs: TruckCost[]
): FleetStats {
  const now = new Date()

  const activeTrucks = trucks.filter((t) => t.status === 'aktivan').length
  const inService = trucks.filter((t) => t.status === 'na_servisu').length
  const inGarage = trucks.filter((t) => t.status === 'u_garazi').length
  const breakdowns = trucks.filter((t) => t.status === 'kvar').length
  const sold = trucks.filter((t) => t.status === 'prodato').length

  const totalMileage = trucks.reduce((s, t) => s + t.mileage, 0)
  const avgMileage = trucks.length > 0 ? Math.round(totalMileage / trucks.length) : 0

  const totalCosts = costs.reduce((s, c) => s + c.amount, 0)
  const fuelCosts = costs.filter((c) => c.type === 'gorivo').reduce((s, c) => s + c.amount, 0)
  const serviceCosts = maintenance.reduce((s, m) => s + m.cost, 0)

  // Count maintenance due (active or overdue)
  const maintenanceDueCount = maintenance.filter((m) => {
    if (m.status !== 'zavrseno') return true
    if (m.nextDueDate) {
      const due = new Date(m.nextDueDate)
      return due <= new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)
    }
    return false
  }).length

  // Count registration due within 30 days
  const registrationDueCount = trucks.filter((t) => {
    const days = getDaysRemaining(t.registrationExpiry)
    return days <= 30 && days > -999
  }).length

  // Count insurance due within 30 days
  const insuranceDueCount = trucks.filter((t) => {
    const days = getDaysRemaining(t.insuranceExpiry)
    return days <= 30 && days > -999
  }).length

  // Monthly costs breakdown (last 6 months)
  const monthlyCosts: MonthlyCost[] = []
  for (let i = 5; i >= 0; i--) {
    const month = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const monthKey = `${month.getFullYear()}-${String(month.getMonth() + 1).padStart(2, '0')}`
    const nextMonth = new Date(month.getFullYear(), month.getMonth() + 1, 1)

    const monthFuel = costs
      .filter((c) => c.type === 'gorivo' && new Date(c.date) >= month && new Date(c.date) < nextMonth)
      .reduce((s, c) => s + c.amount, 0)
    const monthService = maintenance
      .filter((m) => new Date(m.date) >= month && new Date(m.date) < nextMonth)
      .reduce((s, m) => s + m.cost, 0)
    const monthOther = costs
      .filter((c) => c.type !== 'gorivo' && new Date(c.date) >= month && new Date(c.date) < nextMonth)
      .reduce((s, c) => s + c.amount, 0)

    monthlyCosts.push({
      month: monthKey,
      fuel: monthFuel,
      service: monthService,
      other: monthOther,
      total: monthFuel + monthService + monthOther,
    })
  }

  return {
    totalTrucks: trucks.length,
    activeTrucks,
    inService,
    inGarage,
    breakdowns,
    sold,
    totalMileage,
    avgMileage,
    totalCosts,
    maintenanceDueCount,
    registrationDueCount,
    insuranceDueCount,
    fuelCostsTotal: fuelCosts,
    serviceCostsTotal: serviceCosts,
    monthlyCosts,
  }
}

// ────────────────────────────────────────────────────────────
// EMPTY FORM DEFAULTS
// ────────────────────────────────────────────────────────────

/** Default values for truck form */
export const EMPTY_TRUCK_FORM = {
  plate: '',
  make: '',
  model: '',
  year: new Date().getFullYear(),
  vin: '',
  fuelType: 'dizel' as FuelType,
  status: 'aktivan' as TruckStatus,
  mileage: 0,
  driver: '',
  registrationExpiry: '',
  techInspectionExpiry: '',
  insuranceExpiry: '',
  notes: '',
}

/** Default values for maintenance form */
export const EMPTY_MAINTENANCE_FORM = {
  truckId: '',
  type: 'redovni_servis' as MaintenanceType,
  description: '',
  date: new Date().toISOString().split('T')[0],
  cost: 0,
  mileage: 0,
  workshop: '',
  nextDueDate: '',
  nextDueMileage: 0,
  status: 'zakazano' as const,
}

/** Default values for cost form */
export const EMPTY_COST_FORM = {
  truckId: '',
  type: 'gorivo' as CostType,
  description: '',
  date: new Date().toISOString().split('T')[0],
  amount: 0,
  mileage: 0,
  documentRef: '',
  supplier: '',
}
