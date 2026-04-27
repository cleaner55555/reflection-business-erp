import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET /api/email-subscribers?listId=...&status=... — List subscribers
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const listId = searchParams.get('listId') || '';
    const status = searchParams.get('status') || '';

    const where: Record<string, unknown> = {};
    if (listId) {
      where.listId = listId;
    }
    if (status) {
      where.status = status;
    }

    const subscribers = await db.emailSubscriber.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        list: {
          select: { id: true, name: true },
        },
      },
    });

    return NextResponse.json(subscribers);
  } catch (error) {
    console.error('Error fetching subscribers:', error);
    return NextResponse.json({ error: 'Failed to fetch subscribers' }, { status: 500 });
  }
}

// POST /api/email-subscribers — Create subscriber
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, firstName, lastName, listId, status, source } = body;

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const subscriber = await db.emailSubscriber.create({
      data: {
        email,
        firstName: firstName || null,
        lastName: lastName || null,
        listId: listId || null,
        status: status || 'aktivan',
        source: source || null,
      },
    });

    return NextResponse.json(subscriber, { status: 201 });
  } catch (error) {
    console.error('Error creating subscriber:', error);
    return NextResponse.json({ error: 'Failed to create subscriber' }, { status: 500 });
  }
}
