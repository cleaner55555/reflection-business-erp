import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import {
  drawBarChart,
  drawLineChart,
  drawPieChart,
  CHART_COLORS,
  EMERALD,
  ORANGE,
  CYAN,
} from '../chart-drawing'
import type { CompanyInfo } from '../pdf-generator'

// ==================== TYPES ====================

export interface FinancialSummaryData {
  dateFrom?: string
  dateTo?: string
  totalRevenue: number
  totalExpenses: number
  netProfit: number
  monthlyBreakdown: Array<{
    month: string
    revenue: number
    expenses: number
    profit: number
  }>
  expenseByCategory: Array<{
    category: string
    amount: number
    percentage: number
  }>
  topPartners: Array<{
    name: string
    amount: number
    invoiceCount: number
  }>
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

const PRIMARY_COLOR: [number, number, number] = [5, 150, 105]
const DARK_COLOR: [number, number, number] = [17, 24, 39]
const MUTED_COLOR: [number, number, number] = [107, 114, 128]
const ACCENT_COLOR: [number, number, number] = [245, 245, 244]
const RED_COLOR: [number, number, number] = [220, 38, 38]

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

// ==================== HEADER / FOOTER ====================

function addPageHeader(doc: jsPDF, title: string, pageWidth: number, margin: number, company: CompanyInfo) {
  // Green accent bar
  doc.setFillColor(...PRIMARY_COLOR)
  doc.rect(0, 0, pageWidth, 4, 'F')

  // Company name
  doc.setTextColor(...DARK_COLOR)
  doc.setFontSize(7)
  doc.setFont('helvetica', 'normal')
  doc.text(company.name, margin, 12)
  doc.setTextColor(...MUTED_COLOR)
  doc.text(`PIB: ${company.pib} | ${company.address}, ${company.city}`, margin, 17)

  // Title
  doc.setFontSize(14)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(...DARK_COLOR)
  doc.text(title, pageWidth - margin, 12, { align: 'right' })

  // Date
  doc.setFontSize(6)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(...MUTED_COLOR)
  doc.text(`Datum generisanja: ${formatDate(new Date().toISOString())}`, pageWidth - margin, 17, { align: 'right' })

  // Separator
  doc.setDrawColor(200, 200, 200)
  doc.setLineWidth(0.3)
  doc.line(margin, 21, pageWidth - margin, 21)
}

function addPageFooter(doc: jsPDF, pageWidth: number, margin: number) {
  const pageCount = doc.getNumberOfPages()
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i)
    doc.setFontSize(6)
    doc.setTextColor(...MUTED_COLOR)
    doc.text('Reflection Business ERP — Finansijski izveštaj', margin, 290)
    doc.text(`Strana ${i} od ${pageCount}`, pageWidth - margin, 290, { align: 'right' })
  }
}

function drawKPICard(doc: jsPDF, x: number, y: number, w: number, label: string, value: string, color: [number, number, number]) {
  doc.setFillColor(249, 250, 251)
  doc.roundedRect(x, y, w, 20, 2, 2, 'F')
  doc.setFillColor(...color)
  doc.roundedRect(x, y, 2.5, 20, 1, 1, 'F')
  doc.setFontSize(6)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(...MUTED_COLOR)
  doc.text(label, x + 6, y + 7)
  doc.setFontSize(10)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(...DARK_COLOR)
  doc.text(value, x + 6, y + 15)
}

// ==================== MAIN TEMPLATE ====================

