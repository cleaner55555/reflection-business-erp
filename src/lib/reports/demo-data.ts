// ==================== CENTRALIZED DEMO DATA GENERATOR ====================
// Generates realistic demo data for all 7 report types.
// Used by the API route when real DB data is unavailable.

// ==================== HELPERS ====================

function randomBetween(min: number, max: number): number {
  return Math.round(min + Math.random() * (max - min))
}

function getMonthRange(dateFrom?: string, dateTo?: string): string[] {
  const from = dateFrom ? new Date(dateFrom) : new Date(new Date().getFullYear(), 0, 1)
  const to = dateTo ? new Date(dateTo) : new Date()
  const months: string[] = []
  const current = new Date(from.getFullYear(), from.getMonth(), 1)
  while (current <= to) {
    months.push(current.toISOString().substring(0, 7))
    current.setMonth(current.getMonth() + 1)
  }
  return months
}

// ==================== FINANCIAL SUMMARY ====================

export function generateFinancialDemoData(dateFrom?: string, dateTo?: string) {
  const months = getMonthRange(dateFrom, dateTo)
  const totalRevenue = randomBetween(3000000, 8000000)
  const totalExpenses = Math.round(totalRevenue * (0.55 + Math.random() * 0.25))

  const monthlyBreakdown = months.map((m) => {
    const rev = randomBetween(totalRevenue / months.length * 0.6, totalRevenue / months.length * 1.4)
    const exp = Math.round(rev * (0.5 + Math.random() * 0.35))
    return { month: m, revenue: rev, expenses: exp, profit: rev - exp }
  })

  const categories = ['Nabavka robe', 'Plata zaposlenih', 'Režije', 'Marketing', 'Transport', 'Ostalo']
  const expenseByCategory = categories.map((cat) => ({
    category: cat,
    amount: randomBetween(totalExpenses / categories.length * 0.3, totalExpenses / categories.length * 2),
    percentage: 0,
  }))
  const totalExpAmt = expenseByCategory.reduce((s, c) => s + c.amount, 0)
  expenseByCategory.forEach((c) => { c.percentage = (c.amount / totalExpAmt) * 100 })

  const partnerNames = [
    'Delta Holding d.o.o.', 'Mercator-S d.o.o.', 'Maxi d.o.o.',
    'Idea d.o.o.', 'TechPro Solutions', 'Gorenje d.o.o.',
    'Nectar d.o.o.', 'Knjaz Milos d.o.o.', 'Jaffa d.o.o.', 'Atlantic Grupa d.o.o.',
  ]
  const topPartners = partnerNames.map((name) => ({
    name,
    amount: randomBetween(50000, 500000),
    invoiceCount: randomBetween(2, 25),
  })).sort((a, b) => b.amount - a.amount)

  return {
    dateFrom, dateTo,
    totalRevenue, totalExpenses,
    netProfit: totalRevenue - totalExpenses,
    monthlyBreakdown, expenseByCategory, topPartners,
  }
}

// ==================== SALES ANALYTICS ====================

export function generateSalesDemoData(dateFrom?: string, dateTo?: string) {
  const months = getMonthRange(dateFrom, dateTo)
  const totalSales = randomBetween(2000000, 6000000)
  const totalOrders = randomBetween(200, 800)
  const avgOrderValue = Math.round(totalSales / totalOrders)

  const categories = ['Electronika', 'Nameštaj', 'Odeća', 'Hrana', 'Kozmetika', 'Sport']
  const salesByCategory = categories.map((cat) => ({
    category: cat,
    revenue: randomBetween(totalSales / categories.length * 0.3, totalSales / categories.length * 2.5),
    percentage: 0,
  }))
  const catTotal = salesByCategory.reduce((s, c) => s + c.revenue, 0)
  salesByCategory.forEach((c) => { c.percentage = (c.revenue / catTotal) * 100 })

  const monthlyTrend = months.map((m) => ({
    month: m,
    sales: randomBetween(totalSales / months.length * 0.5, totalSales / months.length * 1.5),
    orders: randomBetween(totalOrders / months.length * 0.5, totalOrders / months.length * 1.5),
  }))

  const products = [
    'Laptop Lenovo ThinkPad', 'Monitor Dell 27"', 'Telefon Samsung Galaxy',
    'Slušalice Sony WH-1000', 'Tablet iPad Air', 'Printer HP LaserJet',
    'Tipkovnica Logitech MX', 'Miš Microsoft Ergonomic',
  ]
  const topProducts = products.map((name) => ({
    name,
    quantitySold: randomBetween(10, 200),
    revenue: randomBetween(50000, 500000),
  })).sort((a, b) => b.revenue - a.revenue)

  const salesByPartner = Array.from({ length: 10 }, (_, i) => ({
    name: `Kupac ${i + 1}`,
    revenue: randomBetween(30000, 400000),
    orderCount: randomBetween(1, 20),
  })).sort((a, b) => b.revenue - a.revenue)

  return {
    dateFrom, dateTo, totalSales, totalOrders, avgOrderValue,
    salesByCategory, monthlyTrend, topProducts, salesByPartner,
  }
}

