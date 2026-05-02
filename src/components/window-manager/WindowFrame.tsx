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
  } = useWindowManager()

  const frameRef = useRef<HTMLDivElement>(null)
  const dragRef = useRef<{
    startX: number
    startY: number
    windowX: number
    windowY: number
  } | null>(null)

  const resizeRef = useRef<{
    startX: number
    startY: number
    windowX: number
    windowY: number
    windowW: number
    windowH: number
    direction: string
  } | null>(null)

  const [snapIndicator, setSnapIndicator] = useState<SnapZone>(null)
  const [isDragging, setIsDragging] = useState(false)

  // Drag handlers
  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      if (windowData.isMaximized) return
      e.preventDefault()
      focusWindow(windowData.id)
      dragRef.current = {
        startX: e.clientX,
        startY: e.clientY,
        windowX: windowData.x,
        windowY: windowData.y,
      }
      setIsDragging(true)
      ;(e.target as HTMLElement).setPointerCapture(e.pointerId)
    },
    [windowData.id, windowData.x, windowData.y, windowData.isMaximized, focusWindow]
  )

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!dragRef.current) return
      const dx = e.clientX - dragRef.current.startX
      const dy = e.clientY - dragRef.current.startY
      const newX = dragRef.current.windowX + dx
      const newY = dragRef.current.windowY + dy

      updateWindowPosition(windowData.id, newX, newY)

      // Snap detection
      const containerWidth = window.innerWidth
      const containerHeight = window.innerHeight

      if (e.clientX <= SNAP_THRESHOLD) {
        if (e.clientY <= SNAP_THRESHOLD) {
          setSnapIndicator('top-left')
        } else if (e.clientY >= containerHeight - SNAP_THRESHOLD) {
          setSnapIndicator('bottom-left')
        } else {
          setSnapIndicator('left')
        }
      } else if (e.clientX >= containerWidth - SNAP_THRESHOLD) {
        if (e.clientY <= SNAP_THRESHOLD) {
          setSnapIndicator('top-right')
        } else if (e.clientY >= containerHeight - SNAP_THRESHOLD) {
          setSnapIndicator('bottom-right')
        } else {
          setSnapIndicator('right')
        }
      } else {
        setSnapIndicator(null)
      }
    },
    [windowData.id, updateWindowPosition]
  )

  const handlePointerUp = useCallback(
    (e: React.PointerEvent) => {
      if (!dragRef.current) return

      // Apply snap if detected
      if (snapIndicator) {
        const containerWidth = window.innerWidth
        const containerHeight = window.innerHeight
        snapWindow(windowData.id, snapIndicator, containerWidth, containerHeight)
      }

      dragRef.current = null
      setIsDragging(false)
      setSnapIndicator(null)
    },
    [windowData.id, snapIndicator, snapWindow]
  )

  // Resize handlers
  const handleResizePointerDown = useCallback(
    (e: React.PointerEvent, direction: string) => {
      if (windowData.isMaximized) return
      e.preventDefault()
      e.stopPropagation()
      focusWindow(windowData.id)
      resizeRef.current = {
        startX: e.clientX,
        startY: e.clientY,
        windowX: windowData.x,
        windowY: windowData.y,
        windowW: windowData.width,
        windowH: windowData.height,
        direction,
      }
      ;(e.target as HTMLElement).setPointerCapture(e.pointerId)
    },
    [windowData, focusWindow]
  )

  useEffect(() => {
    if (!resizeRef.current) return

    const handleMove = (e: PointerEvent) => {
      const r = resizeRef.current
      if (!r) return

      const dx = e.clientX - r.startX
      const dy = e.clientY - r.startY
      let newX = r.windowX
      let newY = r.windowY
      let newW = r.windowW
      let newH = r.windowH

      if (r.direction.includes('e')) newW = Math.max(windowData.minWidth, r.windowW + dx)
      if (r.direction.includes('w')) {
        newW = Math.max(windowData.minWidth, r.windowW - dx)
        newX = r.windowX + (r.windowW - newW)
      }
      if (r.direction.includes('s')) newH = Math.max(windowData.minHeight, r.windowH + dy)
      if (r.direction.includes('n')) {
        newH = Math.max(windowData.minHeight, r.windowH - dy)
        newY = r.windowY + (r.windowH - newH)
      }

      updateWindowPosition(windowData.id, newX, newY)
      updateWindowSize(windowData.id, newW, newH)
    }

    const handleUp = () => {
      resizeRef.current = null
    }

    window.addEventListener('pointermove', handleMove)
    window.addEventListener('pointerup', handleUp)
    return () => {
      window.removeEventListener('pointermove', handleMove)
      window.removeEventListener('pointerup', handleUp)
    }
  }, [windowData.id, windowData.minWidth, windowData.minHeight, updateWindowPosition, updateWindowSize])

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
        className={`flex flex-col overflow-hidden bg-background border border-border/50 shadow-2xl rounded-xl transition-shadow duration-150 ${
          isDragging ? 'shadow-none scale-[1.01]' : 'shadow-xl'
        }`}
        style={style}
        onMouseDown={() => focusWindow(windowData.id)}
      >
        {/* Title bar — macOS-like traffic lights feel */}
        <div
          className="flex items-center h-10 px-3 bg-muted/40 backdrop-blur-sm border-b border-border/30 cursor-grab active:cursor-grabbing select-none shrink-0 rounded-t-xl"
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
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
        <div className="flex-1 overflow-auto p-4 bg-background">
          {moduleComponents[windowData.moduleId] || (
            <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
              Modul &quot;{windowData.moduleId}&quot; nije pronađen
            </div>
          )}
        </div>

        {/* Resize handles */}
        {!windowData.isMaximized && (
          <>
            {/* Edges */}
            <div
              className="absolute top-0 left-0 right-0 h-1 cursor-n-resize"
              onPointerDown={(e) => handleResizePointerDown(e, 'n')}
            />
            <div
              className="absolute bottom-0 left-0 right-0 h-1 cursor-s-resize"
              onPointerDown={(e) => handleResizePointerDown(e, 's')}
            />
            <div
              className="absolute top-0 left-0 bottom-0 w-1 cursor-w-resize"
              onPointerDown={(e) => handleResizePointerDown(e, 'w')}
            />
            <div
              className="absolute top-0 right-0 bottom-0 w-1 cursor-e-resize"
              onPointerDown={(e) => handleResizePointerDown(e, 'e')}
            />
            {/* Corners */}
            <div
              className="absolute top-0 left-0 w-3 h-3 cursor-nw-resize"
              onPointerDown={(e) => handleResizePointerDown(e, 'nw')}
            />
            <div
              className="absolute top-0 right-0 w-3 h-3 cursor-ne-resize"
              onPointerDown={(e) => handleResizePointerDown(e, 'ne')}
            />
            <div
              className="absolute bottom-0 left-0 w-3 h-3 cursor-sw-resize"
              onPointerDown={(e) => handleResizePointerDown(e, 'sw')}
            />
            <div
              className="absolute bottom-0 right-0 w-3 h-3 cursor-se-resize"
              onPointerDown={(e) => handleResizePointerDown(e, 'se')}
            />
          </>
        )}
      </div>
    </>
  )
}

