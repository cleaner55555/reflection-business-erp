'use client'

import { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import { AnimatePresence } from 'framer-motion'
import { useWindowManager, type DesktopShortcut, type WallpaperStyle, DOCK_HEIGHT, STATUS_BAR_HEIGHT } from '@/lib/windowManager'
import { useAppStore } from '@/lib/store'
import { useTranslation } from '@/lib/i18n'
import { useThemeStore } from '@/lib/theme'
import { menuGroups } from '@/lib/menuGroupsData'
import { WindowFrame } from './WindowFrame'
import { AppDrawer } from './AppDrawer'
import { DesktopSettingsPanel } from './DesktopSettingsPanel'
import { Dock } from './Dock'
import { GlobalSearch } from '@/components/modules/GlobalSearch'
import { ThemeToggle } from '@/components/theme-toggle'
import { UserMenu } from '@/components/modules/UserMenu'
import { CompanySwitcher } from '@/components/modules/CompanySwitcher'
import { NotificationBell } from '@/components/modules/NotificationBell'
import { MonitorOff, Trash2, Monitor, LayoutGrid, Grid3X3, Maximize2, ImageIcon, Eye, RefreshCw, Info } from 'lucide-react'
import { ALL_LANGUAGES } from '@/lib/i18n'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import type { ModuleType } from '@/lib/store'

const DEFAULT_ACTIVE_LANGS = ['sr', 'sr-latn', 'en']

function getWallpaperClass(style: WallpaperStyle): string {
  switch (style) {
    case 'gradient-blue': return 'bg-gradient-to-br from-blue-400/30 via-sky-100/40 to-cyan-50/30'
    case 'gradient-green': return 'bg-gradient-to-br from-emerald-400/25 via-green-100/35 to-teal-50/25'
    case 'gradient-purple': return 'bg-gradient-to-br from-violet-400/25 via-purple-100/35 to-fuchsia-50/25'
    case 'gradient-warm': return 'bg-gradient-to-br from-orange-300/25 via-amber-100/35 to-yellow-50/20'
    case 'solid-dark': return 'dark:bg-neutral-950 bg-neutral-50'
    case 'solid-light': return 'bg-neutral-50 dark:bg-neutral-900'
    case 'dots': return 'bg-slate-50 dark:bg-slate-950'
    case 'mesh': return 'bg-gradient-to-br from-slate-50 to-gray-100 dark:from-slate-900 dark:to-slate-800'
    default: return ''
  }
}

export function DesktopMode() {
  const {
    windows, openWindow, toggleDesktopMode, desktopShortcuts, removeShortcut, updateShortcutPosition,
    desktopSettings, setSettingsOpen,
  } = useWindowManager()
  const { t, locale, setLocale } = useTranslation()
  const allMenuItems = useMemo(() => menuGroups.flatMap((g) => g.items), [])
  const logo = useThemeStore((s) => s.logo)
  const companyName = useThemeStore((s) => s.companyName)

  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; module: ModuleType } | null>(null)
  const [desktopContextMenu, setDesktopContextMenu] = useState<{ x: number; y: number } | null>(null)
  const [activeLangs, setActiveLangs] = useState<string[]>(DEFAULT_ACTIVE_LANGS)
  const activeCompanyId = useAppStore((s) => s.activeCompanyId)

  useEffect(() => {
    if (!activeCompanyId) return
    fetch(`/api/settings?group=general&companyId=${activeCompanyId}`)
      .then((res) => (res.ok ? res.json() : []))
      .then((data: Array<{ key: string; value: string }>) => {
        const setting = data?.find((s) => s.key === 'active_languages')
        if (setting?.value) {
          try {
            const parsed = JSON.parse(setting.value)
            if (Array.isArray(parsed) && parsed.length > 0) setActiveLangs(parsed)
          } catch { /* */ }
        }
      }).catch(() => {})
  }, [activeCompanyId])

  const headerLanguages = ALL_LANGUAGES.filter((l) => activeLangs.includes(l.code))

  // Seed + notifications
  const [seeded, setSeeded] = useState(false)
  if (!seeded) { setSeeded(true); fetch('/api/seed', { method: 'POST' }).catch(() => {}) }

  const currentUser = useAppStore((s) => s.currentUser)
  useEffect(() => {
    if (!currentUser || !activeCompanyId) return
    const t1 = setTimeout(async () => { try { await fetch('/api/notifications/generate', { method: 'POST', headers: { 'x-company-id': activeCompanyId } }) } catch {} }, 2000)
    const t2 = setInterval(async () => { try { await fetch('/api/notifications/generate', { method: 'POST', headers: { 'x-company-id': activeCompanyId } }) } catch {} }, 60000)
    return () => { clearTimeout(t1); clearInterval(t2) }
  }, [currentUser, activeCompanyId])

  const handleOpenModule = useCallback((module: ModuleType) => {
    const item = allMenuItems.find((m) => m.module === module)
    openWindow(module, item ? t(item.labelKey) : String(module), module)
  }, [allMenuItems, t, openWindow])

  useEffect(() => {
    if (!contextMenu) return
    const handler = () => setContextMenu(null)
    window.addEventListener('click', handler)
    return () => window.removeEventListener('click', handler)
  }, [contextMenu])

  // Dismiss desktop context menu on click
  useEffect(() => {
    if (!desktopContextMenu) return
    const handler = () => setDesktopContextMenu(null)
    window.addEventListener('click', handler)
    return () => window.removeEventListener('click', handler)
  }, [desktopContextMenu])

  const visibleWindows = windows.filter((w) => !w.isMinimized)

  const wallpaperBg = getWallpaperClass(desktopSettings.wallpaper)
  const isDots = desktopSettings.wallpaper === 'dots'

  return (
    <div
      className={`fixed inset-0 flex flex-col overflow-hidden ${wallpaperBg}`}
      onContextMenu={(e) => {
        if ((e.target as HTMLElement).closest('[data-shortcut]')) return
        e.preventDefault()
        setContextMenu(null)
        setDesktopContextMenu({ x: e.clientX, y: e.clientY })
      }}
    >
      {/* Dots pattern overlay */}
      {isDots && (
        <div
          className="absolute inset-0 opacity-[0.03] pointer-events-none"
          style={{
            backgroundImage: 'radial-gradient(circle, currentColor 1px, transparent 1px)',
            backgroundSize: '24px 24px',
          }}
        />
      )}

      {/* ===== STATUS BAR — Samsung-style, very thin ===== */}
      <header
        className="flex shrink-0 items-center justify-between px-1 sm:px-3 z-[100010] border-b border-border/20 bg-background/50 backdrop-blur-md overflow-hidden"
        style={{ height: STATUS_BAR_HEIGHT }}
      >
        {/* Left — Logo + name */}
        <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
          {logo ? (
            <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded overflow-hidden">
              <img src={logo} alt="" className="h-4 w-4 object-contain" />
            </div>
          ) : (
            <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded bg-primary/80 text-primary-foreground">
              <LayoutGrid className="h-2.5 w-2.5" />
            </div>
          )}
          <span className="text-xs font-semibold text-foreground/80 truncate max-w-[140px]">
            {companyName || 'Reflection Business'}
          </span>
        </div>

        {/* Right — Controls (minimal) */}
        <div className="flex items-center gap-1 sm:gap-1.5">
          <div className="hidden sm:block">
            <CompanySwitcher />
          </div>
          <GlobalSearch />
          <NotificationBell />
          {headerLanguages.length > 1 ? (
            <Select value={locale} onValueChange={setLocale}>
              <SelectTrigger className="h-6 w-auto min-w-[28px] sm:min-w-[90px] text-xs border-0 bg-transparent">
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
            <button onClick={() => setLocale(headerLanguages[0]?.code || 'sr')} className="flex h-6 items-center gap-1 text-xs text-foreground/60 hover:text-foreground">
              <span>{headerLanguages[0]?.flag || '🌐'}</span>
            </button>
          )}
          <ThemeToggle />
          <button
            onClick={toggleDesktopMode}
            className="hidden sm:flex items-center justify-center h-6 w-6 rounded hover:bg-accent/50 transition-colors"
            title="Normalan režim"
          >
            <MonitorOff className="h-3 w-3 text-muted-foreground" />
          </button>
          <UserMenu />
        </div>
      </header>

      {/* ===== DESKTOP AREA ===== */}
      <div className="flex-1 relative overflow-hidden" style={{ paddingBottom: DOCK_HEIGHT }}>
        {/* Draggable shortcut icons */}
        {desktopShortcuts.map((shortcut) => (
          <DesktopIcon
            key={shortcut.module}
            shortcut={shortcut}
            allMenuItems={allMenuItems}
            windows={windows}
            onOpen={handleOpenModule}
            iconSize={desktopSettings.iconSize}
            showLabel={desktopSettings.showDesktopLabels}
            snapToGrid={desktopSettings.snapToGrid}
            gridSize={desktopSettings.gridSize}
            onContextMenu={(e, mod) => {
              e.preventDefault(); e.stopPropagation()
              setContextMenu({ x: e.clientX, y: e.clientY, module: mod })
            }}
          />
        ))}

        {/* Empty desktop hint */}
        {desktopShortcuts.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="text-center text-muted-foreground/30">
              <Grid3X3 className="w-12 h-12 mx-auto mb-2" />
              <p className="text-sm">Kliknite na dugme ispod za module</p>
              <p className="text-xs">ili desni klik za opcije</p>
            </div>
          </div>
        )}

        {/* Windows */}
        <AnimatePresence>
          {visibleWindows.map((win) => (
            <WindowFrame key={win.id} windowData={win} />
          ))}
        </AnimatePresence>

        {/* Shortcut context menu */}
        {contextMenu && (
          <div
            className="fixed bg-background/90 backdrop-blur-xl border border-border/40 rounded-xl shadow-2xl py-1.5 z-[100050] min-w-[180px] animate-in fade-in zoom-in-95 duration-100"
            style={{ left: contextMenu.x, top: contextMenu.y }}
          >
            <button
              onClick={() => { removeShortcut(contextMenu.module); setContextMenu(null) }}
              className="flex items-center gap-2.5 w-full px-3 py-2 text-xs text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Obriši prečicu</span>
            </button>
          </div>
        )}

        {/* Desktop context menu (empty space right-click) */}
        {desktopContextMenu && (
          <div
            className="fixed bg-background/90 backdrop-blur-xl border border-border/40 rounded-xl shadow-2xl py-1.5 z-[100050] min-w-[200px] animate-in fade-in zoom-in-95 duration-100"
            style={{ left: desktopContextMenu.x, top: desktopContextMenu.y }}
          >
            <button
              onClick={() => { setSettingsOpen(true); setDesktopContextMenu(null) }}
              className="flex items-center gap-2.5 w-full px-3 py-2 text-xs text-foreground hover:bg-accent/50 rounded-lg transition-colors"
            >
              <ImageIcon className="w-3.5 h-3.5 text-muted-foreground" />
              <span>Promeni pozadinu</span>
            </button>
            <button
              onClick={() => { setSettingsOpen(true); setDesktopContextMenu(null) }}
              className="flex items-center gap-2.5 w-full px-3 py-2 text-xs text-foreground hover:bg-accent/50 rounded-lg transition-colors"
            >
              <Eye className="w-3.5 h-3.5 text-muted-foreground" />
              <span>Prikaz</span>
            </button>
            <div className="h-px bg-border/30 mx-2 my-1" />
            <button
              onClick={() => { setDesktopContextMenu(null) }}
              className="flex items-center gap-2.5 w-full px-3 py-2 text-xs text-foreground hover:bg-accent/50 rounded-lg transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5 text-muted-foreground" />
              <span>Osveži</span>
            </button>
            <button
              onClick={() => { setDesktopContextMenu(null) }}
              className="flex items-center gap-2.5 w-full px-3 py-2 text-xs text-foreground hover:bg-accent/50 rounded-lg transition-colors"
            >
              <Info className="w-3.5 h-3.5 text-muted-foreground" />
              <span>O desktop režimu</span>
            </button>
          </div>
        )}
      </div>

      {/* ===== OVERLAYS ===== */}
      <AppDrawer />
      <DesktopSettingsPanel />

      {/* ===== DOCK ===== */}
      <Dock />
    </div>
  )
}

