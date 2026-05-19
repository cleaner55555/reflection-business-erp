import { db } from '@/lib/db'
import { NextResponse } from 'next/server'
import { storage } from '@/lib/storage'

// GET /api/files/[id]/download — Download file as attachment
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const file = await db.file.findUnique({ where: { id } })
    if (!file) return NextResponse.json({ error: 'Fajl nije pronađen' }, { status: 404 })

    const buffer = await storage.download(file.path)
    return new Response(buffer, {
      headers: {
        'Content-Type': file.mimeType,
        'Content-Disposition': `attachment; filename="${file.originalName}"`,
        'Content-Length': String(file.size),
      },
    })
  } catch (error) {
    console.error('File download error:', error)
    return NextResponse.json({ error: 'Greška' }, { status: 500 })
  }
}
