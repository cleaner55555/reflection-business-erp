import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const companyId = searchParams.get('companyId') || '';
  const year = searchParams.get('year');

  const where: Record<string, unknown> = {};
  if (companyId) where.companyId = companyId;
  if (year) where.year = parseInt(year);

  const periods = await db.fiscalPeriod.findMany({
    where,
    orderBy: [{ year: 'desc' }, { month: 'desc' }],
  });

  return NextResponse.json(periods);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const period = await db.fiscalPeriod.create({ data: body });
  return NextResponse.json(period, { status: 201 });
}
