import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET /api/purchase-orders?search=...&status=...&partnerId=...
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || '';
    const partnerId = searchParams.get('partnerId') || '';

    const where: Record<string, unknown> = {};

    if (search) {
      where.OR = [
        { number: { contains: search } },
        { partner: { name: { contains: search } } },
        { notes: { contains: search } },
      ];
    }

    if (status) {
      where.status = status;
    }

    if (partnerId) {
      where.partnerId = partnerId;
    }

    const orders = await db.purchaseOrder.findMany({
      where,
      orderBy: { date: 'desc' },
      include: {
        partner: { select: { id: true, name: true, pib: true } },
        items: true,
      },
    });

    return NextResponse.json(orders);
  } catch (error) {
    console.error('Error fetching purchase orders:', error);
    return NextResponse.json({ error: 'Failed to fetch purchase orders' }, { status: 500 });
  }
}

// POST /api/purchase-orders
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const { partnerId, number, date, status, notes, items } = body;

    if (!partnerId || !number) {
      return NextResponse.json({ error: 'partnerId and number are required' }, { status: 400 });
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'At least one order item is required' }, { status: 400 });
    }

    for (const item of items) {
      if (!item.productId || !item.productName || !item.quantity || !item.unitPrice) {
        return NextResponse.json(
          { error: 'Each item must have productId, productName, quantity, and unitPrice' },
          { status: 400 }
        );
      }
    }

    // Check for duplicate order number
    const existingOrder = await db.purchaseOrder.findUnique({ where: { number } });
    if (existingOrder) {
      return NextResponse.json({ error: 'Purchase order with this number already exists' }, { status: 409 });
    }

    // Calculate total
    const totalAmount = items.reduce((sum: number, item: Record<string, number>) => {
      return sum + item.quantity * item.unitPrice;
    }, 0);

    const order = await db.purchaseOrder.create({
      data: {
        partnerId,
        number,
        date: date ? new Date(date) : undefined,
        status: status || 'nacrt',
        totalAmount,
        notes,
        items: {
          create: items.map((item: Record<string, unknown>) => ({
            productId: item.productId as string,
            productName: item.productName as string,
            quantity: parseFloat(item.quantity as string),
            unitPrice: parseFloat(item.unitPrice as string),
            total: parseFloat(item.quantity as string) * parseFloat(item.unitPrice as string),
          })),
        },
      },
      include: {
        partner: true,
        items: true,
      },
    });

    return NextResponse.json(order, { status: 201 });
  } catch (error) {
    console.error('Error creating purchase order:', error);
    return NextResponse.json({ error: 'Failed to create purchase order' }, { status: 500 });
  }
}
