'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useWindowManager, DOCK_HEIGHT, STATUS_BAR_HEIGHT } from '@/lib/windowManager'
import { menuGroups } from '@/components/modules/AppSidebar'
import {
  Grid3X3,
  Layers,
  Columns2,
  Settings,
  ChevronUp,
  X,
} from 'lucide-react'

export function Dock() {
  const {
    windows, closeWindow, minimizeWindow, focusWindow, cascadeWindows, tileWindows,
    toggleDrawer, drawerOpen, toggleSettings, desktopSettings,
  } = useWindowManager()

  const [time, setTime] = useState('')
  const [date, setDate] = useState('')
  const [hoveredWin, setHoveredWin] = useState<string | null>(null)
  const hoverTimeout = useRef<ReturnType<typeof setTimeout>>(null)

  useEffect(() => {
    const tick = () => {
      const now = new Date()
      setTime(now.toLocaleTimeString('sr-Latn', { hour: '2-digit', minute: '2-digit' }))
      setDate(now.toLocaleDateString('sr-Latn', { day: 'numeric', month: 'short' }))
    }
    tick()
    const interval = setInterval(tick, 10000)
    return () => clearInterval(interval)
  }, [])

  const allMenuItems = menuGroups.flatMap((g) => g.items)

  const handleWindowClick = (id: string) => {
    const win = windows.find((w) => w.id === id)
    if (win?.isMinimized) focusWindow(id)
    else minimizeWindow(id)
  }

  const handleClose = (e: React.MouseEvent, id: string) => {
    e.stopPropagation()
    e.preventDefault()
    closeWindow(id)
    setHoveredWin(null)
  }

  const getModuleIcon = (moduleId: string) => {
    const item = allMenuItems.find((m) => m.module === moduleId)
    return item?.icon || Grid3X3
  }

  const isCompact = desktopSettings.dockStyle === 'compact'

  // Get the hovered window data for preview
  const hoveredWindow = hoveredWin ? windows.find((w) => w.id === hoveredWin) : null

  return (
    <>
      {/* Hover preview popup above dock */}
      {hoveredWindow && !hoveredWindow.isMinimized && (
        <div
          className="fixed z-[100005] pointer-events-none"
          style={{
            // Position above the dock tab — we'll calculate from the tab's position
            bottom: DOCK_HEIGHT + 8,
            left: '50%',
            transform: 'translateX(-50%)',
          }}
        >
          <div className="bg-popover border border-border/60 rounded-xl shadow-2xl overflow-hidden backdrop-blur-xl animate-in fade-in slide-in-from-bottom-2 duration-150">
            {/* Mini title bar */}
            <div className="flex items-center h-6 px-2 bg-muted/60 border-b border-border/30">
              {(() => {
                const Icon = getModuleIcon(hoveredWindow.moduleId)
                return <Icon className="w-3 h-3 text-muted-foreground mr-1.5" />
              })()}
              <span className="text-[9px] font-medium text-foreground/70 truncate flex-1">
                {hoveredWindow.title}
              </span>
            </div>
            {/* Mini content preview area */}
            <div className="w-[180px] h-[100px] bg-background/80 flex items-center justify-center">
              <span className="text-[10px] text-muted-foreground/50">Pregled</span>
            </div>
          </div>
        </div>
      )}

      {/* ===== DOCK BAR ===== */}
      <div
        className="fixed bottom-0 left-0 right-0 bg-background/70 backdrop-blur-2xl border-t border-border/30 flex items-center px-2 z-[100000] select-none"
        style={{ height: DOCK_HEIGHT }}
      >
        {/* Left — App Drawer trigger */}
        <button
          onClick={toggleDrawer}
          className={`relative flex items-center justify-center rounded-xl transition-all duration-150 ${
            isCompact ? 'w-10 h-10' : 'w-12 h-12'
          } ${drawerOpen ? 'bg-primary/10' : 'hover:bg-accent/60'}`}
          title="Svi moduli"
        >
          <Grid3X3 className={`text-muted-foreground ${isCompact ? 'w-4 h-4' : 'w-5 h-5'}`} />
          {windows.length > 0 && (
            <span className="absolute -top-0.5 -right-0.5 min-w-[14px] h-[14px] flex items-center justify-center rounded-full bg-primary text-[8px] font-bold text-primary-foreground px-0.5">
              {windows.length}
            </span>
          )}
        </button>

        {/* Separator */}
        <div className={`mx-1 flex flex-col items-center gap-0.5 ${isCompact ? 'py-2' : 'py-3'}`}>
          <div className="w-5 h-[3px] rounded-full bg-foreground/10" />
        </div>

        {/* Center — Running apps */}
        <div className="flex items-center gap-0.5 flex-1 overflow-x-auto px-1 py-1 scrollbar-none">
          {windows.map((win) => {
            const Icon = getModuleIcon(win.moduleId)
            const isActive = !win.isMinimized
            const isHovered = hoveredWin === win.id
            return (
              <div
                key={win.id}
                className="relative shrink-0 group"
                onMouseEnter={() => {
                  if (hoverTimeout.current) clearTimeout(hoverTimeout.current)
                  setHoveredWin(win.id)
                }}
                onMouseLeave={() => {
                  hoverTimeout.current = setTimeout(() => setHoveredWin(null), 300)
                }}
              >
                <button
                  onClick={() => handleWindowClick(win.id)}
                  className={`relative flex flex-col items-center justify-center rounded-xl transition-all duration-100 ${
                    isCompact ? 'w-10 h-10' : 'w-12 h-12'
                  } ${
                    isActive
                      ? 'bg-primary/10 ring-1 ring-primary/30'
                      : 'hover:bg-accent/40'
                  }`}
                  title={win.title}
                >
                  <Icon className={`text-foreground/70 ${isCompact ? 'w-4 h-4' : 'w-5 h-5'}`} />
                  {isActive && (
                    <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-3 h-[3px] rounded-full bg-primary" />
                  )}
                  {!isCompact && (
                    <span className="text-[8px] font-medium text-foreground/60 truncate max-w-[44px] mt-px">
                      {win.title}
                    </span>
                  )}
                </button>
                {/* Close button — appears on hover */}
                <button
                  onClick={(e) => handleClose(e, win.id)}
                  className={`absolute -top-1 -right-1 w-4 h-4 rounded-full bg-destructive/90 hover:bg-destructive text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-100 shadow-sm z-10`}
                  title="Zatvori"
                >
                  <X className="w-2.5 h-2.5" />
                </button>
                {/* Hover underline glow */}
                {isHovered && isActive && (
                  <div className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-6 h-[2px] rounded-full bg-primary/50 transition-all duration-100" />
                )}
              </div>
            )
          })}

          {windows.length === 0 && (
            <div className="flex items-center gap-1 text-[10px] text-muted-foreground/40 px-2">
              <ChevronUp className="w-3 h-3" />
              <span>Povuci za module</span>
            </div>
          )}
        </div>

        {/* Separator */}
        <div className={`mx-1 flex flex-col items-center ${isCompact ? 'py-2' : 'py-3'}`}>
          <div className="w-px h-full bg-border/20" />
        </div>

        {/* Right — Actions + System tray */}
        <div className="flex items-center gap-0.5">
          <button
            onClick={cascadeWindows}
            className={`flex items-center justify-center rounded-lg hover:bg-accent/50 transition-colors ${isCompact ? 'w-8 h-8' : 'w-10 h-10'}`}
            title="Kaskadno"
          >
            <Layers className={`text-muted-foreground ${isCompact ? 'w-3.5 h-3.5' : 'w-4 h-4'}`} />
          </button>

          <button
            onClick={tileWindows}
            className={`flex items-center justify-center rounded-lg hover:bg-accent/50 transition-colors ${isCompact ? 'w-8 h-8' : 'w-10 h-10'}`}
            title="Pločice"
          >
            <Columns2 className={`text-muted-foreground ${isCompact ? 'w-3.5 h-3.5' : 'w-4 h-4'}`} />
          </button>

          <button
            onClick={toggleSettings}
            className={`flex items-center justify-center rounded-lg hover:bg-accent/50 transition-colors ${isCompact ? 'w-8 h-8' : 'w-10 h-10'}`}
            title="Podešavanja"
          >
            <Settings className={`text-muted-foreground ${isCompact ? 'w-3.5 h-3.5' : 'w-4 h-4'}`} />
          </button>

          <div className={`flex flex-col items-end justify-center ml-1 ${isCompact ? 'px-1' : 'px-2'}`}>
            <span className="text-[10px] font-medium text-foreground/60 leading-tight">{time}</span>
            {!isCompact && (
              <span className="text-[8px] text-muted-foreground/40 leading-tight">{date}</span>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
