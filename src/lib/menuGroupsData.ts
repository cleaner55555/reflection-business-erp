// Single source of truth for all module definitions.
// Consumers: AppSidebar, PermissionsEditor, Settings, window-manager, module-groups, etc.

import type { ModuleType } from '@/lib/store'
import type { ElementType } from 'react'
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
  // New module icons
  BookOpenCheck, ClipboardPlus, Library, School, UserRound, FileHeart, Pill, Microscope,
  CalendarCheck, ChefHat, ArrowLeftRight, Stamp, Route, PackageCheck, Building, KeyRound, Eye, Zap,
  Ruler, Move, TruckIcon, ScanBarcode, ListChecks, Ticket, StarHalf, SearchCode, Bot, DatabaseBackup, Calculator, Clock, Timer,
  HardHat, RotateCcw, Tag, FileCheck, Activity,
  Smartphone,
} from 'lucide-react'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface MenuGroupItem {
  module: ModuleType
  icon: ElementType
  labelKey: string
}

export interface MenuGroup {
  labelKey: string
  items: MenuGroupItem[]
}

// ─── Sidebar menu groups (exact copy from former AppSidebar) ──────────────────

export const menuGroups: MenuGroup[] = [
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
      { module: 'api-docs', icon: FileCode, labelKey: 'sidebar.apiDocs' },
      { module: 'monitoring', icon: Activity, labelKey: 'sidebar.monitoring' },
      { module: 'mobile-app', icon: Smartphone, labelKey: 'sidebar.mobileApp' },
    ],
  },
]

// ─── Pre-computed lookups ─────────────────────────────────────────────────────

/** All unique module IDs across all groups */
const _allModuleIds = [...new Set(menuGroups.flatMap(g => g.items.map(i => i.module)))]

/** module ID → { icon, labelKey, groupLabelKey } */
const _moduleInfoMap = new Map<string, { icon: ElementType; labelKey: string; groupLabelKey: string }>()
for (const group of menuGroups) {
  for (const item of group.items) {
    if (!_moduleInfoMap.has(item.module)) {
      _moduleInfoMap.set(item.module, {
        icon: item.icon,
        labelKey: item.labelKey,
        groupLabelKey: group.labelKey,
      })
    }
  }
}

export function getModuleInfo(moduleId: string) {
  return _moduleInfoMap.get(moduleId)
}

export function getAllModuleIds(): ModuleType[] {
  return _allModuleIds as ModuleType[]
}

export const totalModuleCount = _allModuleIds.length

// ─── Code-group mapping (for code-splitting & Settings grouping) ─────────────
// Maps each module ID → a code-group key (core, hr, finance, sales, projects,
// it, logistics, education, hospitality, construction, property, medical,
// services, retail).
// Derived from the authoritative grouping in Settings/index.tsx ALL_MODULE_LABELS.

const MODULE_CODE_GROUP: Record<string, string> = {
  // Core
  dashboard: 'core', finance: 'core', invoices: 'core', inventory: 'core',
  contacts: 'core', reports: 'core', settings: 'core', calendar: 'core',
  documents: 'core', offers: 'core', expenses: 'core', automation: 'core',
  // HR
  employees: 'hr', recruitment: 'hr', leave: 'hr', skills: 'hr',
  approvals: 'hr', 'workforce-planner': 'hr', visitors: 'hr',
  suggestions: 'hr', 'time-tracking': 'hr', 'time-billing': 'hr',
  gamification: 'hr', signatures: 'hr',
  // Finance
  accounting: 'finance', 'bank-sync': 'finance', payments: 'finance',
  'cash-register': 'finance', pos: 'finance', subscriptions: 'finance',
  contracts: 'finance', procurement: 'finance', 'procurement-manager': 'finance',
  returns: 'finance', coupons: 'finance', 'price-lists': 'finance',
  // Sales
  crm: 'sales', support: 'sales', 'email-marketing': 'sales',
  'sms-marketing': 'sales', 'social-media': 'sales',
  'marketing-automation': 'sales', surveys: 'sales', events: 'sales',
  loyalty: 'sales', ratings: 'sales', referrals: 'sales', complaints: 'sales',
  // Projects
  projects: 'projects', assets: 'projects', maintenance: 'projects',
  manufacturing: 'projects', quality: 'projects', protocol: 'projects',
  plm: 'projects', standards: 'projects', labels: 'projects', barcode: 'projects',
  tenders: 'projects', warranty: 'projects',
  // IT
  chat: 'it', 'knowledge-base': 'it', website: 'it', blog: 'it',
  forum: 'it', spreadsheet: 'it', notes: 'it', integrations: 'it',
  backup: 'it', 'api-docs': 'it', laws: 'it', iot: 'it', voip: 'it', monitoring: 'it', 'mobile-app': 'it',
  // Logistics
  shipping: 'logistics', fleet: 'logistics', 'rent-a-car': 'logistics',
  delivery: 'logistics', routes: 'logistics', 'loading-dock': 'logistics',
  'customs-docs': 'logistics', trucks: 'logistics', packaging: 'logistics',
  measurements: 'logistics', marketplace: 'logistics', ecommerce: 'logistics',
  // Education
  education: 'education', homework: 'education', enrollment: 'education',
  timetable: 'education', library: 'education', classroom: 'education',
  tuition: 'education',
  // Hospitality
  restaurant: 'hospitality', reservations: 'hospitality', menu: 'hospitality',
  kitchen: 'hospitality', orders: 'hospitality',
  // Construction
  'construction-site': 'construction', blueprints: 'construction',
  subcontractors: 'construction', safety: 'construction',
  // Property
  property: 'property', rentals: 'property', 'property-viewings': 'property',
  utilities: 'property', 'work-orders': 'property', valuation: 'property',
  // Medical
  patients: 'medical', 'medical-records': 'medical', prescriptions: 'medical',
  lab: 'medical', 'health-fund': 'medical',
  // Services
  'service-center': 'services', 'field-service': 'services',
  appointments: 'services', scheduler: 'services', compliance: 'services',
  // Retail
  stores: 'retail', 'client-portal': 'retail', seo: 'retail',
  reviews: 'retail', cms: 'retail', geolocation: 'retail',
  cameras: 'retail', messaging: 'retail',
}

/** Build moduleGroupMap – used by module-groups/index.ts for code-splitting */
export function getModuleCodeGroupMap(): Record<string, string> {
  const map: Record<string, string> = {}
  for (const group of menuGroups) {
    for (const item of group.items) {
      map[item.module] = MODULE_CODE_GROUP[item.module] || 'core'
    }
  }
  return map
}
