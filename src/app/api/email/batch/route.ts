import { NextRequest, NextResponse } from 'next/server'
import { sendEmailBatch, type EmailPayload } from '@/lib/email'

// POST /api/email/batch — Send multiple emails with rate limiting
export async function POST(request: NextRequest) {
  try {
    const isAuth = request.headers.get('x-auth-verified') === 'true'
    if (!isAuth) {
      return NextResponse.json({ error: 'Neautorizovan pristup' }, { status: 401 })
    }

    const body = await request.json()
    const { emails } = body

    if (!Array.isArray(emails) || emails.length === 0) {
      return NextResponse.json(
        { error: 'Polje emails mora biti nenumeracija sa bar jednim email-om' },
        { status: 400 },
      )
    }

    // Validate each email payload
    for (let i = 0; i < emails.length; i++) {
      const e = emails[i] as Record<string, unknown>
      if (!e.to || !e.subject || !e.html) {
        return NextResponse.json(
          { error: `Email na indeksu ${i} nema obavezna polja (to, subject, html)` },
          { status: 400 },
        )
      }
    }

    const count = emails.length as number

    // Process in background — don't block the response
    void sendEmailBatch(emails as EmailPayload[]).then((result) => {
      console.log(
        `📧 [BATCH COMPLETE] Sent: ${result.sent}, Failed: ${result.failed}, Total: ${count}`,
      )
    })

    return NextResponse.json({ success: true, queued: count })
  } catch (error) {
    console.error('Error queueing batch emails:', error)
    return NextResponse.json({ error: 'Greška pri zakazivanju emaila' }, { status: 500 })
  }
}
