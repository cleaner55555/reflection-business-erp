'use client'

import { useEffect, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'
  Users,
  Plus,
  MoreHorizontal,
  Pencil,
  Shield,
  Trash2,
  UserMinus,
  Loader2,
  Mail,
  UserCircle,
  Building2,
  Clock,
  Search,
} from 'lucide-react'

import { useAppStore } from '@/lib/store'
import { cn } from '@/lib/utils'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'

// ============ TYPES ============

interface Role {
  id: string
  name: string
  displayName: string
  description?: string
}

interface CompanyUser {
  id: string
  email: string
  firstName: string
  lastName: string
  avatar?: string | null
  phone?: string | null
  jobTitle?: string | null
  roleName: string
  roleDisplayName: string
  roleId: string
  isActive: boolean
  lastLoginAt?: string | null
}

interface NewUserForm {
  email: string
  firstName: string
  lastName: string
  password: string
  phone: string
  roleId: string
  jobTitle: string
}

// ============ CONSTANTS ============

const EMPTY_FORM: NewUserForm = {
  email: '',
  firstName: '',
  lastName: '',
  password: '',
  phone: '',
  roleId: '',
  jobTitle: '',
}

const ROLE_COLORS: Record<string, string> = {
  admin: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  superadmin: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  manager: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  employee: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  accountant: 'bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400',
  viewer: 'bg-slate-100 text-slate-600 dark:bg-slate-800/40 dark:text-slate-400',
}

function getRoleBadgeClasses(roleName: string): string {
  const key = roleName.toLowerCase()
  return ROLE_COLORS[key] || 'bg-slate-100 text-slate-600 dark:bg-slate-800/40 dark:text-slate-400'
}

function getInitials(firstName: string, lastName: string): string {
  const f = firstName?.charAt(0)?.toUpperCase() || ''
  const l = lastName?.charAt(0)?.toUpperCase() || ''
  return `${f}${l}` || '?'
}

function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return '—'
  try {
    const date = new Date(dateStr)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return 'Upravo sada'
    if (diffMins < 60) return `Pre ${diffMins} min`
    if (diffHours < 24) return `Pre ${diffHours} h`
    if (diffDays < 7) return `Pre ${diffDays} d`

    return date.toLocaleDateString('sr-Latn', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    })
  } catch {
    return '—'
  }
}

// ============ ANIMATION VARIANTS ============

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -10 },
  transition: { duration: 0.3, ease: 'easeOut' },
}

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.04,
    },
  },
}

const rowVariant = {
  initial: { opacity: 0, x: -12 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: 12 },
}

// ============ LOADING SKELETON ============

