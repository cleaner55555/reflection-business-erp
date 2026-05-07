'use client'

import { useState } from 'react'

import { Check, Search } from 'lucide-react'
import { cn } from '@/lib/helpers'
import { useTranslation, ALL_LANGUAGES } from '@/lib/i18n'
import type { ModuleDef, CompanySettings, GeneralSettings, AppSettingResponse } from './types'

function ActiveLanguagesPicker({ activeCodes, onToggle }: { activeCodes: string[]; onToggle: (code: string) => void }) {
  const [search, setSearch] = useState('')
  const { t } = useTranslation()

  const filtered = search.length > 0
    ? ALL_LANGUAGES.filter(
        (l) =>
          l.nativeName.toLowerCase().includes(search.toLowerCase()) ||
          l.englishName.toLowerCase().includes(search.toLowerCase())
      )
    : ALL_LANGUAGES

  // Group by region
  const regionRanges: Array<{ label: string; start: number; end: number }> = [
    { label: 'Evropa', start: 0, end: 45 },
    { label: 'Azija', start: 45, end: 72 },
    { label: 'Afrika', start: 72, end: 80 },
    { label: 'Amerike', start: 80, end: 86 },
    { label: 'Okeanija', start: 86, end: 90 },
    { label: 'Ostalo', start: 90, end: ALL_LANGUAGES.length },
  ]

  return (
    <div>
      <div className="relative mb-3">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={t('common.search') || 'Pretraga...'}
          className="flex h-9 w-full rounded-md border border-input bg-background pl-9 pr-3 py-1 text-sm outline-none focus:ring-2 focus:ring-ring"
        />
      </div>
      <div className="max-h-64 overflow-y-auto rounded-md border divide-y">
        {filtered.length === 0 && (
          <div className="py-6 text-center text-sm text-muted-foreground">{t('common.noResults')}</div>
        )}
        {regionRanges
          .filter((r) => filtered.some((l) => ALL_LANGUAGES.indexOf(l) >= r.start && ALL_LANGUAGES.indexOf(l) < r.end))
          .map((region) => (
            <div key={region.label}>
              <div className="px-3 py-1.5 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider bg-muted/50 sticky top-0">
                {region.label}
              </div>
              {filtered
                .filter((l) => {
                  const idx = ALL_LANGUAGES.indexOf(l)
                  return idx >= region.start && idx < region.end
                })
                .map((lang) => {
                  const isActive = activeCodes.includes(lang.code)
                  return (
                    <button
                      key={lang.code}
                      type="button"
                      onClick={() => onToggle(lang.code)}
                      className={cn(
                        'flex w-full items-center gap-2.5 px-3 py-2 text-sm hover:bg-accent/50 transition-colors',
                        isActive && 'bg-primary/5'
                      )}
                    >
                      <div
                        className={cn(
                          'flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-colors',
                          isActive
                            ? 'border-primary bg-primary text-primary-foreground'
                            : 'border-muted-foreground/30'
                        )}
                      >
                        {isActive && <Check className="h-3 w-3" />}
                      </div>
                      <span className="shrink-0 text-base">{lang.flag}</span>
                      <span className="flex-1 text-left truncate">{lang.nativeName}</span>
                      <span className="text-xs text-muted-foreground shrink-0">{lang.englishName}</span>
                    </button>
                  )
                })}
            </div>
          ))}
      </div>
    </div>
  )
}
