'use client'

import { useAppStore, type ModuleType } from '@/lib/store'
import { cn } from '@/lib/utils'
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
  Compass,
  LayoutDashboard,
  Wallet,
  FileText,
  Warehouse,
  ShoppingCart,
  Users,
  BarChart3,
} from 'lucide-react'

const menuGroups: { label: string; items: { module: ModuleType; icon: React.ElementType; label: string }[] }[] = [
  {
    label: 'PREGLED',
    items: [{ module: 'dashboard', icon: LayoutDashboard, label: 'Pregled' }],
  },
  {
    label: 'POSLOVANJE',
    items: [
      { module: 'finansije', icon: Wallet, label: 'Finansije' },
      { module: 'fakture', icon: FileText, label: 'Fakture' },
      { module: 'magacin', icon: Warehouse, label: 'Magacin' },
      { module: 'nabavka', icon: ShoppingCart, label: 'Nabavka' },
    ],
  },
  {
    label: 'RELACIJE',
    items: [{ module: 'partneri', icon: Users, label: 'Partneri' }],
  },
  {
    label: 'ANALITIKA',
    items: [{ module: 'izvestaji', icon: BarChart3, label: 'Izveštaji' }],
  },
]

export function AppSidebar() {
  const { activeModule, setActiveModule } = useAppStore()
  const { isMobile, setOpenMobile } = useSidebar()

  const handleModuleClick = (module: ModuleType) => {
    setActiveModule(module)
    if (isMobile) setOpenMobile(false)
  }

  return (
    <Sidebar collapsible="icon" className="border-r border-sidebar-border/50">
      <SidebarHeader className="px-4 py-5">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Compass className="h-5 w-5" />
          </div>
          <div className="flex flex-col group-data-[collapsible=icon]:hidden">
            <span className="text-sm font-bold tracking-tight text-sidebar-foreground">
              Biznis
            </span>
            <span className="text-xs font-medium text-primary">
              Navigator
            </span>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        {menuGroups.map((group) => (
          <SidebarGroup key={group.label}>
            <SidebarGroupLabel>{group.label}</SidebarGroupLabel>
            <SidebarMenu>
              {group.items.map((item) => (
                <SidebarMenuItem key={item.module}>
                  <SidebarMenuButton
                    isActive={activeModule === item.module}
                    onClick={() => handleModuleClick(item.module)}
                    tooltip={item.label}
                  >
                    <item.icon className="h-4 w-4" />
                    <span>{item.label}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroup>
        ))}
      </SidebarContent>

      <SidebarFooter className="p-4">
        <div className="group-data-[collapsible=icon]:hidden flex items-center gap-2 rounded-lg bg-sidebar-accent p-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/20">
            <span className="text-xs font-bold text-primary">BN</span>
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-medium text-sidebar-foreground">Biznis Navigator</span>
            <span className="text-[10px] text-sidebar-foreground/50">ERP v1.0</span>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}
