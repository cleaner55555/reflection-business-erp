import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || '';
    const type = searchParams.get('type') || '';
    const search = searchParams.get('search') || '';
    const dayOfWeek = searchParams.get('dayOfWeek') || '';
    const classGroup = searchParams.get('classGroup') || '';
    const where: Record<string, unknown> = {};
    if (status) where.status = status;
    if (type) where.type = type;
    if (dayOfWeek) where.dayOfWeek = dayOfWeek;
    if (classGroup) where.classGroup = { startsWith: classGroup };
    if (search) where.OR = [
      { subject: { contains: search } },
      { teacher: { contains: search } },
      { room: { contains: search } },
    ];
    const items = await db.timetableEntry.findMany({ where, orderBy: [{ dayOfWeek: 'asc' }, { timeStart: 'asc' }] });
    return NextResponse.json(items);
  } catch (error) { console.error(error); return NextResponse.json({ error: 'Failed' }, { status: 500 }); }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { subject, teacher, classGroup, room, dayOfWeek, timeStart, timeEnd, type, semester, status, notes } = body;
    if (!subject || !teacher) return NextResponse.json({ error: 'Subject and teacher required' }, { status: 400 });
    const item = await db.timetableEntry.create({
      data: {
        subject, teacher,
        classGroup: classGroup || '',
        room: room || '',
        dayOfWeek: dayOfWeek || 'ponedeljak',
        timeStart: timeStart || '08:00',
        timeEnd: timeEnd || '09:30',
        type: type || 'lecture',
        semester: semester || '2023/2024 zimski',
        status: status || 'active',
        notes: notes || '',
      },
    });
    return NextResponse.json(item, { status: 201 });
  } catch (error) { console.error(error); return NextResponse.json({ error: 'Failed' }, { status: 500 }); }
}
