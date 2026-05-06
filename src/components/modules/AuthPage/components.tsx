'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { LogIn, UserPlus, Eye, EyeOff, Loader2 } from 'lucide-react'

/* ── Login Form ── */

export function LoginForm({
  email,
  password,
  showPassword,
  loading,
  setEmail,
  setPassword,
  setShowPassword,
  onSubmit,
}: {
  email: string
  password: string
  showPassword: boolean
  loading: boolean
  setEmail: (v: string) => void
  setPassword: (v: string) => void
  setShowPassword: (v: boolean) => void
  onSubmit: (e: React.FormEvent) => void
}) {
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="login-email">Email</Label>
        <Input
          id="login-email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="admin@reflection.rs"
          required
          disabled={loading}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="login-password">Lozinka</Label>
        <div className="relative">
          <Input
            id="login-password"
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••"
            required
            disabled={loading}
            className="pr-10"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
      </div>
      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? (
          <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Prijava...</>
        ) : (
          <><LogIn className="mr-2 h-4 w-4" /> Prijavi se</>
        )}
      </Button>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-card px-2 text-muted-foreground">Demo podaci</span>
        </div>
      </div>
      <div className="text-center text-xs text-muted-foreground space-y-1">
        <p>Email: <code className="bg-muted px-1.5 py-0.5 rounded">admin@reflection.rs</code></p>
        <p>Lozinka: <code className="bg-muted px-1.5 py-0.5 rounded">admin123</code></p>
      </div>
    </form>
  )
}

/* ── Register Form ── */

export function RegisterForm({
  email,
  password,
  firstName,
  lastName,
  phone,
  loading,
  setEmail,
  setPassword,
  setFirstName,
  setLastName,
  setPhone,
  onSubmit,
}: {
  email: string
  password: string
  firstName: string
  lastName: string
  phone: string
  loading: boolean
  setEmail: (v: string) => void
  setPassword: (v: string) => void
  setFirstName: (v: string) => void
  setLastName: (v: string) => void
  setPhone: (v: string) => void
  onSubmit: (e: React.FormEvent) => void
}) {
  return (
    <form onSubmit={onSubmit} className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label htmlFor="reg-first">Ime</Label>
          <Input
            id="reg-first"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            placeholder="Marko"
            required
            disabled={loading}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="reg-last">Prezime</Label>
          <Input
            id="reg-last"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            placeholder="Petrović"
            required
            disabled={loading}
          />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="reg-email">Email</Label>
        <Input
          id="reg-email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="marko@firma.rs"
          required
          disabled={loading}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="reg-password">Lozinka (min. 6 karaktera)</Label>
        <Input
          id="reg-password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••"
          required
          minLength={6}
          disabled={loading}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="reg-phone">Telefon (opciono)</Label>
        <Input
          id="reg-phone"
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="+381 63 123 4567"
          disabled={loading}
        />
      </div>
      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? (
          <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Registracija...</>
        ) : (
          <><UserPlus className="mr-2 h-4 w-4" /> Registruj se</>
        )}
      </Button>
    </form>
  )
}
