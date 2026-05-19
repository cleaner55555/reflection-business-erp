import { db } from '@/lib/db'
import { NextResponse } from 'next/server'
import { storage } from '@/lib/storage'
import { ALLOWED_MIME_TYPES, MAX_FILE_SIZE, sanitizeFileName, getExtension, getFileTypeCategory } from '@/lib/file-utils'
import { uploadLimiter, getClientIp } from '@/lib/rate-limit'

// POST /api/files — Upload file
export async function POST(req: Request) {
  try {
    const ip = getClientIp(req)
    const rl = uploadLimiter(`upload:${ip}`)
    if (!rl.allowed) {
      return NextResponse.json({ error: 'Previše upload-a. Pokušajte ponovo.' }, { status: 429 })
    }

    const formData = await req.formData()
    const file = formData.get('file') as File | null
    const category = (formData.get('category') as string) || 'document'
    const entity = (formData.get('entity') as string) || null
    const entityId = (formData.get('entityId') as string) || null
    const companyId = (formData.get('companyId') as string) || null
    const userId = (formData.get('userId') as string) || null

    if (!file) {
      return NextResponse.json({ error: 'Fajl nije priložen' }, { status: 400 })
    }

    if (!ALLOWED_MIME_TYPES.has(file.type)) {
      return NextResponse.json({ error: `Tip fajla "${file.type}" nije dozvoljen` }, { status: 400 })
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: `Fajl je prevelik (max ${Math.round(MAX_FILE_SIZE / 1024 / 1024)}MB)` }, { status: 400 })
    }

    const buffer = Buffer.from(await file.arrayBuffer())
    const ext = getExtension(file.type) || ''
    const typeCategory = getFileTypeCategory(file.type)
    const uuid = crypto.randomUUID()
    const storagePath = `${typeCategory}/${uuid.substring(0, 2)}/${uuid}${ext}`

    await storage.upload(storagePath, buffer, file.type)

    const fileRecord = await db.file.create({
      data: {
        name: `${uuid}${ext}`,
        originalName: sanitizeFileName(file.name),
        mimeType: file.type,
        size: file.size,
        path: storagePath,
        url: `/api/files/${uuid}/download`,
        category,
        entity,
        entityId,
        companyId,
        userId,
      },
    })

    return NextResponse.json(fileRecord, { status: 201 })
  } catch (error) {
    console.error('File upload error:', error)
    return NextResponse.json({ error: 'Greška pri upload-u fajla' }, { status: 500 })
  }
}

// GET /api/files — List files
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const companyId = searchParams.get('companyId')
    const category = searchParams.get('category')
    const entity = searchParams.get('entity')
    const entityId = searchParams.get('entityId')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')

    const where: Record<string, unknown> = {}
    if (companyId) where.companyId = companyId
    if (category) where.category = category
    if (entity && entityId) { where.entity = entity; where.entityId = entityId }

    const [files, total] = await Promise.all([
      db.file.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      db.file.count({ where }),
    ])

    return NextResponse.json({ files, total, page, limit })
  } catch (error) {
    console.error('File list error:', error)
    return NextResponse.json({ error: 'Greška' }, { status: 500 })
  }
}
