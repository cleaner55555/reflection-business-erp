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
import {
  LayoutDashboard,
  Wallet,
  FileText,
  Warehouse,
  ShoppingCart,
  Users,
  BarChart3,
  HeartHandshake,
  CalendarDays,
  UserCog,
  FolderKanban,
  Building2,
  Files,
  BookOpen,
  Mail,
  GraduationCap,
  Car,
  CarFront,
  UtensilsCrossed,
  Settings,
  Plug,
  Landmark,
  Scale,
  Monitor,
  Truck,
} from 'lucide-react'

const menuGroups: { labelKey: string; items: { module: ModuleType; icon: React.ElementType; labelKey: string }[] }[] = [
  {
    labelKey: 'sidebar.group_overview',
    items: [{ module: 'dashboard', icon: LayoutDashboard, labelKey: 'sidebar.dashboard' }],
  },
  {
    labelKey: 'sidebar.group_business',
    items: [
      { module: 'finansije', icon: Wallet, labelKey: 'sidebar.finances' },
      { module: 'fakture', icon: FileText, labelKey: 'sidebar.invoices' },
      { module: 'magacin', icon: Warehouse, labelKey: 'sidebar.warehouse' },
      { module: 'nabavka', icon: ShoppingCart, labelKey: 'sidebar.procurement' },
      { module: 'bank-sync', icon: Landmark, labelKey: 'sidebar.bank' },
      { module: 'pos', icon: Monitor, labelKey: 'sidebar.pos' },
      { module: 'shipping', icon: Truck, labelKey: 'sidebar.shipping' },
    ],
  },
  {
    labelKey: 'sidebar.group_crm',
    items: [
      { module: 'crm', icon: HeartHandshake, labelKey: 'sidebar.crm' },
      { module: 'partneri', icon: Users, labelKey: 'sidebar.partners' },
      { module: 'kalendar', icon: CalendarDays, labelKey: 'sidebar.calendar' },
    ],
  },
  {
    labelKey: 'sidebar.group_organization',
    items: [
      { module: 'zaposleni', icon: UserCog, labelKey: 'sidebar.employees' },
      { module: 'projekti', icon: FolderKanban, labelKey: 'sidebar.projects' },
      { module: 'sredstva', icon: Building2, labelKey: 'sidebar.assets' },
      { module: 'dokumenta', icon: Files, labelKey: 'sidebar.documents' },
      { module: 'knjigovodstvo', icon: BookOpen, labelKey: 'sidebar.accounting' },
      { module: 'protokol', icon: FileText, labelKey: 'sidebar.protocol' },
      { module: 'edukacija', icon: GraduationCap, labelKey: 'sidebar.education' },
      { module: 'email-marketing', icon: Mail, labelKey: 'sidebar.emailMarketing' },
      { module: 'vozni-park', icon: Car, labelKey: 'sidebar.vehicleFleet' },
      { module: 'kafe-restoran', icon: UtensilsCrossed, labelKey: 'sidebar.cafeRestaurant' },
      { module: 'rent-a-car', icon: CarFront, labelKey: 'sidebar.rentACar' },
    ],
  },
  {
    labelKey: 'sidebar.group_analytics',
    items: [{ module: 'izvestaji', icon: BarChart3, labelKey: 'sidebar.reports' },
      { module: 'integracije', icon: Plug, labelKey: 'sidebar.integrations' },
      { module: 'zakoni', icon: Scale, labelKey: 'sidebar.laws' }],
  },
  {
    labelKey: 'sidebar.group_system',
    items: [{ module: 'podesavanja', icon: Settings, labelKey: 'sidebar.settings' }],
  },
]

export function AppSidebar() {
  const { activeModule, setActiveModule } = useAppStore()
  const { isMobile, setOpenMobile } = useSidebar()
  const { t } = useTranslation()
  const logo = useThemeStore((s) => s.logo)
  const companyName = useThemeStore((s) => s.companyName)

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
              <img
                src={logo}
                alt="Logo"
                className="h-7 w-7 object-contain"
              />
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
                <span className="text-xs font-medium text-primary">
                  Business
                </span>
              </>
            ) : (
              <>
                <span className="text-sm font-bold tracking-tight text-sidebar-foreground">
                  Reflection
                </span>
                <span className="text-xs font-medium text-primary">
                  Business
                </span>
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
                  <SidebarMenuButton
                    isActive={activeModule === item.module}
                    onClick={() => handleModuleClick(item.module)}
                    tooltip={t(item.labelKey)}
                  >
                    <item.icon className="h-4 w-4" />
                    <span>{t(item.labelKey)}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroup>
        ))}
      </SidebarContent>

      <SidebarFooter className="p-4">
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
            <span className="text-[10px] text-sidebar-foreground/50">ERP + CRM v3.0</span>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}
