import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET /api/resto-tables?status=...&location=...
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || '';
    const location = searchParams.get('location') || '';

    const where: Record<string, unknown> = {};

    if (status) {
      where.status = status;
    }

    if (location) {
      where.location = location;
    }

    const tables = await db.restoTable.findMany({
      where,
      orderBy: { number: 'asc' },
    });

    // Count active orders per table
    const activeOrders = await db.restoOrder.groupBy({
      by: ['tableId'],
      where: {
        status: { in: ['u_toku', 'spremno'] },
        tableId: { not: null },
      },
      _count: { id: true },
    });

    const activeOrderMap = new Map(
      activeOrders.map((o) => [o.tableId, o._count.id])
    );

    const result = tables.map((table) => ({
      ...table,
      activeOrderCount: activeOrderMap.get(table.id) || 0,
    }));

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error fetching tables:', error);
    return NextResponse.json({ error: 'Failed to fetch tables' }, { status: 500 });
  }
}

// POST /api/resto-tables
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { number, name, capacity, status, location } = body;

    if (number === undefined || number === null) {
      return NextResponse.json({ error: 'Table number is required' }, { status: 400 });
    }

    const existing = await db.restoTable.findUnique({
      where: { number: parseInt(number) },
    });
    if (existing) {
      return NextResponse.json({ error: 'Table with this number already exists' }, { status: 409 });
    }

    const table = await db.restoTable.create({
      data: {
        number: parseInt(number),
        name,
        capacity: parseInt(capacity) || 4,
        status: status || 'slobodan',
        location,
      },
    });

    return NextResponse.json(table, { status: 201 });
  } catch (error) {
    console.error('Error creating table:', error);
    return NextResponse.json({ error: 'Failed to create table' }, { status: 500 });
  }
}
