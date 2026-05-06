'use client'

import { type RefObject } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
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
import { useTranslation } from '@/lib/i18n'
import { formatRSD } from '@/lib/helpers'
import type { SearchResult, SearchGroup, SearchFilter } from './types'

// ============ ICON HELPERS ============

export function ResultIcon({
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

export function GroupIcon({
  type,
  className,
}: {
  type: string
  className?: string
}) {
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

// ============ SEARCH TRIGGER BUTTON ============

export function SearchTriggerButton({ onClick }: { onClick: () => void }) {
  const { t } = useTranslation()
  return (
    <button
      onClick={onClick}
      className="flex h-8 items-center gap-1.5 rounded-md border border-input bg-background px-2.5 text-xs text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
    >
      <Search className="h-3.5 w-3.5" />
      <span className="hidden sm:inline">
        {t('search.placeholder') || 'Pretraži...'}
      </span>
      <kbd className="hidden ml-1 rounded border border-border/60 bg-muted/60 px-1 py-0.5 font-mono text-[10px] sm:inline-flex">
        ⌘K
      </kbd>
    </button>
  )
}

// ============ SEARCH INPUT ============

export function SearchInput({
  inputRef,
  query,
  onQueryChange,
  loading,
}: {
  inputRef: RefObject<HTMLInputElement | null>
  query: string
  onQueryChange: (value: string) => void
  loading: boolean
}) {
  const { t } = useTranslation()
  return (
    <div className="flex items-center gap-3 border-b border-border/50 px-5 py-4">
      <Search className="h-5 w-5 shrink-0 text-muted-foreground" />
      <input
        ref={inputRef}
        type="text"
        value={query}
        onChange={(e) => onQueryChange(e.target.value)}
        placeholder={
          t('search.placeholder') || 'Pretraži partnere, proizvode, fakture...'
        }
        className="flex-1 bg-transparent text-base outline-none placeholder:text-muted-foreground"
        spellCheck={false}
        autoComplete="off"
      />
      {loading && (
        <Loader2 className="h-4 w-4 shrink-0 animate-spin text-muted-foreground" />
      )}
      <kbd className="hidden rounded-md border border-border/60 bg-muted/60 px-2 py-0.5 font-mono text-[11px] text-muted-foreground sm:inline-flex">
        ESC
      </kbd>
    </div>
  )
}

// ============ FILTER TABS ============

export function FilterTabs({
  visible,
  filters,
  activeFilter,
  onFilterChange,
}: {
  visible: boolean
  filters: SearchFilter[]
  activeFilter: string
  onFilterChange: (key: string) => void
}) {
  const { t } = useTranslation()
  if (!visible) return null
  return (
    <div className="flex gap-1 overflow-x-auto border-b border-border/30 px-3 py-2">
      {filters.map((filter) => (
        <button
          key={filter.key}
          onClick={() => onFilterChange(filter.key)}
          className={`shrink-0 rounded-md px-3 py-1 text-xs font-medium transition-colors ${
            activeFilter === filter.key
              ? 'bg-primary text-primary-foreground'
              : 'text-muted-foreground hover:bg-muted hover:text-foreground'
          }`}
        >
          {t(filter.label)}
        </button>
      ))}
    </div>
  )
}

// ============ RESULT ITEM ============

export function SearchResultItem({
  result,
  isSelected,
  onSelect,
  onHover,
}: {
  result: SearchResult
  isSelected: boolean
  onSelect: (result: SearchResult) => void
  onHover: () => void
}) {
  const { t } = useTranslation()
  return (
    <button
      onClick={() => onSelect(result)}
      onMouseEnter={onHover}
      className={`group flex w-full items-center gap-3 px-5 py-3 text-left transition-colors ${
        isSelected ? 'bg-accent' : 'hover:bg-muted/50'
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
            <span className="shrink-0 rounded-md border border-border/60 bg-muted/50 px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
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
}

// ============ SEARCH RESULTS ============

export function SearchResults({
  query,
  loading,
  results,
  selectedIndex,
  onSelect,
  onHover,
}: {
  query: string
  loading: boolean
  results: SearchGroup[]
  selectedIndex: number
  onSelect: (result: SearchResult) => void
  onHover: (index: number) => void
}) {
  const { t } = useTranslation()
  let globalIdx = 0

  return (
    <div className="max-h-[50vh] overflow-y-auto overscroll-contain">
      {query.trim() && !loading && results.length === 0 && (
        <div className="px-5 py-12 text-center">
          <p className="text-sm text-muted-foreground">
            {t('common.noResults') || 'Nema rezultata za'} &ldquo;{query}
            &rdquo;
          </p>
        </div>
      )}

      {results.map((group) => (
        <div key={group.type}>
          {/* Group Header */}
          <div className="sticky top-0 z-10 flex items-center gap-2 bg-background/95 px-5 py-2 backdrop-blur-sm">
            <GroupIcon type={group.type} />
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {t(group.label)}
            </span>
            <span className="ml-1 rounded-full bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
              {group.results.length}
            </span>
          </div>

          {/* Group Items */}
          {group.results.map((result) => {
            const currentIndex = globalIdx++
            return (
              <SearchResultItem
                key={result.id}
                result={result}
                isSelected={currentIndex === selectedIndex}
                onSelect={onSelect}
                onHover={() => onHover(currentIndex)}
              />
            )
          })}
        </div>
      ))}
    </div>
  )
}

// ============ RECENT SEARCHES ============

export function RecentSearches({
  terms,
  onSelect,
  onRemove,
}: {
  terms: string[]
  onSelect: (term: string) => void
  onRemove: (term: string) => void
}) {
  const { t } = useTranslation()
  if (terms.length === 0) return null

  return (
    <div className="px-5 py-3">
      <div className="mb-2 flex items-center gap-2">
        <Clock className="h-3.5 w-3.5 text-muted-foreground" />
        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {t('search.recent') || 'Nedavne pretrage'}
        </span>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {terms.map((term) => (
          <div
            key={term}
            className="group flex items-center gap-1.5 rounded-md border border-border/50 bg-muted/30 px-2.5 py-1.5 text-xs text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <button onClick={() => onSelect(term)} className="cursor-pointer">
              {term}
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation()
                onRemove(term)
              }}
              className="ml-0.5 rounded-sm p-0.5 opacity-0 transition-opacity hover:bg-muted-foreground/10 group-hover:opacity-100"
            >
              <X className="h-2.5 w-2.5" />
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}

// ============ SEARCH OVERLAY ============

export interface SearchOverlayProps {
  open: boolean
  overlayRef: RefObject<HTMLDivElement | null>
  inputRef: RefObject<HTMLInputElement | null>
  query: string
  loading: boolean
  results: SearchGroup[]
  selectedIndex: number
  activeFilter: string
  filters: SearchFilter[]
  recentSearches: string[]
  onQueryChange: (value: string) => void
  onFilterChange: (key: string) => void
  onSelect: (result: SearchResult) => void
  onHover: (index: number) => void
  onSelectRecent: (term: string) => void
  onRemoveRecent: (term: string) => void
  onKeyDown: (e: React.KeyboardEvent) => void
  onBackdropClick: (e: React.MouseEvent) => void
}

export function SearchOverlay({
  open,
  overlayRef,
  inputRef,
  query,
  loading,
  results,
  selectedIndex,
  activeFilter,
  filters,
  recentSearches,
  onQueryChange,
  onFilterChange,
  onSelect,
  onHover,
  onSelectRecent,
  onRemoveRecent,
  onKeyDown,
  onBackdropClick,
}: SearchOverlayProps) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          ref={overlayRef}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm"
          onClick={onBackdropClick}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -20 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="mx-auto mt-[12vh] w-full max-w-2xl overflow-hidden rounded-2xl border border-border/50 bg-background shadow-2xl"
            onKeyDown={onKeyDown}
          >
            <SearchInput
              inputRef={inputRef}
              query={query}
              onQueryChange={onQueryChange}
              loading={loading}
            />
            <FilterTabs
              visible={!!query.trim()}
              filters={filters}
              activeFilter={activeFilter}
              onFilterChange={onFilterChange}
            />
            <SearchResults
              query={query}
              loading={loading}
              results={results}
              selectedIndex={selectedIndex}
              onSelect={onSelect}
              onHover={onHover}
            />
            {!query.trim() && (
              <RecentSearches
                terms={recentSearches}
                onSelect={onSelectRecent}
                onRemove={onRemoveRecent}
              />
            )}
            <SearchFooter />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// ============ FOOTER ============

export function SearchFooter() {
  const { t } = useTranslation()
  return (
    <div className="flex items-center justify-between border-t border-border/30 bg-muted/20 px-5 py-2.5">
      <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
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
      <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
        <Search className="h-3 w-3" />
        <span>Reflection Business</span>
      </div>
    </div>
  )
}
