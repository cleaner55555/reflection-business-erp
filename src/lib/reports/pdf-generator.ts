import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

// ==================== TYPES ====================

export interface InvoiceItemData {
  productName: string
  quantity: number
  unitPrice: number
  discountPct: number
  taxRate: number
  total: number
}

export interface InvoiceData {
  id: string
  number: string
  date: string
  dueDate: string
  type: string
  status: string
  totalAmount: number
  taxAmount: number
  discountPct: number
  paymentMethod: string
  notes?: string | null
  partner?: {
    name: string
    pib: string
    maticniBr?: string | null
    address?: string | null
    city?: string | null
    phone?: string | null
    email?: string | null
    account?: string | null
    bank?: string | null
  } | null
  items: InvoiceItemData[]
}

export interface PartnerData {
  id: string
  name: string
  pib: string
  city?: string | null
  type: string
  totalInvoiced?: number
  email?: string | null
  phone?: string | null
  address?: string | null
}

export interface ProductData {
  id: string
  name: string
  sku: string
  category?: string | null
  purchasePrice: number
  sellingPrice: number
  currentStock: number
  minStock: number
  unit?: string
}

export interface TransactionData {
  id: string
  date: string
  type: string
  category: string
  amount: number
  description: string
  documentRef?: string | null
  partnerName?: string | null
}

export interface FinancialData {
  totalRevenue: number
  totalExpenses: number
  netProfit: number
  dateFrom?: string
  dateTo?: string
  monthlyBreakdown: Array<{
    month: string
    revenue: number
    expenses: number
    profit: number
  }>
  topPartners: Array<{
    name: string
    amount: number
    invoiceCount: number
  }>
  expenseByCategory: Array<{
    category: string
    amount: number
    percentage: number
  }>
}

export interface CompanyInfo {
  name: string
  address: string
  city: string
  pib: string
  maticniBr: string
  account: string
  bank: string
  phone: string
  email: string
}

// ==================== DEFAULTS ====================

const DEFAULT_COMPANY: CompanyInfo = {
  name: 'Reflection Business',
  address: 'Bulevar Mihajla Pupina 10a',
  city: 'Beograd, 11070',
  pib: '123456789',
  maticniBr: '21012345',
  account: '265-12345678-12',
  bank: 'Banca Intesa Beograd',
  phone: '+381 11 123 4567',
  email: 'office@reflectionbusiness.rs',
}

// ==================== HELPERS ====================

function formatRSD(amount: number): string {
  return new Intl.NumberFormat('sr-RS', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)
}

function formatDate(dateStr: string): string {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  const day = String(d.getDate()).padStart(2, '0')
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const year = d.getFullYear()
  return `${day}.${month}.${year}.`
}

function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    nacrt: 'Načrt',
    poslata: 'Poslata',
    placena: 'Plaćena',
    otkazana: 'Otkazana',
    izlazna: 'Izlazna faktura',
    ulazna: 'Ulazna faktura',
    predracun: 'Predračun',
    prihod: 'Prihod',
    rashod: 'Rashod',
    kupac: 'Kupac',
    dobavljac: 'Dobavljač',
    partner: 'Partner',
    promet: 'Promet',
    nabavka: 'Nabavka',
    plata: 'Plata',
    režije: 'Režije',
    ostalo: 'Ostalo',
  }
  return labels[status] || status
}

function getPaymentMethodLabel(method: string): string {
  const labels: Record<string, string> = {
    racun: 'Račun',
    gotovina: 'Gotovina',
    kartica: 'Kartica',
  }
  return labels[method] || method
}

// Colors
const PRIMARY_COLOR: [number, number, number] = [5, 150, 105] // emerald-600
const DARK_COLOR: [number, number, number] = [17, 24, 39] // gray-900
const MUTED_COLOR: [number, number, number] = [107, 114, 128] // gray-500
const ACCENT_COLOR: [number, number, number] = [245, 245, 244] // stone-100
const RED_COLOR: [number, number, number] = [220, 38, 38] // red-600

// ==================== PDF GENERATORS ====================

/**
 * Generate an invoice PDF
 */
