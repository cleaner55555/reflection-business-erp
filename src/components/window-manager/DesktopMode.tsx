'use client'

import { useWindowManager } from '@/lib/windowManager'
import { useAppStore } from '@/lib/store'
import { useTranslation } from '@/lib/i18n'
import { menuGroups } from '@/components/modules/AppSidebar'
import { WindowFrame } from './WindowFrame'
import { Dock } from './Dock'
import {
  Wallet,
  FileText,
  Warehouse,
  Users,
  BarChart3,
  Settings,
  LayoutGrid,
} from 'lucide-react'
import type { ModuleType } from '@/lib/store'

const DESKTOP_SHORTCUTS: ModuleType[] = [
  'dashboard',
  'finansije',
  'fakture',
  'magacin',
  'crm',
  'izvestaji',
  'podesavanja',
]

const shortcutIcons: Record<string, React.ElementType> = {
  dashboard: LayoutGrid,
  finansije: Wallet,
  fakture: FileText,
  magacin: Warehouse,
  crm: Users,
  izvestaji: BarChart3,
  podesavanja: Settings,
}

export function DesktopMode() {
  const { windows, openWindow } = useWindowManager()
  const { t } = useTranslation()
  const allMenuItems = menuGroups.flatMap((g) => g.items)

  const handleDesktopDoubleClick = (module: ModuleType) => {
    const item = allMenuItems.find((m) => m.module === module)
    const label = item ? t(item.labelKey) : String(module)
    openWindow(module, label, module)
  }

  // Get all unique open windows for this desktop
  const visibleWindows = windows.filter((w) => !w.isMinimized)

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-muted/60 via-background to-muted/40 overflow-hidden">
      {/* Desktop icons grid */}
      <div className="absolute top-4 left-4 flex flex-col flex-wrap gap-1 max-h-[calc(100vh-80px)]">
        {DESKTOP_SHORTCUTS.map((mod) => {
          const Icon = shortcutIcons[mod] || LayoutGrid
          const item = allMenuItems.find((m) => m.module === mod)
          const label = item ? t(item.labelKey) : String(mod)
          const isOpen = windows.some((w) => w.moduleId === mod && !w.isMinimized)

          return (
            <button
              key={mod}
              onDoubleClick={() => handleDesktopDoubleClick(mod)}
              className="flex flex-col items-center justify-center w-20 h-20 rounded-lg hover:bg-accent/50 transition-colors group"
              title={label}
            >
              <div
                className={`flex items-center justify-center w-11 h-11 rounded-lg mb-1 transition-colors ${
                  isOpen
                    ? 'bg-primary/20 text-primary'
                    : 'bg-background/80 text-foreground/80 group-hover:bg-background'
                }`}
              >
                <Icon className="w-6 h-6" />
              </div>
              <span className="text-[10px] font-medium text-foreground/80 leading-tight text-center line-clamp-2 px-1">
                {label}
              </span>
            </button>
          )
        })}
      </div>

      {/* Windows */}
      {visibleWindows.map((win) => (
        <WindowFrame key={win.id} windowData={win} />
      ))}

      {/* Dock at bottom */}
      <Dock />
    </div>
  )
}
