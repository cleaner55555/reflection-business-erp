import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import {
  drawLineChart,
  drawPieChart,
  drawBarChart,
  CHART_COLORS,
  EMERALD,
  ORANGE,
} from '../chart-drawing'
import type { CompanyInfo } from '../pdf-generator'

// ==================== TYPES ====================

export interface InvoiceSummaryData {
  dateFrom?: string
  dateTo?: string
  totalInvoices: number
  totalAmount: number
  paidAmount: number
  outstandingAmount: number
  overdueAmount: number
  monthlyAmounts: Array<{ month: string; amount: number; count: number }>
  statusDistribution: Array<{ status: string; count: number; amount: number }>
  outstandingInvoices: Array<{
    number: string
    partner: string
    amount: number
    dueDate: string
    daysOverdue: number
  }>
}

// ==================== HELPERS ====================

function formatRSD(amount: number): string {
  return new Intl.NumberFormat('sr-RS', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(amount)
}

function formatDate(dateStr: string): string {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  return `${String(d.getDate()).padStart(2, '0')}.${String(d.getMonth() + 1).padStart(2, '0')}.${d.getFullYear()}.`
}

const PRIMARY: [number, number, number] = [5, 150, 105]
const DARK: [number, number, number] = [17, 24, 39]
const MUTED: [number, number, number] = [107, 114, 128]
const RED_C: [number, number, number] = [220, 38, 38]

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

function addPageHeader(doc: jsPDF, title: string, pw: number, m: number, co: CompanyInfo) {
  doc.setFillColor(...PRIMARY); doc.rect(0, 0, pw, 4, 'F')
  doc.setTextColor(...DARK); doc.setFontSize(7); doc.setFont('helvetica', 'normal')
  doc.text(co.name, m, 12)
  doc.setTextColor(...MUTED); doc.text(`PIB: ${co.pib} | ${co.address}, ${co.city}`, m, 17)
  doc.setFontSize(14); doc.setFont('helvetica', 'bold'); doc.setTextColor(...DARK)
  doc.text(title, pw - m, 12, { align: 'right' })
  doc.setFontSize(6); doc.setFont('helvetica', 'normal'); doc.setTextColor(...MUTED)
  doc.text(`Datum: ${formatDate(new Date().toISOString())}`, pw - m, 17, { align: 'right' })
  doc.setDrawColor(200, 200, 200); doc.setLineWidth(0.3); doc.line(m, 21, pw - m, 21)
}

function addPageFooter(doc: jsPDF, pw: number, m: number) {
  const pc = doc.getNumberOfPages()
  for (let i = 1; i <= pc; i++) {
    doc.setPage(i); doc.setFontSize(6); doc.setTextColor(...MUTED)
    doc.text('Reflection Business ERP — Izveštaj faktura', m, 290)
    doc.text(`Strana ${i} od ${pc}`, pw - m, 290, { align: 'right' })
  }
}

function drawKPICard(doc: jsPDF, x: number, y: number, w: number, label: string, value: string, color: [number, number, number]) {
  doc.setFillColor(249, 250, 251); doc.roundedRect(x, y, w, 20, 2, 2, 'F')
  doc.setFillColor(...color); doc.roundedRect(x, y, 2.5, 20, 1, 1, 'F')
  doc.setFontSize(6); doc.setFont('helvetica', 'normal'); doc.setTextColor(...MUTED); doc.text(label, x + 6, y + 7)
  doc.setFontSize(10); doc.setFont('helvetica', 'bold'); doc.setTextColor(...DARK); doc.text(value, x + 6, y + 15)
}

// ==================== MAIN TEMPLATE ====================

export function generateInvoiceSummaryPDF(data: InvoiceSummaryData, company?: Partial<CompanyInfo>): jsPDF {
  const co = { ...DEFAULT_COMPANY, ...company }
  const doc = new jsPDF('p', 'mm', 'a4')
  const pw = doc.internal.pageSize.getWidth()
  const m = 15
  const cw = pw - 2 * m

  let title = 'Izveštaj faktura'
  if (data.dateFrom && data.dateTo) title += ` (${formatDate(data.dateFrom)} - ${formatDate(data.dateTo)})`

  // PAGE 1
  addPageHeader(doc, title, pw, m, co)

  // Executive Summary
  const sy = 25
  doc.setFontSize(9); doc.setFont('helvetica', 'bold'); doc.setTextColor(...DARK)
  doc.text('Izvršni rezime', m, sy)
  doc.setFontSize(7); doc.setFont('helvetica', 'normal'); doc.setTextColor(75, 85, 99)
  doc.text(
    `Ukupno ${data.totalInvoices} faktura u iznosu od ${formatRSD(data.totalAmount)}. Plaćeno ${formatRSD(data.paidAmount)}, neplaćeno ${formatRSD(data.outstandingAmount)}, od čega van roka ${formatRSD(data.overdueAmount)}.`,
    m, sy + 5, { maxWidth: cw }
  )

  // KPIs
  const ky = sy + 14
  const kw = (cw - 15) / 4
  drawKPICard(doc, m, ky, kw, 'Faktura ukupno', String(data.totalInvoices), PRIMARY)
  drawKPICard(doc, m + kw + 5, ky, kw, 'Ukupan iznos', formatRSD(data.totalAmount), PRIMARY)
  drawKPICard(doc, m + 2 * (kw + 5), ky, kw, 'Neplaćeno', formatRSD(data.outstandingAmount), ORANGE.rgb)
  drawKPICard(doc, m + 3 * (kw + 5), ky, kw, 'Van roka', formatRSD(data.overdueAmount), RED_C)

  // Monthly Amounts Line Chart
  drawLineChart(doc, {
    x: m, y: ky + 26, width: cw, height: 60,
    title: 'Mesečni iznosi faktura',
    data: data.monthlyAmounts.map((ma) => ({
      label: ma.month.substring(5),
      value: ma.amount,
    })),
    color: EMERALD, showArea: true,
  })

  // Status Distribution Pie
  const pieY = ky + 92
  drawPieChart(doc, {
    x: m, y: pieY, width: cw, height: 65,
    title: 'Distribucija statusa faktura',
    data: data.statusDistribution.map((sd) => ({
      label: sd.status,
      value: sd.amount,
    })),
    legendPosition: 'right',
    innerRadius: 12,
  })

  // Outstanding Invoices Table
  const ty = pieY + 70
  doc.setFontSize(9); doc.setFont('helvetica', 'bold'); doc.setTextColor(...DARK)
  doc.text('Neplaćene fakture', m, ty)

  autoTable(doc, {
    startY: ty + 4,
    head: [['Broj', 'Partner', 'Iznos', 'Valuta', 'Dana kašnjenja']],
    body: data.outstandingInvoices.map((oi) => [
      oi.number, oi.partner, formatRSD(oi.amount), formatDate(oi.dueDate), String(oi.daysOverdue),
    ]),
    margin: { left: m, right: m },
    theme: 'grid',
    headStyles: { fillColor: ORANGE.rgb, textColor: [255, 255, 255], fontSize: 7, fontStyle: 'bold', halign: 'center' },
    bodyStyles: { fontSize: 7, textColor: DARK },
    columnStyles: { 0: { cellWidth: 30 }, 1: { cellWidth: 55 }, 2: { halign: 'right' }, 3: { halign: 'center' }, 4: { halign: 'center' } },
    alternateRowStyles: { fillColor: [249, 250, 251] },
    didParseCell: (cd) => {
      if (cd.section === 'body' && cd.column.index === 4) {
        const v = parseInt(cd.cell.raw as string)
        if (v > 30) { cd.cell.styles.textColor = RED_C; cd.cell.styles.fontStyle = 'bold' }
        else if (v > 0) { cd.cell.styles.textColor = ORANGE.rgb }
      }
    },
  })

  // PAGE 2: Monthly breakdown + Status counts
  doc.addPage()
  addPageHeader(doc, 'Detaljni pregled', pw, m, co)

  doc.setFontSize(9); doc.setFont('helvetica', 'bold'); doc.setTextColor(...DARK)
  doc.text('Mesečni pregled faktura', m, 27)

  autoTable(doc, {
    startY: 31,
    head: [['Mesec', 'Broj faktura', 'Ukupan iznos']],
    body: data.monthlyAmounts.map((ma) => [
      ma.month, String(ma.count), formatRSD(ma.amount),
    ]),
    margin: { left: m, right: m },
    theme: 'grid',
    headStyles: { fillColor: PRIMARY, textColor: [255, 255, 255], fontSize: 7, fontStyle: 'bold', halign: 'center' },
    bodyStyles: { fontSize: 7, textColor: DARK },
    columnStyles: { 0: { cellWidth: 40 }, 1: { halign: 'center' }, 2: { halign: 'right' } },
    alternateRowStyles: { fillColor: [249, 250, 251] },
  })

  const fy = (doc as unknown as { lastAutoTable?: { finalY: number } }).lastAutoTable?.finalY || 50
  const scY = Math.max(fy + 15, 80)

  // Status Counts Table
  doc.setFontSize(9); doc.setFont('helvetica', 'bold'); doc.setTextColor(...DARK)
  doc.text('Pregled po statusu', m, scY)

  autoTable(doc, {
    startY: scY + 4,
    head: [['Status', 'Broj', 'Ukupan iznos', 'Udeo']],
    body: data.statusDistribution.map((sd) => {
      const pct = data.totalInvoices > 0 ? ((sd.count / data.totalInvoices) * 100).toFixed(1) : '0.0'
      return [sd.status, String(sd.count), formatRSD(sd.amount), `${pct}%`]
    }),
    margin: { left: m, right: m },
    theme: 'grid',
    headStyles: { fillColor: PRIMARY, textColor: [255, 255, 255], fontSize: 7, fontStyle: 'bold', halign: 'center' },
    bodyStyles: { fontSize: 7, textColor: DARK },
    columnStyles: { 0: { cellWidth: 50 }, 1: { halign: 'center' }, 2: { halign: 'right' }, 3: { halign: 'center' } },
    alternateRowStyles: { fillColor: [249, 250, 251] },
  })

  const fy2 = (doc as unknown as { lastAutoTable?: { finalY: number } }).lastAutoTable?.finalY || 100
  const barY = Math.max(fy2 + 15, 130)

  // Monthly count bar chart
  drawBarChart(doc, {
    x: m, y: barY, width: cw, height: 55,
    title: 'Broj faktura po mesecima',
    data: data.monthlyAmounts.map((ma) => ({
      label: ma.month.substring(5),
      value: ma.count,
    })),
    showValues: true,
  })

  addPageFooter(doc, pw, m)
  return doc
}