export function generateInvoicePDF(invoice: InvoiceData, company?: Partial<CompanyInfo>): jsPDF {
  const co = { ...DEFAULT_COMPANY, ...company }
  const doc = new jsPDF('p', 'mm', 'a4')
  const pageWidth = doc.internal.pageSize.getWidth()
  const margin = 15

  // --- Company Header ---
  doc.setFillColor(...PRIMARY_COLOR)
  doc.rect(0, 0, pageWidth, 32, 'F')

  doc.setTextColor(255, 255, 255)
  doc.setFontSize(18)
  doc.setFont('helvetica', 'bold')
  doc.text(co.name, margin, 16)

  doc.setFontSize(8)
  doc.setFont('helvetica', 'normal')
  doc.text(`${co.address}, ${co.city}`, margin, 22)
  doc.text(`PIB: ${co.pib}  |  MB: ${co.maticniBr}  |  ${co.account}`, margin, 27)

  doc.setFontSize(10)
  doc.text(co.phone, pageWidth - margin, 22, { align: 'right' })
  doc.text(co.email, pageWidth - margin, 27, { align: 'right' })

  // --- Invoice Info Box ---
  const boxY = 38
  doc.setFillColor(...ACCENT_COLOR)
  doc.roundedRect(pageWidth / 2, boxY, pageWidth / 2 - margin, 28, 3, 3, 'F')

  doc.setTextColor(...DARK_COLOR)
  doc.setFontSize(14)
  doc.setFont('helvetica', 'bold')
  doc.text(getStatusLabel(invoice.type).toUpperCase(), pageWidth - margin, boxY + 9, { align: 'right' })

  doc.setFontSize(9)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(...MUTED_COLOR)
  doc.text('Broj:', pageWidth / 2 + 5, boxY + 16)
  doc.text('Datum:', pageWidth / 2 + 5, boxY + 21)
  doc.text('Valuta:', pageWidth / 2 + 5, boxY + 26)

  doc.setTextColor(...DARK_COLOR)
  doc.setFont('helvetica', 'bold')
  doc.text(invoice.number, pageWidth - margin, boxY + 16, { align: 'right' })
  doc.setFont('helvetica', 'normal')
  doc.text(formatDate(invoice.date), pageWidth - margin, boxY + 21, { align: 'right' })
  doc.text(formatDate(invoice.dueDate), pageWidth - margin, boxY + 26, { align: 'right' })

  // --- Buyer Info ---
  const buyerY = 72
  doc.setTextColor(...MUTED_COLOR)
  doc.setFontSize(7)
  doc.setFont('helvetica', 'bold')
  doc.text('KUPAC', margin, buyerY)

  doc.setDrawColor(200, 200, 200)
  doc.line(margin, buyerY + 2, margin + 60, buyerY + 2)

  doc.setTextColor(...DARK_COLOR)
  doc.setFontSize(11)
  doc.setFont('helvetica', 'bold')
  doc.text(invoice.partner?.name || '-', margin, buyerY + 9)

  doc.setFontSize(8)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(...MUTED_COLOR)
  if (invoice.partner?.address) {
    doc.text(invoice.partner.address + (invoice.partner.city ? `, ${invoice.partner.city}` : ''), margin, buyerY + 15)
  }
  if (invoice.partner?.pib) {
    doc.text(`PIB: ${invoice.partner.pib}${invoice.partner.maticniBr ? `  |  MB: ${invoice.partner.maticniBr}` : ''}`, margin, buyerY + 20)
  }
  if (invoice.partner?.account) {
    doc.text(`ŽR: ${invoice.partner.account}${invoice.partner.bank ? ` - ${invoice.partner.bank}` : ''}`, margin, buyerY + 25)
  }

  // --- Items Table ---
  const tableStartY = buyerY + 33

  const calcItemBase = (item: InvoiceItemData) => {
    const subtotal = item.quantity * item.unitPrice
    const discount = subtotal * ((item.discountPct || 0) / 100)
    return subtotal - discount
  }

  const calcItemTax = (item: InvoiceItemData) => {
    return calcItemBase(item) * ((item.taxRate || 20) / 100)
  }

  const calcItemTotal = (item: InvoiceItemData) => {
    return calcItemBase(item) + calcItemTax(item)
  }

  const itemsBody = invoice.items.map((item, idx) => [
    String(idx + 1),
    item.productName,
    formatRSD(item.unitPrice),
    String(item.quantity),
    `${item.discountPct || 0}%`,
    `${item.taxRate || 20}%`,
    formatRSD(calcItemTotal(item)),
  ])

  autoTable(doc, {
    startY: tableStartY,
    head: [['#', 'Naziv stavke', 'Jed. cena', 'Kol.', 'Popust', 'PDV', 'Ukupno']],
    body: itemsBody,
    margin: { left: margin, right: margin },
    theme: 'grid',
    headStyles: {
      fillColor: PRIMARY_COLOR,
      textColor: [255, 255, 255],
      fontSize: 8,
      fontStyle: 'bold',
      halign: 'center',
    },
    bodyStyles: {
      fontSize: 8,
      textColor: DARK_COLOR,
    },
    columnStyles: {
      0: { halign: 'center', cellWidth: 10 },
      1: { cellWidth: 'auto' },
      2: { halign: 'right', cellWidth: 25 },
      3: { halign: 'center', cellWidth: 15 },
      4: { halign: 'center', cellWidth: 15 },
      5: { halign: 'center', cellWidth: 15 },
      6: { halign: 'right', cellWidth: 28 },
    },
    alternateRowStyles: {
      fillColor: [249, 250, 251],
    },
  })

  // --- Summary ---
  const finalY = (doc as unknown as { lastAutoTable?: { finalY: number } }).lastAutoTable?.finalY || tableStartY + 50
  const summaryY = Math.max(finalY + 10, tableStartY + 50)

  const totalBase = invoice.items.reduce((s, i) => s + calcItemBase(i), 0)
  const totalTax = invoice.items.reduce((s, i) => s + calcItemTax(i), 0)

  doc.setFillColor(...ACCENT_COLOR)
  doc.roundedRect(pageWidth - 100, summaryY, 85, 40, 3, 3, 'F')

  const sumX = pageWidth - margin

  doc.setFontSize(8)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(...MUTED_COLOR)
  doc.text('Osnovica:', pageWidth - 95, summaryY + 10)
  doc.text('PDV:', pageWidth - 95, summaryY + 18)

  doc.setTextColor(...DARK_COLOR)
  doc.setFont('helvetica', 'bold')
  doc.text(formatRSD(totalBase), sumX, summaryY + 10, { align: 'right' })
  doc.text(formatRSD(totalTax), sumX, summaryY + 18, { align: 'right' })

  doc.setDrawColor(...PRIMARY_COLOR)
  doc.setLineWidth(0.5)
  doc.line(pageWidth - 95, summaryY + 22, sumX, summaryY + 22)

  doc.setFontSize(12)
  doc.setTextColor(...PRIMARY_COLOR)
  doc.text('UKUPNO:', pageWidth - 95, summaryY + 30)
  doc.text(formatRSD(invoice.totalAmount), sumX, summaryY + 30, { align: 'right' })

  // Amount in words
  doc.setFontSize(7)
  doc.setTextColor(...MUTED_COLOR)
  doc.setFont('helvetica', 'italic')
  doc.text(`Slovima: ${numberToSerbian(invoice.totalAmount)}`, margin, summaryY + 30)

  // --- Footer Info ---
  const footerY = summaryY + 50

  doc.setFillColor(...ACCENT_COLOR)
  doc.roundedRect(margin, footerY, pageWidth - 2 * margin, 22, 3, 3, 'F')

  doc.setFontSize(8)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(...DARK_COLOR)
  doc.text('Plaćanje', margin + 5, footerY + 8)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(...MUTED_COLOR)
  doc.text(`Način: ${getPaymentMethodLabel(invoice.paymentMethod)}`, margin + 5, footerY + 14)
  doc.text(`Valuta: ${formatDate(invoice.dueDate)}`, margin + 5, footerY + 19)

  doc.setFont('helvetica', 'bold')
  doc.setTextColor(...DARK_COLOR)
  doc.text('Žiro račun', pageWidth / 2, footerY + 8)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(...MUTED_COLOR)
  doc.text(`${co.account}`, pageWidth / 2, footerY + 14)
  doc.text(`${co.bank}`, pageWidth / 2, footerY + 19)

  // --- Notes ---
  if (invoice.notes) {
    const notesY = footerY + 28
    doc.setTextColor(...MUTED_COLOR)
    doc.setFontSize(7)
    doc.setFont('helvetica', 'bold')
    doc.text('NAPOMENA', margin, notesY)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(75, 85, 99)
    doc.text(String(invoice.notes), margin, notesY + 5, { maxWidth: pageWidth - 2 * margin })
  }

  // --- Signatures ---
  const sigY = footerY + 46
  doc.setDrawColor(200, 200, 200)
  doc.line(margin + 20, sigY, margin + 80, sigY)
  doc.line(pageWidth - 80, sigY, pageWidth - 20, sigY)

  doc.setFontSize(7)
  doc.setTextColor(...MUTED_COLOR)
  doc.text('Izdao', margin + 35, sigY + 5)
  doc.text('Primio', pageWidth - 65, sigY + 5)

  // --- Page number ---
  doc.setFontSize(7)
  doc.setTextColor(...MUTED_COLOR)
  doc.text('Reflection Business ERP', margin, 287)
  doc.text(`Faktura ${invoice.number}`, pageWidth - margin, 287, { align: 'right' })

  return doc
}

