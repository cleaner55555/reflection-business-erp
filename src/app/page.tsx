'use client'

import dynamic from 'next/dynamic'
import { useEffect, useState, Suspense } from 'react'
import { useAppStore } from '@/lib/store'
import { useThemeStore } from '@/lib/theme'
import { I18nProvider, useTranslation, ALL_LANGUAGES, ContentTranslationProvider } from '@/lib/i18n'
import { Separator } from '@/components/ui/separator'
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { motion, AnimatePresence } from 'framer-motion'
import { Languages, Loader2 } from 'lucide-react'

// ============================================================
// ALL heavy components loaded lazily via next/dynamic
// This prevents the initial compilation from processing 124+ modules
// ============================================================

const AppSidebar = dynamic(
  () => import('@/components/modules/AppSidebar').then(m => ({ default: m.AppSidebar })),
  { ssr: false, loading: () => <div className="w-64 border-r bg-muted animate-pulse" /> }
)

const Footer = dynamic(
  () => import('@/components/modules/Footer').then(m => ({ default: m.Footer })),
  { ssr: false }
)

const AITeam = dynamic(
  () => import('@/components/modules/AITeam').then(m => ({ default: m.AITeam })),
  { ssr: false }
)

const GlobalSearch = dynamic(
  () => import('@/components/modules/GlobalSearch').then(m => ({ default: m.GlobalSearch })),
  { ssr: false }
)

const ThemeToggle = dynamic(
  () => import('@/components/theme-toggle').then(m => ({ default: m.ThemeToggle })),
  { ssr: false }
)

const NotificationBell = dynamic(
  () => import('@/components/modules/NotificationBell').then(m => ({ default: m.NotificationBell })),
  { ssr: false }
)

const NotificationCenter = dynamic(
  () => import('@/components/modules/NotificationCenter').then(m => ({ default: m.NotificationCenter })),
  { ssr: false }
)

const AppLauncher = dynamic(
  () => import('@/components/modules/AppLauncher').then(m => {
    const Comp = m.AppLauncher
    return { default: () => <Comp /> }
  }),
  { ssr: false }
)

const AISetupWizard = dynamic(
  () => import('@/components/modules/AISetupWizard').then(m => {
    const Comp = m.AISetupWizard
    return { default: () => <Comp /> }
  }),
  { ssr: false }
)

const LandingPage = dynamic(
  () => import('@/components/landing/LandingPage').then(m => ({ default: m.LandingPage })),
  { ssr: false }
)

const PWAInstallPrompt = dynamic(
  () => import('@/components/PWAInstallPrompt').then(m => ({ default: m.PWAInstallPrompt })),
  { ssr: false }
)

const OfflineIndicator = dynamic(
  () => import('@/components/OfflineIndicator').then(m => ({ default: m.OfflineIndicator })),
  { ssr: false }
)

const KeyboardShortcutsProvider = dynamic(
  () => import('@/components/KeyboardShortcuts').then(m => ({ default: m.KeyboardShortcutsProvider })),
  { ssr: false }
)

const CompanySwitcher = dynamic(
  () => import('@/components/modules/CompanySwitcher').then(m => ({ default: m.CompanySwitcher })),
  { ssr: false }
)

const UserMenu = dynamic(
  () => import('@/components/modules/UserMenu').then(m => ({ default: m.UserMenu })),
  { ssr: false }
)

const ModuleRenderer = dynamic(
  () => import('@/lib/moduleMap').then(m => ({ default: m.ModuleRenderer })),
  { ssr: false }
)

// Pre-warm: load prewarmModules lazily so it doesn't block the initial page
let prewarmPromise: Promise<void> | null = null
function triggerPrewarm() {
  if (!prewarmPromise) {
    prewarmPromise = import('@/lib/moduleMap').then(m => m.prewarmModules()).catch(() => {})
  }
}

// ============================================================

const DEFAULT_ACTIVE_LANGS = ['sr', 'sr-latn', 'en']

