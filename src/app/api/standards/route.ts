import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || '';
    const category = searchParams.get('category') || '';
    const search = searchParams.get('search') || '';
    const where: Record<string, unknown> = {};
    if (status) where.status = status;
    if (category) where.category = category;
    if (search) where.OR = [{ name: { contains: search } }, { code: { contains: search } }];
    const items = await db.qualityStandard.findMany({ where, orderBy: { code: 'asc' } });
    return NextResponse.json(items);
  } catch (error) { console.error(error); return NextResponse.json({ error: 'Failed' }, { status: 500 }); }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    if (!body.code || !body.name) return NextResponse.json({ error: 'Code and name required' }, { status: 400 });
    const item = await db.qualityStandard.create({
      data: { code: body.code, name: body.name, category: body.category || 'iso', status: body.status || 'active',
        version: body.version || null, issuingBody: body.issuingBody || null, scope: body.scope || null,
        validFrom: body.validFrom ? new Date(body.validFrom) : null, validUntil: body.validUntil ? new Date(body.validUntil) : null,
        auditor: body.auditor || null, lastAudit: body.lastAudit ? new Date(body.lastAudit) : null,
        nextAudit: body.nextAudit ? new Date(body.nextAudit) : null,
        compliance: body.compliance || 0, findings: JSON.stringify(body.findings || []), notes: body.notes || null },
    });
    return NextResponse.json(item, { status: 201 });
  } catch (error) { console.error(error); return NextResponse.json({ error: 'Failed' }, { status: 500 }); }
}
