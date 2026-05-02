'use client'

import { useEffect } from 'react'
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar'
import { AppSidebar } from '@/components/modules/AppSidebar'
import { Footer } from '@/components/modules/Footer'
import { AIAssistant } from '@/components/modules/AIAssistant'
import { GlobalSearch } from '@/components/modules/GlobalSearch'
import { ThemeToggle } from '@/components/theme-toggle'
import { NotificationBell } from '@/components/modules/NotificationBell'
import { NotificationCenter } from '@/components/modules/NotificationCenter'
import { AppLauncher, openAppLauncher } from '@/components/modules/AppLauncher'
import { AISetupWizard, openAISetupWizard } from '@/components/modules/AISetupWizard'
import { AuthPage } from '@/components/modules/AuthPage'
import { CompanySwitcher } from '@/components/modules/CompanySwitcher'
import { UserMenu } from '@/components/modules/UserMenu'
import { useAppStore } from '@/lib/store'
import { useWindowManager } from '@/lib/windowManager'
import { DesktopMode } from '@/components/window-manager/DesktopMode'
import { moduleComponents } from '@/lib/moduleMap'
import { useThemeStore } from '@/lib/theme'
import { I18nProvider, useTranslation, ALL_LANGUAGES, ContentTranslationProvider } from '@/lib/i18n'
import { Separator } from '@/components/ui/separator'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { motion, AnimatePresence } from 'framer-motion'
import { Languages, Loader2, Monitor, MonitorOff } from 'lucide-react'
import { useState } from 'react'

// Default active languages if not configured
const DEFAULT_ACTIVE_LANGS = ['sr', 'sr-latn', 'en']

// ============ MODULES MAP ============
// (moved to src/lib/moduleMap.tsx to avoid circular dependency)

// ============ MODULE LABEL KEYS (for i18n) ============

