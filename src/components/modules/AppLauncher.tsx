'use client'

import { useState, useEffect, useMemo, useRef } from 'react'
import { useAppStore, type ModuleType } from '@/lib/store'
import { useThemeStore } from '@/lib/theme'
import { useTranslation } from '@/lib/i18n'
import { Badge } from '@/components/ui/badge'
import {
  LayoutDashboard, Wallet, FileText, Warehouse, ShoppingCart, Users, BarChart3,
  HeartHandshake, CalendarDays, UserCog, FolderKanban, Building2, Files,
  BookOpen, Mail, GraduationCap, Car, CarFront, UtensilsCrossed, Settings,
  Plug, Landmark, Scale, Monitor, Truck, Store, ClipboardList, Receipt,
  CreditCard, PenTool, Factory, ShieldCheck, Wrench, Briefcase, Palmtree,
  ThumbsUp, HeadphonesIcon, MapPin, CalendarClock, CalendarRange, Share2,
  MessageSquare, Megaphone, PartyPopper, Workflow, ClipboardCheck,
  MessageCircle, BookMarked, Globe2, PenLine, Phone, Wifi, MessageCircleReply,
  UsersRound, Table2, ShoppingBag, GitBranch, StickyNote, CheckCircle2,
  Award, Star, Gamepad2, FileSignature, ShieldAlert, Gavel, Shield, Crown,
  UserCheck, Lightbulb, Target, Heart, Camera, PackageSearch, FileCode,
  Search, Command, X,
} from 'lucide-react'
import { type LucideIcon } from 'lucide-react'

interface ModuleDef {
  id: ModuleType
  icon: LucideIcon
  labelKey: string
  group: string
}