// ==================== INVENTORY STATUS ====================

export function generateInventoryDemoData() {
  const categories = ['Electronika', 'Nameštaj', 'Odeća', 'Hrana', 'Kozmetika']
  const totalProducts = randomBetween(80, 200)
  const totalStockValue = randomBetween(5000000, 15000000)
  const lowStockCount = randomBetween(5, 20)
  const outOfStockCount = randomBetween(1, 5)

  const stockByCategory = categories.map((category) => ({
    category,
    itemCount: randomBetween(10, 50),
    stockValue: randomBetween(500000, 3000000),
  }))

  const stockLevels = Array.from({ length: 12 }, (_, i) => ({
    name: `Artikal ${i + 1}`,
    current: randomBetween(5, 200),
    minimum: randomBetween(10, 50),
    value: randomBetween(10000, 200000),
  }))

  const lowStockAlerts = Array.from({ length: lowStockCount }, (_, i) => ({
    name: `Artikal sa niskom zaliha ${i + 1}`,
    current: randomBetween(0, 8),
    minimum: randomBetween(15, 50),
    deficit: randomBetween(5, 45),
  }))

  const stockMovement = categories.map((category) => ({
    category,
    incoming: randomBetween(100, 500),
    outgoing: randomBetween(80, 450),
  }))

  const deadStock = Array.from({ length: 5 }, (_, i) => ({
    name: `Mrtvi artikal ${i + 1}`,
    stockValue: randomBetween(10000, 100000),
    daysInactive: randomBetween(90, 250),
  }))

  return {
    totalProducts, totalStockValue, lowStockCount, outOfStockCount,
    stockByCategory, stockLevels, lowStockAlerts, stockMovement, deadStock,
  }
}

// ==================== EMPLOYEE PERFORMANCE ====================

export function generateEmployeeDemoData() {
  const departments = ['Razvoj', 'Prodaja', 'Marketing', 'Finansije', 'Logistika', 'HR']
  const names = [
    'Marko Petrović', 'Ana Jovanović', 'Nikola Stanković', 'Jelena Ilić',
    'Milan Nikolić', 'Marija Đorđević', 'Ivan Milić', 'Sara Tadić',
    'Luka Vukčević', 'Maja Stojanović', 'Petar Đurić', 'Nina Kovačević',
  ]

  const totalEmployees = names.length
  const employees = names.map((name, i) => ({
    name,
    department: departments[i % departments.length],
    performanceScore: randomBetween(55, 98),
    attendanceRate: Number((85 + Math.random() * 15).toFixed(1)),
    tasksCompleted: randomBetween(10, 50),
    overtimeHours: Number((Math.random() * 30).toFixed(1)),
  }))

  const deptMap = new Map<string, { count: number; totalScore: number; totalSalary: number }>()
  employees.forEach((e) => {
    const ex = deptMap.get(e.department) || { count: 0, totalScore: 0, totalSalary: 0 }
    ex.count++
    ex.totalScore += e.performanceScore
    ex.totalSalary += randomBetween(50000, 150000)
    deptMap.set(e.department, ex)
  })
  const departmentData = Array.from(deptMap.entries()).map(([department, v]) => ({
    department,
    count: v.count,
    avgScore: Math.round(v.totalScore / v.count),
    avgSalary: Math.round(v.totalSalary / v.count),
  }))

  const avgAttendance = Number((employees.reduce((s, e) => s + e.attendanceRate, 0) / totalEmployees).toFixed(1))
  const avgPerformanceScore = Math.round(employees.reduce((s, e) => s + e.performanceScore, 0) / totalEmployees)

  const attendanceDistribution = [
    { status: 'Prisutan', value: Math.round(totalEmployees * 0.85) },
    { status: 'Odsutan', value: Math.round(totalEmployees * 0.08) },
    { status: 'Godišnji', value: Math.round(totalEmployees * 0.05) },
    { status: 'Bolovanje', value: Math.round(totalEmployees * 0.02) },
  ]

  const topPerformers = [...employees]
    .sort((a, b) => b.performanceScore - a.performanceScore)
    .slice(0, 5)
    .map((e) => ({ name: e.name, department: e.department, score: e.performanceScore }))

  return {
    totalEmployees, avgAttendance, avgPerformanceScore,
    departments: departmentData, employees, attendanceDistribution, topPerformers,
  }
}

