import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const companyId = searchParams.get('companyId') || '';
  const employeeId = searchParams.get('employeeId') || '';

  const where: Record<string, unknown> = {};
  if (companyId) where.companyId = companyId;
  if (employeeId) where.employeeId = employeeId;

  const evals = await db.employeeEvaluation.findMany({
    where,
    include: { employee: { select: { firstName: true, lastName: true, position: true, department: true } } },
    orderBy: [{ year: 'desc' }, { createdAt: 'desc' }],
  });

  return NextResponse.json(evals);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const evaluation = await db.employeeEvaluation.create({ data: body });
  return NextResponse.json(evaluation, { status: 201 });
}
