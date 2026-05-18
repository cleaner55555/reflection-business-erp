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
import { Plug } from 'lucide-react'
import { menuGroups, totalModuleCount } from '@/lib/menuGroupsData'

export { menuGroups, totalModuleCount } from '@/lib/menuGroupsData'


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