const moduleLabelKeys: Record<string, string> = {
  dashboard: 'sidebar.dashboard', finance: 'sidebar.finances', invoices: 'sidebar.invoices',
  inventory: 'sidebar.warehouse', contacts: 'sidebar.partners', procurement: 'sidebar.procurement',
  crm: 'sidebar.crm', calendar: 'sidebar.calendar', employees: 'sidebar.employees',
  projects: 'sidebar.projects', assets: 'sidebar.assets', documents: 'sidebar.documents',
  accounting: 'sidebar.accounting', protocol: 'sidebar.protocol', education: 'sidebar.education',
  fleet: 'sidebar.vehicleFleet', restaurant: 'sidebar.cafeRestaurant',
  'email-marketing': 'sidebar.emailMarketing', 'rent-a-car': 'sidebar.rentACar',
  reports: 'sidebar.reports', settings: 'sidebar.settings', integrations: 'sidebar.integrations',
  'bank-sync': 'sidebar.bank', notifications: 'notifications.title', laws: 'zakoni.title',
  pos: 'sidebar.pos', shipping: 'sidebar.shipping', marketplace: 'sidebar.marketplace',
  offers: 'sidebar.quotes', subscriptions: 'sidebar.subscriptions', expenses: 'sidebar.expenses',
  signatures: 'sidebar.sign', manufacturing: 'sidebar.manufacturing', quality: 'sidebar.quality',
  maintenance: 'sidebar.maintenance', recruitment: 'sidebar.recruitment', leave: 'sidebar.timeoff',
  referrals: 'sidebar.referrals', support: 'sidebar.helpdesk',
  'field-service': 'sidebar.fieldService', appointments: 'sidebar.appointments',
  scheduler: 'sidebar.planning', 'social-media': 'sidebar.social',
  'sms-marketing': 'sidebar.sms', events: 'sidebar.events',
  'marketing-automation': 'sidebar.mktAutomation', surveys: 'sidebar.surveys',
  chat: 'sidebar.discuss', 'knowledge-base': 'sidebar.knowledge', website: 'sidebar.website',
  blog: 'sidebar.blog', voip: 'sidebar.voip', iot: 'sidebar.iot', messaging: 'sidebar.whatsapp',
  forum: 'sidebar.forum', plm: 'sidebar.plm', ecommerce: 'sidebar.ecommerce',
  spreadsheet: 'sidebar.spreadsheet', notes: 'sidebar.notes', approvals: 'sidebar.approvals',
  skills: 'sidebar.skills', contracts: 'sidebar.contracts', ratings: 'sidebar.rating',
  gamification: 'sidebar.gamification', complaints: 'sidebar.complaints',
  tenders: 'sidebar.tenders', warranty: 'sidebar.warranties',
  'service-center': 'sidebar.serviceCenter', compliance: 'sidebar.compliance',
  loyalty: 'sidebar.loyalty', 'workforce-planner': 'sidebar.workforce',
  visitors: 'sidebar.visitors', suggestions: 'sidebar.suggestions',
  valuation: 'sidebar.appraisal', 'health-fund': 'sidebar.healthFund',
  geolocation: 'sidebar.geolocation', cameras: 'sidebar.cameras',
  'procurement-manager': 'sidebar.procurementManager', cms: 'sidebar.cms',
  homework: 'sidebar.homework', enrollment: 'sidebar.enrollment', timetable: 'sidebar.timetable',
  library: 'sidebar.library', classroom: 'sidebar.classroom', tuition: 'sidebar.tuition',
  patients: 'sidebar.patients', 'medical-records': 'sidebar.medicalRecords',
  prescriptions: 'sidebar.prescriptions', lab: 'sidebar.laboratory',
  reservations: 'sidebar.reservations', menu: 'sidebar.menu', kitchen: 'sidebar.kitchen',
  orders: 'sidebar.orders', delivery: 'sidebar.delivery',
  'construction-site': 'sidebar.siteDiary', blueprints: 'sidebar.blueprints',
  subcontractors: 'sidebar.subcontractors', measurements: 'sidebar.surveying',
  safety: 'sidebar.safety', routes: 'sidebar.routes', 'loading-dock': 'sidebar.loading',
  'customs-docs': 'sidebar.customs', trucks: 'sidebar.trucks', packaging: 'sidebar.packing',
  property: 'sidebar.properties', rentals: 'sidebar.rentals',
  'property-viewings': 'sidebar.viewings', utilities: 'sidebar.utilities',
  'work-orders': 'sidebar.workOrders', standards: 'sidebar.standards', labels: 'sidebar.labels',
  barcode: 'sidebar.barcode', 'price-lists': 'sidebar.priceLists', coupons: 'sidebar.coupons',
  reviews: 'sidebar.reviews', seo: 'sidebar.seo', payments: 'sidebar.payments',
  returns: 'sidebar.returns', 'cash-register': 'sidebar.cashRegister',
  'time-tracking': 'sidebar.timeTracking', 'time-billing': 'sidebar.timeBilling',
  'client-portal': 'sidebar.clientPortal', automation: 'sidebar.automation',
  stores: 'sidebar.branches', backup: 'sidebar.backup',
}

