import { create } from 'zustand'
import type { ModuleType } from './store'

export interface WindowState {
  id: string
  moduleId: ModuleType
  title: string
  icon: string
  x: number
  y: number
  width: number
  height: number
  minWidth: number
  minHeight: number
  isMinimized: boolean
  isMaximized: boolean
  zIndex: number
  snapZone: SnapZone
}

export type SnapZone =
  | null
  | 'left'
  | 'right'
  | 'top-left'
  | 'top-right'
  | 'bottom-left'
  | 'bottom-right'

export interface VirtualDesktop {
  id: string
  name: string
}

export interface DesktopShortcut {
  module: ModuleType
  x: number
  y: number
}

export type WallpaperStyle = 'gradient-blue' | 'gradient-green' | 'gradient-purple' | 'gradient-warm' | 'solid-dark' | 'solid-light' | 'dots' | 'mesh'
export type IconSize = 'small' | 'medium' | 'large'
export type DockStyle = 'compact' | 'expanded'

export interface DesktopSettings {
  wallpaper: WallpaperStyle
  iconSize: IconSize
  dockStyle: DockStyle
  showDesktopLabels: boolean
  snapToGrid: boolean
  gridSize: number
}

export const DEFAULT_SETTINGS: DesktopSettings = {
  wallpaper: 'gradient-blue',
  iconSize: 'medium',
  dockStyle: 'compact',
  showDesktopLabels: true,
  snapToGrid: true,
  gridSize: 88,
}

interface WindowManagerState {
  isDesktopMode: boolean
  setDesktopMode: (on: boolean) => void
  toggleDesktopMode: () => void

  windows: WindowState[]
  topZIndex: number

  desktops: VirtualDesktop[]
  activeDesktopId: string

  openWindow: (moduleId: ModuleType, title: string, icon: string) => string
  closeWindow: (id: string) => void
  minimizeWindow: (id: string) => void
  maximizeWindow: (id: string) => void
  restoreWindow: (id: string) => void
  focusWindow: (id: string) => void

  updateWindowPosition: (id: string, x: number, y: number) => void
  updateWindowSize: (id: string, width: number, height: number) => void

  snapWindow: (id: string, zone: SnapZone, containerWidth: number, containerHeight: number) => void
  clearSnap: (id: string) => void

  addDesktop: (name: string) => void
  removeDesktop: (id: string) => void
  setActiveDesktop: (id: string) => void
  moveWindowToDesktop: (windowId: string, desktopId: string) => void

  cascadeWindows: () => void
  tileWindows: () => void

  desktopShortcuts: DesktopShortcut[]
  addShortcut: (module: ModuleType) => void
  removeShortcut: (module: ModuleType) => void
  updateShortcutPosition: (module: ModuleType, x: number, y: number) => void

  // App drawer (Samsung-style)
  drawerOpen: boolean
  setDrawerOpen: (open: boolean) => void
  toggleDrawer: () => void

  // OS Settings panel
  settingsOpen: boolean
  setSettingsOpen: (open: boolean) => void
  toggleSettings: () => void

  // Desktop settings
  desktopSettings: DesktopSettings
  updateDesktopSettings: (settings: Partial<DesktopSettings>) => void

  getWindowsForDesktop: () => WindowState[]
  getWindowById: (id: string) => WindowState | undefined
}

let _windowCounter = 0

function generateWindowId(): string {
  _windowCounter++
  return `win-${Date.now()}-${_windowCounter}`
}

function getDesktopOffset(index: number): { x: number; y: number } {
  const baseX = 160
  const baseY = 30
  const step = 30
  return { x: baseX + (index % 10) * step, y: baseY + (index % 10) * step }
}

function loadJSON<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback
  try {
    const raw = localStorage.getItem(key)
    if (raw) return JSON.parse(raw)
  } catch { /* ignore */ }
  return fallback
}

function saveJSON(key: string, data: unknown) {
  if (typeof window !== 'undefined') {
    localStorage.setItem(key, JSON.stringify(data))
  }
}

export const DOCK_HEIGHT = 56
export const STATUS_BAR_HEIGHT = 32

