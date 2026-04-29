import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

type RouteContext = { params: Promise<{ id: string }> };

// GET /api/recurring-invoices/[id]
export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const recurring = await db.recurringInvoice.findUnique({
      where: { id },
      include: {
        partner: true,
        invoices: { orderBy: { date: 'desc' }, take: 10 },
      },
    });

    if (!recurring) {
      return NextResponse.json({ error: 'Recurring invoice not found' }, { status: 404 });
    }

    return NextResponse.json(recurring);
  } catch (error) {
    console.error('Error fetching recurring invoice:', error);
    return NextResponse.json({ error: 'Failed to fetch recurring invoice' }, { status: 500 });
  }
}

// PUT /api/recurring-invoices/[id] — Update template
export async function PUT(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const body = await request.json();

    const existing = await db.recurringInvoice.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: 'Recurring invoice not found' }, { status: 404 });
    }

    const validFrequencies = ['weekly', 'monthly', 'quarterly', 'yearly'];
    if (body.frequency && !validFrequencies.includes(body.frequency)) {
      return NextResponse.json({ error: 'Invalid frequency. Use: weekly, monthly, quarterly, yearly' }, { status: 400 });
    }

    const updateData: Record<string, unknown> = {};
    if (body.name !== undefined) updateData.name = body.name;
    if (body.partnerId !== undefined) updateData.partnerId = body.partnerId;
    if (body.frequency !== undefined) updateData.frequency = body.frequency;
    if (body.nextDate !== undefined) updateData.nextDate = new Date(body.nextDate);
    if (body.startDate !== undefined) updateData.startDate = new Date(body.startDate);
    if (body.endDate !== undefined) updateData.endDate = body.endDate ? new Date(body.endDate) : null;
    if (body.isActive !== undefined) updateData.isActive = body.isActive;
    if (body.items !== undefined) updateData.items = JSON.stringify(body.items);
    if (body.notes !== undefined) updateData.notes = body.notes;

    const recurring = await db.recurringInvoice.update({
      where: { id },
      data: updateData,
      include: {
        partner: { select: { id: true, name: true } },
        _count: { select: { invoices: true } },
      },
    });

    return NextResponse.json(recurring);
  } catch (error) {
    console.error('Error updating recurring invoice:', error);
    return NextResponse.json({ error: 'Failed to update recurring invoice' }, { status: 500 });
  }
}

// DELETE /api/recurring-invoices/[id] — Soft delete by setting isActive=false
export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;

    const existing = await db.recurringInvoice.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: 'Recurring invoice not found' }, { status: 404 });
    }

    const recurring = await db.recurringInvoice.update({
      where: { id },
      data: { isActive: false },
    });

    return NextResponse.json(recurring);
  } catch (error) {
    console.error('Error deleting recurring invoice:', error);
    return NextResponse.json({ error: 'Failed to delete recurring invoice' }, { status: 500 });
  }
}
