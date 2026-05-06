'use client'

import { Card, CardContent } from '@/components/ui/card'
import { RecurringInvoicesContent } from './components'

export function RecurringInvoices() {
  return (
    <Card>
      <CardContent className="p-6">
        <RecurringInvoicesContent />
      </CardContent>
    </Card>
  )
}
