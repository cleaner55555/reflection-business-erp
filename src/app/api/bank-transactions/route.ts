import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET /api/bank-transactions?bankAccountId=...&reconciled=...&from=...&to=...
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const bankAccountId = searchParams.get('bankAccountId') || '';
    const reconciled = searchParams.get('reconciled');
    const from = searchParams.get('from') || '';
    const to = searchParams.get('to') || '';
    const search = searchParams.get('search') || '';

    const where: Record<string, unknown> = {};

    if (bankAccountId) {
      where.bankAccountId = bankAccountId;
    }

    if (reconciled !== null && reconciled !== '' && reconciled !== undefined) {
      where.isReconciled = reconciled === 'true';
    }

    if (from || to) {
      where.date = {};
      if (from) {
        (where.date as Record<string, unknown>).gte = new Date(from);
      }
      if (to) {
        (where.date as Record<string, unknown>).lte = new Date(to);
      }
    }

    if (search) {
      where.OR = [
        { description: { contains: search } },
        { counterpart: { contains: search } },
        { reference: { contains: search } },
      ];
    }

    const transactions = await db.bankTransaction.findMany({
      where,
      orderBy: { date: 'desc' },
      include: {
        bankAccount: { select: { id: true, name: true, account: true } },
        invoice: { select: { id: true, number: true, totalAmount: true, status: true, partner: { select: { name: true } } } },
      },
    });

    return NextResponse.json(transactions);
  } catch (error) {
    console.error('Error fetching bank transactions:', error);
    return NextResponse.json({ error: 'Failed to fetch bank transactions' }, { status: 500 });
  }
}
