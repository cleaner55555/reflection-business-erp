'use client'

import { useState, useMemo, useEffect, useRef } from 'react'
import { useWindowManager } from '@/lib/windowManager'
import { useTranslation } from '@/lib/i18n'
import { menuGroups } from '@/components/modules/AppSidebar'
import { Search, X, Plus, Settings, Monitor } from 'lucide-react'
import type { ModuleType } from '@/lib/store'

export function AppDrawer() {
  const { drawerOpen, setDrawerOpen, openWindow, addShortcut, desktopShortcuts, toggleSettings } =
    useWindowManager()
  const { t } = useTranslation()
  const allMenuItems = useMemo(() => menuGroups.flatMap((g) => g.items), [])
  const [search, setSearch] = useState('')
  const [activeTab, setActiveTab] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (drawerOpen) {
      setSearch('')
      setActiveTab(null)
      setTimeout(() => inputRef.current?.focus(), 150)
    }
  }, [drawerOpen])

  useEffect(() => {
    if (!drawerOpen) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { e.preventDefault(); setDrawerOpen(false) }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [drawerOpen, setDrawerOpen])

  const filteredGroups = useMemo(() => {
    if (!search) return menuGroups
    return menuGroups
      .map((g) => ({
        ...g,
        items: g.items.filter((item) =>
          t(item.labelKey).toLowerCase().includes(search.toLowerCase())
        ),
      }))
      .filter((g) => g.items.length > 0)
  }, [search, t])

  const allFiltered = useMemo(() => filteredGroups.flatMap((g) => g.items), [filteredGroups])

  const handleOpen = (module: ModuleType) => {
    const item = allMenuItems.find((m) => m.module === module)
    openWindow(module, item ? t(item.labelKey) : String(module), module)
    setDrawerOpen(false)
  }

  const isOnDesktop = (module: ModuleType) => desktopShortcuts.some((s) => s.module === module)

  if (!drawerOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-[100020] bg-black/30 backdrop-blur-sm"
        onClick={() => setDrawerOpen(false)}
      />

      {/* Drawer panel — slides up from bottom, Samsung DeX style */}
      <div
        className="fixed bottom-14 left-3 right-3 z-[100025] max-h-[65vh] bg-background/90 backdrop-blur-2xl border border-border/40 rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-4 fade-in duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Handle bar */}
        <div className="flex justify-center pt-2 pb-1">
          <div className="w-10 h-1 rounded-full bg-foreground/15" />
        </div>

        {/* Search */}
        <div className="px-4 pb-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              ref={inputRef}
              type="text"
              placeholder="Pretraži module..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full h-9 pl-9 pr-9 text-sm rounded-xl border-0 bg-foreground/5 focus:outline-none focus:ring-2 focus:ring-primary/30 placeholder:text-muted-foreground/50"
            />
            {search && (
              <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2">
                <X className="w-4 h-4 text-muted-foreground" />
              </button>
            )}
          </div>
        </div>

        {/* Group tabs */}
        {!search && (
          <div className="flex gap-1 px-4 pb-2 overflow-x-auto scrollbar-none">
            <button
              onClick={() => setActiveTab(null)}
              className={`shrink-0 px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                !activeTab ? 'bg-primary text-primary-foreground' : 'bg-foreground/5 text-foreground/70 hover:bg-foreground/10'
              }`}
            >
              Svi
            </button>
            {menuGroups.map((g) => (
              <button
                key={g.labelKey}
                onClick={() => setActiveTab(activeTab === g.labelKey ? null : g.labelKey)}
                className={`shrink-0 px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                  activeTab === g.labelKey ? 'bg-primary text-primary-foreground' : 'bg-foreground/5 text-foreground/70 hover:bg-foreground/10'
                }`}
              >
                {t(g.labelKey)}
              </button>
            ))}
          </div>
        )}

        {/* Module grid — Samsung-style icons */}
        <div className="flex-1 overflow-y-auto px-3 pb-3">
          <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8 gap-1">
            {(search ? allFiltered : (activeTab ? filteredGroups.find(g => g.labelKey === activeTab)?.items || [] : allFiltered)).map((item) => (
              <button
                key={item.module}
                onClick={() => handleOpen(item.module)}
                className="group relative flex flex-col items-center gap-1 py-3 rounded-xl hover:bg-foreground/5 transition-colors"
              >
                <div className="flex items-center justify-center w-11 h-11 rounded-2xl bg-foreground/5 group-hover:bg-foreground/10 transition-colors">
                  <item.icon className="w-5 h-5 text-foreground/70" />
                </div>
                <span className="text-xs font-medium text-foreground/70 leading-tight text-center line-clamp-2 px-1">
                  {t(item.labelKey)}
                </span>
                {/* Desktop indicator */}
                {isOnDesktop(item.module) && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-primary/50" />
                )}
                {/* Add to desktop */}
                {!isOnDesktop(item.module) && (
                  <span
                    onClick={(e) => { e.stopPropagation(); addShortcut(item.module) }}
                    className="absolute top-0.5 right-0.5 w-5 h-5 rounded-full bg-primary text-primary-foreground flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-md"
                  >
                    <Plus className="w-3 h-3" />
                  </span>
                )}
              </button>
            ))}
          </div>

          {allFiltered.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <Search className="w-8 h-8 mb-2 opacity-30" />
              <p className="text-sm">Nema rezultata</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-4 py-2 border-t border-border/20">
          <span className="text-xs text-muted-foreground/60">
            {allFiltered.length} modula
          </span>
          <button
            onClick={() => { setDrawerOpen(false); toggleSettings() }}
            className="flex items-center gap-1.5 text-xs text-muted-foreground/60 hover:text-foreground transition-colors"
          >
            <Settings className="w-3 h-3" />
            Podešavanja desktopa
          </button>
        </div>
      </div>
    </>
  )
}
