// ==================== LEGACY ACCOUNTING SCHEMA MAPPER ====================
// Comprehensive mapping of external accounting database tables/columns to our Prisma schema.
// Supports CSV import from various legacy accounting systems.

// ==================== TABLE MAPPINGS ====================

export interface LegacyFieldMapping {
  bnColumn: string
  ourField: string
  required: boolean
  transform?: 'string' | 'number' | 'date' | 'float'
}

export interface LegacyTableMapping {
  bnTable: string
  target: string
  label: string
  labelSr: string
  icon: string
  fields: Record<string, string>  // BN column → Our field
  fieldDefinitions: LegacyFieldMapping[]
}

export const LEGACY_TABLE_MAPPINGS: LegacyTableMapping[] = [
  // ==================== PARTNER ====================
  {
    bnTable: 'PARTNER',
    target: 'partners',
    label: 'Partners',
    labelSr: 'Партнери',
    icon: 'Users',
    fields: {
      'NAZIV': 'name',
      'PIB': 'pib',
      'MATICNIBROJ': 'maticniBr',
      'ADRESA': 'address',
      'MESTO': 'city',
      'POSTBR': 'zipCode',
      'TELEFON': 'phone',
      'EMAIL': 'email',
      'ZIRO': 'account',
      'BANKA': 'bank',
      'TIP_PARTNERA': 'type',
      'MOBILNI': 'phone',
      'FAX': 'phone',
      'WEB_STRANICA': 'notes',
      'KONTAKT_OSOBA': 'notes',
      'NAPOMENA': 'notes',
      'SIFRA': 'pib', // fallback if PIB empty
    },
    fieldDefinitions: [
      { bnColumn: 'NAZIV', ourField: 'name', required: true, transform: 'string' },
      { bnColumn: 'PIB', ourField: 'pib', required: false, transform: 'string' },
      { bnColumn: 'MATICNIBROJ', ourField: 'maticniBr', required: false, transform: 'string' },
      { bnColumn: 'ADRESA', ourField: 'address', required: false, transform: 'string' },
      { bnColumn: 'MESTO', ourField: 'city', required: false, transform: 'string' },
      { bnColumn: 'POSTBR', ourField: 'zipCode', required: false, transform: 'string' },
      { bnColumn: 'TELEFON', ourField: 'phone', required: false, transform: 'string' },
      { bnColumn: 'EMAIL', ourField: 'email', required: false, transform: 'string' },
      { bnColumn: 'ZIRO', ourField: 'account', required: false, transform: 'string' },
      { bnColumn: 'BANKA', ourField: 'bank', required: false, transform: 'string' },
    ],
  },

  // ==================== ROBA (Products) ====================
  {
    bnTable: 'ROBA',
    target: 'products',
    label: 'Products',
    labelSr: 'Артикли',
    icon: 'Package',
    fields: {
      'NAZIV': 'name',
      'SIFRA': 'sku',
      'BAR_KOD': 'barcode',
      'GRUPA': 'category',
      'JED_MERE': 'unit',
      'JEDMERE': 'unit',
      'NABAV_CENA': 'purchasePrice',
      'PROD_CENA': 'sellingPrice',
      'MIN_ZALIHA': 'minStock',
      'ZALIHA': 'currentStock',
      'OPIS': 'description',
      'AKTIVNA': 'isActive',
    },
    fieldDefinitions: [
      { bnColumn: 'NAZIV', ourField: 'name', required: true, transform: 'string' },
      { bnColumn: 'SIFRA', ourField: 'sku', required: true, transform: 'string' },
      { bnColumn: 'BAR_KOD', ourField: 'barcode', required: false, transform: 'string' },
      { bnColumn: 'GRUPA', ourField: 'category', required: false, transform: 'string' },
      { bnColumn: 'JED_MERE', ourField: 'unit', required: false, transform: 'string' },
      { bnColumn: 'NABAV_CENA', ourField: 'purchasePrice', required: false, transform: 'float' },
      { bnColumn: 'PROD_CENA', ourField: 'sellingPrice', required: false, transform: 'float' },
      { bnColumn: 'MIN_ZALIHA', ourField: 'minStock', required: false, transform: 'number' },
      { bnColumn: 'ZALIHA', ourField: 'currentStock', required: false, transform: 'number' },
    ],
  },

  // ==================== DOKUMENT (Invoices) ====================
  {
    bnTable: 'DOKUMENT',
    target: 'invoices',
    label: 'Invoices',
    labelSr: 'Фактуре',
    icon: 'FileText',
    fields: {
      'BROJ': 'number',
      'DATUM': 'date',
      'DATUM_VALUTE': 'dueDate',
      'UKUPNO': 'totalAmount',
      'POREZ': 'taxAmount',
      'TIP_DOKumenta': 'type',
      'STATUS': 'status',
      'PARTNER_ID': 'partnerId',
      'PARTNER_NAZIV': 'partnerName',
      'NAPOMENA': 'notes',
    },
    fieldDefinitions: [
      { bnColumn: 'BROJ', ourField: 'number', required: true, transform: 'string' },
      { bnColumn: 'DATUM', ourField: 'date', required: true, transform: 'date' },
      { bnColumn: 'DATUM_VALUTE', ourField: 'dueDate', required: false, transform: 'date' },
      { bnColumn: 'UKUPNO', ourField: 'totalAmount', required: false, transform: 'float' },
      { bnColumn: 'POREZ', ourField: 'taxAmount', required: false, transform: 'float' },
    ],
  },

  // ==================== DOKUMENT_STAVKA (Invoice Items) ====================
  {
    bnTable: 'DOKUMENT_STAVKA',
    target: 'invoice_items',
    label: 'Invoice Items',
    labelSr: 'Ставке фактура',
    icon: 'List',
    fields: {
      'KOLICINA': 'quantity',
      'CENA': 'unitPrice',
      'RABAT': 'discountPct',
      'POREZ_STOPA': 'taxRate',
      'ROBA_SIFRA': 'productSku',
      'ROBA_NAZIV': 'productName',
      'DOKUMENT_ID': 'documentId',
      'UKUPNO': 'total',
    },
    fieldDefinitions: [
      { bnColumn: 'KOLICINA', ourField: 'quantity', required: true, transform: 'float' },
      { bnColumn: 'CENA', ourField: 'unitPrice', required: true, transform: 'float' },
      { bnColumn: 'RABAT', ourField: 'discountPct', required: false, transform: 'float' },
      { bnColumn: 'POREZ_STOPA', ourField: 'taxRate', required: false, transform: 'float' },
    ],
  },

  // ==================== GRUPE (Categories) ====================
  {
    bnTable: 'GRUPE',
    target: 'categories',
    label: 'Categories',
    labelSr: 'Категорије',
    icon: 'FolderTree',
    fields: {
      'NAZIV': 'name',
      'SIFRA': 'code',
      'OPIS': 'description',
    },
    fieldDefinitions: [
      { bnColumn: 'NAZIV', ourField: 'name', required: true, transform: 'string' },
      { bnColumn: 'SIFRA', ourField: 'code', required: false, transform: 'string' },
    ],
  },

  // ==================== KONTAKTI ====================
  {
    bnTable: 'KONTAKT',
    target: 'contacts',
    label: 'Contacts',
    labelSr: 'Контакти',
    icon: 'Contact',
    fields: {
      'IME': 'firstName',
      'PREZIME': 'lastName',
      'EMAIL': 'email',
      'TELEFON': 'phone',
      'POZICIJA': 'position',
      'PARTNER_ID': 'companyId',
      'NAPOMENA': 'notes',
      'MOBILNI': 'phone',
    },
    fieldDefinitions: [
      { bnColumn: 'IME', ourField: 'firstName', required: true, transform: 'string' },
      { bnColumn: 'PREZIME', ourField: 'lastName', required: true, transform: 'string' },
      { bnColumn: 'EMAIL', ourField: 'email', required: false, transform: 'string' },
      { bnColumn: 'TELEFON', ourField: 'phone', required: false, transform: 'string' },
    ],
  },
]

