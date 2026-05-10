import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const category = searchParams.get('category') || '';
    const where: Record<string, unknown> = {};
    if (category) where.category = category;
    if (search) where.OR = [
      { name: { contains: search } },
      { sku: { contains: search } },
      { category: { contains: search } },
    ];
    const items = await db.label.findMany({ where, orderBy: { createdAt: 'desc' } });
    return NextResponse.json(items);
  } catch (error) { console.error(error); return NextResponse.json({ error: 'Failed' }, { status: 500 }); }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, sku, category, status, size, material, color, quantity, costPerUnit, printDate, notes } = body;
    if (!name) return NextResponse.json({ error: 'Name required' }, { status: 400 });
    const count = await db.label.count();
    const labelNo = `LBL-${String(count + 1).padStart(4, '0')}`;
    const item = await db.label.create({
      data: {
        labelNo, name, sku: sku || '', category: category || 'product', status: status || 'active',
        size: size || '', material: material || '', color: color || '',
        quantity: parseInt(quantity) || 0, costPerUnit: parseFloat(costPerUnit) || 0,
        printDate: printDate || '', notes: notes || '',
      },
    });
    return NextResponse.json(item, { status: 201 });
  } catch (error) { console.error(error); return NextResponse.json({ error: 'Failed' }, { status: 500 }); }
}