function AppContent() {
  const { activeModule, currentUser, activeCompanyId } = useAppStore()

  useEffect(() => {
    if ('serviceWorker' in navigator) navigator.serviceWorker.register('/sw.js').catch(() => {})
  }, [])

  const { t, locale, setLocale, isTranslating } = useTranslation()
  const ensureLoaded = useThemeStore((s) => s.ensureLoaded)
  const showAuth = !currentUser

  const [seeded, setSeeded] = useState(false)
  useEffect(() => {
    if (!seeded) { setSeeded(true); fetch('/api/seed', { method: 'POST' }).catch(() => {}) }
  }, [seeded])

  useEffect(() => {
    if (!currentUser || !activeCompanyId) return
    const timer = setTimeout(async () => {
      try { await fetch('/api/notifications/generate', { method: 'POST', headers: { 'x-company-id': activeCompanyId } }) } catch {}
    }, 2000)
    return () => clearTimeout(timer)
  }, [currentUser, activeCompanyId])

  const [activeLangs, setActiveLangs] = useState<string[]>(DEFAULT_ACTIVE_LANGS)
  useEffect(() => {
    if (!activeCompanyId) return
    fetch(`/api/settings?group=general&companyId=${activeCompanyId}`)
      .then((res) => res.ok ? res.json() : [])
      .then((data: Array<{ key: string; value: string }>) => {
        const s = data?.find((s) => s.key === 'active_languages')
        if (s?.value) { try { const p = JSON.parse(s.value); if (Array.isArray(p) && p.length > 0) setActiveLangs(p) } catch {} }
      }).catch(() => {})
  }, [activeCompanyId])

  useEffect(() => { ensureLoaded() }, [ensureLoaded])
  const headerLanguages = ALL_LANGUAGES.filter((l) => activeLangs.includes(l.code))

  // Pre-warm all module chunks in background after login (3s delay to not block initial render)
  useEffect(() => {
    if (!currentUser) return
    const timer = setTimeout(() => triggerPrewarm(), 3000)
    return () => clearTimeout(timer)
  }, [currentUser])

  if (showAuth || !currentUser) return <LandingPage />

  return (
    <>
    <SidebarProvider className="h-svh overflow-hidden">
      <AppSidebar />
      <SidebarInset className="flex-1 flex flex-col overflow-hidden">
        <header className="flex h-14 shrink-0 items-center justify-between gap-1 sm:gap-2 border-b bg-background overflow-hidden px-2 sm:px-4">
          <div className="flex items-center gap-1 sm:gap-2 min-w-0">
            <SidebarTrigger className="-ml-1 shrink-0" />
            <Separator orientation="vertical" className="mr-1 sm:mr-2 h-4 shrink-0" />
            <h2 className="text-sm font-medium text-foreground truncate">{t(moduleLabelKeys[activeModule] || activeModule)}</h2>
          </div>
          <div className="flex items-center gap-1 sm:gap-2 shrink-0">
            <div className="hidden sm:block"><CompanySwitcher /></div>
            {isTranslating && (
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Loader2 className="h-3 w-3 animate-spin text-primary" />
                <span className="hidden sm:inline">Prevodi se...</span>
              </div>
            )}
            {headerLanguages.length > 1 ? (
              <Select value={locale} onValueChange={setLocale}>
                <SelectTrigger className="h-8 w-auto min-w-[36px] sm:min-w-[130px] text-xs">
                  <Languages className="h-3.5 w-3.5 mr-1 text-muted-foreground" /><SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {headerLanguages.map((lang) => (
                    <SelectItem key={lang.code} value={lang.code} className="text-xs">{lang.flag} {lang.nativeName}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <button onClick={() => setLocale(headerLanguages[0]?.code || 'sr')} className="flex h-8 min-h-[44px] sm:min-h-0 items-center justify-center gap-1 rounded-md border border-input bg-background px-2 sm:px-2.5 text-xs">
                <span>{headerLanguages[0]?.flag || '🌐'}</span>
                <span className="hidden sm:inline">{headerLanguages[0]?.nativeName || 'SR'}</span>
              </button>
            )}
            <GlobalSearch /><NotificationBell /><ThemeToggle /><UserMenu />
          </div>
        </header>
        <div className="flex-1 overflow-y-auto overflow-x-hidden bg-background/50">
          <AnimatePresence mode="wait">
            <motion.div key={activeModule} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }} className="mx-auto max-w-7xl px-3 py-4 sm:px-6 sm:py-6 lg:px-8">
              <ModuleRenderer moduleKey={activeModule} />
            </motion.div>
          </AnimatePresence>
        </div>
        <Footer />
      </SidebarInset>
    </SidebarProvider>
    <AITeam /><AppLauncher /><AISetupWizard /><PWAInstallPrompt />
    </>
  )
}

function AppWithContentTranslation() {
  const { locale } = useTranslation()
  return <ContentTranslationProvider locale={locale} sourceLocale="sr"><AppContent /></ContentTranslationProvider>
}

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
