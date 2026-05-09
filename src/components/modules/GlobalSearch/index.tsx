'use client'

import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAppStore, type ModuleType } from '@/lib/store'
import { useTranslation } from '@/lib/i18n'
import { formatRSD } from '@/lib/helpers'
import {
  Search,
  Building2,
  Package,
  FileText,
  User,
  Users,
  ArrowRight,
  Clock,
  X,
  Loader2,
} from 'lucide-react'

// ============ TYPES ============

interface SearchResult {
  id: string
  name: string
  subtitle: string
  module: ModuleType
  icon: 'partner' | 'product' | 'invoice' | 'contact' | 'employee'
  meta?: {
    amount?: number
    status?: string
    email?: string
    phone?: string
  }
}

interface SearchGroup {
  type: string
  label: string
  icon: React.ReactNode
  results: SearchResult[]
}

const RECENT_KEY = 'rb_recent_searches'
const MAX_RECENT = 5

// ============ ICON HELPERS ============

function ResultIcon({
  type,
  className,
}: {
  type: string
  className?: string
}) {
  const classes = className || 'h-4 w-4'
  switch (type) {
    case 'partner':
      return <Building2 className={`${classes} text-amber-600`} />
    case 'product':
      return <Package className={`${classes} text-emerald-600`} />
    case 'invoice':
      return <FileText className={`${classes} text-violet-600`} />
    case 'contact':
      return <User className={`${classes} text-sky-600`} />
    case 'employee':
      return <Users className={`${classes} text-orange-600`} />
    default:
      return <Search className={`${classes} text-muted-foreground`} />
  }
}

function GroupIcon({ type, className }: { type: string; className?: string }) {
  const classes = className || 'h-4 w-4'
  switch (type) {
    case 'partners':
      return <Building2 className={`${classes} text-amber-600`} />
    case 'products':
      return <Package className={`${classes} text-emerald-600`} />
    case 'invoices':
      return <FileText className={`${classes} text-violet-600`} />
    case 'contacts':
      return <User className={`${classes} text-sky-600`} />
    case 'employees':
      return <Users className={`${classes} text-orange-600`} />
    default:
      return <Search className={`${classes} text-muted-foreground`} />
  }
}

// ============ MAIN COMPONENT ============

