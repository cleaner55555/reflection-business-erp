import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET /api/orders?status=...&type=...&search=...
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || '';
    const type = searchParams.get('type') || '';
    const search = searchParams.get('search') || '';

    const where: Record<string, unknown> = {};

    if (status) where.status = status;
    if (type) where.type = type;
    if (search) {
      where.OR = [
        { orderNo: { contains: search } },
        { client: { contains: search } },
        { warehouse: { contains: search } },
        { supplier: { contains: search } },
      ];
    }

    const orders = await db.bizOrder.findMany({
      where,
      orderBy: { date: 'desc' },
    });

    return NextResponse.json(orders);
  } catch (error) {
    console.error('Error fetching orders:', error);
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 });
  }
}

// POST /api/orders
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { orderNo, client, date, deliveryDate, type, status, items, totalAmount, warehouse, supplier, priority, notes } = body;

    if (!client) {
      return NextResponse.json({ error: 'Client is required' }, { status: 400 });
    }

    // Auto-generate order number if not provided
    if (!orderNo) {
      const year = new Date().getFullYear();
      const count = await db.bizOrder.count();
      body.orderNo = `NAR-${year}-${String(count + 1).padStart(3, '0')}`;
    }

    const order = await db.bizOrder.create({
      data: {
        orderNo: body.orderNo || orderNo,
        client,
        date: date ? new Date(date) : new Date(),
        deliveryDate: deliveryDate ? new Date(deliveryDate) : null,
        type: type || 'sale',
        status: status || 'pending',
        items: parseInt(items) || 1,
        totalAmount: parseFloat(totalAmount) || 0,
        warehouse: warehouse || null,
        supplier: supplier || null,
        priority: priority || 'medium',
        notes: notes || null,
      },
    });

    return NextResponse.json(order, { status: 201 });
  } catch (error) {
    console.error('Error creating order:', error);
    return NextResponse.json({ error: 'Failed to create order' }, { status: 500 });
  }
}
