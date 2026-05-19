import { NextRequest, NextResponse } from 'next/server'
import { sendEmail, type EmailPayload } from '@/lib/email'

// POST /api/email/send — Send a single email
export async function POST(request: NextRequest) {
  try {
    // Auth check: middleware sets x-auth-verified when valid JWT present
    const isAuth = request.headers.get('x-auth-verified') === 'true'
    if (!isAuth) {
      return NextResponse.json({ error: 'Neautorizovan pristup' }, { status: 401 })
    }

    const body = await request.json()
    const { to, subject, html, text, cc, bcc, replyTo } = body

    if (!to || !subject || !html) {
      return NextResponse.json(
        { error: 'Polja to, subject i html su obavezna' },
        { status: 400 },
      )
    }

    const payload: EmailPayload = { to, subject, html, text, cc, bcc, replyTo }
    const result = await sendEmail(payload)

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 500 })
    }

    return NextResponse.json({ success: true, messageId: result.messageId })
  } catch (error) {
    console.error('Error sending email:', error)
    return NextResponse.json({ error: 'Greška pri slanju emaila' }, { status: 500 })
  }
}
