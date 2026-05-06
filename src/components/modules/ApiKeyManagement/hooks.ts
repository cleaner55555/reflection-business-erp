import { useState, useEffect, useCallback, useMemo } from 'react'

export function useApiKeyManagement() {
  const activeCompanyId = useAppStore((s) => s.activeCompanyId)
  const currentUser = useAppStore((s) => s.currentUser)

  // Data state
  const [apiKeys, setApiKeys] = useState<ApiKeyItem[]>([])
  const [users, setUsers] = useState<UserOption[]>([])
  const [loading, setLoading] = useState(true)
  const [usersLoading, setUsersLoading] = useState(true)

  // Dialog state
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [creating, setCreating] = useState(false)
  const [newKey, setNewKey] = useState<string | null>(null)

  // Revoke state
  const [revokeDialogOpen, setRevokeDialogOpen] = useState(false)
  const [revokingKey, setRevokingKey] = useState<ApiKeyItem | null>(null)
  const [revoking, setRevoking] = useState(false)

  // Form state
  const [form, setForm] = useState<NewKeyForm>({
    name: '',
    userId: '',
    permissions: ['read'],
    expiresAt: undefined,
  })

  // Copy state
  const [copiedId, setCopiedId] = useState<string | null>(null)

  // ============ FETCH API KEYS ============

  const fetchApiKeys = useCallback(async () => {
    if (!activeCompanyId) return
    setLoading(true)
    try {
      const res = await fetch('/api/api-keys', {
        headers: { 'x-company-id': activeCompanyId },
      })
      if (!res.ok) throw new Error('Greška pri učitavanju')
      const data = await res.json()
      setApiKeys(data)
    } catch {
      toast.error('Greška pri učitavanju API ključeva')
    } finally {
      setLoading(false)
    }
  }, [activeCompanyId])

  // ============ FETCH USERS ============

  const fetchUsers = useCallback(async () => {
    if (!activeCompanyId) return
    setUsersLoading(true)
    try {
      const res = await fetch('/api/users', {
        headers: { 'x-company-id': activeCompanyId },
      })
      if (!res.ok) throw new Error('Greška pri učitavanju')
      const data = await res.json()
      setUsers(
        data.map((u: UserOption) => ({
          id: u.id,
          email: u.email,
          firstName: u.firstName,
          lastName: u.lastName,
        }))
      )
    } catch {
      toast.error('Greška pri učitavanju korisnika')
    } finally {
      setUsersLoading(false)
    }
  }, [activeCompanyId])

  useEffect(() => {
    fetchApiKeys()
    fetchUsers()
  }, [fetchApiKeys, fetchUsers])

  // ============ CREATE KEY ============

  const handleCreateKey = async () => {
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

  // ============ REVOKE KEY ============

  const handleRevokeKey = async () => {
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

  // ============ COPY TO CLIPBOARD ============

  const copyToClipboard = async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedId(id)
      toast.success('Kopirano u clipboard')
      setTimeout(() => setCopiedId(null), 2000)
    } catch {
      toast.error('Greška pri kopiranju')
    }
  }

  // ============ RENDER ============

  return {
    apiKeys,
    createDialogOpen,
    creating,
    expiringSoon,
    handleCreateKey,
    handleRevokeKey,
    i,
    loading,
    newKey,
    revokeDialogOpen,
    revoking,
    revokingKey,
    setRevokeDialogOpen,
    users,
    usersLoading,
  }
}
