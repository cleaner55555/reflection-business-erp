import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET /api/email-lists — List all email lists with subscriber count
export async function GET() {
  try {
    const lists = await db.emailList.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: { subscribers: true, campaigns: true },
        },
      },
    });

    return NextResponse.json(lists);
  } catch (error) {
    console.error('Error fetching email lists:', error);
    return NextResponse.json({ error: 'Failed to fetch email lists' }, { status: 500 });
  }
}

// POST /api/email-lists — Create email list
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, description } = body;

    if (!name) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    const list = await db.emailList.create({
      data: {
        name,
        description: description || null,
      },
    });

    return NextResponse.json(list, { status: 201 });
  } catch (error) {
    console.error('Error creating email list:', error);
    return NextResponse.json({ error: 'Failed to create email list' }, { status: 500 });
  }
}
