import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import {
  drawPieChart,
  drawBarChart,
  CHART_COLORS,
  EMERALD,
} from '../chart-drawing'
import type { CompanyInfo } from '../pdf-generator'

// ==================== TYPES ====================

export interface ProjectProgressData {
  dateFrom?: string
  dateTo?: string
  totalProjects: number
  completedProjects: number
  inProgressProjects: number
  totalBudget: number
  totalSpent: number
  statusDistribution: Array<{ status: string; count: number; budget: number }>
  projects: Array<{
    name: string
    status: string
    startDate: string
    endDate: string
    budget: number
    spent: number
    progress: number
    manager: string
  }>
  budgetByStatus: Array<{ status: string; budget: number; spent: number }>
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
    doc.text('Reflection Business ERP — Napredak projekata', m, 290)
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

export function generateProjectProgressPDF(data: ProjectProgressData, company?: Partial<CompanyInfo>): jsPDF {
  const co = { ...DEFAULT_COMPANY, ...company }
  const doc = new jsPDF('p', 'mm', 'a4')
  const pw = doc.internal.pageSize.getWidth()
  const m = 15
  const cw = pw - 2 * m

  const title = 'Izveštaj o napretku projekata'

  // PAGE 1
  addPageHeader(doc, title, pw, m, co)

  // Executive Summary
  const sy = 25
  doc.setFontSize(9); doc.setFont('helvetica', 'bold'); doc.setTextColor(...DARK)
  doc.text('Izvršni rezime', m, sy)
  doc.setFontSize(7); doc.setFont('helvetica', 'normal'); doc.setTextColor(75, 85, 99)
  const budgetPct = data.totalBudget > 0 ? ((data.totalSpent / data.totalBudget) * 100).toFixed(1) : '0.0'
  doc.text(
    `Ukupno ${data.totalProjects} projekata. Završeno ${data.completedProjects}, u toku ${data.inProgressProjects}. Budžet: ${formatRSD(data.totalBudget)}, utrošeno: ${formatRSD(data.totalSpent)} (${budgetPct}%).`,
    m, sy + 5, { maxWidth: cw }
  )

  // KPIs
  const ky = sy + 14
  const kw = (cw - 15) / 4
  drawKPICard(doc, m, ky, kw, 'Projekata ukupno', String(data.totalProjects), PRIMARY)
  drawKPICard(doc, m + kw + 5, ky, kw, 'Završeno', String(data.completedProjects), PRIMARY)
  drawKPICard(doc, m + 2 * (kw + 5), ky, kw, 'U budžetu', formatRSD(data.totalBudget), PRIMARY)
  drawKPICard(doc, m + 3 * (kw + 5), ky, kw, 'Utrošeno', formatRSD(data.totalSpent), data.totalSpent > data.totalBudget ? RED_C : PRIMARY)

  // Status Distribution Pie
  drawPieChart(doc, {
    x: m, y: ky + 26, width: cw, height: 65,
    title: 'Distribucija statusa projekata',
    data: data.statusDistribution.map((sd) => ({
      label: sd.status,
      value: sd.count,
    })),
    legendPosition: 'right',
    innerRadius: 12,
  })

  // Budget vs Actual Bar Chart
  const barY = ky + 95
  const halfW = (cw - 5) / 2

  drawBarChart(doc, {
    x: m, y: barY, width: halfW, height: 60,
    title: 'Budžet projekata',
    data: data.budgetByStatus.map((bs) => ({
      label: bs.status.length > 12 ? bs.status.substring(0, 11) + '…' : bs.status,
      value: bs.budget,
    })),
    showValues: false,
  })

  drawBarChart(doc, {
    x: m + halfW + 5, y: barY, width: halfW, height: 60,
    title: 'Stvarna potrošnja',
    data: data.budgetByStatus.map((bs) => ({
      label: bs.status.length > 12 ? bs.status.substring(0, 11) + '…' : bs.status,
      value: bs.spent,
    })),
    showValues: false,
  })

  // PAGE 2: Project Timeline Table
  doc.addPage()
  addPageHeader(doc, 'Detalji projekata', pw, m, co)

  doc.setFontSize(9); doc.setFont('helvetica', 'bold'); doc.setTextColor(...DARK)
  doc.text('Pregled projekata', m, 27)

  autoTable(doc, {
    startY: 31,
    head: [['Projekat', 'Status', 'Početak', 'Kraj', 'Budžet', 'Utrošeno', 'Progres', 'Rukovodioc']],
    body: data.projects.map((p) => [
      p.name.length > 25 ? p.name.substring(0, 24) + '…' : p.name,
      p.status,
      formatDate(p.startDate),
      formatDate(p.endDate),
      formatRSD(p.budget),
      formatRSD(p.spent),
      `${p.progress}%`,
      p.manager,
    ]),
    margin: { left: m, right: m },
    theme: 'grid',
    headStyles: { fillColor: PRIMARY, textColor: [255, 255, 255], fontSize: 6, fontStyle: 'bold', halign: 'center' },
    bodyStyles: { fontSize: 6, textColor: DARK },
    columnStyles: {
      0: { cellWidth: 38 },
      1: { cellWidth: 20, halign: 'center' },
      2: { cellWidth: 18 },
      3: { cellWidth: 18 },
      4: { halign: 'right', cellWidth: 24 },
      5: { halign: 'right', cellWidth: 24 },
      6: { halign: 'center', cellWidth: 16 },
      7: { cellWidth: 22 },
    },
    alternateRowStyles: { fillColor: [249, 250, 251] },
    didParseCell: (cd) => {
      if (cd.section === 'body' && cd.column.index === 6) {
        const v = parseInt(cd.cell.raw as string)
        if (v >= 80) cd.cell.styles.textColor = PRIMARY
        else if (v >= 50) cd.cell.styles.textColor = [217, 119, 6] as [number, number, number]
        else cd.cell.styles.textColor = RED_C
      }
      if (cd.section === 'body' && cd.column.index === 5) {
        const row = data.projects[cd.row.index]
        if (row && row.spent > row.budget) {
          cd.cell.styles.textColor = RED_C
        }
      }
    },
  })

  const fy = (doc as unknown as { lastAutoTable?: { finalY: number } }).lastAutoTable?.finalY || 50
  const bsY = Math.max(fy + 15, 80)

  // Budget Summary Table
  doc.setFontSize(9); doc.setFont('helvetica', 'bold'); doc.setTextColor(...DARK)
  doc.text('Budžet po statusu', m, bsY)

  autoTable(doc, {
    startY: bsY + 4,
    head: [['Status', 'Broj projekata', 'Budžet', 'Utrošeno', 'Odstupanje']],
    body: data.budgetByStatus.map((bs) => {
      const deviation = bs.budget - bs.spent
      return [
        bs.status,
        String(data.statusDistribution.find((sd) => sd.status === bs.status)?.count || 0),
        formatRSD(bs.budget),
        formatRSD(bs.spent),
        formatRSD(deviation),
      ]
    }),
    margin: { left: m, right: m },
    theme: 'grid',
    headStyles: { fillColor: PRIMARY, textColor: [255, 255, 255], fontSize: 7, fontStyle: 'bold', halign: 'center' },
    bodyStyles: { fontSize: 7, textColor: DARK },
    columnStyles: { 0: { cellWidth: 40 }, 1: { halign: 'center' }, 2: { halign: 'right' }, 3: { halign: 'right' }, 4: { halign: 'right' } },
    alternateRowStyles: { fillColor: [249, 250, 251] },
    didParseCell: (cd) => {
      if (cd.section === 'body' && cd.column.index === 4) {
        const v = cd.cell.raw as string
        if (v.startsWith('-')) {
          cd.cell.styles.textColor = RED_C
          cd.cell.styles.fontStyle = 'bold'
        }
      }
    },
  })

  addPageFooter(doc, pw, m)
  return doc
}
