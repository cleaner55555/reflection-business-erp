'use client'

import { useWindowManager, type WallpaperStyle, type IconSize, type DockStyle, DEFAULT_SETTINGS } from '@/lib/windowManager'
import { useTranslation } from '@/lib/i18n'
import { X, Palette, Grid3X3, MonitorSmartphone, ArrowUpDown, Eye, EyeOff } from 'lucide-react'

const WALLPAPERS: { value: WallpaperStyle; label: string; preview: string }[] = [
  { value: 'gradient-blue', label: 'Plava', preview: 'bg-gradient-to-br from-blue-400/40 via-blue-200/30 to-cyan-100/40' },
  { value: 'gradient-green', label: 'Zelena', preview: 'bg-gradient-to-br from-emerald-400/40 via-green-200/30 to-teal-100/40' },
  { value: 'gradient-purple', label: 'Ljubičasta', preview: 'bg-gradient-to-br from-violet-400/40 via-purple-200/30 to-fuchsia-100/40' },
  { value: 'gradient-warm', label: 'Topla', preview: 'bg-gradient-to-br from-orange-300/40 via-amber-200/30 to-yellow-100/40' },
  { value: 'solid-dark', label: 'Tamna', preview: 'bg-neutral-900' },
  { value: 'solid-light', label: 'Svetla', preview: 'bg-neutral-100' },
  { value: 'dots', label: 'Tačkice', preview: 'bg-indigo-50' },
  { value: 'mesh', label: 'Mreža', preview: 'bg-gradient-to-br from-slate-100 to-slate-200' },
]

const ICON_SIZES: { value: IconSize; label: string; size: number }[] = [
  { value: 'small', label: 'Mali', size: 64 },
  { value: 'medium', label: 'Srednji', size: 88 },
  { value: 'large', label: 'Veliki', size: 108 },
]

const DOCK_STYLES: { value: DockStyle; label: string; desc: string }[] = [
  { value: 'compact', label: 'Kompaktan', desc: 'Samo ikone, tanak' },
  { value: 'expanded', label: 'Prošireni', desc: 'Ikone sa nazivima' },
]

