'use client'

import { useWindowManager } from '@/lib/windowManager'
import { menuGroups } from '@/components/modules/AppSidebar'
import { useAppStore } from '@/lib/store'
import type { ModuleType } from '@/lib/store'
import { openAppLauncher } from '@/components/modules/AppLauncher'
import {
  LayoutGrid,
  Monitor,
  MonitorOff,
  Layers,
  Columns2,
  Plus,
  X,
} from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from '@/lib/i18n'

export function Dock() {
  const { windows, minimizeWindow, focusWindow, cascadeWindows, tileWindows, isDesktopMode, toggleDesktopMode } =
    useWindowManager()
  const { t } = useTranslation()
  const [showDesktopMenu, setShowDesktopMenu] = useState(false)

  const handleWindowClick = (id: string) => {
    const win = windows.find((w) => w.id === id)
    if (win?.isMinimized) {
      focusWindow(id)
    } else {
      minimizeWindow(id)
    }
  }

  const handleOpenModule = (module: ModuleType) => {
    const allMenuItems = menuGroups.flatMap((g) => g.items)
    const item = allMenuItems.find((m) => m.module === module)
    if (item) {
      const { openWindow } = useWindowManager.getState()
      openWindow(module, t(item.labelKey), module)
    }
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 h-14 bg-background/95 backdrop-blur-md border-t border-border/60 flex items-center px-2 z-[100000] select-none">
      {/* Desktop toggle */}
      <button
        onClick={toggleDesktopMode}
        className="flex items-center justify-center w-10 h-10 rounded-lg hover:bg-accent transition-colors mr-1"
        title={isDesktopMode ? 'Normalan režim' : 'Desktop režim'}
      >
        {isDesktopMode ? (
          <MonitorOff className="w-4 h-4 text-muted-foreground" />
        ) : (
          <Monitor className="w-4 h-4 text-muted-foreground" />
        )}
      </button>

      {/* Window list */}
      <div className="flex items-center gap-1 flex-1 overflow-x-auto px-1">
        {windows.map((win) => {
          const isActive = !win.isMinimized
          return (
            <button
              key={win.id}
              onClick={() => handleWindowClick(win.id)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium transition-all shrink-0 relative ${
                isActive
                  ? 'bg-accent text-accent-foreground'
                  : 'text-muted-foreground hover:bg-muted'
              }`}
              title={win.title}
            >
              <span className="truncate max-w-[120px]">{win.title}</span>
              {/* Active dot */}
              {isActive && (
                <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-4 h-0.5 rounded-full bg-primary" />
              )}
            </button>
          )
        })}
      </div>

      {/* Right section */}
      <div className="flex items-center gap-1">
        {/* Cascade */}
        <button
          onClick={cascadeWindows}
          className="flex items-center justify-center w-9 h-9 rounded-lg hover:bg-accent transition-colors"
          title="Kaskadno"
        >
          <Layers className="w-4 h-4 text-muted-foreground" />
        </button>

        {/* Tile */}
        <button
          onClick={tileWindows}
          className="flex items-center justify-center w-9 h-9 rounded-lg hover:bg-accent transition-colors"
          title="Pločice"
        >
          <Columns2 className="w-4 h-4 text-muted-foreground" />
        </button>

        {/* App launcher */}
        <button
          onClick={() => openAppLauncher()}
          className="flex items-center justify-center w-9 h-9 rounded-lg hover:bg-accent transition-colors"
          title="Prikaži sve module"
        >
          <LayoutGrid className="w-4 h-4 text-muted-foreground" />
        </button>
      </div>
    </div>
  )
}
