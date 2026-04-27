import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

type RouteContext = { params: Promise<{ id: string }> };

// PUT /api/email-lists/[id] — Update list
export async function PUT(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const body = await request.json();

    const existing = await db.emailList.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: 'Email list not found' }, { status: 404 });
    }

    const list = await db.emailList.update({
      where: { id },
      data: {
        name: body.name,
        description: body.description,
      },
    });

    return NextResponse.json(list);
  } catch (error) {
    console.error('Error updating email list:', error);
    return NextResponse.json({ error: 'Failed to update email list' }, { status: 500 });
  }
}

// DELETE /api/email-lists/[id] — Delete list
export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;

    const existing = await db.emailList.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: 'Email list not found' }, { status: 404 });
    }

    await db.emailList.delete({ where: { id } });

    return NextResponse.json({ message: 'Email list deleted successfully' });
  } catch (error) {
    console.error('Error deleting email list:', error);
    return NextResponse.json({ error: 'Failed to delete email list' }, { status: 500 });
  }
}
