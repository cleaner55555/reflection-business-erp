import * as XLSX from 'xlsx'
import { saveAs } from 'file-saver'
import type {
  PartnerData,
  ProductData,
  InvoiceData,
  TransactionData,
  FinancialData,
} from './pdf-generator'

// ==================== GENERIC EXPORT ====================

/**
 * Export generic data to Excel file
 */
export function exportToExcel(
  data: Record<string, unknown>[],
  filename: string,
  sheetName: string = 'Sheet1'
) {
  const wb = XLSX.utils.book_new()
  const ws = XLSX.utils.json_to_sheet(data)

  // Auto-size columns
  const colWidths = Object.keys(data[0] || {}).map((key) => {
    const maxLength = Math.max(
      key.length,
      ...data.map((row) => String(row[key] || '').length)
    )
    return { wch: Math.min(maxLength + 2, 50) }
  })
  ws['!cols'] = colWidths

  XLSX.utils.book_append_sheet(wb, ws, sheetName)

  const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' })
  const blob = new Blob([excelBuffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  })
  saveAs(blob, `${filename}.xlsx`)
}

// ==================== FORMATTING HELPERS ====================

const HEADER_FILL = { fgColor: { rgb: '059669' } } // emerald-600
const HEADER_FONT = { bold: true, color: { rgb: 'FFFFFF' }, sz: 11 }
const AMOUNT_FORMAT = '#,##0.00 "RSD"'
const PERCENT_FORMAT = '0.0%'
const DATE_FORMAT = 'DD.MM.YYYY'

function applyHeaderStyle(ws: XLSX.WorkSheet, colCount: number) {
  if (!ws['!ref']) return
  const range = XLSX.utils.decode_range(ws['!ref'])
  for (let c = range.s.c; c <= range.e.c; c++) {
    const cellAddress = XLSX.utils.encode_cell({ r: 0, c })
    if (ws[cellAddress]) {
      ws[cellAddress].s = {
        fill: HEADER_FILL,
        font: HEADER_FONT,
        alignment: { horizontal: 'center', vertical: 'center' },
        border: {
          bottom: { style: 'medium', color: { rgb: '059669' } },
        },
      }
    }
  }
}

function applyAmountFormat(ws: XLSX.WorkSheet, colIndex: number, startRow: number = 1) {
  if (!ws['!ref']) return
  const range = XLSX.utils.decode_range(ws['!ref'])
  for (let r = startRow; r <= range.e.r; r++) {
    const cellAddress = XLSX.utils.encode_cell({ r, c: colIndex })
    if (ws[cellAddress]) {
      ws[cellAddress].s = {
        alignment: { horizontal: 'right' },
        numFmt: AMOUNT_FORMAT,
      }
    }
  }
}

function applyBorders(ws: XLSX.WorkSheet) {
  if (!ws['!ref']) return
  const range = XLSX.utils.decode_range(ws['!ref'])
  const thinBorder = {
    top: { style: 'thin', color: { rgb: 'D1D5DB' } },
    bottom: { style: 'thin', color: { rgb: 'D1D5DB' } },
    left: { style: 'thin', color: { rgb: 'D1D5DB' } },
    right: { style: 'thin', color: { rgb: 'D1D5DB' } },
  }
  for (let r = range.s.r; r <= range.e.r; r++) {
    for (let c = range.s.c; c <= range.e.c; c++) {
      const cellAddress = XLSX.utils.encode_cell({ r, c })
      if (ws[cellAddress]) {
        ws[cellAddress].s = { ...ws[cellAddress].s, border: thinBorder }
      }
    }
  }
}

function applyAlternateRowColors(ws: XLSX.WorkSheet) {
  if (!ws['!ref']) return
  const range = XLSX.utils.decode_range(ws['!ref'])
  for (let r = 1; r <= range.e.r; r++) {
    if (r % 2 === 0) {
      for (let c = range.s.c; c <= range.e.c; c++) {
        const cellAddress = XLSX.utils.encode_cell({ r, c })
        if (ws[cellAddress]) {
          ws[cellAddress].s = {
            ...ws[cellAddress].s,
            fill: { fgColor: { rgb: 'F9FAFB' } },
          }
        }
      }
    }
  }
}

