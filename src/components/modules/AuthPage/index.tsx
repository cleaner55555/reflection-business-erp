'use client'

import { useState } from 'react'
import { useAppStore } from '@/lib/store'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { motion, AnimatePresence } from 'framer-motion'
import { Building2, LogIn, UserPlus, Eye, EyeOff, Loader2, Shield } from 'lucide-react'
import { toast } from 'sonner'

export function AuthPage() {
  const { login, setActiveCompany, setActiveModule } = useAppStore()
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  // Login form
  const [loginEmail, setLoginEmail] = useState('admin@reflection.rs')
  const [loginPassword, setLoginPassword] = useState('admin123')

  // Register form
  const [regEmail, setRegEmail] = useState('')
  const [regPassword, setRegPassword] = useState('')
  const [regFirstName, setRegFirstName] = useState('')
  const [regLastName, setRegLastName] = useState('')
  const [regPhone, setRegPhone] = useState('')

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: loginEmail, password: loginPassword }),
      })
      const data = await res.json()

      if (!res.ok) {
        toast.error(data.error || 'Greška pri prijavi')
        return
      }

      login(data.user, data.companies, data.token)

      // Set default company
      const defaultCompany = data.companies.find((c: { isDefault: boolean }) => c.isDefault) || data.companies[0]
      if (defaultCompany) {
        setActiveCompany(defaultCompany.companyId, defaultCompany.companyName)
      }

      setActiveModule('dashboard')
      toast.success(`Dobrodošli, ${data.user.firstName}!`)
    } catch {
      toast.error('Greška pri prijavi')
    } finally {
      setLoading(false)
    }
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: regEmail,
          password: regPassword,
          firstName: regFirstName,
          lastName: regLastName,
          phone: regPhone,
        }),
      })
      const data = await res.json()

      if (!res.ok) {
        toast.error(data.error || 'Greška pri registraciji')
        return
      }

      toast.success('Uspešno ste se registrovali! Možete se prijaviti.')
      // Switch to login tab
      setLoginEmail(regEmail)
      setRegEmail('')
      setRegPassword('')
      setRegFirstName('')
      setRegLastName('')
      setRegPhone('')
    } catch {
      toast.error('Greška pri registraciji')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted/30 p-4">
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        {/* Logo & Title */}
        <div className="text-center mb-8">
          <motion.div
            className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary text-primary-foreground mb-4"
            initial={{ rotate: -10 }}
            animate={{ rotate: 0 }}
            transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
          >
            <Building2 className="w-8 h-8" />
          </motion.div>
          <h1 className="text-2xl font-bold text-foreground">Reflection Business</h1>
          <p className="text-sm text-muted-foreground mt-1">Kompletno ERP rešenje za vaše poslovanje</p>
        </div>

        <Card className="shadow-xl border-0 bg-card/80 backdrop-blur-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg">Dobrodošli</CardTitle>
            <CardDescription>Prijavite se na svoj nalog ili kreirajte novi</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-4">
                <TabsTrigger value="login" className="gap-1.5">
                  <LogIn className="h-3.5 w-3.5" />
                  Prijava
                </TabsTrigger>
                <TabsTrigger value="register" className="gap-1.5">
                  <UserPlus className="h-3.5 w-3.5" />
                  Registracija
                </TabsTrigger>
              </TabsList>

              <AnimatePresence mode="wait">
                <TabsContent value="login">
                  <form onSubmit={handleLogin} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="login-email">Email</Label>
                      <Input
                        id="login-email"
                        type="email"
                        value={loginEmail}
                        onChange={(e) => setLoginEmail(e.target.value)}
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
                          value={loginPassword}
                          onChange={(e) => setLoginPassword(e.target.value)}
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
                </TabsContent>

                <TabsContent value="register">
                  <form onSubmit={handleRegister} className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-2">
                        <Label htmlFor="reg-first">Ime</Label>
                        <Input
                          id="reg-first"
                          value={regFirstName}
                          onChange={(e) => setRegFirstName(e.target.value)}
                          placeholder="Marko"
                          required
                          disabled={loading}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="reg-last">Prezime</Label>
                        <Input
                          id="reg-last"
                          value={regLastName}
                          onChange={(e) => setRegLastName(e.target.value)}
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
                        value={regEmail}
                        onChange={(e) => setRegEmail(e.target.value)}
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
                        value={regPassword}
                        onChange={(e) => setRegPassword(e.target.value)}
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
                        value={regPhone}
                        onChange={(e) => setRegPhone(e.target.value)}
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
                </TabsContent>
              </AnimatePresence>
            </Tabs>
          </CardContent>
        </Card>

        <div className="text-center mt-6 text-xs text-muted-foreground">
          <div className="flex items-center justify-center gap-1">
            <Shield className="h-3 w-3" />
            <span>Šifrovano • Bezbedno • GDPR usklađeno</span>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
