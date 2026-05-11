'use client'
import React from 'react'

export const financeModules: Record<string, React.LazyExoticComponent<React.ComponentType>> = {
  'accounting': React.lazy(() => import('@/components/modules/Accounting')),
  'bank-sync': React.lazy(() => import('@/components/modules/BankSync')),
  'payments': React.lazy(() => import('@/components/modules/Payments')),
  'cash-register': React.lazy(() => import('@/components/modules/CashRegister')),
  'pos': React.lazy(() => import('@/components/modules/Retail')),
  'subscriptions': React.lazy(() => import('@/components/modules/Subscriptions')),
  'contracts': React.lazy(() => import('@/components/modules/Contracts')),
  'procurement': React.lazy(() => import('@/components/modules/Procurement')),
  'procurement-manager': React.lazy(() => import('@/components/modules/ProcurementManager')),
  'returns': React.lazy(() => import('@/components/modules/Returns')),
  'coupons': React.lazy(() => import('@/components/modules/Coupons')),
  'price-lists': React.lazy(() => import('@/components/modules/PriceLists')),
}
