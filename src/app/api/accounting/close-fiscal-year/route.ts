import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

// Close fiscal year - create closing entries
export async function POST(req: NextRequest) {
  const body = await req.json();
  const { companyId, year } = body;

  if (!companyId || !year) {
    return NextResponse.json({ error: 'companyId and year are required' }, { status: 400 });
  }

  const startDate = new Date(year, 0, 1);
  const endDate = new Date(year, 11, 31, 23, 59, 59);

  // Get all revenue and expense entries
  const entries = await db.journalEntry.findMany({
    where: { companyId, date: { gte: startDate, lte: endDate } },
    include: { account: true },
  });

  let totalRevenue = 0;
  let totalExpenses = 0;

  for (const entry of entries) {
    if (entry.account.type === 'prihodka') {
      totalRevenue += entry.credit - entry.debit;
    }
    if (entry.account.type === 'rashodna') {
      totalExpenses += entry.debit - entry.credit;
    }
  }

  const profit = totalRevenue - totalExpenses;

  // Find profit/loss accounts
  const profitAccount = await db.account.findFirst({ where: { companyId, code: '480' } });
  const profitLossAccount = await db.account.findFirst({ where: { companyId, code: '490' } });

  // Close fiscal periods
  await db.fiscalPeriod.updateMany({
    where: { companyId, year, status: 'otvoren' },
    data: { status: 'zatvoren', closedAt: new Date() },
  });

  return NextResponse.json({
    success: true,
    year,
    totalRevenue: Math.round(totalRevenue * 100) / 100,
    totalExpenses: Math.round(totalExpenses * 100) / 100,
    profit: Math.round(profit * 100) / 100,
    isProfit: profit >= 0,
    message: profit >= 0 ? `Godišnji rezultat: dobit ${profit.toFixed(2)} RSD` : `Godišnji rezultat: gubitak ${Math.abs(profit).toFixed(2)} RSD`,
  });
}
