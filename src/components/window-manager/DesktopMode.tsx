'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { useWindowManager } from '@/lib/windowManager'
import { useAppStore } from '@/lib/store'
import { useTranslation } from '@/lib/i18n'
import { useThemeStore } from '@/lib/theme'
import { menuGroups } from '@/components/modules/AppSidebar'
import { WindowFrame } from './WindowFrame'
import { Dock } from './Dock'
import { GlobalSearch } from '@/components/modules/GlobalSearch'
import { ThemeToggle } from '@/components/theme-toggle'
import { UserMenu } from '@/components/modules/UserMenu'
import { CompanySwitcher } from '@/components/modules/CompanySwitcher'
import {
  Search,
  X,
  ChevronLeft,
  ChevronRight,
  MonitorOff,
  LayoutGrid,
} from 'lucide-react'
import { ALL_LANGUAGES } from '@/lib/i18n'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { ModuleType } from '@/lib/store'

const DEFAULT_ACTIVE_LANGS = ['sr', 'sr-latn', 'en']

export function DesktopMode() {
  const { windows, openWindow, toggleDesktopMode } = useWindowManager()
  const { t, locale, setLocale } = useTranslation()
  const allMenuItems = useMemo(() => menuGroups.flatMap((g) => g.items), [])
  const logo = useThemeStore((s) => s.logo)
  const companyName = useThemeStore((s) => s.companyName)

  // Sidebar state
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [sidebarSearch, setSidebarSearch] = useState('')
  const [activeGroupId, setActiveGroupId] = useState<string | null>(null)

  // Active languages
  const [activeLangs, setActiveLangs] = useState<string[]>(DEFAULT_ACTIVE_LANGS)
  const activeCompanyId = useAppStore((s) => s.activeCompanyId)

  // Load active languages
  useEffect(() => {
    if (!activeCompanyId) return
    fetch(`/api/settings?group=general&companyId=${activeCompanyId}`)
      .then((res) => (res.ok ? res.json() : []))
      .then((data: Array<{ key: string; value: string }>) => {
        const setting = data?.find((s) => s.key === 'active_languages')
        if (setting?.value) {
          try {
            const parsed = JSON.parse(setting.value)
            if (Array.isArray(parsed) && parsed.length > 0) {
              setActiveLangs(parsed)
            }
          } catch {
            /* use default */
          }
        }
      })
      .catch(() => {
        /* use default */
      })
  }, [activeCompanyId])

  const headerLanguages = ALL_LANGUAGES.filter((l) => activeLangs.includes(l.code))

  // Seed database on first load
  const [seeded, setSeeded] = useState(false)
  if (!seeded) {
    setSeeded(true)
    fetch('/api/seed', { method: 'POST' }).catch(() => {})
  }

  // Auto-generate notifications
  const currentUser = useAppStore((s) => s.currentUser)
  useEffect(() => {
    if (!currentUser || !activeCompanyId) return
    const timer = setTimeout(async () => {
      try {
        await fetch('/api/notifications/generate', {
          method: 'POST',
          headers: { 'x-company-id': activeCompanyId },
        })
      } catch {
        /* silent */
      }
    }, 2000)
    return () => clearTimeout(timer)
  }, [currentUser, activeCompanyId])

  useEffect(() => {
    if (!currentUser || !activeCompanyId) return
    const interval = setInterval(async () => {
      try {
        await fetch('/api/notifications/generate', {
          method: 'POST',
          headers: { 'x-company-id': activeCompanyId },
        })
      } catch {
        /* silent */
      }
    }, 60000)
    return () => clearInterval(interval)
  }, [currentUser, activeCompanyId])

  const handleOpenModule = useCallback(
    (module: ModuleType) => {
      const item = allMenuItems.find((m) => m.module === module)
      const label = item ? t(item.labelKey) : String(module)
      openWindow(module, label, module)
    },
    [allMenuItems, t, openWindow]
  )

  // Filter groups by search
  const filteredGroups = useMemo(() => {
    if (!sidebarSearch) return menuGroups
    return menuGroups
      .map((g) => ({
        ...g,
        items: g.items.filter((item) => {
          const label = t(item.labelKey).toLowerCase()
          return label.includes(sidebarSearch.toLowerCase())
        }),
      }))
      .filter((g) => g.items.length > 0)
  }, [sidebarSearch, t])

  const visibleWindows = windows.filter((w) => !w.isMinimized)

  return (
    <div className="fixed inset-0 flex flex-col overflow-hidden bg-gradient-to-br from-muted/60 via-background to-muted/40">
      {/* ===== TOP BAR ===== */}
      <header className="flex h-12 shrink-0 items-center justify-between gap-2 border-b bg-background/95 backdrop-blur-md px-3 z-[100010]">
        {/* Left — Company + desktop toggle */}
        <div className="flex items-center gap-3">
          {/* Sidebar toggle */}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="flex items-center justify-center w-8 h-8 rounded-md hover:bg-accent transition-colors"
            title={sidebarOpen ? 'Sakrij meni' : 'Prikaži meni'}
          >
            {sidebarOpen ? (
              <ChevronLeft className="w-4 h-4 text-muted-foreground" />
            ) : (
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            )}
          </button>

          {/* Logo + Company name */}
          <div className="flex items-center gap-2">
            {logo ? (
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md overflow-hidden bg-primary/10">
                <img src={logo} alt="Logo" className="h-5 w-5 object-contain" />
              </div>
            ) : (
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-gradient-to-br from-primary to-primary/70 text-primary-foreground">
                <LayoutGrid className="h-3.5 w-3.5" />
              </div>
            )}
            <div className="flex flex-col">
              <span className="text-xs font-bold text-foreground leading-tight">
                {companyName || 'Reflection Business'}
              </span>
              <span className="text-[10px] text-muted-foreground leading-tight">
                {allMenuItems.length} modula · {windows.length} prozora
              </span>
            </div>
          </div>
        </div>

        {/* Right — Controls */}
        <div className="flex items-center gap-2">
          <CompanySwitcher />
          <GlobalSearch />
          {headerLanguages.length > 1 ? (
            <Select value={locale} onValueChange={(val) => setLocale(val)}>
              <SelectTrigger className="h-7 w-auto min-w-[120px] text-xs">
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
              className="flex h-7 items-center gap-1 rounded-md border border-input bg-background px-2 text-xs"
            >
              <span>{headerLanguages[0]?.flag || '🌐'}</span>
              <span>{headerLanguages[0]?.nativeName || 'SR'}</span>
            </button>
          )}
          <ThemeToggle />
          <button
            onClick={toggleDesktopMode}
            className="flex items-center justify-center h-7 w-7 rounded-md border border-input bg-background hover:bg-accent transition-colors"
            title="Normalan režim"
          >
            <MonitorOff className="h-3.5 w-3.5 text-muted-foreground" />
          </button>
          <UserMenu />
        </div>
      </header>

      {/* ===== MAIN AREA ===== */}
      <div className="flex-1 flex overflow-hidden">
        {/* ===== LEFT SIDEBAR — All Modules ===== */}
        <div
          className={`shrink-0 border-r bg-background/95 backdrop-blur-md flex flex-col transition-all duration-200 ${
            sidebarOpen ? 'w-72' : 'w-0 border-r-0 overflow-hidden'
          }`}
          style={{ zIndex: 100005 }}
        >
          {/* Sidebar search */}
          <div className="px-3 py-2 border-b border-border/40">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Pretraži module..."
                value={sidebarSearch}
                onChange={(e) => setSidebarSearch(e.target.value)}
                className="w-full h-8 pl-8 pr-8 text-xs rounded-md border border-input bg-background focus:outline-none focus:ring-1 focus:ring-primary"
              />
              {sidebarSearch && (
                <button
                  onClick={() => setSidebarSearch('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2"
                >
                  <X className="w-3 h-3 text-muted-foreground hover:text-foreground" />
                </button>
              )}
            </div>
          </div>

          {/* Module groups — scrollable */}
          <div className="flex-1 overflow-y-auto py-1">
            {filteredGroups.map((group) => (
              <div key={group.labelKey} className="mb-1">
                {/* Group header — click to collapse/expand */}
                <button
                  onClick={() =>
                    setActiveGroupId(activeGroupId === group.labelKey ? null : group.labelKey)
                  }
                  className="flex items-center justify-between w-full px-3 py-1.5 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider hover:bg-muted/50 transition-colors"
                >
                  <span>{t(group.labelKey)}</span>
                  <span className="text-[9px] text-muted-foreground/60">{group.items.length}</span>
                </button>

                {/* Group items */}
                <div className="space-y-px px-1">
                  {(activeGroupId === group.labelKey || !activeGroupId
                    ? group.items
                    : []
                  ).map((item) => {
                    const isOpen = windows.some(
                      (w) => w.moduleId === item.module && !w.isMinimized
                    )
                    return (
                      <button
                        key={item.module}
                        onClick={() => handleOpenModule(item.module)}
                        className={`flex items-center gap-2.5 w-full px-2.5 py-[7px] rounded-md text-xs transition-colors ${
                          isOpen
                            ? 'bg-primary/10 text-primary font-medium'
                            : 'hover:bg-accent text-foreground'
                        }`}
                      >
                        <item.icon className="w-4 h-4 shrink-0" />
                        <span className="truncate">{t(item.labelKey)}</span>
                        {isOpen && (
                          <span className="ml-auto w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                        )}
                      </button>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Sidebar footer */}
          <div className="px-3 py-2 border-t border-border/40 text-[10px] text-muted-foreground flex items-center justify-between">
            <span>{allMenuItems.length} modula</span>
            <span>{windows.length} prozora</span>
          </div>
        </div>

        {/* ===== DESKTOP AREA ===== */}
        <div className="flex-1 relative overflow-hidden">
          {/* Desktop icons — top-left */}
          <div className="absolute top-4 left-4 flex flex-col flex-wrap gap-1 max-h-[calc(100vh-120px)] z-10">
            {allMenuItems.slice(0, 14).map((item) => {
              const isOpen = windows.some(
                (w) => w.moduleId === item.module && !w.isMinimized
              )
              return (
                <button
                  key={item.module}
                  onDoubleClick={() => handleOpenModule(item.module)}
                  onClick={() => handleOpenModule(item.module)}
                  className="flex flex-col items-center justify-center w-[72px] h-[72px] rounded-lg hover:bg-accent/50 transition-colors group active:scale-95"
                  title={t(item.labelKey)}
                >
                  <div
                    className={`flex items-center justify-center w-10 h-10 rounded-lg mb-1 transition-colors ${
                      isOpen
                        ? 'bg-primary/20 text-primary'
                        : 'bg-background/80 text-foreground/80 group-hover:bg-background shadow-sm'
                    }`}
                  >
                    <item.icon className="w-5 h-5" />
                  </div>
                  <span className="text-[9px] font-medium text-foreground/80 leading-tight text-center line-clamp-2 px-1">
                    {t(item.labelKey)}
                  </span>
                </button>
              )
            })}
          </div>

          {/* Windows */}
          {visibleWindows.map((win) => (
            <WindowFrame key={win.id} windowData={win} />
          ))}
        </div>
      </div>

      {/* ===== DOCK ===== */}
      <Dock />
    </div>
  )
}
