import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import {
  drawBarChart,
  drawLineChart,
  drawPieChart,
  CHART_COLORS,
  EMERALD,
  CYAN,
} from '../chart-drawing'
import type { CompanyInfo } from '../pdf-generator'

// ==================== TYPES ====================

export interface SalesAnalyticsData {
  dateFrom?: string
  dateTo?: string
  totalSales: number
  totalOrders: number
  avgOrderValue: number
  salesByCategory: Array<{ category: string; revenue: number; percentage: number }>
  monthlyTrend: Array<{ month: string; sales: number; orders: number }>
  topProducts: Array<{ name: string; quantitySold: number; revenue: number }>
  salesByPartner: Array<{ name: string; revenue: number; orderCount: number }>
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
const RED: [number, number, number] = [220, 38, 38]

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
    doc.text('Reflection Business ERP — Analitika prodaje', m, 290)
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

export function generateSalesAnalyticsPDF(data: SalesAnalyticsData, company?: Partial<CompanyInfo>): jsPDF {
  const co = { ...DEFAULT_COMPANY, ...company }
  const doc = new jsPDF('p', 'mm', 'a4')
  const pw = doc.internal.pageSize.getWidth()
  const m = 15
  const cw = pw - 2 * m

  let title = 'Izveštaj analitike prodaje'
  if (data.dateFrom && data.dateTo) title += ` (${formatDate(data.dateFrom)} - ${formatDate(data.dateTo)})`

  // PAGE 1
  addPageHeader(doc, title, pw, m, co)

  // Executive Summary
  const sy = 25
  doc.setFontSize(9); doc.setFont('helvetica', 'bold'); doc.setTextColor(...DARK)
  doc.text('Izvršni rezime', m, sy)
  doc.setFontSize(7); doc.setFont('helvetica', 'normal'); doc.setTextColor(75, 85, 99)
  doc.text(
    `Ukupna prodaja iznosi ${formatRSD(data.totalSales)} u ${data.totalOrders} narudžbina. Prosečna vrednost narudžbine je ${formatRSD(data.avgOrderValue)}.`,
    m, sy + 5, { maxWidth: cw }
  )

  // KPIs
  const ky = sy + 14
  const kw = (cw - 10) / 3
  drawKPICard(doc, m, ky, kw, 'Ukupna prodaja', formatRSD(data.totalSales), PRIMARY)
  drawKPICard(doc, m + kw + 5, ky, kw, 'Ukupno narudžbina', String(data.totalOrders), CYAN.rgb)
  drawKPICard(doc, m + 2 * (kw + 5), ky, kw, 'Prosek narudžbine', formatRSD(data.avgOrderValue), PRIMARY)

  // Sales by Category Pie
  const pieData = data.salesByCategory.map((c) => ({
    label: c.category,
    value: c.revenue,
  }))

  drawPieChart(doc, {
    x: m, y: ky + 26, width: cw, height: 70,
    title: 'Prodaja po kategorijama',
    data: pieData, legendPosition: 'right', innerRadius: 15,
  })

  // Monthly Trend Line
  const ly = ky + 100
  drawLineChart(doc, {
    x: m, y: ly, width: cw, height: 60,
    title: 'Mesečni trend prodaje',
    data: data.monthlyTrend.map((mt) => ({
      label: mt.month.substring(5),
      value: mt.sales,
    })),
    color: EMERALD, showArea: true,
  })

  // Top Products Table
  const ty = ly + 68
  doc.setFontSize(9); doc.setFont('helvetica', 'bold'); doc.setTextColor(...DARK)
  doc.text('Top proizvodi', m, ty)

  autoTable(doc, {
    startY: ty + 4,
    head: [['Proizvod', 'Prodato (kom)', 'Prihod']],
    body: data.topProducts.map((p) => [
      p.name, String(p.quantitySold), formatRSD(p.revenue),
    ]),
    margin: { left: m, right: m },
    theme: 'grid',
    headStyles: { fillColor: PRIMARY, textColor: [255, 255, 255], fontSize: 7, fontStyle: 'bold', halign: 'center' },
    bodyStyles: { fontSize: 7, textColor: DARK },
    columnStyles: { 0: { cellWidth: 80 }, 1: { halign: 'center', cellWidth: 30 }, 2: { halign: 'right' } },
    alternateRowStyles: { fillColor: [249, 250, 251] },
  })

  // PAGE 2: Top Partners
  doc.addPage()
  addPageHeader(doc, 'Top partneri po prodaji', pw, m, co)

  doc.setFontSize(9); doc.setFont('helvetica', 'bold'); doc.setTextColor(...DARK)
  doc.text('Partneri sa najvećom prodajom', m, 27)

  autoTable(doc, {
    startY: 31,
    head: [['Partner', 'Prihod', 'Narudžbine']],
    body: data.salesByPartner.map((p) => [p.name, formatRSD(p.revenue), String(p.orderCount)]),
    margin: { left: m, right: m },
    theme: 'grid',
    headStyles: { fillColor: PRIMARY, textColor: [255, 255, 255], fontSize: 7, fontStyle: 'bold', halign: 'center' },
    bodyStyles: { fontSize: 7, textColor: DARK },
    columnStyles: { 0: { cellWidth: 80 }, 1: { halign: 'right' }, 2: { halign: 'center' } },
    alternateRowStyles: { fillColor: [249, 250, 251] },
  })

  const fy = (doc as unknown as { lastAutoTable?: { finalY: number } }).lastAutoTable?.finalY || 50

  // Sales by Category bar chart
  const catBarY = Math.max(fy + 15, 80)
  doc.setFontSize(9); doc.setFont('helvetica', 'bold'); doc.setTextColor(...DARK)
  doc.text('Prodaja po kategorijama — detaljno', m, catBarY)

  drawBarChart(doc, {
    x: m, y: catBarY + 4, width: cw, height: 60,
    data: data.salesByCategory.map((c, i) => ({
      label: c.category.length > 12 ? c.category.substring(0, 11) + '…' : c.category,
      value: c.revenue,
      color: CHART_COLORS[i % CHART_COLORS.length],
    })),
  })

  // Monthly breakdown table
  const tbl2Y = catBarY + 72
  doc.setFontSize(9); doc.setFont('helvetica', 'bold'); doc.setTextColor(...DARK)
  doc.text('Mesečna prodaja i narudžbine', m, tbl2Y)

  autoTable(doc, {
    startY: tbl2Y + 4,
    head: [['Mesec', 'Prodaja', 'Narudžbine', 'Prosek narudžbine']],
    body: data.monthlyTrend.map((mt) => [
      mt.month,
      formatRSD(mt.sales),
      String(mt.orders),
      formatRSD(mt.orders > 0 ? mt.sales / mt.orders : 0),
    ]),
    margin: { left: m, right: m },
    theme: 'grid',
    headStyles: { fillColor: PRIMARY, textColor: [255, 255, 255], fontSize: 7, fontStyle: 'bold', halign: 'center' },
    bodyStyles: { fontSize: 7, textColor: DARK },
    columnStyles: { 0: { cellWidth: 25 }, 1: { halign: 'right' }, 2: { halign: 'center' }, 3: { halign: 'right' } },
    alternateRowStyles: { fillColor: [249, 250, 251] },
  })

  addPageFooter(doc, pw, m)
  return doc
}
