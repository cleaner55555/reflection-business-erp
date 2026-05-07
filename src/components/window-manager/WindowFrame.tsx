'use client'

import { useCallback, useRef, useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useWindowManager, type WindowState, type SnapZone, DOCK_HEIGHT, STATUS_BAR_HEIGHT } from '@/lib/windowManager'
import { moduleComponents } from '@/lib/moduleMap'
import { menuGroups } from '@/components/modules/AppSidebar'
import {
  Minus,
  Square,
  X,
  Copy,
} from 'lucide-react'

const SNAP_THRESHOLD = 12
const RESTORE_WIDTH = 960
const RESTORE_HEIGHT = 620

function detectSnapZone(
  mouseX: number,
  mouseY: number,
  screenW: number,
  screenH: number
): SnapZone | null {
  const inLeft = mouseX <= SNAP_THRESHOLD
  const inRight = mouseX >= screenW - SNAP_THRESHOLD
  const inTop = mouseY <= STATUS_BAR_HEIGHT + SNAP_THRESHOLD
  const inBottom = mouseY >= screenH - DOCK_HEIGHT - SNAP_THRESHOLD

  if (inTop && inLeft) return 'top-left'
  if (inTop && inRight) return 'top-right'
  if (inBottom && inLeft) return 'bottom-left'
  if (inBottom && inRight) return 'bottom-right'
  if (inLeft) return 'left'
  if (inRight) return 'right'
  if (inTop) return 'top-left' // full width = treat as top area

  return null
}

function getSnapPreviewRect(
  zone: SnapZone,
  screenW: number,
  screenH: number
): { x: number; y: number; w: number; h: number } {
  const dockH = DOCK_HEIGHT + 4
  const topH = STATUS_BAR_HEIGHT
  const usableW = screenW - 4
  const usableH = screenH - dockH - topH
  const g = 2

  switch (zone) {
    case 'left': return { x: 2, y: topH, w: usableW / 2 - g, h: usableH }
    case 'right': return { x: usableW / 2 + g, y: topH, w: usableW / 2 - g, h: usableH }
    case 'top-left': return { x: 2, y: topH, w: usableW / 2 - g, h: usableH / 2 - g / 2 }
    case 'top-right': return { x: usableW / 2 + g, y: topH, w: usableW / 2 - g, h: usableH / 2 - g / 2 }
    case 'bottom-left': return { x: 2, y: topH + usableH / 2 + g / 2, w: usableW / 2 - g, h: usableH / 2 - g / 2 }
    case 'bottom-right': return { x: usableW / 2 + g, y: topH + usableH / 2 + g / 2, w: usableW / 2 - g, h: usableH / 2 - g / 2 }
  default: return { x: 0, y: 0, w: 0, h: 0 }
  }
}

interface WindowFrameProps {
  windowData: WindowState
}

