import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const companyId = searchParams.get('companyId') || '';

  const rules = await db.crmAutomationRule.findMany({
    where: companyId ? { companyId } : undefined,
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json(rules);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const rule = await db.crmAutomationRule.create({ data: body });
  return NextResponse.json(rule, { status: 201 });
}
