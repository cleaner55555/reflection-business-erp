import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();
  const lot = await db.lot.update({ where: { id }, data: body });
  return NextResponse.json(lot);
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await db.lot.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
