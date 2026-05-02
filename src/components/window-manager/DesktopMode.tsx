'use client'

import { useState, useEffect, useCallback } from 'react'
import { useWindowManager } from '@/lib/windowManager'
import { useAppStore } from '@/lib/store'
import { useTranslation } from '@/lib/i18n'
import { menuGroups } from '@/components/modules/AppSidebar'
import { WindowFrame } from './WindowFrame'
import { Dock } from './Dock'
import {
  Wallet,
  FileText,
  Warehouse,
  Users,
  BarChart3,
  Settings,
  LayoutGrid,
  Search,
  X,
  ChevronRight,
  Pin,
} from 'lucide-react'
import type { ModuleType } from '@/lib/store'

const QUICK_SHORTCUTS: ModuleType[] = [
  'dashboard',
  'finansije',
  'fakture',
  'magacin',
  'crm',
  'izvestaji',
  'podesavanja',
]

const shortcutIcons: Record<string, React.ElementType> = {
  dashboard: LayoutGrid,
  finansije: Wallet,
  fakture: FileText,
  magacin: Warehouse,
  crm: Users,
  izvestaji: BarChart3,
  podesavanja: Settings,
}

export function DesktopMode() {
  const { windows, openWindow } = useWindowManager()
  const { t } = useTranslation()
  const allMenuItems = menuGroups.flatMap((g) => g.items)

  // Start menu state
  const [startOpen, setStartOpen] = useState(false)
  const [startSearch, setStartSearch] = useState('')
  const [pinnedOpen, setPinnedOpen] = useState(false)

  const handleOpenModule = useCallback((module: ModuleType) => {
    const item = allMenuItems.find((m) => m.module === module)
    const label = item ? t(item.labelKey) : String(module)
    openWindow(module, label, module)
    setStartOpen(false)
    setPinnedOpen(false)
  }, [allMenuItems, t, openWindow])

  const handleDesktopClick = useCallback((module: ModuleType) => {
    handleOpenModule(module)
  }, [handleOpenModule])

  // Close start menu on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setStartOpen(false)
        setPinnedOpen(false)
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  // Filter groups by search
  const filteredGroups = startSearch
    ? menuGroups
        .map((g) => ({
          ...g,
          items: g.items.filter((item) => {
            const label = t(item.labelKey).toLowerCase()
            return label.includes(startSearch.toLowerCase())
          }),
        }))
        .filter((g) => g.items.length > 0)
    : menuGroups

  const visibleWindows = windows.filter((w) => !w.isMinimized)

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-muted/60 via-background to-muted/40 overflow-hidden">
      {/* Desktop icons grid */}
      <div className="absolute top-4 left-4 flex flex-col flex-wrap gap-1 max-h-[calc(100vh-80px)] z-10">
        {QUICK_SHORTCUTS.map((mod) => {
          const Icon = shortcutIcons[mod] || LayoutGrid
          const item = allMenuItems.find((m) => m.module === mod)
          const label = item ? t(item.labelKey) : String(mod)
          const isOpen = windows.some((w) => w.moduleId === mod && !w.isMinimized)

          return (
            <button
              key={mod}
              onClick={() => handleDesktopClick(mod)}
              className="flex flex-col items-center justify-center w-20 h-20 rounded-lg hover:bg-accent/50 transition-colors group active:scale-95"
              title={label}
            >
              <div
                className={`flex items-center justify-center w-11 h-11 rounded-lg mb-1 transition-colors ${
                  isOpen
                    ? 'bg-primary/20 text-primary'
                    : 'bg-background/80 text-foreground/80 group-hover:bg-background shadow-sm'
                }`}
              >
                <Icon className="w-6 h-6" />
              </div>
              <span className="text-[10px] font-medium text-foreground/80 leading-tight text-center line-clamp-2 px-1">
                {label}
              </span>
            </button>
          )
        })}
      </div>

      {/* Windows */}
      {visibleWindows.map((win) => (
        <WindowFrame key={win.id} windowData={win} />
      ))}

      {/* Left sidebar toggle — always visible */}
      <button
        onClick={() => setStartOpen(!startOpen)}
        className="absolute top-1/2 left-0 -translate-y-1/2 z-[100001] flex items-center justify-center w-8 h-24 bg-background/90 backdrop-blur-sm border border-border/60 rounded-r-lg shadow-md hover:bg-accent transition-colors"
        title="Meni modula"
      >
        <ChevronRight className={`w-4 h-4 text-muted-foreground transition-transform ${startOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Start Menu / Module Browser — slide in from left */}
      {startOpen && (
        <div className="absolute top-0 left-0 bottom-14 w-80 z-[100002] bg-background/98 backdrop-blur-md border-r border-border/60 flex flex-col shadow-2xl">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-border/40">
            <h2 className="text-sm font-bold text-foreground">Reflection Business</h2>
            <button
              onClick={() => setStartOpen(false)}
              className="flex items-center justify-center w-7 h-7 rounded-md hover:bg-accent transition-colors"
            >
              <X className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>

          {/* Search */}
          <div className="px-3 py-2 border-b border-border/40">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Pretraži module..."
                value={startSearch}
                onChange={(e) => setStartSearch(e.target.value)}
                className="w-full h-8 pl-8 pr-3 text-xs rounded-md border border-input bg-background focus:outline-none focus:ring-1 focus:ring-primary"
                autoFocus
              />
            </div>
          </div>

          {/* Module groups */}
          <div className="flex-1 overflow-y-auto px-2 py-2">
            {filteredGroups.map((group) => (
              <div key={group.labelKey} className="mb-3">
                <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider px-2 mb-1">
                  {t(group.labelKey)}
                </p>
                <div className="space-y-0.5">
                  {group.items.map((item) => {
                    const isOpen = windows.some(
                      (w) => w.moduleId === item.module && !w.isMinimized
                    )
                    return (
                      <button
                        key={item.module}
                        onClick={() => handleOpenModule(item.module)}
                        className={`flex items-center gap-2.5 w-full px-2.5 py-2 rounded-md text-xs transition-colors ${
                          isOpen
                            ? 'bg-primary/10 text-primary'
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

          {/* Footer — window count */}
          <div className="px-4 py-2 border-t border-border/40 text-[10px] text-muted-foreground">
            {windows.length} otvorenih prozora · {allMenuItems.length} modula
          </div>
        </div>
      )}

      {/* Dock at bottom */}
      <Dock />
    </div>
  )
}
