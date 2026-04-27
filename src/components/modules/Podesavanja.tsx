'use client'

import { useEffect, useState, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Switch } from '@/components/ui/switch'
import { Settings, Save, Building2, Blocks, SlidersHorizontal, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/helpers'

// ============ MODULE DEFINITIONS ============

interface ModuleDef {
  key: string
  name: string
  description: string
  icon: string
  enabled: boolean
}

const MODULES_DEFAULTS: Omit<ModuleDef, 'enabled'>[] = [
  { key: 'module_finansije_enabled', name: 'Finansije', description: 'Upravljanje prihodima, rashodima, transakcijama i finansijskim izveštajima.', icon: '💰' },
  { key: 'module_fakture_enabled', name: 'Fakture', description: 'Izrada, praćenje i upravljanje ulaznim i izlaznim fakturama i predračunima.', icon: '📄' },
  { key: 'module_magacin_enabled', name: 'Magacin', description: 'Praćenje zaliha, prijem, izdavanje, inventura i kretanje robe.', icon: '🏭' },
  { key: 'module_partneri_enabled', name: 'Partneri', description: 'Upravljanje kupcima, dobavljačima i partnerima sa kompletnom dokumentacijom.', icon: '🤝' },
  { key: 'module_nabavka_enabled', name: 'Nabavka', description: 'Narudžbenice, nabavni proces, upravljanje dobavljačima i narudžbama.', icon: '🛒' },
  { key: 'module_crm_enabled', name: 'CRM', description: 'Upravljanje odnosima sa klijentima, prilike, aktivnosti i poslovni kontakti.', icon: '❤️' },
  { key: 'module_kalendar_enabled', name: 'Kalendar', description: 'Planiranje sastanaka, zadataka, događaja i zakazivanje aktivnosti.', icon: '📅' },
  { key: 'module_zaposleni_enabled', name: 'Zaposleni', description: 'Kadrovsko poslovanje, plate, prisustvo i upravljanje radnim odnosima.', icon: '👥' },
  { key: 'module_projekti_enabled', name: 'Projekti', description: 'Upravljanje projektima, zadacima, budžetima i praćenje napretka.', icon: '📁' },
  { key: 'module_sredstva_enabled', name: 'Osnovna sredstva', description: 'Evidencija osnovnih sredstava, amortizacija i praćenje vrednosti.', icon: '🏗️' },
  { key: 'module_dokumenta_enabled', name: 'Dokumenta', description: 'Upravljanje dokumentima, arhiva, ugovori i digitalna skladišta.', icon: '📂' },
  { key: 'module_knjigovodstvo_enabled', name: 'Knjigovodstvo', description: 'Nalogovodstvo, dnevnik, glavna knjiga i finansijski izveštaji.', icon: '📒' },
  { key: 'module_protokol_enabled', name: 'Protokol', description: 'Evidencija ulazne i izlazne pošte, protokol i praćenje dokumenta.', icon: '📬' },
  { key: 'module_edukacija_enabled', name: 'Edukacija', description: 'Obuke, kursevi, edukacija zaposlenih i upravljanje znanjem.', icon: '🎓' },
  { key: 'module_vozni_park_enabled', name: 'Vozni park', description: 'Upravljanje vozilima, servis, troškovi, gorivo i putovanja.', icon: '🚗' },
  { key: 'module_rent_a_car_enabled', name: 'Rent a car', description: 'Iznajmljivanje vozila, rezervacije, ugovori i praćenje flote.', icon: '🚙' },
  { key: 'module_kafe_restoran_enabled', name: 'Kafe restoran', description: 'Meni, narudžbe, stolovi, računi i upravljanje restoranom.', icon: '☕' },
  { key: 'module_email_marketing_enabled', name: 'Email Marketing', description: 'Email kampanje, liste primalaca, šablone i analitika.', icon: '✉️' },
]

// ============ COMPANY SETTINGS ============

interface CompanySettings {
  company_name: string
  company_pib: string
  company_maticni_broj: string
  company_address: string
  company_city: string
  company_zip: string
  company_phone: string
  company_email: string
  company_website: string
  company_bank_account: string
}

const COMPANY_DEFAULTS: CompanySettings = {
  company_name: '',
  company_pib: '',
  company_maticni_broj: '',
  company_address: '',
  company_city: '',
  company_zip: '',
  company_phone: '',
  company_email: '',
  company_website: '',
  company_bank_account: '',
}

// ============ GENERAL SETTINGS ============

interface GeneralSettings {
  default_currency: string
  default_tax_rate: string
  default_payment_method: string
  fiscal_year_start: string
  language: string
}

const GENERAL_DEFAULTS: GeneralSettings = {
  default_currency: 'RSD',
  default_tax_rate: '20',
  default_payment_method: 'racun',
  fiscal_year_start: '1',
  language: 'sr',
}

// ============ API TYPES ============

interface AppSettingResponse {
  id: string
  key: string
  value: string
  label: string | null
  type: string
  group: string
}

// ============ MAIN COMPONENT ============

export function Podesavanja() {
  // Modules state
  const [modules, setModules] = useState<ModuleDef[]>(
    MODULES_DEFAULTS.map((m) => ({ ...m, enabled: true }))
  )
  const [modulesLoading, setModulesLoading] = useState(true)
  const [modulesSaving, setModulesSaving] = useState(false)

  // Company state
  const [company, setCompany] = useState<CompanySettings>({ ...COMPANY_DEFAULTS })
  const [companyLoading, setCompanyLoading] = useState(true)
  const [companySaving, setCompanySaving] = useState(false)

  // General state
  const [general, setGeneral] = useState<GeneralSettings>({ ...GENERAL_DEFAULTS })
  const [generalLoading, setGeneralLoading] = useState(true)
  const [generalSaving, setGeneralSaving] = useState(false)

  // Active tab
  const [activeTab, setActiveTab] = useState('moduli')

  // ============ FETCH SETTINGS ============

  const fetchSettings = useCallback(async (group: string) => {
    try {
      const res = await fetch(`/api/settings?group=${group}`)
      if (!res.ok) throw new Error('Greška pri učitavanju')
      const data: AppSettingResponse[] = await res.json()
      return data
    } catch {
      return []
    }
  }, [])

  useEffect(() => {
    // Fetch modules settings
    fetchSettings('modules').then((data) => {
      if (data.length > 0) {
        setModules((prev) =>
          prev.map((m) => ({
            ...m,
            enabled: data.find((s) => s.key === m.key)?.value === 'true',
          }))
        )
      }
      setModulesLoading(false)
    })

    // Fetch company settings
    fetchSettings('company').then((data) => {
      if (data.length > 0) {
        const map: Record<string, string> = {}
        data.forEach((s) => {
          map[s.key] = s.value
        })
        setCompany((prev) => ({
          ...prev,
          company_name: map['company_name'] || prev.company_name,
          company_pib: map['company_pib'] || prev.company_pib,
          company_maticni_broj: map['company_maticni_broj'] || prev.company_maticni_broj,
          company_address: map['company_address'] || prev.company_address,
          company_city: map['company_city'] || prev.company_city,
          company_zip: map['company_zip'] || prev.company_zip,
          company_phone: map['company_phone'] || prev.company_phone,
          company_email: map['company_email'] || prev.company_email,
          company_website: map['company_website'] || prev.company_website,
          company_bank_account: map['company_bank_account'] || prev.company_bank_account,
        }))
      }
      setCompanyLoading(false)
    })

    // Fetch general settings
    fetchSettings('general').then((data) => {
      if (data.length > 0) {
        const map: Record<string, string> = {}
        data.forEach((s) => {
          map[s.key] = s.value
        })
        setGeneral((prev) => ({
          ...prev,
          default_currency: map['default_currency'] || prev.default_currency,
          default_tax_rate: map['default_tax_rate'] || prev.default_tax_rate,
          default_payment_method: map['default_payment_method'] || prev.default_payment_method,
          fiscal_year_start: map['fiscal_year_start'] || prev.fiscal_year_start,
          language: map['language'] || prev.language,
        }))
      }
      setGeneralLoading(false)
    })
  }, [fetchSettings])

  // ============ SAVE HANDLERS ============

  const handleSaveModules = async () => {
    setModulesSaving(true)
    try {
      const items = modules.map((m) => ({
        key: m.key,
        value: String(m.enabled),
        label: m.name,
        type: 'boolean',
        group: 'modules',
      }))
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(items),
      })
      if (!res.ok) throw new Error('Greška pri čuvanju')
      toast.success('Podešavanja modula su sačuvana')
    } catch {
      toast.error('Greška pri čuvanju podešavanja modula')
    } finally {
      setModulesSaving(false)
    }
  }

  const handleSaveCompany = async () => {
    setCompanySaving(true)
    try {
      const items: Array<{ key: string; value: string; label: string; type: string; group: string }> = []
      const labels: Record<string, string> = {
        company_name: 'Naziv firme',
        company_pib: 'PIB',
        company_maticni_broj: 'Matični broj',
        company_address: 'Adresa',
        company_city: 'Grad',
        company_zip: 'Poštanski broj',
        company_phone: 'Telefon',
        company_email: 'Email',
        company_website: 'Web sajt',
        company_bank_account: 'Žiro račun',
      }
      Object.entries(company).forEach(([key, value]) => {
        items.push({ key, value, label: labels[key] || key, type: 'text', group: 'company' })
      })
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(items),
      })
      if (!res.ok) throw new Error('Greška pri čuvanju')
      toast.success('Podešavanja firme su sačuvana')
    } catch {
      toast.error('Greška pri čuvanju podešavanja firme')
    } finally {
      setCompanySaving(false)
    }
  }

  const handleSaveGeneral = async () => {
    setGeneralSaving(true)
    try {
      const items: Array<{ key: string; value: string; label: string; type: string; group: string }> = []
      const labels: Record<string, string> = {
        default_currency: 'Podrazumevana valuta',
        default_tax_rate: 'Podrazumevana poreska stopa',
        default_payment_method: 'Podrazumevani način plaćanja',
        fiscal_year_start: 'Početak fiskalne godine',
        language: 'Jezik',
      }
      Object.entries(general).forEach(([key, value]) => {
        items.push({ key, value, label: labels[key] || key, type: 'text', group: 'general' })
      })
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(items),
      })
      if (!res.ok) throw new Error('Greška pri čuvanju')
      toast.success('Opšta podešavanja su sačuvana')
    } catch {
      toast.error('Greška pri čuvanju opštih podešavanja')
    } finally {
      setGeneralSaving(false)
    }
  }

  // ============ HELPERS ============

  const enabledCount = modules.filter((m) => m.enabled).length

  const MONTH_LABELS: Record<string, string> = {
    '1': 'Januar',
    '2': 'Februar',
    '3': 'Mart',
    '4': 'April',
    '5': 'Maj',
    '6': 'Jun',
    '7': 'Jul',
    '8': 'Avgust',
    '9': 'Septembar',
    '10': 'Oktobar',
    '11': 'Novembar',
    '12': 'Decembar',
  }

  // ============ RENDER ============

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <Settings className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Podešavanja</h1>
          <p className="text-sm text-muted-foreground mt-1">Konfiguracija sistema i modula</p>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 lg:w-[400px]">
          <TabsTrigger value="moduli" className="gap-2">
            <Blocks className="h-4 w-4 hidden sm:block" />
            Moduli
          </TabsTrigger>
          <TabsTrigger value="firma" className="gap-2">
            <Building2 className="h-4 w-4 hidden sm:block" />
            Firma
          </TabsTrigger>
          <TabsTrigger value="opste" className="gap-2">
            <SlidersHorizontal className="h-4 w-4 hidden sm:block" />
            Opšte
          </TabsTrigger>
        </TabsList>

        {/* ============ MODULI TAB ============ */}
        <TabsContent value="moduli" className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <p className="text-sm text-muted-foreground">
                Upravljajte dostupnim modulima sistema
              </p>
              <Badge variant="secondary" className="text-xs">
                {enabledCount}/{modules.length} aktivno
              </Badge>
            </div>
          </div>

          {modulesLoading ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 9 }).map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-4">
                    <div className="h-5 w-24 bg-muted rounded mb-2" />
                    <div className="h-4 w-full bg-muted rounded mb-3" />
                    <div className="h-5 w-10 bg-muted rounded" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {modules.map((mod) => (
                <Card
                  key={mod.key}
                  className={cn(
                    'transition-all duration-200 hover:shadow-md border',
                    mod.enabled
                      ? 'border-primary/20 bg-primary/[0.02]'
                      : 'opacity-60 hover:opacity-100'
                  )}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3 min-w-0">
                        <span className="text-xl mt-0.5 shrink-0">{mod.icon}</span>
                        <div className="min-w-0">
                          <h3 className="font-semibold text-sm text-foreground leading-tight">
                            {mod.name}
                          </h3>
                          <p className="text-xs text-muted-foreground mt-1 leading-relaxed line-clamp-2">
                            {mod.description}
                          </p>
                        </div>
                      </div>
                      <Switch
                        checked={mod.enabled}
                        onCheckedChange={(checked) =>
                          setModules((prev) =>
                            prev.map((m) => (m.key === mod.key ? { ...m, enabled: checked } : m))
                          )
                        }
                        className="shrink-0"
                      />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          <div className="flex justify-end pt-2">
            <Button onClick={handleSaveModules} disabled={modulesSaving}>
              {modulesSaving ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              Sačuvaj module
            </Button>
          </div>
        </TabsContent>

        {/* ============ FIRMA TAB ============ */}
        <TabsContent value="firma" className="space-y-6">
          {companyLoading ? (
            <Card>
              <CardContent className="p-6 space-y-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="animate-pulse space-y-2">
                    <div className="h-3 w-24 bg-muted rounded" />
                    <div className="h-10 w-full bg-muted rounded" />
                  </div>
                ))}
              </CardContent>
            </Card>
          ) : (
            <>
              <Card>
                <CardHeader className="pb-4">
                  <CardTitle className="text-base">Osnovni podaci</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="company_name">Naziv firme</Label>
                      <Input
                        id="company_name"
                        placeholder="Unesite naziv firme"
                        value={company.company_name}
                        onChange={(e) =>
                          setCompany((prev) => ({ ...prev, company_name: e.target.value }))
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="company_pib">PIB</Label>
                      <Input
                        id="company_pib"
                        placeholder="npr. 123456789"
                        value={company.company_pib}
                        onChange={(e) =>
                          setCompany((prev) => ({ ...prev, company_pib: e.target.value }))
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="company_maticni_broj">Matični broj</Label>
                      <Input
                        id="company_maticni_broj"
                        placeholder="npr. 12345678"
                        value={company.company_maticni_broj}
                        onChange={(e) =>
                          setCompany((prev) => ({
                            ...prev,
                            company_maticni_broj: e.target.value,
                          }))
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="company_zip">Poštanski broj</Label>
                      <Input
                        id="company_zip"
                        placeholder="npr. 11000"
                        value={company.company_zip}
                        onChange={(e) =>
                          setCompany((prev) => ({ ...prev, company_zip: e.target.value }))
                        }
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="company_address">Adresa</Label>
                    <Input
                      id="company_address"
                      placeholder="Ulica i broj"
                      value={company.company_address}
                      onChange={(e) =>
                        setCompany((prev) => ({ ...prev, company_address: e.target.value }))
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="company_city">Grad</Label>
                    <Input
                      id="company_city"
                      placeholder="Unesite grad"
                      value={company.company_city}
                      onChange={(e) =>
                        setCompany((prev) => ({ ...prev, company_city: e.target.value }))
                      }
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-4">
                  <CardTitle className="text-base">Kontakt informacije</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="company_phone">Telefon</Label>
                      <Input
                        id="company_phone"
                        placeholder="+381 11 123 4567"
                        value={company.company_phone}
                        onChange={(e) =>
                          setCompany((prev) => ({ ...prev, company_phone: e.target.value }))
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="company_email">Email</Label>
                      <Input
                        id="company_email"
                        type="email"
                        placeholder="info@firma.rs"
                        value={company.company_email}
                        onChange={(e) =>
                          setCompany((prev) => ({ ...prev, company_email: e.target.value }))
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="company_website">Web sajt</Label>
                      <Input
                        id="company_website"
                        placeholder="www.firma.rs"
                        value={company.company_website}
                        onChange={(e) =>
                          setCompany((prev) => ({ ...prev, company_website: e.target.value }))
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="company_bank_account">Žiro račun</Label>
                      <Input
                        id="company_bank_account"
                        placeholder="160-0000000000000-00"
                        value={company.company_bank_account}
                        onChange={(e) =>
                          setCompany((prev) => ({
                            ...prev,
                            company_bank_account: e.target.value,
                          }))
                        }
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="flex justify-end">
                <Button onClick={handleSaveCompany} disabled={companySaving}>
                  {companySaving ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4 mr-2" />
                  )}
                  Sačuvaj podatke firme
                </Button>
              </div>
            </>
          )}
        </TabsContent>

        {/* ============ OPŠTE TAB ============ */}
        <TabsContent value="opste" className="space-y-6">
          {generalLoading ? (
            <Card>
              <CardContent className="p-6 space-y-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="animate-pulse space-y-2">
                    <div className="h-3 w-32 bg-muted rounded" />
                    <div className="h-10 w-full bg-muted rounded" />
                  </div>
                ))}
              </CardContent>
            </Card>
          ) : (
            <>
              <Card>
                <CardHeader className="pb-4">
                  <CardTitle className="text-base">Finansijska podešavanja</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="default_currency">Podrazumevana valuta</Label>
                      <Select
                        value={general.default_currency}
                        onValueChange={(val) =>
                          setGeneral((prev) => ({ ...prev, default_currency: val }))
                        }
                      >
                        <SelectTrigger id="default_currency">
                          <SelectValue placeholder="Izaberite valutu" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="RSD">RSD - Srpski dinar</SelectItem>
                          <SelectItem value="EUR">EUR - Evro</SelectItem>
                          <SelectItem value="USD">USD - Američki dolar</SelectItem>
                          <SelectItem value="CHF">CHF - Švajcarski franak</SelectItem>
                          <SelectItem value="GBP">GBP - Britanska funta</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="default_tax_rate">Podrazumevana poreska stopa (%)</Label>
                      <Input
                        id="default_tax_rate"
                        type="number"
                        min="0"
                        max="100"
                        step="0.01"
                        value={general.default_tax_rate}
                        onChange={(e) =>
                          setGeneral((prev) => ({ ...prev, default_tax_rate: e.target.value }))
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="default_payment_method">Podrazumevani način plaćanja</Label>
                      <Select
                        value={general.default_payment_method}
                        onValueChange={(val) =>
                          setGeneral((prev) => ({ ...prev, default_payment_method: val }))
                        }
                      >
                        <SelectTrigger id="default_payment_method">
                          <SelectValue placeholder="Izaberite način plaćanja" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="racun">Račun - Transakcijski račun</SelectItem>
                          <SelectItem value="gotovina">Gotovina</SelectItem>
                          <SelectItem value="kartica">Kartica</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="fiscal_year_start">Početak fiskalne godine</Label>
                      <Select
                        value={general.fiscal_year_start}
                        onValueChange={(val) =>
                          setGeneral((prev) => ({ ...prev, fiscal_year_start: val }))
                        }
                      >
                        <SelectTrigger id="fiscal_year_start">
                          <SelectValue placeholder="Izaberite mesec" />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(MONTH_LABELS).map(([val, label]) => (
                            <SelectItem key={val} value={val}>
                              {label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2 sm:col-span-2">
                      <Label htmlFor="language">Jezik interfejsa</Label>
                      <Select
                        value={general.language}
                        onValueChange={(val) =>
                          setGeneral((prev) => ({ ...prev, language: val }))
                        }
                      >
                        <SelectTrigger id="language" className="sm:max-w-xs">
                          <SelectValue placeholder="Izaberite jezik" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="sr">Srpski (Cyrillica)</SelectItem>
                          <SelectItem value="sr-latn">Srpski (Latinica)</SelectItem>
                          <SelectItem value="en">English</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="flex justify-end">
                <Button onClick={handleSaveGeneral} disabled={generalSaving}>
                  {generalSaving ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4 mr-2" />
                  )}
                  Sačuvaj opšta podešavanja
                </Button>
              </div>
            </>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
