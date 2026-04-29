import { db } from '@/lib/db'
import { NextResponse } from 'next/server'

// GET /api/roles - List all roles
export async function GET() {
  try {
    const roles = await db.role.findMany({
      orderBy: { createdAt: 'asc' },
    })
    return NextResponse.json(roles)
  } catch (error) {
    console.error('Error fetching roles:', error)
    return NextResponse.json({ error: 'Greška pri učitavanju uloga' }, { status: 500 })
  }
}
