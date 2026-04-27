'use client'

import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar'
import { AppSidebar } from '@/components/modules/AppSidebar'
import { Footer } from '@/components/modules/Footer'
import { Dashboard } from '@/components/modules/Dashboard'
import { Finansije } from '@/components/modules/Finansije'
import { Fakture } from '@/components/modules/Fakture'
import { Magacin } from '@/components/modules/Magacin'
import { Partneri } from '@/components/modules/Partneri'
import { Nabavka } from '@/components/modules/Nabavka'
import { Izvestaji } from '@/components/modules/Izvestaji'
import { useAppStore } from '@/lib/store'
import { Separator } from '@/components/ui/separator'
import { motion, AnimatePresence } from 'framer-motion'

export default function Home() {
  const { activeModule } = useAppStore()

  const moduleLabels: Record<string, string> = {
    dashboard: 'Pregled',
    finansije: 'Finansije',
    fakture: 'Fakture',
    magacin: 'Magacin',
    partneri: 'Partneri',
    nabavka: 'Nabavka',
    izvestaji: 'Izveštaji',
  }

  return (
    <div className="min-h-screen flex">
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <header className="flex h-14 shrink-0 items-center gap-2 border-b bg-white px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <h2 className="text-sm font-medium text-foreground">
              {moduleLabels[activeModule]}
            </h2>
          </header>

          <main className="flex-1 overflow-auto bg-background/50">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeModule}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
                className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8"
              >
                {activeModule === 'dashboard' && <Dashboard />}
                {activeModule === 'finansije' && <Finansije />}
                {activeModule === 'fakture' && <Fakture />}
                {activeModule === 'magacin' && <Magacin />}
                {activeModule === 'partneri' && <Partneri />}
                {activeModule === 'nabavka' && <Nabavka />}
                {activeModule === 'izvestaji' && <Izvestaji />}
              </motion.div>
            </AnimatePresence>
          </main>

          <Footer />
        </SidebarInset>
      </SidebarProvider>
    </div>
  )
}
