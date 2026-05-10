import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || '';
    const subject = searchParams.get('subject') || '';
    const search = searchParams.get('search') || '';
    const where: Record<string, unknown> = {};
    if (status) where.status = status;
    if (subject) where.subject = subject;
    if (search) where.OR = [{ title: { contains: search } }, { subject: { contains: search } }];
    const items = await db.homework.findMany({ where, orderBy: { assignedDate: 'desc' } });
    return NextResponse.json(items);
  } catch (error) { console.error(error); return NextResponse.json({ error: 'Failed' }, { status: 500 }); }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    if (!body.title || !body.subject) return NextResponse.json({ error: 'Title and subject required' }, { status: 400 });
    const item = await db.homework.create({
      data: { title: body.title, subject: body.subject, classGroup: body.classGroup || null, teacher: body.teacher || null,
        type: body.type || 'essay', status: body.status || 'assigned',
        dueDate: body.dueDate ? new Date(body.dueDate) : null, assignedDate: body.assignedDate ? new Date(body.assignedDate) : new Date(),
        maxPoints: body.maxPoints || 100, avgScore: body.avgScore || 0, submittedCount: body.submittedCount || 0,
        totalStudents: body.totalStudents || 0, description: body.description || null, instructions: body.instructions || null },
    });
    return NextResponse.json(item, { status: 201 });
  } catch (error) { console.error(error); return NextResponse.json({ error: 'Failed' }, { status: 500 }); }
}
