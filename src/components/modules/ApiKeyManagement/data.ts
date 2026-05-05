export const now = new Date();

export const expires = new Date(dateStr);

export const diffDays = Math.ceil((expires.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

export const fadeInUp = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
}

export const staggerContainer = {
  animate: { transition: { staggerChildren: 0.05 } },
}

export const scaleIn = {
  initial: { opacity: 0, scale: 0.95 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.95 },
}

export const activeCompanyId = useAppStore((s) => s.activeCompanyId);

export const currentUser = useAppStore((s) => s.currentUser);

export const res = await fetch('/api/api-keys', {
        headers: { 'x-company-id': activeCompanyId },
      });

export const data = await res.json();

export const res = await fetch('/api/users', {
        headers: { 'x-company-id': activeCompanyId },
      });

export const data = await res.json();

export const handleCreateKey = async () => {
    if (!form.name.trim()) {
      toast.error('Naziv je obavezan')
      return
    }
    if (!form.userId) {
      toast.error('Korisnik je obavezan')
      return
    }
    if (!activeCompanyId) return

    setCreating(true)
    try {
      const res = await fetch('/api/api-keys', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-company-id': activeCompanyId,
        },
        body: JSON.stringify({
          name: form.name.trim(),
          userId: form.userId,
          permissions: form.permissions,
          expiresAt: form.expiresAt ? form.expiresAt.toISOString() : null,
        }),
      })

      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'Greška pri kreiranju')
      }

      const data = await res.json()
      setNewKey(data.key) // show full key
      setForm({ name: '', userId: '', permissions: ['read'], expiresAt: undefined })
      await fetchApiKeys()
      toast.success('API ključ je uspešno kreiran')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Greška pri kreiranju API ključa')
    } finally {
      setCreating(false)
    }
  }

export const handleRevokeKey = async () => {
    if (!revokingKey || !activeCompanyId) return

    setRevoking(true)
    try {
      const res = await fetch(`/api/api-keys?id=${revokingKey.id}`, {
        method: 'DELETE',
        headers: { 'x-company-id': activeCompanyId },
      })
      if (!res.ok) throw new Error('Greška pri brisanju')
      toast.success(`API ključ "${revokingKey.name}" je obrisan`)
      setRevokingKey(null)
      setRevokeDialogOpen(false)
      await fetchApiKeys()
    } catch {
      toast.error('Greška pri brisanju API ključa')
    } finally {
      setRevoking(false)
    }
  }

export const copyToClipboard = async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedId(id)
      toast.success('Kopirano u clipboard')
      setTimeout(() => setCopiedId(null), 2000)
    } catch {
      toast.error('Greška pri kopiranju')
    }
  }

export const expired = isExpired(apiKey.expiresAt);

export const expiringSoon = isExpiringSoon(apiKey.expiresAt);

export const status = !apiKey.isActive || expired;

export function maskKey(key: string): string {
  if (!key) return ''
  if (key.includes('...')) return key // already masked
  return `${key.substring(0, 8)}...${key.substring(key.length - 4)}`
}

export function formatDate(dateStr: string | null): string {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString('sr-Latn-RS', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

export function isExpiringSoon(dateStr: string | null): boolean {
  if (!dateStr) return false
  const now = new Date()
  const expires = new Date(dateStr)
  const diffDays = Math.ceil((expires.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
  return diffDays > 0 && diffDays <= 7
}

export function isExpired(dateStr: string | null): boolean {
  if (!dateStr) return false
  return new Date(dateStr) < new Date()
}
