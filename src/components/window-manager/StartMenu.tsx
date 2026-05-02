'use client'

import { useState, useMemo, useEffect, useRef } from 'react'
import { useWindowManager } from '@/lib/windowManager'
import { useTranslation } from '@/lib/i18n'
import { menuGroups } from '@/components/modules/AppSidebar'
import {
  Search,
  X,
  Plus,
  Monitor,
} from 'lucide-react'
import type { ModuleType } from '@/lib/store'

export function StartMenu() {
  const { startMenuOpen, setStartMenuOpen, openWindow, addShortcut, desktopShortcuts } =
    useWindowManager()
  const { t } = useTranslation()
  const allMenuItems = useMemo(() => menuGroups.flatMap((g) => g.items), [])
  const [search, setSearch] = useState('')
  const [activeGroupId, setActiveGroupId] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Reset search when menu opens
  useEffect(() => {
    if (startMenuOpen) {
      setSearch('')
      setActiveGroupId(null)
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [startMenuOpen])

  // Close on Escape
  useEffect(() => {
    if (!startMenuOpen) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        setStartMenuOpen(false)
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [startMenuOpen, setStartMenuOpen])

  const filteredGroups = useMemo(() => {
    if (!search) return menuGroups
    return menuGroups
      .map((g) => ({
        ...g,
        items: g.items.filter((item) => {
          const label = t(item.labelKey).toLowerCase()
          return label.includes(search.toLowerCase())
        }),
      }))
      .filter((g) => g.items.length > 0)
  }, [search, t])

  const handleOpenModule = (module: ModuleType) => {
    const item = allMenuItems.find((m) => m.module === module)
    const label = item ? t(item.labelKey) : String(module)
    openWindow(module, label, module)
    setStartMenuOpen(false)
  }

  const handleSendToDesktop = (module: ModuleType) => {
    addShortcut(module)
  }

  const isOnDesktop = (module: ModuleType) => {
    return desktopShortcuts.some((s) => s.module === module)
  }

  if (!startMenuOpen) return null

  return (
    <>
      {/* Backdrop — click to close */}
      <div
        className="fixed inset-0 z-[100020]"
        onClick={() => setStartMenuOpen(false)}
      />

      {/* Menu panel — bottom-left, semi-transparent */}
      <div
        className="fixed bottom-14 left-2 z-[100025] w-[420px] max-h-[calc(100vh-100px)] bg-background/85 backdrop-blur-xl border border-border/50 rounded-xl shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-2 fade-in duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border/30">
          <h2 className="text-sm font-bold text-foreground">Reflection Business</h2>
          <button
            onClick={() => setStartMenuOpen(false)}
            className="flex items-center justify-center w-6 h-6 rounded-md hover:bg-accent transition-colors"
          >
            <X className="w-3.5 h-3.5 text-muted-foreground" />
          </button>
        </div>

        {/* Search */}
        <div className="px-3 py-2 border-b border-border/30">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
            <input
              ref={inputRef}
              type="text"
              placeholder="Pretraži module..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full h-8 pl-8 pr-8 text-xs rounded-md border border-input/50 bg-background/60 focus:outline-none focus:ring-1 focus:ring-primary"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
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
            <div key={group.labelKey} className="mb-0.5">
              {/* Group header — click to collapse/expand */}
              <button
                onClick={() =>
                  setActiveGroupId(activeGroupId === group.labelKey ? null : group.labelKey)
                }
                className="flex items-center justify-between w-full px-3 py-1 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider hover:bg-accent/30 transition-colors"
              >
                <span>{t(group.labelKey)}</span>
                <span className="text-[9px] text-muted-foreground/50">{group.items.length}</span>
              </button>

              {/* Group items */}
              <div className="space-y-px px-1">
                {(activeGroupId === group.labelKey || !activeGroupId
                  ? group.items
                  : []
                ).map((item) => {
                  const onDesktop = isOnDesktop(item.module)
                  return (
                    <div key={item.module} className="group/item relative">
                      <button
                        onClick={() => handleOpenModule(item.module)}
                        className="flex items-center gap-2.5 w-full px-2.5 py-[6px] rounded-md text-xs transition-colors hover:bg-accent/60 text-foreground"
                      >
                        <item.icon className="w-4 h-4 shrink-0 text-muted-foreground" />
                        <span className="truncate flex-1 text-left">{t(item.labelKey)}</span>
                        {onDesktop && (
                          <Monitor className="w-3 h-3 text-primary/50 shrink-0" title="Na desktopu" />
                        )}
                      </button>
                      {/* Send to Desktop button — hover reveal */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleSendToDesktop(item.module)
                        }}
                        className={`absolute right-1.5 top-1/2 -translate-y-1/2 flex items-center justify-center w-6 h-6 rounded-md bg-primary/80 hover:bg-primary text-primary-foreground transition-all opacity-0 group-hover/item:opacity-100 ${
                          onDesktop ? 'opacity-0' : ''
                        }`}
                        title="Pošalji na desktop"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="px-4 py-2 border-t border-border/30 text-[10px] text-muted-foreground/70 flex items-center justify-between">
          <span>{allMenuItems.length} modula</span>
          <span>± za dodavanje na desktop</span>
        </div>
      </div>
    </>
  )
}
