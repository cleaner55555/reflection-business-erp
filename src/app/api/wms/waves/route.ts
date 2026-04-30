import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET /api/wms/waves?status=...
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || '';

    const where: Record<string, unknown> = {};
    if (status) where.status = status;

    const waves = await db.pickWave.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        lines: { orderBy: { createdAt: 'asc' } },
      },
    });

    // Add summary per wave
    const enriched = waves.map(w => {
      const totalQty = w.lines.reduce((s, l) => s + l.quantity, 0);
      const pickedQty = w.lines.reduce((s, l) => s + l.pickedQty, 0);
      const completedLines = w.lines.filter(l => l.status === 'pokupljeno').length;
      return { ...w, totalQty, pickedQty, progress: totalQty > 0 ? Math.round((pickedQty / totalQty) * 100) : 0, completedLines, totalLines: w.lines.length };
    });

    return NextResponse.json(enriched);
  } catch (error) {
    console.error('Error fetching pick waves:', error);
    return NextResponse.json({ error: 'Failed to fetch pick waves' }, { status: 500 });
  }
}

// POST /api/wms/waves - Create wave from delivery notes or manual
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, priority, assignedTo, notes, deliveryNoteIds, lines } = body;

    // Auto-generate name if not provided
    const waveName = name || `WAVE-${new Date().toISOString().slice(0, 10)}-${String(Date.now()).slice(-4)}`;

    const wave = await db.pickWave.create({
      data: {
        name: waveName,
        priority: priority || 'srednji',
        assignedTo: assignedTo || null,
        notes: notes || null,
        lines: {
          create: (lines || []).map((l: { productId: string; productName: string; quantity: number; locationCode?: string }) => ({
            productId: l.productId,
            productName: l.productName,
            quantity: l.quantity,
            locationCode: l.locationCode || null,
          })),
        },
      },
      include: { lines: true },
    });

    // If deliveryNoteIds provided, mark them as linked
    if (deliveryNoteIds && deliveryNoteIds.length > 0) {
      // Update delivery notes status to pripremljena
      await db.deliveryNote.updateMany({
        where: { id: { in: deliveryNoteIds } },
        data: { status: 'pripremljena' },
      });
    }

    return NextResponse.json(wave, { status: 201 });
  } catch (error) {
    console.error('Error creating pick wave:', error);
    return NextResponse.json({ error: 'Failed to create pick wave' }, { status: 500 });
  }
}
