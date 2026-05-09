import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get('companyId') || '';
    const search = searchParams.get('search') || '';
    const category = searchParams.get('category') || '';
    const lifecycleStage = searchParams.get('lifecycleStage') || '';
    const status = searchParams.get('status') || '';

    const where: Record<string, unknown> = {};
    if (companyId) where.companyId = companyId;
    if (category) where.category = category;
    if (lifecycleStage) where.lifecycleStage = lifecycleStage;
    if (status) where.status = status;
    if (search) where.OR = [
      { name: { contains: search } },
      { sku: { contains: search } },
    ];

    const items = await db.plmProduct.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(items);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to fetch PLM products' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { companyId, name, sku, category, lifecycleStage, status, version, owner, description } = body;

    if (!companyId || !name || !sku) {
      return NextResponse.json({ error: 'companyId, name, sku are required' }, { status: 400 });
    }

    const item = await db.plmProduct.create({
      data: {
        companyId,
        name,
        sku,
        category: category || 'Elektronika',
        lifecycleStage: lifecycleStage || 'concept',
        status: status || 'development',
        version: version || '0.1.0',
        owner: owner || '',
        description: description || '',
        bomRef: '',
        revisionCount: 0,
        revisions: '[]',
        documents: '[]',
        ecrs: '[]',
        ecos: '[]',
      },
    });
    return NextResponse.json(item, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to create PLM product' }, { status: 500 });
  }
}
