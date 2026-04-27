import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

type RouteContext = { params: Promise<{ id: string }> };

// PUT /api/resto-tables/[id]
export async function PUT(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const body = await request.json();

    const existing = await db.restoTable.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: 'Table not found' }, { status: 404 });
    }

    // Check table number uniqueness if changed
    if (body.number !== undefined && parseInt(body.number) !== existing.number) {
      const numExists = await db.restoTable.findUnique({
        where: { number: parseInt(body.number) },
      });
      if (numExists) {
        return NextResponse.json({ error: 'Table with this number already exists' }, { status: 409 });
      }
    }

    const table = await db.restoTable.update({
      where: { id },
      data: {
        number: body.number !== undefined ? parseInt(body.number) : undefined,
        name: body.name,
        capacity: body.capacity !== undefined ? parseInt(body.capacity) : undefined,
        status: body.status,
        location: body.location,
      },
    });

    return NextResponse.json(table);
  } catch (error) {
    console.error('Error updating table:', error);
    return NextResponse.json({ error: 'Failed to update table' }, { status: 500 });
  }
}

// DELETE /api/resto-tables/[id]
export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;

    const existing = await db.restoTable.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: 'Table not found' }, { status: 404 });
    }

    await db.restoTable.delete({ where: { id } });

    return NextResponse.json({ message: 'Table deleted successfully' });
  } catch (error) {
    console.error('Error deleting table:', error);
    return NextResponse.json({ error: 'Failed to delete table' }, { status: 500 });
  }
}
