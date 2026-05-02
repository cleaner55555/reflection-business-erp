'use client'

import { useEffect } from 'react'
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar'
import { AppSidebar } from '@/components/modules/AppSidebar'
import { Footer } from '@/components/modules/Footer'
import { Dashboard } from '@/components/modules/Dashboard'
import { Finansije } from '@/components/modules/Finansije'
import { Fakture } from '@/components/modules/Fakture'
import { Magacin } from '@/components/modules/Magacin'
import { Partneri } from '@/components/modules/Partneri'
import { Nabavka } from '@/components/modules/Nabavka'
import { Izvestaji } from '@/components/modules/Izvestaji'
import { CRM } from '@/components/modules/CRM'
import { Kalendar } from '@/components/modules/Kalendar'
import { Zaposleni } from '@/components/modules/Zaposleni'
import { Projekti } from '@/components/modules/Projekti'
import { Sredstva } from '@/components/modules/Sredstva'
import { Dokumenta } from '@/components/modules/Dokumenta'
import { Knjigovodstvo } from '@/components/modules/Knjigovodstvo'
import { Protokol } from '@/components/modules/Protokol'
import { Edukacija } from '@/components/modules/Edukacija'
import { VozniPark } from '@/components/modules/VozniPark'
import { KafeRestoran } from '@/components/modules/KafeRestoran'
import { MailerLite } from '@/components/modules/MailerLite'
import { RentACar } from '@/components/modules/RentACar'
import { Podesavanja } from '@/components/modules/Podesavanja'
import { Integracije } from '@/components/modules/Integracije'
import { BankSync } from '@/components/modules/BankSync'
import { AIAssistant } from '@/components/modules/AIAssistant'
import { GlobalSearch } from '@/components/modules/GlobalSearch'
import { ThemeToggle } from '@/components/theme-toggle'
import { NotificationBell } from '@/components/modules/NotificationBell'
import { NotificationCenter } from '@/components/modules/NotificationCenter'
import { Zakoni } from '@/components/modules/Zakoni'
import { Maloprodaja } from '@/components/modules/Maloprodaja'
import { Shipping } from '@/components/modules/Shipping'
import { Marketplace } from '@/components/modules/Marketplace'
import { Ponude } from '@/components/modules/Ponude'
import { Pretplate } from '@/components/modules/Pretplate'
import { Troškovi } from '@/components/modules/Troškovi'
import { Potpisi } from '@/components/modules/Potpisi'
import { Proizvodnja } from '@/components/modules/Proizvodnja'
import { Kvalitet } from '@/components/modules/Kvalitet'
import { Održavanje } from '@/components/modules/Održavanje'
import { Regrutacija } from '@/components/modules/Regrutacija'
import { Odsustva } from '@/components/modules/Odsustva'
import { Preporuke } from '@/components/modules/Preporuke'
import { Podrška } from '@/components/modules/Podrška'
import { TerenskiServis } from '@/components/modules/TerenskiServis'
import { Zakazivanja } from '@/components/modules/Zakazivanja'
import { Planer } from '@/components/modules/Planer'
import { DruštveneMreže } from '@/components/modules/DruštveneMreže'
import { SmsMarketing } from '@/components/modules/SmsMarketing'
import { Događaji } from '@/components/modules/Događaji'
import { MktAutomatizacija } from '@/components/modules/MktAutomatizacija'
import { Ankete } from '@/components/modules/Ankete'
import { Čet } from '@/components/modules/Čet'
import { BazaZnanja } from '@/components/modules/BazaZnanja'
import { WebsiteBuilder } from '@/components/modules/WebsiteBuilder'
import { BlogModul } from '@/components/modules/BlogModul'
import { VoIP } from '@/components/modules/VoIP'
import { IoT } from '@/components/modules/IoT'
import { WhatsApp } from '@/components/modules/WhatsApp'
import { Forum } from '@/components/modules/Forum'
import { PLM } from '@/components/modules/PLM'
import { ECommerce } from '@/components/modules/ECommerce'
import { Spreadsheet } from '@/components/modules/Spreadsheet'
import { Beleške } from '@/components/modules/Beleške'
import { Odobrenja } from '@/components/modules/Odobrenja'
import { Veštine } from '@/components/modules/Veštine'
import { Ugovori } from '@/components/modules/Ugovori'
import { Ocene } from '@/components/modules/Ocene'
import { Gamifikacija } from '@/components/modules/Gamifikacija'
import { Reklamacije } from '@/components/modules/Reklamacije'
import { Natečaji } from '@/components/modules/Natečaji'
import { Garancije } from '@/components/modules/Garancije'
import { Servis } from '@/components/modules/Servis'
import { Usklađenost } from '@/components/modules/Usklađenost'
import { ProgramLojalnosti } from '@/components/modules/ProgramLojalnosti'
import { PlanerRadneSile } from '@/components/modules/PlanerRadneSile'
import { Posetioci } from '@/components/modules/Posetioci'
import { Predlozi } from '@/components/modules/Predlozi'
import { Taksacija } from '@/components/modules/Taksacija'
import { FondZdravlja } from '@/components/modules/FondZdravlja'
import { Geolokacija } from '@/components/modules/Geolokacija'
import { Kamere } from '@/components/modules/Kamere'
import { MenadzerNabavke } from '@/components/modules/MenadzerNabavke'
import { CMS } from '@/components/modules/CMS'
import { AuthPage } from '@/components/modules/AuthPage'
import { CompanySwitcher } from '@/components/modules/CompanySwitcher'
import { UserMenu } from '@/components/modules/UserMenu'
import { useAppStore } from '@/lib/store'
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
import { Languages, Loader2 } from 'lucide-react'
import { useState } from 'react'

