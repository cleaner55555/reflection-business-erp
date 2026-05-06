export interface EntityField {
  key: string
  label: string
  required: boolean
}

export interface ParsedFile {
  columns: string[]
  rows: Record<string, string>[]
  totalRows: number
  fileName: string
}

export interface ImportError {
  row: number
  field: string
  message: string
}

export interface ImportResult {
  totalRows: number
  successRows: number
  failedRows: number
  status: JobStatus
  errors?: ImportError[]
}

export interface IntegrationJob {
  id: string
  type: 'import' | 'export'
  entityType: string
  source: string
  status: JobStatus
  totalRows: number
  successRows: number
  failedRows: number
  errors: string | null
  createdAt: string
  fileName?: string | null
}

export interface SyncConnector {
  id: string
  name: string
  type: string
  direction: string
  isActive: boolean
  status: string
  hostUrl: string | null
  apiKey: string | null
  username: string | null
  database: string | null
  syncInterval: number
  syncEntities: string
  lastSyncAt: string | null
  lastSyncStatus: string | null
  totalSyncs: number
  totalRecords: number
  notes: string | null
  createdAt: string
}

export type EntityType = 'partners' | 'products' | 'transactions' | 'contacts'
type SourceType = 'custom' | 'external_accounting_1' | 'external_accounting_2' | 'external_accounting_3' | 'einvoice_system' | 'enterprise_erp' | 'reflection'
type ImportStep = 1 | 2 | 3
type JobStatus = 'completed' | 'partial' | 'failed' | 'pending'

interface EntityField {
  key: string
  label: string
  required: boolean
}

interface ParsedFile {
  columns: string[]
  rows: Record<string, string>[]
  totalRows: number
  fileName: string
}

interface ImportError {
  row: number
  field: string
  message: string
}

interface ImportResult {
  totalRows: number
  successRows: number
  failedRows: number
  status: JobStatus
  errors?: ImportError[]
}

interface IntegrationJob {
  id: string
  type: 'import' | 'export'
  entityType: string
  source: string
  status: JobStatus
  totalRows: number
  successRows: number
  failedRows: number
  errors: string | null
  createdAt: string
  fileName?: string | null
}

interface SyncConnector {
  id: string
  name: string
  type: string
  direction: string
  isActive: boolean
  status: string
  hostUrl: string | null
  apiKey: string | null
  username: string | null
  database: string | null
  syncInterval: number
  syncEntities: string
  lastSyncAt: string | null
  lastSyncStatus: string | null
  totalSyncs: number
  totalRecords: number
  notes: string | null
  createdAt: string
}

const CONNECTOR_TYPES: Record<string, string> = {
  external_accounting_1: 'Spoljni knjigovodstveni sistem 1',
  external_accounting_2: 'Spoljni knjigovodstveni sistem 2',
  external_accounting_3: 'Spoljni knjigovodstveni sistem 3',
  einvoice_system: 'eFakturisanje (SEF)',
  enterprise_erp: 'Enterprise ERP',
  external_accounting_4: 'Spoljni knjigovodstveni sistem 4',
  custom_api: 'Custom API',
}

const ENTITY_OPTIONS = [
  { value: 'partners', label: 'Partners' },
  { value: 'products', label: 'Products' },
  { value: 'transactions', label: 'Transactions' },
  { value: 'contacts', label: 'Contacts' },
  { value: 'invoices', label: 'Invoices' },
  { value: 'stock', label: 'Stock' },
  { value: 'employees', label: 'Employees' },
]

// ==================== ENTITY FIELDS ====================

const ENTITY_FIELDS: Record<EntityType, EntityField[]> = {
  partners: [
    { key: 'name', label: 'Name (naziv)', required: true },
    { key: 'pib', label: 'PIB', required: false },
    { key: 'maticniBr', label: 'Matični broj', required: false },
    { key: 'address', label: 'Address', required: false },
    { key: 'city', label: 'City', required: false },
    { key: 'zipCode', label: 'Zip code', required: false },
    { key: 'phone', label: 'Phone', required: false },
    { key: 'email', label: 'Email', required: false },
    { key: 'type', label: 'Type (kupac/dobavljac)', required: false },
    { key: 'account', label: 'Bank account', required: false },
    { key: 'bank', label: 'Bank', required: false },
    { key: 'notes', label: 'Notes', required: false },
  ],
  products: [
    { key: 'name', label: 'Name (naziv)', required: true },
    { key: 'sku', label: 'SKU (šifra)', required: true },
    { key: 'barcode', label: 'Barcode', required: false },
    { key: 'category', label: 'Category', required: false },
    { key: 'unit', label: 'Unit (kom/kg/l)', required: false },
    { key: 'purchasePrice', label: 'Purchase price', required: false },
    { key: 'sellingPrice', label: 'Selling price', required: false },
    { key: 'minStock', label: 'Min stock', required: false },
    { key: 'currentStock', label: 'Current stock', required: false },
    { key: 'description', label: 'Description', required: false },
  ],
  transactions: [
    { key: 'date', label: 'Date', required: true },
    { key: 'type', label: 'Type (prihod/rashod)', required: true },
    { key: 'category', label: 'Category', required: true },
    { key: 'amount', label: 'Amount', required: true },
    { key: 'description', label: 'Description', required: true },
    { key: 'documentRef', label: 'Document ref', required: false },
  ],
  contacts: [
    { key: 'firstName', label: 'First name', required: true },
    { key: 'lastName', label: 'Last name', required: true },
    { key: 'email', label: 'Email', required: false },
    { key: 'phone', label: 'Phone', required: false },
    { key: 'position', label: 'Position', required: false },
    { key: 'company', label: 'Company', required: false },
    { key: 'notes', label: 'Notes', required: false },
    { key: 'tags', label: 'Tags', required: false },
  ],
}

// ==================== MAIN COMPONENT ====================
