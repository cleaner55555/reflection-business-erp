'use client'

import {  } from 'lucide-react'

function VatColor(rate: number) {
  if (rate <= 5) return 'text-emerald-600 bg-emerald-50 border-emerald-200'
  if (rate <= 10) return 'text-green-600 bg-green-50 border-green-200'
  if (rate <= 15) return 'text-amber-600 bg-amber-50 border-amber-200'
  if (rate <= 20) return 'text-orange-600 bg-orange-50 border-orange-200'
  return 'text-red-600 bg-red-50 border-red-200'
}

function CorpColor(rate: number) {
  if (rate <= 10) return 'text-emerald-600 bg-emerald-50 border-emerald-200'
  if (rate <= 15) return 'text-green-600 bg-green-50 border-green-200'
  if (rate <= 20) return 'text-amber-600 bg-amber-50 border-amber-200'
  return 'text-red-600 bg-red-50 border-red-200'
}