/**
 * Generate a Partners Report PDF
 */
export function generatePartnersPDF(partners: PartnerData[], company?: Partial<CompanyInfo>): jsPDF {
  const co = { ...DEFAULT_COMPANY, ...company }
  const doc = new jsPDF('p', 'mm', 'a4')
  const pageWidth = doc.internal.pageSize.getWidth()
  const margin = 15

  // Header
  addDocHeader(doc, 'Izveštaj partnera', pageWidth, margin, co)

  // Table
  const body = partners.map((p) => [
    p.name,
    p.pib,
    p.city || '-',
    getStatusLabel(p.type),
    formatRSD(p.totalInvoiced || 0),
    p.email || '-',
    p.phone || '-',
  ])

  autoTable(doc, {
    startY: 50,
    head: [['Naziv', 'PIB', 'Grad', 'Tip', 'Ukupno fakturisano', 'Email', 'Telefon']],
    body,
    margin: { left: margin, right: margin },
    theme: 'striped',
    headStyles: {
      fillColor: PRIMARY_COLOR,
      textColor: [255, 255, 255],
      fontSize: 8,
      fontStyle: 'bold',
    },
    bodyStyles: { fontSize: 8, textColor: DARK_COLOR },
    alternateRowStyles: { fillColor: [249, 250, 251] },
    columnStyles: {
      0: { cellWidth: 45 },
      1: { cellWidth: 25 },
      2: { cellWidth: 25 },
      3: { cellWidth: 22, halign: 'center' },
      4: { cellWidth: 30, halign: 'right' },
      5: { cellWidth: 25 },
      6: { cellWidth: 18 },
    },
  })

  // Summary
  const finalY = (doc as unknown as { lastAutoTable?: { finalY: number } }).lastAutoTable?.finalY || 50
  const summaryY = Math.max(finalY + 15, 70)

  const totalAmount = partners.reduce((s, p) => s + (p.totalInvoiced || 0), 0)
  const totalCustomers = partners.filter((p) => p.type === 'kupac').length
  const totalSuppliers = partners.filter((p) => p.type === 'dobavljac').length

  doc.setFillColor(...ACCENT_COLOR)
  doc.roundedRect(margin, summaryY, pageWidth - 2 * margin, 20, 3, 3, 'F')

  doc.setFontSize(8)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(...DARK_COLOR)
  doc.text(`Ukupno partnera: ${partners.length}`, margin + 5, summaryY + 10)
  doc.text(`Kupaca: ${totalCustomers}`, margin + 60, summaryY + 10)
  doc.text(`Dobavljača: ${totalSuppliers}`, margin + 100, summaryY + 16)
  doc.setTextColor(...PRIMARY_COLOR)
  doc.text(`Ukupno fakturisano: ${formatRSD(totalAmount)}`, pageWidth - margin, summaryY + 13, { align: 'right' })

  addDocFooter(doc, pageWidth, margin)

  return doc
}

