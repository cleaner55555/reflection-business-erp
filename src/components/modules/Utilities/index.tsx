'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Settings, Database, Server, HardDrive, Clock, ShieldCheck, AlertTriangle, RefreshCw, Activity, Cpu, MemoryStick, Globe, Zap, Users, FileText, Trash2 } from 'lucide-react'
import { toast } from 'sonner'

interface SystemInfo {
  version: string
  uptime: string
  lastBackup: string
  dbSize: string
  activeUsers: number
  totalModules: number
  apiCalls: number
  memory: number
  cpu: number
}

const SYSTEM: SystemInfo = {
  version: '2.4.1',
  uptime: '15d 7h 32m',
  lastBackup: '2024-06-15 02:00',
  dbSize: '245 MB',
  activeUsers: 12,
  totalModules: 148,
  apiCalls: 15420,
  memory: 67,
  cpu: 23,
}

const RECENT_LOGS = [
  { time: '10:32:15', level: 'info', message: 'API: GET /api/invoices — 200 OK (145ms)' },
  { time: '10:32:10', level: 'info', message: 'Backup automatski započet' },
  { time: '10:31:45', level: 'warn', message: 'Spori upit: /api/reports/dashboard — 2.3s' },
  { time: '10:30:00', level: 'info', message: 'Korisnik admin@reflection.rs ulogovan' },
  { time: '10:28:30', level: 'error', message: 'API: POST /api/email — 500 SMTP greška' },
  { time: '10:25:00', level: 'info', message: 'Zakazani izveštaj generisan' },
  { time: '10:20:00', level: 'info', message: 'Backup završen — 245 MB (4m 32s)' },
  { time: '10:15:00', level: 'info', message: 'Baza ažurirana: 3 nova zapisa' },
]

function getLogColor(level: string) {
  return level === 'error' ? 'text-red-600 bg-red-50' : level === 'warn' ? 'text-amber-600 bg-amber-50' : 'text-slate-600 bg-slate-50'
}

export function Alati() {
  const [loading, setLoading] = useState(true)
  const [clearingCache, setClearingCache] = useState(false)
  const [runningDiagnostics, setRunningDiagnostics] = useState(false)

  useEffect(() => { setTimeout(() => setLoading(false), 200) }, [])

  const handleClearCache = () => {
    setClearingCache(true)
    toast.info('Čišćenje keša...')
    setTimeout(() => { setClearingCache(false); toast.success('Keš očišćen') }, 2000)
  }

  const handleDiagnostics = () => {
    setRunningDiagnostics(true)
    toast.info('Dijagnostika u toku...')
    setTimeout(() => { setRunningDiagnostics(false); toast.success('Dijagnostika završena — sve OK') }, 3000)
  }

  if (loading) return <div className="space-y-4"><Skeleton className="h-8 w-48" /><div className="grid grid-cols-2 lg:grid-cols-4 gap-3">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24" />)}</div></div>

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold tracking-tight flex items-center gap-2"><Settings className="h-6 w-6" />Алати и систем</h1><p className="text-sm text-muted-foreground">Системске информације, логови и алати за одржавање</p></div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <Card className="p-4"><div className="flex items-center gap-2 text-xs text-muted-foreground mb-1"><Cpu className="h-3.5 w-3.5" />CPU</div><p className="text-2xl font-bold">{SYSTEM.cpu}%</p><div className="h-1.5 bg-muted rounded-full mt-2 overflow-hidden"><div className="h-full bg-emerald-500 rounded-full" style={{ width: `${SYSTEM.cpu}%` }} /></div></Card>
        <Card className="p-4"><div className="flex items-center gap-2 text-xs text-muted-foreground mb-1"><MemoryStick className="h-3.5 w-3.5" />RAM</div><p className="text-2xl font-bold">{SYSTEM.memory}%</p><div className="h-1.5 bg-muted rounded-full mt-2 overflow-hidden"><div className="h-full bg-amber-500 rounded-full" style={{ width: `${SYSTEM.memory}%` }} /></div></Card>
        <Card className="p-4"><div className="flex items-center gap-2 text-xs text-muted-foreground mb-1"><Database className="h-3.5 w-3.5" />Baza</div><p className="text-2xl font-bold">{SYSTEM.dbSize}</p></Card>
        <Card className="p-4"><div className="flex items-center gap-2 text-xs text-muted-foreground mb-1"><Users className="h-3.5 w-3.5" />Aktivnih</div><p className="text-2xl font-bold">{SYSTEM.activeUsers}</p></Card>
        <Card className="p-4"><div className="flex items-center gap-2 text-xs text-muted-foreground mb-1"><Zap className="h-3.5 w-3.5" />API poziva</div><p className="text-2xl font-bold">{SYSTEM.apiCalls.toLocaleString()}</p></Card>
        <Card className="p-4"><div className="flex items-center gap-2 text-xs text-muted-foreground mb-1"><Clock className="h-3.5 w-3.5" />Uptime</div><p className="text-sm font-bold">{SYSTEM.uptime}</p></Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-3"><CardTitle className="text-sm font-semibold flex items-center gap-2"><Server className="h-4 w-4" />Системске информације</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-2">
              {[
                { label: 'Verzija', value: `v${SYSTEM.version}` },
                { label: 'Baza podataka', value: 'SQLite + Prisma' },
                { label: 'Framework', value: 'Next.js 16' },
                { label: 'Moduli', value: `${SYSTEM.totalModules} aktivnih` },
                { label: 'Poslednji backup', value: SYSTEM.lastBackup },
                { label: 'Veličina baze', value: SYSTEM.dbSize },
              ].map(item => (
                <div key={item.label} className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
                  <span className="text-xs text-muted-foreground">{item.label}</span>
                  <span className="text-xs font-medium">{item.value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between"><CardTitle className="text-sm font-semibold flex items-center gap-2"><ShieldCheck className="h-4 w-4" />Алати</CardTitle></div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-2">
              <Button variant="outline" size="sm" className="gap-2 text-xs h-9" onClick={handleClearCache} disabled={clearingCache}>{clearingCache ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />Очисти keš</Button>
              <Button variant="outline" size="sm" className="gap-2 text-xs h-9" onClick={handleDiagnostics} disabled={runningDiagnostics}>{runningDiagnostics ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <Activity className="h-3.5 w-3.5" />Dijagnostika</Button>
              <Button variant="outline" size="sm" className="gap-2 text-xs h-9" onClick={() => toast.info('Export podataka...')}><FileText className="h-3.5 w-3.5" />Export</Button>
              <Button variant="outline" size="sm" className="gap-2 text-xs h-9" onClick={() => toast.info('Reindex započet...')}><Database className="h-3.5 w-3.5" />Reindex</Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-3"><CardTitle className="text-sm font-semibold flex items-center gap-2"><Activity className="h-4 w-4" />Системски лог (задњих 50)</CardTitle></CardHeader>
        <CardContent>
          <div className="max-h-[400px] overflow-y-auto space-y-1">
            {RECENT_LOGS.map((log, i) => (
              <div key={i} className={`flex items-start gap-3 p-2 rounded text-xs font-mono ${getLogColor(log.level)}`}>
                <span className="text-muted-foreground whitespace-nowrap">{log.time}</span>
                <Badge className="text-[9px] px-1.5 py-0 h-4" variant={log.level === 'error' ? 'destructive' : log.level === 'warn' ? 'secondary' : 'outline'}>{log.level.toUpperCase()}</Badge>
                <span className="flex-1">{log.message}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
