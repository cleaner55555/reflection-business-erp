import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

type RouteContext = { params: Promise<{ id: string }> };

export async function PUT(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const body = await request.json();
    const existing = await db.blueprint.findUnique({ where: { id } });
    if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    const item = await db.blueprint.update({
      where: { id },
      data: {
        name: body.name !== undefined ? body.name : undefined,
        code: body.code !== undefined ? body.code : undefined,
        project: body.project !== undefined ? body.project : undefined,
        category: body.category !== undefined ? body.category : undefined,
        author: body.author !== undefined ? body.author : undefined,
        client: body.client !== undefined ? body.client : undefined,
        scale: body.scale !== undefined ? body.scale : undefined,
        sheetSize: body.sheetSize !== undefined ? body.sheetSize : undefined,
        notes: body.notes !== undefined ? body.notes : undefined,
        approvedBy: body.approvedBy !== undefined ? body.approvedBy : undefined,
        approvedDate: body.approvedDate !== undefined ? body.approvedDate : undefined,
        fileSize: body.fileSize !== undefined ? parseFloat(body.fileSize) : undefined,
        fileFormat: body.fileFormat !== undefined ? body.fileFormat : undefined,
        version: body.version !== undefined ? body.version : undefined,
        status: body.status !== undefined ? body.status : undefined,
        revisions: body.revisions !== undefined ? JSON.stringify(body.revisions) : undefined,
      },
    });
    return NextResponse.json(item);
  } catch (error) { console.error(error); return NextResponse.json({ error: 'Failed' }, { status: 500 }); }
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const existing = await db.blueprint.findUnique({ where: { id } });
    if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    await db.blueprint.delete({ where: { id } });
    return NextResponse.json({ message: 'Deleted' });
  } catch (error) { console.error(error); return NextResponse.json({ error: 'Failed' }, { status: 500 }); }
}
