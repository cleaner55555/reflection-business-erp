import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const companyId = searchParams.get('companyId') || '';

  const counts = await db.inventoryCount.findMany({
    where: companyId ? { companyId } : undefined,
    include: {
      items: true,
      location: { select: { name: true, code: true } },
      _count: { select: { items: true } },
    },
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json(counts);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { items, ...rest } = body;

  const count = await db.inventoryCount.create({
    data: {
      ...rest,
      items: items ? { create: items } : undefined,
    },
    include: { items: true },
  });

  return NextResponse.json(count, { status: 201 });
}