const moduleLabelKeys: Record<string, string> = {
  dashboard: 'sidebar.dashboard',
  finansije: 'sidebar.finances',
  fakture: 'sidebar.invoices',
  magacin: 'sidebar.warehouse',
  partneri: 'sidebar.partners',
  nabavka: 'sidebar.procurement',
  crm: 'sidebar.crm',
  kalendar: 'sidebar.calendar',
  zaposleni: 'sidebar.employees',
  projekti: 'sidebar.projects',
  sredstva: 'sidebar.assets',
  dokumenta: 'sidebar.documents',
  knjigovodstvo: 'sidebar.accounting',
  protokol: 'sidebar.protocol',
  edukacija: 'sidebar.education',
  'vozni-park': 'sidebar.vehicleFleet',
  'kafe-restoran': 'sidebar.cafeRestaurant',
  'email-marketing': 'sidebar.emailMarketing',
  'rent-a-car': 'sidebar.rentACar',
  izvestaji: 'sidebar.reports',
  integracije: 'sidebar.integrations',
  'bank-sync': 'sidebar.bank',
  podesavanja: 'sidebar.settings',
  notifications: 'notifications.title',
  zakoni: 'zakoni.title',
  pos: 'sidebar.pos',
  shipping: 'sidebar.shipping',
  marketplace: 'sidebar.marketplace',
  ponude: 'sidebar.quotes',
  pretplate: 'sidebar.subscriptions',
  troskovi: 'sidebar.expenses',
  potpisi: 'sidebar.sign',
  proizvodnja: 'sidebar.manufacturing',
  kvalitet: 'sidebar.quality',
  odrzavanje: 'sidebar.maintenance',
  regrutacija: 'sidebar.recruitment',
  odsustva: 'sidebar.timeoff',
  preporuke: 'sidebar.referrals',
  podrska: 'sidebar.helpdesk',
  'terenski-servis': 'sidebar.fieldService',
  zakazivanja: 'sidebar.appointments',
  planer: 'sidebar.planning',
  'drustvene-mreze': 'sidebar.social',
  'sms-marketing': 'sidebar.sms',
  dogadjaji: 'sidebar.events',
  'mkt-automatizacija': 'sidebar.mktAutomation',
  ankete: 'sidebar.surveys',
  chet: 'sidebar.discuss',
  'baza-znanja': 'sidebar.knowledge',
  website: 'sidebar.website',
  blog: 'sidebar.blog',
  voip: 'sidebar.voip',
  iot: 'sidebar.iot',
  whatsapp: 'sidebar.whatsapp',
  forum: 'sidebar.forum',
  plm: 'sidebar.plm',
  ecommerce: 'sidebar.ecommerce',
  spreadsheet: 'sidebar.spreadsheet',
  beleske: 'sidebar.notes',
  odobrenja: 'sidebar.approvals',
  vestine: 'sidebar.skills',
  ugovori: 'sidebar.contracts',
  ocene: 'sidebar.rating',
  gamifikacija: 'sidebar.gamification',
  reklamacije: 'sidebar.complaints',
  natečaji: 'sidebar.tenders',
  garancije: 'sidebar.warranties',
  servis: 'sidebar.serviceCenter',
  uskladenost: 'sidebar.compliance',
  'program-lojalnosti': 'sidebar.loyalty',
  'planer-radne-sile': 'sidebar.workforce',
  posetioci: 'sidebar.visitors',
  predlozi: 'sidebar.suggestions',
  taksacija: 'sidebar.appraisal',
  'fond-zdravlja': 'sidebar.healthFund',
  geolokacija: 'sidebar.geolocation',
  kamere: 'sidebar.cameras',
  'menadzer-nabavke': 'sidebar.procurementManager',
  cms: 'sidebar.cms',
  // --- New module labels (46) ---
  obaveze: 'sidebar.homework',
  prijave: 'sidebar.enrollment',
  raspored: 'sidebar.timetable',
  biblioteka: 'sidebar.library',
  ucionica: 'sidebar.classroom',
  skolarina: 'sidebar.tuition',
  pacijenti: 'sidebar.patients',
  kartoni: 'sidebar.medicalRecords',
  recepti: 'sidebar.prescriptions',
  laboratorija: 'sidebar.laboratory',
  rezervacije: 'sidebar.reservations',
  jelovnik: 'sidebar.menu',
  kuhinja: 'sidebar.kitchen',
  narudzbe: 'sidebar.orders',
  dostava: 'sidebar.delivery',
  gradiliste: 'sidebar.siteDiary',
  projektovanje: 'sidebar.blueprints',
  subodradaci: 'sidebar.subcontractors',
  merenja: 'sidebar.surveying',
  bezbednost: 'sidebar.safety',
  rute: 'sidebar.routes',
  'utovar-istovar': 'sidebar.loading',
  'carinski-dokument': 'sidebar.customs',
  kamioni: 'sidebar.trucks',
  pakovanje: 'sidebar.packing',
  nekretnine: 'sidebar.properties',
  iznajmljivanje: 'sidebar.rentals',
  'pregledi-nekretnine': 'sidebar.viewings',
  komunalije: 'sidebar.utilities',
  'radni-nalozi': 'sidebar.workOrders',
  normativ: 'sidebar.standards',
  etikete: 'sidebar.labels',
  barkod: 'sidebar.barcode',
  cenovnici: 'sidebar.priceLists',
  kuponi: 'sidebar.coupons',
  recenzije: 'sidebar.reviews',
  seo: 'sidebar.seo',
  naplate: 'sidebar.payments',
  povrat: 'sidebar.returns',
  blagajna: 'sidebar.cashRegister',
  'vremenski-trag': 'sidebar.timeTracking',
  'fakturisanje-vremena': 'sidebar.timeBilling',
  'klijentski-portal': 'sidebar.clientPortal',
  automatizacija: 'sidebar.automation',
  poslovnice: 'sidebar.branches',
  backup: 'sidebar.backup',
}

// ============ INNER APP (needs i18n context) ============

