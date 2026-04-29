import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();
  const evaluation = await db.employeeEvaluation.update({ where: { id }, data: body });
  return NextResponse.json(evaluation);
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await db.employeeEvaluation.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