function autoSizeColumns(ws: XLSX.WorkSheet) {
  if (!ws['!ref']) return
  const range = XLSX.utils.decode_range(ws['!ref'])
  const widths: number[] = []
  for (let c = range.s.c; c <= range.e.c; c++) {
    let maxLen = 0
    for (let r = range.s.r; r <= range.e.r; r++) {
      const cellAddress = XLSX.utils.encode_cell({ r, c })
      const cell = ws[cellAddress]
      if (cell) {
        const val = cell.v !== undefined ? String(cell.v) : ''
        maxLen = Math.max(maxLen, val.length)
      }
    }
    widths.push({ wch: Math.min(Math.max(maxLen + 3, 10), 50) })
  }
  ws['!cols'] = widths
}

// ==================== PARTNERS EXPORT ====================

export function exportPartnersExcel(partners: PartnerData[]) {
  const data = partners.map((p) => ({
    'Naziv': p.name,
    'PIB': p.pib,
    'Matični broj': p.maticniBr || '',
    'Adresa': p.address || '',
    'Grad': p.city || '',
    'Tip': p.type,
    'Telefon': p.phone || '',
    'Email': p.email || '',
    'Ukupno fakturisano': p.totalInvoiced || 0,
  }))

  const wb = XLSX.utils.book_new()
  const ws = XLSX.utils.json_to_sheet(data)

  autoSizeColumns(ws)
  applyHeaderStyle(ws, Object.keys(data[0] || {}).length)
  applyBorders(ws)
  applyAlternateRowColors(ws)
  applyAmountFormat(ws, 8)

  XLSX.utils.book_append_sheet(wb, ws, 'Partneri')
  const buffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' })
  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  })
  saveAs(blob, `partneri_${formatDateFile()}.xlsx`)
}

// ==================== PRODUCTS EXPORT ====================

export function exportProductsExcel(products: ProductData[]) {
  const data = products.map((p) => ({
    'Naziv': p.name,
    'Šifra': p.sku,
    'Kategorija': p.category || '',
    'Jedinica mere': p.unit || 'kom',
    'Nabavna cena': p.purchasePrice,
    'Prodajna cena': p.sellingPrice,
    'Trenutna zalilha': p.currentStock,
    'Minimalna zalilha': p.minStock,
    'Status': p.currentStock <= p.minStock ? 'Niska zalilha' : 'OK',
    'Marža (%)': p.purchasePrice > 0
      ? ((p.sellingPrice - p.purchasePrice) / p.purchasePrice * 100).toFixed(1)
      : '0.0',
  }))

  const wb = XLSX.utils.book_new()
  const ws = XLSX.utils.json_to_sheet(data)

  autoSizeColumns(ws)
  applyHeaderStyle(ws, Object.keys(data[0] || {}).length)
  applyBorders(ws)
  applyAlternateRowColors(ws)
  applyAmountFormat(ws, 4)
  applyAmountFormat(ws, 5)

  // Highlight low stock rows
  if (!ws['!ref']) return
  const range = XLSX.utils.decode_range(ws['!ref'])
  for (let r = 1; r <= range.e.r; r++) {
    const statusCell = XLSX.utils.encode_cell({ r, c: 8 })
    if (ws[statusCell] && ws[statusCell].v === 'Niska zalilha') {
      for (let c = range.s.c; c <= range.e.c; c++) {
        const cellAddress = XLSX.utils.encode_cell({ r, c })
        if (ws[cellAddress]) {
          ws[cellAddress].s = {
            ...ws[cellAddress].s,
            fill: { fgColor: { rgb: 'FEF2F2' } },
            font: { color: { rgb: 'DC2626' } },
          }
        }
      }
    }
  }

  XLSX.utils.book_append_sheet(wb, ws, 'Proizvodi')
  const buffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' })
  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  })
  saveAs(blob, `proizvodi_${formatDateFile()}.xlsx`)
}

