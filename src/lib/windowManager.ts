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

interface WindowManagerState {
  // Desktop mode toggle
  isDesktopMode: boolean
  setDesktopMode: (on: boolean) => void
  toggleDesktopMode: () => void

  // Windows
  windows: WindowState[]
  topZIndex: number

  // Virtual desktops
  desktops: VirtualDesktop[]
  activeDesktopId: string

  // Window actions
  openWindow: (moduleId: ModuleType, title: string, icon: string) => string
  closeWindow: (id: string) => void
  minimizeWindow: (id: string) => void
  maximizeWindow: (id: string) => void
  restoreWindow: (id: string) => void
  focusWindow: (id: string) => void

  // Window movement
  updateWindowPosition: (id: string, x: number, y: number) => void
  updateWindowSize: (id: string, width: number, height: number) => void

  // Snap
  snapWindow: (id: string, zone: SnapZone, containerWidth: number, containerHeight: number) => void
  clearSnap: (id: string) => void

  // Virtual desktop
  addDesktop: (name: string) => void
  removeDesktop: (id: string) => void
  setActiveDesktop: (id: string) => void
  moveWindowToDesktop: (windowId: string, desktopId: string) => void

  // Cascade / Tile
  cascadeWindows: () => void
  tileWindows: () => void

  // Desktop shortcuts
  desktopShortcuts: DesktopShortcut[]
  addShortcut: (module: ModuleType) => void
  removeShortcut: (module: ModuleType) => void
  updateShortcutPosition: (module: ModuleType, x: number, y: number) => void

  // Start menu
  startMenuOpen: boolean
  setStartMenuOpen: (open: boolean) => void
  toggleStartMenu: () => void

  // Helpers
  getWindowsForDesktop: () => WindowState[]
  getWindowById: (id: string) => WindowState | undefined
}

let _windowCounter = 0

function generateWindowId(): string {
  _windowCounter++
  return `win-${Date.now()}-${_windowCounter}`
}

function getDesktopOffset(index: number): { x: number; y: number } {
  const baseX = 120
  const baseY = 40
  const step = 30
  return {
    x: baseX + (index % 10) * step,
    y: baseY + (index % 10) * step,
  }
}

function loadShortcuts(): DesktopShortcut[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem('desktopShortcuts')
    if (raw) return JSON.parse(raw)
  } catch { /* ignore */ }
  return []
}

function saveShortcuts(shortcuts: DesktopShortcut[]) {
  if (typeof window !== 'undefined') {
    localStorage.setItem('desktopShortcuts', JSON.stringify(shortcuts))
  }
}

