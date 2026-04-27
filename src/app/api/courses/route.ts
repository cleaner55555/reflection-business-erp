import { db } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const includeLessons = searchParams.get('include') === 'lessons'

    const courses = await db.course.findMany({
      include: {
        _count: { select: { lessons: true } },
        ...(includeLessons ? { lessons: { orderBy: { orderNum: 'asc' } } } : {}),
      },
      orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json(courses)
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { title, description, category, instructor, duration, status } = body
    if (!title) return NextResponse.json({ error: 'title je obavezan' }, { status: 400 })

    const course = await db.course.create({
      data: { title, description, category, instructor, duration: Number(duration) || 0, status: status || 'aktivno' }
    })
    return NextResponse.json(course, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}
