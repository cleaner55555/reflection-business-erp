import { db } from '@/lib/db'
import { NextResponse } from 'next/server'
import { sendEmail } from '@/lib/email'
import { forgotLimiter, getClientIp } from '@/lib/rate-limit'

// POST /api/auth/forgot-password
export async function POST(req: Request) {
  try {
    const ip = getClientIp(req)
    const rl = forgotLimiter(`forgot:${ip}`)
    if (!rl.allowed) {
      return NextResponse.json(
        { error: 'Previše zahteva. Pokušajte ponovo za par minuta.' },
        { status: 429, headers: { 'Retry-After': String(rl.retryAfter) } }
      )
    }

    const { email } = await req.json()
    if (!email) {
      return NextResponse.json({ error: 'Email je obavezan' }, { status: 400 })
    }

    const user = await db.user.findUnique({ where: { email } })
    if (!user) {
      // Always return success to prevent email enumeration
      return NextResponse.json({ message: 'Ako korisnik postoji, poslata je instrukcija za resetovanje lozinke.' })
    }

    // Generate reset token
    const token = crypto.randomUUID()
    const expiresAt = new Date(Date.now() + 3600_000) // 1 hour

    await db.user.update({
      where: { id: user.id },
      data: {
        resetToken: token,
        resetTokenExpiry: expiresAt,
      },
    })

    // Send reset email
    const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL || ''}/reset-password?token=${token}`
    await sendEmail({
      to: user.email,
      subject: 'Resetovanje lozinke — Reflection Business',
      html: `
        <div style="max-width:600px;margin:0 auto;font-family:system-ui,-apple-system,sans-serif;padding:20px">
          <div style="background:#09090b;color:white;padding:20px 30px;border-radius:8px 8px 0 0">
            <h1 style="margin:0;font-size:20px">🔑 Resetovanje lozinke</h1>
          </div>
          <div style="border:1px solid #e5e7eb;padding:30px;border-radius:0 0 8px 8px">
            <p>Zdravo, <strong>${user.firstName || ''}</strong></p>
            <p>Zatražili ste resetovanje lozinke. Kliknite na dugme ispod da postavite novu lozinku:</p>
            <p style="text-align:center;margin:30px 0">
              <a href="${resetUrl}" style="background:#09090b;color:white;padding:12px 30px;border-radius:6px;text-decoration:none;font-weight:600;display:inline-block">
                Resetuj lozinku
              </a>
            </p>
            <p>Ovaj link važi <strong>1 sat</strong>. Ako niste zatražili resetovanje, ignorišite ovaj email.</p>
            <hr style="border:none;border-top:1px solid #e5e7eb;margin:20px 0">
            <p style="color:#6b7280;font-size:13px">Reflection Business ERP Platform</p>
          </div>
        </div>
      `,
    })

    return NextResponse.json({ message: 'Ako korisnik postoji, poslata je instrukcija za resetovanje lozinke.' })
  } catch (error) {
    console.error('Forgot password error:', error)
    return NextResponse.json({ error: 'Greška. Pokušajte ponovo.' }, { status: 500 })
  }
}
