'use client'

import { useState, useEffect } from 'react'
import { useWindowManager, DOCK_HEIGHT } from '@/lib/windowManager'
import { menuGroups } from '@/components/modules/AppSidebar'
import {
  Grid3X3,
  Layers,
  Columns2,
  Settings,
  Maximize2,
  ChevronUp,
} from 'lucide-react'

export function Dock() {
  const {
    windows, minimizeWindow, focusWindow, cascadeWindows, tileWindows,
    toggleDrawer, drawerOpen, toggleSettings, desktopSettings,
  } = useWindowManager()

  const [time, setTime] = useState('')
  const [date, setDate] = useState('')

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

  const getModuleIcon = (moduleId: string) => {
    const item = allMenuItems.find((m) => m.module === moduleId)
    return item?.icon || Grid3X3
  }

  const isCompact = desktopSettings.dockStyle === 'compact'

  return (
    <div
      className="fixed bottom-0 left-0 right-0 bg-background/70 backdrop-blur-2xl border-t border-border/30 flex items-center px-2 z-[100000] select-none"
      style={{ height: DOCK_HEIGHT }}
    >
      {/* Left — App Drawer trigger (Samsung-style grid icon) */}
      <button
        onClick={toggleDrawer}
        className={`relative flex items-center justify-center rounded-xl transition-all duration-150 ${
          isCompact ? 'w-10 h-10' : 'w-12 h-12'
        } ${drawerOpen ? 'bg-primary/10' : 'hover:bg-accent/60'}`}
        title="Svi moduli"
      >
        <Grid3X3 className={`text-muted-foreground ${isCompact ? 'w-4 h-4' : 'w-5 h-5'}`} />
        {/* Running indicator */}
        {windows.length > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[14px] h-[14px] flex items-center justify-center rounded-full bg-primary text-[8px] font-bold text-primary-foreground px-0.5">
            {windows.length}
          </span>
        )}
      </button>

      {/* Swipe up handle / separator */}
      <div className={`mx-1 flex flex-col items-center gap-0.5 ${isCompact ? 'py-2' : 'py-3'}`}>
        <div className="w-5 h-[3px] rounded-full bg-foreground/10" />
      </div>

      {/* Center — Running apps as icons (Samsung style) */}
      <div className="flex items-center gap-0.5 flex-1 overflow-x-auto px-1 py-1">
        {windows.map((win) => {
          const Icon = getModuleIcon(win.moduleId)
          const isActive = !win.isMinimized
          return (
            <button
              key={win.id}
              onClick={() => handleWindowClick(win.id)}
              className={`relative flex flex-col items-center justify-center rounded-xl transition-all duration-100 shrink-0 ${
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
              {/* Expanded label */}
              {!isCompact && (
                <span className="text-[8px] font-medium text-foreground/60 truncate max-w-[44px] mt-px">
                  {win.title}
                </span>
              )}
            </button>
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
        {/* Cascade */}
        <button
          onClick={cascadeWindows}
          className={`flex items-center justify-center rounded-lg hover:bg-accent/50 transition-colors ${isCompact ? 'w-8 h-8' : 'w-10 h-10'}`}
          title="Kaskadno"
        >
          <Layers className={`text-muted-foreground ${isCompact ? 'w-3.5 h-3.5' : 'w-4 h-4'}`} />
        </button>

        {/* Tile */}
        <button
          onClick={tileWindows}
          className={`flex items-center justify-center rounded-lg hover:bg-accent/50 transition-colors ${isCompact ? 'w-8 h-8' : 'w-10 h-10'}`}
          title="Pločice"
        >
          <Columns2 className={`text-muted-foreground ${isCompact ? 'w-3.5 h-3.5' : 'w-4 h-4'}`} />
        </button>

        {/* Settings */}
        <button
          onClick={toggleSettings}
          className={`flex items-center justify-center rounded-lg hover:bg-accent/50 transition-colors ${isCompact ? 'w-8 h-8' : 'w-10 h-10'}`}
          title="Podešavanja"
        >
          <Settings className={`text-muted-foreground ${isCompact ? 'w-3.5 h-3.5' : 'w-4 h-4'}`} />
        </button>

        {/* System tray — time */}
        <div className={`flex flex-col items-end justify-center ml-1 ${isCompact ? 'px-1' : 'px-2'}`}>
          <span className="text-[10px] font-medium text-foreground/60 leading-tight">{time}</span>
          {!isCompact && (
            <span className="text-[8px] text-muted-foreground/40 leading-tight">{date}</span>
          )}
        </div>
      </div>
    </div>
  )
}
