import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
type RouteContext = { params: Promise<{ id: string }> };
export async function PUT(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params; const body = await request.json();
    const existing = await db.measurement.findUnique({ where: { id } });
    if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    const item = await db.measurement.update({ where: { id }, data: {
      code: body.code, product: body.product, parameter: body.parameter, nominalValue: body.nominalValue,
      unit: body.unit, measuredValue: body.measuredValue, tolerance: body.tolerance, deviation: body.deviation,
      status: body.status, instrument: body.instrument, operator: body.operator, station: body.station,
      batch: body.batch, date: body.date ? new Date(body.date) : undefined, notes: body.notes,
    }});
    return NextResponse.json(item);
  } catch (error) { console.error(error); return NextResponse.json({ error: 'Failed' }, { status: 500 }); }
}
export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const existing = await db.measurement.findUnique({ where: { id } });
    if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    await db.measurement.delete({ where: { id } }); return NextResponse.json({ message: 'Deleted' });
  } catch (error) { console.error(error); return NextResponse.json({ error: 'Failed' }, { status: 500 }); }
}
