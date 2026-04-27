'use client'

import { useEffect, useState, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Plus, Search, Users } from 'lucide-react'
import { toast } from 'sonner'
import { getStatusLabel } from '@/lib/helpers'

interface Partner {
  id: string
  name: string
  pib: string
  maticniBr: string | null
  address: string | null
  city: string | null
  phone: string | null
  email: string | null
  type: string
  account: string | null
  bank: string | null
  notes: string | null
  _count: { invoices: number; purchaseOrders: number }
}

export function Partneri() {
  const [partners, setPartners] = useState<Partner[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const fetchPartners = useCallback(async () => {
    setLoading(true)
    const params = new URLSearchParams()
    if (search) params.set('search', search)
    if (typeFilter) params.set('type', typeFilter)
    const res = await fetch(`/api/partners?${params.toString()}`)
    const data = await res.json()
    setPartners(data)
    setLoading(false)
  }, [search, typeFilter])

  useEffect(() => {
    fetchPartners()
  }, [fetchPartners])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setSubmitting(true)
    const fd = new FormData(e.currentTarget)
    const body = {
      name: fd.get('name') as string,
      pib: fd.get('pib') as string,
      maticniBr: fd.get('maticniBr') as string,
      address: fd.get('address') as string,
      city: fd.get('city') as string,
      zipCode: fd.get('zipCode') as string,
      phone: fd.get('phone') as string,
      email: fd.get('email') as string,
      type: fd.get('type') as string,
      account: fd.get('account') as string,
      bank: fd.get('bank') as string,
      notes: fd.get('notes') as string,
    }
    try {
      const res = await fetch('/api/partners', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      if (!res.ok) {
        const err = await res.json()
        toast.error(err.error || 'Greška pri kreiranju')
        return
      }
      toast.success('Partner uspešno kreiran')
      setDialogOpen(false)
      fetchPartners()
    } catch {
      toast.error('Greška pri kreiranju partnera')
    } finally {
      setSubmitting(false)
    }
  }

  const typeColors: Record<string, string> = {
    kupac: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    dobavljac: 'bg-blue-50 text-blue-700 border-blue-200',
    partner: 'bg-purple-50 text-purple-700 border-purple-200',
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle className="text-base font-semibold">Partneri</CardTitle>
            <p className="text-xs text-muted-foreground mt-0.5">{partners.length} partnera</p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="gap-2">
                <Plus className="h-4 w-4" /> Novi Partner
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Novi Partner</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-xs">Naziv *</Label>
                    <Input name="name" placeholder="Naziv firme" required />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs">PIB *</Label>
                    <Input name="pib" placeholder="123456789" required />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label className="text-xs">Matični broj</Label>
                    <Input name="maticniBr" placeholder="12345678" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs">Tip</Label>
                    <Select name="type" defaultValue="kupac">
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="kupac">Kupac</SelectItem>
                        <SelectItem value="dobavljac">Dobavljač</SelectItem>
                        <SelectItem value="partner">Partner</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs">Grad</Label>
                    <Input name="city" placeholder="Beograd" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs">Adresa</Label>
                  <Input name="address" placeholder="Ulica i broj" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-xs">Telefon</Label>
                    <Input name="phone" placeholder="+381 11 123 4567" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs">Email</Label>
                    <Input name="email" type="email" placeholder="info@firma.rs" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-xs">Tekući račun</Label>
                    <Input name="account" placeholder="265-00000000-00" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs">Banka</Label>
                    <Input name="bank" placeholder="Naziv banke" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs">Napomene</Label>
                  <Input name="notes" placeholder="Napomene" />
                </div>
                <Button type="submit" className="w-full" disabled={submitting}>
                  {submitting ? 'Čuvanje...' : 'Kreiraj Partnera'}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center mt-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Pretraži partnere..."
              className="pl-8 h-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Select value={typeFilter} onValueChange={(v) => setTypeFilter(v === 'all' ? '' : v)}>
            <SelectTrigger className="w-[150px] h-9">
              <SelectValue placeholder="Svi tipovi" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Svi tipovi</SelectItem>
              <SelectItem value="kupac">Kupac</SelectItem>
              <SelectItem value="dobavljac">Dobavljač</SelectItem>
              <SelectItem value="partner">Partner</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        ) : (
          <div className="max-h-[500px] overflow-y-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs">Naziv</TableHead>
                  <TableHead className="text-xs">PIB</TableHead>
                  <TableHead className="text-xs">Tip</TableHead>
                  <TableHead className="text-xs">Grad</TableHead>
                  <TableHead className="text-xs">Telefon</TableHead>
                  <TableHead className="text-xs">Email</TableHead>
                  <TableHead className="text-xs text-center">Fakture</TableHead>
                  <TableHead className="text-xs text-center">Narudžbine</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {partners.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground text-sm">
                      Nema partnera za prikaz
                    </TableCell>
                  </TableRow>
                ) : (
                  partners.map((p) => (
                    <TableRow key={p.id}>
                      <TableCell className="text-xs font-medium">{p.name}</TableCell>
                      <TableCell className="text-xs font-mono">{p.pib}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={`text-[10px] px-2 py-0 ${typeColors[p.type] || ''}`}>
                          {getStatusLabel(p.type)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs">{p.city || '-'}</TableCell>
                      <TableCell className="text-xs">{p.phone || '-'}</TableCell>
                      <TableCell className="text-xs">{p.email || '-'}</TableCell>
                      <TableCell className="text-xs text-center">
                        <Badge variant="secondary" className="text-[10px] px-2 py-0">
                          {p._count.invoices}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs text-center">
                        <Badge variant="secondary" className="text-[10px] px-2 py-0">
                          {p._count.purchaseOrders}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
