/**
 * Export/Import utility functions for CSV, XLSX, and PDF formats.
 */

// ============ Types ============

export type ExportDataType = 'invoices' | 'contacts' | 'products' | 'employees' | 'projects';
export type ExportFormat = 'csv' | 'xlsx' | 'pdf';
export type ImportMode = 'create' | 'update' | 'upsert';

export interface ColumnDef {
  key: string;
  label: string;
  transform?: (value: unknown) => string | number;
}

export interface ImportResult {
  created: number;
  updated: number;
  errors: Array<{ row: number; message: string }>;
}

// ============ Column Mappings ============

export function getColumnMappings(dataType: ExportDataType): ColumnDef[] {
  switch (dataType) {
    case 'invoices':
      return [
        { key: 'number', label: 'Broj fakture' },
        { key: 'date', label: 'Datum', transform: (v) => (v instanceof Date ? v.toISOString().split('T')[0] : String(v || '')) },
        { key: 'partnerName', label: 'Partner' },
        { key: 'totalAmount', label: 'Iznos (RSD)', transform: (v) => Number(v) || 0 },
        { key: 'baseAmount', label: 'Osnovica', transform: (v) => Number(v) || 0 },
        { key: 'taxAmount', label: 'Porez', transform: (v) => Number(v) || 0 },
        { key: 'status', label: 'Status' },
        { key: 'type', label: 'Tip' },
        { key: 'dueDate', label: 'Datum valute', transform: (v) => (v instanceof Date ? v.toISOString().split('T')[0] : String(v || '')) },
        { key: 'paymentMethod', label: 'Način plaćanja' },
        { key: 'notes', label: 'Napomene' },
      ];
    case 'contacts':
      return [
        { key: 'firstName', label: 'Ime' },
        { key: 'lastName', label: 'Prezime' },
        { key: 'email', label: 'Email' },
        { key: 'phone', label: 'Telefon' },
        { key: 'position', label: 'Pozicija' },
        { key: 'companyName', label: 'Kompanija' },
        { key: 'isClient', label: 'Klijent', transform: (v) => v ? 'Da' : 'Ne' },
        { key: 'isSupplier', label: 'Dobavljač', transform: (v) => v ? 'Da' : 'Ne' },
        { key: 'isLead', label: 'Lead', transform: (v) => v ? 'Da' : 'Ne' },
        { key: 'notes', label: 'Napomene' },
        { key: 'tags', label: 'Tagovi' },
      ];
    case 'products':
      return [
        { key: 'name', label: 'Naziv' },
        { key: 'sku', label: 'Šifra (SKU)' },
        { key: 'barcode', label: 'Barkod' },
        { key: 'category', label: 'Kategorija' },
        { key: 'unit', label: 'Jedinica mere' },
        { key: 'purchasePrice', label: 'Nabavna cena', transform: (v) => Number(v) || 0 },
        { key: 'sellingPrice', label: 'Prodajna cena', transform: (v) => Number(v) || 0 },
        { key: 'currentStock', label: 'Trenutna zaliha', transform: (v) => Number(v) || 0 },
        { key: 'minStock', label: 'Min. zaliha', transform: (v) => Number(v) || 0 },
        { key: 'isActive', label: 'Aktivan', transform: (v) => v ? 'Da' : 'Ne' },
        { key: 'description', label: 'Opis' },
      ];
    case 'employees':
      return [
        { key: 'firstName', label: 'Ime' },
        { key: 'lastName', label: 'Prezime' },
        { key: 'email', label: 'Email' },
        { key: 'phone', label: 'Telefon' },
        { key: 'position', label: 'Pozicija' },
        { key: 'department', label: 'Odeljenje' },
        { key: 'baseSalary', label: 'Osnovna plata', transform: (v) => Number(v) || 0 },
        { key: 'contractType', label: 'Tip ugovora' },
        { key: 'hireDate', label: 'Datum zaposlenja', transform: (v) => (v instanceof Date ? v.toISOString().split('T')[0] : String(v || '')) },
        { key: 'isActive', label: 'Aktivan', transform: (v) => v ? 'Da' : 'Ne' },
      ];
    case 'projects':
      return [
        { key: 'name', label: 'Naziv projekta' },
        { key: 'description', label: 'Opis' },
        { key: 'status', label: 'Status' },
        { key: 'priority', label: 'Prioritet' },
        { key: 'budget', label: 'Budžet', transform: (v) => Number(v) || 0 },
        { key: 'spent', label: 'Potrošeno', transform: (v) => Number(v) || 0 },
        { key: 'progress', label: 'Napredak (%)', transform: (v) => Number(v) || 0 },
        { key: 'startDate', label: 'Početak', transform: (v) => (v instanceof Date ? v.toISOString().split('T')[0] : String(v || '')) },
        { key: 'endDate', label: 'Kraj', transform: (v) => (v instanceof Date ? v.toISOString().split('T')[0] : String(v || '')) },
        { key: 'assignedTo', label: 'Zaduzen' },
      ];
    default:
      return [];
  }
}

/**
 * Get the label for a data type (Serbian)
 */