// ==================== INVOICE SUMMARY ====================

export function generateInvoiceDemoData(dateFrom?: string, dateTo?: string) {
  const months = getMonthRange(dateFrom, dateTo)

  const totalInvoices = randomBetween(100, 500)
  const totalAmount = randomBetween(5000000, 15000000)
  const paidAmount = Math.round(totalAmount * (0.6 + Math.random() * 0.3))
  const outstandingAmount = totalAmount - paidAmount
  const overdueAmount = Math.round(outstandingAmount * (0.2 + Math.random() * 0.5))

  const monthlyAmounts = months.map((m) => ({
    month: m,
    amount: randomBetween(totalAmount / months.length * 0.5, totalAmount / months.length * 1.5),
    count: randomBetween(totalInvoices / months.length * 0.5, totalInvoices / months.length * 1.5),
  }))

  const statuses = [
    { status: 'Plaćena', count: 0, amount: 0 },
    { status: 'Poslata', count: 0, amount: 0 },
    { status: 'Načrt', count: 0, amount: 0 },
    { status: 'Otkazana', count: 0, amount: 0 },
  ]
  statuses[0].count = Math.round(totalInvoices * 0.65)
  statuses[0].amount = paidAmount
  statuses[1].count = Math.round(totalInvoices * 0.2)
  statuses[1].amount = outstandingAmount
  statuses[2].count = Math.round(totalInvoices * 0.1)
  statuses[2].amount = Math.round(totalAmount * 0.05)
  statuses[3].count = totalInvoices - statuses[0].count - statuses[1].count - statuses[2].count
  statuses[3].amount = Math.round(totalAmount * 0.02)

  const partnerNames = [
    'Delta Holding d.o.o.', 'Mercator-S d.o.o.', 'Idea d.o.o.',
    'TechPro Solutions', 'Maxi d.o.o.', 'Gorenje d.o.o.',
    'Nectar d.o.o.', 'Jaffa d.o.o.', 'Atlantic Grupa d.o.o.',
    'Knjaz Milos d.o.o.', 'Hemofarm d.o.o.', 'Yugoimport d.o.o.',
    'Zastava Automobili', 'Galens d.o.o.', 'Tesla Motors Srbija',
  ]

  const outstandingInvoices = Array.from({ length: 15 }, (_, i) => ({
    number: `Fak-${2025}-${String(100 + i).padStart(4, '0')}`,
    partner: partnerNames[i % partnerNames.length],
    amount: randomBetween(20000, 300000),
    dueDate: new Date(Date.now() - randomBetween(1, 90) * 86400000).toISOString(),
    daysOverdue: randomBetween(0, 60),
  }))

  return {
    dateFrom, dateTo, totalInvoices, totalAmount, paidAmount,
    outstandingAmount, overdueAmount, monthlyAmounts,
    statusDistribution: statuses, outstandingInvoices,
  }
}

// ==================== PROJECT PROGRESS ====================

export function generateProjectDemoData() {
  const statuses = ['Završen', 'U toku', 'Planiran', 'Na pauzi', 'Otkazan']
  const projectNames = [
    'Redesign web sajta', 'Mobilna aplikacija', 'ERP integracija',
    'Marketing kampanja', 'Infrastruktura', 'Data migracija',
    'Novi modul', 'Korisnički portal', 'API razvoj', 'Bezbednosni audit',
  ]
  const managers = ['Marko Petrović', 'Ana Jovanović', 'Nikola Stanković', 'Jelena Ilić']

  const projects = projectNames.map((name, i) => {
    const status = statuses[i % statuses.length]
    const progress = status === 'Završen' ? 100
      : status === 'U toku' ? randomBetween(20, 85)
      : status === 'Planiran' ? randomBetween(0, 10)
      : randomBetween(10, 70)
    const budget = randomBetween(200000, 2000000)
    const spent = Math.min(Math.round(budget * (progress / 100) * (0.8 + Math.random() * 0.4)), budget)
    const startDate = new Date(2025, randomBetween(0, 6), randomBetween(1, 28))
    const endDate = new Date(startDate.getTime() + randomBetween(30, 365) * 86400000)

    return {
      name, status,
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      budget, spent, progress,
      manager: managers[i % managers.length],
    }
  })

  const totalProjects = projects.length
  const completedProjects = projects.filter((p) => p.status === 'Završen').length
  const inProgressProjects = projects.filter((p) => p.status === 'U toku').length
  const totalBudget = projects.reduce((s, p) => s + p.budget, 0)
  const totalSpent = projects.reduce((s, p) => s + p.spent, 0)

  const statusDistribution = statuses.map((status) => {
    const filtered = projects.filter((p) => p.status === status)
    return { status, count: filtered.length, budget: filtered.reduce((s, p) => s + p.budget, 0) }
  })

  const budgetByStatus = statuses.map((status) => {
    const filtered = projects.filter((p) => p.status === status)
    return { status, budget: filtered.reduce((s, p) => s + p.budget, 0), spent: filtered.reduce((s, p) => s + p.spent, 0) }
  })

  return {
    totalProjects, completedProjects, inProgressProjects,
    totalBudget, totalSpent, statusDistribution, projects, budgetByStatus,
  }
}