// Default active languages if not configured
const DEFAULT_ACTIVE_LANGS = ['sr', 'sr-latn', 'en']

// ============ MODULES MAP ============

const modules: Record<string, React.ReactNode> = {
  dashboard: <Dashboard />,
  finansije: <Finansije />,
  fakture: <Fakture />,
  magacin: <Magacin />,
  partneri: <Partneri />,
  nabavka: <Nabavka />,
  crm: <CRM />,
  kalendar: <Kalendar />,
  zaposleni: <Zaposleni />,
  projekti: <Projekti />,
  sredstva: <Sredstva />,
  dokumenta: <Dokumenta />,
  knjigovodstvo: <Knjigovodstvo />,
  protokol: <Protokol />,
  edukacija: <Edukacija />,
  'vozni-park': <VozniPark />,
  'kafe-restoran': <KafeRestoran />,
  'email-marketing': <MailerLite />,
  'rent-a-car': <RentACar />,
  izvestaji: <Izvestaji />,
  podesavanja: <Podesavanja />,
  integracije: <Integracije />,
  'bank-sync': <BankSync />,
  notifications: <NotificationCenter />,
  zakoni: <Zakoni />,
  pos: <Maloprodaja />,
  shipping: <Shipping />,
  marketplace: <Marketplace />,
  ponude: <Ponude />,
  pretplate: <Pretplate />,
  troškovi: <Troškovi />,
  potpisi: <Potpisi />,
  proizvodnja: <Proizvodnja />,
  kvalitet: <Kvalitet />,
  odrzavanje: <Održavanje />,
  regrutacija: <Regrutacija />,
  odsustva: <Odsustva />,
  preporuke: <Preporuke />,
  podrska: <Podrška />,
  'terenski-servis': <TerenskiServis />,
  zakazivanja: <Zakazivanja />,
  planer: <Planer />,
  'drustvene-mreze': <DruštveneMreže />,
  'sms-marketing': <SmsMarketing />,
  dogadjaji: <Događaji />,
  'mkt-automatizacija': <MktAutomatizacija />,
  ankete: <Ankete />,
  chet: <Čet />,
  'baza-znanja': <BazaZnanja />,
  website: <WebsiteBuilder />,
  blog: <BlogModul />,
  voip: <VoIP />,
  iot: <IoT />,
  whatsapp: <WhatsApp />,
  forum: <Forum />,
  plm: <PLM />,
  ecommerce: <ECommerce />,
  spreadsheet: <Spreadsheet />,
  beleske: <Beleške />,
  odobrenja: <Odobrenja />,
  vestine: <Veštine />,
  ugovori: <Ugovori />,
  ocene: <Ocene />,
  gamifikacija: <Gamifikacija />,
  reklamacije: <Reklamacije />,
  natečaji: <Natečaji />,
  garancije: <Garancije />,
  servis: <Servis />,
  uskladenost: <Usklađenost />,
  'program-lojalnosti': <ProgramLojalnosti />,
  'planer-radne-sile': <PlanerRadneSile />,
  posetioci: <Posetioci />,
  predlozi: <Predlozi />,
  taksacija: <Taksacija />,
  'fond-zdravlja': <FondZdravlja />,
  geolokacija: <Geolokacija />,
  kamere: <Kamere />,
  'menadzer-nabavke': <MenadzerNabavke />,
  cms: <CMS />,
}

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
  troškovi: 'sidebar.expenses',
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
}

// ============ INNER APP (needs i18n context) ============

function AppContent() {
  const { activeModule, currentUser, activeCompanyId } = useAppStore()
  const { t, locale, setLocale, isTranslating } = useTranslation()
  const ensureLoaded = useThemeStore((s) => s.ensureLoaded)

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
                {modules[activeModule]}
              </motion.div>
            </AnimatePresence>
          </div>

          <Footer />

        </SidebarInset>
      </SidebarProvider>

      {/* AI Assistant - outside SidebarProvider to prevent dialog conflicts */}
      <AIAssistant />
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
