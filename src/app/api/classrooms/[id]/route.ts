import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

type RouteContext = { params: Promise<{ id: string }> };

export async function PUT(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const body = await request.json();
    const existing = await db.classroom.findUnique({ where: { id } });
    if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    const item = await db.classroom.update({
      where: { id },
      data: {
        name: body.name, building: body.building, floor: body.floor, capacity: body.capacity !== undefined ? parseInt(body.capacity) : undefined,
        currentOccupancy: body.currentOccupancy !== undefined ? parseInt(body.currentOccupancy) : undefined,
        type: body.type, status: body.status, equipment: body.equipment !== undefined ? JSON.stringify(body.equipment) : undefined,
        responsible: body.responsible !== undefined ? body.responsible : undefined, area: body.area !== undefined ? parseInt(body.area) : undefined,
        hasProjector: body.hasProjector !== undefined ? Boolean(body.hasProjector) : undefined,
        hasAC: body.hasAC !== undefined ? Boolean(body.hasAC) : undefined,
        hasWhiteboard: body.hasWhiteboard !== undefined ? Boolean(body.hasWhiteboard) : undefined,
        lastInspection: body.lastInspection ? new Date(body.lastInspection) : (body.lastInspection === null ? null : undefined),
        notes: body.notes !== undefined ? body.notes : undefined,
      },
    });
    return NextResponse.json(item);
  } catch (error) { console.error(error); return NextResponse.json({ error: 'Failed' }, { status: 500 }); }
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const existing = await db.classroom.findUnique({ where: { id } });
    if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    await db.classroom.delete({ where: { id } });
    return NextResponse.json({ message: 'Deleted' });
  } catch (error) { console.error(error); return NextResponse.json({ error: 'Failed' }, { status: 500 }); }
}
