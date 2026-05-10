import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || '';
    const where: Record<string, unknown> = {};
    if (status) where.status = status;
    if (search) where.OR = [
      { propertyTitle: { contains: search } },
      { clientName: { contains: search } },
      { agent: { contains: search } },
    ];
    const items = await db.propertyViewing.findMany({ where, orderBy: { createdAt: 'desc' } });
    return NextResponse.json(items);
  } catch (error) { console.error(error); return NextResponse.json({ error: 'Failed' }, { status: 500 }); }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { propertyTitle, clientName, phone, agent, date, time, duration, status, clientInterest, feedback, notes } = body;
    if (!propertyTitle || !clientName) return NextResponse.json({ error: 'Property title and client name required' }, { status: 400 });
    const count = await db.propertyViewing.count();
    const viewingNo = `PV-${String(count + 1).padStart(4, '0')}`;
    const item = await db.propertyViewing.create({
      data: {
        viewingNo,
        propertyTitle,
        clientName,
        phone: phone || '',
        agent: agent || '',
        date: date || '',
        time: time || '17:00',
        duration: parseInt(duration) || 30,
        status: status || 'scheduled',
        clientInterest: clientInterest || 'medium',
        feedback: feedback || '',
        notes: notes || '',
      },
    });
    return NextResponse.json(item, { status: 201 });
  } catch (error) { console.error(error); return NextResponse.json({ error: 'Failed' }, { status: 500 }); }
}
