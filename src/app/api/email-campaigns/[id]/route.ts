import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

type RouteContext = { params: Promise<{ id: string }> };

// GET /api/email-campaigns/[id] — Get campaign
export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const campaign = await db.emailCampaign.findUnique({
      where: { id },
      include: {
        list: {
          select: { id: true, name: true },
        },
      },
    });

    if (!campaign) {
      return NextResponse.json({ error: 'Campaign not found' }, { status: 404 });
    }

    return NextResponse.json(campaign);
  } catch (error) {
    console.error('Error fetching campaign:', error);
    return NextResponse.json({ error: 'Failed to fetch campaign' }, { status: 500 });
  }
}

// PUT /api/email-campaigns/[id] — Update campaign (status change, etc.)
export async function PUT(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const body = await request.json();

    const existing = await db.emailCampaign.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: 'Campaign not found' }, { status: 404 });
    }

    const campaign = await db.emailCampaign.update({
      where: { id },
      data: {
        name: body.name,
        subject: body.subject,
        preheader: body.preheader,
        content: body.content,
        status: body.status,
        listId: body.listId,
        sentCount: body.sentCount,
        openRate: body.openRate,
        clickRate: body.clickRate,
        bounceRate: body.bounceRate,
        scheduledAt: body.scheduledAt ? new Date(body.scheduledAt) : null,
        sentAt: body.sentAt ? new Date(body.sentAt) : null,
      },
    });

    return NextResponse.json(campaign);
  } catch (error) {
    console.error('Error updating campaign:', error);
    return NextResponse.json({ error: 'Failed to update campaign' }, { status: 500 });
  }
}

// DELETE /api/email-campaigns/[id] — Delete campaign
export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;

    const existing = await db.emailCampaign.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: 'Campaign not found' }, { status: 404 });
    }

    await db.emailCampaign.delete({ where: { id } });

    return NextResponse.json({ message: 'Campaign deleted successfully' });
  } catch (error) {
    console.error('Error deleting campaign:', error);
    return NextResponse.json({ error: 'Failed to delete campaign' }, { status: 500 });
  }
}
