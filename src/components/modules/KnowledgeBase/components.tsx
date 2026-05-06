'use client'

from '@/components/ui/badge'
from '@/components/ui/button'
from '@/components/ui/card'
from '@/components/ui/chart'
from '@/components/ui/dialog'
from '@/components/ui/input'
from '@/components/ui/label'
from '@/components/ui/select'
from '@/components/ui/separator'
from '@/components/ui/switch'
from '@/components/ui/tabs'
from '@/components/ui/textarea'
import { , Star } from 'lucide-react'
import type { Article, Category, Review, SearchQuery, KbSettings, ArticleForm, CategoryForm } from './types'

function StarRating({ rating, max = 5, size = 'sm' }: { rating: number; max?: number; size?: 'sm' | 'md' }) {
  const sizeClass = size === 'sm' ? 'h-3.5 w-3.5' : 'h-4 w-4'
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: max }, (_, i) => (
        <Star
          key={i}
          className={`${sizeClass} ${i < Math.round(rating) ? 'fill-amber-400 text-amber-400' : 'text-gray-300 dark:text-gray-600'}`}
        />
      ))}
    </div>
  )
}

function HighlightedText({ text, query }: { text: string; query: string }) {
  if (!query.trim()) return <span>{text}</span>
  const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi')
  const parts = text.split(regex)
  return (
    <span>
      {parts.map((part, i) =>
        regex.test(part) ? (
          <mark key={i} className="bg-amber-200 dark:bg-amber-800 rounded px-0.5">
            {part}
          </mark>
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </span>
  )
}
