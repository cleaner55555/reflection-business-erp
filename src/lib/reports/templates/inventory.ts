import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import {
  drawBarChart,
  drawPieChart,
  CHART_COLORS,
  EMERALD,
  ORANGE,
  RED,
} from '../chart-drawing'
import type { CompanyInfo } from '../pdf-generator'

// ==================== TYPES ====================

export interface InventoryStatusData {
  dateFrom?: string
  dateTo?: string
  totalProducts: number
  totalStockValue: number
  lowStockCount: number
  outOfStockCount: number
  stockByCategory: Array<{ category: string; itemCount: number; stockValue: number }>
  stockLevels: Array<{ name: string; current: number; minimum: number; value: number }>
  lowStockAlerts: Array<{ name: string; current: number; minimum: number; deficit: number }>
  stockMovement: Array<{ category: string; incoming: number; outgoing: number }>
  deadStock: Array<{ name: string; stockValue: number; daysInactive: number }>
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
    doc.text('Reflection Business ERP — Status inventara', m, 290)
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

export function generateInventoryStatusPDF(data: InventoryStatusData, company?: Partial<CompanyInfo>): jsPDF {
  const co = { ...DEFAULT_COMPANY, ...company }
  const doc = new jsPDF('p', 'mm', 'a4')
  const pw = doc.internal.pageSize.getWidth()
  const m = 15
  const cw = pw - 2 * m

  const title = 'Izveštaj statusa inventara'

  // PAGE 1
  addPageHeader(doc, title, pw, m, co)

  // Executive Summary
  const sy = 25
  doc.setFontSize(9); doc.setFont('helvetica', 'bold'); doc.setTextColor(...DARK)
  doc.text('Izvršni rezime', m, sy)
  doc.setFontSize(7); doc.setFont('helvetica', 'normal'); doc.setTextColor(75, 85, 99)
  doc.text(
    `Ukupno ${data.totalProducts} proizvoda sa vrednošću od ${formatRSD(data.totalStockValue)}. ${data.lowStockCount} proizvoda sa niskim zalihama, ${data.outOfStockCount} bez zaliha.`,
    m, sy + 5, { maxWidth: cw }
  )

  // KPIs
  const ky = sy + 14
  const kw = (cw - 15) / 4
  drawKPICard(doc, m, ky, kw, 'Proizvoda ukupno', String(data.totalProducts), PRIMARY)
  drawKPICard(doc, m + kw + 5, ky, kw, 'Vrednost zaliha', formatRSD(data.totalStockValue), PRIMARY)
  drawKPICard(doc, m + 2 * (kw + 5), ky, kw, 'Niska zaliha', String(data.lowStockCount), ORANGE.rgb)
  drawKPICard(doc, m + 3 * (kw + 5), ky, kw, 'Bez zaliha', String(data.outOfStockCount), RED_C)

  // Stock by Category Pie
  const pieData = data.stockByCategory.map((c) => ({
    label: c.category,
    value: c.stockValue,
  }))

  drawPieChart(doc, {
    x: m, y: ky + 26, width: cw, height: 65,
    title: 'Vrednost zaliha po kategorijama',
    data: pieData, legendPosition: 'right', innerRadius: 12,
  })

  // Stock Levels Bar Chart
  const chartY = ky + 95
  drawBarChart(doc, {
    x: m, y: chartY, width: cw, height: 60,
    title: 'Nivo zaliha — top 10 proizvoda',
    data: data.stockLevels.slice(0, 10).map((s) => ({
      label: s.name.length > 15 ? s.name.substring(0, 14) + '…' : s.name,
      value: s.current,
    })),
    showValues: false,
  })

  // Category Breakdown Table
  const ty = chartY + 68
  doc.setFontSize(9); doc.setFont('helvetica', 'bold'); doc.setTextColor(...DARK)
  doc.text('Pregled po kategorijama', m, ty)

  autoTable(doc, {
    startY: ty + 4,
    head: [['Kategorija', 'Broj stavki', 'Vrednost zaliha']],
    body: data.stockByCategory.map((c) => [
      c.category, String(c.itemCount), formatRSD(c.stockValue),
    ]),
    margin: { left: m, right: m },
    theme: 'grid',
    headStyles: { fillColor: PRIMARY, textColor: [255, 255, 255], fontSize: 7, fontStyle: 'bold', halign: 'center' },
    bodyStyles: { fontSize: 7, textColor: DARK },
    columnStyles: { 0: { cellWidth: 80 }, 1: { halign: 'center' }, 2: { halign: 'right' } },
    alternateRowStyles: { fillColor: [249, 250, 251] },
  })

  // PAGE 2: Low Stock Alerts + Stock Movement
  doc.addPage()
  addPageHeader(doc, 'Upozorenja i pokretljivost', pw, m, co)

  // Low Stock Alerts Table
  doc.setFontSize(9); doc.setFont('helvetica', 'bold'); doc.setTextColor(...RED_C)
  doc.text(`Upozorenja niskih zaliha (${data.lowStockAlerts.length})`, m, 27)

  autoTable(doc, {
    startY: 31,
    head: [['Proizvod', 'Trenutna', 'Minimalna', 'Deficit']],
    body: data.lowStockAlerts.map((a) => [
      a.name, String(a.current), String(a.minimum), String(a.deficit),
    ]),
    margin: { left: m, right: m },
    theme: 'grid',
    headStyles: { fillColor: RED_C, textColor: [255, 255, 255], fontSize: 7, fontStyle: 'bold', halign: 'center' },
    bodyStyles: { fontSize: 7, textColor: DARK },
    columnStyles: { 0: { cellWidth: 80 }, 1: { halign: 'center' }, 2: { halign: 'center' }, 3: { halign: 'center' } },
    alternateRowStyles: { fillColor: [254, 242, 242] },
    didParseCell: (cd) => {
      if (cd.section === 'body' && cd.column.index === 3) {
        cd.cell.styles.textColor = RED_C
        cd.cell.styles.fontStyle = 'bold'
      }
    },
  })

  const fy = (doc as unknown as { lastAutoTable?: { finalY: number } }).lastAutoTable?.finalY || 50
  const movY = Math.max(fy + 15, 80)

  // Stock Movement Table
  doc.setFontSize(9); doc.setFont('helvetica', 'bold'); doc.setTextColor(...DARK)
  doc.text('Pokretljivost zaliha', m, movY)

  autoTable(doc, {
    startY: movY + 4,
    head: [['Kategorija', 'Ulaz', 'Izlaz', 'Neto']],
    body: data.stockMovement.map((sm) => [
      sm.category, String(sm.incoming), String(sm.outgoing), String(sm.incoming - sm.outgoing),
    ]),
    margin: { left: m, right: m },
    theme: 'grid',
    headStyles: { fillColor: PRIMARY, textColor: [255, 255, 255], fontSize: 7, fontStyle: 'bold', halign: 'center' },
    bodyStyles: { fontSize: 7, textColor: DARK },
    columnStyles: { 0: { cellWidth: 80 }, 1: { halign: 'center' }, 2: { halign: 'center' }, 3: { halign: 'center' } },
    alternateRowStyles: { fillColor: [249, 250, 251] },
    didParseCell: (cd) => {
      if (cd.section === 'body' && cd.column.index === 3) {
        const v = cd.cell.raw as string
        cd.cell.styles.textColor = parseInt(v) >= 0 ? PRIMARY : RED_C
      }
    },
  })

  // Dead Stock
  const dsfy = (doc as unknown as { lastAutoTable?: { finalY: number } }).lastAutoTable?.finalY || 100
  const dsY = Math.max(dsfy + 15, 130)

  doc.setFontSize(9); doc.setFont('helvetica', 'bold'); doc.setTextColor(...ORANGE.rgb)
  doc.text('Mrtvi inventar (bez pokretanja 90+ dana)', m, dsY)

  autoTable(doc, {
    startY: dsY + 4,
    head: [['Proizvod', 'Vrednost zalihe', 'Dana bez pokretanja']],
    body: data.deadStock.map((d) => [d.name, formatRSD(d.stockValue), String(d.daysInactive)]),
    margin: { left: m, right: m },
    theme: 'grid',
    headStyles: { fillColor: ORANGE.rgb, textColor: [255, 255, 255], fontSize: 7, fontStyle: 'bold', halign: 'center' },
    bodyStyles: { fontSize: 7, textColor: DARK },
    columnStyles: { 0: { cellWidth: 80 }, 1: { halign: 'right' }, 2: { halign: 'center' } },
    alternateRowStyles: { fillColor: [255, 247, 237] },
  })

  addPageFooter(doc, pw, m)
  return doc
}