// Snap preview overlay
function SnapPreview({ zone }: { zone: SnapZone }) {
  const cw = typeof window !== 'undefined' ? window.innerWidth : 1920
  const ch = typeof window !== 'undefined' ? window.innerHeight - 56 : 1024

  let style: React.CSSProperties = {}

  if (zone === 'left') {
    style = { position: 'fixed', top: 0, left: 0, width: cw / 2, height: ch }
  } else if (zone === 'right') {
    style = { position: 'fixed', top: 0, left: cw / 2, width: cw / 2, height: ch }
  } else if (zone === 'top-left') {
    style = { position: 'fixed', top: 0, left: 0, width: cw / 2, height: ch / 2 }
  } else if (zone === 'top-right') {
    style = { position: 'fixed', top: 0, left: cw / 2, width: cw / 2, height: ch / 2 }
  } else if (zone === 'bottom-left') {
    style = { position: 'fixed', top: ch / 2, left: 0, width: cw / 2, height: ch / 2 }
  } else if (zone === 'bottom-right') {
    style = { position: 'fixed', top: ch / 2, left: cw / 2, width: cw / 2, height: ch / 2 }
  }

  return (
    <div
      className="fixed bg-primary/10 border-2 border-primary/40 rounded-lg pointer-events-none transition-all duration-150 z-[99999]"
      style={style}
    />
  )
}
