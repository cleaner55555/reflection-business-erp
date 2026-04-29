'use client'

import { useState, useMemo, useCallback } from 'react'
import { motion } from 'framer-motion'
import {
  Card, CardContent, CardHeader, CardTitle, CardDescription,
  Tabs, TabsList, TabsTrigger, TabsContent,
  Badge, Input, Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
  Table, TableHeader, TableRow, TableHead, TableBody, TableCell,
  Button, Progress, Separator,
} from '@/components/ui/card'
import { useTranslation } from '@/lib/i18n'
import {
  COUNTRY_TAX_LAWS, getTaxLaw, calculateVAT, calculateIncomeTax, calculateEmployerCost,
  getInvoiceMandatoryFields, getTaxForms, getCountriesByRegion, searchCountries,
  getCurrencySymbol, type CountryTaxLaw,
} from '@/lib/tax-laws'
import {
  Globe2, Calculator, FileText, Receipt, Building2, Scale, Search,
  ChevronRight, CheckCircle2, AlertCircle, Info, TrendingUp, TrendingDown,
  DollarSign, Users, Briefcase, Landmark, FileCheck, Clock,
  RefreshCw, Check, ExternalLink, Shield, ShieldCheck,
} from 'lucide-react'

const REGIONS = [
  { value: 'all', label: '🌐 Sve' },
  { value: 'europe', label: '🇪🇺 Evropa' },
  { value: 'americas', label: '🌎 Amerika' },
  { value: 'asia', label: '🌏 Azija' },
]

const REGION_NAMES: Record<string, string> = { europe: 'Evropa', americas: 'Amerika', asia: 'Azija', africa: 'Afrika', oceania: 'Okeanija' }

function formatNum(n: number, decimals = 0) {
  return n.toLocaleString('sr-RS', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })
}

function VatColor(rate: number) {
  if (rate <= 5) return 'text-emerald-600 bg-emerald-50 border-emerald-200'
  if (rate <= 10) return 'text-green-600 bg-green-50 border-green-200'
  if (rate <= 15) return 'text-amber-600 bg-amber-50 border-amber-200'
  if (rate <= 20) return 'text-orange-600 bg-orange-50 border-orange-200'
  return 'text-red-600 bg-red-50 border-red-200'
}

function CorpColor(rate: number) {
  if (rate <= 10) return 'text-emerald-600 bg-emerald-50 border-emerald-200'
  if (rate <= 15) return 'text-green-600 bg-green-50 border-green-200'
  if (rate <= 20) return 'text-amber-600 bg-amber-50 border-amber-200'
  return 'text-red-600 bg-red-50 border-red-200'
}

