import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET /api/recurring-invoices — List all recurring invoices
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const activeOnly = searchParams.get('active') === 'true';

    const where: Record<string, unknown> = {};
    if (activeOnly) {
      where.isActive = true;
    }

    const recurring = await db.recurringInvoice.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        partner: { select: { id: true, name: true } },
        _count: { select: { invoices: true } },
      },
    });

    return NextResponse.json(recurring);
  } catch (error) {
    console.error('Error fetching recurring invoices:', error);
    return NextResponse.json({ error: 'Failed to fetch recurring invoices' }, { status: 500 });
  }
}

// POST /api/recurring-invoices — Create recurring invoice template
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, partnerId, frequency, nextDate, startDate, endDate, items, notes } = body;

    if (!name || !partnerId || !frequency || !nextDate || !startDate) {
      return NextResponse.json(
        { error: 'name, partnerId, frequency, nextDate, and startDate are required' },
        { status: 400 }
      );
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'At least one invoice item is required' }, { status: 400 });
    }

    const validFrequencies = ['weekly', 'monthly', 'quarterly', 'yearly'];
    if (!validFrequencies.includes(frequency)) {
      return NextResponse.json({ error: 'Invalid frequency. Use: weekly, monthly, quarterly, yearly' }, { status: 400 });
    }

    const recurring = await db.recurringInvoice.create({
      data: {
        name,
        partnerId,
        frequency,
        nextDate: new Date(nextDate),
        startDate: new Date(startDate),
        endDate: endDate ? new Date(endDate) : null,
        items: JSON.stringify(items),
        notes: notes || null,
      },
      include: {
        partner: { select: { id: true, name: true } },
        _count: { select: { invoices: true } },
      },
    });

    return NextResponse.json(recurring, { status: 201 });
  } catch (error) {
    console.error('Error creating recurring invoice:', error);
    return NextResponse.json({ error: 'Failed to create recurring invoice' }, { status: 500 });
  }
}