const allModules: ModuleDef[] = [
  { id: 'dashboard', icon: LayoutDashboard, labelKey: 'sidebar.dashboard', group: 'Pregled' },
  { id: 'finansije', icon: Wallet, labelKey: 'sidebar.finances', group: 'Poslovanje' },
  { id: 'fakture', icon: FileText, labelKey: 'sidebar.invoices', group: 'Poslovanje' },
  { id: 'ponude', icon: ClipboardList, labelKey: 'sidebar.quotes', group: 'Poslovanje' },
  { id: 'magacin', icon: Warehouse, labelKey: 'sidebar.warehouse', group: 'Poslovanje' },
  { id: 'nabavka', icon: ShoppingCart, labelKey: 'sidebar.procurement', group: 'Poslovanje' },
  { id: 'bank-sync', icon: Landmark, labelKey: 'sidebar.bank', group: 'Poslovanje' },
  { id: 'pos', icon: Monitor, labelKey: 'sidebar.pos', group: 'Poslovanje' },
  { id: 'shipping', icon: Truck, labelKey: 'sidebar.shipping', group: 'Poslovanje' },
  { id: 'proizvodnja', icon: Factory, labelKey: 'sidebar.manufacturing', group: 'Poslovanje' },
  { id: 'troskovi', icon: Receipt, labelKey: 'sidebar.expenses', group: 'Poslovanje' },
  { id: 'pretplate', icon: CreditCard, labelKey: 'sidebar.subscriptions', group: 'Poslovanje' },
  { id: 'crm', icon: HeartHandshake, labelKey: 'sidebar.crm', group: 'CRM & Prodaja' },
  { id: 'partneri', icon: Users, labelKey: 'sidebar.partners', group: 'CRM & Prodaja' },
  { id: 'kalendar', icon: CalendarDays, labelKey: 'sidebar.calendar', group: 'CRM & Prodaja' },
  { id: 'marketplace', icon: Store, labelKey: 'sidebar.marketplace', group: 'CRM & Prodaja' },
  { id: 'podrska', icon: HeadphonesIcon, labelKey: 'sidebar.helpdesk', group: 'CRM & Prodaja' },
  { id: 'potpisi', icon: PenTool, labelKey: 'sidebar.sign', group: 'CRM & Prodaja' },
  { id: 'zaposleni', icon: UserCog, labelKey: 'sidebar.employees', group: 'Organizacija' },
  { id: 'odsustva', icon: Palmtree, labelKey: 'sidebar.timeoff', group: 'Organizacija' },
  { id: 'regrutacija', icon: Briefcase, labelKey: 'sidebar.recruitment', group: 'Organizacija' },
  { id: 'preporuke', icon: ThumbsUp, labelKey: 'sidebar.referrals', group: 'Organizacija' },
  { id: 'projekti', icon: FolderKanban, labelKey: 'sidebar.projects', group: 'Organizacija' },
  { id: 'zakazivanja', icon: CalendarClock, labelKey: 'sidebar.appointments', group: 'Organizacija' },
  { id: 'planer', icon: CalendarRange, labelKey: 'sidebar.planning', group: 'Organizacija' },
  { id: 'sredstva', icon: Building2, labelKey: 'sidebar.assets', group: 'Organizacija' },
  { id: 'odrzavanje', icon: Wrench, labelKey: 'sidebar.maintenance', group: 'Organizacija' },
  { id: 'kvalitet', icon: ShieldCheck, labelKey: 'sidebar.quality', group: 'Organizacija' },
  { id: 'dokumenta', icon: Files, labelKey: 'sidebar.documents', group: 'Organizacija' },
  { id: 'knjigovodstvo', icon: BookOpen, labelKey: 'sidebar.accounting', group: 'Organizacija' },
  { id: 'protokol', icon: FileText, labelKey: 'sidebar.protocol', group: 'Organizacija' },
  { id: 'edukacija', icon: GraduationCap, labelKey: 'sidebar.education', group: 'Organizacija' },
  { id: 'baza-znanja', icon: BookMarked, labelKey: 'sidebar.knowledge', group: 'Organizacija' },
  { id: 'email-marketing', icon: Mail, labelKey: 'sidebar.emailMarketing', group: 'Marketing' },
  { id: 'drustvene-mreze', icon: Share2, labelKey: 'sidebar.social', group: 'Marketing' },
  { id: 'sms-marketing', icon: Megaphone, labelKey: 'sidebar.sms', group: 'Marketing' },
  { id: 'dogadjaji', icon: PartyPopper, labelKey: 'sidebar.events', group: 'Marketing' },
  { id: 'mkt-automatizacija', icon: Workflow, labelKey: 'sidebar.mktAutomation', group: 'Marketing' },
  { id: 'ankete', icon: ClipboardCheck, labelKey: 'sidebar.surveys', group: 'Marketing' },
  { id: 'vozni-park', icon: Car, labelKey: 'sidebar.vehicleFleet', group: 'Specijalizovano' },
  { id: 'kafe-restoran', icon: UtensilsCrossed, labelKey: 'sidebar.cafeRestaurant', group: 'Specijalizovano' },
  { id: 'rent-a-car', icon: CarFront, labelKey: 'sidebar.rentACar', group: 'Specijalizovano' },
  { id: 'terenski-servis', icon: MapPin, labelKey: 'sidebar.fieldService', group: 'Specijalizovano' },
  { id: 'chet', icon: MessageCircle, labelKey: 'sidebar.discuss', group: 'Komunikacija' },
  { id: 'beleske', icon: StickyNote, labelKey: 'sidebar.notes', group: 'Komunikacija' },
  { id: 'odobrenja', icon: CheckCircle2, labelKey: 'sidebar.approvals', group: 'Komunikacija' },
  { id: 'vestine', icon: Award, labelKey: 'sidebar.skills', group: 'Komunikacija' },
  { id: 'ugovori', icon: FileSignature, labelKey: 'sidebar.contracts', group: 'Komunikacija' },
  { id: 'website', icon: Globe2, labelKey: 'sidebar.website', group: 'Web & IT' },
  { id: 'blog', icon: PenLine, labelKey: 'sidebar.blog', group: 'Web & IT' },
  { id: 'voip', icon: Phone, labelKey: 'sidebar.voip', group: 'Web & IT' },
  { id: 'iot', icon: Wifi, labelKey: 'sidebar.iot', group: 'Web & IT' },
  { id: 'whatsapp', icon: MessageCircleReply, labelKey: 'sidebar.whatsapp', group: 'Web & IT' },
  { id: 'forum', icon: UsersRound, labelKey: 'sidebar.forum', group: 'Web & IT' },
  { id: 'plm', icon: GitBranch, labelKey: 'sidebar.plm', group: 'Web & IT' },
  { id: 'ecommerce', icon: ShoppingBag, labelKey: 'sidebar.ecommerce', group: 'Web & IT' },
  { id: 'spreadsheet', icon: Table2, labelKey: 'sidebar.spreadsheet', group: 'Web & IT' },
  { id: 'cms', icon: FileCode, labelKey: 'sidebar.cms', group: 'Web & IT' },
  { id: 'ocene', icon: Star, labelKey: 'sidebar.rating', group: 'Dodatno' },
  { id: 'gamifikacija', icon: Gamepad2, labelKey: 'sidebar.gamification', group: 'Dodatno' },
  { id: 'reklamacije', icon: ShieldAlert, labelKey: 'sidebar.complaints', group: 'Dodatno' },
  { id: 'natečaji', icon: Gavel, labelKey: 'sidebar.tenders', group: 'Dodatno' },
  { id: 'garancije', icon: ShieldCheck, labelKey: 'sidebar.warranties', group: 'Dodatno' },
  { id: 'servis', icon: Wrench, labelKey: 'sidebar.serviceCenter', group: 'Dodatno' },
  { id: 'uskladenost', icon: Shield, labelKey: 'sidebar.compliance', group: 'Dodatno' },
  { id: 'program-lojalnosti', icon: Crown, labelKey: 'sidebar.loyalty', group: 'Dodatno' },
  { id: 'planer-radne-sile', icon: CalendarRange, labelKey: 'sidebar.workforce', group: 'Dodatno' },
  { id: 'posetioci', icon: UserCheck, labelKey: 'sidebar.visitors', group: 'Dodatno' },
  { id: 'predlozi', icon: Lightbulb, labelKey: 'sidebar.suggestions', group: 'Dodatno' },
  { id: 'taksacija', icon: Target, labelKey: 'sidebar.appraisal', group: 'Dodatno' },
  { id: 'fond-zdravlja', icon: Heart, labelKey: 'sidebar.healthFund', group: 'Dodatno' },
  { id: 'geolokacija', icon: MapPin, labelKey: 'sidebar.geolocation', group: 'Dodatno' },
  { id: 'kamere', icon: Camera, labelKey: 'sidebar.cameras', group: 'Dodatno' },
  { id: 'menadzer-nabavke', icon: PackageSearch, labelKey: 'sidebar.procurementManager', group: 'Dodatno' },
  { id: 'izvestaji', icon: BarChart3, labelKey: 'sidebar.reports', group: 'Analitika' },
  { id: 'integracije', icon: Plug, labelKey: 'sidebar.integrations', group: 'Analitika' },
  { id: 'zakoni', icon: Scale, labelKey: 'sidebar.laws', group: 'Analitika' },
  { id: 'podesavanja', icon: Settings, labelKey: 'sidebar.settings', group: 'Sistem' },
]

