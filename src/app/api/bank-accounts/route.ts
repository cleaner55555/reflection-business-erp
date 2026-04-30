import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET /api/bank-accounts
export async function GET() {
  try {
    const accounts = await db.bankAccount.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        _count: { select: { transactions: true } },
      },
    });
    return NextResponse.json(accounts);
  } catch (error) {
    console.error('Error fetching bank accounts:', error);
    return NextResponse.json({ error: 'Failed to fetch bank accounts' }, { status: 500 });
  }
}

// POST /api/bank-accounts
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, bank, account, currency, isActive, balance } = body;

    if (!name || !account) {
      return NextResponse.json({ error: 'name and account are required' }, { status: 400 });
    }

    const bankAccount = await db.bankAccount.create({
      data: {
        name,
        bank: bank || null,
        account,
        currency: currency || 'RSD',
        isActive: isActive !== undefined ? isActive : true,
        balance: balance || 0,
      },
    });

    return NextResponse.json(bankAccount, { status: 201 });
  } catch (error) {
    console.error('Error creating bank account:', error);
    return NextResponse.json({ error: 'Failed to create bank account' }, { status: 500 });
  }
}
