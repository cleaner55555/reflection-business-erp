'use client'

import { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import { useWindowManager, type DesktopShortcut } from '@/lib/windowManager'
import { useAppStore } from '@/lib/store'
import { useTranslation } from '@/lib/i18n'
import { useThemeStore } from '@/lib/theme'
import { menuGroups } from '@/components/modules/AppSidebar'
import { WindowFrame } from './WindowFrame'
import { StartMenu } from './StartMenu'
import { GlobalSearch } from '@/components/modules/GlobalSearch'
import { ThemeToggle } from '@/components/theme-toggle'
import { UserMenu } from '@/components/modules/UserMenu'
import { CompanySwitcher } from '@/components/modules/CompanySwitcher'
import {
  MonitorOff,
  LayoutGrid,
  Trash2,
  Monitor,
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
  const { windows, openWindow, toggleDesktopMode, desktopShortcuts, removeShortcut, updateShortcutPosition, setStartMenuOpen } = useWindowManager()
  const { t, locale, setLocale } = useTranslation()
  const allMenuItems = useMemo(() => menuGroups.flatMap((g) => g.items), [])
  const logo = useThemeStore((s) => s.logo)
  const companyName = useThemeStore((s) => s.companyName)

  // Context menu
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; module: ModuleType } | null>(null)

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

  // Seed database
  const [seeded, setSeeded] = useState(false)
  if (!seeded) {
    setSeeded(true)
    fetch('/api/seed', { method: 'POST' }).catch(() => {})
  }

  // Notifications
  const currentUser = useAppStore((s) => s.currentUser)
  useEffect(() => {
    if (!currentUser || !activeCompanyId) return
    const timer = setTimeout(async () => {
      try {
        await fetch('/api/notifications/generate', {
          method: 'POST',
          headers: { 'x-company-id': activeCompanyId },
        })
      } catch { /* silent */ }
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
      } catch { /* silent */ }
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

  // Close context menu on click outside
  useEffect(() => {
    if (!contextMenu) return
    const handler = () => setContextMenu(null)
    window.addEventListener('click', handler)
    return () => window.removeEventListener('click', handler)
  }, [contextMenu])

  const visibleWindows = windows.filter((w) => !w.isMinimized)

  return (
    <div
      className="fixed inset-0 flex flex-col overflow-hidden bg-gradient-to-br from-muted/60 via-background to-muted/40"
      onContextMenu={(e) => {
        // Allow right-click on desktop to close context menu
        if ((e.target as HTMLElement).closest('[data-shortcut]')) return
        setContextMenu(null)
      }}
    >
      {/* ===== TOP BAR — compact, controls on right ===== */}
      <header className="flex h-12 shrink-0 items-center justify-end gap-2 border-b bg-background/80 backdrop-blur-md px-3 z-[100010]">
        {/* Left — Logo (minimal) */}
        <div className="flex items-center gap-2 mr-auto">
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
            <span className="text-[10px] text-muted-foreground leading-tight hidden sm:block">
              {allMenuItems.length} modula · {windows.length} prozora
            </span>
          </div>
        </div>

        {/* Right — All controls */}
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
        {/* Exit desktop mode — top right */}
        <button
          onClick={toggleDesktopMode}
          className="flex items-center justify-center h-7 w-7 rounded-md border border-input bg-background hover:bg-accent transition-colors"
          title="Normalan režim"
        >
          <MonitorOff className="h-3.5 w-3.5 text-muted-foreground" />
        </button>
        <UserMenu />
      </header>

      {/* ===== DESKTOP AREA ===== */}
      <div className="flex-1 relative overflow-hidden">
        {/* Draggable shortcut icons */}
        {desktopShortcuts.map((shortcut) => (
          <DesktopIcon
            key={shortcut.module}
            shortcut={shortcut}
            allMenuItems={allMenuItems}
            windows={windows}
            onOpen={handleOpenModule}
            onContextMenu={(e, mod) => {
              e.preventDefault()
              e.stopPropagation()
              setContextMenu({ x: e.clientX, y: e.clientY, module: mod })
            }}
          />
        ))}

        {/* Windows */}
        {visibleWindows.map((win) => (
          <WindowFrame key={win.id} windowData={win} />
        ))}

        {/* Context menu */}
        {contextMenu && (
          <div
            className="fixed bg-background/90 backdrop-blur-md border border-border/60 rounded-lg shadow-xl py-1 z-[100050] min-w-[160px]"
            style={{ left: contextMenu.x, top: contextMenu.y }}
          >
            <button
              onClick={() => {
                removeShortcut(contextMenu.module)
                setContextMenu(null)
              }}
              className="flex items-center gap-2 w-full px-3 py-2 text-xs text-destructive hover:bg-destructive/10 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Obriši prečicu</span>
            </button>
          </div>
        )}
      </div>

      {/* ===== DOCK (with start menu) ===== */}
      <Dock />
    </div>
  )
}

// ===== Draggable Desktop Icon =====
function DesktopIcon({
  shortcut,
  allMenuItems,
  windows,
  onOpen,
  onContextMenu,
}: {
  shortcut: DesktopShortcut
  allMenuItems: { module: ModuleType; icon: React.ElementType; labelKey: string }[]
  windows: { moduleId: ModuleType; isMinimized: boolean }[]
  onOpen: (mod: ModuleType) => void
  onContextMenu: (e: React.MouseEvent, mod: ModuleType) => void
}) {
  const updateShortcutPosition = useWindowManager((s) => s.updateShortcutPosition)
  const [isDragging, setIsDragging] = useState(false)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const [pos, setPos] = useState({ x: shortcut.x, y: shortcut.y })
  const iconRef = useRef<HTMLDivElement>(null)

  const item = allMenuItems.find((m) => m.module === shortcut.module)
  const Icon = item?.icon || Monitor
  const label = item ? '' : String(shortcut.module)
  const isOpen = windows.some(
    (w) => w.moduleId === shortcut.module && !w.isMinimized
  )

  // Sync position from store (external update)
  useEffect(() => {
    setPos({ x: shortcut.x, y: shortcut.y })
  }, [shortcut.x, shortcut.y])

  const handlePointerDown = (e: React.PointerEvent) => {
    if (e.button === 2) return // right-click = context menu
    e.preventDefault()
    setIsDragging(false)
    const rect = iconRef.current?.getBoundingClientRect()
    if (rect) {
      setDragOffset({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      })
    }
    ;(e.target as HTMLElement).setPointerCapture(e.pointerId)
  }

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!dragOffset.x && !dragOffset.y) return
    setIsDragging(true)
    const dockH = 56
    const topH = 48
    const newX = Math.max(0, Math.min(e.clientX - dragOffset.x, window.innerWidth - 80))
    const newY = Math.max(0, Math.min(e.clientY - dragOffset.y, window.innerHeight - topH - dockH - 80))
    setPos({ x: newX, y: newY })
  }

  const handlePointerUp = (e: React.PointerEvent) => {
    if (isDragging) {
      // Save final position
      updateShortcutPosition(shortcut.module, pos.x, pos.y)
    }
    setDragOffset({ x: 0, y: 0 })
    setIsDragging(false)
  }

  const handleClick = () => {
    if (!isDragging) {
      onOpen(shortcut.module)
    }
  }

  // Get translated label
  const { t } = useTranslation()
  const displayLabel = item ? t(item.labelKey) : label

  return (
    <div
      ref={iconRef}
      data-shortcut={shortcut.module}
      className={`absolute z-10 select-none ${isDragging ? 'opacity-70' : 'opacity-100'}`}
      style={{ left: pos.x, top: pos.y }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onContextMenu={(e) => onContextMenu(e, shortcut.module)}
    >
      <button
        onClick={handleClick}
        className="flex flex-col items-center justify-center w-[72px] h-[72px] rounded-lg hover:bg-accent/50 transition-colors group active:scale-95 cursor-pointer"
        title={displayLabel}
      >
        <div
          className={`flex items-center justify-center w-10 h-10 rounded-lg mb-1 transition-colors ${
            isOpen
              ? 'bg-primary/20 text-primary'
              : 'bg-background/80 text-foreground/80 group-hover:bg-background shadow-sm'
          }`}
        >
          <Icon className="w-5 h-5" />
        </div>
        <span className="text-[9px] font-medium text-foreground/80 leading-tight text-center line-clamp-2 px-1">
          {displayLabel}
        </span>
      </button>
    </div>
  )
}
