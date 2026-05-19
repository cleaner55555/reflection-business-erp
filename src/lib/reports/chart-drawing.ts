import jsPDF from 'jspdf'

// ==================== TYPES ====================

export interface ChartColor {
  rgb: [number, number, number]
  hex: string
}

export interface BarChartOptions {
  x: number
  y: number
  width: number
  height: number
  title?: string
  data: Array<{ label: string; value: number; color?: ChartColor }>
  colors?: ChartColor[]
  showValues?: boolean
  showGrid?: boolean
  axisLabel?: string
  maxValue?: number
  barWidth?: number
}

export interface LineChartOptions {
  x: number
  y: number
  width: number
  height: number
  title?: string
  data: Array<{ label: string; value: number }>
  color?: ChartColor
  fillColor?: ChartColor
  showDots?: boolean
  showGrid?: boolean
  showArea?: boolean
  axisLabel?: string
  maxValue?: number
}

export interface PieChartOptions {
  x: number
  y: number
  width: number
  height: number
  title?: string
  data: Array<{ label: string; value: number; color?: ChartColor }>
  colors?: ChartColor[]
  showLabels?: boolean
  showLegend?: boolean
  legendPosition?: 'right' | 'bottom'
  innerRadius?: number // for donut chart
}

export interface AreaChartOptions {
  x: number
  y: number
  width: number
  height: number
  title?: string
  data: Array<{ label: string; value: number }>
  color?: ChartColor
  showGrid?: boolean
  axisLabel?: string
  maxValue?: number
  strokeWidth?: number
}

// ==================== PROFESSIONAL COLOR PALETTE ====================

export const CHART_COLORS: ChartColor[] = [
  { rgb: [5, 150, 105], hex: '#059669' },    // emerald-600
  { rgb: [8, 145, 178], hex: '#0891b2' },    // cyan-600
  { rgb: [124, 58, 237], hex: '#7c3aed' },   // violet-600
  { rgb: [234, 88, 12], hex: '#ea580c' },    // orange-600
  { rgb: [219, 39, 119], hex: '#db2777' },   // pink-600
  { rgb: [202, 138, 4], hex: '#ca8a04' },    // yellow-600
  { rgb: [220, 38, 38], hex: '#dc2626' },    // red-600
  { rgb: [22, 163, 74], hex: '#16a34a' },    // green-600
  { rgb: [217, 119, 6], hex: '#d97706' },    // amber-600
  { rgb: [168, 85, 247], hex: '#a855f7' },   // purple-500
]

export const EMERALD: ChartColor = { rgb: [5, 150, 105], hex: '#059669' }
export const CYAN: ChartColor = { rgb: [8, 145, 178], hex: '#0891b2' }
export const ORANGE: ChartColor = { rgb: [234, 88, 12], hex: '#ea580c' }
export const VIOLET: ChartColor = { rgb: [124, 58, 237], hex: '#7c3aed' }
export const GRAY_LIGHT: ChartColor = { rgb: [156, 163, 175], hex: '#9ca3af' }
export const GRAY_DARK: ChartColor = { rgb: [75, 85, 99], hex: '#4b5563' }
export const RED: ChartColor = { rgb: [220, 38, 38], hex: '#dc2626' }
export const AMBER: ChartColor = { rgb: [217, 119, 6], hex: '#d97706' }
export const PINK: ChartColor = { rgb: [219, 39, 119], hex: '#db2777' }
export const YELLOW: ChartColor = { rgb: [202, 138, 4], hex: '#ca8a04' }
export const GREEN: ChartColor = { rgb: [22, 163, 74], hex: '#16a34a' }

// ==================== FORMATTING HELPERS ====================

