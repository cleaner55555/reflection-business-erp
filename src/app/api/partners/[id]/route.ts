import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

type RouteContext = { params: Promise<{ id: string }> };

// GET /api/partners/[id]
export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const partner = await db.partner.findUnique({
      where: { id },
      include: {
        invoices: { orderBy: { date: 'desc' }, take: 20 },
        purchaseOrders: { orderBy: { date: 'desc' }, take: 20 },
      },
    });

    if (!partner) {
      return NextResponse.json({ error: 'Partner not found' }, { status: 404 });
    }

    return NextResponse.json(partner);
  } catch (error) {
    console.error('Error fetching partner:', error);
    return NextResponse.json({ error: 'Failed to fetch partner' }, { status: 500 });
  }
}

// PUT /api/partners/[id]
export async function PUT(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const body = await request.json();

    const existing = await db.partner.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: 'Partner not found' }, { status: 404 });
    }

    // Check PIB uniqueness if changed
    if (body.pib && body.pib !== existing.pib) {
      const pibExists = await db.partner.findUnique({ where: { pib: body.pib } });
      if (pibExists) {
        return NextResponse.json({ error: 'Partner with this PIB already exists' }, { status: 409 });
      }
    }

    const partner = await db.partner.update({
      where: { id },
      data: {
        name: body.name,
        pib: body.pib,
        maticniBr: body.maticniBr,
        address: body.address,
        city: body.city,
        zipCode: body.zipCode,
        phone: body.phone,
        email: body.email,
        type: body.type,
        account: body.account,
        bank: body.bank,
        notes: body.notes,
      },
    });

    return NextResponse.json(partner);
  } catch (error) {
    console.error('Error updating partner:', error);
    return NextResponse.json({ error: 'Failed to update partner' }, { status: 500 });
  }
}

// DELETE /api/partners/[id]
export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;

    const existing = await db.partner.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: 'Partner not found' }, { status: 404 });
    }

    await db.partner.delete({ where: { id } });

    return NextResponse.json({ message: 'Partner deleted successfully' });
  } catch (error) {
    console.error('Error deleting partner:', error);
    return NextResponse.json({ error: 'Failed to delete partner' }, { status: 500 });
  }
}