/**
 * Generate a Products Report PDF
 */
export function generateProductsPDF(products: ProductData[], company?: Partial<CompanyInfo>): jsPDF {
  const co = { ...DEFAULT_COMPANY, ...company }
  const doc = new jsPDF('p', 'mm', 'a4')
  const pageWidth = doc.internal.pageSize.getWidth()
  const margin = 15

  addDocHeader(doc, 'Izveštaj proizvoda', pageWidth, margin, co)

  const body = products.map((p) => [
    p.name,
    p.sku,
    p.category || '-',
    formatRSD(p.purchasePrice),
    formatRSD(p.sellingPrice),
    `${p.currentStock} ${p.unit || 'kom'}`,
    String(p.minStock),
    p.currentStock <= p.minStock ? 'Niska' : 'OK',
  ])

  autoTable(doc, {
    startY: 50,
    head: [['Naziv', 'Šifra', 'Kategorija', 'Nabavna cena', 'Prodajna cena', 'Zaliha', 'Min. zalihu', 'Status']],
    body,
    margin: { left: margin, right: margin },
    theme: 'striped',
    headStyles: {
      fillColor: PRIMARY_COLOR,
      textColor: [255, 255, 255],
      fontSize: 8,
      fontStyle: 'bold',
    },
    bodyStyles: { fontSize: 7.5, textColor: DARK_COLOR },
    alternateRowStyles: { fillColor: [249, 250, 251] },
    columnStyles: {
      0: { cellWidth: 42 },
      1: { cellWidth: 22 },
      2: { cellWidth: 28 },
      3: { cellWidth: 25, halign: 'right' },
      4: { cellWidth: 25, halign: 'right' },
      5: { cellWidth: 18, halign: 'center' },
      6: { cellWidth: 15, halign: 'center' },
      7: { cellWidth: 15, halign: 'center' },
    },
    didParseCell: (data) => {
      if (data.section === 'body' && data.column.index === 7) {
        if (data.cell.raw === 'Niska') {
          data.cell.styles.textColor = RED_COLOR
          data.cell.styles.fontStyle = 'bold'
        } else {
          data.cell.styles.textColor = PRIMARY_COLOR
        }
      }
    },
  })

  const finalY = (doc as unknown as { lastAutoTable?: { finalY: number } }).lastAutoTable?.finalY || 50
  const summaryY = Math.max(finalY + 15, 70)

  const totalStockValue = products.reduce((s, p) => s + p.sellingPrice * p.currentStock, 0)
  const lowStockCount = products.filter((p) => p.currentStock <= p.minStock).length

  doc.setFillColor(...ACCENT_COLOR)
  doc.roundedRect(margin, summaryY, pageWidth - 2 * margin, 20, 3, 3, 'F')

  doc.setFontSize(8)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(...DARK_COLOR)
  doc.text(`Ukupno proizvoda: ${products.length}`, margin + 5, summaryY + 10)

  if (lowStockCount > 0) {
    doc.setTextColor(...RED_COLOR)
    doc.text(`Niska zaliha: ${lowStockCount}`, margin + 60, summaryY + 10)
  }

  doc.setTextColor(...PRIMARY_COLOR)
  doc.text(`Vrednost zaliha: ${formatRSD(totalStockValue)}`, pageWidth - margin, summaryY + 13, { align: 'right' })

  addDocFooter(doc, pageWidth, margin)

  return doc
}