// ==================== QUICK LOOKUP MAPS ====================

// BN column name → Our field name (for auto-mapping)
export const LEGACY_COLUMN_TO_FIELD: Record<string, string> = {}
for (const mapping of LEGACY_TABLE_MAPPINGS) {
  for (const [bnCol, ourField] of Object.entries(mapping.fields)) {
    if (!LEGACY_COLUMN_TO_FIELD[bnCol]) {
      LEGACY_COLUMN_TO_FIELD[bnCol] = ourField
    }
  }
}

// Our field name → human-readable label
export const LEGACY_FIELD_LABELS: Record<string, string> = {
  name: 'Name (naziv)',
  pib: 'PIB',
  maticniBr: 'Matični broj',
  address: 'Adresa',
  city: 'Град',
  zipCode: 'Поштански број',
  phone: 'Телефон',
  email: 'Е-мејл',
  account: 'Жиро рачун',
  bank: 'Банка',
  type: 'Тип',
  notes: 'Напомене',
  sku: 'Шифра (SKU)',
  barcode: 'Бар-код',
  category: 'Категорија',
  unit: 'Јединица мере',
  purchasePrice: 'Набавна цена',
  sellingPrice: 'Продажна цена',
  minStock: 'Мин. залиха',
  currentStock: 'Тренутна залиха',
  description: 'Опис',
  isActive: 'Активан',
  number: 'Број',
  date: 'Датум',
  dueDate: 'Датум доспећа',
  totalAmount: 'Укупан износ',
  taxAmount: 'Порез',
  status: 'Статус',
  partnerName: 'Назив партнера',
  quantity: 'Количина',
  unitPrice: 'Јединична цена',
  discountPct: 'Попуст (%)',
  taxRate: 'Пореска стопа (%)',
  productSku: 'Шифра артикла',
  productName: 'Назив артикла',
  total: 'Укупно',
  code: 'Шифра',
  firstName: 'Име',
  lastName: 'Презиме',
  position: 'Позиција',
  companyId: 'Фирма',
}

