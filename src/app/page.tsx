'use client'

import { useEffect } from 'react'
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar'
import { AppSidebar } from '@/components/modules/AppSidebar'
import { Footer } from '@/components/modules/Footer'
import { AITeam } from '@/components/modules/AITeam'
import { GlobalSearch } from '@/components/modules/GlobalSearch'
import { ThemeToggle } from '@/components/theme-toggle'
import { NotificationBell } from '@/components/modules/NotificationBell'
import { NotificationCenter } from '@/components/modules/NotificationCenter'
import { AppLauncher, openAppLauncher } from '@/components/modules/AppLauncher'
import { AISetupWizard, openAISetupWizard } from '@/components/modules/AISetupWizard'
import { AuthPage } from '@/components/modules/AuthPage'
import { LandingPage } from '@/components/landing/LandingPage'
import { PWAInstallPrompt } from '@/components/PWAInstallPrompt'
import { OfflineIndicator } from '@/components/OfflineIndicator'
import { KeyboardShortcutsProvider } from '@/components/KeyboardShortcuts'
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
  // === Core ===
  dashboard: 'sidebar.dashboard',
  finance: 'sidebar.finances',
  invoices: 'sidebar.invoices',
  inventory: 'sidebar.warehouse',
  contacts: 'sidebar.partners',
  procurement: 'sidebar.procurement',
  crm: 'sidebar.crm',
  calendar: 'sidebar.calendar',
  employees: 'sidebar.employees',
  projects: 'sidebar.projects',
  assets: 'sidebar.assets',
  documents: 'sidebar.documents',
  accounting: 'sidebar.accounting',
  protocol: 'sidebar.protocol',
  education: 'sidebar.education',
  fleet: 'sidebar.vehicleFleet',
  restaurant: 'sidebar.cafeRestaurant',
  'email-marketing': 'sidebar.emailMarketing',
  'rent-a-car': 'sidebar.rentACar',
  reports: 'sidebar.reports',
  settings: 'sidebar.settings',
  integrations: 'sidebar.integrations',
  'bank-sync': 'sidebar.bank',
  notifications: 'notifications.title',
  laws: 'zakoni.title',
  pos: 'sidebar.pos',
  shipping: 'sidebar.shipping',
  marketplace: 'sidebar.marketplace',
  offers: 'sidebar.quotes',
  subscriptions: 'sidebar.subscriptions',
  expenses: 'sidebar.expenses',
  signatures: 'sidebar.sign',
  manufacturing: 'sidebar.manufacturing',
  quality: 'sidebar.quality',
  maintenance: 'sidebar.maintenance',
  recruitment: 'sidebar.recruitment',
  leave: 'sidebar.timeoff',
  referrals: 'sidebar.referrals',
  support: 'sidebar.helpdesk',
  'field-service': 'sidebar.fieldService',
  appointments: 'sidebar.appointments',
  scheduler: 'sidebar.planning',
  'social-media': 'sidebar.social',
  'sms-marketing': 'sidebar.sms',
  events: 'sidebar.events',
  'marketing-automation': 'sidebar.mktAutomation',
  surveys: 'sidebar.surveys',
  chat: 'sidebar.discuss',
  'knowledge-base': 'sidebar.knowledge',
  website: 'sidebar.website',
  blog: 'sidebar.blog',
  voip: 'sidebar.voip',
  iot: 'sidebar.iot',
  messaging: 'sidebar.whatsapp',
  forum: 'sidebar.forum',
  plm: 'sidebar.plm',
  ecommerce: 'sidebar.ecommerce',
  spreadsheet: 'sidebar.spreadsheet',
  notes: 'sidebar.notes',
  approvals: 'sidebar.approvals',
  skills: 'sidebar.skills',
  contracts: 'sidebar.contracts',
  ratings: 'sidebar.rating',
  gamification: 'sidebar.gamification',
  complaints: 'sidebar.complaints',
  tenders: 'sidebar.tenders',
  warranty: 'sidebar.warranties',
  'service-center': 'sidebar.serviceCenter',
  compliance: 'sidebar.compliance',
  loyalty: 'sidebar.loyalty',
  'workforce-planner': 'sidebar.workforce',
  visitors: 'sidebar.visitors',
  suggestions: 'sidebar.suggestions',
  valuation: 'sidebar.appraisal',
  'health-fund': 'sidebar.healthFund',
  geolocation: 'sidebar.geolocation',
  cameras: 'sidebar.cameras',
  'procurement-manager': 'sidebar.procurementManager',
  cms: 'sidebar.cms',
  // === Education ===
  homework: 'sidebar.homework',
  enrollment: 'sidebar.enrollment',
  timetable: 'sidebar.timetable',
  library: 'sidebar.library',
  classroom: 'sidebar.classroom',
  tuition: 'sidebar.tuition',
  // === Healthcare ===
  patients: 'sidebar.patients',
  'medical-records': 'sidebar.medicalRecords',
  prescriptions: 'sidebar.prescriptions',
  lab: 'sidebar.laboratory',
  // === Hospitality ===
  reservations: 'sidebar.reservations',
  menu: 'sidebar.menu',
  kitchen: 'sidebar.kitchen',
  orders: 'sidebar.orders',
  delivery: 'sidebar.delivery',
  // === Construction ===
  'construction-site': 'sidebar.siteDiary',
  blueprints: 'sidebar.blueprints',
  subcontractors: 'sidebar.subcontractors',
  measurements: 'sidebar.surveying',
  safety: 'sidebar.safety',
  // === Logistics ===
  routes: 'sidebar.routes',
  'loading-dock': 'sidebar.loading',
  'customs-docs': 'sidebar.customs',
  trucks: 'sidebar.trucks',
  packaging: 'sidebar.packing',
  // === Real Estate ===
  property: 'sidebar.properties',
  rentals: 'sidebar.rentals',
  'property-viewings': 'sidebar.viewings',
  utilities: 'sidebar.utilities',
  // === Production+ ===
  'work-orders': 'sidebar.workOrders',
  standards: 'sidebar.standards',
  labels: 'sidebar.labels',
  // === Retail ===
  barcode: 'sidebar.barcode',
  'price-lists': 'sidebar.priceLists',
  coupons: 'sidebar.coupons',
  reviews: 'sidebar.reviews',
  seo: 'sidebar.seo',
  payments: 'sidebar.payments',
  returns: 'sidebar.returns',
  'cash-register': 'sidebar.cashRegister',
  // === Services ===
  'time-tracking': 'sidebar.timeTracking',
  'time-billing': 'sidebar.timeBilling',
  'client-portal': 'sidebar.clientPortal',
  automation: 'sidebar.automation',
  stores: 'sidebar.branches',
  backup: 'sidebar.backup',
}

