import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import {
  drawLineChart,
  drawPieChart,
  drawBarChart,
  CHART_COLORS,
  EMERALD,
  CYAN,
} from '../chart-drawing'
import type { CompanyInfo } from '../pdf-generator'

// ==================== TYPES ====================

export interface CustomerAnalysisData {
  dateFrom?: string
  dateTo?: string
  totalCustomers: number
  newCustomers: number
  activeCustomers: number
  totalRevenue: number
  avgRevenuePerCustomer: number
  customerGrowth: Array<{ month: string; count: number }>
  segmentDistribution: Array<{ segment: string; count: number; revenue: number }>
  topCustomers: Array<{ name: string; revenue: number; orders: number; segment: string }>
  revenueBySegment: Array<{ segment: string; revenue: number; avgOrder: number }>
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
    doc.text('Reflection Business ERP — Analiza klijenata', m, 290)
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

export function generateCustomerAnalysisPDF(data: CustomerAnalysisData, company?: Partial<CompanyInfo>): jsPDF {
  const co = { ...DEFAULT_COMPANY, ...company }
  const doc = new jsPDF('p', 'mm', 'a4')
  const pw = doc.internal.pageSize.getWidth()
  const m = 15
  const cw = pw - 2 * m

  const title = 'Izveštaj analize klijenata'

  // PAGE 1
  addPageHeader(doc, title, pw, m, co)

  // Executive Summary
  const sy = 25
  doc.setFontSize(9); doc.setFont('helvetica', 'bold'); doc.setTextColor(...DARK)
  doc.text('Izvršni rezime', m, sy)
  doc.setFontSize(7); doc.setFont('helvetica', 'normal'); doc.setTextColor(75, 85, 99)
  doc.text(
    `Ukupno ${data.totalCustomers} klijenata, od čega ${data.activeCustomers} aktivnih. Novih klijenata: ${data.newCustomers}. Ukupan prihod: ${formatRSD(data.totalRevenue)}, prosečan prihod po klijentu: ${formatRSD(data.avgRevenuePerCustomer)}.`,
    m, sy + 5, { maxWidth: cw }
  )

  // KPIs
  const ky = sy + 14
  const kw = (cw - 15) / 4
  drawKPICard(doc, m, ky, kw, 'Klijenata ukupno', String(data.totalCustomers), PRIMARY)
  drawKPICard(doc, m + kw + 5, ky, kw, 'Aktivnih', String(data.activeCustomers), PRIMARY)
  drawKPICard(doc, m + 2 * (kw + 5), ky, kw, 'Novih', String(data.newCustomers), CYAN.rgb)
  drawKPICard(doc, m + 3 * (kw + 5), ky, kw, 'Prosek/klijenta', formatRSD(data.avgRevenuePerCustomer), PRIMARY)

  // Customer Growth Line Chart
  drawLineChart(doc, {
    x: m, y: ky + 26, width: cw, height: 60,
    title: 'Rast broja klijenata',
    data: data.customerGrowth.map((cg) => ({
      label: cg.month.substring(5),
      value: cg.count,
    })),
    color: EMERALD, showArea: true,
  })

  // Segment Distribution Pie
  const pieY = ky + 92
  drawPieChart(doc, {
    x: m, y: pieY, width: cw, height: 65,
    title: 'Distribucija po segmentima',
    data: data.segmentDistribution.map((sd) => ({
      label: sd.segment,
      value: sd.revenue,
    })),
    legendPosition: 'right',
    innerRadius: 12,
  })

  // Top Customers Table
  const ty = pieY + 70
  doc.setFontSize(9); doc.setFont('helvetica', 'bold'); doc.setTextColor(...DARK)
  doc.text('Top klijenti', m, ty)

  autoTable(doc, {
    startY: ty + 4,
    head: [['Klijent', 'Segment', 'Prihod', 'Narudžbine']],
    body: data.topCustomers.map((tc) => [
      tc.name, tc.segment, formatRSD(tc.revenue), String(tc.orders),
    ]),
    margin: { left: m, right: m },
    theme: 'grid',
    headStyles: { fillColor: PRIMARY, textColor: [255, 255, 255], fontSize: 7, fontStyle: 'bold', halign: 'center' },
    bodyStyles: { fontSize: 7, textColor: DARK },
    columnStyles: { 0: { cellWidth: 60 }, 1: { cellWidth: 35 }, 2: { halign: 'right' }, 3: { halign: 'center' } },
    alternateRowStyles: { fillColor: [249, 250, 251] },
  })

  // PAGE 2: Revenue by Segment + Customer Growth Detail
  doc.addPage()
  addPageHeader(doc, 'Segmenti i rast', pw, m, co)

  doc.setFontSize(9); doc.setFont('helvetica', 'bold'); doc.setTextColor(...DARK)
  doc.text('Prihod po segmentu', m, 27)

  autoTable(doc, {
    startY: 31,
    head: [['Segment', 'Klijenata', 'Ukupan prihod', 'Prosek narudžbine']],
    body: data.revenueBySegment.map((rs) => [
      rs.segment,
      String(data.segmentDistribution.find((sd) => sd.segment === rs.segment)?.count || 0),
      formatRSD(rs.revenue),
      formatRSD(rs.avgOrder),
    ]),
    margin: { left: m, right: m },
    theme: 'grid',
    headStyles: { fillColor: PRIMARY, textColor: [255, 255, 255], fontSize: 7, fontStyle: 'bold', halign: 'center' },
    bodyStyles: { fontSize: 7, textColor: DARK },
    columnStyles: { 0: { cellWidth: 50 }, 1: { halign: 'center' }, 2: { halign: 'right' }, 3: { halign: 'right' } },
    alternateRowStyles: { fillColor: [249, 250, 251] },
  })

  const fy = (doc as unknown as { lastAutoTable?: { finalY: number } }).lastAutoTable?.finalY || 50
  const barY = Math.max(fy + 15, 80)

  // Revenue by Segment Bar
  drawBarChart(doc, {
    x: m, y: barY, width: cw, height: 60,
    title: 'Prihod po segmentu',
    data: data.revenueBySegment.map((rs, i) => ({
      label: rs.segment.length > 15 ? rs.segment.substring(0, 14) + '…' : rs.segment,
      value: rs.revenue,
      color: CHART_COLORS[i % CHART_COLORS.length],
    })),
    showValues: false,
  })

  // Segment count table
  const scY = barY + 68
  doc.setFontSize(9); doc.setFont('helvetica', 'bold'); doc.setTextColor(...DARK)
  doc.text('Distribucija klijenata po segmentu', m, scY)

  autoTable(doc, {
    startY: scY + 4,
    head: [['Segment', 'Broj klijenata', 'Prihod', 'Udeo']],
    body: data.segmentDistribution.map((sd) => {
      const pct = data.totalRevenue > 0 ? ((sd.revenue / data.totalRevenue) * 100).toFixed(1) : '0.0'
      return [sd.segment, String(sd.count), formatRSD(sd.revenue), `${pct}%`]
    }),
    margin: { left: m, right: m },
    theme: 'grid',
    headStyles: { fillColor: PRIMARY, textColor: [255, 255, 255], fontSize: 7, fontStyle: 'bold', halign: 'center' },
    bodyStyles: { fontSize: 7, textColor: DARK },
    columnStyles: { 0: { cellWidth: 60 }, 1: { halign: 'center' }, 2: { halign: 'right' }, 3: { halign: 'center' } },
    alternateRowStyles: { fillColor: [249, 250, 251] },
  })

  addPageFooter(doc, pw, m)
  return doc
}