/**
 * Generate a Financial Report PDF
 */
export function generateFinancialReport(data: FinancialData, company?: Partial<CompanyInfo>): jsPDF {
  const co = { ...DEFAULT_COMPANY, ...company }
  const doc = new jsPDF('p', 'mm', 'a4')
  const pageWidth = doc.internal.pageSize.getWidth()
  const margin = 15

  let title = 'Finansijski izveštaj'
  if (data.dateFrom && data.dateTo) {
    title += ` (${formatDate(data.dateFrom)} - ${formatDate(data.dateTo)})`
  }

  addDocHeader(doc, title, pageWidth, margin, co)

  // --- KPI Cards ---
  const kpiY = 50
  const kpiWidth = (pageWidth - 2 * margin - 10) / 3

  drawKPICard(doc, margin, kpiY, kpiWidth, 'Ukupan prihod', formatRSD(data.totalRevenue), PRIMARY_COLOR)
  drawKPICard(doc, margin + kpiWidth + 5, kpiY, kpiWidth, 'Ukupan rashod', formatRSD(data.totalExpenses), RED_COLOR)
  drawKPICard(doc, margin + 2 * (kpiWidth + 5), kpiY, kpiWidth, 'Neto dobit', formatRSD(data.netProfit), data.netProfit >= 0 ? PRIMARY_COLOR : RED_COLOR)

  // --- Monthly Breakdown Table ---
  const tableY = kpiY + 30
  doc.setFontSize(10)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(...DARK_COLOR)
  doc.text('Mesečni pregled', margin, tableY)

  const monthlyBody = (data.monthlyBreakdown || []).map((m) => [
    m.month,
    formatRSD(m.revenue),
    formatRSD(m.expenses),
    formatRSD(m.profit),
  ])

  autoTable(doc, {
    startY: tableY + 4,
    head: [['Mesec', 'Prihod', 'Rashod', 'Dobit']],
    body: monthlyBody,
    margin: { left: margin, right: margin },
    theme: 'striped',
    headStyles: {
      fillColor: PRIMARY_COLOR,
      textColor: [255, 255, 255],
      fontSize: 8,
      fontStyle: 'bold',
    },
    bodyStyles: { fontSize: 8, textColor: DARK_COLOR },
    alternateRowStyles: { fillColor: [249, 250, 251] },
    columnStyles: {
      0: { cellWidth: 40 },
      1: { halign: 'right' },
      2: { halign: 'right' },
      3: { halign: 'right', fontStyle: 'bold' },
    },
    didParseCell: (cellData) => {
      if (cellData.section === 'body' && cellData.column.index === 3) {
        const val = cellData.cell.raw as string
        if (val.startsWith('-')) {
          cellData.cell.styles.textColor = RED_COLOR
        } else {
          cellData.cell.styles.textColor = PRIMARY_COLOR
        }
      }
    },
  })

  // --- Expense by Category (new page) ---
  doc.addPage()
  addDocHeader(doc, 'Rashodi po kategorijama', pageWidth, margin, co)

  const catBody = (data.expenseByCategory || []).map((c) => [
    getStatusLabel(c.category),
    formatRSD(c.amount),
    `${c.percentage.toFixed(1)}%`,
  ])

  autoTable(doc, {
    startY: 50,
    head: [['Kategorija', 'Iznos', 'Udeo']],
    body: catBody,
    margin: { left: margin, right: margin },
    theme: 'striped',
    headStyles: {
      fillColor: PRIMARY_COLOR,
      textColor: [255, 255, 255],
      fontSize: 8,
      fontStyle: 'bold',
    },
    bodyStyles: { fontSize: 8, textColor: DARK_COLOR },
    alternateRowStyles: { fillColor: [249, 250, 251] },
    columnStyles: {
      0: { cellWidth: 80 },
      1: { halign: 'right' },
      2: { halign: 'center' },
    },
  })

  // --- Top Partners ---
  const finalY = (doc as unknown as { lastAutoTable?: { finalY: number } }).lastAutoTable?.finalY || 50
  const topPartnersY = Math.max(finalY + 20, 90)

  doc.setFontSize(10)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(...DARK_COLOR)
  doc.text('Top partneri po prihodu', margin, topPartnersY)

  const partnersBody = (data.topPartners || []).map((p) => [
    p.name,
    formatRSD(p.amount),
    String(p.invoiceCount),
  ])

  autoTable(doc, {
    startY: topPartnersY + 4,
    head: [['Partner', 'Iznos', 'Faktura']],
    body: partnersBody,
    margin: { left: margin, right: margin },
    theme: 'striped',
    headStyles: {
      fillColor: PRIMARY_COLOR,
      textColor: [255, 255, 255],
      fontSize: 8,
      fontStyle: 'bold',
    },
    bodyStyles: { fontSize: 8, textColor: DARK_COLOR },
    alternateRowStyles: { fillColor: [249, 250, 251] },
    columnStyles: {
      0: { cellWidth: 80 },
      1: { halign: 'right' },
      2: { halign: 'center' },
    },
  })

  addDocFooter(doc, pageWidth, margin)

  return doc
}