export function getDataTypeLabel(dataType: ExportDataType): string {
  const labels: Record<ExportDataType, string> = {
    invoices: 'Fakture',
    contacts: 'Kontakti',
    products: 'Proizvodi',
    employees: 'Zaposleni',
    projects: 'Projekti',
  };
  return labels[dataType] || dataType;
}

// ============ CSV Generation ============

function escapeCSVField(value: unknown): string {
  if (value === null || value === undefined) return '';
  const str = String(value);
  if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export function generateCSV(
  data: Record<string, unknown>[],
  columns: ColumnDef[]
): string {
  const lines: string[] = [];

  // Header row
  lines.push(columns.map((col) => escapeCSVField(col.label)).join(','));

  // Data rows
  for (const row of data) {
    lines.push(
      columns.map((col) => {
        const value = col.transform ? col.transform(row[col.key]) : row[col.key];
        return escapeCSVField(value);
      }).join(',')
    );
  }

  return lines.join('\n');
}

// ============ CSV Parsing ============

export function parseCSV(text: string): Record<string, string>[] {
  const lines = text.split(/\r?\n/).filter((line) => line.trim() !== '');
  if (lines.length < 2) return [];

  const headers = parseCSVLine(lines[0]);
  const rows: Record<string, string>[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i]);
    const row: Record<string, string> = {};
    for (let j = 0; j < headers.length; j++) {
      row[headers[j]] = values[j] || '';
    }
    rows.push(row);
  }

  return rows;
}

function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (inQuotes) {
      if (char === '"') {
        if (i + 1 < line.length && line[i + 1] === '"') {
          current += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        current += char;
      }
    } else {
      if (char === '"') {
        inQuotes = true;
      } else if (char === ',') {
        result.push(current);
        current = '';
      } else {
        current += char;
      }
    }
  }
  result.push(current);
  return result;
}

// ============ XLSX Generation ============

export async function generateXLSX(
  data: Record<string, unknown>[],
  columns: ColumnDef[],
  sheetName: string = 'Podaci'
): Promise<Buffer> {
  // Dynamic import for server-side usage
  const XLSX = await import('xlsx');

  // Prepare headers and rows
  const headers = columns.map((col) => col.label);
  const rows = data.map((row) =>
    columns.map((col) => {
      const value = col.transform ? col.transform(row[col.key]) : row[col.key];
      return value;
    })
  );

  // Create worksheet
  const ws = XLSX.utils.aoa_to_sheet([headers, ...rows]);

  // Auto-size columns
  const colWidths = columns.map((col, idx) => {
    const maxLen = Math.max(
      col.label.length,
      ...rows.slice(0, 50).map((r) => String(r[idx] || '').length)
    );
    return { wch: Math.min(maxLen + 2, 50) };
  });
  ws['!cols'] = colWidths;

  // Create workbook
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, sheetName);

  // Write to buffer
  const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
  return Buffer.from(buffer);
}

// ============ Universal File Parsing ============

/**
 * Parses CSV or XLSX file into an array of objects.
 * Detects format based on filename extension.
 */
export async function parseFile(buffer: ArrayBuffer, filename: string): Promise<Record<string, string>[]> {
  const name = filename.toLowerCase();
  if (name.endsWith('.csv')) {
    const text = new TextDecoder('utf-8').decode(buffer);
    return parseCSV(text);
  }
  if (name.endsWith('.xlsx') || name.endsWith('.xls')) {
    return parseXLSX(buffer);
  }
  throw new Error(`Nepodržan format fajla: ${filename}. Podržani su CSV i XLSX.`);
}

// ============ XLSX Parsing ============

export async function parseXLSX(buffer: ArrayBuffer): Promise<Record<string, string>[]> {
  const XLSX = await import('xlsx');

  const workbook = XLSX.read(buffer, { type: 'array' });
  const sheetName = workbook.SheetNames[0];
  if (!sheetName) return [];

  const sheet = workbook.Sheets[sheetName];
  const jsonData = XLSX.utils.sheet_to_json<Record<string, string>>(sheet);

  return jsonData;
}

// ============ PDF Generation ============

