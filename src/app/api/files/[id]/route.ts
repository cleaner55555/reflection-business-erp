import { db } from '@/lib/db'
import { NextResponse } from 'next/server'
import { storage } from '@/lib/storage'

// GET /api/files/[id] — Serve file inline
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const file = await db.file.findUnique({ where: { id } })
    if (!file) return NextResponse.json({ error: 'Fajl nije pronađen' }, { status: 404 })

    const buffer = await storage.download(file.path)
    return new Response(buffer, {
      headers: {
        'Content-Type': file.mimeType,
        'Content-Disposition': `inline; filename="${file.originalName}"`,
        'Content-Length': String(file.size),
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    })
  } catch (error) {
    console.error('File serve error:', error)
    return NextResponse.json({ error: 'Greška' }, { status: 500 })
  }
}

// DELETE /api/files/[id] — Delete file
export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const file = await db.file.findUnique({ where: { id } })
    if (!file) return NextResponse.json({ error: 'Fajl nije pronađen' }, { status: 404 })

    await storage.delete(file.path)
    await db.file.delete({ where: { id } })

    return NextResponse.json({ message: 'Fajl obrisan' })
  } catch (error) {
    console.error('File delete error:', error)
    return NextResponse.json({ error: 'Greška' }, { status: 500 })
  }
}