/**
 * Generate a Transaction Statement PDF
 */
export function generateTransactionPDF(transactions: TransactionData[], options?: { dateFrom?: string; dateTo?: string }, company?: Partial<CompanyInfo>): jsPDF {
  const co = { ...DEFAULT_COMPANY, ...company }
  const doc = new jsPDF('p', 'mm', 'a4')
  const pageWidth = doc.internal.pageSize.getWidth()
  const margin = 15

  let title = 'Izvod transakcija'
  if (options?.dateFrom && options?.dateTo) {
    title += ` (${formatDate(options.dateFrom)} - ${formatDate(options.dateTo)})`
  }

  addDocHeader(doc, title, pageWidth, margin, co)

  const totalIncome = transactions.filter((t) => t.type === 'prihod').reduce((s, t) => s + t.amount, 0)
  const totalExpense = transactions.filter((t) => t.type === 'rashod').reduce((s, t) => s + t.amount, 0)
  const balance = totalIncome - totalExpense

  const kpiY = 50
  const kpiWidth = (pageWidth - 2 * margin - 10) / 3
  drawKPICard(doc, margin, kpiY, kpiWidth, 'Ukupan prihod', formatRSD(totalIncome), PRIMARY_COLOR)
  drawKPICard(doc, margin + kpiWidth + 5, kpiY, kpiWidth, 'Ukupan rashod', formatRSD(totalExpense), RED_COLOR)
  drawKPICard(doc, margin + 2 * (kpiWidth + 5), kpiY, kpiWidth, 'Saldo', formatRSD(balance), balance >= 0 ? PRIMARY_COLOR : RED_COLOR)

  const body = transactions.map((t) => [
    formatDate(t.date),
    getStatusLabel(t.type),
    getStatusLabel(t.category),
    formatRSD(t.amount),
    t.description,
    t.documentRef || '-',
  ])

  autoTable(doc, {
    startY: kpiY + 30,
    head: [['Datum', 'Tip', 'Kategorija', 'Iznos', 'Opis', 'Dokument']],
    body,
    margin: { left: margin, right: margin },
    theme: 'striped',
    headStyles: {
      fillColor: PRIMARY_COLOR,
      textColor: [255, 255, 255],
      fontSize: 7.5,
      fontStyle: 'bold',
    },
    bodyStyles: { fontSize: 7.5, textColor: DARK_COLOR },
    alternateRowStyles: { fillColor: [249, 250, 251] },
    columnStyles: {
      0: { cellWidth: 22 },
      1: { cellWidth: 18, halign: 'center' },
      2: { cellWidth: 20 },
      3: { cellWidth: 25, halign: 'right' },
      4: { cellWidth: 60 },
      5: { cellWidth: 25 },
    },
    didParseCell: (cellData) => {
      if (cellData.section === 'body' && cellData.column.index === 1) {
        if (cellData.cell.raw === 'Prihod') {
          cellData.cell.styles.textColor = PRIMARY_COLOR
        } else {
          cellData.cell.styles.textColor = RED_COLOR
        }
      }
    },
  })

  addDocFooter(doc, pageWidth, margin)

  return doc
}

