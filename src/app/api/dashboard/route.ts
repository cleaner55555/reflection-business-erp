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
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 86400000);

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
      invoicesByStatus,
      topPartners,
      dealsByStage,
      activeProjectStats,
      monthlyExpenses,
      employeeCount,
      thisMonthInvoiceCount,
      lastMonthInvoiceCount,
      // NEW: Daily cash flow (last 30 days)
      dailyCashFlow,
      // NEW: Top products by invoice amount
      topProducts,
      // NEW: Won deals this month
      wonDealsThisMonth,
      // NEW: Total receivables aging
      receivablesAging,
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
      db.invoice.groupBy({
        by: ['status'],
        _count: { id: true },
        _sum: { totalAmount: true },
      }),
      db.invoice.groupBy({
        by: ['partnerId'],
        where: { status: { not: 'otkazana' } },
        _sum: { totalAmount: true },
        _count: { id: true },
        orderBy: { _sum: { totalAmount: 'desc' } },
        take: 5,
      }),
      db.deal.groupBy({
        by: ['stage'],
        _count: { id: true },
        _sum: { expectedRevenue: true },
      }),
      Promise.all([
        db.project.count({ where: { status: 'aktivan' } }),
        db.project.aggregate({
          where: { status: 'aktivan' },
          _sum: { budget: true, spent: true },
        }),
        db.project.count({ where: { status: 'aktivan', progress: { lt: 50 } } }),
      ]),
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
      db.employee.count({ where: { isActive: true } }),
      db.invoice.count({
        where: {
          date: { gte: firstDayOfMonth },
          status: { not: 'otkazana' },
        },
      }),
      db.invoice.count({
        where: {
          date: { gte: firstDayOfLastMonth, lte: lastDayOfLastMonth },
          status: { not: 'otkazana' },
        },
      }),
      // NEW: Daily cash flow (last 30 days)
      db.$queryRaw<Array<{ date: string; cash_in: number; cash_out: number }>>`
        WITH RECURSIVE days(d) AS (
          SELECT date('now', '-29 days')
          UNION ALL
          SELECT date(d, '+1 day')
          FROM days
          WHERE d < date('now')
        )
        SELECT
          strftime('%Y-%m-%d', days.d) as date,
          COALESCE(SUM(CASE WHEN cr.type = 'ulaz' THEN cr.amount ELSE 0 END), 0) as cash_in,
          COALESCE(SUM(CASE WHEN cr.type = 'izlaz' THEN cr.amount ELSE 0 END), 0) as cash_out
        FROM days
        LEFT JOIN "CashRegister" cr ON strftime('%Y-%m-%d', cr.date / 1000, 'unixepoch') = strftime('%Y-%m-%d', days.d)
        GROUP BY days.d
        ORDER BY days.d ASC
      `,
      // NEW: Top products by invoiced amount
      db.$queryRaw<Array<{ productId: string; productName: string; totalQuantity: number; totalAmount: number }>>`
        SELECT 
          ii."productId",
          p."name" as "productName",
          SUM(ii."quantity") as "totalQuantity",
          SUM(ii."total") as "totalAmount"
        FROM "InvoiceItem" ii
        JOIN "Invoice" inv ON ii."invoiceId" = inv."id"
        JOIN "Product" p ON ii."productId" = p."id"
        WHERE inv."status" NOT IN ('otkazana')
        GROUP BY ii."productId", p."name"
        ORDER BY "totalAmount" DESC
        LIMIT 8
      `,
      // NEW: Won deals this month (revenue)
      db.deal.aggregate({
        where: { stage: 'won', updatedAt: { gte: firstDayOfMonth } },
        _sum: { expectedRevenue: true },
        _count: true,
      }),
      // NEW: Receivables aging buckets
      Promise.all([
        db.invoice.aggregate({
          where: { status: 'poslata', dueDate: { lt: new Date(now.getTime() - 30 * 86400000) } },
          _sum: { totalAmount: true },
          _count: true,
        }),
        db.invoice.aggregate({
          where: { status: 'poslata', dueDate: { gte: new Date(now.getTime() - 30 * 86400000), lt: new Date(now.getTime() - 7 * 86400000) } },
          _sum: { totalAmount: true },
          _count: true,
        }),
        db.invoice.aggregate({
          where: { status: 'poslata', dueDate: { gte: new Date(now.getTime() - 7 * 86400000), lt: startOfToday } },
          _sum: { totalAmount: true },
          _count: true,
        }),
        db.invoice.aggregate({
          where: { status: 'poslata', dueDate: { gte: startOfToday } },
          _sum: { totalAmount: true },
          _count: true,
        }),
      ]),
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

    // Receivables aging
    const [agingOver30, aging7to30, aging1to7, agingCurrent] = receivablesAging as [
      { _sum: { totalAmount: number }; _count: number },
      { _sum: { totalAmount: number }; _count: number },
      { _sum: { totalAmount: number }; _count: number },
      { _sum: { totalAmount: number }; _count: number },
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

    // ========== BUSINESS HEALTH SCORE ==========
    const totalRev = totalRevenue._sum.amount || 0;
    const totalExp = totalExpenses._sum.amount || 0;
    const profitMargin = totalRev > 0 ? ((totalRev - totalExp) / totalRev) * 100 : 0;
    const unpaidRatio = totalRev > 0 ? ((unpaidInvoices._sum.totalAmount || 0) / totalRev) * 100 : 0;
    const stockHealth = productCount > 0 ? ((productCount - lowStockProducts) / productCount) * 100 : 100;
    const collectionRate = unpaidInvoiceCount > 0
      ? ((unpaidInvoiceCount - overdueCount) / unpaidInvoiceCount) * 100 : 100;

    // Weighted health score (0-100)
    const healthScore = Math.round(
      Math.min(100, Math.max(0,
        (Math.min(profitMargin / 20, 1) * 30) +      // profit margin (30%)
        (Math.max(0, 1 - unpaidRatio / 50) * 25) +     // unpaid ratio (25%)
        (stockHealth / 100 * 20) +                       // stock health (20%)
        (collectionRate / 100 * 15) +                    // collection rate (15%)
        (dealsByStage.filter(d => d.stage === 'won').length > 0 ? 10 : 3) // CRM activity (10%)
      ))
    );

    // ========== MONTHLY GOALS ==========
    // Estimate goals based on last month performance + 10% growth target
    const revenueGoal = Math.round((lastMonthTotal || 0) * 1.1) || 100000;
    const revenueProgress = revenueGoal > 0 ? Math.min(100, (thisMonthTotal / revenueGoal) * 100) : 0;
    const invoiceGoal = Math.round((lastMonthInvoiceCount || 0) * 1.15) || 10;
    const invoiceProgress = invoiceGoal > 0 ? Math.min(100, (thisMonthInvoiceCount / invoiceGoal) * 100) : 0;
    const dealGoal = 5;
    const dealsClosed = wonDealsThisMonth._count;
    const dealProgress = dealGoal > 0 ? Math.min(100, (dealsClosed / dealGoal) * 100) : 0;
    const partnerGoal = Math.max(5, Math.round((newPartnersThisMonth || 0) * 1.2)) || 5;
    const partnerProgress = partnerGoal > 0 ? Math.min(100, (newPartnersThisMonth / partnerGoal) * 100) : 0;

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
      // NEW fields
      businessHealthScore: {
        score: healthScore,
        profitMargin: Math.round(profitMargin * 10) / 10,
        stockHealth: Math.round(stockHealth * 10) / 10,
        collectionRate: Math.round(collectionRate * 10) / 10,
        unpaidRatio: Math.round(unpaidRatio * 10) / 10,
      },
      monthlyGoals: {
        revenue: { current: thisMonthTotal, goal: revenueGoal, progress: Math.round(revenueProgress) },
        invoices: { current: thisMonthInvoiceCount, goal: invoiceGoal, progress: Math.round(invoiceProgress) },
        deals: { current: dealsClosed, goal: dealGoal, progress: Math.round(dealProgress) },
        partners: { current: newPartnersThisMonth, goal: partnerGoal, progress: Math.round(partnerProgress) },
      },
      dailyCashFlow: dailyCashFlow.map(d => ({
        date: d.date,
        cashIn: Number(d.cash_in),
        cashOut: Number(d.cash_out),
      })),
      topProducts: topProducts.map(p => ({
        productId: p.productId,
        name: p.productName,
        quantity: Number(p.totalQuantity),
        amount: Number(p.totalAmount),
      })),
      receivablesAging: {
        over30: { amount: agingOver30._sum.totalAmount || 0, count: agingOver30._count },
        sevenTo30: { amount: aging7to30._sum.totalAmount || 0, count: aging7to30._count },
        oneTo7: { amount: aging1to7._sum.totalAmount || 0, count: aging1to7._count },
        current: { amount: agingCurrent._sum.totalAmount || 0, count: agingCurrent._count },
      },
      wonDealsThisMonth: {
        count: wonDealsThisMonth._count,
        revenue: wonDealsThisMonth._sum.expectedRevenue || 0,
      },
    });
  } catch (error) {
    console.error('Dashboard API error:', error);
    return NextResponse.json({ error: 'Failed to fetch dashboard data' }, { status: 500 });
  }
}
