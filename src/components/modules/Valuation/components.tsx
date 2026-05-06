'use client'

import { useState } from 'react'

from '@/components/ui/badge'
from '@/components/ui/button'
from '@/components/ui/card'
from '@/components/ui/dialog'
from '@/components/ui/input'
from '@/components/ui/label'
from '@/components/ui/progress'
from '@/components/ui/select'
from '@/components/ui/tabs'
from '@/components/ui/textarea'
import { , Star } from 'lucide-react'
import type { Employee, CompetencyScore, Appraisal, Criterion, PeriodData } from './types'

function StarRating({ value, max = 5, interactive = false, onChange }: { value: number; max?: number; interactive?: boolean; onChange?: (v: number) => void }) {
  const [hovered, setHovered] = useState(0)
  const display = hovered || value
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: max }, (_, i) => i + 1).map((star) => (
        <button key={star} type="button"
          className={`h-4 w-4 transition-colors ${interactive ? 'cursor-pointer hover:scale-110' : 'cursor-default'}`}
          onMouseEnter={() => interactive && setHovered(star)}
          onMouseLeave={() => interactive && setHovered(0)}
          onClick={() => interactive && onChange?.(star)}
          disabled={!interactive}
        >
          <Star className={`h-4 w-4 ${star <= display ? 'text-amber-400 fill-amber-400' : 'text-gray-300'}`} />
        </button>
      ))}
    </div>
  )
}
