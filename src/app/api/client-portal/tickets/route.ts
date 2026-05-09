import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || '';
    const where: Record<string, unknown> = {};
    if (status) where.status = status;
    const items = await db.portalTicket.findMany({ where, orderBy: { createdAt: 'desc' } });
    return NextResponse.json(items);
  } catch (error) { console.error(error); return NextResponse.json({ error: 'Failed' }, { status: 500 }); }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { subject, status, priority } = body;
    if (!subject) return NextResponse.json({ error: 'Subject required' }, { status: 400 });
    const item = await db.portalTicket.create({
      data: {
        subject,
        status: status || 'open',
        priority: priority || 'medium',
      },
    });
    return NextResponse.json(item, { status: 201 });
  } catch (error) { console.error(error); return NextResponse.json({ error: 'Failed' }, { status: 500 }); }
}
