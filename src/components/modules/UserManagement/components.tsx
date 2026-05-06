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
import { , Plus, Users } from 'lucide-react'
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
