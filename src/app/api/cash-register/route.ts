import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET /api/cash-register?dateFrom=...&dateTo=...&type=...
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const dateFrom = searchParams.get('dateFrom') || '';
    const dateTo = searchParams.get('dateTo') || '';
    const type = searchParams.get('type') || '';

    const where: Record<string, unknown> = {};

    if (type) {
      where.type = type;
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

    const records = await db.cashRegister.findMany({
      where,
      orderBy: { date: 'desc' },
    });

    return NextResponse.json(records);
  } catch (error) {
    console.error('Error fetching cash register records:', error);
    return NextResponse.json({ error: 'Failed to fetch cash register records' }, { status: 500 });
  }
}

// POST /api/cash-register
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const { type, amount, description, partnerName, paymentMethod, date } = body;

    const validTypes = ['ulaz', 'izlaz'];
    if (!type || !validTypes.includes(type)) {
      return NextResponse.json(
        { error: 'Type is required and must be "ulaz" or "izlaz"' },
        { status: 400 }
      );
    }

    if (!amount || parseFloat(amount) <= 0) {
      return NextResponse.json({ error: 'Amount must be a positive number' }, { status: 400 });
    }

    if (!description) {
      return NextResponse.json({ error: 'Description is required' }, { status: 400 });
    }

    const record = await db.cashRegister.create({
      data: {
        date: date ? new Date(date) : undefined,
        type,
        amount: parseFloat(amount),
        description,
        partnerName,
        paymentMethod: paymentMethod || 'gotovina',
      },
    });

    return NextResponse.json(record, { status: 201 });
  } catch (error) {
    console.error('Error creating cash register record:', error);
    return NextResponse.json({ error: 'Failed to create cash register record' }, { status: 500 });
  }
}