// ============ INNER APP (needs i18n context) ============

function AppContent() {
  const { activeModule, currentUser, activeCompanyId } = useAppStore()

  // Register service worker for PWA
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(() => {
        // Service worker registration failed - not critical
      })
    }
  }, [])

  const { t, locale, setLocale, isTranslating } = useTranslation()
  const ensureLoaded = useThemeStore((s) => s.ensureLoaded)
  const { isDesktopMode, toggleDesktopMode } = useWindowManager()

  // Show landing page if not logged in (LandingPage contains AuthPage link)
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

  // Show landing page when not logged in
  if (showAuth || !currentUser) {
    return <LandingPage />
  }

  // Desktop mode — show OS-style layout
  if (isDesktopMode) {
    return (
      <>
        <DesktopMode />
        {/* AI Business Team - outside everything */}
        <AITeam />
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
        <header className="flex h-14 shrink-0 items-center justify-between gap-1 sm:gap-2 border-b bg-background overflow-hidden px-2 sm:px-4">
          <div className="flex items-center gap-1 sm:gap-2 min-w-0">
            <SidebarTrigger className="-ml-1 shrink-0" />
            <Separator orientation="vertical" className="mr-1 sm:mr-2 h-4 shrink-0" />
            <h2 className="text-sm font-medium text-foreground truncate">
              {t(moduleLabelKeys[activeModule] || activeModule)}
            </h2>
          </div>
            <div className="flex items-center gap-1 sm:gap-2 shrink-0">
              {/* Company Switcher - hidden on small mobile */}
              <div className="hidden sm:block">
                <CompanySwitcher />
              </div>

              {/* AI Translation loading indicator */}
              {isTranslating && (
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Loader2 className="h-3 w-3 animate-spin text-primary" />
                  <span className="hidden sm:inline">Prevodi se...</span>
                </div>
              )}
              {/* Language Switcher - dropdown with active languages only */}
              {headerLanguages.length > 1 ? (
                <Select value={locale} onValueChange={(val) => setLocale(val)}>
                  <SelectTrigger className="h-8 w-auto min-w-[36px] sm:min-w-[130px] text-xs">
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
                  className="flex h-8 min-h-[44px] sm:min-h-0 items-center justify-center gap-1 rounded-md border border-input bg-background px-2 sm:px-2.5 text-xs"
                >
                  <span>{headerLanguages[0]?.flag || '🌐'}</span>
                  <span className="hidden sm:inline">{headerLanguages[0]?.nativeName || 'SR'}</span>
                </button>
              )}
              <GlobalSearch />
              <NotificationBell />
              <ThemeToggle />
              {/* Desktop Mode Toggle - hidden on mobile (not useful on small screens) */}
              <button
                onClick={toggleDesktopMode}
                className={`hidden md:flex items-center justify-center h-8 w-8 rounded-md border transition-colors ${
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
                className="mx-auto max-w-7xl px-3 py-4 sm:px-6 sm:py-6 lg:px-8"
              >
                {(() => {
                  const Module = moduleComponents[activeModule]
                  return Module ? <Module /> : null
                })()}
              </motion.div>
            </AnimatePresence>
          </div>

          <Footer />

        </SidebarInset>
      </SidebarProvider>

      {/* AI Business Team - outside SidebarProvider */}
      <AITeam />
      {/* App Launcher - fullscreen module grid */}
      <AppLauncher />
      {/* AI Setup Wizard - first login module selection */}
      <AISetupWizard />
      {/* PWA Install Prompt */}
      <PWAInstallPrompt />
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
      <OfflineIndicator />
      <KeyboardShortcutsProvider>
        <AppWithContentTranslation />
      </KeyboardShortcutsProvider>
    </I18nProvider>
  )
}
