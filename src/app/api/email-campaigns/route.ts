import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET /api/email-campaigns — List campaigns with list info
export async function GET() {
  try {
    const campaigns = await db.emailCampaign.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        list: {
          select: { id: true, name: true },
        },
      },
    });

    return NextResponse.json(campaigns);
  } catch (error) {
    console.error('Error fetching campaigns:', error);
    return NextResponse.json({ error: 'Failed to fetch campaigns' }, { status: 500 });
  }
}

// POST /api/email-campaigns — Create campaign
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, subject, preheader, content, status, listId, scheduledAt } = body;

    if (!name || !subject || !content) {
      return NextResponse.json({ error: 'Name, subject and content are required' }, { status: 400 });
    }

    const campaign = await db.emailCampaign.create({
      data: {
        name,
        subject,
        preheader: preheader || null,
        content,
        status: status || 'nacrt',
        listId: listId || null,
        scheduledAt: scheduledAt ? new Date(scheduledAt) : null,
      },
    });

    return NextResponse.json(campaign, { status: 201 });
  } catch (error) {
    console.error('Error creating campaign:', error);
    return NextResponse.json({ error: 'Failed to create campaign' }, { status: 500 });
  }
}
