import { db } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  const body = await req.json()
  const { projectId, title, description, status, priority, dueDate } = body
  if (!projectId || !title) return NextResponse.json({ error: 'Projekat i naslov obavezni' }, { status: 400 })

  const task = await db.projectTask.create({
    data: { projectId, title, description, status: status || 'todo', priority: priority || 'srednji', dueDate: dueDate ? new Date(dueDate) : null },
  })
  return NextResponse.json(task, { status: 201 })
}

export async function PUT(req: Request) {
  const body = await req.json()
  const { id, ...data } = body
  if (!id) return NextResponse.json({ error: 'ID obavezan' }, { status: 400 })
  try { const t = await db.projectTask.update({ where: { id }, data }); return NextResponse.json(t) }
  catch { return NextResponse.json({ error: 'Greška' }, { status: 500 }) }
}

export async function DELETE(req: Request) {
  const { searchParams } = new URL(req.url)
  const id = searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'ID obavezan' }, { status: 400 })
  try { await db.projectTask.delete({ where: { id } }); return NextResponse.json({ success: true }) }
  catch { return NextResponse.json({ error: 'Greška' }, { status: 500 }) }
}
