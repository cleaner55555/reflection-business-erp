export const COLORS = ['#059669', '#0891b2', '#7c3aed', '#ea580c', '#db2777', '#0284c7', '#ca8a04']

export const COLORS_SEMI = ['#05966980', '#0891b280', '#7c3aed80', '#ea580c80', '#db277780', '#0284c780', '#ca8a0480']

export const TOOLTIP_STYLE = {
  borderRadius: '8px',
  border: '1px solid #e5e7eb',
  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
  fontSize: '12px',
} as const;

export const { kpis, monthlyRevenueChart } = dashboardData;

export const totalRev = Math.max(kpis.totalRevenue, 1);

export const expenseRatio = kpis.totalExpenses / totalRev;

export const monthlyPL = monthlyRevenueChart.map((item) => {
    const rev = item.revenue
    const exp = rev * expenseRatio * (0.8 + Math.random() * 0.4)
    return {
      month: item.month,
      revenue: Math.round(rev),
      expenses: Math.round(exp),
      profit: Math.round(rev - exp),
    }
  });

export const profitMarginTrend = monthlyPL.map((item) => ({
    month: item.month,
    margin: Number(((item.profit / Math.max(item.revenue, 1)) * 100).toFixed(1)),
  }));

export const paymentMethodData = [
    { name: 'Gotovina', value: Math.round(totalRev * 0.35) },
    { name: 'Račun', value: Math.round(totalRev * 0.40) },
    { name: 'Kartica', value: Math.round(totalRev * 0.25) },
  ]

export const incomeCategories = [
    { category: 'Prodaja robe', amount: Math.round(totalRev * 0.75) },
    { category: 'Usluge', amount: Math.round(totalRev * 0.15) },
    { category: 'Ostali prihodi', amount: Math.round(totalRev * 0.10) },
  ]

export const expenseCategories = [
    { category: 'Nabavka robe', amount: Math.round(kpis.totalExpenses * 0.55) },
    { category: 'Plata zaposlenih', amount: Math.round(kpis.totalExpenses * 0.25) },
    { category: 'Režije', amount: Math.round(kpis.totalExpenses * 0.12) },
    { category: 'Ostali rashodi', amount: Math.round(kpis.totalExpenses * 0.08) },
  ]

export const cashFlow = [
    { activity: 'Operativni', inflow: Math.round(totalRev * 0.90), outflow: Math.round(kpis.totalExpenses * 0.85), net: 0 },
    { activity: 'Investicioni', inflow: 0, outflow: Math.round(totalRev * 0.08), net: 0 },
    { activity: 'Finansijski', inflow: Math.round(totalRev * 0.05), outflow: Math.round(kpis.totalExpenses * 0.03), net: 0 },
  ]

export const taxSummary = {
    vatCollected: Math.round(totalRev * 0.20),
    vatPaid: Math.round(kpis.totalExpenses * 0.20),
  }

export const salesByPartner = partners.slice(0, 20).map((p) => ({
    name: p.name,
    invoiceCount: p._count.invoices,
    totalRevenue: Math.round((p._count.invoices * totalRev) / Math.max(partners.length, 1) * (0.5 + Math.random())),
  })).sort((a, b) => b.totalRevenue - a.totalRevenue);

export const salesByProduct = products.slice(0, 15).map((p) => ({
    name: p.name.length > 25 ? p.name.substring(0, 25) + '...' : p.name,
    quantitySold: Math.round(Math.random() * 200 + 10),
    revenue: Math.round(p.sellingPrice * (Math.random() * 50 + 5)),
  })).sort((a, b) => b.revenue - a.revenue).slice(0, 10);

export const categorySalesMap = new Map<string, number>();

export const cat = p.category || 'Bez kategorije';

export const salesByCategory = Array.from(categorySalesMap.entries());

export const dailySales = Array.from({ length: 30 }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - (29 - i))
    return {
      day: d.toISOString().slice(5, 10),
      amount: Math.round(totalRev / 30 * (0.6 + Math.random() * 0.8)),
    }
  });

export const salesPipeline = [
    { stage: 'Lead', count: Math.round(Math.random() * 100 + 80) },
    { stage: 'Ponuda', count: Math.round(Math.random() * 60 + 50) },
    { stage: 'Narudžbenica', count: Math.round(Math.random() * 40 + 30) },
    { stage: 'Faktura', count: Math.round(Math.random() * 25 + 15) },
  ]

export const stockValuation = Array.from(categorySalesMap.entries()).map(([name]) => {
    const catProducts = products.filter((p) => (p.category || 'Bez kategorije') === name)
    const totalValue = catProducts.reduce((sum, p) => sum + p.sellingPrice * p.currentStock, 0)
    return { category: name, value: Math.round(totalValue), itemCount: catProducts.length }
  }).sort((a, b) => b.value - a.value);

export const lowStockAlerts = products;