// ===== Draggable Desktop Icon — uses native window events for reliable drag =====
function DesktopIcon({
  shortcut, allMenuItems, windows, onOpen,
  iconSize, showLabel, snapToGrid, gridSize, onContextMenu,
}: {
  shortcut: DesktopShortcut
  allMenuItems: { module: ModuleType; icon: React.ElementType; labelKey: string }[]
  windows: { moduleId: ModuleType; isMinimized: boolean }[]
  onOpen: (mod: ModuleType) => void
  iconSize: 'small' | 'medium' | 'large'
  showLabel: boolean
  snapToGrid: boolean
  gridSize: number
  onContextMenu: (e: React.MouseEvent, mod: ModuleType) => void
}) {
  const updateShortcutPosition = useWindowManager((s) => s.updateShortcutPosition)
  const [isDragging, setIsDragging] = useState(false)
  const [pos, setPos] = useState({ x: shortcut.x, y: shortcut.y })
  const iconRef = useRef<HTMLDivElement>(null)

  // All drag state in refs — never stale
  const didDrag = useRef(false)
  const startX = useRef(0)
  const startY = useRef(0)
  const originX = useRef(0)
  const originY = useRef(0)

  // Keep ref in sync with rendered pos
  const posRef = useRef(pos)
  useEffect(() => { posRef.current = pos }, [pos])

  const item = allMenuItems.find((m) => m.module === shortcut.module)
  const Icon = item?.icon || Monitor
  const isOpen = windows.some((w) => w.moduleId === shortcut.module && !w.isMinimized)

  // Sync from shortcut props
  useEffect(() => {
    const p = { x: shortcut.x, y: shortcut.y }
    setPos(p)
  }, [shortcut.x, shortcut.y])

  useEffect(() => {
    const el = iconRef.current
    if (!el) return

    const snap = (x: number, y: number) => {
      if (!snapToGrid) return { x, y }
      return {
        x: Math.round(x / gridSize) * gridSize,
        y: Math.round(y / gridSize) * gridSize,
      }
    }

    const onDown = (e: PointerEvent) => {
      // Only left button
      if (e.button !== 0) return
      e.preventDefault()
      e.stopPropagation()

      didDrag.current = false
      startX.current = e.clientX
      startY.current = e.clientY
      originX.current = posRef.current.x
      originY.current = posRef.current.y

      // Move the icon to the very front
      el.style.zIndex = '50'
      setIsDragging(true)

      window.addEventListener('pointermove', onMove)
      window.addEventListener('pointerup', onUp)
    }

    const onMove = (e: PointerEvent) => {
      const dx = e.clientX - startX.current
      const dy = e.clientY - startY.current

      if (!didDrag.current) {
        if (Math.abs(dx) < 4 && Math.abs(dy) < 4) return
        didDrag.current = true
      }

      const maxX = window.innerWidth - gridSize
      const maxY = window.innerHeight - STATUS_BAR_HEIGHT - DOCK_HEIGHT - gridSize
      const rawX = originX.current + dx
      const rawY = originY.current + dy
      const clampedX = Math.max(0, Math.min(rawX, maxX))
      const clampedY = Math.max(0, Math.min(rawY, maxY))
      const snapped = snap(clampedX, clampedY)

      setPos(snapped)
    }

    const onUp = () => {
      el.style.zIndex = ''
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', onUp)

      // Small delay to avoid click firing right after drag
      if (didDrag.current) {
        updateShortcutPosition(shortcut.module, posRef.current.x, posRef.current.y)
        // Keep isDragging true briefly to swallow the click
        setTimeout(() => setIsDragging(false), 50)
      } else {
        setIsDragging(false)
      }
    }

    el.addEventListener('pointerdown', onDown)

    return () => {
      el.removeEventListener('pointerdown', onDown)
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', onUp)
    }
  }, [shortcut.module, snapToGrid, gridSize, updateShortcutPosition])

  const { t } = useTranslation()
  const displayLabel = item ? t(item.labelKey) : String(shortcut.module)

  const sizeMap = { small: 'w-14 h-14', medium: 'w-[72px] h-[72px]', large: 'w-20 h-20' }
  const iconBoxMap = { small: 'w-8 h-8', medium: 'w-10 h-10', large: 'w-12 h-12' }
  const iconWMap = { small: 'w-4 h-4', medium: 'w-5 h-5', large: 'w-6 h-6' }
  const labelSizeMap = { small: 'text-xs', medium: 'text-xs', large: 'text-xs' }

  return (
    <div
      ref={iconRef}
      data-shortcut={shortcut.module}
      className={`absolute z-10 select-none cursor-grab active:cursor-grabbing touch-none ${isDragging ? 'opacity-70 scale-105' : 'opacity-100 hover:opacity-100'}`}
      style={{ left: pos.x, top: pos.y, transition: isDragging ? 'none' : 'opacity 150ms ease' }}
      onContextMenu={(e) => onContextMenu(e, shortcut.module)}
      onClick={() => { if (!didDrag.current && !isDragging) onOpen(shortcut.module) }}
    >
      <div
        className={`flex flex-col items-center justify-center ${sizeMap[iconSize]} rounded-2xl hover:bg-accent/40 transition-colors duration-150`}
        title={displayLabel}
      >
        <div
          className={`flex items-center justify-center ${iconBoxMap[iconSize]} rounded-xl mb-0.5 shadow-sm transition-shadow duration-150 ${
            isOpen
              ? 'bg-primary/15 text-primary ring-1 ring-primary/20'
              : 'bg-background/70 text-foreground/70 hover:bg-background/90 backdrop-blur-sm'
          } ${isDragging ? 'shadow-lg scale-110' : ''}`}
        >
          <Icon className={iconWMap[iconSize]} />
        </div>
        {showLabel && (
          <span className={`${labelSizeMap[iconSize]} font-medium text-foreground/70 leading-tight text-center line-clamp-2 px-1 drop-shadow-sm`}>
            {displayLabel}
          </span>
        )}
      </div>
    </div>
  )
}
