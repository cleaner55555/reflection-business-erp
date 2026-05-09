import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || '';
    const type = searchParams.get('type') || '';
    const search = searchParams.get('search') || '';
    const where: Record<string, unknown> = {};
    if (status) where.status = status;
    if (type) where.type = type;
    if (search) where.OR = [{ name: { contains: search } }, { building: { contains: search } }, { responsible: { contains: search } }];
    const items = await db.classroom.findMany({ where, orderBy: { name: 'asc' } });
    return NextResponse.json(items);
  } catch (error) { console.error(error); return NextResponse.json({ error: 'Failed' }, { status: 500 }); }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, building, floor, capacity, currentOccupancy, type, status, equipment, responsible, area, hasProjector, hasAC, hasWhiteboard, lastInspection, notes } = body;
    if (!name || !building) return NextResponse.json({ error: 'Name and building required' }, { status: 400 });
    const item = await db.classroom.create({
      data: {
        name, building, floor: floor || '1', capacity: parseInt(capacity) || 30, currentOccupancy: parseInt(currentOccupancy) || 0,
        type: type || 'lecture', status: status || 'available',
        equipment: JSON.stringify(equipment || []),
        responsible: responsible || null, area: parseInt(area) || 0,
        hasProjector: Boolean(hasProjector), hasAC: Boolean(hasAC), hasWhiteboard: hasWhiteboard !== undefined ? Boolean(hasWhiteboard) : true,
        lastInspection: lastInspection ? new Date(lastInspection) : null, notes: notes || null,
      },
    });
    return NextResponse.json(item, { status: 201 });
  } catch (error) { console.error(error); return NextResponse.json({ error: 'Failed' }, { status: 500 }); }
}
