import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

type RouteContext = { params: Promise<{ id: string }> };

export async function PUT(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const body = await request.json();
    const existing = await db.timetableEntry.findUnique({ where: { id } });
    if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    const item = await db.timetableEntry.update({
      where: { id },
      data: {
        subject: body.subject !== undefined ? body.subject : undefined,
        teacher: body.teacher !== undefined ? body.teacher : undefined,
        classGroup: body.classGroup !== undefined ? body.classGroup : undefined,
        room: body.room !== undefined ? body.room : undefined,
        dayOfWeek: body.dayOfWeek !== undefined ? body.dayOfWeek : undefined,
        timeStart: body.timeStart !== undefined ? body.timeStart : undefined,
        timeEnd: body.timeEnd !== undefined ? body.timeEnd : undefined,
        type: body.type !== undefined ? body.type : undefined,
        semester: body.semester !== undefined ? body.semester : undefined,
        status: body.status !== undefined ? body.status : undefined,
        notes: body.notes !== undefined ? body.notes : undefined,
      },
    });
    return NextResponse.json(item);
  } catch (error) { console.error(error); return NextResponse.json({ error: 'Failed' }, { status: 500 }); }
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const existing = await db.timetableEntry.findUnique({ where: { id } });
    if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    await db.timetableEntry.delete({ where: { id } });
    return NextResponse.json({ message: 'Deleted' });
  } catch (error) { console.error(error); return NextResponse.json({ error: 'Failed' }, { status: 500 }); }
}
