import { db } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const course = await db.course.findUnique({
      where: { id },
      include: {
        _count: { select: { lessons: true } },
        lessons: { orderBy: { orderNum: 'asc' } },
      },
    })
    if (!course) return NextResponse.json({ error: 'Nije pronađeno' }, { status: 404 })
    return NextResponse.json(course)
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await request.json()
    const course = await db.course.update({ where: { id }, data: body })
    return NextResponse.json(course)
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    await db.course.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}