export const useWindowManager = create<WindowManagerState>((set, get) => ({
  isDesktopMode: (() => {
    if (typeof window === 'undefined') return false
    return localStorage.getItem('desktopMode') === 'true'
  })(),
  setDesktopMode: (on) => {
    if (typeof window !== 'undefined') localStorage.setItem('desktopMode', String(on))
    set({ isDesktopMode: on })
  },
  toggleDesktopMode: () => {
    const next = !get().isDesktopMode
    get().setDesktopMode(next)
  },

  windows: [],
  topZIndex: 100,

  desktops: [
    { id: 'desktop-1', name: 'Glavni' },
    { id: 'desktop-2', name: 'Komunikacija' },
    { id: 'desktop-3', name: 'Analitika' },
  ],
  activeDesktopId: 'desktop-1',

  // Desktop shortcuts (persisted)
  desktopShortcuts: loadJSON('desktopShortcuts', []),
  addShortcut: (module) => {
    const shortcuts = get().desktopShortcuts
    if (shortcuts.some((s) => s.module === module)) return
    const settings = get().desktopSettings
    const gs = settings.gridSize
    const index = shortcuts.length
    const newShortcut: DesktopShortcut = {
      module,
      x: 16 + (index % Math.floor((typeof window !== 'undefined' ? window.innerWidth : 1920) / gs)) * gs,
      y: 16 + Math.floor(index / Math.floor((typeof window !== 'undefined' ? window.innerWidth : 1920) / gs)) * gs,
    }
    const updated = [...shortcuts, newShortcut]
    saveJSON('desktopShortcuts', updated)
    set({ desktopShortcuts: updated })
  },
  removeShortcut: (module) => {
    const updated = get().desktopShortcuts.filter((s) => s.module !== module)
    saveJSON('desktopShortcuts', updated)
    set({ desktopShortcuts: updated })
  },
  updateShortcutPosition: (module, x, y) => {
    const updated = get().desktopShortcuts.map((s) =>
      s.module === module ? { ...s, x, y } : s
    )
    saveJSON('desktopShortcuts', updated)
    set({ desktopShortcuts: updated })
  },

  // App drawer
  drawerOpen: false,
  setDrawerOpen: (open) => set({ drawerOpen: open }),
  toggleDrawer: () => set({ drawerOpen: !get().drawerOpen }),

  // OS Settings
  settingsOpen: false,
  setSettingsOpen: (open) => set({ settingsOpen: open }),
  toggleSettings: () => set({ settingsOpen: !get().settingsOpen }),

  // Desktop settings (persisted)
  desktopSettings: loadJSON('desktopSettings', DEFAULT_SETTINGS),
  updateDesktopSettings: (partial) => {
    const updated = { ...get().desktopSettings, ...partial }
    saveJSON('desktopSettings', updated)
    set({ desktopSettings: updated })
  },

  // Open window
  openWindow: (moduleId, title, icon) => {
    const existing = get().windows.find((w) => w.moduleId === moduleId && !w.isMinimized)
    if (existing) { get().focusWindow(existing.id); return existing.id }

    const minimized = get().windows.find((w) => w.moduleId === moduleId && w.isMinimized)
    if (minimized) {
      set({ windows: get().windows.map((w) => w.id === minimized.id ? { ...w, isMinimized: false } : w) })
      get().focusWindow(minimized.id)
      return minimized.id
    }

    const id = generateWindowId()
    const index = get().windows.length
    const offset = getDesktopOffset(index)
    const newZ = get().topZIndex + 1

    const newWindow: WindowState = {
      id, moduleId, title, icon,
      x: offset.x, y: offset.y,
      width: 960, height: 620,
      minWidth: 400, minHeight: 300,
      isMinimized: false, isMaximized: false,
      zIndex: newZ, snapZone: null,
    }

    set({ windows: [...get().windows, newWindow], topZIndex: newZ })
    return id
  },

  closeWindow: (id) => set({ windows: get().windows.filter((w) => w.id !== id) }),

  minimizeWindow: (id) => set({
    windows: get().windows.map((w) => w.id === id ? { ...w, isMinimized: true } : w)
  }),

  maximizeWindow: (id) => set({
    windows: get().windows.map((w) => w.id === id ? { ...w, isMaximized: true, snapZone: null } : w)
  }),

  restoreWindow: (id) => set({
    windows: get().windows.map((w) => w.id === id ? { ...w, isMaximized: false } : w)
  }),

  focusWindow: (id) => {
    const newZ = get().topZIndex + 1
    set({
      windows: get().windows.map((w) => w.id === id ? { ...w, zIndex: newZ, isMinimized: false } : w),
      topZIndex: newZ,
    })
  },

  updateWindowPosition: (id, x, y) => {
    // Clamp: don't let title bar go above status bar, don't let window go below dock
    const minY = STATUS_BAR_HEIGHT - 36 // allow title bar to overlap status bar slightly
    const maxY = typeof window !== 'undefined' ? window.innerHeight - DOCK_HEIGHT - 60 : 800
    const clampedY = Math.max(minY, Math.min(y, maxY))
    set({
      windows: get().windows.map((w) => w.id === id ? { ...w, x, y: clampedY } : w)
    })
  },

  updateWindowSize: (id, width, height) => set({
    windows: get().windows.map((w) =>
      w.id === id ? { ...w, width: Math.max(w.minWidth, width), height: Math.max(w.minHeight, height) } : w
    )
  }),

  snapWindow: (id, zone, containerWidth, containerHeight) => {
    const GAP = 8 // padding around snapped windows
    const dockH = DOCK_HEIGHT + 4
    const topH = STATUS_BAR_HEIGHT + GAP
    const usableW = containerWidth - GAP * 2
    const usableH = containerHeight - dockH - topH
    let x = GAP, y = topH, width = usableW, height = usableH

    if (zone === 'left') { width = usableW / 2; height = usableH }
    else if (zone === 'right') { x = GAP + usableW / 2; width = usableW / 2; height = usableH }
    else if (zone === 'top-left') { width = usableW / 2; height = usableH / 2 }
    else if (zone === 'top-right') { x = GAP + usableW / 2; width = usableW / 2; height = usableH / 2 }
    else if (zone === 'bottom-left') { y = topH + usableH / 2; width = usableW / 2; height = usableH / 2 }
    else if (zone === 'bottom-right') { x = GAP + usableW / 2; y = topH + usableH / 2; width = usableW / 2; height = usableH / 2 }

    set({ windows: get().windows.map((w) => w.id === id ? { ...w, x, y, width, height, snapZone: zone, isMaximized: false } : w) })
  },

  clearSnap: (id) => set({
    windows: get().windows.map((w) => w.id === id ? { ...w, snapZone: null } : w)
  }),

  addDesktop: (name) => set({ desktops: [...get().desktops, { id: `desktop-${Date.now()}`, name }] }),
  removeDesktop: (id) => {
    if (get().desktops.length <= 1) return
    set({
      desktops: get().desktops.filter((d) => d.id !== id),
      activeDesktopId: get().activeDesktopId === id ? get().desktops[0].id : get().activeDesktopId,
    })
  },
  setActiveDesktop: (id) => set({ activeDesktopId: id }),
  moveWindowToDesktop: () => {},

  cascadeWindows: () => {
    const wins = get().windows.filter((w) => !w.isMinimized)
    const topH = STATUS_BAR_HEIGHT + 8
    const updated = wins.map((w, i) => ({
      ...w, x: 80 + i * 30, y: topH + 20 + i * 30,
      width: 800, height: 500, isMaximized: false, snapZone: null,
      zIndex: get().topZIndex + i + 1,
    }))
    set({
      windows: get().windows.map((w) => updated.find((u) => u.id === w.id) || w),
      topZIndex: get().topZIndex + wins.length,
    })
  },

  tileWindows: () => {
    const visible = get().windows.filter((w) => !w.isMinimized)
    if (!visible.length) return
    const topH = STATUS_BAR_HEIGHT
    const dockH = DOCK_HEIGHT
    const cw = typeof window !== 'undefined' ? window.innerWidth : 1920
    const ch = typeof window !== 'undefined' ? window.innerHeight - topH - dockH : 1024
    const cols = Math.ceil(Math.sqrt(visible.length))
    const rows = Math.ceil(visible.length / cols)
    const tw = Math.floor(cw / cols)
    const th = Math.floor(ch / rows)
    const updated = visible.map((w, i) => ({
      ...w, x: (i % cols) * tw, y: topH + Math.floor(i / cols) * th,
      width: tw, height: th, isMaximized: false, snapZone: null,
      zIndex: get().topZIndex + i + 1,
    }))
    set({
      windows: get().windows.map((w) => updated.find((u) => u.id === w.id) || w),
      topZIndex: get().topZIndex + visible.length,
    })
  },

  getWindowsForDesktop: () => get().windows,
  getWindowById: (id) => get().windows.find((w) => w.id === id),
}))
