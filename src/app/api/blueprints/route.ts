import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || '';
    const category = searchParams.get('category') || '';
    const search = searchParams.get('search') || '';
    const where: Record<string, unknown> = {};
    if (status) where.status = status;
    if (category) where.category = category;
    if (search) where.OR = [
      { name: { contains: search } },
      { code: { contains: search } },
      { project: { contains: search } },
      { author: { contains: search } },
    ];
    const items = await db.blueprint.findMany({ where, orderBy: { createdAt: 'desc' } });
    return NextResponse.json(items);
  } catch (error) { console.error(error); return NextResponse.json({ error: 'Failed' }, { status: 500 }); }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, code, project, category, author, client, scale, sheetSize, notes, revisions } = body;
    if (!name || !project || !author) return NextResponse.json({ error: 'Name, project, and author required' }, { status: 400 });
    const item = await db.blueprint.create({
      data: {
        name, code: code || '',
        project: project || '',
        category: category || 'architectural',
        status: 'draft',
        version: 'v1.0',
        author: author || '',
        client: client || '',
        scale: scale || '',
        sheetSize: sheetSize || '',
        fileSize: 0,
        fileFormat: 'PDF',
        approvedBy: null,
        approvedDate: null,
        notes: notes || '',
        revisions: JSON.stringify(revisions || [{ version: 'v1.0', date: new Date().toISOString().split('T')[0], author: author, description: 'Kreiran novi nacrt' }]),
      },
    });
    return NextResponse.json(item, { status: 201 });
  } catch (error) { console.error(error); return NextResponse.json({ error: 'Failed' }, { status: 500 }); }
}
