import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET /api/settings?group=... — Get all settings (or filtered by group)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const group = searchParams.get('group') || '';

    const where: Record<string, unknown> = {};
    if (group) {
      where.group = group;
    }

    const settings = await db.appSetting.findMany({
      where,
      orderBy: { group: 'asc' },
    });

    return NextResponse.json(settings);
  } catch (error) {
    console.error('Error fetching settings:', error);
    return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 });
  }
}

// PUT /api/settings — Upsert settings (accept array of {key, value} objects)
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const items: Array<{ key: string; value: string; label?: string; type?: string; group?: string }> = body;

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'Array of settings is required' }, { status: 400 });
    }

    const results = await Promise.all(
      items.map(async (item) => {
        if (!item.key) return null;

        return db.appSetting.upsert({
          where: { key: item.key },
          create: {
            key: item.key,
            value: item.value,
            label: item.label || null,
            type: item.type || 'text',
            group: item.group || 'general',
          },
          update: {
            value: item.value,
            label: item.label,
            type: item.type,
            group: item.group,
          },
        });
      })
    );

    return NextResponse.json(results.filter(Boolean));
  } catch (error) {
    console.error('Error upserting settings:', error);
    return NextResponse.json({ error: 'Failed to upsert settings' }, { status: 500 });
  }
}