export const stockMovement = stockValuation.map((s) => ({
    category: s.category,
    incoming: Math.round(Math.random() * 500 + 100),
    outgoing: Math.round(Math.random() * 400 + 80),
  }));

export const inventoryTurnover = products.slice(0, 10).map((p) => ({
    name: p.name.length > 20 ? p.name.substring(0, 20) + '...' : p.name,
    turnoverRate: Number((Math.random() * 8 + 1).toFixed(1)),
  })).sort((a, b) => b.turnoverRate - a.turnoverRate);

export const deadStock = products.slice(0, 8).map((p) => ({
    name: p.name,
    stockValue: Math.round(p.sellingPrice * p.currentStock),
    daysInactive: Math.round(Math.random() * 200 + 90),
  }));

export const partnerActivity = partners.map((p) => ({
    name: p.name,
    type: p.type,
    invoiceCount: p._count.invoices,
    orderCount: p._count.purchaseOrders,
    totalAmount: Math.round((p._count.invoices + p._count.purchaseOrders) * totalRev / Math.max(partners.length, 1) * (0.3 + Math.random() * 1.4)),
    lastActivity: new Date(Date.now() - Math.random() * 90 * 86400000).toISOString().slice(0, 10),
  }));

export const partnerTypeMap = new Map<string, number>();

export const typeName = getStatusLabel(p.type);

export const partnerTypeDistribution = Array.from(partnerTypeMap.entries()).map(([name, value]) => ({ name, value }));

export const topDebtors = partners;

export const newPartnersTrend = monthlyRevenueChart.map(() => ({
    count: Math.round(Math.random() * 8 + 1),
  }));

export const departments = ['Razvoj', 'Prodaja', 'Marketing', 'Finansije', 'Logistika']

export const employeeNames = [
    'Marko Petrović', 'Ana Jovanović', 'Nikola Stanković',
    'Jelena Ilić', 'Milan Nikolić', 'Marija Đorđević',
    'Ivan Milić', 'Sara Tadić', 'Luka Vukčević', 'Maja Stojanović',
  ]

export const employeeData = employeeNames.map((name, i) => ({
    name,
    department: departments[i % departments.length],
    tasksCompleted: Math.round(Math.random() * 40 + 10),
    revenueGenerated: Math.round(totalRev / employeeNames.length * (0.3 + Math.random() * 1.4)),
    overtimeHours: Number((Math.random() * 30).toFixed(1)),
    attendanceRate: Number((85 + Math.random() * 15).toFixed(1)),
  }));

export const departmentHeadcount = departments.map((dept) => ({
    department: dept,
    count: employeeData.filter((e) => e.department === dept).length,
    avgSalary: Math.round(Math.random() * 80000 + 50000),
  }));

export const salaryDistribution = [
    { range: '50K-70K', count: Math.round(Math.random() * 5 + 2) },
    { range: '70K-90K', count: Math.round(Math.random() * 5 + 3) },
    { range: '90K-110K', count: Math.round(Math.random() * 4 + 1) },
    { range: '110K+', count: Math.round(Math.random() * 3) },
  ]

export const { t } = useTranslation();

export const { monthlyPL, salesByPartner, salesByProduct, salesByCategory } = data;

export const { kpis, monthlyRevenueChart, monthlyPL, profitMarginTrend, paymentMethodData } = data;

export const totalRev = Math.max(kpis.totalRevenue, 1);

export const profitMargin = ((kpis.netProfit / totalRev) * 100).toFixed(1);

export const avgInvoiceValue = totalRev / Math.max(partners.reduce((s, p) => s + p._count.invoices, 0), 1);

export const openInvoices = Math.round(partners.reduce((s, p) => s + p._count.invoices, 0) * 0.3);

export const handleGenerateCustom = () => {
    setCustomGenerated(true)
  }

export const handleSaveReport = () => {
    if (!customReportName.trim()) return
    const newReport: SavedReport = {
      id: String(Date.now()),
      name: customReportName,
      description: customReportDesc,
      metric: customMetric,
      dimension: customDimension,
      dateFrom: customDateFrom,
      dateTo: customDateTo,
    }
    setSavedReports((prev) => [...prev, newReport])
    setCustomReportName('')
    setCustomReportDesc('')
    setCustomDialogOpen(false)
  }

export const handleDeleteReport = (id: string) => {
    setSavedReports((prev) => prev.filter((r) => r.id !== id))
  }

export const handleRunSavedReport = (report: SavedReport) => {
    setCustomMetric(report.metric)
    setCustomDimension(report.dimension)
    setCustomDateFrom(report.dateFrom)
    setCustomDateTo(report.dateTo)
    setCustomGenerated(true)
    setActiveTab('custom')
  }

export const maxCount = Math.max(...data.salesPipeline.map((s) => s.count));

export const widthPercent = (stage.count / maxCount) * 100;

export function generateFinancialData(