// ==================== INVOICES EXPORT ====================

export function exportInvoicesExcel(invoices: InvoiceData[]) {
  const data = invoices.map((inv) => ({
    'Broj fakture': inv.number,
    'Datum': inv.date ? inv.date.split('T')[0] : '',
    'Datum dospelja': inv.dueDate ? inv.dueDate.split('T')[0] : '',
    'Tip': inv.type,
    'Status': inv.status,
    'Partner': inv.partner?.name || '',
    'PIB partnera': inv.partner?.pib || '',
    'Način plaćanja': inv.paymentMethod,
    'Ukupan iznos': inv.totalAmount,
    'PDV iznos': inv.taxAmount,
    'Napomene': inv.notes || '',
  }))

  const wb = XLSX.utils.book_new()
  const ws = XLSX.utils.json_to_sheet(data)

  autoSizeColumns(ws)
  applyHeaderStyle(ws, Object.keys(data[0] || {}).length)
  applyBorders(ws)
  applyAlternateRowColors(ws)
  applyAmountFormat(ws, 8)
  applyAmountFormat(ws, 9)

  XLSX.utils.book_append_sheet(wb, ws, 'Fakture')

  // Invoice Items sheet
  const itemsData = invoices.flatMap((inv) =>
    inv.items.map((item) => ({
      'Broj fakture': inv.number,
      'Partner': inv.partner?.name || '',
      'Naziv stavke': item.productName,
      'Količina': item.quantity,
      'Jed. cena': item.unitPrice,
      'Popust (%)': item.discountPct,
      'PDV (%)': item.taxRate,
      'Ukupno': item.total,
    }))
  )

  const wsItems = XLSX.utils.json_to_sheet(itemsData)
  autoSizeColumns(wsItems)
  applyHeaderStyle(wsItems, Object.keys(itemsData[0] || {}).length)
  applyBorders(wsItems)
  applyAlternateRowColors(wsItems)
  applyAmountFormat(wsItems, 4)
  applyAmountFormat(wsItems, 7)

  XLSX.utils.book_append_sheet(wb, wsItems, 'Stavke')

  const buffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' })
  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  })
  saveAs(blob, `fakture_${formatDateFile()}.xlsx`)
}

// ==================== TRANSACTIONS EXPORT ====================

export function exportTransactionsExcel(transactions: TransactionData[]) {
  const data = transactions.map((t) => ({
    'Datum': t.date ? t.date.split('T')[0] : '',
    'Tip': t.type,
    'Kategorija': t.category,
    'Iznos': t.amount,
    'Opis': t.description,
    'Dokument': t.documentRef || '',
    'Partner': t.partnerName || '',
  }))

  const wb = XLSX.utils.book_new()
  const ws = XLSX.utils.json_to_sheet(data)

  autoSizeColumns(ws)
  applyHeaderStyle(ws, Object.keys(data[0] || {}).length)
  applyBorders(ws)
  applyAlternateRowColors(ws)
  applyAmountFormat(ws, 3)

  // Summary sheet
  const income = transactions.filter((t) => t.type === 'prihod').reduce((s, t) => s + t.amount, 0)
  const expense = transactions.filter((t) => t.type === 'rashod').reduce((s, t) => s + t.amount, 0)

  const summaryData = [
    { 'Prikaz': 'Ukupan prihod', 'Iznos': income },
    { 'Prikaz': 'Ukupan rashod', 'Iznos': expense },
    { 'Prikaz': 'Saldo', 'Iznos': income - expense },
    { 'Prikaz': 'Broj transakcija', 'Iznos': transactions.length },
  ]

  const wsSummary = XLSX.utils.json_to_sheet(summaryData)
  autoSizeColumns(wsSummary)
  applyHeaderStyle(wsSummary, 2)
  applyBorders(wsSummary)
  applyAmountFormat(wsSummary, 1, 0) // apply to all rows including header

  XLSX.utils.book_append_sheet(wb, wsSummary, 'Rezime')

  const buffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' })
  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  })
  saveAs(blob, `transakcije_${formatDateFile()}.xlsx`)
}

