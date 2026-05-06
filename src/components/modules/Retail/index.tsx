import { useState, useEffect, useCallback } from 'react'
import { useAppStore } from '@/lib/store'
import { useTranslation } from '@/lib/i18n'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ShoppingCart, Clock, Package, BarChart3 } from 'lucide-react'
import type * as Types from './types'
import * as Data from './data'
import { POSTerminal, ShiftManager, POSReports, RetailSync } from './components'

export function Maloprodaja() {
  const { activeCompanyId } = useAppStore()
  const [activeTab, setActiveTab] = useState('pos')

  return (
    <div className="space-y-4">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="pos">
            <ShoppingCart className="h-4 w-4 mr-1.5" />
            Kasa
          </TabsTrigger>
          <TabsTrigger value="smene">
            <Clock className="h-4 w-4 mr-1.5" />
            Smene
          </TabsTrigger>
          <TabsTrigger value="sync">
            <Package className="h-4 w-4 mr-1.5" />
            Sync
          </TabsTrigger>
          <TabsTrigger value="izvestaji">
            <BarChart3 className="h-4 w-4 mr-1.5" />
            Izveštaji
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pos">
          <POSTerminal companyId={activeCompanyId} />
        </TabsContent>
        <TabsContent value="smene">
          <ShiftManager companyId={activeCompanyId} />
        </TabsContent>
        <TabsContent value="sync">
          <RetailSync companyId={activeCompanyId} />
        </TabsContent>
        <TabsContent value="izvestaji">
          <POSReports companyId={activeCompanyId} />
        </TabsContent>
      </Tabs>
    </div>
  )
}