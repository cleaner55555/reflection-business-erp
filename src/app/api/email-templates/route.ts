import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET /api/email-templates — List templates
export async function GET() {
  try {
    const templates = await db.emailTemplate.findMany({
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(templates);
  } catch (error) {
    console.error('Error fetching email templates:', error);
    return NextResponse.json({ error: 'Failed to fetch email templates' }, { status: 500 });
  }
}

// POST /api/email-templates — Create template
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, subject, content, category } = body;

    if (!name || !subject || !content) {
      return NextResponse.json({ error: 'Name, subject and content are required' }, { status: 400 });
    }

    const template = await db.emailTemplate.create({
      data: {
        name,
        subject,
        content,
        category: category || null,
      },
    });

    return NextResponse.json(template, { status: 201 });
  } catch (error) {
    console.error('Error creating email template:', error);
    return NextResponse.json({ error: 'Failed to create email template' }, { status: 500 });
  }
}
