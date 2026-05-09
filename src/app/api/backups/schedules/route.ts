import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const items = await db.backupSchedule.findMany({ orderBy: { createdAt: 'asc' } });
    return NextResponse.json(items);
  } catch (error) { console.error(error); return NextResponse.json({ error: 'Failed' }, { status: 500 }); }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, frequency, time, type, retentionDays, lastRun, nextRun, active } = body;
    if (!name) return NextResponse.json({ error: 'Name required' }, { status: 400 });
    const item = await db.backupSchedule.create({
      data: {
        name,
        frequency: frequency || 'daily',
        time: time || '02:00',
        type: type || 'full',
        retentionDays: parseInt(retentionDays) || 30,
        lastRun: lastRun ? new Date(lastRun) : null,
        nextRun: nextRun ? new Date(nextRun) : null,
        active: active !== undefined ? Boolean(active) : true,
      },
    });
    return NextResponse.json(item, { status: 201 });
  } catch (error) { console.error(error); return NextResponse.json({ error: 'Failed' }, { status: 500 }); }
}