// ==================== ENTITY DETECTION ====================

// Detect BN table from CSV filename
export function detectLegacyTableFromFilename(filename: string): LegacyTableMapping | null {
  const normalized = filename.toLowerCase().replace(/[^a-z0-9_]/g, '')

  const aliases: Record<string, string[]> = {
    PARTNER: ['partner', 'partneri', 'klijenti', 'dobavljaci', 'partners'],
    ROBA: ['roba', 'artikli', 'proizvodi', 'products', 'artikal'],
    DOKUMENT: ['dokument', 'faktura', 'fakture', 'invoice', 'invoices', 'racun', 'racuni'],
    DOKUMENT_STAVKA: ['stavke', 'dokument_stavka', 'invoice_items', 'stavkafakture'],
    GRUPE: ['grupe', 'kategorije', 'categories', 'group'],
    KONTAKT: ['kontakt', 'kontakti', 'contacts', 'contact'],
  }

  for (const [table, fileAliases] of Object.entries(aliases)) {
    for (const alias of fileAliases) {
      if (normalized.includes(alias)) {
        return LEGACY_TABLE_MAPPINGS.find(m => m.bnTable === table) || null
      }
    }
  }

  return null
}

// ==================== VALUE TRANSFORMERS ====================

export function transformValue(value: string | null | undefined, type: 'string' | 'number' | 'date' | 'float'): any {
  if (value === null || value === undefined || value === '') {
    switch (type) {
      case 'string': return ''
      case 'number': return 0
      case 'float': return 0.0
      case 'date': return null
    }
  }

  const trimmed = String(value).trim()

  switch (type) {
    case 'string':
      return trimmed

    case 'number': {
      const n = parseInt(trimmed.replace(/[.,]/g, ''), 10)
      return isNaN(n) ? 0 : n
    }

    case 'float': {
      // Handle European number format: 1.234,56 → 1234.56
      const cleaned = trimmed.replace(/\./g, '').replace(',', '.')
      const n = parseFloat(cleaned)
      return isNaN(n) ? 0.0 : Math.round(n * 100) / 100
    }

    case 'date': {
      if (!trimmed) return null
      // Try common date formats
      const patterns = [
        /^(\d{2})\.(\d{2})\.(\d{4})/, // DD.MM.YYYY
        /^(\d{4})-(\d{2})-(\d{2})/,   // YYYY-MM-DD
        /^(\d{2})\/(\d{2})\/(\d{4})/, // DD/MM/YYYY
        /^(\d{1,2})\.(\d{1,2})\.(\d{4})/, // D.M.YYYY
      ]

      for (const pattern of patterns) {
        const match = trimmed.match(pattern)
        if (match) {
          if (pattern === patterns[1]) {
            // YYYY-MM-DD
            return new Date(parseInt(match[1]), parseInt(match[2]) - 1, parseInt(match[3])).toISOString()
          }
          // DD.MM.YYYY or DD/MM/YYYY
          return new Date(parseInt(match[3]), parseInt(match[2]) - 1, parseInt(match[1])).toISOString()
        }
      }

      // Fallback: try native Date parsing
      const d = new Date(trimmed)
      return isNaN(d.getTime()) ? null : d.toISOString()
    }
  }
}

