'use client'

import { useState, useEffect } from 'react'
import { Skeleton } from '@/components/ui/skeleton'
import type { SeoPage, Keyword } from './types'
import { INITIAL_PAGES, INITIAL_KEYWORDS } from './data'
import { HeaderSection, KpiCards, SeoTabs } from './components'

export function SeoModul() {
  const [pages, setPages] = useState<SeoPage[]>([])
  const [keywords, setKeywords] = useState<Keyword[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [tab, setTab] = useState('pages')

  useEffect(() => { setLoading(true); setTimeout(() => { setPages(INITIAL_PAGES); setKeywords(INITIAL_KEYWORDS); setLoading(false) }, 200) }, [])

  const totalClicks = pages.reduce((s, p) => s + p.clicks, 0)
  const totalImpressions = pages.reduce((s, p) => s + p.impressions, 0)
  const avgCtr = pages.length > 0 ? (pages.reduce((s, p) => s + p.ctr, 0) / pages.length).toFixed(1) : '0'
  const avgPosition = pages.length > 0 ? (pages.reduce((s, p) => s + p.position, 0) / pages.length).toFixed(1) : '0'

  const filteredPages = pages.filter(p => !search || p.title.toLowerCase().includes(search.toLowerCase()) || p.url.includes(search))
  const filteredKeywords = keywords.filter(k => !search || k.keyword.toLowerCase().includes(search.toLowerCase()))

  if (loading) return <div className="space-y-4"><Skeleton className="h-8 w-48" /><div className="grid grid-cols-2 lg:grid-cols-4 gap-3">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24" />)}</div></div>

  return (
    <div className="space-y-6">
      <HeaderSection search={search} onSearchChange={setSearch} />
      <KpiCards stats={{ totalClicks, totalImpressions, avgCtr, avgPosition, indexedCount: pages.filter(p => p.status === 'indexed').length, totalPages: pages.length, keywordsCount: keywords.length }} />
      <SeoTabs tab={tab} onTabChange={setTab} filteredPages={filteredPages} filteredKeywords={filteredKeywords} />
    </div>
  )
}
