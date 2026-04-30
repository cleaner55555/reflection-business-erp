import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET /api/delivery-notes?search=...&status=...
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || '';

    const where: Record<string, unknown> = {};

    if (search) {
      where.OR = [
        { number: { contains: search } },
        { partner: { name: { contains: search } } },
        { notes: { contains: search } },
        { invoiceNumber: { contains: search } },
      ];
    }

    if (status) {
      where.status = status;
    }

    const deliveryNotes = await db.deliveryNote.findMany({
      where,
      orderBy: { date: 'desc' },
      include: {
        partner: { select: { id: true, name: true, pib: true } },
        items: true,
      },
    });

    return NextResponse.json(deliveryNotes);
  } catch (error) {
    console.error('Error fetching delivery notes:', error);
    return NextResponse.json({ error: 'Failed to fetch delivery notes' }, { status: 500 });
  }
}

// POST /api/delivery-notes
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const { partnerId, number, date, status, invoiceNumber, notes, items } = body;

    if (!partnerId) {
      return NextResponse.json({ error: 'partnerId is required' }, { status: 400 });
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'At least one delivery note item is required' }, { status: 400 });
    }

    for (const item of items) {
      if (!item.productId || !item.productName || !item.quantity || !item.unitPrice) {
        return NextResponse.json(
          { error: 'Each item must have productId, productName, quantity, and unitPrice' },
          { status: 400 }
        );
      }
    }

    // Auto-generate number if not provided: OT-{year}-{month}-{random}
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    const docNumber = number || `OT-${year}-${month}-${random}`;

    // Check for duplicate number
    const existing = await db.deliveryNote.findUnique({ where: { number: docNumber } });
    if (existing) {
      return NextResponse.json({ error: 'Delivery note with this number already exists' }, { status: 409 });
    }

    const deliveryNote = await db.deliveryNote.create({
      data: {
        partnerId,
        number: docNumber,
        date: date ? new Date(date) : undefined,
        status: status || 'nacrt',
        invoiceNumber,
        notes,
        items: {
          create: items.map((item: Record<string, unknown>) => ({
            productId: item.productId as string,
            productName: item.productName as string,
            quantity: parseFloat(item.quantity as string),
            unitPrice: parseFloat(item.unitPrice as string),
          })),
        },
      },
      include: {
        partner: true,
        items: true,
      },
    });

    return NextResponse.json(deliveryNote, { status: 201 });
  } catch (error) {
    console.error('Error creating delivery note:', error);
    return NextResponse.json({ error: 'Failed to create delivery note' }, { status: 500 });
  }
}
