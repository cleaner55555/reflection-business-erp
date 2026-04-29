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
        _count: {
          select: { invoices: true, purchaseOrders: true, contacts: true, projects: true, children: true, deals: true },
        },
        contacts: {
          where: { isActive: true },
          select: { id: true, firstName: true, lastName: true, email: true, phone: true, position: true, isClient: true, isSupplier: true },
          take: 20,
        },
        invoices: { orderBy: { date: 'desc' }, take: 10, select: { id: true, number: true, date: true, status: true, type: true, totalAmount: true } },
        purchaseOrders: { orderBy: { date: 'desc' }, take: 10, select: { id: true, number: true, date: true, status: true, totalAmount: true } },
        children: { select: { id: true, name: true, type: true, city: true } },
        parent: { select: { id: true, name: true, type: true } },
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
      const pibExists = await db.partner.findFirst({ where: { pib: body.pib } });
      if (pibExists) {
        return NextResponse.json({ error: 'Partner with this PIB already exists' }, { status: 409 });
      }
    }

    // Parse tags
    let parsedTags: string | null | undefined = undefined;
    if (body.tags !== undefined) {
      if (body.tags === null || body.tags === '') {
        parsedTags = null;
      } else if (typeof body.tags === 'string') {
        try {
          JSON.parse(body.tags);
          parsedTags = body.tags;
        } catch {
          parsedTags = JSON.stringify(body.tags.split(',').map((t: string) => t.trim()).filter(Boolean));
        }
      } else if (Array.isArray(body.tags)) {
        parsedTags = JSON.stringify(body.tags);
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
        creditLimit: body.creditLimit !== undefined ? Number(body.creditLimit) : undefined,
        paymentTerms: body.paymentTerms !== undefined ? Number(body.paymentTerms) : undefined,
        parentId: body.parentId,
        tags: parsedTags,
        isActive: body.isActive !== undefined ? body.isActive : undefined,
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

    const existing = await db.partner.findUnique({
      where: { id },
      include: { _count: { select: { invoices: true, purchaseOrders: true } } },
    });
    if (!existing) {
      return NextResponse.json({ error: 'Partner not found' }, { status: 404 });
    }

    // Prevent deletion if partner has invoices or purchase orders
    if (existing._count.invoices > 0 || existing._count.purchaseOrders > 0) {
      return NextResponse.json(
        { error: `Cannot delete partner with existing invoices (${existing._count.invoices}) or purchase orders (${existing._count.purchaseOrders})` },
        { status: 409 }
      );
    }

    await db.partner.delete({ where: { id } });

    return NextResponse.json({ message: 'Partner deleted successfully' });
  } catch (error) {
    console.error('Error deleting partner:', error);
    return NextResponse.json({ error: 'Failed to delete partner' }, { status: 500 });
  }
}
