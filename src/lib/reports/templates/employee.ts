import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import {
  drawBarChart,
  drawPieChart,
  CHART_COLORS,
  EMERALD,
} from '../chart-drawing'
import type { CompanyInfo } from '../pdf-generator'

// ==================== TYPES ====================

export interface EmployeePerformanceData {
  dateFrom?: string
  dateTo?: string
  totalEmployees: number
  avgAttendance: number
  avgPerformanceScore: number
  departments: Array<{ department: string; count: number; avgScore: number; avgSalary: number }>
  employees: Array<{
    name: string
    department: string
    performanceScore: number
    attendanceRate: number
    tasksCompleted: number
    overtimeHours: number
  }>
  attendanceDistribution: Array<{ status: string; value: number }>
  topPerformers: Array<{ name: string; department: string; score: number }>
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
    doc.text('Reflection Business ERP — Izveštaj o zaposlenima', m, 290)
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

export function generateEmployeePerformancePDF(data: EmployeePerformanceData, company?: Partial<CompanyInfo>): jsPDF {
  const co = { ...DEFAULT_COMPANY, ...company }
  const doc = new jsPDF('p', 'mm', 'a4')
  const pw = doc.internal.pageSize.getWidth()
  const m = 15
  const cw = pw - 2 * m

  const title = 'Izveštaj o performansama zaposlenih'

  // PAGE 1
  addPageHeader(doc, title, pw, m, co)

  // Executive Summary
  const sy = 25
  doc.setFontSize(9); doc.setFont('helvetica', 'bold'); doc.setTextColor(...DARK)
  doc.text('Izvršni rezime', m, sy)
  doc.setFontSize(7); doc.setFont('helvetica', 'normal'); doc.setTextColor(75, 85, 99)
  doc.text(
    `Ukupno ${data.totalEmployees} zaposlenih u ${data.departments.length} departmenta. Prosečna prisutnost je ${data.avgAttendance}%, prosečan rezultat performansi je ${data.avgPerformanceScore}/100.`,
    m, sy + 5, { maxWidth: cw }
  )

  // KPIs
  const ky = sy + 14
  const kw = (cw - 10) / 3
  drawKPICard(doc, m, ky, kw, 'Zaposlenih', String(data.totalEmployees), PRIMARY)
  drawKPICard(doc, m + kw + 5, ky, kw, 'Prosečna prisutnost', `${data.avgAttendance}%`, PRIMARY)
  drawKPICard(doc, m + 2 * (kw + 5), ky, kw, 'Prosečan rezultat', `${data.avgPerformanceScore}/100`, PRIMARY)

  // Performance Scores Bar Chart
  drawBarChart(doc, {
    x: m, y: ky + 26, width: cw, height: 60,
    title: 'Rezultati performansi zaposlenih',
    data: data.employees.map((e) => ({
      label: e.name.split(' ')[0],
      value: e.performanceScore,
    })),
    showValues: true,
    maxValue: 100,
  })

  // Attendance Pie Chart
  const pieY = ky + 92
  drawPieChart(doc, {
    x: m, y: pieY, width: cw, height: 65,
    title: 'Distribucija prisutnosti',
    data: data.attendanceDistribution,
    legendPosition: 'right',
    innerRadius: 12,
  })

  // Employee Evaluation Table
  const ty = pieY + 70
  doc.setFontSize(9); doc.setFont('helvetica', 'bold'); doc.setTextColor(...DARK)
  doc.text('Pregled evaluacije zaposlenih', m, ty)

  autoTable(doc, {
    startY: ty + 4,
    head: [['Ime', 'Department', 'Rezultat', 'Prisutnost', 'Zadaci', 'Prekovremeni (h)']],
    body: data.employees.map((e) => [
      e.name, e.department,
      `${e.performanceScore}/100`,
      `${e.attendanceRate}%`,
      String(e.tasksCompleted),
      e.overtimeHours.toFixed(1),
    ]),
    margin: { left: m, right: m },
    theme: 'grid',
    headStyles: { fillColor: PRIMARY, textColor: [255, 255, 255], fontSize: 7, fontStyle: 'bold', halign: 'center' },
    bodyStyles: { fontSize: 7, textColor: DARK },
    columnStyles: {
      0: { cellWidth: 38 },
      1: { cellWidth: 25 },
      2: { halign: 'center', cellWidth: 20 },
      3: { halign: 'center', cellWidth: 22 },
      4: { halign: 'center', cellWidth: 18 },
      5: { halign: 'center', cellWidth: 25 },
    },
    alternateRowStyles: { fillColor: [249, 250, 251] },
    didParseCell: (cd) => {
      if (cd.section === 'body' && cd.column.index === 2) {
        const v = parseInt(cd.cell.raw as string)
        if (v >= 90) cd.cell.styles.textColor = PRIMARY
        else if (v >= 70) cd.cell.styles.textColor = [217, 119, 6] as [number, number, number]
        else cd.cell.styles.textColor = RED_C
      }
    },
  })

  // PAGE 2: Department Overview
  doc.addPage()
  addPageHeader(doc, 'Pregled departmenta', pw, m, co)

  doc.setFontSize(9); doc.setFont('helvetica', 'bold'); doc.setTextColor(...DARK)
  doc.text('Departmenti — pregled', m, 27)

  autoTable(doc, {
    startY: 31,
    head: [['Department', 'Zaposlenih', 'Prosek rezultata', 'Prosek plata']],
    body: data.departments.map((d) => [
      d.department, String(d.count), `${d.avgScore}/100`, formatRSD(d.avgSalary),
    ]),
    margin: { left: m, right: m },
    theme: 'grid',
    headStyles: { fillColor: PRIMARY, textColor: [255, 255, 255], fontSize: 7, fontStyle: 'bold', halign: 'center' },
    bodyStyles: { fontSize: 7, textColor: DARK },
    columnStyles: { 0: { cellWidth: 60 }, 1: { halign: 'center' }, 2: { halign: 'center' }, 3: { halign: 'right' } },
    alternateRowStyles: { fillColor: [249, 250, 251] },
  })

  const fy = (doc as unknown as { lastAutoTable?: { finalY: number } }).lastAutoTable?.finalY || 50
  const topY = Math.max(fy + 15, 80)

  // Department headcount pie
  drawPieChart(doc, {
    x: m, y: topY, width: cw, height: 65,
    title: 'Broj zaposlenih po departmentu',
    data: data.departments.map((d) => ({ label: d.department, value: d.count })),
    legendPosition: 'right',
    innerRadius: 12,
  })

  // Department avg score bar
  const barY = topY + 70
  drawBarChart(doc, {
    x: m, y: barY, width: cw, height: 55,
    title: 'Prosečan rezultat po departmentu',
    data: data.departments.map((d, i) => ({
      label: d.department.length > 12 ? d.department.substring(0, 11) + '…' : d.department,
      value: d.avgScore,
      color: CHART_COLORS[i % CHART_COLORS.length],
    })),
    maxValue: 100,
  })

  // Top Performers
  const tpY = barY + 63
  doc.setFontSize(9); doc.setFont('helvetica', 'bold'); doc.setTextColor(...PRIMARY)
  doc.text('Top izvođači', m, tpY)

  autoTable(doc, {
    startY: tpY + 4,
    head: [['Rang', 'Ime', 'Department', 'Rezultat']],
    body: data.topPerformers.map((tp, i) => [
      `#${i + 1}`, tp.name, tp.department, `${tp.score}/100`,
    ]),
    margin: { left: m, right: m },
    theme: 'grid',
    headStyles: { fillColor: PRIMARY, textColor: [255, 255, 255], fontSize: 7, fontStyle: 'bold', halign: 'center' },
    bodyStyles: { fontSize: 7, textColor: DARK },
    columnStyles: { 0: { halign: 'center', cellWidth: 15 }, 1: { cellWidth: 50 }, 2: { cellWidth: 40 }, 3: { halign: 'center' } },
    alternateRowStyles: { fillColor: [249, 250, 251] },
  })

  addPageFooter(doc, pw, m)
  return doc
}
