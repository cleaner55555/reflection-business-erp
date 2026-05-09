import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

type RouteContext = { params: Promise<{ id: string }> };

export async function PUT(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const body = await request.json();
    const existing = await db.plmProduct.findUnique({ where: { id } });
    if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    const data: Record<string, unknown> = {};
    if (body.name !== undefined) data.name = body.name;
    if (body.sku !== undefined) data.sku = body.sku;
    if (body.category !== undefined) data.category = body.category;
    if (body.lifecycleStage !== undefined) data.lifecycleStage = body.lifecycleStage;
    if (body.status !== undefined) data.status = body.status;
    if (body.version !== undefined) data.version = body.version;
    if (body.owner !== undefined) data.owner = body.owner;
    if (body.description !== undefined) data.description = body.description;
    if (body.bomRef !== undefined) data.bomRef = body.bomRef;
    if (body.revisionCount !== undefined) data.revisionCount = parseInt(body.revisionCount) || 0;
    if (body.revisions !== undefined) data.revisions = typeof body.revisions === 'string' ? body.revisions : JSON.stringify(body.revisions);
    if (body.documents !== undefined) data.documents = typeof body.documents === 'string' ? body.documents : JSON.stringify(body.documents);
    if (body.ecrs !== undefined) data.ecrs = typeof body.ecrs === 'string' ? body.ecrs : JSON.stringify(body.ecrs);
    if (body.ecos !== undefined) data.ecos = typeof body.ecos === 'string' ? body.ecos : JSON.stringify(body.ecos);

    const item = await db.plmProduct.update({
      where: { id },
      data,
    });
    return NextResponse.json(item);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to update PLM product' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const existing = await db.plmProduct.findUnique({ where: { id } });
    if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    await db.plmProduct.delete({ where: { id } });
    return NextResponse.json({ message: 'Deleted' });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to delete PLM product' }, { status: 500 });
  }
}
