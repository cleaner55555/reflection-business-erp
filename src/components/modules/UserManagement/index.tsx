'use client'

'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'
import {
import { useAppStore } from '@/lib/store'
import { cn } from '@/lib/utils'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
import {
import {
import {
import {
import { useUserManagement } from './hooks'
import { AlertDialogBlock2, DialogBlock1, DialogBlock0, UsersSearchAndTable } from './components'

import { useUserManagement } from './hooks'
import { AlertDialogBlock2, DialogBlock1, DialogBlock0 } from './components'

  const {6, addDialogOpen, addSubmitting, deactivatingUser, deleteDialogOpen, deleteSubmitting, deletingUser, editDialogOpen, editRoleId, editSubmitting, editingUser, filteredUsers, handleAddUser, handleEditRole, i, loading, onAdd, roles, rowVariant, searchQuery, setEditRoleId, staggerContainer, users} = useUserManagement()
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
  const {addDialogOpen, addSubmitting, deactivatingUser, deleteDialogOpen, deleteSubmitting, deletingUser, editDialogOpen, editRoleId, editSubmitting, editingUser, filteredUsers, handleAddUser, handleEditRole, handleToggleActive, loading, openDeleteDialog, openEditDialog, roles, rowVariant, searchQuery, setAddDialogOpen, setEditRoleId, staggerContainer, users} = useUserManagement()
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

        <UsersSearchAndTable deactivatingUser={deactivatingUser} loading={loading} rowVariant={rowVariant} searchQuery={searchQuery} staggerContainer={staggerContainer} />
      {/* ============ ADD USER DIALOG ============ */}

              <DialogBlock0 addDialogOpen={addDialogOpen} addSubmitting={addSubmitting} handleAddUser={handleAddUser} roles={roles} />

      {/* ============ EDIT ROLE DIALOG ============ */}

              <DialogBlock1 editDialogOpen={editDialogOpen} editRoleId={editRoleId} editSubmitting={editSubmitting} editingUser={editingUser} handleEditRole={handleEditRole} roles={roles} setEditRoleId={setEditRoleId} />

      {/* ============ DELETE CONFIRMATION DIALOG ============ */}

              <AlertDialogBlock2 deleteDialogOpen={deleteDialogOpen} deleteSubmitting={deleteSubmitting} deletingUser={deletingUser} />
    </div>
  )
}
