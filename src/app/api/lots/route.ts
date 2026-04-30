import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const companyId = searchParams.get('companyId') || '';
  const productId = searchParams.get('productId') || '';
  const locationId = searchParams.get('locationId') || '';

  const where: Record<string, unknown> = {};
  if (companyId) where.companyId = companyId;
  if (productId) where.productId = productId;
  if (locationId) where.locationId = locationId;

  const lots = await db.lot.findMany({
    where,
    include: { product: { select: { name: true, sku: true } }, location: { select: { name: true, code: true } } },
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json(lots);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const lot = await db.lot.create({ data: body });
  return NextResponse.json(lot, { status: 201 });
}