export function WindowFrame({ windowData }: WindowFrameProps) {
  const {
    closeWindow,
    minimizeWindow,
    maximizeWindow,
    restoreWindow,
    focusWindow,
    updateWindowPosition,
    updateWindowSize,
    snapWindow,
    clearSnap,
    topZIndex,
  } = useWindowManager()

  const frameRef = useRef<HTMLDivElement>(null)
  const titleBarRef = useRef<HTMLDivElement>(null)

  const [isDragging, setIsDragging] = useState(false)
  const [isResizing, setIsResizing] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [snapPreview, setSnapPreview] = useState<SnapZone | null>(null)

  // Mark as mounted after first render to avoid re-animating on drag/resize re-renders
  useEffect(() => {
    // Small delay so the initial animation has time to play
    const timer = requestAnimationFrame(() => setMounted(true))
    return () => cancelAnimationFrame(timer)
  }, [])

  // Determine if this window is the focused (top) window
  const isFocused = windowData.zIndex === topZIndex && !windowData.isMinimized

  // ===== DRAG: native window events (with snap) =====
  // Track the pre-snap dimensions so we can restore them on unsnap
  const preSnapRef = useRef<{ width: number; height: number } | null>(null)

  useEffect(() => {
    const titleBar = titleBarRef.current
    if (!titleBar) return

    const onDown = (e: PointerEvent) => {
      if (e.button !== 0) return

      // Don't start drag if clicking on a button (close, minimize, maximize)
      const target = e.target as HTMLElement
      if (target.closest('button')) return

      e.preventDefault()
      e.stopPropagation()
      focusWindow(windowData.id)

      setIsDragging(true)
      const store = useWindowManager.getState()
      const win = store.windows.find(w => w.id === windowData.id)
      if (!win) return

      // === UNSNAP: If window is snapped or maximized, restore to normal size first ===
      let startX: number, startY: number, originX: number, originY: number

      if (win.snapZone || win.isMaximized) {
        clearSnap(windowData.id)
        // Use remembered pre-snap size, or defaults
        const restoreW = preSnapRef.current?.width ?? RESTORE_WIDTH
        const restoreH = preSnapRef.current?.height ?? RESTORE_HEIGHT
        // Position window so cursor is centered on the title bar
        startX = e.clientX
        startY = e.clientY
        originX = Math.max(0, e.clientX - restoreW / 2)
        originY = Math.max(STATUS_BAR_HEIGHT - 36, e.clientY - 20)
        updateWindowSize(windowData.id, restoreW, restoreH)
        updateWindowPosition(windowData.id, originX, originY)
      } else {
        startX = e.clientX
        startY = e.clientY
        originX = win.x
        originY = win.y
        // Remember current size for when we snap
        preSnapRef.current = { width: win.width, height: win.height }
      }

      const screenW = window.innerWidth
      const screenH = window.innerHeight

      const onMove = (ev: PointerEvent) => {
        const dx = ev.clientX - startX
        const dy = ev.clientY - startY
        updateWindowPosition(windowData.id, originX + dx, originY + dy)

        // Detect snap zone for preview
        const zone = detectSnapZone(ev.clientX, ev.clientY, screenW, screenH)
        setSnapPreview(zone)
      }

      const onUp = (ev: PointerEvent) => {
        window.removeEventListener('pointermove', onMove)
        window.removeEventListener('pointerup', onUp)
        setIsDragging(false)
        setSnapPreview(null)

        // Check if we should snap
        const zone = detectSnapZone(ev.clientX, ev.clientY, screenW, screenH)
        if (zone) {
          preSnapRef.current = { width: RESTORE_WIDTH, height: RESTORE_HEIGHT }
          snapWindow(windowData.id, zone, screenW, screenH)
        }
      }

      window.addEventListener('pointermove', onMove)
      window.addEventListener('pointerup', onUp)
    }

    titleBar.addEventListener('pointerdown', onDown)
    return () => titleBar.removeEventListener('pointerdown', onDown)
    // Only re-attach when window ID changes — NOT on every position/maximize update
  }, [windowData.id])

  // ===== RESIZE: native window events =====
  const resizeHandlesRef = useRef<Map<string, HTMLElement>>(new Map())

  const registerHandle = useCallback((dir: string, el: HTMLElement | null) => {
    if (el) resizeHandlesRef.current.set(dir, el)
    else resizeHandlesRef.current.delete(dir)
  }, [])

  useEffect(() => {
    const handles = resizeHandlesRef.current

    const onDown = (e: PointerEvent, direction: string) => {
      if (e.button !== 0) return
      e.preventDefault()
      e.stopPropagation()
      focusWindow(windowData.id)

      setIsResizing(true)
      const startX = e.clientX
      const startY = e.clientY
      // Read current window dimensions from store (always fresh)
      const win = useWindowManager.getState().windows.find(w => w.id === windowData.id)

      // Unsnap if snapped — allow resizing freely
      if (win?.snapZone) {
        clearSnap(windowData.id)
      }
      if (win?.isMaximized) return
      const originX = win?.x ?? windowData.x
      const originY = win?.y ?? windowData.y
      const originW = win?.width ?? windowData.width
      const originH = win?.height ?? windowData.height
      const minW = win?.minWidth ?? windowData.minWidth
      const minH = win?.minHeight ?? windowData.minHeight

      const onMove = (ev: PointerEvent) => {
        const dx = ev.clientX - startX
        const dy = ev.clientY - startY
        let newX = originX
        let newY = originY
        let newW = originW
        let newH = originH

        if (direction.includes('e')) newW = Math.max(minW, originW + dx)
        if (direction.includes('w')) {
          newW = Math.max(minW, originW - dx)
          newX = originX + (originW - newW)
        }
        if (direction.includes('s')) newH = Math.max(minH, originH + dy)
        if (direction.includes('n')) {
          newH = Math.max(minH, originH - dy)
          newY = originY + (originH - newH)
        }

        updateWindowPosition(windowData.id, newX, newY)
        updateWindowSize(windowData.id, newW, newH)
      }

      const onUp = () => {
        window.removeEventListener('pointermove', onMove)
        window.removeEventListener('pointerup', onUp)
        setIsResizing(false)
      }

      window.addEventListener('pointermove', onMove)
      window.addEventListener('pointerup', onUp)
    }

    const handleMap = new Map<string, (e: PointerEvent) => void>()
    for (const [dir, el] of handles) {
      const handler = (e: PointerEvent) => onDown(e, dir)
      handleMap.set(dir, handler)
      el.addEventListener('pointerdown', handler)
    }

    return () => {
      for (const [dir, el] of handles) {
        const handler = handleMap.get(dir)
        if (handler) el.removeEventListener('pointerdown', handler)
      }
    }
    // Only re-attach when window ID or isMaximized changes
  }, [windowData.id, windowData.isMaximized])

  // Double-click title bar to maximize/restore
  const handleTitleDoubleClick = useCallback(() => {
    if (windowData.isMaximized) {
      restoreWindow(windowData.id)
    } else {
      maximizeWindow(windowData.id)
    }
  }, [windowData.id, windowData.isMaximized, maximizeWindow, restoreWindow])

  // Get module icon for titlebar
  const allMenuItems = menuGroups.flatMap((g) => g.items)
  const moduleItem = allMenuItems.find((m) => m.module === windowData.moduleId)
  const ModuleIcon = moduleItem?.icon

  if (windowData.isMinimized) return null

  const isSnapped = !!windowData.snapZone && !windowData.isMaximized
  const style: React.CSSProperties = windowData.isMaximized
    ? {
        position: 'absolute',
        top: STATUS_BAR_HEIGHT,
        left: 0,
        width: '100%',
        height: `calc(100% - ${STATUS_BAR_HEIGHT + DOCK_HEIGHT}px)`,
        zIndex: windowData.zIndex,
        borderRadius: 0,
      }
    : {
        position: 'absolute',
        top: windowData.y,
        left: windowData.x,
        width: windowData.width,
        height: windowData.height,
        zIndex: windowData.zIndex,
        minWidth: windowData.minWidth,
        minHeight: windowData.minHeight,
        borderRadius: isSnapped ? 8 : undefined,
      }

  // Shadow class based on focus and drag state
  const shadowClass = isDragging
    ? 'shadow-none'
    : isFocused
      ? 'shadow-2xl shadow-black/25'
      : 'shadow-xl shadow-black/10 opacity-[0.97]'

  // Snap preview rectangle (renders during drag near edges)
  const previewRect = snapPreview
    ? getSnapPreviewRect(snapPreview, window.innerWidth, window.innerHeight)
    : null

  return (
    <>
      {/* Snap zone preview overlay */}
      {previewRect && previewRect.w > 0 && (
        <div
          className="fixed pointer-events-none border-2 border-primary/50 bg-primary/8 rounded-lg z-[99999]"
          style={{
            left: previewRect.x,
            top: previewRect.y,
            width: previewRect.w,
            height: previewRect.h,
            transition: 'all 150ms ease-out',
          }}
        />
      )}
      <motion.div
        ref={frameRef}
        className={`flex flex-col overflow-hidden bg-background border border-border/50 ${isSnapped ? 'rounded-lg' : 'rounded-xl'} ${shadowClass}`}
        style={{
          ...style,
          transition: (isDragging || isResizing) ? 'none' : 'box-shadow 200ms ease, opacity 200ms ease',
        }}
        initial={!mounted ? { scale: 0.92, opacity: 0 } : false}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.92, opacity: 0 }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
        onMouseDown={() => focusWindow(windowData.id)}
      >
        {/* Title bar */}
        <div
          ref={titleBarRef}
          className="flex items-center h-10 px-3 bg-background/60 backdrop-blur-xl border-b border-border/30 border-t border-primary/10 cursor-grab active:cursor-grabbing select-none shrink-0 rounded-t-xl"
          onDoubleClick={handleTitleDoubleClick}
        >
          {/* Module icon + title */}
          {ModuleIcon && (
            <ModuleIcon className="w-3.5 h-3.5 text-muted-foreground mr-2 shrink-0" />
          )}
          <span className="text-xs font-medium text-foreground/70 mr-auto truncate max-w-[200px]">
            {windowData.title}
          </span>
          {/* Window controls */}
          <div className="flex items-center gap-0.5">
            <button
              onClick={(e) => { e.stopPropagation(); minimizeWindow(windowData.id) }}
              className="flex items-center justify-center w-7 h-7 rounded-lg hover:bg-foreground/5 transition-colors"
              title="Minimizuj"
            >
              <Minus className="w-3.5 h-3.5 text-foreground/40" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation()
                if (windowData.isMaximized) { restoreWindow(windowData.id) } else { maximizeWindow(windowData.id) }
              }}
              className="flex items-center justify-center w-7 h-7 rounded-lg hover:bg-foreground/5 transition-colors"
              title={windowData.isMaximized ? 'Vrati' : 'Maksimizuj'}
            >
              {windowData.isMaximized ? (
                <Copy className="w-3 h-3 text-foreground/40" />
              ) : (
                <Square className="w-3 h-3 text-foreground/40" />
              )}
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); closeWindow(windowData.id) }}
              className="flex items-center justify-center w-7 h-7 rounded-lg hover:bg-red-500 hover:text-white hover:scale-110 transition-all duration-150"
              title="Zatvori"
            >
              <X className="w-3.5 h-3.5 text-foreground/40" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-4 bg-background rounded-b-xl">
          {(() => {
            const Module = moduleComponents[windowData.moduleId]
            return Module ? <Module /> : (
              <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
                Modul &quot;{windowData.moduleId}&quot; nije pronađen
              </div>
            )
          })()}
        </div>

        {/* Resize handles */}
        {!windowData.isMaximized && (
          <>
            {/* Edges — 4px hit area for easier grabbing */}
            <div ref={(el) => registerHandle('n', el)} className="absolute top-0 left-2 right-2 h-1 cursor-n-resize touch-none" />
            <div ref={(el) => registerHandle('s', el)} className="absolute bottom-0 left-2 right-2 h-1 cursor-s-resize touch-none" />
            <div ref={(el) => registerHandle('w', el)} className="absolute top-2 left-0 bottom-2 w-1 cursor-w-resize touch-none" />
            <div ref={(el) => registerHandle('e', el)} className="absolute top-2 right-0 bottom-2 w-1 cursor-e-resize touch-none" />
            {/* Corners — bigger hit area */}
            <div ref={(el) => registerHandle('nw', el)} className="absolute top-0 left-0 w-4 h-4 cursor-nw-resize touch-none" />
            <div ref={(el) => registerHandle('ne', el)} className="absolute top-0 right-0 w-4 h-4 cursor-ne-resize touch-none" />
            <div ref={(el) => registerHandle('sw', el)} className="absolute bottom-0 left-0 w-4 h-4 cursor-sw-resize touch-none" />
            <div ref={(el) => registerHandle('se', el)} className="absolute bottom-0 right-0 w-4 h-4 cursor-se-resize touch-none" />
          </>
        )}
      </motion.div>
    </>
  )
}