'use client'

import { useState } from 'react'

from '@/components/ui/alert'
from '@/components/ui/badge'
from '@/components/ui/button'
from '@/components/ui/card'
from '@/components/ui/dialog'
from '@/components/ui/input'
from '@/components/ui/label'
from '@/components/ui/progress'
from '@/components/ui/scroll-area'
from '@/components/ui/select'
from '@/components/ui/separator'
from '@/components/ui/tabs'
from '@/components/ui/textarea'
import { Star } from 'lucide-react'
import type { Rating, Survey, RatingCriteria, RatingReport, RatingDashboard } from './types'

function StarRating({ value, max = 5, size = 'sm', interactive = false, onChange }: { value: number; max?: number; size?: string; interactive?: boolean; onChange?: (v: number) => void }) {
  const [hovered, setHovered] = useState(0)
  const displayValue = hovered || value
  const sizeClass = size === 'lg' ? 'h-6 w-6' : size === 'md' ? 'h-5 w-5' : 'h-4 w-4'
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: max }, (_, i) => i + 1).map((star) => (
        <button key={star} type="button" className={`${sizeClass} transition-colors ${interactive ? 'cursor-pointer hover:scale-110' : 'cursor-default'}`}
          onMouseEnter={() => interactive && setHovered(star)}
          onMouseLeave={() => interactive && setHovered(0)}
          onClick={() => interactive && onChange && onChange(star)}
          disabled={!interactive}
        >
          <Star className={`${sizeClass} ${star <= displayValue ? 'text-amber-400 fill-amber-400' : 'text-gray-300'}`} />
        </button>
      ))}
    </div>
  )
}
