import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

type RouteContext = { params: Promise<{ id: string }> };

export async function PUT(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const body = await request.json();
    const existing = await db.backupSchedule.findUnique({ where: { id } });
    if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    const item = await db.backupSchedule.update({
      where: { id },
      data: {
        name: body.name !== undefined ? body.name : undefined,
        frequency: body.frequency !== undefined ? body.frequency : undefined,
        time: body.time !== undefined ? body.time : undefined,
        type: body.type !== undefined ? body.type : undefined,
        retentionDays: body.retentionDays !== undefined ? parseInt(body.retentionDays) : undefined,
        lastRun: body.lastRun ? new Date(body.lastRun) : (body.lastRun === null ? null : undefined),
        nextRun: body.nextRun ? new Date(body.nextRun) : (body.nextRun === null ? null : undefined),
        active: body.active !== undefined ? Boolean(body.active) : undefined,
      },
    });
    return NextResponse.json(item);
  } catch (error) { console.error(error); return NextResponse.json({ error: 'Failed' }, { status: 500 }); }
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const existing = await db.backupSchedule.findUnique({ where: { id } });
    if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    await db.backupSchedule.delete({ where: { id } });
    return NextResponse.json({ message: 'Deleted' });
  } catch (error) { console.error(error); return NextResponse.json({ error: 'Failed' }, { status: 500 }); }
}
