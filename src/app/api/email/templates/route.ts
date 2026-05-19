import { NextResponse } from 'next/server'
import { EMAIL_TEMPLATES } from '@/lib/email-templates'

// GET /api/email/templates — List available email templates
export async function GET() {
  try {
    const templates = EMAIL_TEMPLATES.map((t) => ({
      id: t.id,
      name: t.name,
      description: t.description,
    }))

    return NextResponse.json({ templates })
  } catch (error) {
    console.error('Error fetching email templates:', error)
    return NextResponse.json({ error: 'Greška pri učitavanju templejta' }, { status: 500 })
  }
}
