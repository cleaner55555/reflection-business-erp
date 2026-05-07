import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET /api/dashboard
export async function GET(request: NextRequest) {
  try {
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const firstDayOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastDayOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
    const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

    // Run all queries in parallel for performance
    const [
      totalRevenue,
      totalExpenses,
      invoiceCount,
      lowStockProducts,
      recentInvoices,
      monthlyRevenue,
      cashBalance,
      unpaidInvoices,
      partnerCount,
      productCount,
      thisMonthRevenue,
      lastMonthRevenue,
      transactionsByCategory,
      overdueInvoices,
      todayDueInvoices,
      recentPartners,
      recentTransactions,
      newPartnersThisMonth,
      unpaidInvoiceCount,
      // NEW: Invoices by status
      invoicesByStatus,
      // NEW: Top partners by revenue
      topPartners,
      // NEW: CRM deals by stage
      dealsByStage,
      // NEW: Active projects
      activeProjectStats,
      // NEW: Monthly expenses (same 12 months)
      monthlyExpenses,
      // NEW: Employee count
      employeeCount,
      // NEW: This month invoice count
      thisMonthInvoiceCount,
      // NEW: Last month invoice count
      lastMonthInvoiceCount,
    ] = await Promise.all([
      db.transaction.aggregate({
        where: { type: 'prihod' },
        _sum: { amount: true },
      }),
      db.transaction.aggregate({
        where: { type: 'rashod' },
        _sum: { amount: true },
      }),
      db.invoice.count(),
      db.product.count({
        where: { currentStock: { lte: 0 } },
      }),
      db.invoice.findMany({
        orderBy: { date: 'desc' },
        take: 8,
        include: { partner: { select: { id: true, name: true } } },
      }),
      db.$queryRaw<Array<{ month: string; revenue: number }>>`
        WITH RECURSIVE months(month_date) AS (
          SELECT date('now', '-11 months', 'start of month')
          UNION ALL
          SELECT date(month_date, '+1 month')
          FROM months
          WHERE month_date < date('now', 'start of month')
        )
        SELECT
          strftime('%Y-%m', m.month_date) as month,
          COALESCE(SUM(t.amount), 0) as revenue
        FROM months m
        LEFT JOIN "Transaction" t ON t.type = 'prihod'
          AND strftime('%Y-%m', date(t.date / 1000, 'unixepoch')) = strftime('%Y-%m', m.month_date)
        GROUP BY m.month_date
        ORDER BY m.month_date ASC
      `,
      db.cashRegister.aggregate({ _sum: { amount: true } }),
      db.invoice.aggregate({
        where: { status: { in: ['nacrt', 'poslata'] } },
        _sum: { totalAmount: true },
      }),
      db.partner.count(),
      db.product.count(),
      db.transaction.aggregate({
        where: { type: 'prihod', date: { gte: firstDayOfMonth } },
        _sum: { amount: true },
      }),
      db.transaction.aggregate({
        where: { type: 'prihod', date: { gte: firstDayOfLastMonth, lte: lastDayOfLastMonth } },
        _sum: { amount: true },
      }),
      db.transaction.groupBy({
        by: ['category'],
        where: { type: 'rashod' },
        _sum: { amount: true },
        orderBy: { _sum: { amount: 'desc' } },
      }),
      db.invoice.findMany({
        where: {
          dueDate: { lt: startOfToday },
          status: { notIn: ['placena', 'otkazana'] },
        },
        orderBy: { dueDate: 'asc' },
        take: 10,
        include: { partner: { select: { id: true, name: true } } },
      }),
      db.invoice.findMany({
        where: {
          dueDate: { gte: startOfToday, lte: endOfToday },
          status: { notIn: ['placena', 'otkazana'] },
        },
        orderBy: { dueDate: 'asc' },
        include: { partner: { select: { id: true, name: true } } },
      }),
      db.partner.findMany({
        orderBy: { createdAt: 'desc' },
        take: 5,
        select: { id: true, name: true, pib: true, type: true, city: true, createdAt: true },
      }),
      db.transaction.findMany({
        orderBy: { date: 'desc' },
        take: 5,
      }),
      db.partner.count({
        where: { createdAt: { gte: firstDayOfMonth } },
      }),
      db.invoice.count({
        where: { status: { in: ['nacrt', 'poslata'] } },
      }),
      // NEW: Invoices grouped by status
      db.invoice.groupBy({
        by: ['status'],
        _count: { id: true },
        _sum: { totalAmount: true },
      }),
      // NEW: Top 5 partners by total invoiced amount
      db.invoice.groupBy({
        by: ['partnerId'],
        where: { status: { not: 'otkazana' } },
        _sum: { totalAmount: true },
        _count: { id: true },
        orderBy: { _sum: { totalAmount: 'desc' } },
        take: 5,
      }),
      // NEW: Deals grouped by stage (CRM pipeline)
      db.deal.groupBy({
        by: ['stage'],
        _count: { id: true },
        _sum: { expectedRevenue: true },
      }),
      // NEW: Active project stats
      Promise.all([
        db.project.count({ where: { status: 'aktivan' } }),
        db.project.aggregate({
          where: { status: 'aktivan' },
          _sum: { budget: true, spent: true },
        }),
        db.project.count({ where: { status: 'aktivan', progress: { lt: 50 } } }),
      ]),
      // NEW: Monthly expenses (same 12 months)
      db.$queryRaw<Array<{ month: string; expenses: number }>>`
        WITH RECURSIVE months(month_date) AS (
          SELECT date('now', '-11 months', 'start of month')
          UNION ALL
          SELECT date(month_date, '+1 month')
          FROM months
          WHERE month_date < date('now', 'start of month')
        )
        SELECT
          strftime('%Y-%m', m.month_date) as month,
          COALESCE(SUM(t.amount), 0) as expenses
        FROM months m
        LEFT JOIN "Transaction" t ON t.type = 'rashod'
          AND strftime('%Y-%m', date(t.date / 1000, 'unixepoch')) = strftime('%Y-%m', m.month_date)
        GROUP BY m.month_date
        ORDER BY m.month_date ASC
      `,
      // NEW: Employee count
      db.employee.count({ where: { isActive: true } }),
      // NEW: This month invoice count
      db.invoice.count({
        where: {
          date: { gte: firstDayOfMonth },
          status: { not: 'otkazana' },
        },
      }),
      // NEW: Last month invoice count
      db.invoice.count({
        where: {
          date: { gte: firstDayOfLastMonth, lte: lastDayOfLastMonth },
          status: { not: 'otkazana' },
        },
      }),
    ]);

    // Cash in/out separate
    const [cashIn, cashOut] = await Promise.all([
      db.cashRegister.aggregate({ where: { type: 'ulaz' }, _sum: { amount: true } }),
      db.cashRegister.aggregate({ where: { type: 'izlaz' }, _sum: { amount: true } }),
    ]);

    const overdueCount = await db.invoice.count({
      where: { dueDate: { lt: startOfToday }, status: { notIn: ['placena', 'otkazana'] } },
    });
    const overdueTotal = await db.invoice.aggregate({
      where: { dueDate: { lt: startOfToday }, status: { notIn: ['placena', 'otkazana'] } },
      _sum: { totalAmount: true },
    });

    // Revenue growth
    const thisMonthTotal = thisMonthRevenue._sum.amount || 0;
    const lastMonthTotal = lastMonthRevenue._sum.amount || 0;
    const revenueGrowth = lastMonthTotal > 0
      ? ((thisMonthTotal - lastMonthTotal) / lastMonthTotal) * 100
      : 0;

    // Invoice count growth
    const invoiceCountGrowth = lastMonthInvoiceCount > 0
      ? ((thisMonthInvoiceCount - lastMonthInvoiceCount) / lastMonthInvoiceCount) * 100
      : 0;

    // Resolve top partners names
    const topPartnerIds = topPartners.map(p => p.partnerId).filter(Boolean);
    const partnerNames = topPartnerIds.length > 0
      ? await db.partner.findMany({
          where: { id: { in: topPartnerIds } },
          select: { id: true, name: true },
        })
      : [];
    const partnerNameMap = new Map(partnerNames.map(p => [p.id, p.name]));

    // Active project stats
    const [activeProjectCount, projectBudgets, strugglingProjects] = activeProjectStats as [
      number, { _sum: { budget: number; spent: number } }, number
    ];

    // Merge revenue + expenses into single monthly chart
    const monthlyChart = monthlyRevenue.map(r => {
      const expRow = monthlyExpenses.find(e => e.month === r.month)
      return {
        month: r.month,
        revenue: Number(r.revenue),
        expenses: Number(expRow?.expenses || 0),
      }
    })

    return NextResponse.json({
      kpis: {
        totalRevenue: totalRevenue._sum.amount || 0,
        totalExpenses: totalExpenses._sum.amount || 0,
        netProfit: (totalRevenue._sum.amount || 0) - (totalExpenses._sum.amount || 0),
        invoiceCount,
        lowStockProducts,
        unpaidInvoiceAmount: unpaidInvoices._sum.totalAmount || 0,
        unpaidInvoiceCount,
        partnerCount,
        productCount,
        thisMonthRevenue: thisMonthTotal,
        lastMonthRevenue: lastMonthTotal,
        revenueGrowth: Math.round(revenueGrowth * 100) / 100,
        cashIn: cashIn._sum.amount || 0,
        cashOut: cashOut._sum.amount || 0,
        cashBalance: (cashIn._sum.amount || 0) - (cashOut._sum.amount || 0),
        employeeCount,
        invoiceCountGrowth: Math.round(invoiceCountGrowth * 100) / 100,
        thisMonthInvoiceCount,
        lastMonthInvoiceCount,
      },
      recentInvoices,
      monthlyChart,
      expensesByCategory: transactionsByCategory.map((row) => ({
        category: row.category,
        amount: row._sum.amount || 0,
      })),
      overdueInvoices,
      overdueCount,
      overdueTotal: overdueTotal._sum.totalAmount || 0,
      todayDueInvoices,
      recentPartners,
      recentTransactions,
      newPartnersThisMonth,
      // NEW fields
      invoicesByStatus: invoicesByStatus.map(s => ({
        status: s.status,
        count: s._count.id,
        total: s._sum.totalAmount || 0,
      })),
      topPartners: topPartners.map(p => ({
        partnerId: p.partnerId,
        partnerName: partnerNameMap.get(p.partnerId || '') || '-',
        totalAmount: p._sum.totalAmount || 0,
        invoiceCount: p._count.id,
      })),
      dealsByStage: dealsByStage.map(d => ({
        stage: d.stage,
        count: d._count.id,
        value: d._sum.expectedRevenue || 0,
      })),
      activeProjects: {
        count: activeProjectCount,
        totalBudget: projectBudgets._sum.budget || 0,
        totalSpent: projectBudgets._sum.spent || 0,
        strugglingCount: strugglingProjects,
      },
    });
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    return NextResponse.json({ error: 'Failed to fetch dashboard data' }, { status: 500 });
  }
}