export function Zakoni() {
  const { t } = useTranslation()
  const [selectedCountry, setSelectedCountry] = useState<string>('RS')
  const [searchQuery, setSearchQuery] = useState('')
  const [activeRegion, setActiveRegion] = useState('all')
  const [vatAmount, setVatAmount] = useState<string>('1000')
  const [vatDirection, setVatDirection] = useState<'gross' | 'net'>('gross')
  const [salaryInput, setSalaryInput] = useState<string>('100000')
  const [updateStatus, setUpdateStatus] = useState<'idle' | 'checking' | 'success' | 'updated' | 'error'>('idle')
  const [updateMessage, setUpdateMessage] = useState<string>('')
  const [lastVerified, setLastVerified] = useState<string | null>(null)
  const [updateChanges, setUpdateChanges] = useState<{ field: string; oldValue: string; newValue: string }[]>([])

  const law = getTaxLaw(selectedCountry)

  // Fetch last verified status on mount & country change
  useEffect(() => {
    if (!selectedCountry) return
    fetch(`/api/tax-laws/update?code=${selectedCountry}`, {
      headers: { 'x-company-id': '' },
    })
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (data?.lastVerified) {
          setLastVerified(data.lastVerified)
        }
      })
      .catch(() => {})
  }, [selectedCountry])

  // Check for updates via web search + AI
  const checkForUpdates = useCallback(async () => {
    setUpdateStatus('checking')
    setUpdateMessage('')
    setUpdateChanges([])
    try {
      const res = await fetch('/api/tax-laws/update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-company-id': '',
        },
        body: JSON.stringify({ countryCode: selectedCountry }),
      })
      const data = await res.json()
      if (data.status === 'updated') {
        setUpdateStatus('updated')
        setUpdateMessage(t('zakoni.updateFound') || `${data.changes.length} promena pronađeno!`)
        setUpdateChanges(data.changes || [])
      } else if (data.status === 'verified') {
        setUpdateStatus('success')
        setUpdateMessage(t('zakoni.updateVerified') || 'Zakoni su aktuelni')
      } else if (data.status === 'error') {
        setUpdateStatus('error')
        setUpdateMessage(data.error || t('zakoni.updateError') || 'Greška pri proveri')
      }
      if (data.verifiedAt) {
        setLastVerified(data.verifiedAt)
      }
    } catch {
      setUpdateStatus('error')
      setUpdateMessage(t('zakoni.updateError') || 'Greška pri proveri ažuriranja')
    }
    // Reset status after 10s
    setTimeout(() => setUpdateStatus('idle'), 10000)
  }, [selectedCountry, t])

  const filteredCountries = useMemo(() => {
    let countries = activeRegion === 'all' ? COUNTRY_TAX_LAWS : getCountriesByRegion(activeRegion)
    if (searchQuery) {
      countries = countries.filter(c =>
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.code.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }
    return countries
  }, [activeRegion, searchQuery])

  // VAT calculation
  const vatResult = useMemo(() => {
    if (!vatAmount || !law) return null
    const amount = parseFloat(vatAmount) || 0
    if (vatDirection === 'gross') {
      return { ...calculateVAT(amount, selectedCountry), inputType: 'gross' as const }
    } else {
      const rate = law.vat.standardRate / 100
      const gross = amount * (1 + rate)
      const tax = gross - amount
      return { net: amount, tax: Math.round(tax * 100) / 100, gross: Math.round(gross * 100) / 100, rate: law.vat.standardRate, inputType: 'net' as const }
    }
  }, [vatAmount, selectedCountry, vatDirection, law])

  // Salary calculation
  const salaryResult = useMemo(() => {
    if (!salaryInput || !law) return null
    const gross = parseFloat(salaryInput) || 0
    const income = calculateIncomeTax(gross, selectedCountry)
    const employer = calculateEmployerCost(gross, selectedCountry)
    return { income, employer }
  }, [salaryInput, selectedCountry, law])

  if (!law) return null

  const curSym = getCurrencySymbol(law.currency)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Scale className="h-6 w-6 text-primary" />
            {t('zakoni.title') || 'Zakoni i Porezi'}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {t('zakoni.subtitle') || 'Globalna baza poreskih zakona i regulative za 26+ zemalja'}
          </p>
        </div>
        <Select value={selectedCountry} onValueChange={setSelectedCountry}>
          <SelectTrigger className="w-[220px]">
            <Globe2 className="h-4 w-4 mr-2" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="max-h-80">
            {COUNTRY_TAX_LAWS.map(c => (
              <SelectItem key={c.code} value={c.code}>
                {c.flag} {c.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Update Status Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 p-3 bg-muted/30 rounded-lg border">
        <div className="flex items-center gap-2 flex-1">
          <ShieldCheck className={`h-4 w-4 ${updateStatus === 'updated' ? 'text-orange-500' : updateStatus === 'success' ? 'text-emerald-500' : updateStatus === 'error' ? 'text-red-500' : 'text-muted-foreground'}`} />
          <span className="text-xs text-muted-foreground">
            {lastVerified
              ? `${t('zakoni.lastVerified') || 'Zadnja provera'}: ${new Date(lastVerified).toLocaleDateString('sr-RS')} ${new Date(lastVerified).toLocaleTimeString('sr-RS', { hour: '2-digit', minute: '2-digit' })}`
              : (t('zakoni.notVerified') || 'Nije proveravano')
            }
          </span>
          {updateStatus === 'updated' && updateChanges.length > 0 && (
            <Badge variant="destructive" className="text-[10px]">
              {updateChanges.length} {t('zakoni.changes') || 'promena'}
            </Badge>
          )}
          {updateStatus === 'success' && (
            <Badge className="bg-emerald-100 text-emerald-700 text-[10px]">
              <Check className="h-2.5 w-2.5 mr-0.5" /> {t('zakoni.upToDate') || 'Aktuelno'}
            </Badge>
          )}
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={checkForUpdates}
          disabled={updateStatus === 'checking'}
          className="text-xs gap-1.5"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${updateStatus === 'checking' ? 'animate-spin' : ''}`} />
          {updateStatus === 'checking'
            ? (t('zakoni.checking') || 'Proveravam...')
            : (t('zakoni.checkUpdates') || 'Proveri ažuriranja')
          }
        </Button>
      </div>

      {/* Update Changes */}
      {updateChanges.length > 0 && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="p-3 bg-orange-50 border border-orange-200 rounded-lg space-y-1.5"
        >
          <p className="text-xs font-medium text-orange-700">{t('zakoni.foundChanges') || 'Pronađene promene:'}</p>
          {updateChanges.map((change, i) => (
            <div key={i} className="flex items-center gap-2 text-xs">
              <span className="font-medium text-orange-600">{change.field}:</span>
              <span className="text-red-500 line-through">{change.oldValue}</span>
              <span className="text-muted-foreground">→</span>
              <span className="text-emerald-600 font-bold">{change.newValue}</span>
            </div>
          ))}
        </motion.div>
      )}
      {updateStatus === 'error' && updateMessage && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-2 bg-red-50 border border-red-200 rounded-lg text-xs text-red-600">
          {updateMessage}
        </motion.div>
      )}
      {updateStatus === 'success' && updateMessage && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-2 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-600">
          ✓ {updateMessage}
        </motion.div>
      )}

      {/* Country Quick Stats */}
      <motion.div
        key={selectedCountry}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-2 md:grid-cols-4 gap-3"
      >
        <Card className={`border ${VatColor(law.vat.standardRate)}`}>
          <CardContent className="p-3">
            <p className="text-xs font-medium opacity-70">{t('zakoni.pdvRate') || 'PDV Stopa'}</p>
            <p className="text-2xl font-bold">{law.vat.standardRate}%</p>
            <p className="text-[10px] opacity-60">{law.vat.type.toUpperCase()}</p>
          </CardContent>
        </Card>
        <Card className={`border ${CorpColor(law.corporateTax.rate)}`}>
          <CardContent className="p-3">
            <p className="text-xs font-medium opacity-70">{t('zakoni.corpTax') || 'Porez na dobit'}</p>
            <p className="text-2xl font-bold">{law.corporateTax.rate}%</p>
            <p className="text-[10px] opacity-60">{law.corporateTax.specialRegimes[0] || ''}</p>
          </CardContent>
        </Card>
        <Card className="border border-blue-200 bg-blue-50">
          <CardContent className="p-3">
            <p className="text-xs font-medium opacity-70">{t('zakoni.totalEmployee') || 'Ukupno doprinosi zaposleni'}</p>
            <p className="text-2xl font-bold text-blue-700">{law.socialContributions.totalEmployee}%</p>
            <p className="text-[10px] opacity-60">+ {law.socialContributions.totalEmployer}% {t('zakoni.employer') || 'poslodavac'}</p>
          </CardContent>
        </Card>
        <Card className="border border-purple-200 bg-purple-50">
          <CardContent className="p-3">
            <p className="text-xs font-medium opacity-70">{t('zakoni.minWage') || 'Minimalna plata'}</p>
            <p className="text-2xl font-bold text-purple-700">{formatNum(law.payroll.minimumWage)}</p>
            <p className="text-[10px] opacity-60">{curSym} / {t('zakoni.month') || 'mesec'}</p>
          </CardContent>
        </Card>
      </motion.div>

      {/* Tabs */}
      <Tabs defaultValue="overview">
        <TabsList className="grid grid-cols-3 lg:grid-cols-6 w-full">
          <TabsTrigger value="overview"><Globe2 className="h-3.5 w-3.5 mr-1 hidden sm:inline" />{t('zakoni.overview') || 'Pregled'}</TabsTrigger>
          <TabsTrigger value="taxes"><DollarSign className="h-3.5 w-3.5 mr-1 hidden sm:inline" />{t('zakoni.taxes') || 'Porezi'}</TabsTrigger>
          <TabsTrigger value="calculator"><Calculator className="h-3.5 w-3.5 mr-1 hidden sm:inline" />{t('zakoni.calculator') || 'Obračun'}</TabsTrigger>
          <TabsTrigger value="invoicing"><Receipt className="h-3.5 w-3.5 mr-1 hidden sm:inline" />{t('zakoni.invoicing') || 'Fakturisanje'}</TabsTrigger>
          <TabsTrigger value="forms"><FileText className="h-3.5 w-3.5 mr-1 hidden sm:inline" />{t('zakoni.forms') || 'Obrazi'}</TabsTrigger>
          <TabsTrigger value="payroll"><Users className="h-3.5 w-3.5 mr-1 hidden sm:inline" />{t('zakoni.payroll') || 'Plate'}</TabsTrigger>
        </TabsList>

        {/* ===== OVERVIEW TAB ===== */}
        <TabsContent value="overview">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
            {/* Search + Region Filter */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder={t('zakoni.searchCountry') || 'Pretraži zemlje...'}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
              <div className="flex gap-2 flex-wrap">
                {REGIONS.map(r => (
                  <Button
                    key={r.value}
                    variant={activeRegion === r.value ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setActiveRegion(r.value)}
                    className="text-xs"
                  >
                    {r.label}
                  </Button>
                ))}
              </div>
            </div>

            {/* Country Cards Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
              {filteredCountries.map(c => (
                <motion.div key={c.code} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Card
                    className={`cursor-pointer transition-all hover:shadow-md ${
                      selectedCountry === c.code ? 'ring-2 ring-primary border-primary' : ''
                    }`}
                    onClick={() => setSelectedCountry(c.code)}
                  >
                    <CardContent className="p-3">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xl">{c.flag}</span>
                        <div className="min-w-0">
                          <p className="text-xs font-semibold truncate">{c.name}</p>
                          <p className="text-[10px] text-muted-foreground">{c.currency} · {REGION_NAMES[c.region]}</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-1 text-[10px]">
                        <div>
                          <span className="text-muted-foreground">PDV</span>
                          <p className={`font-bold ${c.vat.type === 'none' ? 'text-gray-400' : ''}`}>
                            {c.vat.type === 'none' ? '—' : `${c.vat.standardRate}%`}
                          </p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Dobit</span>
                          <p className="font-bold">{c.corporateTax.rate}%</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Dopr.</span>
                          <p className="font-bold">{c.socialContributions.totalEmployee}%</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">{t('zakoni.minWage') || 'Min.'}</span>
                          <p className="font-bold truncate">{c.payroll.minimumWage > 0 ? formatNum(c.payroll.minimumWage) : '—'}</p>
                        </div>
                      </div>
                      {c.invoiceRequirements.eInvoiceSystem && (
                        <Badge variant="secondary" className="mt-2 text-[9px] h-4">
                          <FileCheck className="h-2.5 w-2.5 mr-0.5" />
                          {c.invoiceRequirements.eInvoiceSystem}
                        </Badge>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
            <p className="text-xs text-muted-foreground text-center">
              {t('zakoni.countriesCount') || 'Ukupno'}: {filteredCountries.length} {t('zakoni.countries') || 'zemalja'}
            </p>
          </motion.div>
        </TabsContent>

        {/* ===== TAXES TAB ===== */}
        <TabsContent value="taxes">
          <motion.div key={`${selectedCountry}-taxes`} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            {/* VAT Section */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Receipt className="h-5 w-5 text-orange-500" />
                  {t('zakoni.vatTitle') || 'PDV / Porez na dodatu vrednost'}
                </CardTitle>
                <CardDescription>
                  {t('zakoni.vatType') || 'Tip'}: <Badge variant="outline">{law.vat.type.toUpperCase()}</Badge>
                  {law.vat.isEuVat && <Badge variant="secondary" className="ml-2">EU</Badge>}
                  {law.vat.reverseCharge && <Badge variant="secondary" className="ml-2">Reverse Charge</Badge>}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <p className="text-sm font-medium">{t('zakoni.standardRate') || 'Standardna stopa'}</p>
                    <Badge className={`text-lg px-3 py-1 ${VatColor(law.vat.standardRate)}`}>{law.vat.standardRate}%</Badge>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm font-medium">{t('zakoni.reducedRates') || 'Snižene stope'}</p>
                    {law.vat.reducedRates.length > 0 ? (
                      <div className="space-y-1">
                        {law.vat.reducedRates.map((r, i) => (
                          <div key={i} className="flex items-center gap-2">
                            <Badge className={`${VatColor(r.rate)}`}>{r.rate}%</Badge>
                            <span className="text-xs text-muted-foreground">{r.description}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-muted-foreground">{t('zakoni.noReduced') || 'Nema sniženih stopa'}</p>
                    )}
                  </div>
                </div>
                {law.vat.registrationThreshold && (
                  <div className="flex items-center gap-2 text-sm">
                    <Info className="h-4 w-4 text-blue-500" />
                    <span>{t('zakoni.regThreshold') || 'Prag za registraciju'}: <strong>{formatNum(law.vat.registrationThreshold)} {curSym}</strong></span>
                  </div>
                )}
                <Separator />
                <div>
                  <p className="text-sm font-medium mb-2">{t('zakoni.exemptions') || 'Oslobođenja'}</p>
                  <div className="flex flex-wrap gap-1">
                    {law.vat.exemptions.map((e, i) => (
                      <Badge key={i} variant="outline" className="text-[10px]">{e}</Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Corporate Tax */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Building2 className="h-5 w-5 text-blue-500" />
                  {t('zakoni.corpTitle') || 'Porez na dobit pravnih lica'}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Badge className={`text-lg px-3 py-1 ${CorpColor(law.corporateTax.rate)}`}>{law.corporateTax.rate}%</Badge>
                {law.corporateTax.reducedRates.length > 0 && (
                  <div className="space-y-1">
                    <p className="text-sm font-medium">{t('zakoni.reducedRates') || 'Snižene stope'}</p>
                    {law.corporateTax.reducedRates.map((r, i) => (
                      <p key={i} className="text-xs text-muted-foreground">
                        do {formatNum(r.threshold)} {curSym}: <strong>{r.rate}%</strong>
                      </p>
                    ))}
                  </div>
                )}
                {law.corporateTax.specialRegimes.length > 0 && (
                  <div>
                    <p className="text-sm font-medium mb-1">{t('zakoni.specialRegimes') || 'Specijalni režimi'}</p>
                    <div className="flex flex-wrap gap-1">
                      {law.corporateTax.specialRegimes.map((r, i) => (
                        <Badge key={i} variant="outline" className="text-[10px]">{r}</Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Income Tax + Social Contributions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-green-500" />
                    {t('zakoni.incomeTitle') || 'Porez na dohodak'}
                  </CardTitle>
                  <CardDescription>{t('zakoni.incomeType') || 'Tip'}: {law.incomeTax.type}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  {law.incomeTax.flatRate && (
                    <div className="flex items-center gap-2">
                      <span className="text-sm">{t('zakoni.flatRate') || 'Paušalna stopa'}:</span>
                      <Badge>{law.incomeTax.flatRate}%</Badge>
                    </div>
                  )}
                  {law.incomeTax.taxFreeAllowance > 0 && (
                    <p className="text-xs text-muted-foreground">
                      {t('zakoni.taxFree') || 'Poreski oslobođeni iznos'}: <strong>{formatNum(law.incomeTax.taxFreeAllowance)} {curSym}</strong>
                    </p>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Users className="h-4 w-4 text-blue-500" />
                    {t('zakoni.contributions') || 'Doprinosi'}
                  </CardTitle>
                  <CardDescription>
                    {t('zakoni.employee') || 'Zaposleni'}: <strong>{law.socialContributions.totalEmployee}%</strong> ·
                    {t('zakoni.employer') || 'Poslodavac'}: <strong>{law.socialContributions.totalEmployer}%</strong>
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-xs">{t('zakoni.contribType') || 'Tip'}</TableHead>
                        <TableHead className="text-xs text-center">{t('zakoni.employee') || 'Zaposleni'}</TableHead>
                        <TableHead className="text-xs text-center">{t('zakoni.employer') || 'Poslodavac'}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {[
                        { name: law.socialContributions.pension.name, emp: law.socialContributions.pension.employee, er: law.socialContributions.pension.employer },
                        { name: law.socialContributions.health.name, emp: law.socialContributions.health.employee, er: law.socialContributions.health.employer },
                        { name: law.socialContributions.unemployment.name, emp: law.socialContributions.unemployment.employee, er: law.socialContributions.unemployment.employer },
                        ...law.socialContributions.other.filter(o => o.employee > 0 || o.employer > 0).map(o => ({ name: o.name, emp: o.employee, er: o.employer })),
                      ].map((row, i) => (
                        <TableRow key={i}>
                          <TableCell className="text-xs py-1.5">{row.name}</TableCell>
                          <TableCell className="text-xs text-center py-1.5 font-medium">{row.emp > 0 ? `${row.emp}%` : '—'}</TableCell>
                          <TableCell className="text-xs text-center py-1.5 font-medium">{row.er > 0 ? `${row.er}%` : '—'}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>

            {/* Withholding Tax */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <TrendingDown className="h-4 w-4 text-amber-500" />
                  {t('zakoni.withholding') || 'Porez po odbitku'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { label: t('zakoni.dividends') || 'Dividende', value: law.withholdingTax.dividends },
                    { label: t('zakoni.interest') || 'Kamata', value: law.withholdingTax.interest },
                    { label: t('zakoni.royalties') || 'Royalties', value: law.withholdingTax.royalties },
                    { label: t('zakoni.services') || 'Usluge', value: law.withholdingTax.services },
                  ].map((item, i) => (
                    <div key={i} className="text-center">
                      <p className="text-xs text-muted-foreground">{item.label}</p>
                      <p className={`text-xl font-bold ${item.value === 0 ? 'text-emerald-600' : 'text-orange-600'}`}>
                        {item.value}%
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        {/* ===== CALCULATOR TAB ===== */}
        <TabsContent value="calculator">
          <motion.div key={`${selectedCountry}-calc`} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              {law.flag} {law.name}
            </h3>

            {/* VAT Calculator */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">{t('zakoni.vatCalc') || 'PDV Kalkulator'}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="flex-1">
                    <label className="text-xs text-muted-foreground mb-1 block">
                      {vatDirection === 'gross' ? (t('zakoni.grossAmount') || 'Bruto iznos') : (t('zakoni.netAmount') || 'Neto iznos')} ({curSym})
                    </label>
                    <Input
                      type="number"
                      value={vatAmount}
                      onChange={(e) => setVatAmount(e.target.value)}
                      className="text-lg"
                    />
                  </div>
                  <div className="flex items-end">
                    <div className="flex rounded-md overflow-hidden border">
                      <Button
                        variant={vatDirection === 'gross' ? 'default' : 'ghost'}
                        size="sm"
                        onClick={() => setVatDirection('gross')}
                        className="rounded-r-none"
                      >
                        {t('zakoni.bruto') || 'Bruto → Neto'}
                      </Button>
                      <Button
                        variant={vatDirection === 'net' ? 'default' : 'ghost'}
                        size="sm"
                        onClick={() => setVatDirection('net')}
                        className="rounded-l-none"
                      >
                        {t('zakoni.neto') || 'Neto → Bruto'}
                      </Button>
                    </div>
                  </div>
                </div>

                {vatResult && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="grid grid-cols-3 gap-4 p-4 bg-muted/50 rounded-lg"
                  >
                    <div className="text-center">
                      <p className="text-xs text-muted-foreground">
                        {vatResult.inputType === 'gross' ? (t('zakoni.netAmount') || 'Neto') : (t('zakoni.grossAmount') || 'Bruto')}
                      </p>
                      <p className="text-xl font-bold">{formatNum(vatResult.net)} {curSym}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-muted-foreground">PDV ({vatResult.rate}%)</p>
                      <p className="text-xl font-bold text-orange-600">{formatNum(vatResult.tax)} {curSym}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-muted-foreground">
                      {vatResult.inputType === 'gross' ? (t('zakoni.grossAmount') || 'Bruto') : (t('zakoni.netAmount') || 'Neto')}
                      </p>
                      <p className="text-xl font-bold text-primary">{formatNum(vatResult.gross)} {curSym}</p>
                    </div>
                  </motion.div>
                )}

                {law.vat.reducedRates.length > 0 && vatResult && (
                  <div className="space-y-2">
                    <p className="text-sm font-medium">{t('zakoni.reducedCalc') || 'Sa sniženom stopom'}:</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {law.vat.reducedRates.map((r, i) => {
                        const base = parseFloat(vatAmount) || 0
                        const rate = r.rate / 100
                        const net = vatDirection === 'gross' ? base / (1 + rate) : base
                        const tax = vatDirection === 'gross' ? base - net : net * rate
                        const gross = vatDirection === 'gross' ? base : net * (1 + rate)
                        return (
                          <div key={i} className="flex items-center gap-2 p-2 bg-muted/30 rounded-md text-xs">
                            <Badge className={`${VatColor(r.rate)} shrink-0`}>{r.rate}%</Badge>
                            <span className="text-muted-foreground">{r.description}</span>
                            <span className="ml-auto font-medium whitespace-nowrap">
                              PDV: {formatNum(tax)} {curSym}
                            </span>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Salary Calculator */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">{t('zakoni.salaryCalc') || 'Kalkulator zarada'}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">
                    {t('zakoni.grossSalary') || 'Bruto zarada'} ({curSym})
                  </label>
                  <Input
                    type="number"
                    value={salaryInput}
                    onChange={(e) => setSalaryInput(e.target.value)}
                    className="text-lg max-w-xs"
                  />
                </div>

                {salaryResult && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                    {/* Employee Breakdown */}
                    <div>
                      <h4 className="text-sm font-semibold mb-2">{t('zakoni.employeeBreakdown') || 'Otpis sa plate zaposlenog'}</h4>
                      <div className="space-y-2">
                        {salaryResult.income.breakdown.map((item, i) => (
                          <div key={i} className="flex items-center gap-3">
                            <span className="text-xs w-28 shrink-0 truncate">{item.name}</span>
                            <div className="flex-1">
                              <div className="h-5 bg-muted rounded-full overflow-hidden relative">
                                <motion.div
                                  initial={{ width: 0 }}
                                  animate={{ width: `${item.employeePct}%` }}
                                  transition={{ duration: 0.5, delay: i * 0.1 }}
                                  className="h-full bg-red-400 rounded-full"
                                />
                              </div>
                            </div>
                            <span className="text-xs font-medium w-16 text-right">{item.employeePct}%</span>
                            <span className="text-xs text-muted-foreground w-24 text-right">− {formatNum(item.amount)} {curSym}</span>
                          </div>
                        ))}
                        {/* Income Tax */}
                        <div className="flex items-center gap-3">
                          <span className="text-xs w-28 shrink-0 font-medium">{t('zakoni.incomeTax') || 'Porez na dohodak'}</span>
                          <div className="flex-1">
                            <div className="h-5 bg-muted rounded-full overflow-hidden">
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${Math.min(50, (salaryResult.income.incomeTax / salaryResult.income.gross) * 100)}%` }}
                                transition={{ duration: 0.5, delay: 0.3 }}
                                className="h-full bg-orange-400 rounded-full"
                              />
                            </div>
                          </div>
                          <span className="text-xs font-medium w-16 text-right">
                            {((salaryResult.income.incomeTax / salaryResult.income.gross) * 100).toFixed(1)}%
                          </span>
                          <span className="text-xs text-muted-foreground w-24 text-right">− {formatNum(salaryResult.income.incomeTax)} {curSym}</span>
                        </div>
                      </div>
                      <Separator className="my-3" />
                      <div className="grid grid-cols-3 gap-3 p-3 bg-green-50 rounded-lg">
                        <div className="text-center">
                          <p className="text-[10px] text-muted-foreground">{t('zakoni.bruto') || 'Bruto'}</p>
                          <p className="text-sm font-bold">{formatNum(salaryResult.income.gross)}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-[10px] text-muted-foreground">{t('zakoni.deductions') || 'Otpisi'}</p>
                          <p className="text-sm font-bold text-red-600">
                            − {formatNum(salaryResult.income.socialContributions + salaryResult.income.incomeTax)}
                          </p>
                        </div>
                        <div className="text-center">
                          <p className="text-[10px] text-muted-foreground">{t('zakoni.netSalary') || 'Neto zarada'}</p>
                          <p className="text-lg font-bold text-green-600">{formatNum(salaryResult.income.netSalary)}</p>
                        </div>
                      </div>
                    </div>

                    {/* Employer Cost */}
                    <div>
                      <h4 className="text-sm font-semibold mb-2">{t('zakoni.employerCost') || 'Trošak poslodavca'}</h4>
                      <div className="space-y-2">
                        {salaryResult.employer.breakdown.map((item, i) => (
                          <div key={i} className="flex items-center gap-3">
                            <span className="text-xs w-28 shrink-0 truncate">{item.name}</span>
                            <div className="flex-1">
                              <div className="h-5 bg-muted rounded-full overflow-hidden">
                                <motion.div
                                  initial={{ width: 0 }}
                                  animate={{ width: `${item.employerPct}%` }}
                                  transition={{ duration: 0.5, delay: i * 0.1 }}
                                  className="h-full bg-blue-400 rounded-full"
                                />
                              </div>
                            </div>
                            <span className="text-xs font-medium w-16 text-right">{item.employerPct}%</span>
                            <span className="text-xs text-muted-foreground w-24 text-right">+ {formatNum(item.amount)} {curSym}</span>
                          </div>
                        ))}
                      </div>
                      <Separator className="my-3" />
                      <div className="grid grid-cols-3 gap-3 p-3 bg-blue-50 rounded-lg">
                        <div className="text-center">
                          <p className="text-[10px] text-muted-foreground">{t('zakoni.bruto') || 'Bruto'}</p>
                          <p className="text-sm font-bold">{formatNum(salaryResult.employer.gross)}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-[10px] text-muted-foreground">{t('zakoni.employerContrib') || 'Doprinosi'}</p>
                          <p className="text-sm font-bold text-blue-600">
                            + {formatNum(salaryResult.employer.employerContributions)}
                          </p>
                        </div>
                        <div className="text-center">
                          <p className="text-[10px] text-muted-foreground">{t('zakoni.totalCost') || 'Ukupno trošak'}</p>
                          <p className="text-lg font-bold text-blue-600">{formatNum(salaryResult.employer.totalCost)}</p>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        {/* ===== INVOICING TAB ===== */}
        <TabsContent value="invoicing">
          <motion.div key={`${selectedCountry}-inv`} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Receipt className="h-5 w-5" />
                  {t('zakoni.invoiceReq') || 'Zahtevi za fakturisanje'} — {law.flag} {law.name}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Mandatory fields checklist */}
                <div>
                  <h4 className="text-sm font-semibold mb-2">{t('zakoni.mandatoryFields') || 'Obavezna polja'}</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                    {getInvoiceMandatoryFields(selectedCountry).map((field, i) => (
                      <div key={i} className="flex items-center gap-2 text-sm">
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                        <span>{field}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <Separator />

                {/* Requirements grid */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {[
                    {
                      label: t('zakoni.seqNumbering') || 'Sekvencijalno numerisanje',
                      value: law.invoiceRequirements.sequentialNumbering,
                    },
                    {
                      label: t('zakoni.eInvoicing') || 'E-fakturisanje',
                      value: law.invoiceRequirements.electronicInvoicing,
                    },
                    {
                      label: t('zakoni.fiscalization') || 'Fiskalizacija',
                      value: law.invoiceRequirements.fiscalization,
                    },
                    {
                      label: t('zakoni.currencyReq') || 'Zahtev za valutu',
                      value: law.invoiceRequirements.currencyRequirement,
                    },
                  ].map((item, i) => (
                    <div key={i} className={`p-3 rounded-lg border flex items-center gap-2 ${
                      item.value
                        ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                        : 'bg-gray-50 border-gray-200 text-gray-500'
                    }`}>
                      {item.value
                        ? <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                        : <AlertCircle className="h-4 w-4 text-gray-400" />
                      }
                      <span className="text-xs font-medium">{item.label}</span>
                    </div>
                  ))}
                </div>

                {/* E-invoice system */}
                {law.invoiceRequirements.eInvoiceSystem && (
                  <div className="flex items-center gap-2 p-3 bg-primary/5 border border-primary/20 rounded-lg">
                    <FileCheck className="h-5 w-5 text-primary" />
                    <div>
                      <p className="text-sm font-medium">{t('zakoni.eInvoiceSystem') || 'E-faktura sistem'}</p>
                      <p className="text-xs text-muted-foreground">{law.invoiceRequirements.eInvoiceSystem}</p>
                    </div>
                  </div>
                )}

                {/* Language & Retention */}
                <div className="grid grid-cols-2 gap-4 text-sm">
                  {law.invoiceRequirements.languageRequirement && (
                    <div className="flex items-center gap-2">
                      <Landmark className="h-4 w-4 text-muted-foreground" />
                      <span>{t('zakoni.langReq') || 'Jezik'}: <strong>{law.invoiceRequirements.languageRequirement}</strong></span>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span>{t('zakoni.retention') || 'Čuvanje'}: <strong>{law.invoiceRequirements.retentionPeriod} {t('zakoni.years') || 'godina'}</strong></span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        {/* ===== FORMS TAB ===== */}
        <TabsContent value="forms">
          <motion.div key={`${selectedCountry}-forms`} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  {t('zakoni.taxForms') || 'Poreski obrasci'} — {law.flag} {law.name}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {getTaxForms(selectedCountry).length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-24">{t('zakoni.formCode') || 'Šifra'}</TableHead>
                        <TableHead>{t('zakoni.formName') || 'Naziv obrasca'}</TableHead>
                        <TableHead className="w-28 text-center">{t('zakoni.frequency') || 'Učestalost'}</TableHead>
                        <TableHead className="hidden md:table-cell">{t('zakoni.description') || 'Opis'}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {getTaxForms(selectedCountry).map((form, i) => (
                        <TableRow key={i}>
                          <TableCell className="font-mono font-medium">{form.code}</TableCell>
                          <TableCell className="text-sm">{form.name}</TableCell>
                          <TableCell className="text-center">
                            <Badge variant="outline" className="text-[10px]">{form.frequency}</Badge>
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground hidden md:table-cell">{form.description}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-8">
                    {t('zakoni.noForms') || 'Nema podataka o poreskim obrascima za ovu zemlju'}
                  </p>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        {/* ===== PAYROLL TAB ===== */}
        <TabsContent value="payroll">
          <motion.div key={`${selectedCountry}-payroll`} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  {t('zakoni.payrollTitle') || 'Zakonska regulativa zarada'} — {law.flag} {law.name}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {[
                    { icon: DollarSign, label: t('zakoni.minWage') || 'Minimalna plata', value: law.payroll.minimumWage > 0 ? `${formatNum(law.payroll.minimumWage)} ${curSym}` : '—', color: 'text-emerald-600' },
                    { icon: Briefcase, label: t('zakoni.payPeriod') || 'Period isplate', value: t(`zakoni.${law.payroll.payPeriodFrequency}`) || law.payroll.payPeriodFrequency, color: 'text-blue-600' },
                    { icon: Clock, label: t('zakoni.maxHours') || 'Max. radnih sati', value: `${law.payroll.maximumWorkingHours}h / ${t('zakoni.week') || 'nedelja'}`, color: 'text-orange-600' },
                    { icon: TrendingUp, label: t('zakoni.overtime') || 'Prekovremeni', value: `×${law.payroll.overtimeMultiplier}`, color: 'text-red-600' },
                    { icon: FileText, label: t('zakoni.annualLeave') || 'Godišnji odmor', value: `${law.payroll.annualLeaveDays} ${t('zakoni.days') || 'dana'}`, color: 'text-green-600' },
                    { icon: AlertCircle, label: t('zakoni.sickLeave') || 'Bolovanje (plaćeno)', value: `${law.payroll.sickLeavePaid} ${t('zakoni.days') || 'dana'}`, color: 'text-amber-600' },
                    { icon: Users, label: t('zakoni.maternity') || 'Materinstvo', value: `${law.payroll.maternityLeaveWeeks} ${t('zakoni.weeks') || 'nedelja'}`, color: 'text-purple-600' },
                    { icon: Clock, label: t('zakoni.pensionAge') || 'Godina za penziju', value: `♂ ${law.payroll.pensionAge.male} / ♀ ${law.payroll.pensionAge.female}`, color: 'text-gray-600' },
                  ].map((item, i) => (
                    <div key={i} className="p-3 bg-muted/50 rounded-lg">
                      <div className="flex items-center gap-2 mb-1">
                        <item.icon className={`h-3.5 w-3.5 ${item.color}`} />
                        <p className="text-[10px] text-muted-foreground">{item.label}</p>
                      </div>
                      <p className="text-sm font-bold">{item.value}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Accounting Standards */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Landmark className="h-4 w-4" />
                  {t('zakoni.accounting') || 'Računovodstveni standardi'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground">{t('zakoni.standards') || 'Standardi'}</p>
                    <p className="text-sm font-medium">{law.accounting.standards}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">{t('zakoni.fiscalYear') || 'Fiskalna godina'}</p>
                    <p className="text-sm font-medium">
                      {law.accounting.fiscalYear === 'calendar' ? (t('zakoni.calendarYear') || 'Kalendarska') : (t('zakoni.custom') || 'Prilagođena')}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">{t('zakoni.chartOfAccounts') || 'Kontni plan'}</p>
                    <p className="text-sm font-medium">{law.accounting.chartOfAccounts}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">{t('zakoni.mandatoryReports') || 'Obavezni izveštaji'}</p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {law.accounting.mandatoryReports.map((r, i) => (
                        <Badge key={i} variant="outline" className="text-[10px]">{r}</Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
