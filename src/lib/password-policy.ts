// ─── Password Policy ──────────────────────────────────────────────────────────

const COMMON_PASSWORDS = [
  'password', '123456', '12345678', 'qwerty', 'abc123', 'monkey', 'master',
  'dragon', '111111', 'baseball', 'iloveyou', 'trustno1', 'sunshine',
  'princess', 'football', 'shadow', 'superman', 'michael', 'password1',
  'letmein', 'welcome', '1234567', 'admin', 'login', 'starwars', 'pass',
  'test', 'demo', '1234', '12345', '123', '0000', 'aaaa', 'qwer', 'asdf',
  'zxcv', 'sifra', 'lozinka', 'admin123', 'root', 'root123', 'user',
  'user123', 'pass123', 'test123', 'qwe123', 'password123',
]

export interface PasswordResult {
  valid: boolean
  strength: number // 0-100
  errors: string[]
}

export function validatePassword(password: string): PasswordResult {
  const errors: string[] = []
  let strength = 0

  // Length checks
  if (password.length < 8) {
    errors.push('Lozinka mora imati najmanje 8 karaktera')
  } else {
    strength += password.length <= 10 ? 15 : password.length <= 14 ? 25 : 35
  }

  // Character variety
  if (!/[A-Z]/.test(password)) {
    errors.push('Lozinka mora sadržati najmanje jedno veliko slovo')
  } else strength += 15

  if (!/[a-z]/.test(password)) {
    errors.push('Lozinka mora sadržati najmanje jedno malo slovo')
  } else strength += 15

  if (!/[0-9]/.test(password)) {
    errors.push('Lozinka mora sadržati najmanje jedan broj')
  } else strength += 15

  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    errors.push('Lozinka mora sadržati najmanje jedan specijalni karakter')
  } else strength += 20

  // Common password check
  if (COMMON_PASSWORDS.includes(password.toLowerCase())) {
    errors.push('Lozinka je previše česta — odaberite drugačiju')
    strength = 0
  }

  // Sequential characters (123, abc)
  if (/(?:abc|bcd|cde|def|efg|fgh|ghi|hij|ijk|jkl|klm|lmn|mno|nop|opq|pqr|qrs|rst|stu|tuv|uvw|vwx|wxy|xyz|012|123|234|345|456|567|678|789)/i.test(password)) {
    strength = Math.max(0, strength - 10)
  }

  // Repeated characters (aaa, 111)
  if (/(.)\1{2,}/.test(password)) {
    strength = Math.max(0, strength - 10)
  }

  return {
    valid: errors.length === 0,
    strength: Math.min(100, strength),
    errors,
  }
}

export function getPasswordStrengthLabel(strength: number): { label: string; color: string } {
  if (strength < 25) return { label: 'Veoma slaba', color: 'text-red-500' }
  if (strength < 50) return { label: 'Slaba', color: 'text-orange-500' }
  if (strength < 75) return { label: 'Srednja', color: 'text-yellow-500' }
  if (strength < 90) return { label: 'Dobra', color: 'text-green-500' }
  return { label: 'Odlična', color: 'text-emerald-500' }
}
