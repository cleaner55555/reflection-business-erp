export const { login, setActiveCompany, setActiveModule } = useAppStore();

export const handleLogin = async (e: React.FormEvent) => {
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

      login(data.user, data.companies)

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

export const handleRegister = async (e: React.FormEvent) => {
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
