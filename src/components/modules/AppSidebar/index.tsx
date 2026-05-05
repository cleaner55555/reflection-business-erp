'use client'

import { useAppStore, type ModuleType } from '@/lib/store'
import { useThemeStore } from '@/lib/theme'
import { useTranslation } from '@/lib/i18n'
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarFooter,
  useSidebar,
} from '@/components/ui/sidebar'
import { openAppLauncher } from '@/components/modules/AppLauncher'
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
  Award, Star, Gamepad2, FileSignature, BadgeCheck, ShieldAlert, Gavel, Shield, Crown, UserCheck, Lightbulb, Target, Heart, Camera, PackageSearch, FileCode,
  LayoutGrid,
  // New module icons
  BookOpenCheck, ClipboardPlus, Library, School, UserRound, FileHeart, Pill, Microscope,
  CalendarCheck, ChefHat, ArrowLeftRight, Stamp, Route, PackageCheck, Building, KeyRound, Eye, Zap,
  Ruler, Move, TruckIcon, ScanBarcode, ListChecks, Ticket, StarHalf, SearchCode, Bot, DatabaseBackup, Calculator, Clock, Timer,
  HardHat, RotateCcw, Tag, FileCheck
} from 'lucide-react'

export const menuGroups: { labelKey: string; items: { module: ModuleType; icon: React.ElementType; labelKey: string }[] }[] = [
  {
    labelKey: 'sidebar.group_overview',
    items: [{ module: 'dashboard', icon: LayoutDashboard, labelKey: 'sidebar.dashboard' }],
  },
  {
    labelKey: 'sidebar.group_business',
    items: [
      { module: 'finansije', icon: Wallet, labelKey: 'sidebar.finances' },
      { module: 'fakture', icon: FileText, labelKey: 'sidebar.invoices' },
      { module: 'ponude', icon: ClipboardList, labelKey: 'sidebar.quotes' },
      { module: 'magacin', icon: Warehouse, labelKey: 'sidebar.warehouse' },
      { module: 'nabavka', icon: ShoppingCart, labelKey: 'sidebar.procurement' },
      { module: 'bank-sync', icon: Landmark, labelKey: 'sidebar.bank' },
      { module: 'pos', icon: Monitor, labelKey: 'sidebar.pos' },
      { module: 'shipping', icon: Truck, labelKey: 'sidebar.shipping' },
      { module: 'proizvodnja', icon: Factory, labelKey: 'sidebar.manufacturing' },
      { module: 'troskovi', icon: Receipt, labelKey: 'sidebar.expenses' },
      { module: 'pretplate', icon: CreditCard, labelKey: 'sidebar.subscriptions' },
    ],
  },
  {
    labelKey: 'sidebar.group_crm',
    items: [
      { module: 'crm', icon: HeartHandshake, labelKey: 'sidebar.crm' },
      { module: 'partneri', icon: Users, labelKey: 'sidebar.partners' },
      { module: 'kalendar', icon: CalendarDays, labelKey: 'sidebar.calendar' },
      { module: 'marketplace', icon: Store, labelKey: 'sidebar.marketplace' },
      { module: 'podrska', icon: HeadphonesIcon, labelKey: 'sidebar.helpdesk' },
      { module: 'potpisi', icon: PenTool, labelKey: 'sidebar.sign' },
    ],
  },
  {
    labelKey: 'sidebar.group_organization',
    items: [
      { module: 'zaposleni', icon: UserCog, labelKey: 'sidebar.employees' },
      { module: 'odsustva', icon: Palmtree, labelKey: 'sidebar.timeoff' },
      { module: 'regrutacija', icon: Briefcase, labelKey: 'sidebar.recruitment' },
      { module: 'preporuke', icon: ThumbsUp, labelKey: 'sidebar.referrals' },
      { module: 'projekti', icon: FolderKanban, labelKey: 'sidebar.projects' },
      { module: 'zakazivanja', icon: CalendarClock, labelKey: 'sidebar.appointments' },
      { module: 'planer', icon: CalendarRange, labelKey: 'sidebar.planning' },
      { module: 'sredstva', icon: Building2, labelKey: 'sidebar.assets' },
      { module: 'odrzavanje', icon: Wrench, labelKey: 'sidebar.maintenance' },
      { module: 'kvalitet', icon: ShieldCheck, labelKey: 'sidebar.quality' },
      { module: 'dokumenta', icon: Files, labelKey: 'sidebar.documents' },
      { module: 'knjigovodstvo', icon: BookOpen, labelKey: 'sidebar.accounting' },
      { module: 'protokol', icon: FileText, labelKey: 'sidebar.protocol' },
      { module: 'edukacija', icon: GraduationCap, labelKey: 'sidebar.education' },
      { module: 'baza-znanja', icon: BookMarked, labelKey: 'sidebar.knowledge' },
      { module: 'email-marketing', icon: Mail, labelKey: 'sidebar.emailMarketing' },
      { module: 'drustvene-mreze', icon: Share2, labelKey: 'sidebar.social' },
      { module: 'sms-marketing', icon: Megaphone, labelKey: 'sidebar.sms' },
      { module: 'dogadjaji', icon: PartyPopper, labelKey: 'sidebar.events' },
      { module: 'mkt-automatizacija', icon: Workflow, labelKey: 'sidebar.mktAutomation' },
      { module: 'ankete', icon: ClipboardCheck, labelKey: 'sidebar.surveys' },
      { module: 'vozni-park', icon: Car, labelKey: 'sidebar.vehicleFleet' },
      { module: 'kafe-restoran', icon: UtensilsCrossed, labelKey: 'sidebar.cafeRestaurant' },
      { module: 'rent-a-car', icon: CarFront, labelKey: 'sidebar.rentACar' },
      { module: 'terenski-servis', icon: MapPin, labelKey: 'sidebar.fieldService' },
      { module: 'chet', icon: MessageCircle, labelKey: 'sidebar.discuss' },
      { module: 'beleske', icon: StickyNote, labelKey: 'sidebar.notes' },
      { module: 'odobrenja', icon: CheckCircle2, labelKey: 'sidebar.approvals' },
      { module: 'vestine', icon: Award, labelKey: 'sidebar.skills' },
      { module: 'ugovori', icon: FileSignature, labelKey: 'sidebar.contracts' },
      { module: 'website', icon: Globe2, labelKey: 'sidebar.website' },
      { module: 'blog', icon: PenLine, labelKey: 'sidebar.blog' },
      { module: 'voip', icon: Phone, labelKey: 'sidebar.voip' },
      { module: 'iot', icon: Wifi, labelKey: 'sidebar.iot' },
      { module: 'whatsapp', icon: MessageCircleReply, labelKey: 'sidebar.whatsapp' },
      { module: 'forum', icon: UsersRound, labelKey: 'sidebar.forum' },
      { module: 'plm', icon: GitBranch, labelKey: 'sidebar.plm' },
      { module: 'ecommerce', icon: ShoppingBag, labelKey: 'sidebar.ecommerce' },
      { module: 'spreadsheet', icon: Table2, labelKey: 'sidebar.spreadsheet' },
      { module: 'ocene', icon: Star, labelKey: 'sidebar.rating' },
      { module: 'gamifikacija', icon: Gamepad2, labelKey: 'sidebar.gamification' },
      { module: 'reklamacije', icon: ShieldAlert, labelKey: 'sidebar.complaints' },
      { module: 'natečaji', icon: Gavel, labelKey: 'sidebar.tenders' },
      { module: 'garancije', icon: ShieldCheck, labelKey: 'sidebar.warranties' },
      { module: 'servis', icon: Wrench, labelKey: 'sidebar.serviceCenter' },
      { module: 'uskladenost', icon: Shield, labelKey: 'sidebar.compliance' },
      { module: 'program-lojalnosti', icon: Crown, labelKey: 'sidebar.loyalty' },
      { module: 'planer-radne-sile', icon: CalendarRange, labelKey: 'sidebar.workforce' },
      { module: 'posetioci', icon: UserCheck, labelKey: 'sidebar.visitors' },
      { module: 'predlozi', icon: Lightbulb, labelKey: 'sidebar.suggestions' },
      { module: 'taksacija', icon: Target, labelKey: 'sidebar.appraisal' },
      { module: 'fond-zdravlja', icon: Heart, labelKey: 'sidebar.healthFund' },
      { module: 'geolokacija', icon: MapPin, labelKey: 'sidebar.geolocation' },
      { module: 'kamere', icon: Camera, labelKey: 'sidebar.cameras' },
      { module: 'menadzer-nabavke', icon: PackageSearch, labelKey: 'sidebar.procurementManager' },
      { module: 'cms', icon: FileCode, labelKey: 'sidebar.cms' },
    ],
  },
  // --- EDUCATION ---
  {
    labelKey: 'sidebar.group_education',
    items: [
      { module: 'obaveze', icon: BookOpenCheck, labelKey: 'sidebar.homework' },
      { module: 'prijave', icon: ClipboardPlus, labelKey: 'sidebar.enrollment' },
      { module: 'raspored', icon: CalendarDays, labelKey: 'sidebar.timetable' },
      { module: 'biblioteka', icon: Library, labelKey: 'sidebar.library' },
      { module: 'ucionica', icon: School, labelKey: 'sidebar.classroom' },
      { module: 'skolarina', icon: GraduationCap, labelKey: 'sidebar.tuition' },
    ],
  },
  // --- HEALTHCARE ---
  {
    labelKey: 'sidebar.group_healthcare',
    items: [
      { module: 'pacijenti', icon: UserRound, labelKey: 'sidebar.patients' },
      { module: 'kartoni', icon: FileHeart, labelKey: 'sidebar.medicalRecords' },
      { module: 'recepti', icon: Pill, labelKey: 'sidebar.prescriptions' },
      { module: 'laboratorija', icon: Microscope, labelKey: 'sidebar.laboratory' },
    ],
  },
  // --- HOSPITALITY ---
  {
    labelKey: 'sidebar.group_hospitality',
    items: [
      { module: 'rezervacije', icon: CalendarCheck, labelKey: 'sidebar.reservations' },
      { module: 'jelovnik', icon: UtensilsCrossed, labelKey: 'sidebar.menu' },
      { module: 'kuhinja', icon: ChefHat, labelKey: 'sidebar.kitchen' },
      { module: 'narudzbe', icon: ShoppingBag, labelKey: 'sidebar.orders' },
      { module: 'dostava', icon: Truck, labelKey: 'sidebar.delivery' },
    ],
  },
  // --- CONSTRUCTION ---
  {
    labelKey: 'sidebar.group_construction',
    items: [
      { module: 'gradiliste', icon: HardHat, labelKey: 'sidebar.siteDiary' },
      { module: 'projektovanje', icon: Ruler, labelKey: 'sidebar.blueprints' },
      { module: 'subodradaci', icon: Users, labelKey: 'sidebar.subcontractors' },
      { module: 'merenja', icon: Move, labelKey: 'sidebar.surveying' },
      { module: 'bezbednost', icon: ShieldAlert, labelKey: 'sidebar.safety' },
    ],
  },
  // --- LOGISTICS ---
  {
    labelKey: 'sidebar.group_logistics',
    items: [
      { module: 'rute', icon: Route, labelKey: 'sidebar.routes' },
      { module: 'utovar-istovar', icon: ArrowLeftRight, labelKey: 'sidebar.loading' },
      { module: 'carinski-dokument', icon: Stamp, labelKey: 'sidebar.customs' },
      { module: 'kamioni', icon: TruckIcon, labelKey: 'sidebar.trucks' },
      { module: 'pakovanje', icon: PackageCheck, labelKey: 'sidebar.packing' },
    ],
  },
  // --- REAL ESTATE ---
  {
    labelKey: 'sidebar.group_realestate',
    items: [
      { module: 'nekretnine', icon: Building, labelKey: 'sidebar.properties' },
      { module: 'iznajmljivanje', icon: KeyRound, labelKey: 'sidebar.rentals' },
      { module: 'pregledi-nekretnine', icon: Eye, labelKey: 'sidebar.viewings' },
      { module: 'komunalije', icon: Zap, labelKey: 'sidebar.utilities' },
    ],
  },
  // --- PRODUCTION+ ---
  {
    labelKey: 'sidebar.group_production',
    items: [
      { module: 'radni-nalozi', icon: ClipboardList, labelKey: 'sidebar.workOrders' },
      { module: 'normativ', icon: FileCheck, labelKey: 'sidebar.standards' },
      { module: 'etikete', icon: Tag, labelKey: 'sidebar.labels' },
    ],
  },
  // --- RETAIL ---
  {
    labelKey: 'sidebar.group_retail',
    items: [
      { module: 'barkod', icon: ScanBarcode, labelKey: 'sidebar.barcode' },
      { module: 'cenovnici', icon: ListChecks, labelKey: 'sidebar.priceLists' },
      { module: 'kuponi', icon: Ticket, labelKey: 'sidebar.coupons' },
      { module: 'recenzije', icon: StarHalf, labelKey: 'sidebar.reviews' },
      { module: 'seo', icon: SearchCode, labelKey: 'sidebar.seo' },
      { module: 'naplate', icon: CreditCard, labelKey: 'sidebar.payments' },
      { module: 'povrat', icon: RotateCcw, labelKey: 'sidebar.returns' },
      { module: 'blagajna', icon: Calculator, labelKey: 'sidebar.cashRegister' },
    ],
  },
  // --- SERVICES ---
  {
    labelKey: 'sidebar.group_services',
    items: [
      { module: 'vremenski-trag', icon: Clock, labelKey: 'sidebar.timeTracking' },
      { module: 'fakturisanje-vremena', icon: Timer, labelKey: 'sidebar.timeBilling' },
      { module: 'klijentski-portal', icon: Globe2, labelKey: 'sidebar.clientPortal' },
      { module: 'automatizacija', icon: Bot, labelKey: 'sidebar.automation' },
      { module: 'poslovnice', icon: Store, labelKey: 'sidebar.branches' },
    ],
  },
  {
    labelKey: 'sidebar.group_analytics',
    items: [
      { module: 'izvestaji', icon: BarChart3, labelKey: 'sidebar.reports' },
      { module: 'integracije', icon: Plug, labelKey: 'sidebar.integrations' },
      { module: 'zakoni', icon: Scale, labelKey: 'sidebar.laws' },
    ],
  },
  {
    labelKey: 'sidebar.group_system',
    items: [
      { module: 'podesavanja', icon: Settings, labelKey: 'sidebar.settings' },
      { module: 'backup', icon: DatabaseBackup, labelKey: 'sidebar.backup' },
    ],
  },
]

