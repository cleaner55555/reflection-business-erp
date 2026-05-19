'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Switch } from '@/components/ui/switch'
import { Slider } from '@/components/ui/slider'
import { Settings as SettingsIcon, Save, Building2, Blocks, SlidersHorizontal, Loader2, Palette, Upload, RotateCcw, Check, ImageIcon, Search, Users, Key, Shield, History, Webhook, Sparkles, Compass, X, Network } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/helpers'
import { useTranslation, ALL_LANGUAGES } from '@/lib/i18n'
import { useThemeStore, DEFAULT_THEME } from '@/lib/theme'
import { openAISetupWizard } from '@/components/modules/AISetupWizard'
import { UserManagement } from '@/components/modules/UserManagement'
import { ApiKeyManagement } from '@/components/modules/ApiKeyManagement'
import { PermissionsEditor } from '@/components/modules/PermissionsEditor'
import { AuditLogViewer } from '@/components/modules/AuditLogViewer'
import { WebhookManager } from '@/components/modules/WebhookManager'
import dynamic from 'next/dynamic'

const OrganizationManager = dynamic(() => import('@/components/modules/OrganizationManager').then(m => ({ default: m.OrganizationManager })), { ssr: false, loading: () => <div className="flex justify-center py-20"><div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" /></div> })

const IndustryTemplates = dynamic(() => import('@/components/modules/IndustryTemplates').then(m => m.default), { ssr: false, loading: () => <div className="flex justify-center py-20"><div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" /></div> })
import { themePresets } from '@/lib/theme-presets'
import type { ThemeSettings } from '@/lib/theme'
import { moduleGroupMap } from '@/lib/module-groups'
import { menuGroups } from '@/lib/menuGroupsData'
import { useAppStore } from '@/lib/store'

// ============ MODULE DEFINITIONS (from sidebar + moduleGroupMap) ============

// Collect all sidebar modules with their labels/icons
const SIDEBAR_MODULES = menuGroups.flatMap(g => g.items)

// Group labels (SR)
const GROUP_LABELS: Record<string, string> = {
  'sidebar.group_overview': 'Pregled',
  'sidebar.group_business': 'Poslovanje',
  'sidebar.group_crm': 'CRM & Partneri',
  'sidebar.group_organization': 'Organizacija',
}

// Module group labels (SR)
const MODULE_GROUP_LABELS: Record<string, string> = {
  'core': 'Core', 'hr': 'HR', 'finance': 'Finansije', 'sales': 'Prodaja',
  'projects': 'Projekti', 'it': 'IT', 'logistics': 'Logistika', 'education': 'Edukacija',
  'hospitality': 'Ugostiteljstvo', 'construction': 'Građevina', 'property': 'Nekretnine',
  'medical': 'Medicina', 'services': 'Servisi', 'retail': 'Trgovina',
}

// Module labels (SR) for all 124 modules
const ALL_MODULE_LABELS: Record<string, string> = {
  // Core
  'dashboard': 'Kontrolna ploča', 'finance': 'Finansije', 'invoices': 'Fakture',
  'inventory': 'Magacin', 'contacts': 'Partneri', 'reports': 'Izveštaji',
  'settings': 'Podešavanja', 'calendar': 'Kalendar', 'documents': 'Dokumenta',
  'offers': 'Ponude', 'expenses': 'Troškovi', 'automation': 'Automatizacija',
  // HR
  'employees': 'Zaposleni', 'recruitment': 'Regrutacija', 'leave': 'Odsustva',
  'skills': 'Veštine', 'approvals': 'Odobrenja', 'workforce-planner': 'Planer radne snage',
  'visitors': 'Posetioci', 'suggestions': 'Predlozi', 'time-tracking': 'Praćenje vremena',
  'time-billing': 'Fakturisanje vremena', 'gamification': 'Gamifikacija', 'signatures': 'Potpisi',
  // Finance
  'accounting': 'Knjigovodstvo', 'bank-sync': 'Banka', 'payments': 'Plaćanja',
  'cash-register': 'Blagajna', 'pos': 'POS', 'subscriptions': 'Pretplate',
  'contracts': 'Ugovori', 'procurement': 'Nabavka', 'procurement-manager': 'Menadžer nabavke',
  'returns': 'Povrati', 'coupons': 'Kuponi', 'price-lists': 'Cenovnici',
  // Sales
  'crm': 'CRM', 'support': 'Podrška', 'email-marketing': 'Email marketing',
  'sms-marketing': 'SMS marketing', 'social-media': 'Društvene mreže',
  'marketing-automation': 'Marketing auto.', 'surveys': 'Ankete', 'events': 'Događaji',
  'loyalty': 'Lojalnost', 'ratings': 'Ocene', 'referrals': 'Preporuke',
  'complaints': 'Žalbe',
  // Projects
  'projects': 'Projekti', 'assets': 'Osnovna sredstva',
  'maintenance': 'Održavanje', 'manufacturing': 'Proizvodnja', 'quality': 'Kvalitet',
  'protocol': 'Protokol', 'plm': 'PLM', 'standards': 'Standardi',
  'labels': 'Etikete', 'barcode': 'Barkod', 'tenders': 'Tenderi', 'warranty': 'Garancije',
  // IT
  'chat': 'Chat', 'knowledge-base': 'Baza znanja', 'website': 'Web sajt',
  'blog': 'Blog', 'forum': 'Forum', 'spreadsheet': 'Tabela', 'notes': 'Beleške',
  'integrations': 'Integracije', 'backup': 'Backup', 'laws': 'Zakoni',
  'iot': 'IoT', 'voip': 'VoIP',
  // Logistics
  'shipping': 'Isporuka', 'fleet': 'Vozni park',
  'rent-a-car': 'Rent a car', 'delivery': 'Dostava', 'routes': 'Rute',
  'loading-dock': 'Rampa utovar', 'customs-docs': 'Carinski dok.', 'trucks': 'Kamioni',
  'packaging': 'Pakovanje', 'measurements': 'Merenja', 'marketplace': 'Marketplace',
  'ecommerce': 'E-commerce',
  // Education
  'education': 'Edukacija', 'homework': 'Domaći zadaci',
  'enrollment': 'Upis', 'timetable': 'Raspored', 'library': 'Biblioteka',
  'classroom': 'Učionica', 'tuition': 'Školovanje',
  // Hospitality
  'restaurant': 'Restoran', 'reservations': 'Rezervacije', 'menu': 'Meni',
  'kitchen': 'Kuhinja', 'orders': 'Porudžbine',
  // Construction
  'construction-site': 'Gradilište', 'blueprints': 'Nacrti', 'subcontractors': 'Podizvođači',
  'safety': 'Bezbednost',
  // Property
  'property': 'Nekretnine', 'rentals': 'Iznajmljivanje',
  'property-viewings': 'Pregledi', 'utilities': 'Komunalije', 'work-orders': 'Radni nalozi',
  'valuation': 'Procena',
  // Medical
  'patients': 'Pacijenti', 'medical-records': 'Zdrav. kartoni',
  'prescriptions': 'Recepti', 'lab': 'Laboratorija', 'health-fund': 'Zdrav. fond',
  // Services
  'service-center': 'Servis', 'field-service': 'Terenski servis',
  'appointments': 'Zakazivanja', 'scheduler': 'Planer', 'compliance': 'Usklađenost',
  // Retail
  'stores': 'Poslovnice', 'client-portal': 'Klijentski portal', 'seo': 'SEO',
  'reviews': 'Recenzije', 'cms': 'CMS', 'geolocation': 'Geolokacija',
  'cameras': 'Kamere', 'messaging': 'Poruke',
}

// Get all unique module keys
const ALL_MODULE_KEYS = Object.keys(moduleGroupMap)

// Group modules by their moduleGroupMap group
const modulesByGroup = ALL_MODULE_KEYS.reduce((acc, key) => {
  const group = moduleGroupMap[key]
  if (!acc[group]) acc[group] = []
  acc[group].push(key)
  return acc
}, {} as Record<string, string[]>)

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
  active_languages: string // JSON array of language codes, e.g. '["sr","sr-latn","en"]'
}

const DEFAULT_ACTIVE_LANGUAGES = ['sr', 'sr-latn', 'en']

const GENERAL_DEFAULTS: GeneralSettings = {
  default_currency: 'RSD',
  default_tax_rate: '20',
  default_payment_method: 'racun',
  fiscal_year_start: '1',
  language: 'sr',
  active_languages: JSON.stringify(DEFAULT_ACTIVE_LANGUAGES),
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

// ============ ACTIVE LANGUAGES PICKER ============

function ActiveLanguagesPicker({ activeCodes, onToggle }: { activeCodes: string[]; onToggle: (code: string) => void }) {
  const [search, setSearch] = useState('')
  const { t } = useTranslation()

  const filtered = search.length > 0
    ? ALL_LANGUAGES.filter(
        (l) =>
          l.nativeName.toLowerCase().includes(search.toLowerCase()) ||
          l.englishName.toLowerCase().includes(search.toLowerCase())
      )
    : ALL_LANGUAGES

  // Group by region
  const regionRanges: Array<{ label: string; start: number; end: number }> = [
    { label: 'Evropa', start: 0, end: 45 },
    { label: 'Azija', start: 45, end: 72 },
    { label: 'Afrika', start: 72, end: 80 },
    { label: 'Amerike', start: 80, end: 86 },
    { label: 'Okeanija', start: 86, end: 90 },
    { label: 'Ostalo', start: 90, end: ALL_LANGUAGES.length },
  ]

  return (
    <div>
      <div className="relative mb-3">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={t('common.search') || 'Pretraga...'}
          className="flex h-9 w-full rounded-md border border-input bg-background pl-9 pr-3 py-1 text-sm outline-none focus:ring-2 focus:ring-ring"
        />
      </div>
      <div className="max-h-64 overflow-y-auto rounded-md border divide-y">
        {filtered.length === 0 && (
          <div className="py-6 text-center text-sm text-muted-foreground">{t('common.noResults')}</div>
        )}
        {regionRanges
          .filter((r) => filtered.some((l) => ALL_LANGUAGES.indexOf(l) >= r.start && ALL_LANGUAGES.indexOf(l) < r.end))
          .map((region) => (
            <div key={region.label}>
              <div className="px-3 py-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider bg-muted/50 sticky top-0">
                {region.label}
              </div>
              {filtered
                .filter((l) => {
                  const idx = ALL_LANGUAGES.indexOf(l)
                  return idx >= region.start && idx < region.end
                })
                .map((lang) => {
                  const isActive = activeCodes.includes(lang.code)
                  return (
                    <button
                      key={lang.code}
                      type="button"
                      onClick={() => onToggle(lang.code)}
                      className={cn(
                        'flex w-full items-center gap-2.5 px-3 py-2 text-sm hover:bg-accent/50 transition-colors',
                        isActive && 'bg-primary/5'
                      )}
                    >
                      <div
                        className={cn(
                          'flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-colors',
                          isActive
                            ? 'border-primary bg-primary text-primary-foreground'
                            : 'border-muted-foreground/30'
                        )}
                      >
                        {isActive && <Check className="h-3 w-3" />}
                      </div>
                      <span className="shrink-0 text-base">{lang.flag}</span>
                      <span className="flex-1 text-left truncate">{lang.nativeName}</span>
                      <span className="text-xs text-muted-foreground shrink-0">{lang.englishName}</span>
                    </button>
                  )
                })}
            </div>
          ))}
      </div>
    </div>
  )
}

// ============ MAIN COMPONENT ============

export function Settings() {
  const { t, locale, setLocale } = useTranslation()

  // Theme store
  const {
    primaryColor,
    primaryForeground,
    accentColor,
    sidebarColor,
    sidebarForeground,
    borderRadius,
    logo,
    companyName: themeCompanyName,
    _initialized,
    updateThemeSettings,
    resetTheme,
  } = useThemeStore()

  // Modules state — now uses all 124 modules from moduleGroupMap
  const [enabledModuleKeys, setEnabledModuleKeys] = useState<Set<string>>(new Set(ALL_MODULE_KEYS))
  const [modulesLoading, setModulesLoading] = useState(true)
  const [modulesSaving, setModulesSaving] = useState(false)
  const [moduleSearch, setModuleSearch] = useState('')

  // Company state
  const [company, setCompany] = useState<CompanySettings>({ ...COMPANY_DEFAULTS })
  const [companyLoading, setCompanyLoading] = useState(true)
  const [companySaving, setCompanySaving] = useState(false)

  // General state
  const [general, setGeneral] = useState<GeneralSettings>({ ...GENERAL_DEFAULTS })
  const [generalLoading, setGeneralLoading] = useState(true)
  const [generalSaving, setGeneralSaving] = useState(false)

  // Appearance local state (for live preview before save)
  const [localPrimary, setLocalPrimary] = useState(primaryColor)
  const [localPrimaryFg, setLocalPrimaryFg] = useState(primaryForeground)
  const [localAccent, setLocalAccent] = useState(accentColor)
  const [localSidebar, setLocalSidebar] = useState(sidebarColor)
  const [localSidebarFg, setLocalSidebarFg] = useState(sidebarForeground)
  const [localRadius, setLocalRadius] = useState(borderRadius)
  const [localCompanyName, setLocalCompanyName] = useState(themeCompanyName)
  const [themeSaving, setThemeSaving] = useState(false)
  const [themeResetting, setThemeResetting] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Active tab
  const [activeTab, setActiveTab] = useState('moduli')

  // Active languages helper
  const activeLangCodes: string[] = (() => {
    try { return JSON.parse(general.active_languages) || DEFAULT_ACTIVE_LANGUAGES }
    catch { return DEFAULT_ACTIVE_LANGUAGES }
  })()

  const toggleActiveLang = (code: string) => {
    setGeneral((prev) => {
      const current = (() => {
        try { return JSON.parse(prev.active_languages) || [...DEFAULT_ACTIVE_LANGUAGES] }
        catch { return [...DEFAULT_ACTIVE_LANGUAGES] }
      })()
      const next = current.includes(code)
        ? current.filter((c: string) => c !== code)
        : [...current, code]
      return { ...prev, active_languages: JSON.stringify(next) }
    })
  }

  // ============ SYNC THEME STATE ============

  useEffect(() => {
    if (_initialized) {
      setLocalPrimary(primaryColor)
      setLocalPrimaryFg(primaryForeground)
      setLocalAccent(accentColor)
      setLocalSidebar(sidebarColor)
      setLocalSidebarFg(sidebarForeground)
      setLocalRadius(borderRadius)
      setLocalCompanyName(themeCompanyName)
    }
  }, [_initialized, primaryColor, primaryForeground, accentColor, sidebarColor, sidebarForeground, borderRadius, themeCompanyName])

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
        const enabledKeys = data
          .filter((s) => s.value === 'true')
          .map((s) => s.key)
        setEnabledModuleKeys(new Set(enabledKeys))
      }
      setModulesLoading(false)
    })

    // Fetch company settings
    fetchSettings('company').then((data) => {
      if (data.length > 0) {
        const map: Record<string, string> = {}
        data.forEach((s) => { map[s.key] = s.value })
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
        data.forEach((s) => { map[s.key] = s.value })
        setGeneral((prev) => ({
          ...prev,
          default_currency: map['default_currency'] || prev.default_currency,
          default_tax_rate: map['default_tax_rate'] || prev.default_tax_rate,
          default_payment_method: map['default_payment_method'] || prev.default_payment_method,
          fiscal_year_start: map['fiscal_year_start'] || prev.fiscal_year_start,
          language: map['language'] || prev.language,
          active_languages: map['active_languages'] || prev.active_languages,
        }))
      }
      setGeneralLoading(false)
    })
  }, [fetchSettings])

  // ============ SAVE HANDLERS ============

  const handleSaveModules = async () => {
    setModulesSaving(true)
    try {
      const items = ALL_MODULE_KEYS.map((key) => ({
        key,
        value: String(enabledModuleKeys.has(key)),
        label: ALL_MODULE_LABELS[key] || key,
        type: 'boolean',
        group: 'modules',
      }))
      const res = await fetch('/api/settings', {
        method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(items),
      })
      if (!res.ok) throw new Error('Greška')
      // Also sync to Zustand store so sidebar updates immediately
      const { setEnabledModules } = useAppStore.getState()
      setEnabledModules([...enabledModuleKeys])
      toast.success(t('settings.modulesSaved'))
    } catch {
      toast.error(t('settings.modulesSaveError'))
    } finally { setModulesSaving(false) }
  }

  const handleSaveCompany = async () => {
    setCompanySaving(true)
    try {
      const items: Array<{ key: string; value: string; label: string; type: string; group: string }> = []
      const labels: Record<string, string> = {
        company_name: t('settings.companyName'),
        company_pib: t('settings.companyPIB'),
        company_maticni_broj: t('settings.companyRegistration'),
        company_address: t('settings.companyAddress'),
        company_city: t('settings.companyCity'),
        company_zip: t('settings.companyZip'),
        company_phone: t('settings.companyPhone'),
        company_email: t('settings.companyEmail'),
        company_website: t('settings.companyWebsite'),
        company_bank_account: t('settings.companyBankAccount'),
      }
      Object.entries(company).forEach(([key, value]) => {
        items.push({ key, value, label: labels[key] || key, type: 'text', group: 'company' })
      })
      const res = await fetch('/api/settings', {
        method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(items),
      })
      if (!res.ok) throw new Error('Greška')
      toast.success(t('settings.companySaved'))
    } catch {
      toast.error(t('settings.companySaveError'))
    } finally { setCompanySaving(false) }
  }

  const handleSaveGeneral = async () => {
    setGeneralSaving(true)
    try {
      const items: Array<{ key: string; value: string; label: string; type: string; group: string }> = []
      const labels: Record<string, string> = {
        default_currency: t('settings.defaultCurrency'),
        default_tax_rate: t('settings.defaultTaxRate'),
        default_payment_method: t('settings.defaultPaymentMethod'),
        fiscal_year_start: t('settings.fiscalYearStart'),
        language: t('settings.language'),
      }
      Object.entries(general).forEach(([key, value]) => {
        items.push({ key, value, label: labels[key] || key, type: 'text', group: 'general' })
      })
      const res = await fetch('/api/settings', {
        method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(items),
      })
      if (!res.ok) throw new Error('Greška')
      // Also update locale if language changed
      setLocale(general.language)
      toast.success(t('settings.generalSaved'))
    } catch {
      toast.error(t('settings.generalSaveError'))
    } finally { setGeneralSaving(false) }
  }

  // ============ APPEARANCE HANDLERS ============

  const handleApplyPreset = (preset: typeof themePresets[0]) => {
    setLocalPrimary(preset.settings.primaryColor)
    setLocalPrimaryFg(preset.settings.primaryForeground)
    setLocalAccent(preset.settings.accentColor)
    setLocalSidebar(preset.settings.sidebarColor)
    setLocalSidebarFg(preset.settings.sidebarForeground)
    setLocalRadius(preset.settings.borderRadius)
  }

  const handleSaveTheme = async () => {
    setThemeSaving(true)
    try {
      await updateThemeSettings({
        primaryColor: localPrimary,
        primaryForeground: localPrimaryFg,
        accentColor: localAccent,
        sidebarColor: localSidebar,
        sidebarForeground: localSidebarFg,
        borderRadius: localRadius,
        companyName: localCompanyName,
      })
      toast.success(t('common.saveSuccess'))
    } catch {
      toast.error(t('common.errorOccurred'))
    } finally { setThemeSaving(false) }
  }

  const handleResetTheme = async () => {
    setThemeResetting(true)
    try {
      await resetTheme()
      toast.success(t('common.reset'))
    } catch {
      toast.error(t('common.errorOccurred'))
    } finally { setThemeResetting(false) }
  }

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 500000) {
      toast.error('Logo mora biti manji od 500KB')
      return
    }

    const reader = new FileReader()
    reader.onload = () => {
      updateThemeSettings({ logo: reader.result as string })
      toast.success(t('common.saveSuccess'))
    }
    reader.readAsDataURL(file)
  }

  const handleRemoveLogo = () => {
    updateThemeSettings({ logo: null })
    if (fileInputRef.current) fileInputRef.current.value = ''
    toast.success(t('common.saveSuccess'))
  }

  // ============ HELPERS ============

  const enabledCount = enabledModuleKeys.size
  const totalModules = ALL_MODULE_KEYS.length

  // Filter modules by search
  const filteredGroups = Object.entries(modulesByGroup)
    .map(([group, keys]) => ({
      group,
      label: MODULE_GROUP_LABELS[group] || group,
      modules: keys.filter(key => {
        if (!moduleSearch) return true
        const label = (ALL_MODULE_LABELS[key] || key).toLowerCase()
        return label.includes(moduleSearch.toLowerCase())
      }),
    }))
    .filter(g => g.modules.length > 0)

  const toggleModule = (key: string) => {
    setEnabledModuleKeys(prev => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })
  }

  const enableAllModules = () => setEnabledModuleKeys(new Set(ALL_MODULE_KEYS))
  const disableAllModules = () => setEnabledModuleKeys(new Set())

  const MONTH_LABELS: Record<string, string> = {
    '1': 'Januar', '2': 'Februar', '3': 'Mart', '4': 'April',
    '5': 'Maj', '6': 'Jun', '7': 'Jul', '8': 'Avgust',
    '9': 'Septembar', '10': 'Oktobar', '11': 'Novembar', '12': 'Decembar',
  }

  // Check if theme matches any preset
  const isPresetActive = (preset: typeof themePresets[0]) =>
    preset.settings.primaryColor === localPrimary

  // ============ COLOR PICKER COMPONENT ============

  const ColorPicker = ({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) => (
    <div className="flex items-center gap-3">
      <div className="relative">
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="h-10 w-10 cursor-pointer rounded-lg border-2 border-border p-0.5"
        />
      </div>
      <div className="flex-1">
        <Label className="text-xs text-muted-foreground">{label}</Label>
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="h-8 text-xs font-mono mt-1"
          maxLength={7}
        />
      </div>
    </div>
  )

  // ============ RENDER ============

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <SettingsIcon className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">{t('settings.title')}</h1>
          <p className="text-sm text-muted-foreground mt-1">{t('settings.subtitle')}</p>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-11 lg:w-[1200px]">
          <TabsTrigger value="moduli" className="gap-1.5 text-xs sm:text-sm">
            <Blocks className="h-4 w-4 hidden sm:block" />
            <span className="hidden sm:inline">{t('settings.tab_modules')}</span>
          </TabsTrigger>
          <TabsTrigger value="firma" className="gap-1.5 text-xs sm:text-sm">
            <Building2 className="h-4 w-4 hidden sm:block" />
            <span className="hidden sm:inline">{t('settings.tab_company')}</span>
          </TabsTrigger>
          <TabsTrigger value="opste" className="gap-1.5 text-xs sm:text-sm">
            <SlidersHorizontal className="h-4 w-4 hidden sm:block" />
            <span className="hidden sm:inline">{t('settings.tab_general')}</span>
          </TabsTrigger>
          <TabsTrigger value="izgled" className="gap-1.5 text-xs sm:text-sm">
            <Palette className="h-4 w-4 hidden sm:block" />
            <span className="hidden sm:inline">{t('settings.tab_appearance')}</span>
          </TabsTrigger>
          <TabsTrigger value="korisnici" className="gap-1.5 text-xs sm:text-sm">
            <Users className="h-4 w-4" />
            <span className="hidden sm:inline">Korisnici</span>
          </TabsTrigger>
          <TabsTrigger value="api" className="gap-1.5 text-xs sm:text-sm">
            <Key className="h-4 w-4" />
            <span className="hidden sm:inline">API</span>
          </TabsTrigger>
          <TabsTrigger value="uloge" className="gap-1.5 text-xs sm:text-sm">
            <Shield className="h-4 w-4" />
            <span className="hidden sm:inline">Uloge</span>
          </TabsTrigger>
          <TabsTrigger value="audit" className="gap-1.5 text-xs sm:text-sm">
            <History className="h-4 w-4" />
            <span className="hidden sm:inline">Audit</span>
          </TabsTrigger>
          <TabsTrigger value="webhooks" className="gap-1.5 text-xs sm:text-sm">
            <Webhook className="h-4 w-4" />
            <span className="hidden sm:inline">Webhooks</span>
          </TabsTrigger>
          <TabsTrigger value="namene" className="gap-1.5 text-xs sm:text-sm">
            <Compass className="h-4 w-4" />
            <span className="hidden sm:inline">Namene</span>
          </TabsTrigger>
          <TabsTrigger value="org" className="gap-1.5 text-xs sm:text-sm">
            <Network className="h-4 w-4" />
            <span className="hidden sm:inline">Organizacije</span>
          </TabsTrigger>
        </TabsList>

        {/* ============ MODULI TAB ============ */}
        <TabsContent value="moduli" className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <p className="text-sm text-muted-foreground">{t('settings.modulesSubtitle')}</p>
              <Badge variant="secondary" className="text-xs">
                {enabledCount}/{totalModules} {t('settings.active')}
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" className="gap-1.5 text-xs" onClick={() => openAISetupWizard()}>
                <Sparkles className="h-3.5 w-3.5" />
                AI Setup
              </Button>
            </div>
          </div>

          {/* Search + Bulk actions */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Pretraži module..."
                value={moduleSearch}
                onChange={(e) => setModuleSearch(e.target.value)}
                className="pl-9 h-9"
              />
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="text-xs gap-1" onClick={enableAllModules}>
                <Check className="h-3 w-3" /> Aktiviraj sve
              </Button>
              <Button variant="outline" size="sm" className="text-xs gap-1" onClick={disableAllModules}>
                <X className="h-3 w-3" /> Deaktiviraj sve
              </Button>
            </div>
          </div>

          {modulesLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="h-5 w-32 bg-muted rounded mb-3" />
                  <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                    {Array.from({ length: 3 }).map((_, j) => (
                      <div key={j} className="h-12 bg-muted rounded" />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-6">
              {filteredGroups.map(({ group, label, modules: groupModules }) => {
                const enabledInGroup = groupModules.filter(k => enabledModuleKeys.has(k)).length
                return (
                  <div key={group}>
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-sm font-semibold text-foreground">{label}</h3>
                      <Badge variant="secondary" className="text-[10px] px-1.5">
                        {enabledInGroup}/{groupModules.length}
                      </Badge>
                    </div>
                    <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                      {groupModules.map(key => {
                        const isEnabled = enabledModuleKeys.has(key)
                        const modLabel = ALL_MODULE_LABELS[key] || key
                        const isInSidebar = SIDEBAR_MODULES.some(m => m.module === key)

                        return (
                          <div
                            key={key}
                            className={cn(
                              'flex items-center justify-between gap-2 px-3 py-2 rounded-lg border transition-all',
                              isEnabled
                                ? 'border-primary/20 bg-primary/[0.02]'
                                : 'border-border opacity-50 hover:opacity-80'
                            )}
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              {isInSidebar && (
                                <div className="h-1.5 w-1.5 rounded-full bg-primary shrink-0" title="U sidebar-u" />
                              )}
                              <span className="text-sm text-foreground truncate">{modLabel}</span>
                            </div>
                            <Switch
                              checked={isEnabled}
                              onCheckedChange={() => toggleModule(key)}
                              className="shrink-0 scale-90"
                            />
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          <div className="flex items-center justify-between pt-2">
            <p className="text-xs text-muted-foreground">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-primary mr-1" />
              = modul u sidebar-u
            </p>
            <Button onClick={handleSaveModules} disabled={modulesSaving}>
              {modulesSaving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
              {t('settings.saveModules')}
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
                  <CardTitle className="text-base">{t('settings.companySettings')}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="company_name">{t('settings.companyName')}</Label>
                      <Input id="company_name" placeholder="Unesite naziv firme" value={company.company_name}
                        onChange={(e) => setCompany((prev) => ({ ...prev, company_name: e.target.value }))} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="company_pib">{t('settings.companyPIB')}</Label>
                      <Input id="company_pib" placeholder="npr. 123456789" value={company.company_pib}
                        onChange={(e) => setCompany((prev) => ({ ...prev, company_pib: e.target.value }))} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="company_maticni_broj">{t('settings.companyRegistration')}</Label>
                      <Input id="company_maticni_broj" placeholder="npr. 12345678" value={company.company_maticni_broj}
                        onChange={(e) => setCompany((prev) => ({ ...prev, company_maticni_broj: e.target.value }))} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="company_zip">{t('settings.companyZip')}</Label>
                      <Input id="company_zip" placeholder="npr. 11000" value={company.company_zip}
                        onChange={(e) => setCompany((prev) => ({ ...prev, company_zip: e.target.value }))} />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="company_address">{t('settings.companyAddress')}</Label>
                    <Input id="company_address" placeholder="Ulica i broj" value={company.company_address}
                      onChange={(e) => setCompany((prev) => ({ ...prev, company_address: e.target.value }))} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="company_city">{t('settings.companyCity')}</Label>
                    <Input id="company_city" placeholder="Unesite grad" value={company.company_city}
                      onChange={(e) => setCompany((prev) => ({ ...prev, company_city: e.target.value }))} />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-4">
                  <CardTitle className="text-base">{t('settings.contactInfo')}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="company_phone">{t('settings.companyPhone')}</Label>
                      <Input id="company_phone" placeholder="+381 11 123 4567" value={company.company_phone}
                        onChange={(e) => setCompany((prev) => ({ ...prev, company_phone: e.target.value }))} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="company_email">{t('settings.companyEmail')}</Label>
                      <Input id="company_email" type="email" placeholder="info@firma.rs" value={company.company_email}
                        onChange={(e) => setCompany((prev) => ({ ...prev, company_email: e.target.value }))} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="company_website">{t('settings.companyWebsite')}</Label>
                      <Input id="company_website" placeholder="www.firma.rs" value={company.company_website}
                        onChange={(e) => setCompany((prev) => ({ ...prev, company_website: e.target.value }))} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="company_bank_account">{t('settings.companyBankAccount')}</Label>
                      <Input id="company_bank_account" placeholder="160-0000000000000-00" value={company.company_bank_account}
                        onChange={(e) => setCompany((prev) => ({ ...prev, company_bank_account: e.target.value }))} />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="flex justify-end">
                <Button onClick={handleSaveCompany} disabled={companySaving}>
                  {companySaving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                  {t('settings.saveCompany')}
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
                  <CardTitle className="text-base">{t('settings.financialSettings')}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="default_currency">{t('settings.defaultCurrency')}</Label>
                      <Select value={general.default_currency} onValueChange={(val) => setGeneral((prev) => ({ ...prev, default_currency: val }))}>
                        <SelectTrigger id="default_currency"><SelectValue placeholder="Izaberite valutu" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="RSD">RSD - Srpski dinar</SelectItem>
                          <SelectItem value="EUR">EUR - Evro</SelectItem>
                          <SelectItem value="USD">USD - Americki dolar</SelectItem>
                          <SelectItem value="CHF">CHF - Svajcarski franak</SelectItem>
                          <SelectItem value="GBP">GBP - Britanska funta</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="default_tax_rate">{t('settings.defaultTaxRate')} (%)</Label>
                      <Input id="default_tax_rate" type="number" min="0" max="100" step="0.01"
                        value={general.default_tax_rate}
                        onChange={(e) => setGeneral((prev) => ({ ...prev, default_tax_rate: e.target.value }))} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="default_payment_method">{t('settings.defaultPaymentMethod')}</Label>
                      <Select value={general.default_payment_method} onValueChange={(val) => setGeneral((prev) => ({ ...prev, default_payment_method: val }))}>
                        <SelectTrigger id="default_payment_method"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="racun">Racun - Transakcijski racun</SelectItem>
                          <SelectItem value="gotovina">Gotovina</SelectItem>
                          <SelectItem value="kartica">Kartica</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="fiscal_year_start">{t('settings.fiscalYearStart')}</Label>
                      <Select value={general.fiscal_year_start} onValueChange={(val) => setGeneral((prev) => ({ ...prev, fiscal_year_start: val }))}>
                        <SelectTrigger id="fiscal_year_start"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {Object.entries(MONTH_LABELS).map(([val, label]) => (
                            <SelectItem key={val} value={val}>{label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2 sm:col-span-2">
                      <Label htmlFor="language">{t('settings.language')}</Label>
                      <Select value={general.language} onValueChange={(val) => setGeneral((prev) => ({ ...prev, language: val }))}>
                        <SelectTrigger id="language" className="sm:max-w-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {ALL_LANGUAGES.filter((l) => activeLangCodes.includes(l.code)).map((lang) => (
                            <SelectItem key={lang.code} value={lang.code} className="text-xs">
                              <span className="mr-1.5">{lang.flag}</span>
                              {lang.nativeName}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-muted-foreground">Izaberite aktivni jezik za interfejs</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Active Languages Selector - which languages show in header */}
              <Card>
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">Jezici za prebacivanje</CardTitle>
                    <Badge variant="secondary" className="text-xs">{activeLangCodes.length}</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">Izaberite koji jezici će biti dostupni za brzo prebacivanje u header-u</p>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Search */}
                  <ActiveLanguagesPicker
                    activeCodes={activeLangCodes}
                    onToggle={toggleActiveLang}
                  />
                </CardContent>
              </Card>

              <div className="flex justify-end">
                <Button onClick={handleSaveGeneral} disabled={generalSaving}>
                  {generalSaving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                  {t('settings.saveGeneral')}
                </Button>
              </div>
            </>
          )}
        </TabsContent>

        {/* ============ IZGLED (APPEARANCE) TAB ============ */}
        <TabsContent value="izgled" className="space-y-6">
          {/* Theme Presets */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-base">{t('settings.theme')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-4 sm:grid-cols-8 gap-3">
                {themePresets.map((preset) => (
                  <button
                    key={preset.nameEn}
                    onClick={() => handleApplyPreset(preset)}
                    className={cn(
                      'group flex flex-col items-center gap-2 p-2 rounded-xl border-2 transition-all duration-200 hover:shadow-md',
                      isPresetActive(preset)
                        ? 'border-primary bg-primary/5 shadow-sm'
                        : 'border-transparent hover:border-border'
                    )}
                    title={preset.name}
                  >
                    <div
                      className="h-10 w-10 rounded-full border-2 border-white shadow-md transition-transform group-hover:scale-110"
                      style={{ backgroundColor: preset.settings.primaryColor }}
                    />
                    <span className="text-xs text-muted-foreground leading-tight text-center">
                      {locale === 'en' ? preset.nameEn : preset.name.split(' ')[0]}
                    </span>
                    {isPresetActive(preset) && (
                      <div className="absolute -top-1 -right-1 flex h-4 w-4 rounded-full bg-primary items-center justify-center">
                        <Check className="h-2.5 w-2.5 text-primary-foreground" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Custom Colors */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-base">{t('settings.appearanceSettings')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              {/* Primary Color */}
              <div className="space-y-4">
                <h4 className="text-sm font-medium text-foreground">Boje elemenata</h4>
                <div className="grid gap-4 sm:grid-cols-2">
                  <ColorPicker label="Primarna boja" value={localPrimary} onChange={setLocalPrimary} />
                  <ColorPicker label="Primarni tekst" value={localPrimaryFg} onChange={setLocalPrimaryFg} />
                  <ColorPicker label="Boja akcenta" value={localAccent} onChange={setLocalAccent} />
                  <ColorPicker label="Zaobljenost ivica" value={localRadius} onChange={setLocalRadius} />
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <ColorPicker label="Boja bočne trake" value={localSidebar} onChange={setLocalSidebar} />
                  <ColorPicker label="Tekst bočne trake" value={localSidebarFg} onChange={setLocalSidebarFg} />
                </div>
              </div>

              {/* Border Radius Slider */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-sm">Zaobljenost ivica</Label>
                  <span className="text-xs font-mono text-muted-foreground">{localRadius}</span>
                </div>
                <Slider
                  value={[parseFloat(localRadius) || 0]}
                  min={0}
                  max={1.5}
                  step={0.125}
                  onValueChange={([v]) => setLocalRadius(v.toFixed(3) + 'rem')}
                />
                <div className="flex gap-2 mt-1">
                  {['0', '0.375', '0.625', '1', '1.5'].map((r) => (
                    <button
                      key={r}
                      onClick={() => setLocalRadius(r + 'rem')}
                      className={cn(
                        'h-8 w-8 rounded-full border-2 transition-all',
                        localRadius === r + 'rem' ? 'border-primary bg-primary/10' : 'border-border hover:border-primary/40'
                      )}
                      style={{ borderRadius: r + 'rem' }}
                    />
                  ))}
                </div>
              </div>

              {/* Preview */}
              <div className="space-y-2">
                <Label className="text-sm">Pregled</Label>
                <div className="flex flex-wrap gap-3">
                  <div
                    className="h-20 w-20 rounded-lg flex items-center justify-center text-xs font-medium shadow-sm"
                    style={{ backgroundColor: localPrimary, color: localPrimaryFg, borderRadius: localRadius }}
                  >
                    Primary
                  </div>
                  <div
                    className="h-20 w-20 rounded-lg flex items-center justify-center text-xs font-medium shadow-sm border"
                    style={{ backgroundColor: localAccent, borderRadius: localRadius }}
                  >
                    Accent
                  </div>
                  <div
                    className="h-20 w-20 rounded-lg flex items-center justify-center text-xs font-medium shadow-sm"
                    style={{ backgroundColor: localSidebar, color: localSidebarFg, borderRadius: localRadius }}
                  >
                    Sidebar
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Logo & Branding */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-base">Logo i brending</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Logo Upload */}
              <div className="space-y-3">
                <Label className="text-sm">Logo kompanije</Label>
                <div className="flex items-center gap-4">
                  <div
                    className="h-20 w-20 rounded-xl border-2 border-dashed border-border flex items-center justify-center overflow-hidden"
                    style={{ borderRadius: localRadius }}
                  >
                    {logo ? (
                      <img src={logo} alt="Logo" className="h-16 w-16 object-contain p-1" />
                    ) : (
                      <ImageIcon className="h-8 w-8 text-muted-foreground/40" />
                    )}
                  </div>
                  <div className="flex flex-col gap-2">
                    <Button type="button" variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
                      <Upload className="h-4 w-4 mr-2" />
                      {logo ? t('common.edit') : t('common.upload')}
                    </Button>
                    {logo && (
                      <Button type="button" variant="ghost" size="sm" className="text-destructive hover:text-destructive" onClick={handleRemoveLogo}>
                        {t('common.delete')}
                      </Button>
                    )}
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleLogoUpload}
                      className="hidden"
                    />
                    <p className="text-xs text-muted-foreground">PNG, JPG, SVG (max 500KB)</p>
                  </div>
                </div>
              </div>

              {/* Company Name for Sidebar */}
              <div className="space-y-2">
                <Label htmlFor="theme_company_name">Naziv u bočnoj traci</Label>
                <Input
                  id="theme_company_name"
                  placeholder="Reflection"
                  value={localCompanyName}
                  onChange={(e) => setLocalCompanyName(e.target.value)}
                  maxLength={20}
                />
                <p className="text-xs text-muted-foreground">Prikažite vaš naziv kompanije umesto &quot;Reflection&quot; u bočnoj traci</p>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-2">
            <Button variant="outline" onClick={handleResetTheme} disabled={themeResetting}>
              {themeResetting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <RotateCcw className="h-4 w-4 mr-2" />}
              {t('common.reset')}
            </Button>
            <Button onClick={handleSaveTheme} disabled={themeSaving}>
              {themeSaving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
              {t('common.save')}
            </Button>
          </div>
        </TabsContent>

        {/* ============ KORISNICI TAB ============ */}
        <TabsContent value="korisnici">
          <UserManagement />
        </TabsContent>

        {/* ============ API TAB ============ */}
        <TabsContent value="api">
          <ApiKeyManagement />
        </TabsContent>

        {/* ============ ULOGE (PERMISSIONS) TAB ============ */}
        <TabsContent value="uloge">
          <PermissionsEditor />
        </TabsContent>

        {/* ============ AUDIT LOG TAB ============ */}
        <TabsContent value="audit">
          <AuditLogViewer />
        </TabsContent>

        {/* ============ WEBHOOKS TAB ============ */}
        <TabsContent value="webhooks">
          <WebhookManager />
        </TabsContent>

        {/* ============ NAMENE (INDUSTRY TEMPLATES) TAB ============ */}
        <TabsContent value="namene">
          <IndustryTemplates />
        </TabsContent>

        {/* ============ ORGANIZACIJE TAB ============ */}
        <TabsContent value="org">
          <OrganizationManager />
        </TabsContent>
      </Tabs>
    </div>
  )
}
