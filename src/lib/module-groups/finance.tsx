'use client'
import type { ComponentType } from 'react'

export const financeModules: Record<string, () => Promise<ComponentType>> = {
  'accounting': () => import('@/components/modules/Accounting').then(m => m.Accounting),
  'bank-sync': () => import('@/components/modules/BankSync').then(m => m.BankSync),
  'payments': () => import('@/components/modules/Payments').then(m => m.Payments),
  'cash-register': () => import('@/components/modules/CashRegister').then(m => m.CashRegister),
  'pos': () => import('@/components/modules/Retail').then(m => m.Retail),
  'subscriptions': () => import('@/components/modules/Subscriptions').then(m => m.Subscriptions),
  'contracts': () => import('@/components/modules/Contracts').then(m => m.Contracts),
  'procurement': () => import('@/components/modules/Procurement').then(m => m.Procurement),
  'procurement-manager': () => import('@/components/modules/ProcurementManager').then(m => m.ProcurementManager),
  'returns': () => import('@/components/modules/Returns').then(m => m.Returns),
  'coupons': () => import('@/components/modules/Coupons').then(m => m.Coupons),
  'price-lists': () => import('@/components/modules/PriceLists').then(m => m.PriceLists),
}
