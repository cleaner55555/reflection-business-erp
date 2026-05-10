'use client'

import { useState, useEffect } from 'react'
import { useAppStore } from '@/lib/store'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
} from '@/components/ui/dropdown-menu'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Building2, Plus, ChevronRight, Check, Settings, Users, Loader2, ArrowLeft } from 'lucide-react'
import { toast } from 'sonner'

interface Company {
  id: string
  name: string
  pib?: string
  city?: string
  isActive: boolean
  _count?: {
    users: number
    partners: number
    invoices: number
    products: number
  }
}

export function CompanySwitcher() {
  const { activeCompanyId, activeCompanyName, setActiveCompany } = useAppStore()
  const [companies, setCompanies] = useState<Company[]>([])
  const [loading, setLoading] = useState(false)

  // New company dialog
  const [dialogOpen, setDialogOpen] = useState(false)
  const [newName, setNewName] = useState('')
  const [newPib, setNewPib] = useState('')
  const [newCity, setNewCity] = useState('')
  const [newAddress, setNewAddress] = useState('')
  const [newEmail, setNewEmail] = useState('')
  const [newPhone, setNewPhone] = useState('')
  const [creating, setCreating] = useState(false)

  const loadCompanies = async () => {
    try {
      const res = await fetch('/api/companies')
      if (res.ok) {
        const data = await res.json()
        setCompanies(Array.isArray(data) ? data : [data])
      }
    } catch {
      // silent
    }
  }

  useEffect(() => {
    loadCompanies()
  }, [])

  // Auto-select first company if none selected
  useEffect(() => {
    if (!activeCompanyId && companies.length > 0) {
      setActiveCompany(companies[0].id, companies[0].name)
    }
  }, [companies, activeCompanyId, setActiveCompany])

  const handleCreateCompany = async () => {
    if (!newName.trim()) {
      toast.error('Naziv kompanije je obavezan')
      return
    }
    setCreating(true)
    try {
      const res = await fetch('/api/companies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newName,
          pib: newPib || undefined,
          city: newCity || undefined,
          address: newAddress || undefined,
          email: newEmail || undefined,
          phone: newPhone || undefined,
        }),
      })
      if (!res.ok) {
        const data = await res.json()
        toast.error(data.error || 'Greška pri kreiranju')
        return
      }
      const company = await res.json()
      toast.success(`Kompanija "${company.name}" je kreirana`)
      setDialogOpen(false)
      setNewName('')
      setNewPib('')
      setNewCity('')
      setNewAddress('')
      setNewEmail('')
      setNewPhone('')
      loadCompanies()

      // Auto-switch to new company
      setActiveCompany(company.id, company.name)
    } catch {
      toast.error('Greška pri kreiranju kompanije')
    } finally {
      setCreating(false)
    }
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" className="h-8 gap-1.5 text-xs max-w-[180px]">
            <Building2 className="h-3.5 w-3.5 shrink-0 text-primary" />
            <span className="truncate font-medium">{activeCompanyName || 'Izaberi firmu'}</span>
            <ChevronRight className="h-3 w-3 shrink-0 opacity-50" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-64">
          <DropdownMenuLabel className="text-xs text-muted-foreground font-normal">
            Kompanije
          </DropdownMenuLabel>
          <DropdownMenuSeparator />

          {companies.map((company) => (
            <DropdownMenuItem
              key={company.id}
              onClick={() => setActiveCompany(company.id, company.name)}
              className="flex items-center justify-between gap-2 cursor-pointer"
            >
              <div className="flex items-center gap-2 min-w-0">
                <Building2 className="h-4 w-4 shrink-0 text-muted-foreground" />
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate">{company.name}</p>
                  {company.pib && (
                    <p className="text-xs text-muted-foreground">PIB: {company.pib}</p>
                  )}
                </div>
              </div>
              {company.id === activeCompanyId && (
                <Check className="h-4 w-4 shrink-0 text-primary" />
              )}
            </DropdownMenuItem>
          ))}

          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => setDialogOpen(true)} className="text-primary cursor-pointer">
            <Plus className="h-4 w-4 mr-2" />
            Nova kompanija
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {dialogOpen && (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" onClick={() => setDialogOpen(false)}><ArrowLeft className="h-4 w-4" /></Button>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5 text-primary" />
                Nova kompanija
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="space-y-2">
                <Label htmlFor="company-name">Naziv kompanije *</Label>
                <Input
                  id="company-name"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Moja Firma doo"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="company-pib">PIB</Label>
                  <Input
                    id="company-pib"
                    value={newPib}
                    onChange={(e) => setNewPib(e.target.value)}
                    placeholder="123456789"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="company-city">Grad</Label>
                  <Input
                    id="company-city"
                    value={newCity}
                    onChange={(e) => setNewCity(e.target.value)}
                    placeholder="Beograd"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="company-address">Adresa</Label>
                <Input
                  id="company-address"
                  value={newAddress}
                  onChange={(e) => setNewAddress(e.target.value)}
                  placeholder="Bulevar Mihajla Pupina 10"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="company-email">Email</Label>
                  <Input
                    id="company-email"
                    type="email"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    placeholder="info@firma.rs"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="company-phone">Telefon</Label>
                  <Input
                    id="company-phone"
                    type="tel"
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    placeholder="+381 11 123 4567"
                  />
                </div>
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <Button variant="outline" onClick={() => setDialogOpen(false)}>Otkaži</Button>
              <Button onClick={handleCreateCompany} disabled={creating || !newName.trim()}>
                {creating ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Kreiranje...</>
                ) : (
                  <><Plus className="mr-2 h-4 w-4" /> Kreiraj kompaniju</>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </>
  )
}
