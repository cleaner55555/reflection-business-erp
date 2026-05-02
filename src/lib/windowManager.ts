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
  const baseX = 80
  const baseY = 40
  const step = 30
  return {
    x: baseX + (index % 10) * step,
    y: baseY + (index % 10) * step,
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
    const usableHeight = containerHeight - dockHeight
    let x = 0, y = 0, width = containerWidth, height = usableHeight

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
      y = usableHeight / 2
      width = containerWidth / 2
      height = usableHeight / 2
    } else if (zone === 'bottom-right') {
      x = containerWidth / 2
      y = usableHeight / 2
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
    const wins = get().windows.filter((w) => {
      // Move windows to first desktop
      return true // we'll handle in moveWindowToDesktop
    })
    // Move all windows from this desktop to the first one
    set({
      desktops: get().desktops.filter((d) => d.id !== id),
      activeDesktopId: get().activeDesktopId === id ? get().desktops[0].id : get().activeDesktopId,
    })
  },
  setActiveDesktop: (id) => {
    set({ activeDesktopId: id })
  },
  moveWindowToDesktop: (windowId, desktopId) => {
    // Currently single-window-per-desktop is simplified; we just manage via frontend state
    // For now, windows exist across all desktops (simplified approach)
  },

  // Cascade windows
  cascadeWindows: () => {
    const windows = get().windows.filter((w) => !w.isMinimized)
    const updated = windows.map((w, i) => ({
      ...w,
      x: 60 + i * 30,
      y: 30 + i * 30,
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

    const containerWidth = typeof window !== 'undefined' ? window.innerWidth : 1920
    const containerHeight = typeof window !== 'undefined' ? window.innerHeight - 56 : 1080 - 56

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
        y: row * tileH,
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
