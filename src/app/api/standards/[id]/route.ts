import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
type RouteContext = { params: Promise<{ id: string }> };
export async function PUT(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params; const body = await request.json();
    const existing = await db.qualityStandard.findUnique({ where: { id } });
    if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    const item = await db.qualityStandard.update({ where: { id }, data: {
      code: body.code, name: body.name, category: body.category, status: body.status, version: body.version,
      issuingBody: body.issuingBody, scope: body.scope, compliance: body.compliance,
      validFrom: body.validFrom ? new Date(body.validFrom) : (body.validFrom === null ? null : undefined),
      validUntil: body.validUntil ? new Date(body.validUntil) : (body.validUntil === null ? null : undefined),
      lastAudit: body.lastAudit ? new Date(body.lastAudit) : (body.lastAudit === null ? null : undefined),
      nextAudit: body.nextAudit ? new Date(body.nextAudit) : (body.nextAudit === null ? null : undefined),
      auditor: body.auditor, findings: body.findings !== undefined ? JSON.stringify(body.findings) : undefined, notes: body.notes,
    }});
    return NextResponse.json(item);
  } catch (error) { console.error(error); return NextResponse.json({ error: 'Failed' }, { status: 500 }); }
}
export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const existing = await db.qualityStandard.findUnique({ where: { id } });
    if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    await db.qualityStandard.delete({ where: { id } }); return NextResponse.json({ message: 'Deleted' });
  } catch (error) { console.error(error); return NextResponse.json({ error: 'Failed' }, { status: 500 }); }
}