// ==================== CSV PARSING ====================

export interface LegacyCSVData {
  headers: string[]
  rows: Record<string, string>[]
  totalRows: number
  fileName: string
  detectedTable: LegacyTableMapping | null
  autoMapping: Record<string, string>  // csv header → our field
}

function detectDelimiter(text: string): string {
  const firstLine = text.split('\n')[0] || ''
  const tabCount = (firstLine.match(/\t/g) || []).length
  const semicolonCount = (firstLine.match(/;/g) || []).length
  const commaCount = (firstLine.match(/,/g) || []).length

  if (tabCount > semicolonCount && tabCount > commaCount) return '\t'
  if (semicolonCount > commaCount) return ';'
  return ','
}

function parseCSVLine(line: string, delimiter: string): string[] {
  const result: string[] = []
  let current = ''
  let inQuotes = false

  for (let i = 0; i < line.length; i++) {
    const char = line[i]
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"'
        i++
      } else {
        inQuotes = !inQuotes
      }
    } else if (char === delimiter && !inQuotes) {
      result.push(current.trim())
      current = ''
    } else {
      current += char
    }
  }
  result.push(current.trim())

  return result
}

export function parseLegacyCSV(content: string, fileName: string): LegacyCSVData {
  const delimiter = detectDelimiter(content)
  const lines = content.split(/\r?\n/).filter(l => l.trim().length > 0)

  if (lines.length < 2) {
    return {
      headers: [],
      rows: [],
      totalRows: 0,
      fileName,
      detectedTable: null,
      autoMapping: {},
    }
  }

  const headers = parseCSVLine(lines[0], delimiter)
  const rows: Record<string, string>[] = []

  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i], delimiter)
    const row: Record<string, string> = {}
    headers.forEach((h, idx) => {
      row[h] = values[idx] || ''
    })
    rows.push(row)
  }

  // Detect target table from filename
  const detectedTable = detectLegacyTableFromFilename(fileName)

  // Build auto-mapping: CSV header → our field
  const autoMapping: Record<string, string> = {}
  if (detectedTable) {
    for (const header of headers) {
      const upperHeader = header.toUpperCase().trim()
      if (detectedTable.fields[upperHeader]) {
        autoMapping[header] = detectedTable.fields[upperHeader]
      } else {
        // Try fuzzy match
        const matchedKey = Object.keys(detectedTable.fields).find(
          k => k.includes(upperHeader) || upperHeader.includes(k)
        )
        if (matchedKey) {
          autoMapping[header] = detectedTable.fields[matchedKey]
        }
      }
    }
  }

  return {
    headers,
    rows,
    totalRows: rows.length,
    fileName,
    detectedTable,
    autoMapping,
  }
}

// ==================== IMPORT VALIDATION ====================

export interface ImportValidation {
  isValid: boolean
  errors: string[]
  warnings: string[]
  requiredFieldsPresent: string[]
  requiredFieldsMissing: string[]
}

export function validateLegacyImport(
  csvData: LegacyCSVData,
  targetEntity: string,
  fieldMapping: Record<string, string>
): ImportValidation {
  const errors: string[] = []
  const warnings: string[] = []
  const present: string[] = []
  const missing: string[] = []

  const mapping = LEGACY_TABLE_MAPPINGS.find(m => m.target === targetEntity)

  if (!mapping) {
    errors.push(`Unknown target entity: ${targetEntity}`)
    return { isValid: false, errors, warnings, requiredFieldsPresent: [], requiredFieldsMissing: [] }
  }

  const requiredFields = mapping.fieldDefinitions.filter(f => f.required)

  for (const req of requiredFields) {
    // Check if any CSV header maps to this required field
    const isMapped = Object.entries(fieldMapping).some(([, ourField]) => ourField === req.ourField)
    if (isMapped) {
      present.push(req.ourField)
    } else {
      missing.push(req.ourField)
      errors.push(`Required field "${req.ourField}" (${req.bnColumn}) is not mapped`)
    }
  }

  if (csvData.totalRows === 0) {
    warnings.push('CSV file has no data rows')
  }

  return {
    isValid: missing.length === 0,
    errors,
    warnings,
    requiredFieldsPresent: present,
    requiredFieldsMissing: missing,
  }
}
