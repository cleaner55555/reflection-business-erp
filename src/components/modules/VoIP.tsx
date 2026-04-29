/* eslint-disable react-hooks/set-state-in-effect */
'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAppStore } from '@/lib/store'
import { useTranslation } from '@/lib/i18n'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Separator } from '@/components/ui/separator'
import {
  Phone, Plus, Search, Eye, Trash2, RefreshCw,
  CheckCircle2, Clock, BarChart3, PhoneCall, PhoneOff,
  Users, DollarSign, AlertCircle, Mic, Headphones
} from 'lucide-react'

interface VoipCall {
  id: string
  direction: string
  number: string
  contactName?: string
  duration: number
  status: string
  agent?: string
  createdAt: string
}

const directionConfig: Record<string, { label: string; color: string }> = {
  inbound: { label: 'Dolazni', color: 'bg-green-100 text-green-700' },
  outbound: { label: 'Odlazni', color: 'bg-blue-100 text-blue-700' },
  internal: { label: 'Interni', color: 'bg-purple-100 text-purple-700' },
}

const callStatusConfig: Record<string, { label: string; color: string }> = {
  completed: { label: 'Završen', color: 'bg-green-100 text-green-700' },
  missed: { label: 'Propušten', color: 'bg-red-100 text-red-700' },
  in_progress: { label: 'U toku', color: 'bg-amber-100 text-amber-700' },
  queued: { label: 'Na čekanju', color: 'bg-gray-100 text-gray-700' },
}

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}:${s.toString().padStart(2, '0')}`
}

export function VoIP() {
  const { activeCompanyId } = useAppStore()
  const { t } = useTranslation()
  const [activeTab, setActiveTab] = useState('overview')
  const [calls, setCalls] = useState<VoipCall[]>([])
  const [search, setSearch] = useState('')
  const [dirFilter, setDirFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [loading, setLoading] = useState(false)

  const loadCalls = useCallback(async () => {
    if (!activeCompanyId) return
    setLoading(true)
    try {
      const res = await fetch(`/api/voip/calls?companyId=${activeCompanyId}&limit=100`)
      if (res.ok) {
        const data = await res.json()
        setCalls(data.items || data || [])
      }
    } catch { /* silent */ }
    setLoading(false)
  }, [activeCompanyId])

  useEffect(() => { loadCalls() }, [activeCompanyId, loadCalls])

  const todayCalls = calls.filter((c) => new Date(c.createdAt).toDateString() === new Date().toDateString())
  const totalDuration = calls.reduce((sum, c) => sum + (c.duration || 0), 0)
  const missedCalls = calls.filter((c) => c.status === 'missed').length
  const avgDuration = calls.filter((c) => c.status === 'completed').length > 0
    ? Math.round(calls.filter((c) => c.status === 'completed').reduce((sum, c) => sum + (c.duration || 0), 0) / calls.filter((c) => c.status === 'completed').length)
    : 0

  const filtered = calls.filter((c) => {
    if (search && !c.number.includes(search) && !c.contactName?.toLowerCase().includes(search.toLowerCase())) return false
    if (dirFilter !== 'all' && c.direction !== dirFilter) return false
    if (statusFilter !== 'all' && c.status !== statusFilter) return false
    return true
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">VoIP</h1>
          <p className="text-sm text-muted-foreground">IP telefonija i call centar</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={loadCalls}><RefreshCw className="h-4 w-4 mr-1" /> Osveži</Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview"><BarChart3 className="h-4 w-4 mr-1" /> Pregled</TabsTrigger>
          <TabsTrigger value="calls"><Phone className="h-4 w-4 mr-1" /> Pozivi</TabsTrigger>
          <TabsTrigger value="settings"><Headphones className="h-4 w-4 mr-1" /> Podešavanja</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="p-4"><div className="flex items-center justify-between mb-2"><span className="text-xs text-muted-foreground">Danas</span><PhoneCall className="h-4 w-4 text-muted-foreground" /></div><p className="text-2xl font-bold">{todayCalls.length}</p><p className="text-xs text-muted-foreground">poziva</p></Card>
            <Card className="p-4"><div className="flex items-center justify-between mb-2"><span className="text-xs text-muted-foreground">Propušteni</span><PhoneOff className="h-4 w-4 text-red-500" /></div><p className="text-2xl font-bold text-red-600">{todayCalls.filter((c) => c.status === 'missed').length}</p></Card>
            <Card className="p-4"><div className="flex items-center justify-between mb-2"><span className="text-xs text-muted-foreground">Prosek</span><Clock className="h-4 w-4 text-primary" /></div><p className="text-2xl font-bold text-primary">{formatDuration(avgDuration)}</p></Card>
            <Card className="p-4"><div className="flex items-center justify-between mb-2"><span className="text-xs text-muted-foreground">Ukupno</span><DollarSign className="h-4 w-4 text-amber-500" /></div><p className="text-2xl font-bold text-amber-600">{formatDuration(totalDuration)}</p></Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader className="pb-3"><CardTitle className="text-sm">Po smeru</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                {Object.entries(directionConfig).map(([key, cfg]) => {
                  const count = calls.filter((c) => c.direction === key).length
                  return (
                    <div key={key} className="flex items-center justify-between">
                      <Badge variant="outline" className={cfg.color}>{cfg.label}</Badge>
                      <span className="text-sm font-medium">{count}</span>
                    </div>
                  )
                })}
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3"><CardTitle className="text-sm">Informacije o VoIP servisu</CardTitle></CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex items-start gap-3"><CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" /><div><p className="font-medium">SIP telefonija</p><p className="text-xs text-muted-foreground">Podrška za SIP trunk i IP telefone</p></div></div>
                <div className="flex items-start gap-3"><CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" /><div><p className="font-medium">Call centar</p><p className="text-xs text-muted-foreground">Queue, IVR, snimanje poziva</p></div></div>
                <div className="flex items-start gap-3"><CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" /><div><p className="font-medium">Click-to-Call</p><p className="text-xs text-muted-foreground">Poziv direktno iz CRM modula</p></div></div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="calls" className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /><Input placeholder="Pretraži po broju ili imenu..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} /></div>
            <Select value={dirFilter} onValueChange={setDirFilter}>
              <SelectTrigger className="w-[140px]"><SelectValue placeholder="Smer" /></SelectTrigger>
              <SelectContent><SelectItem value="all">Svi</SelectItem>{Object.entries(directionConfig).map(([k, v]) => (<SelectItem key={k} value={k}>{v.label}</SelectItem>))}</SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[140px]"><SelectValue placeholder="Status" /></SelectTrigger>
              <SelectContent><SelectItem value="all">Svi</SelectItem>{Object.entries(callStatusConfig).map(([k, v]) => (<SelectItem key={k} value={k}>{v.label}</SelectItem>))}</SelectContent>
            </Select>
          </div>
          {loading ? (<div className="flex justify-center py-20"><RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" /></div>) : filtered.length === 0 ? (
            <Card className="p-8 text-center"><Phone className="h-12 w-12 mx-auto mb-3 text-muted-foreground" /><p className="text-muted-foreground">Nema poziva</p></Card>
          ) : (
            <div className="space-y-2">
              {filtered.slice(0, 50).map((c) => {
                const dirCfg = directionConfig[c.direction]
                const statCfg = callStatusConfig[c.status]
                return (
                  <Card key={c.id} className="hover:bg-muted/30">
                    <CardContent className="p-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`h-8 w-8 rounded-full flex items-center justify-center ${c.status === 'missed' ? 'bg-red-100' : 'bg-green-100'}`}>
                            {c.direction === 'inbound' ? <PhoneCall className="h-4 w-4 text-green-600" /> : <Phone className="h-4 w-4 text-blue-600" />}
                          </div>
                          <div>
                            <p className="text-sm font-medium">{c.contactName || c.number}</p>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <Badge variant="outline" className={`text-[10px] ${dirCfg?.color}`}>{dirCfg?.label}</Badge>
                              <Badge variant="outline" className={`text-[10px] ${statCfg?.color}`}>{statCfg?.label}</Badge>
                              <span>{formatDuration(c.duration)}</span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-muted-foreground">{new Date(c.createdAt).toLocaleString('sr-RS', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}</p>
                          {c.agent && <p className="text-[10px] text-muted-foreground">{c.agent}</p>}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-sm">VoIP podešavanja</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2"><Label>SIP Server</Label><Input placeholder="sip.provider.rs" /></div>
                <div className="space-y-2"><Label>SIP Username</Label><Input placeholder="username" /></div>
                <div className="space-y-2"><Label>SIP Password</Label><Input type="password" placeholder="••••••••" /></div>
                <div className="space-y-2"><Label>Caller ID</Label><Input placeholder="+38111234567" /></div>
              </div>
              <div className="p-3 bg-muted/50 rounded-lg">
                <p className="text-xs text-muted-foreground">Integracija sa CRM modulom: Click-to-Call sa stranice partnera automatski kreira poziv i linkuje ga sa CRM kontaktom.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
