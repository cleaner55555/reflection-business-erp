'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'
import {
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
import {
import {
import {
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Calendar } from '@/components/ui/calendar'

import { useApiKeyManagement } from './hooks'
import { AlertDialogBlock1, DialogBlock0, ApiInfoCard } from './components'

export function ApiKeyManagement() {
  const {apiKeys, createDialogOpen, creating, expiringSoon, handleCreateKey, handleRevokeKey, i, loading, newKey, revokeDialogOpen, revoking, revokingKey, setRevokeDialogOpen, users, usersLoading} = useApiKeyManagement()
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
        <ApiInfoCard  />

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
              <DialogBlock0 createDialogOpen={createDialogOpen} creating={creating} handleCreateKey={handleCreateKey} newKey={newKey} users={users} usersLoading={usersLoading} />

      {/* ============ REVOKE CONFIRMATION ============ */}
              <AlertDialogBlock1 handleRevokeKey={handleRevokeKey} revokeDialogOpen={revokeDialogOpen} revoking={revoking} revokingKey={revokingKey} setRevokeDialogOpen={setRevokeDialogOpen} />
    </div>
  )
}