// Export open function for the sidebar dots button
let _setOpen: (open: boolean) => void = () => {}
export function openAppLauncher() { _setOpen(true) }

export function AppLauncher() {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const { activeModule, setActiveModule } = useAppStore()
  const { t } = useTranslation()
  const companyName = useThemeStore((s) => s.companyName)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => { _setOpen = setOpen }, [setOpen])

  // Focus input on open
  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 100)
      setSearch('')
    }
  }, [open])

  // ESC to close
  useEffect(() => {
    if (!open) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        setOpen(false)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [open])

  // Keyboard shortcut: Ctrl/Cmd + K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setOpen(true)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  // Filter modules by search
  const filtered = useMemo(() => {
    if (!search.trim()) return allModules
    const q = search.toLowerCase()
    return allModules.filter(m => t(m.labelKey).toLowerCase().includes(q) || m.id.includes(q))
  }, [search, t])

  // Group by category
  const grouped = useMemo(() => {
    const groups: Record<string, ModuleDef[]> = {}
    for (const m of filtered) {
      if (!groups[m.group]) groups[m.group] = []
      groups[m.group].push(m)
    }
    return groups
  }, [filtered])

  const handleSelect = (id: ModuleType) => {
    setActiveModule(id)
    setOpen(false)
  }

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-[100] flex flex-col animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) setOpen(false)
      }}
    >
      {/* Fullscreen overlay - white in light mode, black in dark mode */}
      <div className="fixed inset-0 bg-white dark:bg-black" />

      {/* Content */}
      <div className="relative z-10 flex flex-col h-full">
        {/* Search header */}
        <div className="shrink-0 border-b border-gray-200 dark:border-gray-800">
          <div className="mx-auto max-w-4xl px-4 py-4">
            <div className="flex items-center gap-3">
              <Search className="h-5 w-5 text-gray-400 dark:text-gray-500 shrink-0" />
              <input
                ref={inputRef}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Pretraži module..."
                className="flex-1 bg-transparent text-base text-gray-900 dark:text-gray-100 outline-none placeholder:text-gray-400 dark:placeholder:text-gray-600"
              />
              {search && (
                <button onClick={() => setSearch('')} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                  <X className="h-5 w-5" />
                </button>
              )}
              <button
                onClick={() => setOpen(false)}
                className="flex items-center gap-1.5 rounded-lg border border-gray-200 dark:border-gray-700 px-3 py-1.5 text-xs text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-900 transition-colors"
              >
                ESC
              </button>
            </div>
          </div>
        </div>

        {/* Module grid - scrollable */}
        <div className="flex-1 overflow-y-auto">
          <div className="mx-auto max-w-4xl px-4 py-4 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Svi moduli
              </h2>
              <div className="flex items-center gap-3">
                <Badge variant="outline" className="text-[10px] border-gray-300 dark:border-gray-700 text-gray-500 dark:text-gray-400">
                  {filtered.length} od {allModules.length}
                </Badge>
                <span className="text-xs text-gray-400 dark:text-gray-600">
                  {companyName || 'Reflection Business'}
                </span>
              </div>
            </div>

            {/* Module groups */}
            {Object.entries(grouped).map(([group, modules]) => (
              <div key={group}>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-600 mb-2">
                  {group}
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-1.5">
                  {modules.map((m) => {
                    const isActive = activeModule === m.id
                    const Icon = m.icon
                    return (
                      <button
                        key={m.id}
                        onClick={() => handleSelect(m.id)}
                        className={`
                          flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-left text-sm
                          transition-all duration-150
                          ${isActive
                            ? 'bg-gray-900 text-white dark:bg-white dark:text-gray-900 shadow-sm'
                            : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-900'
                          }
                        `}
                      >
                        <Icon className="h-4 w-4 shrink-0 opacity-70" />
                        <span className="truncate text-xs font-medium">{t(m.labelKey)}</span>
                      </button>
                    )
                  })}
                </div>
              </div>
            ))}

            {/* No results */}
            {filtered.length === 0 && (
              <div className="flex flex-col items-center justify-center py-16 text-gray-400 dark:text-gray-600">
                <Search className="h-10 w-10 mb-3 opacity-40" />
                <p className="text-sm">Nema rezultata za &quot;{search}&quot;</p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="shrink-0 border-t border-gray-200 dark:border-gray-800">
          <div className="mx-auto max-w-4xl px-4 py-2 flex items-center justify-between">
            <p className="text-[10px] text-gray-400 dark:text-gray-600">
              Klik na modul · ESC za zatvaranje
            </p>
            <div className="flex items-center gap-1.5 text-[10px] text-gray-400 dark:text-gray-600">
              <Command className="h-3 w-3" />
              <span>K</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
