import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();
  const period = await db.fiscalPeriod.update({ where: { id }, data: body });
  return NextResponse.json(period);
}
