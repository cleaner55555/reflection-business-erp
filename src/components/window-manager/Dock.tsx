'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useWindowManager, DOCK_HEIGHT, STATUS_BAR_HEIGHT } from '@/lib/windowManager'
import { menuGroups } from '@/components/modules/AppSidebar'
import { useTranslation } from '@/lib/i18n'
import {
  Grid3X3,
  Layers,
  Columns2,
  Settings,
  ChevronUp,
  X,
  Minimize,
} from 'lucide-react'

// Category accent colors based on menuGroups labelKey
const CATEGORY_COLORS: Record<string, string> = {
  'sidebar.group_overview': 'bg-blue-500',
  'sidebar.group_business': 'bg-emerald-500',
  'sidebar.group_crm': 'bg-rose-500',
  'sidebar.group_organization': 'bg-amber-500',
  'sidebar.group_analytics': 'bg-violet-500',
  'sidebar.group_education': 'bg-cyan-500',
  'sidebar.group_healthcare': 'bg-pink-500',
  'sidebar.group_hospitality': 'bg-orange-500',
  'sidebar.group_construction': 'bg-yellow-600',
  'sidebar.group_logistics': 'bg-sky-500',
  'sidebar.group_realestate': 'bg-teal-500',
  'sidebar.group_production': 'bg-indigo-500',
  'sidebar.group_retail': 'bg-lime-500',
  'sidebar.group_services': 'bg-fuchsia-500',
  'sidebar.group_system': 'bg-neutral-500',
}

function getModuleCategoryColor(moduleId: string): string {
  for (const group of menuGroups) {
    if (group.items.some((item) => item.module === moduleId)) {
      return CATEGORY_COLORS[group.labelKey] || 'bg-primary'
    }
  }
  return 'bg-primary'
}