export function GlobalSearch() {
  const { t } = useTranslation()
  const { setActiveModule } = useAppStore()
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<SearchGroup[]>([])
  const [recentSearches, setRecentSearches] = useState<string[]>([])
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [activeFilter, setActiveFilter] = useState<string>('all')

  const inputRef = useRef<HTMLInputElement>(null)
  const overlayRef = useRef<HTMLDivElement>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Flatten all results for keyboard navigation
  const flatResults = useMemo(() => {
    return results.flatMap((group) => group.results)
  }, [results])

  // Load recent searches from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(RECENT_KEY)
      if (stored) {
        setRecentSearches(JSON.parse(stored))
      }
    } catch {
      // ignore
    }
  }, [])

  // Save recent search
  const saveRecentSearch = useCallback((term: string) => {
    if (!term.trim()) return
    setRecentSearches((prev) => {
      const updated = [term.trim(), ...prev.filter((s) => s !== term.trim())].slice(0, MAX_RECENT)
      try {
        localStorage.setItem(RECENT_KEY, JSON.stringify(updated))
      } catch {
        // ignore
      }
      return updated
    })
  }, [])

  // Remove recent search
  const removeRecentSearch = useCallback((term: string) => {
    setRecentSearches((prev) => {
      const updated = prev.filter((s) => s !== term)
      try {
        localStorage.setItem(RECENT_KEY, JSON.stringify(updated))
      } catch {
        // ignore
      }
      return updated
    })
  }, [])

  // Search API call
  const performSearch = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([])
      setLoading(false)
      return
    }

    setLoading(true)
    try {
      const res = await fetch(
        `/api/search?q=${encodeURIComponent(searchQuery.trim())}&type=${activeFilter}`
      )
      if (!res.ok) throw new Error('Search failed')
      const data = await res.json()

      const groups: SearchGroup[] = []

      if (data.partners?.length > 0) {
        groups.push({
          type: 'partners',
          label: t('sidebar.partners'),
          icon: <GroupIcon type="partners" />,
          results: data.partners.map((p: Record<string, unknown>) => ({
            id: p.id as string,
            name: p.name as string,
            subtitle: (p.pib || p.city || '') as string,
            module: 'partneri' as ModuleType,
            icon: 'partner' as const,
          })),
        })
      }

      if (data.products?.length > 0) {
        groups.push({
          type: 'products',
          label: t('sidebar.warehouse'),
          icon: <GroupIcon type="products" />,
          results: data.products.map((p: Record<string, unknown>) => ({
            id: p.id as string,
            name: p.name as string,
            subtitle: (p.sku || '') as string,
            module: 'magacin' as ModuleType,
            icon: 'product' as const,
            meta: { amount: p.price as number | undefined },
          })),
        })
      }

      if (data.invoices?.length > 0) {
        groups.push({
          type: 'invoices',
          label: t('sidebar.invoices'),
          icon: <GroupIcon type="invoices" />,
          results: data.invoices.map((inv: Record<string, unknown>) => ({
            id: inv.id as string,
            name: inv.number as string,
            subtitle: (inv.partner_name || inv.subtitle || '') as string,
            module: 'fakture' as ModuleType,
            icon: 'invoice' as const,
            meta: {
              amount: inv.amount as number | undefined,
              status: inv.status as string | undefined,
            },
          })),
        })
      }

      if (data.contacts?.length > 0) {
        groups.push({
          type: 'contacts',
          label: t('crm.contacts'),
          icon: <GroupIcon type="contacts" />,
          results: data.contacts.map((c: Record<string, unknown>) => ({
            id: c.id as string,
            name: c.name as string,
            subtitle: (c.company || c.email || '') as string,
            module: 'crm' as ModuleType,
            icon: 'contact' as const,
            meta: {
              email: c.email as string | undefined,
              phone: c.phone as string | undefined,
            },
          })),
        })
      }

      if (data.employees?.length > 0) {
        groups.push({
          type: 'employees',
          label: t('sidebar.employees'),
          icon: <GroupIcon type="employees" />,
          results: data.employees.map((e: Record<string, unknown>) => ({
            id: e.id as string,
            name: e.name as string,
            subtitle: (e.position || e.department || '') as string,
            module: 'zaposleni' as ModuleType,
            icon: 'employee' as const,
            meta: {
              email: e.email as string | undefined,
              phone: e.phone as string | undefined,
            },
          })),
        })
      }

      setResults(groups)
    } catch (err) {
      console.error('Search error:', err)
      setResults([])
    } finally {
      setLoading(false)
    }
  }, [activeFilter, t])

  // Debounced search
  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current)
    }

    if (!query.trim()) {
      setResults([])
      setLoading(false)
      return
    }

    setLoading(true)
    debounceRef.current = setTimeout(() => {
      performSearch(query)
    }, 200)

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current)
      }
    }
  }, [query, performSearch])

  // Reset selected index when results change
  useEffect(() => {
    setSelectedIndex(0)
  }, [results])

  // Keyboard shortcut to open
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setOpen((prev) => !prev)
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [])

  // Focus input when opened
  useEffect(() => {
    if (open) {
      // Small delay to let animation start
      requestAnimationFrame(() => {
        inputRef.current?.focus()
      })
    } else {
      setQuery('')
      setResults([])
      setSelectedIndex(0)
      setActiveFilter('all')
    }
  }, [open])

  // Handle result selection
  const handleSelect = useCallback(
    (result: SearchResult) => {
      saveRecentSearch(query)
      setActiveModule(result.module)
      setOpen(false)
    },
    [query, saveRecentSearch, setActiveModule]
  )

  // Keyboard navigation within the search panel
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        setOpen(false)
        return
      }

      if (e.key === 'ArrowDown') {
        e.preventDefault()
        setSelectedIndex((prev) => (prev < flatResults.length - 1 ? prev + 1 : 0))
        return
      }

      if (e.key === 'ArrowUp') {
        e.preventDefault()
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : flatResults.length - 1))
        return
      }

      if (e.key === 'Enter' && flatResults[selectedIndex]) {
        e.preventDefault()
        handleSelect(flatResults[selectedIndex])
        return
      }
    },
    [flatResults, selectedIndex, handleSelect]
  )

  // Filter tabs
  const filters = [
    { key: 'all', label: t('common.all') },
    { key: 'partners', label: t('sidebar.partners') },
    { key: 'products', label: t('warehouse.products') },
    { key: 'invoices', label: t('sidebar.invoices') },
    { key: 'contacts', label: t('crm.contacts') },
    { key: 'employees', label: t('sidebar.employees') },
  ]

  // Click on backdrop to close
  const handleBackdropClick = useCallback(
    (e: React.MouseEvent) => {
      if (e.target === overlayRef.current) {
        setOpen(false)
      }
    },
    []
  )

  // Track global result index for each group
  let globalIdx = 0

  return (
    <>
      {/* Overlay */}
      <AnimatePresence>
        {open && (
          <motion.div
            ref={overlayRef}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm"
            onClick={handleBackdropClick}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: -20 }}
              transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="mx-auto mt-[12vh] w-full max-w-2xl overflow-hidden rounded-2xl border border-border/50 bg-background shadow-2xl"
              onKeyDown={handleKeyDown}
            >
              {/* Search Input */}
              <div className="flex items-center gap-3 border-b border-border/50 px-5 py-4">
                <Search className="h-5 w-5 shrink-0 text-muted-foreground" />
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={t('search.placeholder') || 'Pretraži partnere, proizvode, fakture...'}
                  className="flex-1 bg-transparent text-base outline-none placeholder:text-muted-foreground"
                  spellCheck={false}
                  autoComplete="off"
                />
                {loading && (
                  <Loader2 className="h-4 w-4 shrink-0 animate-spin text-muted-foreground" />
                )}
                <kbd className="hidden rounded-md border border-border/60 bg-muted/60 px-2 py-0.5 font-mono text-xs text-muted-foreground sm:inline-flex">
                  ESC
                </kbd>
              </div>

              {/* Filter Tabs */}
              {query.trim() && (
                <div className="flex gap-1 overflow-x-auto border-b border-border/30 px-3 py-2">
                  {filters.map((filter) => (
                    <button
                      key={filter.key}
                      onClick={() => setActiveFilter(filter.key)}
                      className={`shrink-0 rounded-md px-3 py-1 text-xs font-medium transition-colors ${
                        activeFilter === filter.key
                          ? 'bg-primary text-primary-foreground'
                          : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                      }`}
                    >
                      {filter.label}
                    </button>
                  ))}
                </div>
              )}

              {/* Results Area */}
              <div className="max-h-[50vh] overflow-y-auto overscroll-contain">
                {query.trim() && !loading && results.length === 0 && (
                  <div className="px-5 py-12 text-center">
                    <p className="text-sm text-muted-foreground">
                      {t('common.noResults') || 'Nema rezultata za'} &ldquo;{query}&rdquo;
                    </p>
                  </div>
                )}

                {results.map((group) => (
                  <div key={group.type}>
                    {/* Group Header */}
                    <div className="sticky top-0 z-10 flex items-center gap-2 bg-background/95 px-5 py-2 backdrop-blur-sm">
                      {group.icon}
                      <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        {group.label}
                      </span>
                      <span className="ml-1 rounded-full bg-muted px-1.5 py-0.5 text-xs font-medium text-muted-foreground">
                        {group.results.length}
                      </span>
                    </div>

                    {/* Group Items */}
                    {group.results.map((result) => {
                      const currentIndex = globalIdx++
                      const isSelected = currentIndex === selectedIndex
                      return (
                        <button
                          key={result.id}
                          onClick={() => handleSelect(result)}
                          onMouseEnter={() => setSelectedIndex(currentIndex)}
                          className={`group flex w-full items-center gap-3 px-5 py-3 text-left transition-colors ${
                            isSelected
                              ? 'bg-accent'
                              : 'hover:bg-muted/50'
                          }`}
                        >
                          <div
                            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border ${
                              isSelected
                                ? 'border-primary/20 bg-primary/10'
                                : 'border-border/50 bg-muted/30'
                            }`}
                          >
                            <ResultIcon type={result.icon} />
                          </div>

                          <div className="min-w-0 flex-1">
                            <div className="flex items-center justify-between gap-2">
                              <span
                                className={`truncate text-sm font-medium ${
                                  isSelected ? 'text-foreground' : 'text-foreground/90'
                                }`}
                              >
                                {result.name}
                              </span>
                              {result.meta?.amount !== undefined && (
                                <span className="shrink-0 text-xs font-medium text-muted-foreground">
                                  {formatRSD(result.meta.amount)}
                                </span>
                              )}
                              {result.meta?.status && (
                                <span className="shrink-0 rounded-md border border-border/60 bg-muted/50 px-1.5 py-0.5 text-xs font-medium text-muted-foreground">
                                  {t(`common.${result.meta.status}`) || result.meta.status}
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                              <span className="truncate">{result.subtitle}</span>
                              {result.meta?.email && (
                                <>
                                  <span className="text-border">·</span>
                                  <span className="truncate">{result.meta.email}</span>
                                </>
                              )}
                              {result.meta?.phone && (
                                <>
                                  <span className="text-border">·</span>
                                  <span className="truncate">{result.meta.phone}</span>
                                </>
                              )}
                            </div>
                          </div>

                          <ArrowRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground/40 transition-transform group-hover:translate-x-0.5 group-hover:text-muted-foreground" />
                        </button>
                      )
                    })}
                  </div>
                ))}
              </div>

              {/* Recent Searches (shown when query is empty) */}
              {!query.trim() && recentSearches.length > 0 && (
                <div className="px-5 py-3">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                    <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      {t('search.recent') || 'Nedavne pretrage'}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {recentSearches.map((term) => (
                      <div
                        key={term}
                        className="group flex items-center gap-1.5 rounded-md border border-border/50 bg-muted/30 px-2.5 py-1.5 text-xs text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                      >
                        <button
                          onClick={() => {
                            setQuery(term)
                            inputRef.current?.focus()
                          }}
                          className="cursor-pointer"
                        >
                          {term}
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            removeRecentSearch(term)
                          }}
                          className="ml-0.5 rounded-sm p-0.5 opacity-0 transition-opacity hover:bg-muted-foreground/10 group-hover:opacity-100"
                        >
                          <X className="h-2.5 w-2.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Footer */}
              <div className="flex items-center justify-between border-t border-border/30 bg-muted/20 px-5 py-2.5">
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <kbd className="rounded border border-border/60 bg-muted/60 px-1 py-0.5 font-mono">
                      ↑↓
                    </kbd>
                    <span>{t('search.navigate') || 'Navigacija'}</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <kbd className="rounded border border-border/60 bg-muted/60 px-1 py-0.5 font-mono">
                      ↵
                    </kbd>
                    <span>{t('search.open') || 'Otvori'}</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <kbd className="rounded border border-border/60 bg-muted/60 px-1 py-0.5 font-mono">
                      esc
                    </kbd>
                    <span>{t('common.close') || 'Zatvori'}</span>
                  </span>
                </div>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Search className="h-3 w-3" />
                  <span>Reflection Business</span>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating trigger button in header area - shown as a visual cue */}
      <button
        onClick={() => setOpen(true)}
        className="flex h-8 items-center gap-1.5 rounded-md border border-input bg-background px-2.5 text-xs text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
      >
        <Search className="h-3.5 w-3.5" />
        <span className="hidden sm:inline">{t('search.placeholder') || 'Pretraži...'}</span>
        <kbd className="hidden ml-1 rounded border border-border/60 bg-muted/60 px-1 py-0.5 font-mono text-xs sm:inline-flex">
          ⌘K
        </kbd>
      </button>
    </>
  )
}