// ==================== FINANCIAL EXPORT ====================

export function exportFinancialExcel(data: FinancialData) {
  const wb = XLSX.utils.book_new()

  // Summary sheet
  const summaryData = [
    { 'Prikaz': 'Ukupan prihod', 'Iznos': data.totalRevenue },
    { 'Prikaz': 'Ukupan rashod', 'Iznos': data.totalExpenses },
    { 'Prikaz': 'Neto dobit', 'Iznos': data.netProfit },
    { 'Prikaz': 'Marža (%)', 'Iznos': data.totalRevenue > 0 ? (data.netProfit / data.totalRevenue * 100).toFixed(1) : '0' },
  ]
  if (data.dateFrom) summaryData.push({ 'Prikaz': 'Datum od', 'Iznos': data.dateFrom.split('T')[0] })
  if (data.dateTo) summaryData.push({ 'Prikaz': 'Datum do', 'Iznos': data.dateTo.split('T')[0] })

  const wsSummary = XLSX.utils.json_to_sheet(summaryData)
  autoSizeColumns(wsSummary)
  applyHeaderStyle(wsSummary, 2)
  applyBorders(wsSummary)

  XLSX.utils.book_append_sheet(wb, wsSummary, 'Rezime')

  // Monthly breakdown sheet
  const monthlyData = (data.monthlyBreakdown || []).map((m) => ({
    'Mesec': m.month,
    'Prihod': m.revenue,
    'Rashod': m.expenses,
    'Dobit': m.profit,
    'Marža (%)': m.revenue > 0 ? (m.profit / m.revenue * 100).toFixed(1) : '0',
  }))

  if (monthlyData.length > 0) {
    const wsMonthly = XLSX.utils.json_to_sheet(monthlyData)
    autoSizeColumns(wsMonthly)
    applyHeaderStyle(wsMonthly, Object.keys(monthlyData[0] || {}).length)
    applyBorders(wsMonthly)
    applyAlternateRowColors(wsMonthly)
    applyAmountFormat(wsMonthly, 1)
    applyAmountFormat(wsMonthly, 2)
    applyAmountFormat(wsMonthly, 3)
    XLSX.utils.book_append_sheet(wb, wsMonthly, 'Mesečni pregled')
  }

  // Expense by category sheet
  const catData = (data.expenseByCategory || []).map((c) => ({
    'Kategorija': c.category,
    'Iznos': c.amount,
    'Udeo (%)': c.percentage,
  }))

  if (catData.length > 0) {
    const wsCat = XLSX.utils.json_to_sheet(catData)
    autoSizeColumns(wsCat)
    applyHeaderStyle(wsCat, Object.keys(catData[0] || {}).length)
    applyBorders(wsCat)
    applyAlternateRowColors(wsCat)
    applyAmountFormat(wsCat, 1)
    XLSX.utils.book_append_sheet(wb, wsCat, 'Kategorije rashoda')
  }

  // Top partners sheet
  const partnersData = (data.topPartners || []).map((p) => ({
    'Partner': p.name,
    'Iznos': p.amount,
    'Broj faktura': p.invoiceCount,
  }))

  if (partnersData.length > 0) {
    const wsPartners = XLSX.utils.json_to_sheet(partnersData)
    autoSizeColumns(wsPartners)
    applyHeaderStyle(wsPartners, Object.keys(partnersData[0] || {}).length)
    applyBorders(wsPartners)
    applyAlternateRowColors(wsPartners)
    applyAmountFormat(wsPartners, 1)
    XLSX.utils.book_append_sheet(wb, wsPartners, 'Top partneri')
  }

  const buffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' })
  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  })
  saveAs(blob, `finansijski_izvestaj_${formatDateFile()}.xlsx`)
}

// ==================== HELPERS ====================

function formatDateFile(): string {
  const d = new Date()
  return `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}`
}
