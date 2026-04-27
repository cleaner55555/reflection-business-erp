import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET /api/transactions?type=...&category=...&dateFrom=...&dateTo=...&search=...
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || '';
    const category = searchParams.get('category') || '';
    const dateFrom = searchParams.get('dateFrom') || '';
    const dateTo = searchParams.get('dateTo') || '';
    const search = searchParams.get('search') || '';

    const where: Record<string, unknown> = {};

    if (type) {
      where.type = type;
    }

    if (category) {
      where.category = category;
    }

    if (dateFrom || dateTo) {
      where.date = {};
      if (dateFrom) {
        (where.date as Record<string, unknown>).gte = new Date(dateFrom);
      }
      if (dateTo) {
        (where.date as Record<string, unknown>).lte = new Date(dateTo);
      }
    }

    if (search) {
      where.OR = [
        { description: { contains: search } },
        { documentRef: { contains: search } },
      ];
    }

    const transactions = await db.transaction.findMany({
      where,
      orderBy: { date: 'desc' },
    });

    return NextResponse.json(transactions);
  } catch (error) {
    console.error('Error fetching transactions:', error);
    return NextResponse.json({ error: 'Failed to fetch transactions' }, { status: 500 });
  }
}

// POST /api/transactions
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const { type, category, amount, description, documentRef, partnerId, date } = body;

    const validTypes = ['prihod', 'rashod'];
    if (!type || !validTypes.includes(type)) {
      return NextResponse.json(
        { error: 'Type is required and must be "prihod" or "rashod"' },
        { status: 400 }
      );
    }

    const validCategories = ['promet', 'nabavka', 'plata', 'režije', 'ostalo'];
    if (!category || !validCategories.includes(category)) {
      return NextResponse.json(
        { error: `Category is required and must be one of: ${validCategories.join(', ')}` },
        { status: 400 }
      );
    }

    if (!amount || parseFloat(amount) <= 0) {
      return NextResponse.json({ error: 'Amount must be a positive number' }, { status: 400 });
    }

    if (!description) {
      return NextResponse.json({ error: 'Description is required' }, { status: 400 });
    }

    const transaction = await db.transaction.create({
      data: {
        date: date ? new Date(date) : undefined,
        type,
        category,
        amount: parseFloat(amount),
        description,
        documentRef,
        partnerId,
      },
    });

    return NextResponse.json(transaction, { status: 201 });
  } catch (error) {
    console.error('Error creating transaction:', error);
    return NextResponse.json({ error: 'Failed to create transaction' }, { status: 500 });
  }
}
