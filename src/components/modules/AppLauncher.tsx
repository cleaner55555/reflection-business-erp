'use client'

import { useState, useEffect, useMemo, useRef } from 'react'
import { useAppStore, type ModuleType } from '@/lib/store'
import { useThemeStore } from '@/lib/theme'
import { useTranslation } from '@/lib/i18n'
import {
  Dialog,
  DialogContent,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
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

// Module definition with icon
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

// Export open function for the floating button
let _setOpen: (open: boolean) => void = () => {}
export function openAppLauncher() { _setOpen(true) }

export function AppLauncher() {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const { activeModule, setActiveModule } = useAppStore()
  const { t } = useTranslation()
  const companyName = useThemeStore((s) => s.companyName)
  const inputRef = useRef<HTMLInputElement>(null)

  // Expose setOpen
  useEffect(() => { _setOpen = setOpen }, [setOpen])

  // Focus input on open
  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 100)
      setSearch('')
    }
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

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="flex flex-col sm:max-w-3xl max-h-[85vh] p-0 gap-0">
        {/* Search header */}
        <div className="flex items-center gap-3 border-b px-4 py-3 shrink-0">
          <Search className="h-5 w-5 text-muted-foreground shrink-0" />
          <input
            ref={inputRef}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Pretraži module... (Ctrl+K)"
            className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          />
          {search && (
            <button onClick={() => setSearch('')} className="text-muted-foreground hover:text-foreground">
              <X className="h-4 w-4" />
            </button>
          )}
          <kbd className="hidden sm:inline-flex h-5 shrink-0 items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
            ESC
          </kbd>
        </div>

        {/* Module grid */}
        <ScrollArea className="flex-1 overflow-auto">
          <div className="px-4 py-3 space-y-5">
            {!search && (
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Svi moduli — {allModules.length}
                </h3>
                <Badge variant="secondary" className="text-[10px]">
                  {companyName || 'Reflection Business'}
                </Badge>
              </div>
            )}

            {Object.entries(grouped).map(([group, modules]) => (
              <div key={group}>
                <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2 px-1">
                  {group} ({modules.length})
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-1.5">
                  {modules.map((m) => {
                    const isActive = activeModule === m.id
                    const Icon = m.icon
                    return (
                      <button
                        key={m.id}
                        onClick={() => handleSelect(m.id)}
                        className={`
                          flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-left text-sm
                          transition-all duration-150 select-text
                          ${isActive
                            ? 'bg-primary text-primary-foreground shadow-sm'
                            : 'hover:bg-accent hover:text-accent-foreground'
                          }
                        `}
                      >
                        <Icon className={`h-4 w-4 shrink-0 ${isActive ? '' : 'text-muted-foreground'}`} />
                        <span className="truncate text-xs font-medium">{t(m.labelKey)}</span>
                      </button>
                    )
                  })}
                </div>
              </div>
            ))}

            {filtered.length === 0 && (
              <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                <Search className="h-8 w-8 mb-2" />
                <p className="text-sm">Nema rezultata za &quot;{search}&quot;</p>
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Footer */}
        <div className="flex items-center justify-between border-t px-4 py-2 shrink-0">
          <p className="text-[10px] text-muted-foreground">
            {filtered.length} od {allModules.length} modula
          </p>
          <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
            <Command className="h-3 w-3" />
            <span>K</span>
            <span className="mx-1">·</span>
            <span>↑↓ navigacija</span>
            <span className="mx-1">·</span>
            <span>Enter odabir</span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
