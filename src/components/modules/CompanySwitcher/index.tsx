'use client'

import { useState, useEffect } from 'react'
import { useAppStore } from '@/lib/store'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Building2, Plus, ChevronRight, Check, Users, Loader2, ArrowLeft,
} from 'lucide-react'
import { toast } from 'sonner'

interface Company {
  id: string
  name: string
  pib?: string
  city?: string
  plan?: string
  isActive: boolean
  _count?: {
    users: number
    partners: number
    invoices: number
    products: number
  }
}

const PLAN_STYLES: Record<string, { label: string; className: string }> = {
  free:        { label: 'Free',        className: 'bg-muted text-muted-foreground' },
  starter:     { label: 'Starter',     className: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' },
  pro:         { label: 'Pro',         className: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' },
  enterprise:  { label: 'Enterprise',  className: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' },
}

export function CompanySwitcher() {
  const { activeCompanyId, activeCompanyName, setActiveCompany } = useAppStore()
  const [companies, setCompanies] = useState<Company[]>([])

  // New company form state
  const [subTab, setSubTab] = useState<'list' | 'dodaj'>('list')
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
      setSubTab('list')
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
          <Button variant="ghost" size="sm" className="h-8 gap-1.5 text-xs max-w-[200px]">
            <Building2 className="h-3.5 w-3.5 shrink-0 text-primary" />
            <span className="truncate font-medium">{activeCompanyName || 'Izaberi firmu'}</span>
            <ChevronRight className="h-3 w-3 shrink-0 opacity-50" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-72">
          <DropdownMenuLabel className="text-xs text-muted-foreground font-normal">
            Organizacije ({companies.length})
          </DropdownMenuLabel>
          <DropdownMenuSeparator />

          {companies.map((company) => {
            const plan = PLAN_STYLES[company.plan || 'free'] || PLAN_STYLES.free
            const isActive = company.id === activeCompanyId
            return (
              <DropdownMenuItem
                key={company.id}
                onClick={() => setActiveCompany(company.id, company.name)}
                className={`flex items-center justify-between gap-2 cursor-pointer py-2.5 ${isActive ? 'bg-accent' : ''}`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${isActive ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}`}>
                    <Building2 className="h-4 w-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <p className="text-sm font-medium truncate">{company.name}</p>
                      {isActive && <Check className="h-3 w-3 shrink-0 text-primary" />}
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <Badge variant="secondary" className={`text-[10px] px-1.5 py-0 h-4 ${plan.className}`}>
                        {plan.label}
                      </Badge>
                      {company._count && (
                        <span className="flex items-center gap-0.5 text-[10px] text-muted-foreground">
                          <Users className="h-2.5 w-2.5" />
                          {company._count.users}
                        </span>
                      )}
                      {company.city && (
                        <span className="text-[10px] text-muted-foreground">{company.city}</span>
                      )}
                    </div>
                  </div>
                </div>
              </DropdownMenuItem>
            )
          })}

          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => setSubTab('dodaj')} className="text-primary cursor-pointer">
            <Plus className="h-4 w-4 mr-2" />
            Nova organizacija
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {subTab === 'dodaj' && (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" onClick={() => setSubTab('list')}><ArrowLeft className="h-4 w-4" /></Button>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5 text-primary" />
                Nova organizacija
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="space-y-2">
                <Label htmlFor="company-name">Naziv organizacije *</Label>
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
              <Button variant="outline" onClick={() => setSubTab('list')}>Otkaži</Button>
              <Button onClick={handleCreateCompany} disabled={creating || !newName.trim()}>
                {creating ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Kreiranje...</>
                ) : (
                  <><Plus className="mr-2 h-4 w-4" /> Kreiraj organizaciju</>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </>
  )
}