export async function generatePDF(
  data: Record<string, unknown>[],
  columns: ColumnDef[],
  title: string
): Promise<Buffer> {
  const jsPDF = (await import('jspdf')).default;
  await import('jspdf-autotable');

  const doc = new jsPDF({
    orientation: data.length > 0 && columns.length > 6 ? 'landscape' : 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  // Title
  doc.setFontSize(16);
  doc.text(title, 14, 20);

  // Subtitle with date and count
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text(
    `Datum izvoza: ${new Date().toLocaleDateString('sr-Latn')} | Ukupno: ${data.length} zapisa`,
    14,
    28
  );

  // Table data
  const headers = columns.map((col) => col.label);
  const rows = data.map((row) =>
    columns.map((col) => {
      const value = col.transform ? col.transform(row[col.key]) : row[col.key];
      return String(value ?? '');
    })
  );

  // Use autotable
  (doc as unknown as { autoTable: (options: Record<string, unknown>) => void }).autoTable({
    head: [headers],
    body: rows,
    startY: 34,
    styles: {
      fontSize: 8,
      cellPadding: 2,
    },
    headStyles: {
      fillColor: [41, 128, 185],
      textColor: 255,
      fontStyle: 'bold',
    },
    alternateRowStyles: {
      fillColor: [245, 245, 245],
    },
    margin: { top: 34, bottom: 20 },
  });

  // Footer with page numbers
  const pageCount = (doc as unknown as { internal: { numberOfPages: number } }).internal.numberOfPages;
  for (let i = 1; i <= pageCount; i++) {
    (doc as unknown as { setPage: (n: number) => void }).setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text(
      `Strana ${i} od ${pageCount}`,
      doc.internal.pageSize.getWidth() / 2,
      doc.internal.pageSize.getHeight() - 10,
      { align: 'center' }
    );
  }

  return Buffer.from(doc.output('arraybuffer'));
}

// ============ Import Column Mapping ============

/**
 * Maps parsed CSV/XLSX columns (header names) to known model fields.
 * Uses case-insensitive matching and common aliases.
 */
export function mapImportColumns(
  headers: string[],
  dataType: ExportDataType
): Record<string, string> {
  const mappings: Record<string, string> = {};
  const colDefs = getColumnMappings(dataType);

  // Build a lookup of known field names and their aliases
  const fieldLookup: Array<{ field: string; aliases: string[] }> = colDefs.map((col) => {
    const labelLower = col.label.toLowerCase();
    const keyLower = col.key.toLowerCase();

    // Generate aliases from label words
    const labelWords = labelLower.split(/[\s_()-]+/).filter(Boolean);

    return {
      field: col.key,
      aliases: [
        keyLower,           // exact field name
        labelLower,         // serbian label
        ...labelWords,      // individual label words
      ],
    };
  });

  for (const header of headers) {
    const headerLower = header.trim().toLowerCase();
    let bestMatch: string | null = null;
    let bestScore = 0;

    for (const { field, aliases } of fieldLookup) {
      for (const alias of aliases) {
        if (headerLower === alias) {
          // Exact match = highest score
          if (bestScore < 3) {
            bestMatch = field;
            bestScore = 3;
          }
        } else if (headerLower.includes(alias) || alias.includes(headerLower)) {
          // Partial match
          if (bestScore < 1) {
            bestMatch = field;
            bestScore = 1;
          }
        }
      }
    }

    if (bestMatch) {
      mappings[header.trim()] = bestMatch;
    }
  }

  return mappings;
}

/**
 * Transform an imported row based on column mappings and data type.
 */
export function transformImportRow(
  row: Record<string, string>,
  columnMappings: Record<string, string>,
  dataType: ExportDataType
): Record<string, unknown> {
  const result: Record<string, unknown> = {};

  for (const [header, value] of Object.entries(row)) {
    const field = columnMappings[header];
    if (!field) continue;

    result[field] = value;
  }

  // Type-specific transformations
  switch (dataType) {
    case 'products':
      if (result.purchasePrice !== undefined) result.purchasePrice = parseFloat(String(result.purchasePrice)) || 0;
      if (result.sellingPrice !== undefined) result.sellingPrice = parseFloat(String(result.sellingPrice)) || 0;
      if (result.currentStock !== undefined) result.currentStock = parseInt(String(result.currentStock), 10) || 0;
      if (result.minStock !== undefined) result.minStock = parseInt(String(result.minStock), 10) || 0;
      if (result.isActive !== undefined) {
        const v = String(result.isActive).toLowerCase();
        result.isActive = !(v === 'ne' || v === 'false' || v === '0' || v === 'n');
      }
      break;

    case 'employees':
      if (result.baseSalary !== undefined) result.baseSalary = parseFloat(String(result.baseSalary)) || 0;
      if (result.hireDate) {
        const d = new Date(String(result.hireDate));
        result.hireDate = isNaN(d.getTime()) ? undefined : d;
      }
      if (result.isActive !== undefined) {
        const v = String(result.isActive).toLowerCase();
        result.isActive = !(v === 'ne' || v === 'false' || v === '0' || v === 'n');
      }
      break;

    case 'contacts':
      if (result.isClient !== undefined) {
        const v = String(result.isClient).toLowerCase();
        result.isClient = v === 'da' || v === 'true' || v === '1' || v === 'yes';
      }
      if (result.isSupplier !== undefined) {
        const v = String(result.isSupplier).toLowerCase();
        result.isSupplier = v === 'da' || v === 'true' || v === '1' || v === 'yes';
      }
      if (result.isLead !== undefined) {
        const v = String(result.isLead).toLowerCase();
        result.isLead = !(v === 'ne' || v === 'false' || v === '0' || v === 'n');
      }
      break;

    case 'projects':
      if (result.budget !== undefined) result.budget = parseFloat(String(result.budget)) || 0;
      if (result.spent !== undefined) result.spent = parseFloat(String(result.spent)) || 0;
      if (result.progress !== undefined) result.progress = parseInt(String(result.progress), 10) || 0;
      break;
  }

  return result;
}
