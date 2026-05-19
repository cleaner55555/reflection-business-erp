import { describe, it, expect } from 'vitest'
import {
  generateCSV,
  parseCSV,
  getColumnMappings,
  getDataTypeLabel,
  mapImportColumns,
  transformImportRow,
} from './export-utils'

describe('generateCSV', () => {
  it('generates CSV with headers and data rows', () => {
    const columns = [
      { key: 'name', label: 'Naziv' },
      { key: 'amount', label: 'Iznos' },
    ]
    const data = [
      { name: 'Item 1', amount: 100 },
      { name: 'Item 2', amount: 200 },
    ]
    const csv = generateCSV(data, columns)
    const lines = csv.split('\n')
    expect(lines[0]).toBe('Naziv,Iznos')
    expect(lines[1]).toBe('Item 1,100')
    expect(lines[2]).toBe('Item 2,200')
  })

  it('escapes fields with commas in double quotes', () => {
    const columns = [{ key: 'desc', label: 'Opis' }]
    const data = [{ desc: 'Hello, world' }]
    const csv = generateCSV(data, columns)
    expect(csv).toContain('"Hello, world"')
  })

  it('escapes fields with quotes by doubling them', () => {
    const columns = [{ key: 'text', label: 'Text' }]
    const data = [{ text: 'say "hi"' }]
    const csv = generateCSV(data, columns)
    expect(csv).toContain('"say ""hi"""')
  })

  it('escapes fields with newlines', () => {
    const columns = [{ key: 'text', label: 'Text' }]
    const data = [{ text: 'line1\nline2' }]
    const csv = generateCSV(data, columns)
    expect(csv).toContain('"line1\nline2"')
  })

  it('handles null and undefined values as empty strings', () => {
    const columns = [{ key: 'val', label: 'Val' }]
    const data = [{ val: null }, { val: undefined }, { val: 'ok' }]
    const csv = generateCSV(data, columns as any)
    const lines = csv.split('\n')
    expect(lines[1]).toBe('')
    expect(lines[2]).toBe('')
    expect(lines[3]).toBe('ok')
  })

  it('applies transform function when provided', () => {
    const columns = [
      { key: 'amount', label: 'Iznos', transform: (v: unknown) => Number(v) * 2 },
    ]
    const data = [{ amount: 10 }]
    const csv = generateCSV(data, columns)
    expect(csv).toContain('20')
  })

  it('handles empty data array', () => {
    const columns = [{ key: 'name', label: 'Name' }]
    const csv = generateCSV([], columns)
    expect(csv).toBe('Name')
  })
})

describe('parseCSV', () => {
  it('parses a simple CSV string', () => {
    const csv = 'name,age\nJohn,30\nJane,25'
    const rows = parseCSV(csv)
    expect(rows).toHaveLength(2)
    expect(rows[0]).toEqual({ name: 'John', age: '30' })
    expect(rows[1]).toEqual({ name: 'Jane', age: '25' })
  })

  it('handles quoted fields', () => {
    const csv = 'name,desc\n"John, Jr.","Has a comma"'
    const rows = parseCSV(csv)
    expect(rows[0]).toEqual({ name: 'John, Jr.', desc: 'Has a comma' })
  })

  it('returns empty array for header-only CSV', () => {
    expect(parseCSV('name,age')).toEqual([])
  })

  it('returns empty array for empty string', () => {
    expect(parseCSV('')).toEqual([])
  })

  it('handles CRLF line endings', () => {
    const csv = 'a,b\r\n1,2\r\n3,4'
    const rows = parseCSV(csv)
    expect(rows).toHaveLength(2)
  })

  it('handles escaped quotes inside quoted fields', () => {
    const csv = 'text\n"say ""hello"""'
    const rows = parseCSV(csv)
    expect(rows[0].text).toBe('say "hello"')
  })
})