function formatNumberShort(n: number): string {
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`
  return String(Math.round(n))
}

function getMaxValue(data: number[], forcedMax?: number): number {
  if (forcedMax !== undefined) return forcedMax
  const max = Math.max(...data)
  if (max === 0) return 100
  // Round up to a nice number
  const magnitude = Math.pow(10, Math.floor(Math.log10(max)))
  const normalized = max / magnitude
  let nice: number
  if (normalized <= 1) nice = 1
  else if (normalized <= 2) nice = 2
  else if (normalized <= 5) nice = 5
  else nice = 10
  return nice * magnitude
}

function drawChartTitle(doc: jsPDF, title: string, x: number, y: number, width: number) {
  doc.setFontSize(10)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(17, 24, 39)
  doc.text(title, x, y)
}

// ==================== BAR CHART ====================

export function drawBarChart(doc: jsPDF, options: BarChartOptions) {
  const {
    x, y, width, height, title, data,
    colors = CHART_COLORS,
    showValues = true, showGrid = true,
    axisLabel, maxValue, barWidth,
  } = options

  const padding = { top: title ? 15 : 5, right: 10, bottom: 22, left: 40 }
  const chartX = x + padding.left
  const chartY = y + padding.top
  const chartW = width - padding.left - padding.right
  const chartH = height - padding.top - padding.bottom

  if (title) drawChartTitle(doc, title, x, y + 8, width)

  const values = data.map((d) => d.value)
  const maxVal = getMaxValue(values, maxValue)
  const barCount = data.length
  const gap = Math.max(2, chartW * 0.15 / barCount)
  const bw = barWidth || Math.max(4, (chartW - gap * (barCount + 1)) / barCount)
  const totalBarWidth = bw * barCount + gap * (barCount + 1)
  const barStartX = chartX + (chartW - totalBarWidth) / 2 + gap

  // Grid lines
  if (showGrid) {
    const gridLines = 5
    doc.setDrawColor(229, 231, 235)
    doc.setLineWidth(0.2)
    for (let i = 0; i <= gridLines; i++) {
      const gy = chartY + chartH - (i / gridLines) * chartH
      doc.line(chartX, gy, chartX + chartW, gy)
      // Y-axis labels
      doc.setFontSize(6)
      doc.setFont('helvetica', 'normal')
      doc.setTextColor(156, 163, 175)
      doc.text(formatNumberShort((i / gridLines) * maxVal), chartX - 3, gy + 2, { align: 'right' })
    }
  }

  // Bars
  data.forEach((item, i) => {
    const bx = barStartX + i * (bw + gap)
    const barH = maxVal > 0 ? (item.value / maxVal) * chartH : 0
    const by = chartY + chartH - barH
    const color = item.color || colors[i % colors.length]

    // Bar fill
    doc.setFillColor(...color.rgb)
    doc.roundedRect(bx, by, bw, barH, 1, 1, 'F')

    // Value on top
    if (showValues && barH > 3) {
      doc.setFontSize(5.5)
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(17, 24, 39)
      doc.text(formatNumberShort(item.value), bx + bw / 2, by - 2, { align: 'center' })
    }

    // X-axis label
    doc.setFontSize(5)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(107, 114, 128)
    const label = item.label.length > 10 ? item.label.substring(0, 9) + '…' : item.label
    doc.text(label, bx + bw / 2, chartY + chartH + 5, { align: 'center' })
  })

  // Axis label
  if (axisLabel) {
    doc.setFontSize(6)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(107, 114, 128)
    doc.text(axisLabel, chartX, chartY + chartH + 14, { align: 'center' })
  }

  // Axis lines
  doc.setDrawColor(209, 213, 219)
  doc.setLineWidth(0.3)
  doc.line(chartX, chartY, chartX, chartY + chartH)
  doc.line(chartX, chartY + chartH, chartX + chartW, chartY + chartH)
}

// ==================== LINE CHART ====================

export function drawLineChart(doc: jsPDF, options: LineChartOptions) {
  const {
    x, y, width, height, title, data,
    color = EMERALD,
    fillColor, showDots = true, showGrid = true,
    showArea = false, axisLabel, maxValue,
  } = options

  const padding = { top: title ? 15 : 5, right: 10, bottom: 22, left: 40 }
  const chartX = x + padding.left
  const chartY = y + padding.top
  const chartW = width - padding.left - padding.right
  const chartH = height - padding.top - padding.bottom

  if (title) drawChartTitle(doc, title, x, y + 8, width)

  if (data.length === 0) return

  const values = data.map((d) => d.value)
  const maxVal = getMaxValue(values, maxValue)

  // Grid lines
  if (showGrid) {
    const gridLines = 5
    doc.setDrawColor(229, 231, 235)
    doc.setLineWidth(0.2)
    for (let i = 0; i <= gridLines; i++) {
      const gy = chartY + chartH - (i / gridLines) * chartH
      doc.line(chartX, gy, chartX + chartW, gy)
      doc.setFontSize(6)
      doc.setFont('helvetica', 'normal')
      doc.setTextColor(156, 163, 175)
      doc.text(formatNumberShort((i / gridLines) * maxVal), chartX - 3, gy + 2, { align: 'right' })
    }
  }

  // Calculate points
  const points = data.map((item, i) => {
    const px = data.length === 1
      ? chartX + chartW / 2
      : chartX + (i / (data.length - 1)) * chartW
    const py = maxVal > 0
      ? chartY + chartH - (item.value / maxVal) * chartH
      : chartY + chartH
    return { x: px, y: py, value: item.value, label: item.label }
  })

  // Area fill
  if (showArea && points.length > 1) {
    const fill = fillColor || { rgb: [...color.rgb] as [number, number, number], hex: color.hex + '40' }
    doc.setFillColor(fill.rgb[0], fill.rgb[1], fill.rgb[2])
    // Use lower opacity approximation
    doc.setGState(new (doc as unknown as { GState: new (p: Record<string, unknown>) => unknown }).GState({ opacity: 0.15 }))
    doc.moveTo(points[0].x, chartY + chartH)
    points.forEach((p) => doc.lineTo(p.x, p.y))
    doc.lineTo(points[points.length - 1].x, chartY + chartH)
    doc.closePath()
    doc.fill()
    doc.setGState(new (doc as unknown as { GState: new (p: Record<string, unknown>) => unknown }).GState({ opacity: 1 }))
  }

  // Line
  if (points.length > 1) {
    doc.setDrawColor(...color.rgb)
    doc.setLineWidth(1.2)
    doc.line(points[0].x, points[0].y, points[1].x, points[1].y)
    for (let i = 1; i < points.length; i++) {
      doc.line(points[i - 1].x, points[i - 1].y, points[i].x, points[i].y)
    }
  }

  // Dots and labels
  points.forEach((p, i) => {
    if (showDots) {
      doc.setFillColor(...color.rgb)
      doc.circle(p.x, p.y, 2, 'F')
      doc.setFillColor(255, 255, 255)
      doc.circle(p.x, p.y, 0.8, 'F')
    }

    // X-axis label (show every nth label to avoid overlap)
    const step = data.length > 12 ? Math.ceil(data.length / 8) : 1
    if (i % step === 0) {
      doc.setFontSize(5)
      doc.setFont('helvetica', 'normal')
      doc.setTextColor(107, 114, 128)
      const lbl = p.label.length > 8 ? p.label.substring(0, 7) + '…' : p.label
      doc.text(lbl, p.x, chartY + chartH + 5, { align: 'center' })
    }
  })

  // Axis label
  if (axisLabel) {
    doc.setFontSize(6)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(107, 114, 128)
    doc.text(axisLabel, chartX + chartW / 2, chartY + chartH + 14, { align: 'center' })
  }

  // Axis lines
  doc.setDrawColor(209, 213, 219)
  doc.setLineWidth(0.3)
  doc.line(chartX, chartY, chartX, chartY + chartH)
  doc.line(chartX, chartY + chartH, chartX + chartW, chartY + chartH)
}

// ==================== PIE CHART ====================

export function drawPieChart(doc: jsPDF, options: PieChartOptions) {
  const {
    x, y, width, height, title, data,
    colors = CHART_COLORS,
    showLabels = true,
    showLegend = true,
    legendPosition = 'right',
    innerRadius,
  } = options

  if (title) drawChartTitle(doc, title, x, y + 8, width)

  const total = data.reduce((s, d) => s + d.value, 0)
  if (total === 0) return

  // Chart dimensions
  let chartCx: number, chartCy: number, radius: number
  let legendX: number, legendY: number

  if (legendPosition === 'right') {
    const legendW = showLegend ? 50 : 0
    const pieAreaW = width - legendW
    chartCx = x + pieAreaW / 2
    chartCy = y + (title ? 15 : 5) + (height - (title ? 15 : 5)) / 2
    radius = Math.min(pieAreaW, height - (title ? 15 : 5) - 10) / 2 - 5
    legendX = x + pieAreaW + 5
    legendY = y + (title ? 20 : 8)
  } else {
    const legendH = showLegend ? Math.ceil(data.length / 2) * 6 + 5 : 0
    const pieAreaH = height - (title ? 15 : 5) - legendH
    chartCx = x + width / 2
    chartCy = y + (title ? 15 : 5) + pieAreaH / 2
    radius = Math.min(width, pieAreaH) / 2 - 5
    legendX = x
    legendY = y + (title ? 15 : 5) + pieAreaH + 5
  }

  radius = Math.max(radius, 10)

  // Draw slices
  let startAngle = -Math.PI / 2 // Start from top
  data.forEach((item, i) => {
    const sliceAngle = (item.value / total) * 2 * Math.PI
    const endAngle = startAngle + sliceAngle
    const color = item.color || colors[i % colors.length]

    // Draw filled slice using triangle approximation
    doc.setFillColor(...color.rgb)
    doc.setGState(new (doc as unknown as { GState: new (p: Record<string, unknown>) => unknown }).GState({ opacity: 1 }))

    const segments = Math.max(8, Math.ceil(sliceAngle * 10))
    const points: Array<{ x: number; y: number }> = []

    for (let s = 0; s <= segments; s++) {
      const angle = startAngle + (s / segments) * sliceAngle
      const px = chartCx + Math.cos(angle) * radius
      const py = chartCy + Math.sin(angle) * radius
      points.push({ x: px, y: py })
    }

    // Draw path
    if (points.length >= 2) {
      doc.moveTo(chartCx, chartCy)
      points.forEach((p) => doc.lineTo(p.x, p.y))
      doc.lineTo(chartCx, chartCy)
      doc.closePath()
      doc.fill()
    }

    // Inner circle for donut
    if (innerRadius && innerRadius > 0) {
      doc.setFillColor(255, 255, 255)
      doc.circle(chartCx, chartCy, innerRadius, 'F')
    }

    // Label
    if (showLabels && sliceAngle > 0.2) {
      const midAngle = startAngle + sliceAngle / 2
      const labelR = radius * 0.65
      const lx = chartCx + Math.cos(midAngle) * labelR
      const ly = chartCy + Math.sin(midAngle) * labelR

      doc.setFontSize(6)
      doc.setTextColor(255, 255, 255)
      const pct = ((item.value / total) * 100).toFixed(0)
      doc.text(`${pct}%`, lx, ly + 1.5, { align: 'center' })
    }

    startAngle = endAngle
  })

  // Redraw inner circle on top (for donut)
  if (innerRadius && innerRadius > 0) {
    doc.setFillColor(255, 255, 255)
    doc.circle(chartCx, chartCy, innerRadius, 'F')

    // Center text
    doc.setFontSize(10)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(17, 24, 39)
    doc.text(formatNumberShort(total), chartCx, chartCy + 1, { align: 'center' })
    doc.setFontSize(5)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(107, 114, 128)
    doc.text('Ukupno', chartCx, chartCy + 5, { align: 'center' })
  }

  // Legend
  if (showLegend) {
    let ly = legendY
    const cols = legendPosition === 'bottom' ? 2 : 1
    const colW = legendPosition === 'bottom' ? width / cols : width - (legendX - x) - 5
    let col = 0

    data.forEach((item, i) => {
      const color = item.color || colors[i % colors.length]
      const pct = ((item.value / total) * 100).toFixed(1)
      const label = item.label.length > 15 ? item.label.substring(0, 14) + '…' : item.label

      const cx = legendPosition === 'bottom'
        ? legendX + col * colW
        : legendX

      doc.setFillColor(...color.rgb)
      doc.roundedRect(cx, ly, 2.5, 2.5, 0.5, 0.5, 'F')

      doc.setFontSize(5.5)
      doc.setFont('helvetica', 'normal')
      doc.setTextColor(75, 85, 99)
      doc.text(`${label} (${pct}%)`, cx + 4, ly + 2)

      ly += 5
      if (legendPosition === 'bottom' && col === 0 && ly > legendY + 5 && i < data.length - 1) {
        col = 1
        ly = legendY
      }
    })
  }
}

// ==================== AREA CHART ====================

export function drawAreaChart(doc: jsPDF, options: AreaChartOptions) {
  const {
    x, y, width, height, title, data,
    color = EMERALD,
    showGrid = true,
    axisLabel, maxValue,
    strokeWidth = 1.2,
  } = options

  const padding = { top: title ? 15 : 5, right: 10, bottom: 22, left: 40 }
  const chartX = x + padding.left
  const chartY = y + padding.top
  const chartW = width - padding.left - padding.right
  const chartH = height - padding.top - padding.bottom

  if (title) drawChartTitle(doc, title, x, y + 8, width)

  if (data.length === 0) return

  const values = data.map((d) => d.value)
  const maxVal = getMaxValue(values, maxValue)

  // Grid lines
  if (showGrid) {
    const gridLines = 5
    doc.setDrawColor(229, 231, 235)
    doc.setLineWidth(0.2)
    for (let i = 0; i <= gridLines; i++) {
      const gy = chartY + chartH - (i / gridLines) * chartH
      doc.line(chartX, gy, chartX + chartW, gy)
      doc.setFontSize(6)
      doc.setFont('helvetica', 'normal')
      doc.setTextColor(156, 163, 175)
      doc.text(formatNumberShort((i / gridLines) * maxVal), chartX - 3, gy + 2, { align: 'right' })
    }
  }

  // Calculate points
  const points = data.map((item, i) => {
    const px = data.length === 1
      ? chartX + chartW / 2
      : chartX + (i / (data.length - 1)) * chartW
    const py = maxVal > 0
      ? chartY + chartH - (item.value / maxVal) * chartH
      : chartY + chartH
    return { x: px, y: py, value: item.value, label: item.label }
  })

  if (points.length < 2) return

  // Area fill
  doc.setFillColor(color.rgb[0], color.rgb[1], color.rgb[2])
  try {
    doc.setGState(new (doc as unknown as { GState: new (p: Record<string, unknown>) => unknown }).GState({ opacity: 0.15 }))
    doc.moveTo(points[0].x, chartY + chartH)
    points.forEach((p) => doc.lineTo(p.x, p.y))
    doc.lineTo(points[points.length - 1].x, chartY + chartH)
    doc.closePath()
    doc.fill()
    doc.setGState(new (doc as unknown as { GState: new (p: Record<string, unknown>) => unknown }).GState({ opacity: 1 }))
  } catch {
    // Fallback without opacity if GState not supported
    doc.setFillColor(
      255 - Math.round((255 - color.rgb[0]) * 0.15),
      255 - Math.round((255 - color.rgb[1]) * 0.15),
      255 - Math.round((255 - color.rgb[2]) * 0.15)
    )
    doc.moveTo(points[0].x, chartY + chartH)
    points.forEach((p) => doc.lineTo(p.x, p.y))
    doc.lineTo(points[points.length - 1].x, chartY + chartH)
    doc.closePath()
    doc.fill()
  }

  // Line
  doc.setDrawColor(...color.rgb)
  doc.setLineWidth(strokeWidth)
  for (let i = 1; i < points.length; i++) {
    doc.line(points[i - 1].x, points[i - 1].y, points[i].x, points[i].y)
  }

  // X-axis labels
  const step = data.length > 12 ? Math.ceil(data.length / 8) : 1
  points.forEach((p, i) => {
    if (i % step === 0) {
      doc.setFontSize(5)
      doc.setFont('helvetica', 'normal')
      doc.setTextColor(107, 114, 128)
      const lbl = p.label.length > 8 ? p.label.substring(0, 7) + '…' : p.label
      doc.text(lbl, p.x, chartY + chartH + 5, { align: 'center' })
    }
  })

  // Axis label
  if (axisLabel) {
    doc.setFontSize(6)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(107, 114, 128)
    doc.text(axisLabel, chartX + chartW / 2, chartY + chartH + 14, { align: 'center' })
  }

  // Axis lines
  doc.setDrawColor(209, 213, 219)
  doc.setLineWidth(0.3)
  doc.line(chartX, chartY, chartX, chartY + chartH)
  doc.line(chartX, chartY + chartH, chartX + chartW, chartY + chartH)
}

// ==================== MULTI-LINE CHART ====================

export function drawMultiLineChart(
  doc: jsPDF,
  options: {
    x: number
    y: number
    width: number
    height: number
    title?: string
    series: Array<{
      name: string
      data: Array<{ label: string; value: number }>
      color: ChartColor
    }>
    showGrid?: boolean
    showLegend?: boolean
    maxValue?: number
  }
) {
  const {
    x, y, width, height, title, series,
    showGrid = true, showLegend = true, maxValue,
  } = options

  const padding = { top: title ? 18 : 5, right: 10, bottom: showLegend ? 30 : 22, left: 40 }
  const chartX = x + padding.left
  const chartY = y + padding.top
  const chartW = width - padding.left - padding.right
  const chartH = height - padding.top - padding.bottom

  if (title) drawChartTitle(doc, title, x, y + 8, width)

  if (series.length === 0 || series[0].data.length === 0) return

  const allValues = series.flatMap((s) => s.data.map((d) => d.value))
  const maxVal = getMaxValue(allValues, maxValue)
  const labels = series[0].data.map((d) => d.label)

  // Grid lines
  if (showGrid) {
    const gridLines = 5
    doc.setDrawColor(229, 231, 235)
    doc.setLineWidth(0.2)
    for (let i = 0; i <= gridLines; i++) {
      const gy = chartY + chartH - (i / gridLines) * chartH
      doc.line(chartX, gy, chartX + chartW, gy)
      doc.setFontSize(6)
      doc.setFont('helvetica', 'normal')
      doc.setTextColor(156, 163, 175)
      doc.text(formatNumberShort((i / gridLines) * maxVal), chartX - 3, gy + 2, { align: 'right' })
    }
  }

  // X-axis labels
  const step = labels.length > 12 ? Math.ceil(labels.length / 8) : 1
  labels.forEach((label, i) => {
    if (i % step === 0) {
      const px = labels.length === 1
        ? chartX + chartW / 2
        : chartX + (i / (labels.length - 1)) * chartW
      doc.setFontSize(5)
      doc.setFont('helvetica', 'normal')
      doc.setTextColor(107, 114, 128)
      const lbl = label.length > 8 ? label.substring(0, 7) + '…' : label
      doc.text(lbl, px, chartY + chartH + 5, { align: 'center' })
    }
  })

  // Draw each series
  series.forEach((s) => {
    const points = s.data.map((item, i) => ({
      x: s.data.length === 1
        ? chartX + chartW / 2
        : chartX + (i / (s.data.length - 1)) * chartW,
      y: maxVal > 0 ? chartY + chartH - (item.value / maxVal) * chartH : chartY + chartH,
    }))

    // Line
    doc.setDrawColor(...s.color.rgb)
    doc.setLineWidth(1)
    for (let i = 1; i < points.length; i++) {
      doc.line(points[i - 1].x, points[i - 1].y, points[i].x, points[i].y)
    }

    // Dots
    points.forEach((p) => {
      doc.setFillColor(...s.color.rgb)
      doc.circle(p.x, p.y, 1.5, 'F')
    })
  })

  // Legend
  if (showLegend && series.length > 1) {
    let lx = chartX
    const ly = chartY + chartH + 14
    series.forEach((s) => {
      doc.setFillColor(...s.color.rgb)
      doc.roundedRect(lx, ly - 1.5, 4, 2, 0.5, 0.5, 'F')
      doc.setFontSize(5.5)
      doc.setFont('helvetica', 'normal')
      doc.setTextColor(75, 85, 99)
      doc.text(s.name, lx + 6, ly)
      lx += doc.getTextWidth(s.name) + 14
    })
  }

  // Axis lines
  doc.setDrawColor(209, 213, 219)
  doc.setLineWidth(0.3)
  doc.line(chartX, chartY, chartX, chartY + chartH)
  doc.line(chartX, chartY + chartH, chartX + chartW, chartY + chartH)
}

// ==================== HORIZONTAL BAR CHART ====================

export function drawHorizontalBarChart(
  doc: jsPDF,
  options: {
    x: number
    y: number
    width: number
    height: number
    title?: string
    data: Array<{ label: string; value: number; color?: ChartColor }>
    colors?: ChartColor[]
    showValues?: boolean
    barHeight?: number
  }
) {
  const {
    x, y, width, height, title, data,
    colors = CHART_COLORS,
    showValues = true,
    barHeight = 6,
  } = options

  if (title) drawChartTitle(doc, title, x, y + 8, width)

  const maxVal = Math.max(...data.map((d) => d.value), 1)
  const padding = { top: title ? 15 : 5, right: 30, bottom: 5, left: 5 }
  const chartX = x + padding.left
  const chartW = width - padding.left - padding.right
  const gap = 2
  const startY = y + padding.top

  data.forEach((item, i) => {
    const by = startY + i * (barHeight + gap)
    const barW = (item.value / maxVal) * chartW
    const color = item.color || colors[i % colors.length]

    // Bar
    doc.setFillColor(...color.rgb)
    doc.roundedRect(chartX, by, barW, barHeight, 1, 1, 'F')

    // Label
    doc.setFontSize(5.5)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(75, 85, 99)
    const label = item.label.length > 20 ? item.label.substring(0, 19) + '…' : item.label
    doc.text(label, chartX + barW + 3, by + barHeight / 2 + 1.5)

    // Value
    if (showValues) {
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(17, 24, 39)
      doc.text(formatNumberShort(item.value), chartX + chartW + 3 - doc.getTextWidth(formatNumberShort(item.value)), by + barHeight / 2 + 1.5, { align: 'right' })
    }
  })
}
