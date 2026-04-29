import { NextResponse } from 'next/server'
import { seedDatabase } from '@/lib/seed'

// POST /api/seed - Seed the database with default data
export async function POST() {
  try {
    await seedDatabase()
    return NextResponse.json({ success: true, message: 'Baza je uspešno inicijalizovana' })
  } catch (error) {
    console.error('Seed error:', error)
    return NextResponse.json({ error: 'Greška pri inicijalizaciji baze' }, { status: 500 })
  }
}
