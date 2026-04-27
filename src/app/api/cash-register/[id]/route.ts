import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

type RouteContext = { params: Promise<{ id: string }> };

// GET /api/cash-register/[id]
export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const record = await db.cashRegister.findUnique({
      where: { id },
    });

    if (!record) {
      return NextResponse.json({ error: 'Cash register record not found' }, { status: 404 });
    }

    return NextResponse.json(record);
  } catch (error) {
    console.error('Error fetching cash register record:', error);
    return NextResponse.json({ error: 'Failed to fetch cash register record' }, { status: 500 });
  }
}

// PUT /api/cash-register/[id]
export async function PUT(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const body = await request.json();

    const existing = await db.cashRegister.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: 'Cash register record not found' }, { status: 404 });
    }

    const record = await db.cashRegister.update({
      where: { id },
      data: {
        date: body.date ? new Date(body.date) : existing.date,
        type: body.type,
        amount: body.amount ? parseFloat(body.amount) : existing.amount,
        description: body.description,
        partnerName: body.partnerName,
        paymentMethod: body.paymentMethod,
      },
    });

    return NextResponse.json(record);
  } catch (error) {
    console.error('Error updating cash register record:', error);
    return NextResponse.json({ error: 'Failed to update cash register record' }, { status: 500 });
  }
}

// DELETE /api/cash-register/[id]
export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;

    const existing = await db.cashRegister.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: 'Cash register record not found' }, { status: 404 });
    }

    await db.cashRegister.delete({ where: { id } });

    return NextResponse.json({ message: 'Cash register record deleted successfully' });
  } catch (error) {
    console.error('Error deleting cash register record:', error);
    return NextResponse.json({ error: 'Failed to delete cash register record' }, { status: 500 });
  }
}
