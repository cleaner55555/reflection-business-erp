import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { Prisma } from '@prisma/client';

// GET /api/resto-orders?status=...&type=...&date=...&tableId=...&all=true
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || '';
    const type = searchParams.get('type') || '';
    const date = searchParams.get('date') || '';
    const tableId = searchParams.get('tableId') || '';
    const showAll = searchParams.get('all') === 'true';

    const where: Prisma.RestoOrderWhereInput = {};

    if (status) {
      where.status = status;
    }

    if (type) {
      where.type = type;
    }

    if (tableId) {
      where.tableId = tableId;
    }

    // Default to today's orders unless all=true or a specific date is given
    if (!showAll && !date) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      where.createdAt = { gte: today, lt: tomorrow };
    } else if (date) {
      const target = new Date(date);
      target.setHours(0, 0, 0, 0);
      const nextDay = new Date(target);
      nextDay.setDate(nextDay.getDate() + 1);
      where.createdAt = { gte: target, lt: nextDay };
    }

    const orders = await db.restoOrder.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        table: { select: { id: true, number: true, name: true, location: true } },
        items: { orderBy: { id: 'asc' } },
      },
    });

    return NextResponse.json(orders);
  } catch (error) {
    console.error('Error fetching orders:', error instanceof Error ? error.message : error);
    return NextResponse.json({ error: 'Failed to fetch orders', detail: String(error) }, { status: 500 });
  }
}

// POST /api/resto-orders
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { tableId, status, type, discountPct, waiter, notes, items } = body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'At least one order item is required' }, { status: 400 });
    }

    for (const item of items) {
      if (!item.menuItemId || !item.menuItemName || !item.quantity || item.unitPrice === undefined) {
        return NextResponse.json(
          { error: 'Each item must have menuItemId, menuItemName, quantity, and unitPrice' },
          { status: 400 }
        );
      }
    }

    // Generate next order number
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todayOrders = await db.restoOrder.findMany({
      where: { createdAt: { gte: today, lt: tomorrow } },
      select: { orderNumber: true },
    });

    const maxOrderNum = todayOrders.length > 0
      ? Math.max(...todayOrders.map((o) => o.orderNumber))
      : 0;
    const orderNumber = maxOrderNum + 1;

    // Calculate total amount from items
    const totalAmount = items.reduce((sum: number, item: Record<string, number>) => {
      const itemTotal = item.quantity * item.unitPrice;
      return sum + itemTotal;
    }, 0);

    const discount = parseFloat(discountPct) || 0;
    const finalTotal = totalAmount * (1 - discount / 100);

    const order = await db.restoOrder.create({
      data: {
        orderNumber,
        tableId: tableId || null,
        status: status || 'u_toku',
        type: type || 'restoran',
        totalAmount: finalTotal,
        discountPct: discount,
        waiter,
        notes,
        items: {
          create: items.map((item: Record<string, unknown>) => ({
            menuItemId: item.menuItemId as string,
            menuItemName: item.menuItemName as string,
            quantity: parseInt(item.quantity as string),
            unitPrice: parseFloat(item.unitPrice as string),
            total: parseInt(item.quantity as string) * parseFloat(item.unitPrice as string),
            notes: (item.notes as string) || null,
            status: (item.status as string) || 'naručeno',
          })),
        },
      },
      include: {
        table: true,
        items: true,
      },
    });

    return NextResponse.json(order, { status: 201 });
  } catch (error) {
    console.error('Error creating order:', error);
    return NextResponse.json({ error: 'Failed to create order' }, { status: 500 });
  }
}
