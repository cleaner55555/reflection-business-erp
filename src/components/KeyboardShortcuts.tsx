'use client'

import { useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { useAppStore, type ModuleType } from '@/lib/store'
import { useThemeStore } from '@/lib/theme'
import { I18nProvider, useTranslation } from '@/lib/i18n'

interface Shortcut {
  keys: string[]
  description: string
  category: string
  action?: () => void
}

const SHORTCUT_CATEGORIES = [
  { id: 'general', label: 'Opšte', labelEn: 'General' },
  { id: 'navigation', label: 'Navigacija', labelEn: 'Navigation' },
  { id: 'modules', label: 'Moduli', labelEn: 'Modules' },
  { id: 'actions', label: 'Akcije', labelEn: 'Actions' },
]

export function KeyboardShortcutsProvider({ children }: { children: React.ReactNode }) {
  const { setActiveModule } = useAppStore()
  const { toggleTheme } = useThemeStore(s => s)
  const [showHelp, setShowHelp] = useState(false)

  const shortcuts: Shortcut[] = [
    // General
    { keys: ['?'], description: 'Prikaži ovu pomoć', category: 'general', action: () => setShowHelp(true) },
    { keys: ['Escape'], description: 'Zatvori dijalog / pomoć', category: 'general', action: () => setShowHelp(false) },
    { keys: ['Ctrl', 'J'], description: 'AI Asistent', category: 'general' },
    { keys: ['Ctrl', 'K'], description: 'Pretraga', category: 'general' },
    { keys: ['Ctrl', 'D'], description: 'Desktop režim', category: 'general' },
    { keys: ['Ctrl', '/'], description: 'Promena teme', category: 'general', action: () => toggleTheme() },

    // Navigation
    { keys: ['Alt', '1'], description: 'Dashboard', category: 'navigation', action: () => setActiveModule('dashboard') },
    { keys: ['Alt', '2'], description: 'Fakture', category: 'navigation', action: () => setActiveModule('invoices') },
    { keys: ['Alt', '3'], description: 'Partneri', category: 'navigation', action: () => setActiveModule('contacts') },
    { keys: ['Alt', '4'], description: 'Magacin', category: 'navigation', action: () => setActiveModule('inventory') },
    { keys: ['Alt', '5'], description: 'Finansije', category: 'navigation', action: () => setActiveModule('finance') },
    { keys: ['Alt', '6'], description: 'CRM', category: 'navigation', action: () => setActiveModule('crm') },
    { keys: ['Alt', '7'], description: 'Projekti', category: 'navigation', action: () => setActiveModule('projects') },
    { keys: ['Alt', '8'], description: 'Zaposleni', category: 'navigation', action: () => setActiveModule('employees') },
    { keys: ['Alt', '9'], description: 'Podešavanja', category: 'navigation', action: () => setActiveModule('settings') },
  ]

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    // Don't trigger shortcuts when typing in inputs
    const target = e.target as HTMLElement
    if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT' || target.isContentEditable) {
      // Only allow Escape in inputs
      if (e.key === 'Escape') {
        target.blur()
      }
      return
    }

    // Check for shortcuts
    const ctrl = e.ctrlKey || e.metaKey
    const alt = e.altKey

    if (ctrl && e.key === 'j') {
      e.preventDefault()
      // AI Assistant is handled by its own component
      return
    }

    if (ctrl && e.key === 'k') {
      e.preventDefault()
      // Global Search is handled by its own component
      return
    }

    if (ctrl && e.key === 'd') {
      e.preventDefault()
      // Desktop mode is handled by its own component
      return
    }

    if (ctrl && e.key === '/') {
      e.preventDefault()
      toggleTheme()
      return
    }

    // ? key for help
    if (e.key === '?' || (e.shiftKey && e.key === '/')) {
      e.preventDefault()
      setShowHelp((prev) => !prev)
      return
    }

    // Escape to close help
    if (e.key === 'Escape' && showHelp) {
      setShowHelp(false)
      return
    }

    // Alt+number for module navigation
    if (alt && e.key >= '1' && e.key <= '9') {
      e.preventDefault()
      const shortcut = shortcuts.find(
        (s) => s.category === 'navigation' && s.keys[1] === e.key
      )
      shortcut?.action?.()
      return
    }
  }, [shortcuts, showHelp, toggleTheme, setActiveModule])

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])

  return (
    <>
      {children}
      <KeyboardShortcutsHelp
        open={showHelp}
        onOpenChange={setShowHelp}
        shortcuts={shortcuts}
      />
    </>
  )
}

function KeyboardShortcutsHelp({
  open,
  onOpenChange,
  shortcuts,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  shortcuts: Shortcut[]
}) {
  const categories = SHORTCUT_CATEGORIES

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <kbd className="inline-flex h-6 items-center rounded border bg-muted px-1.5 font-mono text-[10px] font-medium">
              ?
            </kbd>
            Prečice na tastaturi
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-6 mt-2">
          {categories.map((category) => {
            const categoryShortcuts = shortcuts.filter((s) => s.category === category.id)
            if (categoryShortcuts.length === 0) return null
            return (
              <div key={category.id}>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                  {category.label}
                </p>
                <div className="space-y-1.5">
                  {categoryShortcuts.map((shortcut, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between rounded-lg px-3 py-2 hover:bg-muted/50 transition-colors"
                    >
                      <span className="text-sm text-foreground">{shortcut.description}</span>
                      <div className="flex items-center gap-1">
                        {shortcut.keys.map((key, kIdx) => (
                          <span key={kIdx} className="flex items-center gap-1">
                            {kIdx > 0 && <span className="text-[10px] text-muted-foreground">+</span>}
                            <kbd className="inline-flex h-6 min-w-[24px] items-center justify-center rounded border border-border bg-muted px-1.5 font-mono text-[10px] font-medium text-foreground">
                              {key}
                            </kbd>
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
          <div className="rounded-lg border border-dashed border-muted-foreground/30 bg-muted/30 p-3 text-center">
            <p className="text-xs text-muted-foreground">
              Pritisnite <kbd className="inline-flex h-5 items-center rounded border bg-background px-1 font-mono text-[10px] mx-0.5">?</kbd> da otvorite ovu pomoć u bilo kom trenutku
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export function ShortcutHint({ shortcut }: { shortcut: string }) {
  return (
    <kbd className="inline-flex h-5 min-w-[20px] items-center justify-center rounded border border-border bg-muted/50 px-1 font-mono text-[10px] font-medium text-muted-foreground">
      {shortcut}
    </kbd>
  )
}