function AppContent() {
  const { activeModule, currentUser, activeCompanyId } = useAppStore()
  const { t, locale, setLocale, isTranslating } = useTranslation()
  const ensureLoaded = useThemeStore((s) => s.ensureLoaded)
  const { isDesktopMode, toggleDesktopMode } = useWindowManager()

  // Show auth page if not logged in
  const showAuth = !currentUser

  // Seed database on first load
  const [seeded, setSeeded] = useState(false)
  if (!seeded) {
    setSeeded(true)
    fetch('/api/seed', { method: 'POST' }).catch(() => {})
  }

  // Auto-generate notifications on mount (debounced)
  useEffect(() => {
    if (!currentUser || !activeCompanyId) return
    const timer = setTimeout(async () => {
      try {
        await fetch('/api/notifications/generate', {
          method: 'POST',
          headers: { 'x-company-id': activeCompanyId },
        })
      } catch { /* silent */ }
    }, 2000)
    return () => clearTimeout(timer)
  }, [currentUser, activeCompanyId])

  // Poll for new notifications every 60 seconds
  useEffect(() => {
    if (!currentUser || !activeCompanyId) return
    const interval = setInterval(async () => {
      try {
        await fetch('/api/notifications/generate', {
          method: 'POST',
          headers: { 'x-company-id': activeCompanyId },
        })
      } catch { /* silent */ }
    }, 60000)
    return () => clearInterval(interval)
  }, [currentUser, activeCompanyId])

  // Active languages from settings
  const [activeLangs, setActiveLangs] = useState<string[]>(DEFAULT_ACTIVE_LANGS)

  // Load active languages from settings
  useEffect(() => {
    if (!activeCompanyId) return
    fetch(`/api/settings?group=general&companyId=${activeCompanyId}`)
      .then((res) => res.ok ? res.json() : [])
      .then((data: Array<{ key: string; value: string }>) => {
        const setting = data?.find((s) => s.key === 'active_languages')
        if (setting?.value) {
          try {
            const parsed = JSON.parse(setting.value)
            if (Array.isArray(parsed) && parsed.length > 0) {
              setActiveLangs(parsed)
            }
          } catch { /* use default */ }
        }
      })
      .catch(() => { /* use default */ })
  }, [activeCompanyId])

  // Initialize theme on mount
  useEffect(() => {
    ensureLoaded()
  }, [ensureLoaded])

  // Filter languages to show in header
  const headerLanguages = ALL_LANGUAGES.filter((l) => activeLangs.includes(l.code))

  // Show auth page
  if (showAuth || !currentUser) {
    return <AuthPage />
  }

  // Desktop mode — show OS-style layout
  if (isDesktopMode) {
    return (
      <>
        <DesktopMode />
        {/* AI Assistant - outside everything */}
        <AIAssistant />
        {/* App Launcher - fullscreen module grid */}
        <AppLauncher />
        {/* AI Setup Wizard - first login module selection */}
        <AISetupWizard />
      </>
    )
  }

  // Normal sidebar mode
  return (
    <>
    <SidebarProvider className="h-svh overflow-hidden">
      <AppSidebar />
      <SidebarInset className="flex-1 flex flex-col overflow-hidden">
        <header className="flex h-14 shrink-0 items-center justify-between gap-2 border-b bg-background px-4">
          <div className="flex items-center gap-2">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <h2 className="text-sm font-medium text-foreground">
              {t(moduleLabelKeys[activeModule] || activeModule)}
            </h2>
          </div>
            <div className="flex items-center gap-2">
              {/* Company Switcher */}
              <CompanySwitcher />

              {/* AI Translation loading indicator */}
              {isTranslating && (
                <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                  <Loader2 className="h-3 w-3 animate-spin text-primary" />
                  <span className="hidden sm:inline">Prevodi se...</span>
                </div>
              )}
              {/* Language Switcher - dropdown with active languages only */}
              {headerLanguages.length > 1 ? (
                <Select value={locale} onValueChange={(val) => setLocale(val)}>
                  <SelectTrigger className="h-8 w-auto min-w-[130px] text-xs">
                    <Languages className="h-3.5 w-3.5 mr-1 text-muted-foreground" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {headerLanguages.map((lang) => (
                      <SelectItem key={lang.code} value={lang.code} className="text-xs">
                        {lang.flag} {lang.nativeName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <button
                  onClick={() => setLocale(headerLanguages[0]?.code || 'sr')}
                  className="flex h-8 items-center gap-1.5 rounded-md border border-input bg-background px-2.5 text-xs"
                >
                  <span>{headerLanguages[0]?.flag || '🌐'}</span>
                  <span>{headerLanguages[0]?.nativeName || 'SR'}</span>
                </button>
              )}
              <GlobalSearch />
              <NotificationBell />
              <ThemeToggle />
              {/* Desktop Mode Toggle */}
              <button
                onClick={toggleDesktopMode}
                className={`flex items-center justify-center h-8 w-8 rounded-md border transition-colors ${
                  isDesktopMode
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'border-input bg-background hover:bg-accent'
                }`}
                title={isDesktopMode ? 'Normalan režim' : 'Desktop režim (OS Layout)'}
              >
                {isDesktopMode ? (
                  <MonitorOff className="h-3.5 w-3.5" />
                ) : (
                  <Monitor className="h-3.5 w-3.5 text-muted-foreground" />
                )}
              </button>
              <UserMenu />
            </div>
          </header>

          <div className="flex-1 overflow-y-auto overflow-x-hidden bg-background/50">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeModule}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
                className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8"
              >
                {moduleComponents[activeModule]}
              </motion.div>
            </AnimatePresence>
          </div>

          <Footer />

        </SidebarInset>
      </SidebarProvider>

      {/* AI Assistant - outside SidebarProvider to prevent dialog conflicts */}
      <AIAssistant />
      {/* App Launcher - fullscreen module grid */}
      <AppLauncher />
      {/* AI Setup Wizard - first login module selection */}
      <AISetupWizard />
    </>
  )
}

// ============ WRAPPER WITH CONTENT TRANSLATION ============

function AppWithContentTranslation() {
  const { locale } = useTranslation()

  return (
    <ContentTranslationProvider locale={locale} sourceLocale="sr">
      <AppContent />
    </ContentTranslationProvider>
  )
}

// ============ MAIN PAGE ============

export default function Home() {
  return (
    <I18nProvider>
      <AppWithContentTranslation />
    </I18nProvider>
  )
}