export function AppSidebar() {
  const { activeModule, setActiveModule } = useAppStore()
  const { isMobile, setOpenMobile } = useSidebar()
  const { t } = useTranslation()
  const logo = useThemeStore((s) => s.logo)
  const companyName = useThemeStore((s) => s.companyName)
  const isModuleEnabled = useAppStore((s) => s.isModuleEnabled)

  const handleModuleClick = (module: ModuleType) => {
    setActiveModule(module)
    if (isMobile) setOpenMobile(false)
  }

  return (
    <Sidebar collapsible="icon" className="border-r border-sidebar-border/50">
      <SidebarHeader className="px-4 py-5">
        <div className="flex items-center gap-3">
          {logo ? (
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg overflow-hidden bg-sidebar-accent">
              <img src={logo} alt="Logo" className="h-7 w-7 object-contain" />
            </div>
          ) : (
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-primary/70 text-primary-foreground">
              <Plug className="h-5 w-5" />
            </div>
          )}
          <div className="flex flex-col group-data-[collapsible=icon]:hidden">
            {companyName ? (
              <>
                <span className="text-sm font-bold tracking-tight text-sidebar-foreground truncate max-w-[140px]">
                  {companyName}
                </span>
                <span className="text-xs font-medium text-primary">Business</span>
              </>
            ) : (
              <>
                <span className="text-sm font-bold tracking-tight text-sidebar-foreground">Reflection</span>
                <span className="text-xs font-medium text-primary">Business</span>
              </>
            )}
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        {menuGroups.map((group) => (
          <SidebarGroup key={group.labelKey}>
            <SidebarGroupLabel>{t(group.labelKey)}</SidebarGroupLabel>
            <SidebarMenu>
              {group.items.map((item) => (
                <SidebarMenuItem key={item.module}>
                  {isModuleEnabled(item.module) ? (
                    <SidebarMenuButton
                      isActive={activeModule === item.module}
                      onClick={() => handleModuleClick(item.module)}
                      tooltip={t(item.labelKey)}
                    >
                      <item.icon className="h-4 w-4" />
                      <span>{t(item.labelKey)}</span>
                    </SidebarMenuButton>
                  ) : null}
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroup>
        ))}
      </SidebarContent>

      <SidebarFooter className="p-2">
        {/* Launcher button - dots grid, visible when sidebar is collapsed */}
        <button
          onClick={() => openAppLauncher()}
          className="group-data-[collapsible=icon]:flex hidden w-full items-center justify-center rounded-lg p-2 hover:bg-sidebar-accent transition-colors"
          title="Prikaži sve module"
        >
          <div className="grid grid-cols-3 gap-[3px]">
            {[...Array(9)].map((_, i) => (
              <span key={i} className="block h-[3px] w-[3px] rounded-full bg-sidebar-foreground/60" />
            ))}
          </div>
        </button>
        {/* Company info - visible when sidebar is expanded */}
        <div className="group-data-[collapsible=icon]:hidden flex items-center gap-2 rounded-lg bg-sidebar-accent p-3">
          {logo ? (
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full overflow-hidden">
              <img src={logo} alt="Logo" className="h-6 w-6 object-contain" />
            </div>
          ) : (
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/20">
              <span className="text-xs font-bold text-primary">RB</span>
            </div>
          )}
          <div className="flex flex-col">
            <span className="text-xs font-medium text-sidebar-foreground truncate max-w-[120px]">
              {companyName || 'Reflection Business'}
            </span>
            <span className="text-[10px] text-sidebar-foreground/50">ERP + CRM v4.0 · {menuGroups.reduce((sum, g) => sum + g.items.length, 0)} modula</span>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}
