'use client'

import { useState } from 'react'
import { useAppStore } from '@/lib/store'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { motion, AnimatePresence } from 'framer-motion'
import { Building2, LogIn, UserPlus, Shield } from 'lucide-react'
import { toast } from 'sonner'
import { LoginForm, RegisterForm } from './components'

export function AuthPage() {
  const { login, setActiveCompany, setActiveModule } = useAppStore()
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [loginEmail, setLoginEmail] = useState('admin@reflection.rs')
  const [loginPassword, setLoginPassword] = useState('admin123')
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
      if (!res.ok) { toast.error(data.error || 'Greška pri prijavi'); return }
      login(data.user, data.companies)
      const defaultCompany = data.companies.find((c: { isDefault: boolean }) => c.isDefault) || data.companies[0]
      if (defaultCompany) setActiveCompany(defaultCompany.companyId, defaultCompany.companyName)
      setActiveModule('dashboard')
      toast.success(`Dobrodošli, ${data.user.firstName}!`)
    } catch { toast.error('Greška pri prijavi') } finally { setLoading(false) }
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: regEmail, password: regPassword, firstName: regFirstName, lastName: regLastName, phone: regPhone }),
      })
      const data = await res.json()
      if (!res.ok) { toast.error(data.error || 'Greška pri registraciji'); return }
      toast.success('Uspešno ste se registrovali! Možete se prijaviti.')
      setLoginEmail(regEmail)
      setRegEmail(''); setRegPassword(''); setRegFirstName(''); setRegLastName(''); setRegPhone('')
    } catch { toast.error('Greška pri registraciji') } finally { setLoading(false) }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted/30 p-4">
      <motion.div initial={{ opacity: 0, y: 20, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ duration: 0.5 }} className="w-full max-w-md">
        <div className="text-center mb-8">
          <motion.div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary text-primary-foreground mb-4" initial={{ rotate: -10 }} animate={{ rotate: 0 }} transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}>
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
                <TabsTrigger value="login" className="gap-1.5"><LogIn className="h-3.5 w-3.5" />Prijava</TabsTrigger>
                <TabsTrigger value="register" className="gap-1.5"><UserPlus className="h-3.5 w-3.5" />Registracija</TabsTrigger>
              </TabsList>
              <AnimatePresence mode="wait">
                <TabsContent value="login">
                  <LoginForm email={loginEmail} password={loginPassword} showPassword={showPassword} loading={loading} setEmail={setLoginEmail} setPassword={setLoginPassword} setShowPassword={setShowPassword} onSubmit={handleLogin} />
                </TabsContent>
                <TabsContent value="register">
                  <RegisterForm email={regEmail} password={regPassword} firstName={regFirstName} lastName={regLastName} phone={regPhone} loading={loading} setEmail={setRegEmail} setPassword={setRegPassword} setFirstName={setRegFirstName} setLastName={setRegLastName} setPhone={setRegPhone} onSubmit={handleRegister} />
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
