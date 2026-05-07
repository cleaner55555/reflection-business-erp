'use client'
import { AlertTriangle, Calendar, Check, Key, Trash2, X, Code, Copy, ExternalLink, Loader2, Shield, User } from 'lucide-react'
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogFooter, AlertDialogTitle, AlertDialogDescription, AlertDialogAction, AlertDialogCancel } from '@/components/ui/alert-dialog'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { motion, AnimatePresence } from 'framer-motion'


// ========== AlertDialogBlock1 ==========

export function AlertDialogBlock1({ handleRevokeKey, revokeDialogOpen, revoking, revokingKey, setRevokeDialogOpen }: { handleRevokeKey: any, revokeDialogOpen: any, revoking: any, revokingKey: any, setRevokeDialogOpen: any }) {
  return (
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
  )
}


// ========== DialogBlock0 ==========

export function DialogBlock0({ createDialogOpen, creating, handleCreateKey, newKey, users, usersLoading }: { createDialogOpen: any, creating: any, handleCreateKey: any, newKey: any, users: any, usersLoading: any }) {
  return (
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
  )
}

// ========== ApiInfoCard ==========

export function ApiInfoCard({  }: {  }) {
  return (
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
  )
}

