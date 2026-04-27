import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

type RouteContext = { params: Promise<{ id: string }> };

// PUT /api/email-subscribers/[id] — Update subscriber
export async function PUT(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const body = await request.json();

    const existing = await db.emailSubscriber.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: 'Subscriber not found' }, { status: 404 });
    }

    const subscriber = await db.emailSubscriber.update({
      where: { id },
      data: {
        email: body.email,
        firstName: body.firstName,
        lastName: body.lastName,
        listId: body.listId,
        status: body.status,
        source: body.source,
      },
    });

    return NextResponse.json(subscriber);
  } catch (error) {
    console.error('Error updating subscriber:', error);
    return NextResponse.json({ error: 'Failed to update subscriber' }, { status: 500 });
  }
}

// DELETE /api/email-subscribers/[id] — Delete subscriber
export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;

    const existing = await db.emailSubscriber.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: 'Subscriber not found' }, { status: 404 });
    }

    await db.emailSubscriber.delete({ where: { id } });

    return NextResponse.json({ message: 'Subscriber deleted successfully' });
  } catch (error) {
    console.error('Error deleting subscriber:', error);
    return NextResponse.json({ error: 'Failed to delete subscriber' }, { status: 500 });
  }
}
