import { db } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { courseId, title, content, orderNum, type } = body
    if (!courseId || !title) return NextResponse.json({ error: 'courseId i title su obavezni' }, { status: 400 })

    const lesson = await db.lesson.create({
      data: { courseId, title, content, orderNum: Number(orderNum) || 0, type: type || 'tekst' }
    })
    return NextResponse.json(lesson, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}
