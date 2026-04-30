import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

// Analytic accounting report - by project/department
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const companyId = searchParams.get('companyId') || '';
  const analyticAccount = searchParams.get('analyticAccount') || '';
  const year = parseInt(searchParams.get('year') || new Date().getFullYear().toString());

  if (!companyId) {
    return NextResponse.json({ error: 'companyId is required' }, { status: 400 });
  }

  const startDate = new Date(year, 0, 1);
  const endDate = new Date(year, 11, 31, 23, 59, 59);

  const where: Record<string, unknown> = {
    companyId,
    date: { gte: startDate, lte: endDate },
    analyticAccount: { not: null },
  };
  if (analyticAccount) where.analyticAccount = analyticAccount;

  const entries = await db.journalEntry.findMany({
    where,
    include: { account: { select: { code: true, name: true, type: true } } },
  });

  // Group by analytic account
  const analytics: Record<string, { debit: number; credit: number; balance: number; entries: typeof entries }> = {};
  for (const entry of entries) {
    const key = entry.analyticAccount || 'Nedefinisano';
    if (!analytics[key]) {
      analytics[key] = { debit: 0, credit: 0, balance: 0, entries: [] };
    }
    analytics[key].debit += entry.debit;
    analytics[key].credit += entry.credit;
    analytics[key].balance += entry.debit - entry.credit;
    analytics[key].entries.push(entry);
  }

  return NextResponse.json({
    period: { year },
    analytics: Object.fromEntries(
      Object.entries(analytics).map(([key, val]) => [
        key,
        { ...val, debit: Math.round(val.debit * 100) / 100, credit: Math.round(val.credit * 100) / 100, balance: Math.round(val.balance * 100) / 100 },
      ])
    ),
    totalEntries: entries.length,
  });
}
