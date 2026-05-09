import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
type RouteContext = { params: Promise<{ id: string }> };
export async function PUT(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params; const body = await request.json();
    const existing = await db.homework.findUnique({ where: { id } });
    if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    const item = await db.homework.update({ where: { id }, data: {
      title: body.title, subject: body.subject, classGroup: body.classGroup, teacher: body.teacher,
      type: body.type, status: body.status,
      dueDate: body.dueDate ? new Date(body.dueDate) : (body.dueDate === null ? null : undefined),
      assignedDate: body.assignedDate ? new Date(body.assignedDate) : undefined,
      maxPoints: body.maxPoints, avgScore: body.avgScore, submittedCount: body.submittedCount,
      totalStudents: body.totalStudents, description: body.description, instructions: body.instructions,
    }});
    return NextResponse.json(item);
  } catch (error) { console.error(error); return NextResponse.json({ error: 'Failed' }, { status: 500 }); }
}
export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const existing = await db.homework.findUnique({ where: { id } });
    if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    await db.homework.delete({ where: { id } }); return NextResponse.json({ message: 'Deleted' });
  } catch (error) { console.error(error); return NextResponse.json({ error: 'Failed' }, { status: 500 }); }
}
