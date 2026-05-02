'use client'

import { useWindowManager } from '@/lib/windowManager'
import { useTranslation } from '@/lib/i18n'
import { openAppLauncher } from '@/components/modules/AppLauncher'
import {
  LayoutGrid,
  Layers,
  Columns2,
  Menu,
} from 'lucide-react'

export function Dock() {
  const { windows, minimizeWindow, focusWindow, cascadeWindows, tileWindows, toggleStartMenu, startMenuOpen } =
    useWindowManager()
  const { t } = useTranslation()

  const handleWindowClick = (id: string) => {
    const win = windows.find((w) => w.id === id)
    if (win?.isMinimized) {
      focusWindow(id)
    } else {
      minimizeWindow(id)
    }
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 h-12 bg-background/80 backdrop-blur-md border-t border-border/50 flex items-center px-2 z-[100000] select-none">
      {/* Left — Start Menu button */}
      <button
        onClick={toggleStartMenu}
        className={`flex items-center justify-center w-10 h-10 rounded-lg hover:bg-accent transition-colors mr-1 ${
          startMenuOpen ? 'bg-accent text-accent-foreground' : ''
        }`}
        title="Meni modula"
      >
        <Menu className="w-4 h-4 text-muted-foreground" />
      </button>

      {/* Separator */}
      <div className="w-px h-6 bg-border/40 mx-1" />

      {/* Center — Window list */}
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
              {/* Active indicator */}
              {isActive && (
                <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-4 h-0.5 rounded-full bg-primary" />
              )}
            </button>
          )
        })}
      </div>

      {/* Separator */}
      <div className="w-px h-6 bg-border/40 mx-1" />

      {/* Right section */}
      <div className="flex items-center gap-0.5">
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

        {/* App launcher (fullscreen grid) */}
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
