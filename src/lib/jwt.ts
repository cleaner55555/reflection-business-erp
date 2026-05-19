import { SignJWT, jwtVerify } from 'jose'

export interface JwtPayload {
  userId: string
  email: string
  isSuperAdmin: boolean
}

function getSecret(): Uint8Array {
  const secret = process.env.JWT_SECRET
  if (!secret) {
    throw new Error('JWT_SECRET environment variable is not set')
  }
  return new TextEncoder().encode(secret)
}

/**
 * Sign a JWT token with the given payload.
 * Token expires in 7 days.
 */
export async function signToken(payload: JwtPayload): Promise<string> {
  const secret = getSecret()
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(secret)
}

/**
 * Verify a JWT token and return the payload.
 * Throws if the token is invalid or expired.
 */
export async function verifyToken(token: string): Promise<JwtPayload> {
  const secret = getSecret()
  const { payload } = await jwtVerify(token, secret)
  return {
    userId: payload.userId as string,
    email: payload.email as string,
    isSuperAdmin: payload.isSuperAdmin as boolean,
  }
}
