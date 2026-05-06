'use client'

from '@/components/ui/alert-dialog'
from '@/components/ui/avatar'
from '@/components/ui/badge'
from '@/components/ui/button'
from '@/components/ui/card'
from '@/components/ui/dialog'
from '@/components/ui/dropdown-menu'
from '@/components/ui/input'
from '@/components/ui/label'
from '@/components/ui/select'
from '@/components/ui/skeleton'
from '@/components/ui/table'
import { , Plus, Users , Mail, Shield, Trash2} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import type { Role, CompanyUser, NewUserForm } from './types'

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

// ========== AlertDialogBlock2 ==========

export function AlertDialogBlock2({ deleteDialogOpen, deleteSubmitting, deletingUser }: { deleteDialogOpen: any, deleteSubmitting: any, deletingUser: any }) {
  return (
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
  )
}


// ========== DialogBlock1 ==========

export function DialogBlock1({ editDialogOpen, editRoleId, editSubmitting, editingUser, handleEditRole, roles, setEditRoleId }: { editDialogOpen: any, editRoleId: any, editSubmitting: any, editingUser: any, handleEditRole: any, roles: any, setEditRoleId: any }) {
  return (
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
  )
}


// ========== DialogBlock0 ==========

export function DialogBlock0({ addDialogOpen, addSubmitting, handleAddUser, roles }: { addDialogOpen: any, addSubmitting: any, handleAddUser: any, roles: any }) {
  return (
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
  )
}

// ========== UsersSearchAndTable ==========

export function UsersSearchAndTable({ deactivatingUser, loading, rowVariant, searchQuery, staggerContainer }: { deactivatingUser: any, loading: any, rowVariant: any, searchQuery: any, staggerContainer: any }) {
  return (
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
    
  )
}

