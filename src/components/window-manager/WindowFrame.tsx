'use client'

import { useCallback, useRef, useEffect, useState } from 'react'
import { useWindowManager, type WindowState, type SnapZone, DOCK_HEIGHT, STATUS_BAR_HEIGHT } from '@/lib/windowManager'
import { moduleComponents } from '@/lib/moduleMap'
import { menuGroups } from '@/components/modules/AppSidebar'
import {
  Minus,
  Square,
  X,
  Copy,
} from 'lucide-react'

interface WindowFrameProps {
  windowData: WindowState
}

const SNAP_THRESHOLD = 12
const SNAP_GAP = 8 // gap between status bar and snapped window

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
  } = useWindowManager()

  const frameRef = useRef<HTMLDivElement>(null)
  const titleBarRef = useRef<HTMLDivElement>(null)

  const [snapIndicator, setSnapIndicator] = useState<SnapZone>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [isResizing, setIsResizing] = useState(false)

  // ===== DRAG: native window events =====
  const snapIndicatorRef = useRef<SnapZone>(null)

  useEffect(() => {
    const titleBar = titleBarRef.current
    if (!titleBar) return

    const onDown = (e: PointerEvent) => {
      if (e.button !== 0) return
      if (windowData.isMaximized) return
      e.preventDefault()
      e.stopPropagation()
      focusWindow(windowData.id)

      setIsDragging(true)
      snapIndicatorRef.current = null

      const startX = e.clientX
      const startY = e.clientY
      const originX = windowData.x
      const originY = windowData.y

      const onMove = (ev: PointerEvent) => {
        const dx = ev.clientX - startX
        const dy = ev.clientY - startY
        updateWindowPosition(windowData.id, originX + dx, originY + dy)

        // Snap detection
        const cw = window.innerWidth
        const ch = window.innerHeight
        let snap: SnapZone = null

        if (ev.clientX <= SNAP_THRESHOLD) {
          snap = ev.clientY <= SNAP_THRESHOLD ? 'top-left' : ev.clientY >= ch - SNAP_THRESHOLD ? 'bottom-left' : 'left'
        } else if (ev.clientX >= cw - SNAP_THRESHOLD) {
          snap = ev.clientY <= SNAP_THRESHOLD ? 'top-right' : ev.clientY >= ch - SNAP_THRESHOLD ? 'bottom-right' : 'right'
        }

        snapIndicatorRef.current = snap
        setSnapIndicator(snap)
      }

      const onUp = () => {
        window.removeEventListener('pointermove', onMove)
        window.removeEventListener('pointerup', onUp)
        setIsDragging(false)

        if (snapIndicatorRef.current) {
          snapWindow(windowData.id, snapIndicatorRef.current, window.innerWidth, window.innerHeight)
        }
        setSnapIndicator(null)
        snapIndicatorRef.current = null
      }

      window.addEventListener('pointermove', onMove)
      window.addEventListener('pointerup', onUp)
    }

    titleBar.addEventListener('pointerdown', onDown)
    return () => titleBar.removeEventListener('pointerdown', onDown)
  }, [windowData.id, windowData.x, windowData.y, windowData.isMaximized, focusWindow, updateWindowPosition, snapWindow])

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
      if (windowData.isMaximized) return
      e.preventDefault()
      e.stopPropagation()
      focusWindow(windowData.id)

      setIsResizing(true)
      const startX = e.clientX
      const startY = e.clientY
      const originX = windowData.x
      const originY = windowData.y
      const originW = windowData.width
      const originH = windowData.height
      const minW = windowData.minWidth
      const minH = windowData.minHeight

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
  }, [windowData.id, windowData.x, windowData.y, windowData.width, windowData.height, windowData.minWidth, windowData.minHeight, windowData.isMaximized, focusWindow, updateWindowPosition, updateWindowSize])

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
      }

  return (
    <>
      {/* Snap indicator overlay */}
      {isDragging && snapIndicator && <SnapPreview zone={snapIndicator} />}

      <div
        ref={frameRef}
        className={`flex flex-col overflow-hidden bg-background border border-border/50 shadow-2xl rounded-xl ${
          isDragging ? 'shadow-none scale-[1.01] transition-shadow duration-75' : isResizing ? 'shadow-xl' : 'shadow-xl'
        }`}
        style={{
          ...style,
          transition: (isDragging || isResizing) ? 'none' : 'box-shadow 150ms ease',
        }}
        onMouseDown={() => focusWindow(windowData.id)}
      >
        {/* Title bar */}
        <div
          ref={titleBarRef}
          className="flex items-center h-10 px-3 bg-muted/40 backdrop-blur-sm border-b border-border/30 cursor-grab active:cursor-grabbing select-none shrink-0 rounded-t-xl"
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
                windowData.isMaximized ? restoreWindow(windowData.id) : maximizeWindow(windowData.id)
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
              className="flex items-center justify-center w-7 h-7 rounded-lg hover:bg-red-500/80 hover:text-white transition-colors"
              title="Zatvori"
            >
              <X className="w-3.5 h-3.5 text-foreground/40" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-4 bg-background rounded-b-xl">
          {moduleComponents[windowData.moduleId] || (
            <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
              Modul &quot;{windowData.moduleId}&quot; nije pronađen
            </div>
          )}
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
      </div>
    </>
  )
}

// Snap preview overlay
function SnapPreview({ zone }: { zone: SnapZone }) {
  const topH = STATUS_BAR_HEIGHT + SNAP_GAP
  const dockH = DOCK_HEIGHT + 4
  const cw = typeof window !== 'undefined' ? window.innerWidth : 1920
  const ch = typeof window !== 'undefined' ? window.innerHeight : 1024
  const usableH = ch - topH - dockH

  let style: React.CSSProperties = {}

  if (zone === 'left') {
    style = { position: 'fixed', top: topH, left: 4, width: (cw - 8) / 2, height: usableH }
  } else if (zone === 'right') {
    style = { position: 'fixed', top: topH, left: cw / 2, width: (cw - 8) / 2, height: usableH }
  } else if (zone === 'top-left') {
    style = { position: 'fixed', top: topH, left: 4, width: (cw - 8) / 2, height: usableH / 2 }
  } else if (zone === 'top-right') {
    style = { position: 'fixed', top: topH, left: cw / 2, width: (cw - 8) / 2, height: usableH / 2 }
  } else if (zone === 'bottom-left') {
    style = { position: 'fixed', top: topH + usableH / 2, left: 4, width: (cw - 8) / 2, height: usableH / 2 }
  } else if (zone === 'bottom-right') {
    style = { position: 'fixed', top: topH + usableH / 2, left: cw / 2, width: (cw - 8) / 2, height: usableH / 2 }
  }

  return (
    <div
      className="fixed bg-primary/10 border-2 border-primary/40 rounded-lg pointer-events-none z-[99999]"
      style={{ ...style, transition: 'all 150ms ease' }}
    />
  )
}
