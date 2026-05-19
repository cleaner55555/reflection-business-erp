import { db } from '@/lib/db'
import { NextResponse } from 'next/server'
import { sendEmail } from '@/lib/email'

// GET /api/auth/verify-email?token=xxx
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const token = searchParams.get('token')

    if (!token) {
      return NextResponse.json({ error: 'Token je obavezan' }, { status: 400 })
    }

    // Find user by reset token (reusing the same field for email verification)
    const user = await db.user.findFirst({
      where: {
        resetToken: token,
        resetTokenExpiry: { gt: new Date() },
      },
    })

    if (!user) {
      return NextResponse.json(
        { error: 'Token je nevažeći ili je istekao.' },
        { status: 400 }
      )
    }

    // Mark email as verified and clear token
    await db.user.update({
      where: { id: user.id },
      data: {
        emailVerified: true,
        resetToken: null,
        resetTokenExpiry: null,
      },
    })

    return NextResponse.json({ message: 'Email je uspešno verifikovan!' })
  } catch (error) {
    console.error('Verify email error:', error)
    return NextResponse.json({ error: 'Greška pri verifikaciji.' }, { status: 500 })
  }
}
