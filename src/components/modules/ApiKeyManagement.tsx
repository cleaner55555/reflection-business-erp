'use client'

import { useEffect, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'
import {
  Key,
  Plus,
  Copy,
  Trash2,
  AlertTriangle,
  Shield,
  Code,
  ExternalLink,
  Loader2,
  Check,
  X,
} from 'lucide-react'

import { useAppStore } from '@/lib/store'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Separator } from '@/components/ui/separator'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Calendar } from '@/components/ui/calendar'

// ============ TYPES ============

interface ApiKeyItem {
  id: string
  name: string
  key: string
  permissions: string
  lastUsedAt: string | null
  expiresAt: string | null
  isActive: boolean
  createdAt: string
  updatedAt: string
  user: {
    id: string
    email: string
    firstName: string
    lastName: string
  } | null
}

interface UserOption {
  id: string
  email: string
  firstName: string
  lastName: string
}

interface NewKeyForm {
  name: string
  userId: string
  permissions: string[]
  expiresAt: Date | undefined
}

// ============ HELPERS ============

function maskKey(key: string): string {
  if (!key) return ''
  if (key.includes('...')) return key // already masked
  return `${key.substring(0, 8)}...${key.substring(key.length - 4)}`
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString('sr-Latn-RS', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

function isExpiringSoon(dateStr: string | null): boolean {
  if (!dateStr) return false
  const now = new Date()
  const expires = new Date(dateStr)
  const diffDays = Math.ceil((expires.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
  return diffDays > 0 && diffDays <= 7
}

function isExpired(dateStr: string | null): boolean {
  if (!dateStr) return false
  return new Date(dateStr) < new Date()
}

// ============ ANIMATION VARIANTS ============

const fadeInUp = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
}

const staggerContainer = {
  animate: { transition: { staggerChildren: 0.05 } },
}

const scaleIn = {
  initial: { opacity: 0, scale: 0.95 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.95 },
}

// ============ MAIN COMPONENT ============

export function ApiKeyManagement() {
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

  return (
    <div className="space-y-6">
      {/* ============ HEADER ============ */}
      <motion.div {...fadeInUp} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Key className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">API Ključevi</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Upravljajte API ključevima za integracije sa spoljnim sistemima
            </p>
          </div>
        </div>
        <Button
          onClick={() => setCreateDialogOpen(true)}
          className="shrink-0 gap-2"
        >
          <Plus className="h-4 w-4" />
          Novi API ključ
        </Button>
      </motion.div>

      {/* ============ INFO CARD ============ */}
      <motion.div {...fadeInUp} transition={{ delay: 0.05 }}>
        <Card>
          <CardHeader className="pb-4">
            <div className="flex items-center gap-2">
              <Code className="h-4 w-4 text-muted-foreground" />
              <CardTitle className="text-base">API Dokumentacija</CardTitle>
            </div>
            <CardDescription>
              Koristite API ključeve za pristup REST API-ju sistema
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
              <span className="text-sm font-medium text-muted-foreground shrink-0">Base URL:</span>
              <div className="flex items-center gap-2">
                <code className="rounded-md bg-muted px-3 py-1.5 text-sm font-mono text-foreground">
                  /api/v1/
                </code>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 shrink-0"
                  onClick={() => copyToClipboard('/api/v1/', 'base-url')}
                >
                  {copiedId === 'base-url' ? (
                    <Check className="h-3.5 w-3.5 text-green-500" />
                  ) : (
                    <Copy className="h-3.5 w-3.5" />
                  )}
                </Button>
              </div>
            </div>
            <Separator />
            <div className="space-y-2">
              <span className="text-sm font-medium text-muted-foreground">Primer zahteva:</span>
              <div className="relative">
                <pre className="overflow-x-auto rounded-lg bg-muted/80 border p-4 text-sm font-mono leading-relaxed">
                  <code>
                    curl -H <span className="text-green-600 dark:text-green-400">&quot;Authorization: Bearer rb_xxxxx&quot;</span> {'\n'}
                    {'  '}https://your-domain.com/api/v1/partners
                  </code>
                </pre>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-2 right-2 h-7 w-7 shrink-0"
                  onClick={() =>
                    copyToClipboard(
                      'curl -H "Authorization: Bearer rb_xxxxx" https://your-domain.com/api/v1/partners',
                      'curl-example'
                    )
                  }
                >
                  {copiedId === 'curl-example' ? (
                    <Check className="h-3.5 w-3.5 text-green-500" />
                  ) : (
                    <Copy className="h-3.5 w-3.5" />
                  )}
                </Button>
              </div>
            </div>
            <div className="flex flex-wrap gap-2 pt-1">
              <Badge variant="outline" className="gap-1 text-xs">
                <Shield className="h-3 w-3" />
                HTTPS enkripcija
              </Badge>
              <Badge variant="outline" className="gap-1 text-xs">
                <Key className="h-3 w-3" />
                Bearer token autentikacija
              </Badge>
              <Badge variant="outline" className="gap-1 text-xs">
                <ExternalLink className="h-3 w-3" />
                RESTful API
              </Badge>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* ============ KEYS TABLE ============ */}
      <motion.div {...fadeInUp} transition={{ delay: 0.1 }}>
        <Card>
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base">Aktivni ključevi</CardTitle>
                <CardDescription className="mt-1">
                  {loading
                    ? 'Učitavanje...'
                    : `${apiKeys.length} API ključeva`}
                </CardDescription>
              </div>
              {!loading && apiKeys.length > 0 && (
                <Badge variant="secondary" className="text-xs">
                  {apiKeys.filter((k) => k.isActive && !isExpired(k.expiresAt)).length} aktivnih
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-4 animate-pulse">
                    <div className="h-4 w-32 bg-muted rounded" />
                    <div className="h-4 w-40 bg-muted rounded" />
                    <div className="h-4 w-28 bg-muted rounded" />
                    <div className="h-4 w-20 bg-muted rounded ml-auto" />
                  </div>
                ))}
              </div>
            ) : apiKeys.length === 0 ? (
              <motion.div
                {...scaleIn}
                className="flex flex-col items-center justify-center py-12 text-center"
              >
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted/50 mb-4">
                  <Key className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-sm font-medium text-foreground">Nema API ključeva</h3>
                <p className="text-sm text-muted-foreground mt-1 max-w-sm">
                  Kreirajte vaš prvi API ključ da biste započeli integraciju sa spoljnim sistemima.
                </p>
                <Button
                  variant="outline"
                  className="mt-4 gap-2"
                  onClick={() => setCreateDialogOpen(true)}
                >
                  <Plus className="h-4 w-4" />
                  Kreirajte prvi ključ
                </Button>
              </motion.div>
            ) : (
              <div className="overflow-x-auto -mx-6">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="min-w-[140px]">Naziv</TableHead>
                      <TableHead className="min-w-[180px]">Ključ</TableHead>
                      <TableHead className="min-w-[180px]">Kreirao</TableHead>
                      <TableHead className="min-w-[130px]">Poslednje korišćenje</TableHead>
                      <TableHead className="min-w-[130px]">Ističe</TableHead>
                      <TableHead className="min-w-[100px]">Status</TableHead>
                      <TableHead className="w-[80px] text-right">Akcije</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <AnimatePresence mode="popLayout">
                      {apiKeys.map((apiKey) => {
                        const expired = isExpired(apiKey.expiresAt)
                        const expiringSoon = isExpiringSoon(apiKey.expiresAt)
                        const status = !apiKey.isActive || expired
                          ? 'expired'
                          : expiringSoon
                            ? 'expiring'
                            : 'active'

                        return (
                          <motion.tr
                            key={apiKey.id}
                            {...fadeInUp}
                            layout
                            className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted"
                          >
                            <TableCell className="font-medium text-sm">
                              <div className="flex items-center gap-2">
                                <Key className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                                <span className="truncate max-w-[160px]">{apiKey.name}</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-1.5">
                                <code className="rounded bg-muted px-2 py-0.5 text-xs font-mono select-all">
                                  {maskKey(apiKey.key)}
                                </code>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-6 w-6 shrink-0"
                                  onClick={() => copyToClipboard(maskKey(apiKey.key), apiKey.id)}
                                >
                                  {copiedId === apiKey.id ? (
                                    <Check className="h-3 w-3 text-green-500" />
                                  ) : (
                                    <Copy className="h-3 w-3" />
                                  )}
                                </Button>
                              </div>
                            </TableCell>
                            <TableCell className="text-sm text-muted-foreground">
                              {apiKey.user ? (
                                <span>
                                  {apiKey.user.firstName} {apiKey.user.lastName}
                                  <span className="block text-xs text-muted-foreground/70">
                                    {apiKey.user.email}
                                  </span>
                                </span>
                              ) : (
                                <span className="text-xs text-muted-foreground/50">—</span>
                              )}
                            </TableCell>
                            <TableCell className="text-sm text-muted-foreground">
                              {formatDate(apiKey.lastUsedAt)}
                            </TableCell>
                            <TableCell>
                              <span className={`text-sm ${expiringSoon && !expired ? 'text-amber-600 dark:text-amber-400 font-medium' : 'text-muted-foreground'}`}>
                                {formatDate(apiKey.expiresAt)}
                              </span>
                              {expiringSoon && !expired && (
                                <span className="ml-1.5 text-xs text-amber-600 dark:text-amber-400">
                                  (uskoro)
                                </span>
                              )}
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant={status === 'active' ? 'default' : status === 'expiring' ? 'outline' : 'destructive'}
                                className={
                                  status === 'expiring'
                                    ? 'border-amber-500/50 text-amber-600 dark:text-amber-400'
                                    : ''
                                }
                              >
                                {status === 'active' ? 'Aktivan' : status === 'expiring' ? 'Ističe uskoro' : 'Istekao'}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-muted-foreground hover:text-destructive shrink-0"
                                onClick={() => {
                                  setRevokingKey(apiKey)
                                  setRevokeDialogOpen(true)
                                }}
                                aria-label={`Obriši ključ ${apiKey.name}`}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </motion.tr>
                        )
                      })}
                    </AnimatePresence>
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* ============ CREATE KEY DIALOG ============ */}
      <Dialog open={createDialogOpen} onOpenChange={(open) => {
        if (!open) {
          setCreateDialogOpen(false)
          setNewKey(null)
          setForm({ name: '', userId: '', permissions: ['read'], expiresAt: undefined })
        }
      }}>
        <DialogContent className="sm:max-w-[500px]">
          <AnimatePresence mode="wait">
            {newKey ? (
              /* ---- NEW KEY REVEALED ---- */
              <motion.div
                key="reveal"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
              >
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <Check className="h-5 w-5 text-green-500" />
                    API ključ kreiran
                  </DialogTitle>
                  <DialogDescription>
                    Uspešno ste kreirali novi API ključ.
                  </DialogDescription>
                </DialogHeader>

                <div className="mt-4 space-y-4">
                  <Alert className="border-amber-500/50 bg-amber-50 dark:bg-amber-950/20">
                    <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                    <AlertDescription className="text-amber-800 dark:text-amber-200 text-sm font-medium">
                      Sačuvajte ovaj ključ! Nećete ga moći videti ponovo.
                    </AlertDescription>
                  </Alert>

                  <div className="space-y-2">
                    <Label className="text-sm text-muted-foreground">Vaš API ključ:</Label>
                    <div className="relative">
                      <pre className="overflow-x-auto rounded-lg bg-muted border p-3 text-sm font-mono break-all pr-12">
                        {newKey}
                      </pre>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="absolute top-2 right-2 h-7 w-7"
                        onClick={() => copyToClipboard(newKey, 'new-key')}
                      >
                        {copiedId === 'new-key' ? (
                          <Check className="h-3.5 w-3.5 text-green-500" />
                        ) : (
                          <Copy className="h-3.5 w-3.5" />
                        )}
                      </Button>
                    </div>
                  </div>
                </div>

                <DialogFooter className="mt-6">
                  <Button onClick={() => {
                    setNewKey(null)
                    setCreateDialogOpen(false)
                  }}>
                    Zatvori
                  </Button>
                </DialogFooter>
              </motion.div>
            ) : (
              /* ---- CREATE FORM ---- */
              <motion.div
                key="form"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
              >
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <Key className="h-5 w-5 text-primary" />
                    Novi API ključ
                  </DialogTitle>
                  <DialogDescription>
                    Kreirajte novi API ključ za pristup REST API-ju.
                  </DialogDescription>
                </DialogHeader>

                <div className="mt-4 space-y-5">
                  {/* Name */}
                  <div className="space-y-2">
                    <Label htmlFor="key-name">Naziv</Label>
                    <Input
                      id="key-name"
                      placeholder="npr. WooCommerce integracija"
                      value={form.name}
                      onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
                      disabled={creating}
                    />
                  </div>

                  {/* User select */}
                  <div className="space-y-2">
                    <Label htmlFor="key-user">Korisnik</Label>
                    <Select
                      value={form.userId}
                      onValueChange={(val) => setForm((prev) => ({ ...prev, userId: val }))}
                      disabled={usersLoading || creating}
                    >
                      <SelectTrigger id="key-user">
                        <SelectValue placeholder={usersLoading ? 'Učitavanje...' : 'Izaberite korisnika'} />
                      </SelectTrigger>
                      <SelectContent>
                        {users.map((user) => (
                          <SelectItem key={user.id} value={user.id}>
                            <span className="flex items-center gap-2">
                              <span>{user.firstName} {user.lastName}</span>
                              <span className="text-xs text-muted-foreground">({user.email})</span>
                            </span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Permissions */}
                  <div className="space-y-3">
                    <Label>Dozvole</Label>
                    <div className="flex flex-wrap gap-4">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <Checkbox
                          checked={form.permissions.includes('read')}
                          onCheckedChange={(checked) => {
                            setForm((prev) => ({
                              ...prev,
                              permissions: checked
                                ? [...prev.permissions, 'read']
                                : prev.permissions.filter((p) => p !== 'read'),
                            }))
                          }}
                          disabled={creating}
                        />
                        <span className="text-sm">Čitanje (read)</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <Checkbox
                          checked={form.permissions.includes('write')}
                          onCheckedChange={(checked) => {
                            setForm((prev) => ({
                              ...prev,
                              permissions: checked
                                ? [...prev.permissions, 'write']
                                : prev.permissions.filter((p) => p !== 'write'),
                            }))
                          }}
                          disabled={creating}
                        />
                        <span className="text-sm">Pisanje (write)</span>
                      </label>
                    </div>
                  </div>

                  {/* Expiration date */}
                  <div className="space-y-2">
                    <Label>Ističe (opcionalno)</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full justify-start text-left font-normal"
                          disabled={creating}
                        >
                          {form.expiresAt ? (
                            formatDate(form.expiresAt.toISOString())
                          ) : (
                            <span className="text-muted-foreground">Bez roka važenja</span>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={form.expiresAt}
                          onSelect={(date) => setForm((prev) => ({ ...prev, expiresAt: date }))}
                          disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                          initialFocus
                        />
                        {form.expiresAt && (
                          <div className="border-t px-3 py-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="w-full text-xs"
                              onClick={() => setForm((prev) => ({ ...prev, expiresAt: undefined }))}
                            >
                              <X className="h-3 w-3 mr-1" />
                              Ukloni datum
                            </Button>
                          </div>
                        )}
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>

                <DialogFooter className="mt-6 gap-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setCreateDialogOpen(false)
                      setForm({ name: '', userId: '', permissions: ['read'], expiresAt: undefined })
                    }}
                    disabled={creating}
                  >
                    Otkaži
                  </Button>
                  <Button onClick={handleCreateKey} disabled={creating || !form.name.trim() || !form.userId}>
                    {creating ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Kreiranje...
                      </>
                    ) : (
                      <>
                        <Key className="h-4 w-4 mr-2" />
                        Kreiraj ključ
                      </>
                    )}
                  </Button>
                </DialogFooter>
              </motion.div>
            )}
          </AnimatePresence>
        </DialogContent>
      </Dialog>

      {/* ============ REVOKE CONFIRMATION ============ */}
      <AlertDialog open={revokeDialogOpen} onOpenChange={setRevokeDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              Obrišite API ključ
            </AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-3">
                <p>
                  Da li ste sigurni da želite da obrišete API ključ{' '}
                  <span className="font-semibold text-foreground">
                    &quot;{revokingKey?.name}&quot;
                  </span>
                  ?
                </p>
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription className="text-sm">
                    Ova akcija je nepovratna. Sve aplikacije koje koriste ovaj ključ
                    više neće moći da pristupe API-ju.
                  </AlertDescription>
                </Alert>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={revoking}>Otkaži</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRevokeKey}
              disabled={revoking}
              className="bg-destructive text-white hover:bg-destructive/90 focus:ring-destructive/30"
            >
              {revoking ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Brisanje...
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Obriši ključ
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