// ==================== HELPER FUNCTIONS ====================

function addDocHeader(doc: jsPDF, title: string, pageWidth: number, margin: number, company: CompanyInfo) {
  // Green accent bar
  doc.setFillColor(...PRIMARY_COLOR)
  doc.rect(0, 0, pageWidth, 5, 'F')

  // Company name
  doc.setTextColor(...DARK_COLOR)
  doc.setFontSize(8)
  doc.setFont('helvetica', 'normal')
  doc.text(company.name, margin, 14)
  doc.setTextColor(...MUTED_COLOR)
  doc.text(`PIB: ${company.pib} | ${company.address}, ${company.city}`, margin, 19)

  // Title
  doc.setFontSize(16)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(...DARK_COLOR)
  doc.text(title, pageWidth - margin, 14, { align: 'right' })

  // Date generated
  doc.setFontSize(7)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(...MUTED_COLOR)
  doc.text(`Datum generisanja: ${formatDate(new Date().toISOString())}`, pageWidth - margin, 19, { align: 'right' })

  // Separator line
  doc.setDrawColor(200, 200, 200)
  doc.setLineWidth(0.3)
  doc.line(margin, 24, pageWidth - margin, 24)
}

function drawKPICard(doc: jsPDF, x: number, y: number, width: number, label: string, value: string, color: [number, number, number]) {
  doc.setFillColor(249, 250, 251)
  doc.roundedRect(x, y, width, 22, 3, 3, 'F')

  doc.setFillColor(...color)
  doc.roundedRect(x, y, 3, 22, 1.5, 1.5, 'F')

  doc.setFontSize(7)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(...MUTED_COLOR)
  doc.text(label, x + 7, y + 8)

  doc.setFontSize(11)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(...DARK_COLOR)
  doc.text(value, x + 7, y + 16)
}

function addDocFooter(doc: jsPDF, pageWidth: number, margin: number) {
  const pageCount = doc.getNumberOfPages()
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i)
    doc.setFontSize(7)
    doc.setTextColor(...MUTED_COLOR)
    doc.text('Reflection Business ERP', margin, 290)
    doc.text(`Strana ${i} od ${pageCount}`, pageWidth - margin, 290, { align: 'right' })
  }
}

/**
 * Convert number to Serbian words (simplified)
 */