export const useWindowManager = create<WindowManagerState>((set, get) => ({
  // Desktop mode
  isDesktopMode: (() => {
    if (typeof window === 'undefined') return false
    return localStorage.getItem('desktopMode') === 'true'
  })(),
  setDesktopMode: (on) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('desktopMode', String(on))
    }
    set({ isDesktopMode: on })
  },
  toggleDesktopMode: () => {
    const next = !get().isDesktopMode
    get().setDesktopMode(next)
  },

  // Windows
  windows: [],
  topZIndex: 100,

  // Virtual desktops
  desktops: [
    { id: 'desktop-1', name: 'Glavni' },
    { id: 'desktop-2', name: 'Komunikacija' },
    { id: 'desktop-3', name: 'Analitika' },
  ],
  activeDesktopId: 'desktop-1',

  // Desktop shortcuts (persisted)
  desktopShortcuts: loadShortcuts(),
  addShortcut: (module) => {
    const shortcuts = get().desktopShortcuts
    if (shortcuts.some((s) => s.module === module)) return // already exists
    const index = shortcuts.length
    const newShortcut: DesktopShortcut = {
      module,
      x: 20 + (index % 6) * 84,
      y: 20 + Math.floor(index / 6) * 84,
    }
    const updated = [...shortcuts, newShortcut]
    saveShortcuts(updated)
    set({ desktopShortcuts: updated })
  },
  removeShortcut: (module) => {
    const updated = get().desktopShortcuts.filter((s) => s.module !== module)
    saveShortcuts(updated)
    set({ desktopShortcuts: updated })
  },
  updateShortcutPosition: (module, x, y) => {
    const updated = get().desktopShortcuts.map((s) =>
      s.module === module ? { ...s, x, y } : s
    )
    saveShortcuts(updated)
    set({ desktopShortcuts: updated })
  },

  // Start menu
  startMenuOpen: false,
  setStartMenuOpen: (open) => set({ startMenuOpen: open }),
  toggleStartMenu: () => set({ startMenuOpen: !get().startMenuOpen }),

  // Open window
  openWindow: (moduleId, title, icon) => {
    const existing = get().windows.find(
      (w) => w.moduleId === moduleId && !w.isMinimized
    )
    if (existing) {
      get().focusWindow(existing.id)
      return existing.id
    }

    const minimized = get().windows.find(
      (w) => w.moduleId === moduleId && w.isMinimized
    )
    if (minimized) {
      set({
        windows: get().windows.map((w) =>
          w.id === minimized.id ? { ...w, isMinimized: false } : w
        ),
      })
      get().focusWindow(minimized.id)
      return minimized.id
    }

    const id = generateWindowId()
    const index = get().windows.length
    const offset = getDesktopOffset(index)
    const newZ = get().topZIndex + 1

    const newWindow: WindowState = {
      id,
      moduleId,
      title,
      icon,
      x: offset.x,
      y: offset.y,
      width: 900,
      height: 600,
      minWidth: 400,
      minHeight: 300,
      isMinimized: false,
      isMaximized: false,
      zIndex: newZ,
      snapZone: null,
    }

    set({
      windows: [...get().windows, newWindow],
      topZIndex: newZ,
    })

    return id
  },

  // Close window
  closeWindow: (id) => {
    set({ windows: get().windows.filter((w) => w.id !== id) })
  },

  // Minimize
  minimizeWindow: (id) => {
    set({
      windows: get().windows.map((w) =>
        w.id === id ? { ...w, isMinimized: true } : w
      ),
    })
  },

  // Maximize
  maximizeWindow: (id) => {
    set({
      windows: get().windows.map((w) =>
        w.id === id ? { ...w, isMaximized: true, snapZone: null } : w
      ),
    })
  },

  // Restore
  restoreWindow: (id) => {
    set({
      windows: get().windows.map((w) =>
        w.id === id ? { ...w, isMaximized: false } : w
      ),
    })
  },

  // Focus (bring to front)
  focusWindow: (id) => {
    const newZ = get().topZIndex + 1
    set({
      windows: get().windows.map((w) =>
        w.id === id ? { ...w, zIndex: newZ, isMinimized: false } : w
      ),
      topZIndex: newZ,
    })
  },

  // Update position
  updateWindowPosition: (id, x, y) => {
    set({
      windows: get().windows.map((w) =>
        w.id === id ? { ...w, x, y } : w
      ),
    })
  },

  // Update size
  updateWindowSize: (id, width, height) => {
    set({
      windows: get().windows.map((w) =>
        w.id === id
          ? { ...w, width: Math.max(w.minWidth, width), height: Math.max(w.minHeight, height) }
          : w
      ),
    })
  },

  // Snap
  snapWindow: (id, zone, containerWidth, containerHeight) => {
    const dockHeight = 56
    const topBarHeight = 48
    const usableHeight = containerHeight - dockHeight - topBarHeight
    let x = 0, y = topBarHeight, width = containerWidth, height = usableHeight

    if (zone === 'left') {
      width = containerWidth / 2
      height = usableHeight
    } else if (zone === 'right') {
      x = containerWidth / 2
      width = containerWidth / 2
      height = usableHeight
    } else if (zone === 'top-left') {
      width = containerWidth / 2
      height = usableHeight / 2
    } else if (zone === 'top-right') {
      x = containerWidth / 2
      width = containerWidth / 2
      height = usableHeight / 2
    } else if (zone === 'bottom-left') {
      y = topBarHeight + usableHeight / 2
      width = containerWidth / 2
      height = usableHeight / 2
    } else if (zone === 'bottom-right') {
      x = containerWidth / 2
      y = topBarHeight + usableHeight / 2
      width = containerWidth / 2
      height = usableHeight / 2
    }

    set({
      windows: get().windows.map((w) =>
        w.id === id ? { ...w, x, y, width, height, snapZone: zone, isMaximized: false } : w
      ),
    })
  },

  clearSnap: (id) => {
    set({
      windows: get().windows.map((w) =>
        w.id === id ? { ...w, snapZone: null } : w
      ),
    })
  },

  // Virtual desktop
  addDesktop: (name) => {
    const id = `desktop-${Date.now()}`
    set({ desktops: [...get().desktops, { id, name }] })
  },
  removeDesktop: (id) => {
    if (get().desktops.length <= 1) return
    set({
      desktops: get().desktops.filter((d) => d.id !== id),
      activeDesktopId: get().activeDesktopId === id ? get().desktops[0].id : get().activeDesktopId,
    })
  },
  setActiveDesktop: (id) => {
    set({ activeDesktopId: id })
  },
  moveWindowToDesktop: (windowId, desktopId) => {
    // Simplified: windows exist across all desktops
  },

  // Cascade windows
  cascadeWindows: () => {
    const windows = get().windows.filter((w) => !w.isMinimized)
    const topBarH = 48
    const dockH = 56
    const updated = windows.map((w, i) => ({
      ...w,
      x: 60 + i * 30,
      y: topBarH + 30 + i * 30,
      width: 800,
      height: 500,
      isMaximized: false,
      snapZone: null,
      zIndex: get().topZIndex + i + 1,
    }))
    set({
      windows: get().windows.map((w) => {
        const upd = updated.find((u) => u.id === w.id)
        return upd || w
      }),
      topZIndex: get().topZIndex + windows.length,
    })
  },

  // Tile windows
  tileWindows: () => {
    const visible = get().windows.filter((w) => !w.isMinimized)
    if (visible.length === 0) return

    const topBarH = 48
    const dockH = 56
    const containerWidth = typeof window !== 'undefined' ? window.innerWidth : 1920
    const containerHeight = typeof window !== 'undefined' ? window.innerHeight - topBarH - dockH : 1080 - topBarH - dockH

    const cols = Math.ceil(Math.sqrt(visible.length))
    const rows = Math.ceil(visible.length / cols)
    const tileW = Math.floor(containerWidth / cols)
    const tileH = Math.floor(containerHeight / rows)

    const updated = visible.map((w, i) => {
      const col = i % cols
      const row = Math.floor(i / cols)
      return {
        ...w,
        x: col * tileW,
        y: topBarH + row * tileH,
        width: tileW,
        height: tileH,
        isMaximized: false,
        snapZone: null,
        zIndex: get().topZIndex + i + 1,
      }
    })

    set({
      windows: get().windows.map((w) => {
        const upd = updated.find((u) => u.id === w.id)
        return upd || w
      }),
      topZIndex: get().topZIndex + visible.length,
    })
  },

  // Helpers
  getWindowsForDesktop: () => {
    return get().windows
  },

  getWindowById: (id) => {
    return get().windows.find((w) => w.id === id)
  },
}))