// ==================== CUSTOMER ANALYSIS ====================

export function generateCustomerDemoData(dateFrom?: string, dateTo?: string) {
  const months = getMonthRange(dateFrom, dateTo)
  const segments = ['Enterprise', 'SMB', 'Startup', 'Individualni', 'Vlada/Državni']

  const totalCustomers = randomBetween(150, 500)
  const activeCustomers = Math.round(totalCustomers * (0.6 + Math.random() * 0.3))
  const newCustomers = Math.round(totalCustomers * (0.05 + Math.random() * 0.15))
  const totalRevenue = randomBetween(5000000, 20000000)
  const avgRevenuePerCustomer = Math.round(totalRevenue / totalCustomers)

  const customerGrowth: Array<{ month: string; count: number }> = []
  let runningCount = Math.round(totalCustomers * 0.7)
  months.forEach((m) => {
    runningCount += randomBetween(1, 15)
    customerGrowth.push({ month: m, count: runningCount })
  })

  const segmentDistribution = segments.map((segment) => ({
    segment,
    count: randomBetween(10, totalCustomers / 2),
    revenue: randomBetween(totalRevenue / segments.length * 0.3, totalRevenue / segments.length * 2),
  }))

  const topCustomers = Array.from({ length: 10 }, (_, i) => ({
    name: `Klijent ${i + 1}`,
    revenue: randomBetween(100000, 2000000),
    orders: randomBetween(5, 100),
    segment: segments[i % segments.length],
  })).sort((a, b) => b.revenue - a.revenue)

  const revenueBySegment = segments.map((segment) => ({
    segment,
    revenue: randomBetween(500000, 5000000),
    avgOrder: randomBetween(10000, 100000),
  }))

  return {
    dateFrom, dateTo, totalCustomers, newCustomers, activeCustomers,
    totalRevenue, avgRevenuePerCustomer, customerGrowth,
    segmentDistribution, topCustomers, revenueBySegment,
  }
}

// ==================== TYPE MAP ====================

export type ReportType = 'financial' | 'sales' | 'inventory' | 'employee' | 'invoice' | 'project' | 'customer'

export const REPORT_TYPE_LABELS: Record<ReportType, string> = {
  financial: 'Finansijski izveštaj',
  sales: 'Izveštaj analitike prodaje',
  inventory: 'Izveštaj statusa inventara',
  employee: 'Izveštaj o zaposlenima',
  invoice: 'Izveštaj faktura',
  project: 'Izveštaj o napretku projekata',
  customer: 'Izveštaj analize klijenata',
}

export const REPORT_TYPE_ICONS: Record<ReportType, string> = {
  financial: 'DollarSign',
  sales: 'TrendingUp',
  inventory: 'Package',
  employee: 'Users',
  invoice: 'FileText',
  project: 'FolderKanban',
  customer: 'UserCheck',
}

export function generateDemoData(type: ReportType, dateFrom?: string, dateTo?: string) {
  switch (type) {
    case 'financial': return generateFinancialDemoData(dateFrom, dateTo)
    case 'sales': return generateSalesDemoData(dateFrom, dateTo)
    case 'inventory': return generateInventoryDemoData()
    case 'employee': return generateEmployeeDemoData()
    case 'invoice': return generateInvoiceDemoData(dateFrom, dateTo)
    case 'project': return generateProjectDemoData()
    case 'customer': return generateCustomerDemoData(dateFrom, dateTo)
  }
}
