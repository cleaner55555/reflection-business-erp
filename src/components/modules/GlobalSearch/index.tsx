'use client'

import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { useAppStore } from '@/lib/store'
import type { SearchResult, SearchGroup } from './types'
import { RECENT_KEY, MAX_RECENT, getFilters, fetchSearchResults } from './data'
import { SearchTriggerButton, SearchOverlay } from './components'

export function GlobalSearch() {
  const { setActiveModule } = useAppStore()
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<SearchGroup[]>([])
  const [recentSearches, setRecentSearches] = useState<string[]>([])
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [activeFilter, setActiveFilter] = useState('all')

  const inputRef = useRef<HTMLInputElement>(null)
  const overlayRef = useRef<HTMLDivElement>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const flatResults = useMemo(
    () => results.flatMap((group) => group.results),
    [results],
  )

  const filters = useMemo(() => getFilters(), [])

  // ---- localStorage: load recent searches ----
  useEffect(() => {
    try {
      const stored = localStorage.getItem(RECENT_KEY)
      if (stored) setRecentSearches(JSON.parse(stored))
    } catch {
      // ignore
    }
  }, [])

  // ---- helpers ----
  const saveRecentSearch = useCallback((term: string) => {
    if (!term.trim()) return
    setRecentSearches((prev) => {
      const updated = [term.trim(), ...prev.filter((s) => s !== term.trim())].slice(
        0,
        MAX_RECENT,
      )
      try { localStorage.setItem(RECENT_KEY, JSON.stringify(updated)) } catch { /* ignore */ }
      return updated
    })
  }, [])

  const removeRecentSearch = useCallback((term: string) => {
    setRecentSearches((prev) => {
      const updated = prev.filter((s) => s !== term)
      try { localStorage.setItem(RECENT_KEY, JSON.stringify(updated)) } catch { /* ignore */ }
      return updated
    })
  }, [])

  // ---- debounced search ----
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    if (!query.trim()) { setResults([]); setLoading(false); return }
    setLoading(true)
    debounceRef.current = setTimeout(async () => {
      try { setResults(await fetchSearchResults(query, activeFilter)) }
      catch { setResults([]) }
      finally { setLoading(false) }
    }, 200)
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current) }
  }, [query, activeFilter])

  useEffect(() => { setSelectedIndex(0) }, [results])

  // ---- keyboard shortcut (⌘K / Ctrl+K) ----
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setOpen((prev) => !prev)
      }
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [])

  // Focus input on open / reset state on close
  useEffect(() => {
    if (open) requestAnimationFrame(() => inputRef.current?.focus())
    else { setQuery(''); setResults([]); setSelectedIndex(0); setActiveFilter('all') }
  }, [open])

  // ---- handlers ----
  const handleSelect = useCallback(
    (result: SearchResult) => {
      saveRecentSearch(query)
      setActiveModule(result.module)
      setOpen(false)
    },
    [query, saveRecentSearch, setActiveModule],
  )

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Escape') { e.preventDefault(); setOpen(false); return }
      if (e.key === 'ArrowDown') {
        e.preventDefault()
        setSelectedIndex((prev) => prev < flatResults.length - 1 ? prev + 1 : 0)
        return
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault()
        setSelectedIndex((prev) => prev > 0 ? prev - 1 : flatResults.length - 1)
        return
      }
      if (e.key === 'Enter' && flatResults[selectedIndex]) {
        e.preventDefault()
        handleSelect(flatResults[selectedIndex])
      }
    },
    [flatResults, selectedIndex, handleSelect],
  )

  const handleBackdropClick = useCallback(
    (e: React.MouseEvent) => {
      if (e.target === overlayRef.current) setOpen(false)
    },
    [],
  )

  return (
    <>
      <SearchOverlay
        open={open}
        overlayRef={overlayRef}
        inputRef={inputRef}
        query={query}
        loading={loading}
        results={results}
        selectedIndex={selectedIndex}
        activeFilter={activeFilter}
        filters={filters}
        recentSearches={recentSearches}
        onQueryChange={setQuery}
        onFilterChange={setActiveFilter}
        onSelect={handleSelect}
        onHover={setSelectedIndex}
        onSelectRecent={(term) => { setQuery(term); inputRef.current?.focus() }}
        onRemoveRecent={removeRecentSearch}
        onKeyDown={handleKeyDown}
        onBackdropClick={handleBackdropClick}
      />
      <SearchTriggerButton onClick={() => setOpen(true)} />
    </>
  )
}
