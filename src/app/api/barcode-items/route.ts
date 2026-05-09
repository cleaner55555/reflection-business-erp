import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || '';
    const category = searchParams.get('category') || '';
    const search = searchParams.get('search') || '';
    const where: Record<string, unknown> = {};
    if (type) where.type = type;
    if (category) where.category = category;
    if (search) where.OR = [
      { code: { contains: search } },
      { productName: { contains: search } },
      { productId: { contains: search } },
    ];
    const items = await db.barcodeItem.findMany({ where, orderBy: { createdAt: 'desc' } });
    return NextResponse.json(items);
  } catch (error) { console.error(error); return NextResponse.json({ error: 'Failed' }, { status: 500 }); }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { code, type, productName, productId, category } = body;
    if (!code || !productName) return NextResponse.json({ error: 'Code and product name required' }, { status: 400 });
    const item = await db.barcodeItem.create({
      data: {
        code,
        type: type || 'EAN13',
        productName,
        productId: productId || '',
        category: category || '',
      },
    });
    return NextResponse.json(item, { status: 201 });
  } catch (error) { console.error(error); return NextResponse.json({ error: 'Failed' }, { status: 500 }); }
}