function UsersTableSkeleton() {
  return (
    <Card>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="pl-4">Ime i prezime</TableHead>
              <TableHead>Uloga</TableHead>
              <TableHead className="hidden md:table-cell">Radno mesto</TableHead>
              <TableHead className="hidden lg:table-cell">Poslednja prijava</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="pr-4 text-right">Akcije</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: 6 }).map((_, i) => (
              <TableRow key={i}>
                <TableCell className="pl-4">
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-9 w-9 rounded-full" />
                    <div className="space-y-1.5">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-48" />
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Skeleton className="h-5 w-20 rounded-full" />
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  <Skeleton className="h-4 w-28" />
                </TableCell>
                <TableCell className="hidden lg:table-cell">
                  <Skeleton className="h-4 w-24" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-5 w-16 rounded-full" />
                </TableCell>
                <TableCell className="pr-4 text-right">
                  <Skeleton className="ml-auto h-8 w-8 rounded-md" />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}

// ============ EMPTY STATE ============

function EmptyState({ onAdd }: { onAdd: () => void }) {
  return (
    <motion.div
      {...fadeInUp}
      className="flex flex-col items-center justify-center py-16 px-4"
    >
      <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-muted mb-6">
        <Users className="h-10 w-10 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-semibold text-foreground mb-2">
        Nema korisnika
      </h3>
      <p className="text-sm text-muted-foreground text-center max-w-sm mb-6">
        Još niste dodali nijednog korisnika u ovu kompaniju. Dodajte prvog korisnika
        da biste počeli sa radom.
      </p>
      <Button onClick={onAdd} className="gap-2">
        <Plus className="h-4 w-4" />
        Dodaj korisnika
      </Button>
    </motion.div>
  )
}

// ============ MAIN COMPONENT ============

export function UserManagement() {
  const activeCompanyId = useAppStore((s) => s.activeCompanyId)

  // Data state
  const [users, setUsers] = useState<CompanyUser[]>([])
  const [roles, setRoles] = useState<Role[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')

  // Dialog state
  const [addDialogOpen, setAddDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)

  // Form state
  const [addForm, setAddForm] = useState<NewUserForm>({ ...EMPTY_FORM })
  const [addSubmitting, setAddSubmitting] = useState(false)

  // Edit role state
  const [editingUser, setEditingUser] = useState<CompanyUser | null>(null)
  const [editRoleId, setEditRoleId] = useState('')
  const [editSubmitting, setEditSubmitting] = useState(false)

  // Delete state
  const [deletingUser, setDeletingUser] = useState<CompanyUser | null>(null)
  const [deleteSubmitting, setDeleteSubmitting] = useState(false)

  // Deactivate state
  const [deactivatingUser, setDeactivatingUser] = useState<CompanyUser | null>(null)

  // ============ HELPERS ============

  const headers = useCallback(
    () => ({
      'Content-Type': 'application/json',
      'x-company-id': activeCompanyId || '',
    }),
    [activeCompanyId]
  )

  // ============ FETCH DATA ============

  const fetchUsers = useCallback(async () => {
    if (!activeCompanyId) return
    try {
      const res = await fetch(
        `/api/users?companyId=${activeCompanyId}`,
        { headers: headers() }
      )
      if (!res.ok) throw new Error('Greška pri učitavanju korisnika')
      const data = await res.json()
      setUsers(Array.isArray(data) ? data : data.users || [])
    } catch (err) {
      console.error('Failed to fetch users:', err)
      toast.error('Greška pri učitavanju korisnika')
    } finally {
      setLoading(false)
    }
  }, [activeCompanyId, headers])

  const fetchRoles = useCallback(async () => {
    try {
      const res = await fetch('/api/roles', { headers: headers() })
      if (!res.ok) throw new Error('Greška pri učitavanju uloga')
      const data = await res.json()
      setRoles(Array.isArray(data) ? data : data.roles || [])
    } catch (err) {
      console.error('Failed to fetch roles:', err)
      toast.error('Greška pri učitavanju uloga')
    }
  }, [headers])

  useEffect(() => {
    setLoading(true)
    fetchUsers()
    fetchRoles()
  }, [fetchUsers, fetchRoles])

  // ============ ADD USER ============

  const handleAddUser = async () => {
    if (!addForm.email || !addForm.firstName || !addForm.lastName || !addForm.roleId) {
      toast.error('Popunite obavezna polja: email, ime, prezime i uloga')
      return
    }

    setAddSubmitting(true)
    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: headers(),
        body: JSON.stringify(addForm),
      })
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}))
        throw new Error(errData.error || errData.message || 'Greška pri dodavanju korisnika')
      }

      toast.success(`Korisnik ${addForm.firstName} ${addForm.lastName} je uspešno dodat`)
      setAddForm({ ...EMPTY_FORM })
      setAddDialogOpen(false)
      fetchUsers()
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Greška pri dodavanju korisnika'
      toast.error(message)
    } finally {
      setAddSubmitting(false)
    }
  }

  // ============ EDIT ROLE ============

  const openEditDialog = (user: CompanyUser) => {
    setEditingUser(user)
    setEditRoleId(user.roleId)
    setEditDialogOpen(true)
  }

  const handleEditRole = async () => {
    if (!editingUser || !editRoleId) return

    setEditSubmitting(true)
    try {
      const res = await fetch('/api/users', {
        method: 'PUT',
        headers: headers(),
        body: JSON.stringify({
          userId: editingUser.id,
          roleId: editRoleId,
        }),
      })
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}))
        throw new Error(errData.error || errData.message || 'Greška pri izmeni uloge')
      }

      toast.success(`Uloga za ${editingUser.firstName} ${editingUser.lastName} je uspešno izmenjena`)
      setEditDialogOpen(false)
      setEditingUser(null)
      fetchUsers()
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Greška pri izmeni uloge'
      toast.error(message)
    } finally {
      setEditSubmitting(false)
    }
  }

  // ============ TOGGLE ACTIVE ============

  const handleToggleActive = async (user: CompanyUser) => {
    setDeactivatingUser(user)
    try {
      const res = await fetch('/api/users', {
        method: 'PUT',
        headers: headers(),
        body: JSON.stringify({
          userId: user.id,
          isActive: !user.isActive,
        }),
      })
      if (!res.ok) throw new Error('Greška')

      toast.success(
        user.isActive
          ? `Korisnik ${user.firstName} ${user.lastName} je deaktiviran`
          : `Korisnik ${user.firstName} ${user.lastName} je aktiviran`
      )
      fetchUsers()
    } catch {
      toast.error('Greška pri promeni statusa korisnika')
    } finally {
      setDeactivatingUser(null)
    }
  }

  // ============ DELETE USER ============

  const openDeleteDialog = (user: CompanyUser) => {
    setDeletingUser(user)
    setDeleteDialogOpen(true)
  }

  const handleDeleteUser = async () => {
    if (!deletingUser) return

    setDeleteSubmitting(true)
    try {
      const res = await fetch(
        `/api/users?userId=${deletingUser.id}&companyId=${activeCompanyId}`,
        {
          method: 'DELETE',
          headers: headers(),
        }
      )
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}))
        throw new Error(errData.error || errData.message || 'Greška pri brisanju korisnika')
      }

      toast.success(`Korisnik ${deletingUser.firstName} ${deletingUser.lastName} je uspešno obrisan`)
      setDeleteDialogOpen(false)
      setDeletingUser(null)
      fetchUsers()
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Greška pri brisanju korisnika'
      toast.error(message)
    } finally {
      setDeleteSubmitting(false)
    }
  }

  // ============ FILTERED USERS ============

  const filteredUsers = users.filter((u) => {
    if (!searchQuery.trim()) return true
    const q = searchQuery.toLowerCase()
    return (
      u.firstName?.toLowerCase().includes(q) ||
      u.lastName?.toLowerCase().includes(q) ||
      u.email?.toLowerCase().includes(q) ||
      u.roleDisplayName?.toLowerCase().includes(q) ||
      u.jobTitle?.toLowerCase().includes(q)
    )
  })

  // ============ RENDER ============

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div {...fadeInUp} className="flex items-start gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <Users className="h-6 w-6" />
        </div>
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Korisnici
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Upravljajte korisnicima i njihovim pravima pristupa
          </p>
        </div>
        <Button onClick={() => setAddDialogOpen(true)} className="gap-2 shrink-0">
          <Plus className="h-4 w-4" />
          <span className="hidden sm:inline">Dodaj korisnika</span>
        </Button>
      </motion.div>

      {/* Search + Stats */}
      <motion.div
        {...fadeInUp}
        transition={{ ...fadeInUp.transition, delay: 0.05 }}
        className="flex flex-col sm:flex-row gap-3"
      >
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Pretraži korisnike..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="text-xs">
            <Users className="h-3 w-3 mr-1" />
            {users.length} ukupno
          </Badge>
          <Badge variant="secondary" className="text-xs text-emerald-600">
            {users.filter((u) => u.isActive).length} aktivnih
          </Badge>
        </div>
      </motion.div>

      {/* Users Table or Loading or Empty */}
      {loading ? (
        <UsersTableSkeleton />
      ) : filteredUsers.length === 0 && !searchQuery ? (
        <EmptyState onAdd={() => setAddDialogOpen(true)} />
      ) : (
        <motion.div
          variants={staggerContainer}
          initial="initial"
          animate="animate"
        >
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="pl-4">Ime i prezime</TableHead>
                    <TableHead>Uloga</TableHead>
                    <TableHead className="hidden md:table-cell">Radno mesto</TableHead>
                    <TableHead className="hidden lg:table-cell">Poslednja prijava</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="pr-4 text-right">Akcije</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <AnimatePresence mode="popLayout">
                    {filteredUsers.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">
                          Nema rezultata za &quot;{searchQuery}&quot;
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredUsers.map((user) => (
                        <motion.tr
                          key={user.id}
                          variants={rowVariant}
                          initial="initial"
                          animate="animate"
                          exit="exit"
                          transition={{ duration: 0.2 }}
                          className="hover:bg-muted/50 border-b transition-colors"
                        >
                          {/* Name + Avatar */}
                          <TableCell className="pl-4">
                            <div className="flex items-center gap-3">
                              <Avatar className="h-9 w-9">
                                <AvatarImage src={user.avatar || undefined} alt={`${user.firstName} ${user.lastName}`} />
                                <AvatarFallback className="text-xs font-semibold">
                                  {getInitials(user.firstName, user.lastName)}
                                </AvatarFallback>
                              </Avatar>
                              <div className="min-w-0">
                                <p className="text-sm font-medium text-foreground truncate">
                                  {user.firstName} {user.lastName}
                                </p>
                                <p className="text-xs text-muted-foreground truncate">
                                  {user.email}
                                </p>
                              </div>
                            </div>
                          </TableCell>

                          {/* Role */}
                          <TableCell>
                            <Badge
                              variant="secondary"
                              className={cn('text-xs font-medium', getRoleBadgeClasses(user.roleName))}
                            >
                              {user.roleDisplayName}
                            </Badge>
                          </TableCell>

                          {/* Job Title */}
                          <TableCell className="hidden md:table-cell">
                            <span className="text-sm text-muted-foreground">
                              {user.jobTitle || '—'}
                            </span>
                          </TableCell>

                          {/* Last Login */}
                          <TableCell className="hidden lg:table-cell">
                            <span className="text-sm text-muted-foreground flex items-center gap-1.5">
                              <Clock className="h-3.5 w-3.5 shrink-0" />
                              {formatDate(user.lastLoginAt)}
                            </span>
                          </TableCell>

                          {/* Status */}
                          <TableCell>
                            <Badge
                              variant={user.isActive ? 'default' : 'outline'}
                              className={cn(
                                'text-xs font-medium',
                                user.isActive
                                  ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800'
                                  : 'text-muted-foreground'
                              )}
                            >
                              {user.isActive ? 'Aktivan' : 'Neaktivan'}
                            </Badge>
                          </TableCell>

                          {/* Actions */}
                          <TableCell className="pr-4 text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                  <MoreHorizontal className="h-4 w-4" />
                                  <span className="sr-only">Otvori meni</span>
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-48">
                                <DropdownMenuLabel>
                                  {user.firstName} {user.lastName}
                                </DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={() => openEditDialog(user)}>
                                  <Shield className="h-4 w-4 mr-2" />
                                  Promeni ulogu
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => handleToggleActive(user)}
                                  disabled={deactivatingUser?.id === user.id}
                                >
                                  {deactivatingUser?.id === user.id ? (
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                  ) : (
                                    <UserMinus className="h-4 w-4 mr-2" />
                                  )}
                                  {user.isActive ? 'Deaktiviraj' : 'Aktiviraj'}
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  variant="destructive"
                                  onClick={() => openDeleteDialog(user)}
                                >
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Obriši korisnika
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </motion.tr>
                      ))
                    )}
                  </AnimatePresence>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* ============ ADD USER DIALOG ============ */}

      <Dialog open={addDialogOpen} onOpenChange={(open) => {
        if (!open) {
          setAddForm({ ...EMPTY_FORM })
        }
        setAddDialogOpen(open)
      }}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5 text-primary" />
              Dodaj novog korisnika
            </DialogTitle>
            <DialogDescription>
              Popunite podatke da biste dodali novog korisnika u kompaniju.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-2">
            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="add-email" className="flex items-center gap-1.5">
                <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                Email <span className="text-destructive">*</span>
              </Label>
              <Input
                id="add-email"
                type="email"
                placeholder="korisnik@firma.rs"
                value={addForm.email}
                onChange={(e) => setAddForm((p) => ({ ...p, email: e.target.value }))}
              />
            </div>

            {/* First + Last Name */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="add-firstName" className="flex items-center gap-1.5">
                  <UserCircle className="h-3.5 w-3.5 text-muted-foreground" />
                  Ime <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="add-firstName"
                  placeholder="Unesite ime"
                  value={addForm.firstName}
                  onChange={(e) => setAddForm((p) => ({ ...p, firstName: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="add-lastName" className="flex items-center gap-1.5">
                  <UserCircle className="h-3.5 w-3.5 text-muted-foreground" />
                  Prezime <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="add-lastName"
                  placeholder="Unesite prezime"
                  value={addForm.lastName}
                  onChange={(e) => setAddForm((p) => ({ ...p, lastName: e.target.value }))}
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-2">
              <Label htmlFor="add-password">
                Lozinka <span className="text-destructive">*</span>
              </Label>
              <Input
                id="add-password"
                type="password"
                placeholder="Minimalno 8 karaktera"
                value={addForm.password}
                onChange={(e) => setAddForm((p) => ({ ...p, password: e.target.value }))}
              />
              <p className="text-xs text-muted-foreground">
                Lozinka mora imati minimum 8 karaktera
              </p>
            </div>

            {/* Phone + Job Title */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="add-phone">Telefon</Label>
                <Input
                  id="add-phone"
                  type="tel"
                  placeholder="+381 6x xxx xxxx"
                  value={addForm.phone}
                  onChange={(e) => setAddForm((p) => ({ ...p, phone: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="add-jobTitle" className="flex items-center gap-1.5">
                  <Building2 className="h-3.5 w-3.5 text-muted-foreground" />
                  Radno mesto
                </Label>
                <Input
                  id="add-jobTitle"
                  placeholder="npr. Direktor"
                  value={addForm.jobTitle}
                  onChange={(e) => setAddForm((p) => ({ ...p, jobTitle: e.target.value }))}
                />
              </div>
            </div>

            {/* Role */}
            <div className="space-y-2">
              <Label className="flex items-center gap-1.5">
                <Shield className="h-3.5 w-3.5 text-muted-foreground" />
                Uloga <span className="text-destructive">*</span>
              </Label>
              <Select
                value={addForm.roleId}
                onValueChange={(val) => setAddForm((p) => ({ ...p, roleId: val }))}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Izaberite ulogu" />
                </SelectTrigger>
                <SelectContent>
                  {roles.length === 0 && (
                    <SelectItem value="_loading" disabled>
                      Učitavanje uloga...
                    </SelectItem>
                  )}
                  {roles.map((role) => (
                    <SelectItem key={role.id} value={role.id}>
                      <span className="flex items-center gap-2">
                        <Badge
                          variant="secondary"
                          className={cn('text-[10px] py-0 px-1.5', getRoleBadgeClasses(role.name))}
                        >
                          {role.displayName}
                        </Badge>
                        {role.description && (
                          <span className="text-xs text-muted-foreground">{role.description}</span>
                        )}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setAddForm({ ...EMPTY_FORM })
                setAddDialogOpen(false)
              }}
              disabled={addSubmitting}
            >
              Otkaži
            </Button>
            <Button onClick={handleAddUser} disabled={addSubmitting} className="gap-2">
              {addSubmitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Plus className="h-4 w-4" />
              )}
              Dodaj korisnika
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ============ EDIT ROLE DIALOG ============ */}

      <Dialog open={editDialogOpen} onOpenChange={(open) => {
        if (!open) {
          setEditingUser(null)
          setEditRoleId('')
        }
        setEditDialogOpen(open)
      }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              Promeni ulogu
            </DialogTitle>
            <DialogDescription>
              {editingUser && (
                <>
                  Izaberite novu ulogu za korisnika{' '}
                  <span className="font-medium text-foreground">
                    {editingUser.firstName} {editingUser.lastName}
                  </span>
                </>
              )}
            </DialogDescription>
          </DialogHeader>

          <div className="py-2">
            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 mb-4">
              <Avatar className="h-10 w-10">
                <AvatarImage src={editingUser?.avatar || undefined} />
                <AvatarFallback className="text-xs font-semibold">
                  {editingUser ? getInitials(editingUser.firstName, editingUser.lastName) : '?'}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <p className="text-sm font-medium">
                  {editingUser?.firstName} {editingUser?.lastName}
                </p>
                <p className="text-xs text-muted-foreground">{editingUser?.email}</p>
              </div>
              <Badge
                variant="secondary"
                className={cn(
                  'ml-auto text-xs shrink-0',
                  editingUser ? getRoleBadgeClasses(editingUser.roleName) : ''
                )}
              >
                {editingUser?.roleDisplayName}
              </Badge>
            </div>

            <div className="space-y-2">
              <Label>Nova uloga</Label>
              <Select value={editRoleId} onValueChange={setEditRoleId}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Izaberite ulogu" />
                </SelectTrigger>
                <SelectContent>
                  {roles.map((role) => (
                    <SelectItem key={role.id} value={role.id}>
                      {role.displayName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setEditDialogOpen(false)
                setEditingUser(null)
                setEditRoleId('')
              }}
              disabled={editSubmitting}
            >
              Otkaži
            </Button>
            <Button onClick={handleEditRole} disabled={editSubmitting || editRoleId === editingUser?.roleId} className="gap-2">
              {editSubmitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Pencil className="h-4 w-4" />
              )}
              Sačuvaj izmene
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ============ DELETE CONFIRMATION DIALOG ============ */}

      <AlertDialog open={deleteDialogOpen} onOpenChange={(open) => {
        if (!open) {
          setDeletingUser(null)
        }
        setDeleteDialogOpen(open)
      }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Trash2 className="h-5 w-5 text-destructive" />
              Potvrda brisanja
            </AlertDialogTitle>
            <AlertDialogDescription>
              {deletingUser && (
                <>
                  Da li ste sigurni da želite da obrišete korisnika{' '}
                  <span className="font-semibold text-foreground">
                    {deletingUser.firstName} {deletingUser.lastName}
                  </span>
                  ? Ova akcija je nepovratna i korisnik će biti trajno uklonjen iz
                  sistema.
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteSubmitting}>Otkaži</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault()
                handleDeleteUser()
              }}
              disabled={deleteSubmitting}
              className="bg-destructive text-white hover:bg-destructive/90 gap-2"
            >
              {deleteSubmitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Trash2 className="h-4 w-4" />
              )}
              Obriši korisnika
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
