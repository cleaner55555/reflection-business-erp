export const allModules: ModuleDef[] = [
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

export const { activeModule, setActiveModule } = useAppStore();

export const { isDesktopMode } = useWindowManager();

export const { t } = useTranslation();

export const companyName = useThemeStore((s) => s.companyName);

export const isModuleEnabled = useAppStore((s) => s.isModuleEnabled);

export const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        setOpen(false)
      }
    }

export const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setOpen(true)
      }
    }

export const q = search.toLowerCase();

export const groups: Record<string, ModuleDef[]> = {}

export const handleSelect = (id: ModuleType) => {
    if (isDesktopMode) {
      const { openWindow } = useWindowManager.getState()
      openWindow(id, t(allModules.find(m => m.id === id)?.labelKey || id), id)
    } else {
      setActiveModule(id)
    }
    setOpen(false)
  }

export const handleSendToDesktop = (e: React.MouseEvent, id: ModuleType) => {
    e.stopPropagation()
    const { addShortcut } = useWindowManager.getState()
    addShortcut(id)
  }

export const isOnDesktop = (id: ModuleType) => {
    const { desktopShortcuts } = useWindowManager.getState()
    return desktopShortcuts.some((s) => s.module === id)
  }

export const isActive = activeModule === m.id;

export const Icon = m.icon;

export const onDesktop = isDesktopMode && isOnDesktop(m.id);

export function openAppLauncher() { _setOpen(true) }