describe('getColumnMappings', () => {
  it('returns columns for invoices', () => {
    const cols = getColumnMappings('invoices')
    expect(cols.length).toBeGreaterThan(0)
    expect(cols[0].key).toBe('number')
    expect(cols[0].label).toBe('Broj fakture')
  })

  it('returns columns for contacts', () => {
    const cols = getColumnMappings('contacts')
    expect(cols.some(c => c.key === 'firstName')).toBe(true)
  })

  it('returns columns for products', () => {
    const cols = getColumnMappings('products')
    expect(cols.some(c => c.key === 'name')).toBe(true)
    expect(cols.some(c => c.key === 'sku')).toBe(true)
  })

  it('returns columns for employees', () => {
    const cols = getColumnMappings('employees')
    expect(cols.some(c => c.key === 'firstName')).toBe(true)
    expect(cols.some(c => c.key === 'baseSalary')).toBe(true)
  })

  it('returns columns for projects', () => {
    const cols = getColumnMappings('projects')
    expect(cols.some(c => c.key === 'name')).toBe(true)
    expect(cols.some(c => c.key === 'budget')).toBe(true)
  })

  it('returns empty array for unknown data type', () => {
    const cols = getColumnMappings('unknown' as any)
    expect(cols).toEqual([])
  })

  it('columns have required key and label', () => {
    const allTypes = ['invoices', 'contacts', 'products', 'employees', 'projects'] as const
    for (const type of allTypes) {
      for (const col of getColumnMappings(type)) {
        expect(col.key).toBeTruthy()
        expect(col.label).toBeTruthy()
      }
    }
  })
})

describe('getDataTypeLabel', () => {
  it('returns Serbian labels for data types', () => {
    expect(getDataTypeLabel('invoices')).toBe('Fakture')
    expect(getDataTypeLabel('contacts')).toBe('Kontakti')
    expect(getDataTypeLabel('products')).toBe('Proizvodi')
    expect(getDataTypeLabel('employees')).toBe('Zaposleni')
    expect(getDataTypeLabel('projects')).toBe('Projekti')
  })
})

describe('mapImportColumns', () => {
  it('maps exact field names', () => {
    const mappings = mapImportColumns(['firstName', 'lastName'], 'contacts')
    expect(mappings['firstName']).toBe('firstName')
    expect(mappings['lastName']).toBe('lastName')
  })

  it('maps Serbian labels to field names', () => {
    const mappings = mapImportColumns(['Ime', 'Prezime'], 'contacts')
    expect(mappings['Ime']).toBe('firstName')
    expect(mappings['Prezime']).toBe('lastName')
  })

  it('returns empty object for unrecognized headers', () => {
    const mappings = mapImportColumns(['xyz', 'abc'], 'contacts')
    expect(Object.keys(mappings)).toHaveLength(0)
  })

  it('maps product columns', () => {
    const mappings = mapImportColumns(['Naziv', 'Šifra (SKU)'], 'products')
    expect(mappings['Naziv']).toBe('name')
    expect(mappings['Šifra (SKU)']).toBe('sku')
  })
})

describe('transformImportRow', () => {
  it('maps columns and returns transformed row', () => {
    const row = { Ime: 'Widget', 'Šifra (SKU)': 'W-001', Cena: '100' }
    const colMap = { Ime: 'name', 'Šifra (SKU)': 'sku' }
    const result = transformImportRow(row, colMap, 'products')
    expect(result.name).toBe('Widget')
    expect(result.sku).toBe('W-001')
    // Cena is not in column mappings, so it's not included
    expect(result).not.toHaveProperty('Cena')
  })

  it('transforms product prices to numbers', () => {
    const row = { Naziv: 'Item', 'Nabavna cena': '500.50', 'Prodajna cena': '1000' }
    const colMap = { Naziv: 'name', 'Nabavna cena': 'purchasePrice', 'Prodajna cena': 'sellingPrice' }
    const result = transformImportRow(row, colMap, 'products')
    expect(result.purchasePrice).toBe(500.5)
    expect(result.sellingPrice).toBe(1000)
  })

  it('transforms product isActive from Da/Ne', () => {
    const row1 = { Naziv: 'Active', Aktivan: 'Da' }
    const colMap1 = { Naziv: 'name', Aktivan: 'isActive' }
    const result1 = transformImportRow(row1, colMap1, 'products')
    expect(result1.isActive).toBe(true)

    const row2 = { Naziv: 'Inactive', Aktivan: 'Ne' }
    const result2 = transformImportRow(row2, colMap1, 'products')
    expect(result2.isActive).toBe(false)
  })

  it('transforms contact isClient from Da/Ne', () => {
    const row = { Ime: 'Test', Klijent: 'Da', Dobavljač: 'true' }
    const colMap = { Ime: 'name', Klijent: 'isClient', Dobavljač: 'isSupplier' }
    const result = transformImportRow(row, colMap, 'contacts')
    expect(result.isClient).toBe(true)
    expect(result.isSupplier).toBe(true)
  })
})