export function numberToSerbian(amount: number): string {
  const ones = ['', 'jedan', 'dva', 'tri', 'četiri', 'pet', 'šest', 'sedam', 'osam', 'devet']
  const teens = ['deset', 'jedanaest', 'dvanaest', 'trinaest', 'četrnaest', 'petnaest', 'šesnaest', 'sedamnaest', 'osamnaest', 'devetnaest']
  const tens = ['', 'deset', 'dvadeset', 'trideset', 'četrdeset', 'pedeset', 'šestdeset', 'sedamdeset', 'osamdeset', 'devedeset']

  const intPart = Math.floor(amount)
  const decPart = Math.round((amount - intPart) * 100)

  if (intPart === 0) return `nula dinara i ${decPart / 100 < 1 ? 'nula' : String(decPart)} para`

  let words = ''

  if (intPart >= 1000000) {
    const millions = Math.floor(intPart / 1000000)
    words += `${convertHundreds(millions)} milion${millions === 1 ? '' : 'a'} `
    const remaining = intPart % 1000000
    if (remaining > 0) {
      words += convertHundreds(remaining) + ' '
    }
  } else {
    words += convertHundreds(intPart) + ' '
  }

  const lastTwo = intPart % 100
  const lastOne = intPart % 10
  let dinarWord = 'dinara'
  if (lastTwo >= 11 && lastTwo <= 19) {
    dinarWord = 'dinara'
  } else if (lastOne >= 2 && lastOne <= 4) {
    dinarWord = 'dinara'
  } else if (lastOne === 1) {
    dinarWord = 'dinar'
  }

  words += dinarWord

  if (decPart > 0) {
    words += ` i ${decPart} para`
  }

  return words
}

function convertHundreds(n: number): string {
  if (n === 0) return ''
  const hundreds = ['', 'sto', 'dvesta', 'trista', 'četristo', 'petsto', 'šeststo', 'sedamsto', 'osamsto', 'devetsto']
  const ones = ['', 'jedan', 'dva', 'tri', 'četiri', 'pet', 'šest', 'sedam', 'osam', 'devet']
  const teens = ['deset', 'jedanaest', 'dvanaest', 'trinaest', 'četrnaest', 'petnaest', 'šesnaest', 'sedamnaest', 'osamnaest', 'devetnaest']
  const tens = ['', 'deset', 'dvadeset', 'trideset', 'četrdeset', 'pedeset', 'šestdeset', 'sedamdeset', 'osamdeset', 'devedeset']

  const h = Math.floor(n / 100)
  const remainder = n % 100
  let result = hundreds[h] || ''

  if (remainder >= 10 && remainder < 20) {
    result += teens[remainder - 10]
  } else {
    const t = Math.floor(remainder / 10)
    const o = remainder % 10
    result += (tens[t] || '') + (ones[o] || '')
  }

  return result ? result + ' ' : ''
}

/**
 * Download a jsPDF document as a file
 */
export function downloadPDF(doc: jsPDF, filename: string) {
  doc.save(filename)
}

// ==================== ADVANCED REPORT GENERATORS ====================

// Re-export template generators
export { generateFinancialSummaryPDF } from './templates/financial'
export type { FinancialSummaryData } from './templates/financial'

export { generateSalesAnalyticsPDF } from './templates/sales'
export type { SalesAnalyticsData } from './templates/sales'

export { generateInventoryStatusPDF } from './templates/inventory'
export type { InventoryStatusData } from './templates/inventory'

export { generateEmployeePerformancePDF } from './templates/employee'
export type { EmployeePerformanceData } from './templates/employee'

export { generateInvoiceSummaryPDF } from './templates/invoice'
export type { InvoiceSummaryData } from './templates/invoice'

export { generateProjectProgressPDF } from './templates/project'
export type { ProjectProgressData } from './templates/project'

export { generateCustomerAnalysisPDF } from './templates/customer'
export type { CustomerAnalysisData } from './templates/customer'

// Re-export chart drawing utilities
export {
  drawBarChart,
  drawLineChart,
  drawPieChart,
  drawAreaChart,
  drawMultiLineChart,
  drawHorizontalBarChart,
  CHART_COLORS,
  EMERALD,
  CYAN,
  ORANGE,
  VIOLET,
} from './chart-drawing'
export type {
  BarChartOptions,
  LineChartOptions,
  PieChartOptions,
  AreaChartOptions,
  ChartColor,
} from './chart-drawing'
