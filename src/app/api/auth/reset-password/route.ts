import { db } from '@/lib/db'
import { NextResponse } from 'next/server'
import { hashPassword } from '@/lib/seed'
import { resetPasswordSchema, validateRequest } from '@/lib/validations'

// POST /api/auth/reset-password
export async function POST(req: Request) {
  try {
    const body = await req.json()
    const validation = validateRequest(resetPasswordSchema, body)
    if (!validation.success) return validation.response

    const { token, password } = validation.data

    // Find user by reset token
    const user = await db.user.findFirst({
      where: {
        resetToken: token,
        resetTokenExpiry: { gt: new Date() },
      },
    })

    if (!user) {
      return NextResponse.json(
        { error: 'Token je nevažeći ili je istekao. Zatražite novi.' },
        { status: 400 }
      )
    }

    // Update password and clear token
    const passwordHash = await hashPassword(password)
    await db.user.update({
      where: { id: user.id },
      data: {
        passwordHash,
        resetToken: null,
        resetTokenExpiry: null,
      },
    })

    return NextResponse.json({ message: 'Lozinka je uspešno promenjena. Možete se prijaviti sa novom lozinkom.' })
  } catch (error) {
    console.error('Reset password error:', error)
    return NextResponse.json({ error: 'Greška pri resetovanju lozinke.' }, { status: 500 })
  }
}
