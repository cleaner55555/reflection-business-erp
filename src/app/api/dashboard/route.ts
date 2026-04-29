import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET /api/dashboard
export async function GET(request: NextRequest) {
  try {
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const firstDayOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastDayOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

    // Today boundaries (start and end of day)
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
    const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

    // Yesterday boundaries
    const startOfYesterday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1, 0, 0, 0, 0);
    const endOfYesterday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1, 23, 59, 59, 999);

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
    ] = await Promise.all([
      // Total revenue from income transactions
      db.transaction.aggregate({
        where: { type: 'prihod' },
        _sum: { amount: true },
      }),

      // Total expenses from expense transactions
      db.transaction.aggregate({
        where: { type: 'rashod' },
        _sum: { amount: true },
      }),

      // Invoice count
      db.invoice.count(),

      // Low stock products (currentStock <= minStock)
      db.product.count({
        where: { currentStock: { lte: 0 } },
      }),

      // Recent invoices (last 5)
      db.invoice.findMany({
        orderBy: { date: 'desc' },
        take: 5,
        include: {
          partner: { select: { id: true, name: true } },
        },
      }),

      // Monthly revenue chart data (last 12 months)
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

      // Cash balance (ulaz - izlaz from cash register)
      db.cashRegister.aggregate({
        _sum: {
          amount: true,
        },
      }),

      // Unpaid invoices total
      db.invoice.aggregate({
        where: { status: { in: ['nacrt', 'poslata'] } },
        _sum: { totalAmount: true },
      }),

      // Partner count
      db.partner.count(),

      // Product count
      db.product.count(),

      // This month revenue
      db.transaction.aggregate({
        where: {
          type: 'prihod',
          date: { gte: firstDayOfMonth },
        },
        _sum: { amount: true },
      }),

      // Last month revenue
      db.transaction.aggregate({
        where: {
          type: 'prihod',
          date: { gte: firstDayOfLastMonth, lte: lastDayOfLastMonth },
        },
        _sum: { amount: true },
      }),

      // Expenses by category
      db.transaction.groupBy({
        by: ['category'],
        where: { type: 'rashod' },
        _sum: { amount: true },
        orderBy: { _sum: { amount: 'desc' } },
      }),

      // Overdue invoices (dueDate < now AND not paid/cancelled)
      db.invoice.findMany({
        where: {
          dueDate: { lt: startOfToday },
          status: { notIn: ['placena', 'otkazana'] },
        },
        orderBy: { dueDate: 'asc' },
        take: 10,
        include: {
          partner: { select: { id: true, name: true } },
        },
      }),

      // Today's due invoices
      db.invoice.findMany({
        where: {
          dueDate: { gte: startOfToday, lte: endOfToday },
          status: { notIn: ['placena', 'otkazana'] },
        },
        orderBy: { dueDate: 'asc' },
        include: {
          partner: { select: { id: true, name: true } },
        },
      }),

      // Recent partners (last 5)
      db.partner.findMany({
        orderBy: { createdAt: 'desc' },
        take: 5,
        select: {
          id: true,
          name: true,
          pib: true,
          type: true,
          city: true,
          createdAt: true,
        },
      }),

      // Recent transactions (last 5)
      db.transaction.findMany({
        orderBy: { date: 'desc' },
        take: 5,
      }),

      // New partners this month
      db.partner.count({
        where: {
          createdAt: { gte: firstDayOfMonth },
        },
      }),

      // Unpaid invoice count
      db.invoice.count({
        where: { status: { in: ['nacrt', 'poslata'] } },
      }),
    ]);

    // Cash in/out separate totals
    const cashIn = await db.cashRegister.aggregate({
      where: { type: 'ulaz' },
      _sum: { amount: true },
    });

    const cashOut = await db.cashRegister.aggregate({
      where: { type: 'izlaz' },
      _sum: { amount: true },
    });

    // Overdue count
    const overdueCount = await db.invoice.count({
      where: {
        dueDate: { lt: startOfToday },
        status: { notIn: ['placena', 'otkazana'] },
      },
    });

    // Overdue total amount
    const overdueTotal = await db.invoice.aggregate({
      where: {
        dueDate: { lt: startOfToday },
        status: { notIn: ['placena', 'otkazana'] },
      },
      _sum: { totalAmount: true },
    });

    // Calculate revenue growth percentage
    const thisMonthTotal = thisMonthRevenue._sum.amount || 0;
    const lastMonthTotal = lastMonthRevenue._sum.amount || 0;
    const revenueGrowth = lastMonthTotal > 0
      ? ((thisMonthTotal - lastMonthTotal) / lastMonthTotal) * 100
      : 0;

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
      },
      recentInvoices,
      monthlyRevenueChart: monthlyRevenue.map((row) => ({
        month: row.month,
        revenue: Number(row.revenue),
      })),
      expensesByCategory: transactionsByCategory.map((row) => ({
        category: row.category,
        amount: row._sum.amount || 0,
      })),
      // New fields
      overdueInvoices,
      overdueCount,
      overdueTotal: overdueTotal._sum.totalAmount || 0,
      todayDueInvoices,
      recentPartners,
      recentTransactions,
      newPartnersThisMonth,
    });
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    return NextResponse.json({ error: 'Failed to fetch dashboard data' }, { status: 500 });
  }
}