export function Dock() {
  const {
    windows, closeWindow, minimizeWindow, focusWindow, cascadeWindows, tileWindows,
    toggleDrawer, drawerOpen, toggleSettings, desktopSettings,
    minimizeAllWindows, restoreAllWindows, allMinimized,
  } = useWindowManager()

  const { t } = useTranslation()

  const [time, setTime] = useState('')
  const [date, setDate] = useState('')
  const [hoveredWin, setHoveredWin] = useState<string | null>(null)
  const hoverTimeout = useRef<ReturnType<typeof setTimeout>>(null)
  const previewRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const tick = () => {
      const now = new Date()
      setTime(now.toLocaleTimeString('sr-Latn', { hour: '2-digit', minute: '2-digit', second: '2-digit' }))
      setDate(now.toLocaleDateString('sr-Latn', { day: 'numeric', month: 'short' }))
    }
    tick()
    const interval = setInterval(tick, 1000)
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

  const handleMiddleClick = (e: React.MouseEvent | React.PointerEvent, id: string) => {
    // Button 1 = middle mouse
    if (e.button === 1) {
      e.preventDefault()
      e.stopPropagation()
      closeWindow(id)
      setHoveredWin(null)
    }
  }

  const getModuleIcon = (moduleId: string) => {
    const item = allMenuItems.find((m) => m.module === moduleId)
    return item?.icon || Grid3X3
  }

  const isCompact = desktopSettings.dockStyle === 'compact'

  // Get the hovered window data for preview
  const hoveredWindow = hoveredWin ? windows.find((w) => w.id === hoveredWin) : null

  const isAllMin = allMinimized()

  const handleShowDesktop = () => {
    if (isAllMin) {
      restoreAllWindows()
    } else {
      minimizeAllWindows()
    }
  }

  return (
    <>
      {/* Hover preview popup above dock */}
      {hoveredWindow && (
        <div
          ref={previewRef}
          className="fixed z-[100005] pointer-events-auto"
          style={{
            bottom: DOCK_HEIGHT + 8,
            left: '50%',
            transform: 'translateX(-50%)',
          }}
          onClick={() => {
            if (hoveredWindow.isMinimized) {
              focusWindow(hoveredWindow.id)
            } else {
              focusWindow(hoveredWindow.id)
            }
            setHoveredWin(null)
          }}
        >
          <div
            className="bg-popover border border-border/60 rounded-xl shadow-2xl overflow-hidden backdrop-blur-xl"
            style={{ animation: 'dockPreviewIn 0.15s ease-out' }}
          >
            {/* Accent bar at top (only for non-minimized windows) */}
            {!hoveredWindow.isMinimized && (
              <div className={`h-[3px] w-full ${getModuleCategoryColor(hoveredWindow.moduleId)}`} />
            )}
            {hoveredWindow.isMinimized && (
              <div className="h-[3px] w-full bg-muted-foreground/20" />
            )}

            {/* Preview content area — 200×120px */}
            <div className="w-[200px] flex flex-col items-center justify-center bg-background/80 relative"
              style={{ height: hoveredWindow.isMinimized ? '120px' : '117px' }}
            >
              {/* Dimmed overlay for minimized windows */}
              {hoveredWindow.isMinimized && (
                <div className="absolute inset-0 bg-muted/30 rounded-b-xl" />
              )}

              <div className={`flex flex-col items-center gap-2 ${hoveredWindow.isMinimized ? 'opacity-50' : ''}`}>
                {/* Module icon — larger 24px */}
                {(() => {
                  const Icon = getModuleIcon(hoveredWindow.moduleId)
                  return (
                    <div className="w-10 h-10 rounded-lg bg-muted/60 flex items-center justify-center">
                      <Icon className="w-6 h-6 text-foreground/70" />
                    </div>
                  )
                })()}

                {/* Module title */}
                <span className="text-[11px] font-medium text-foreground/80 truncate max-w-[180px] text-center leading-tight">
                  {hoveredWindow.title}
                </span>

                {/* Window dimensions */}
                <span className="text-[9px] text-muted-foreground/60 font-mono">
                  {t('dock.dimensions', { width: hoveredWindow.width, height: hoveredWindow.height })}
                </span>

                {/* Minimized label */}
                {hoveredWindow.isMinimized && (
                  <span className="text-[9px] text-amber-500 font-medium mt-0.5">
                    {t('dock.clickToRestore')}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Keyframe for scale-up animation */}
          <style jsx global>{`
            @keyframes dockPreviewIn {
              from {
                opacity: 0;
                transform: scale(0.92) translateY(4px);
              }
              to {
                opacity: 1;
                transform: scale(1) translateY(0);
              }
            }
          `}</style>
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
          className={`relative flex items-center justify-center rounded-xl transition-all duration-150 min-h-[44px] min-w-[44px] ${
            isCompact ? 'w-10 h-10 sm:w-10 sm:h-10' : 'w-12 h-12'
          } ${drawerOpen ? 'bg-primary/10' : 'hover:bg-accent/60'}`}
          title={t('dock.allModules')}
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
                  onAuxClick={(e) => handleMiddleClick(e, win.id)}
                  className={`relative flex flex-col items-center justify-center rounded-xl transition-all duration-100 min-h-[44px] min-w-[44px] ${
                    isCompact ? 'w-10 h-10 sm:w-10 sm:h-10' : 'w-12 h-12'
                  } ${
                    isActive
                      ? 'bg-primary/10 ring-1 ring-primary/30'
                      : 'hover:bg-accent/40'
                  } ${win.isMinimized ? 'opacity-60' : ''}`}
                  title={win.title}
                >
                  <Icon className={`text-foreground/70 ${isCompact ? 'w-4 h-4' : 'w-5 h-5'}`} />
                  {/* Active indicator dot — brighter for active */}
                  {isActive && (
                    <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-3.5 h-[3px] rounded-full bg-primary shadow-[0_0_6px_rgba(var(--primary),0.5)]" />
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
                  title={t('dock.closeWindow')}
                >
                  <X className="w-2.5 h-2.5" />
                </button>
                {/* Hover underline glow — brighter and more prominent for active windows */}
                {isHovered && isActive && (
                  <div className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-7 h-[3px] rounded-full bg-primary/60 shadow-[0_0_8px_rgba(var(--primary),0.4)] transition-all duration-100" />
                )}
                {/* Subtle glow underneath active windows */}
                {isActive && !isHovered && (
                  <div className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-5 h-[2px] rounded-full bg-primary/30 transition-all duration-100" />
                )}
              </div>
            )
          })}

          {windows.length === 0 && (
            <div className="flex items-center gap-1 text-[10px] text-muted-foreground/40 px-2">
              <ChevronUp className="w-3 h-3" />
              <span>{t('dock.noWindows')}</span>
            </div>
          )}
        </div>

        {/* Show Desktop button area — separator + small button */}
        {windows.length > 0 && (
          <>
            <div className="mx-0.5 flex flex-col items-center justify-center h-full">
              <div className="w-px h-5 bg-border/30 rounded-full" />
            </div>
            <button
              onClick={handleShowDesktop}
              className={`flex items-center justify-center rounded-lg transition-all duration-150 min-h-[44px] min-w-[44px] ${
                isCompact ? 'w-7 h-7 sm:w-7 sm:h-7' : 'w-9 h-9'
              } ${isAllMin ? 'bg-amber-500/10 hover:bg-amber-500/20 text-amber-500' : 'hover:bg-accent/50 text-muted-foreground'}`}
              title={isAllMin ? t('dock.restoreWindows') : t('dock.showDesktop')}
            >
              <Minimize className={isCompact ? 'w-3 h-3' : 'w-3.5 h-3.5'} />
            </button>
          </>
        )}

        {/* Separator */}
        <div className={`mx-1 flex flex-col items-center ${isCompact ? 'py-2' : 'py-3'}`}>
          <div className="w-px h-full bg-border/20" />
        </div>

        {/* Right — Actions + System tray */}
        <div className="flex items-center gap-0.5">
          <button
            onClick={cascadeWindows}
            className={`flex items-center justify-center rounded-lg hover:bg-accent/50 transition-colors min-h-[44px] min-w-[44px] ${isCompact ? 'w-8 h-8 sm:w-8 sm:h-8' : 'w-10 h-10'}`}
            title={t('dock.cascade')}
          >
            <Layers className={`text-muted-foreground ${isCompact ? 'w-3.5 h-3.5' : 'w-4 h-4'}`} />
          </button>

          <button
            onClick={tileWindows}
            className={`flex items-center justify-center rounded-lg hover:bg-accent/50 transition-colors min-h-[44px] min-w-[44px] ${isCompact ? 'w-8 h-8 sm:w-8 sm:h-8' : 'w-10 h-10'}`}
            title={t('dock.tile')}
          >
            <Columns2 className={`text-muted-foreground ${isCompact ? 'w-3.5 h-3.5' : 'w-4 h-4'}`} />
          </button>

          <button
            onClick={toggleSettings}
            className={`flex items-center justify-center rounded-lg hover:bg-accent/50 transition-colors min-h-[44px] min-w-[44px] ${isCompact ? 'w-8 h-8 sm:w-8 sm:h-8' : 'w-10 h-10'}`}
            title={t('sidebar.settings')}
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
