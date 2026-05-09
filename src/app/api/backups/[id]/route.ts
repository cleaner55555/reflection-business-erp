import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

type RouteContext = { params: Promise<{ id: string }> };

export async function PUT(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const body = await request.json();
    const existing = await db.backupRecord.findUnique({ where: { id } });
    if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    const item = await db.backupRecord.update({
      where: { id },
      data: {
        name: body.name !== undefined ? body.name : undefined,
        type: body.type !== undefined ? body.type : undefined,
        status: body.status !== undefined ? body.status : undefined,
        size: body.size !== undefined ? body.size : undefined,
        duration: body.duration !== undefined ? body.duration : undefined,
        location: body.location !== undefined ? body.location : undefined,
        expiresAt: body.expiresAt ? new Date(body.expiresAt) : (body.expiresAt === null ? null : undefined),
        autoDelete: body.autoDelete !== undefined ? Boolean(body.autoDelete) : undefined,
        encrypted: body.encrypted !== undefined ? Boolean(body.encrypted) : undefined,
      },
    });
    return NextResponse.json(item);
  } catch (error) { console.error(error); return NextResponse.json({ error: 'Failed' }, { status: 500 }); }
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const existing = await db.backupRecord.findUnique({ where: { id } });
    if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    await db.backupRecord.delete({ where: { id } });
    return NextResponse.json({ message: 'Deleted' });
  } catch (error) { console.error(error); return NextResponse.json({ error: 'Failed' }, { status: 500 }); }
}
