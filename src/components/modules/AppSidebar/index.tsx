'use client'

import { useState, useMemo } from 'react'
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
  SidebarInput,
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
      { module: 'finance', icon: Wallet, labelKey: 'sidebar.finances' },
      { module: 'invoices', icon: FileText, labelKey: 'sidebar.invoices' },
      { module: 'offers', icon: ClipboardList, labelKey: 'sidebar.quotes' },
      { module: 'inventory', icon: Warehouse, labelKey: 'sidebar.warehouse' },
      { module: 'procurement', icon: ShoppingCart, labelKey: 'sidebar.procurement' },
      { module: 'bank-sync', icon: Landmark, labelKey: 'sidebar.bank' },
      { module: 'pos', icon: Monitor, labelKey: 'sidebar.pos' },
      { module: 'shipping', icon: Truck, labelKey: 'sidebar.shipping' },
      { module: 'manufacturing', icon: Factory, labelKey: 'sidebar.manufacturing' },
      { module: 'expenses', icon: Receipt, labelKey: 'sidebar.expenses' },
      { module: 'subscriptions', icon: CreditCard, labelKey: 'sidebar.subscriptions' },
    ],
  },
  {
    labelKey: 'sidebar.group_crm',
    items: [
      { module: 'crm', icon: HeartHandshake, labelKey: 'sidebar.crm' },
      { module: 'contacts', icon: Users, labelKey: 'sidebar.partners' },
      { module: 'calendar', icon: CalendarDays, labelKey: 'sidebar.calendar' },
      { module: 'marketplace', icon: Store, labelKey: 'sidebar.marketplace' },
      { module: 'support', icon: HeadphonesIcon, labelKey: 'sidebar.helpdesk' },
      { module: 'signatures', icon: PenTool, labelKey: 'sidebar.sign' },
    ],
  },
  {
    labelKey: 'sidebar.group_organization',
    items: [
      { module: 'employees', icon: UserCog, labelKey: 'sidebar.employees' },
      { module: 'leave', icon: Palmtree, labelKey: 'sidebar.timeoff' },
      { module: 'recruitment', icon: Briefcase, labelKey: 'sidebar.recruitment' },
      { module: 'referrals', icon: ThumbsUp, labelKey: 'sidebar.referrals' },
      { module: 'projects', icon: FolderKanban, labelKey: 'sidebar.projects' },
      { module: 'appointments', icon: CalendarClock, labelKey: 'sidebar.appointments' },
      { module: 'scheduler', icon: CalendarRange, labelKey: 'sidebar.planning' },
      { module: 'assets', icon: Building2, labelKey: 'sidebar.assets' },
      { module: 'maintenance', icon: Wrench, labelKey: 'sidebar.maintenance' },
      { module: 'quality', icon: ShieldCheck, labelKey: 'sidebar.quality' },
      { module: 'documents', icon: Files, labelKey: 'sidebar.documents' },
      { module: 'accounting', icon: BookOpen, labelKey: 'sidebar.accounting' },
      { module: 'protocol', icon: FileText, labelKey: 'sidebar.protocol' },
      { module: 'education', icon: GraduationCap, labelKey: 'sidebar.education' },
      { module: 'knowledge-base', icon: BookMarked, labelKey: 'sidebar.knowledge' },
      { module: 'email-marketing', icon: Mail, labelKey: 'sidebar.emailMarketing' },
      { module: 'social-media', icon: Share2, labelKey: 'sidebar.social' },
      { module: 'sms-marketing', icon: Megaphone, labelKey: 'sidebar.sms' },
      { module: 'events', icon: PartyPopper, labelKey: 'sidebar.events' },
      { module: 'marketing-automation', icon: Workflow, labelKey: 'sidebar.mktAutomation' },
      { module: 'surveys', icon: ClipboardCheck, labelKey: 'sidebar.surveys' },
      { module: 'fleet', icon: Car, labelKey: 'sidebar.vehicleFleet' },
      { module: 'restaurant', icon: UtensilsCrossed, labelKey: 'sidebar.cafeRestaurant' },
      { module: 'rent-a-car', icon: CarFront, labelKey: 'sidebar.rentACar' },
      { module: 'field-service', icon: MapPin, labelKey: 'sidebar.fieldService' },
      { module: 'chat', icon: MessageCircle, labelKey: 'sidebar.discuss' },
      { module: 'notes', icon: StickyNote, labelKey: 'sidebar.notes' },
      { module: 'approvals', icon: CheckCircle2, labelKey: 'sidebar.approvals' },
      { module: 'skills', icon: Award, labelKey: 'sidebar.skills' },
      { module: 'contracts', icon: FileSignature, labelKey: 'sidebar.contracts' },
      { module: 'website', icon: Globe2, labelKey: 'sidebar.website' },
      { module: 'blog', icon: PenLine, labelKey: 'sidebar.blog' },
      { module: 'voip', icon: Phone, labelKey: 'sidebar.voip' },
      { module: 'iot', icon: Wifi, labelKey: 'sidebar.iot' },
      { module: 'messaging', icon: MessageCircleReply, labelKey: 'sidebar.whatsapp' },
      { module: 'forum', icon: UsersRound, labelKey: 'sidebar.forum' },
      { module: 'plm', icon: GitBranch, labelKey: 'sidebar.plm' },
      { module: 'ecommerce', icon: ShoppingBag, labelKey: 'sidebar.ecommerce' },
      { module: 'spreadsheet', icon: Table2, labelKey: 'sidebar.spreadsheet' },
      { module: 'ratings', icon: Star, labelKey: 'sidebar.rating' },
      { module: 'gamification', icon: Gamepad2, labelKey: 'sidebar.gamification' },
      { module: 'complaints', icon: ShieldAlert, labelKey: 'sidebar.complaints' },
      { module: 'tenders', icon: Gavel, labelKey: 'sidebar.tenders' },
      { module: 'warranty', icon: ShieldCheck, labelKey: 'sidebar.warranties' },
      { module: 'service-center', icon: Wrench, labelKey: 'sidebar.serviceCenter' },
      { module: 'compliance', icon: Shield, labelKey: 'sidebar.compliance' },
      { module: 'loyalty', icon: Crown, labelKey: 'sidebar.loyalty' },
      { module: 'workforce-planner', icon: CalendarRange, labelKey: 'sidebar.workforce' },
      { module: 'visitors', icon: UserCheck, labelKey: 'sidebar.visitors' },
      { module: 'suggestions', icon: Lightbulb, labelKey: 'sidebar.suggestions' },
      { module: 'valuation', icon: Target, labelKey: 'sidebar.appraisal' },
      { module: 'health-fund', icon: Heart, labelKey: 'sidebar.healthFund' },
      { module: 'geolocation', icon: MapPin, labelKey: 'sidebar.geolocation' },
      { module: 'cameras', icon: Camera, labelKey: 'sidebar.cameras' },
      { module: 'procurement-manager', icon: PackageSearch, labelKey: 'sidebar.procurementManager' },
      { module: 'cms', icon: FileCode, labelKey: 'sidebar.cms' },
    ],
  },
  // --- EDUCATION ---
  {
    labelKey: 'sidebar.group_education',
    items: [
      { module: 'homework', icon: BookOpenCheck, labelKey: 'sidebar.homework' },
      { module: 'enrollment', icon: ClipboardPlus, labelKey: 'sidebar.enrollment' },
      { module: 'timetable', icon: CalendarDays, labelKey: 'sidebar.timetable' },
      { module: 'library', icon: Library, labelKey: 'sidebar.library' },
      { module: 'classroom', icon: School, labelKey: 'sidebar.classroom' },
      { module: 'tuition', icon: GraduationCap, labelKey: 'sidebar.tuition' },
    ],
  },
  // --- HEALTHCARE ---
  {
    labelKey: 'sidebar.group_healthcare',
    items: [
      { module: 'patients', icon: UserRound, labelKey: 'sidebar.patients' },
      { module: 'medical-records', icon: FileHeart, labelKey: 'sidebar.medicalRecords' },
      { module: 'prescriptions', icon: Pill, labelKey: 'sidebar.prescriptions' },
      { module: 'lab', icon: Microscope, labelKey: 'sidebar.laboratory' },
    ],
  },
  // --- HOSPITALITY ---
  {
    labelKey: 'sidebar.group_hospitality',
    items: [
      { module: 'reservations', icon: CalendarCheck, labelKey: 'sidebar.reservations' },
      { module: 'menu', icon: UtensilsCrossed, labelKey: 'sidebar.menu' },
      { module: 'kitchen', icon: ChefHat, labelKey: 'sidebar.kitchen' },
      { module: 'orders', icon: ShoppingBag, labelKey: 'sidebar.orders' },
      { module: 'delivery', icon: Truck, labelKey: 'sidebar.delivery' },
    ],
  },
  // --- CONSTRUCTION ---
  {
    labelKey: 'sidebar.group_construction',
    items: [
      { module: 'construction-site', icon: HardHat, labelKey: 'sidebar.siteDiary' },
      { module: 'blueprints', icon: Ruler, labelKey: 'sidebar.blueprints' },
      { module: 'subcontractors', icon: Users, labelKey: 'sidebar.subcontractors' },
      { module: 'measurements', icon: Move, labelKey: 'sidebar.surveying' },
      { module: 'safety', icon: ShieldAlert, labelKey: 'sidebar.safety' },
    ],
  },
  // --- LOGISTICS ---
  {
    labelKey: 'sidebar.group_logistics',
    items: [
      { module: 'routes', icon: Route, labelKey: 'sidebar.routes' },
      { module: 'loading-dock', icon: ArrowLeftRight, labelKey: 'sidebar.loading' },
      { module: 'customs-docs', icon: Stamp, labelKey: 'sidebar.customs' },
      { module: 'trucks', icon: TruckIcon, labelKey: 'sidebar.trucks' },
      { module: 'packaging', icon: PackageCheck, labelKey: 'sidebar.packing' },
    ],
  },
  // --- REAL ESTATE ---
  {
    labelKey: 'sidebar.group_realestate',
    items: [
      { module: 'property', icon: Building, labelKey: 'sidebar.properties' },
      { module: 'rentals', icon: KeyRound, labelKey: 'sidebar.rentals' },
      { module: 'property-viewings', icon: Eye, labelKey: 'sidebar.viewings' },
      { module: 'utilities', icon: Zap, labelKey: 'sidebar.utilities' },
    ],
  },
  // --- PRODUCTION+ ---
  {
    labelKey: 'sidebar.group_production',
    items: [
      { module: 'work-orders', icon: ClipboardList, labelKey: 'sidebar.workOrders' },
      { module: 'standards', icon: FileCheck, labelKey: 'sidebar.standards' },
      { module: 'labels', icon: Tag, labelKey: 'sidebar.labels' },
    ],
  },
  // --- RETAIL ---
  {
    labelKey: 'sidebar.group_retail',
    items: [
      { module: 'barcode', icon: ScanBarcode, labelKey: 'sidebar.barcode' },
      { module: 'price-lists', icon: ListChecks, labelKey: 'sidebar.priceLists' },
      { module: 'coupons', icon: Ticket, labelKey: 'sidebar.coupons' },
      { module: 'reviews', icon: StarHalf, labelKey: 'sidebar.reviews' },
      { module: 'seo', icon: SearchCode, labelKey: 'sidebar.seo' },
      { module: 'payments', icon: CreditCard, labelKey: 'sidebar.payments' },
      { module: 'returns', icon: RotateCcw, labelKey: 'sidebar.returns' },
      { module: 'cash-register', icon: Calculator, labelKey: 'sidebar.cashRegister' },
    ],
  },
  // --- SERVICES ---
  {
    labelKey: 'sidebar.group_services',
    items: [
      { module: 'time-tracking', icon: Clock, labelKey: 'sidebar.timeTracking' },
      { module: 'time-billing', icon: Timer, labelKey: 'sidebar.timeBilling' },
      { module: 'client-portal', icon: Globe2, labelKey: 'sidebar.clientPortal' },
      { module: 'automation', icon: Bot, labelKey: 'sidebar.automation' },
      { module: 'stores', icon: Store, labelKey: 'sidebar.branches' },
    ],
  },
  {
    labelKey: 'sidebar.group_analytics',
    items: [
      { module: 'reports', icon: BarChart3, labelKey: 'sidebar.reports' },
      { module: 'integrations', icon: Plug, labelKey: 'sidebar.integrations' },
      { module: 'laws', icon: Scale, labelKey: 'sidebar.laws' },
    ],
  },
  {
    labelKey: 'sidebar.group_system',
    items: [
      { module: 'settings', icon: Settings, labelKey: 'sidebar.settings' },
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

  const [search, setSearch] = useState('')

  const handleModuleClick = (module: ModuleType) => {
    setActiveModule(module)
    if (isMobile) setOpenMobile(false)
  }

  // Filter groups based on search
  const filteredGroups = useMemo(() => {
    if (!search.trim()) return menuGroups
    const q = search.toLowerCase().trim()
    return menuGroups
      .map((group) => {
        const groupLabel = t(group.labelKey).toLowerCase()
        const filteredItems = group.items.filter((item) => {
          const label = t(item.labelKey).toLowerCase()
          const moduleName = item.module.toLowerCase()
          return label.includes(q) || moduleName.includes(q)
        })
        // If search matches group label, show all enabled items
        if (groupLabel.includes(q)) {
          return { ...group, items: group.items.filter((item) => isModuleEnabled(item.module)) }
        }
        return { ...group, items: filteredItems.filter((item) => isModuleEnabled(item.module)) }
      })
      .filter((group) => group.items.length > 0)
  }, [search, t, isModuleEnabled])

  const totalModuleCount = menuGroups.reduce((sum, g) => sum + g.items.length, 0)

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
        {/* Search */}
        <div className="px-3 pb-2 group-data-[collapsible=icon]:hidden">
          <SidebarInput
            placeholder="Pretraži module..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Collapsed search icon */}
        <div className="group-data-[collapsible=icon]:flex hidden px-2 pb-2 justify-center">
          <button
            onClick={() => openAppLauncher()}
            className="flex items-center justify-center rounded-lg p-2 hover:bg-sidebar-accent transition-colors"
            title="Pretraži module"
          >
            <div className="grid grid-cols-3 gap-[3px]">
              {[...Array(9)].map((_, i) => (
                <span key={i} className="block h-[3px] w-[3px] rounded-full bg-sidebar-foreground/60" />
              ))}
            </div>
          </button>
        </div>

        {filteredGroups.map((group) => (
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
                      className="min-h-[44px] sm:min-h-0"
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

        {/* No results */}
        {filteredGroups.length === 0 && search.trim() && (
          <div className="px-4 py-6 text-center">
            <p className="text-xs text-muted-foreground">Nema rezultata za &quot;{search}&quot;</p>
          </div>
        )}
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
            <span className="text-xs text-sidebar-foreground/50">ERP + CRM v4.0 · {totalModuleCount} modula</span>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}