export function generateFinancialSummaryPDF(data: FinancialSummaryData, company?: Partial<CompanyInfo>): jsPDF {
  const co = { ...DEFAULT_COMPANY, ...company }
  const doc = new jsPDF('p', 'mm', 'a4')
  const pageWidth = doc.internal.pageSize.getWidth()
  const margin = 15
  const contentWidth = pageWidth - 2 * margin

  let title = 'Finansijski izveštaj'
  if (data.dateFrom && data.dateTo) {
    title += ` (${formatDate(data.dateFrom)} - ${formatDate(data.dateTo)})`
  }

  // ── PAGE 1: Executive Summary + Charts ──
  addPageHeader(doc, title, pageWidth, margin, co)

  // Executive Summary
  const summaryY = 25
  doc.setFontSize(9)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(...DARK_COLOR)
  doc.text('Izvršni rezime', margin, summaryY)

  doc.setFontSize(7)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(75, 85, 99)
  const marginPct = data.totalRevenue > 0 ? ((data.netProfit / data.totalRevenue) * 100).toFixed(1) : '0.0'
  const summaryText = `Ukupan prihod iznosi ${formatRSD(data.totalRevenue)}, dok su rashodi ${formatRSD(data.totalExpenses)}. Neto dobit je ${formatRSD(data.netProfit)} sa maržom od ${marginPct}%.`
  doc.text(summaryText, margin, summaryY + 5, { maxWidth: contentWidth })

  // KPI Cards
  const kpiY = summaryY + 14
  const kpiW = (contentWidth - 10) / 3
  drawKPICard(doc, margin, kpiY, kpiW, 'Ukupan prihod', formatRSD(data.totalRevenue), PRIMARY_COLOR)
  drawKPICard(doc, margin + kpiW + 5, kpiY, kpiW, 'Ukupan rashod', formatRSD(data.totalExpenses), ORANGE.rgb)
  drawKPICard(doc, margin + 2 * (kpiW + 5), kpiY, kpiW, 'Neto dobit', formatRSD(data.netProfit), data.netProfit >= 0 ? PRIMARY_COLOR : RED_COLOR)

  // Revenue vs Expense Bar Chart
  const chartY = kpiY + 28
  const barData = data.monthlyBreakdown.map((m) => ({
    label: m.month.substring(5), // "01", "02", etc.
    value: m.revenue,
    color: EMERALD,
  }))

  const barData2 = data.monthlyBreakdown.map((m) => ({
    label: m.month.substring(5),
    value: m.expenses,
    color: ORANGE,
  }))

  // Combined revenue/expense bar chart (draw manually side by side)
  const halfW = (contentWidth - 5) / 2

  // We need two bar charts side by side - revenue and expenses
  // Simplified: draw one bar chart with revenue per month
  drawBarChart(doc, {
    x: margin,
    y: chartY,
    width: halfW,
    height: 60,
    title: 'Mesečni prihodi',
    data: barData,
    showValues: false,
  })

  drawBarChart(doc, {
    x: margin + halfW + 5,
    y: chartY,
    width: halfW,
    height: 60,
    title: 'Mesečni rashodi',
    data: barData2,
    showValues: false,
  })

  // Profit Trend Line Chart
  const lineY = chartY + 68
  drawLineChart(doc, {
    x: margin,
    y: lineY,
    width: contentWidth,
    height: 60,
    title: 'Trend dobiti',
    data: data.monthlyBreakdown.map((m) => ({
      label: m.month.substring(5),
      value: m.profit,
    })),
    color: CYAN,
    showArea: true,
  })

  // Expense Pie Chart
  const pieY = lineY + 68
  const pieData = data.expenseByCategory.slice(0, 6).map((c) => ({
    label: c.category,
    value: c.amount,
  }))

  drawPieChart(doc, {
    x: margin,
    y: pieY,
    width: contentWidth / 2,
    height: 70,
    title: 'Rashodi po kategorijama',
    data: pieData,
    legendPosition: 'right',
    innerRadius: 15,
  })

  // Summary Table
  const tableY = pieY + 75
  doc.setFontSize(9)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(...DARK_COLOR)
  doc.text('Mesečni pregled', margin, tableY)

  const monthlyBody = data.monthlyBreakdown.map((m) => [
    m.month,
    formatRSD(m.revenue),
    formatRSD(m.expenses),
    formatRSD(m.profit),
    m.revenue > 0 ? `${((m.profit / m.revenue) * 100).toFixed(1)}%` : '0.0%',
  ])

  autoTable(doc, {
    startY: tableY + 4,
    head: [['Mesec', 'Prihod', 'Rashod', 'Dobit', 'Marža']],
    body: monthlyBody,
    margin: { left: margin, right: margin },
    theme: 'grid',
    headStyles: {
      fillColor: PRIMARY_COLOR,
      textColor: [255, 255, 255],
      fontSize: 7,
      fontStyle: 'bold',
      halign: 'center',
    },
    bodyStyles: { fontSize: 7, textColor: DARK_COLOR },
    columnStyles: {
      0: { cellWidth: 25 },
      1: { halign: 'right', cellWidth: 35 },
      2: { halign: 'right', cellWidth: 35 },
      3: { halign: 'right', cellWidth: 35 },
      4: { halign: 'center', cellWidth: 20 },
    },
    alternateRowStyles: { fillColor: [249, 250, 251] },
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

  // ── PAGE 2: Top Partners + Expense Categories ──
  doc.addPage()
  addPageHeader(doc, 'Top partneri i kategorije', pageWidth, margin, co)

  // Top Partners
  doc.setFontSize(9)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(...DARK_COLOR)
  doc.text('Top partneri po prihodu', margin, 27)

  const partnersBody = data.topPartners.map((p) => [
    p.name,
    formatRSD(p.amount),
    String(p.invoiceCount),
  ])

  autoTable(doc, {
    startY: 31,
    head: [['Partner', 'Iznos', 'Broj faktura']],
    body: partnersBody,
    margin: { left: margin, right: margin },
    theme: 'grid',
    headStyles: {
      fillColor: PRIMARY_COLOR,
      textColor: [255, 255, 255],
      fontSize: 7,
      fontStyle: 'bold',
    },
    bodyStyles: { fontSize: 7, textColor: DARK_COLOR },
    columnStyles: {
      0: { cellWidth: 80 },
      1: { halign: 'right' },
      2: { halign: 'center' },
    },
    alternateRowStyles: { fillColor: [249, 250, 251] },
  })

  const finalY = (doc as unknown as { lastAutoTable?: { finalY: number } }).lastAutoTable?.finalY || 50
  const catY = Math.max(finalY + 15, 90)

  // Expense Categories Table
  doc.setFontSize(9)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(...DARK_COLOR)
  doc.text('Rashodi po kategorijama', margin, catY)

  const catBody = data.expenseByCategory.map((c) => [
    c.category,
    formatRSD(c.amount),
    `${c.percentage.toFixed(1)}%`,
  ])

  autoTable(doc, {
    startY: catY + 4,
    head: [['Kategorija', 'Iznos', 'Udeo']],
    body: catBody,
    margin: { left: margin, right: margin },
    theme: 'grid',
    headStyles: {
      fillColor: PRIMARY_COLOR,
      textColor: [255, 255, 255],
      fontSize: 7,
      fontStyle: 'bold',
    },
    bodyStyles: { fontSize: 7, textColor: DARK_COLOR },
    columnStyles: {
      0: { cellWidth: 80 },
      1: { halign: 'right' },
      2: { halign: 'center' },
    },
    alternateRowStyles: { fillColor: [249, 250, 251] },
  })

  // Footer on all pages
  addPageFooter(doc, pageWidth, margin)

  return doc
}