export function DesktopSettingsPanel() {
  const { settingsOpen, setSettingsOpen, desktopSettings, updateDesktopSettings } = useWindowManager()
  const { t } = useTranslation()

  if (!settingsOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-[100030] bg-black/20" onClick={() => setSettingsOpen(false)} />

      {/* Settings dialog — centered, clean */}
      <div className="fixed inset-0 z-[100035] flex items-center justify-center p-4 pointer-events-none">
        <div
          className="bg-background/95 backdrop-blur-2xl border border-border/40 rounded-2xl shadow-2xl w-full max-w-md max-h-[80vh] flex flex-col overflow-hidden pointer-events-auto animate-in zoom-in-95 fade-in duration-200"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-border/30">
            <div className="flex items-center gap-2">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10">
                <Palette className="w-4 h-4 text-primary" />
              </div>
              <div>
                <h2 className="text-sm font-semibold text-foreground">Podešavanja desktopa</h2>
                <p className="text-xs text-muted-foreground">Prilagodi radno okruženje</p>
              </div>
            </div>
            <button
              onClick={() => setSettingsOpen(false)}
              className="flex items-center justify-center w-7 h-7 rounded-lg hover:bg-accent transition-colors"
            >
              <X className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-5 space-y-6">
            {/* Wallpaper */}
            <section>
              <div className="flex items-center gap-2 mb-3">
                <Palette className="w-4 h-4 text-muted-foreground" />
                <h3 className="text-xs font-semibold text-foreground uppercase tracking-wider">Pozadina</h3>
              </div>
              <div className="grid grid-cols-4 gap-2">
                {WALLPAPERS.map((wp) => (
                  <button
                    key={wp.value}
                    onClick={() => updateDesktopSettings({ wallpaper: wp.value })}
                    className={`relative flex flex-col items-center gap-1.5 p-2 rounded-xl transition-all ${
                      desktopSettings.wallpaper === wp.value
                        ? 'ring-2 ring-primary bg-primary/5'
                        : 'hover:bg-accent/50'
                    }`}
                  >
                    <div className={`w-full h-10 rounded-lg ${wp.preview}`} />
                    <span className="text-xs text-foreground/70">{wp.label}</span>
                  </button>
                ))}
              </div>
            </section>

            {/* Icon size */}
            <section>
              <div className="flex items-center gap-2 mb-3">
                <Grid3X3 className="w-4 h-4 text-muted-foreground" />
                <h3 className="text-xs font-semibold text-foreground uppercase tracking-wider">Veličina ikonica</h3>
              </div>
              <div className="flex gap-2">
                {ICON_SIZES.map((is) => (
                  <button
                    key={is.value}
                    onClick={() => updateDesktopSettings({ iconSize: is.value, gridSize: is.size })}
                    className={`flex-1 flex flex-col items-center gap-1 py-3 rounded-xl transition-all ${
                      desktopSettings.iconSize === is.value
                        ? 'ring-2 ring-primary bg-primary/5'
                        : 'hover:bg-accent/50'
                    }`}
                  >
                    <div
                      className="w-6 h-6 rounded-lg bg-foreground/10"
                      style={{ width: is.size / 5, height: is.size / 5 }}
                    />
                    <span className="text-xs text-foreground/70">{is.label}</span>
                  </button>
                ))}
              </div>
            </section>

            {/* Dock style */}
            <section>
              <div className="flex items-center gap-2 mb-3">
                <MonitorSmartphone className="w-4 h-4 text-muted-foreground" />
                <h3 className="text-xs font-semibold text-foreground uppercase tracking-wider">Stil taskbara</h3>
              </div>
              <div className="flex gap-2">
                {DOCK_STYLES.map((ds) => (
                  <button
                    key={ds.value}
                    onClick={() => updateDesktopSettings({ dockStyle: ds.value })}
                    className={`flex-1 py-3 px-3 rounded-xl transition-all text-left ${
                      desktopSettings.dockStyle === ds.value
                        ? 'ring-2 ring-primary bg-primary/5'
                        : 'hover:bg-accent/50'
                    }`}
                  >
                    <span className="text-xs font-medium text-foreground block">{ds.label}</span>
                    <span className="text-xs text-muted-foreground">{ds.desc}</span>
                  </button>
                ))}
              </div>
            </section>

            {/* Options */}
            <section>
              <div className="flex items-center gap-2 mb-3">
                <ArrowUpDown className="w-4 h-4 text-muted-foreground" />
                <h3 className="text-xs font-semibold text-foreground uppercase tracking-wider">Opcije</h3>
              </div>
              <div className="space-y-2">
                <label className="flex items-center justify-between py-2 px-3 rounded-xl hover:bg-accent/30 transition-colors cursor-pointer">
                  <div className="flex items-center gap-2">
                    {desktopSettings.showDesktopLabels ? <Eye className="w-4 h-4 text-muted-foreground" /> : <EyeOff className="w-4 h-4 text-muted-foreground" />}
                    <span className="text-xs text-foreground">Prikaži nazive ikonica</span>
                  </div>
                  <button
                    onClick={() => updateDesktopSettings({ showDesktopLabels: !desktopSettings.showDesktopLabels })}
                    className={`w-9 h-5 rounded-full transition-colors relative ${
                      desktopSettings.showDesktopLabels ? 'bg-primary' : 'bg-foreground/15'
                    }`}
                  >
                    <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-transform ${
                      desktopSettings.showDesktopLabels ? 'left-[18px]' : 'left-0.5'
                    }`} />
                  </button>
                </label>
                <label className="flex items-center justify-between py-2 px-3 rounded-xl hover:bg-accent/30 transition-colors cursor-pointer">
                  <div className="flex items-center gap-2">
                    <Grid3X3 className="w-4 h-4 text-muted-foreground" />
                    <span className="text-xs text-foreground">Pripijanje na mrežu</span>
                  </div>
                  <button
                    onClick={() => updateDesktopSettings({ snapToGrid: !desktopSettings.snapToGrid })}
                    className={`w-9 h-5 rounded-full transition-colors relative ${
                      desktopSettings.snapToGrid ? 'bg-primary' : 'bg-foreground/15'
                    }`}
                  >
                    <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-transform ${
                      desktopSettings.snapToGrid ? 'left-[18px]' : 'left-0.5'
                    }`} />
                  </button>
                </label>
              </div>
            </section>
          </div>
        </div>
      </div>
    </>
  )
}
