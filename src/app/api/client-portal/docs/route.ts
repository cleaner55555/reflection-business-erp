import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category') || '';
    const where: Record<string, unknown> = {};
    if (category) where.category = category;
    const items = await db.portalDoc.findMany({ where, orderBy: { date: 'desc' } });
    return NextResponse.json(items);
  } catch (error) { console.error(error); return NextResponse.json({ error: 'Failed' }, { status: 500 }); }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, type, size, date, category } = body;
    if (!name) return NextResponse.json({ error: 'Name required' }, { status: 400 });
    const item = await db.portalDoc.create({
      data: {
        name,
        type: type || 'pdf',
        size: size || '',
        date: date || new Date().toISOString().split('T')[0],
        category: category || '',
      },
    });
    return NextResponse.json(item, { status: 201 });
  } catch (error) { console.error(error); return NextResponse.json({ error: 'Failed' }, { status: 500 }); }
}
