'use client'

import { useEffect, useState } from 'react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { Switch } from '@/components/ui/switch'
'use client'

import { useEffect, useState } from 'react'

import { ArrowRight, Pause, Play, Plus, Settings2, Trash2, Zap } from 'lucide-react'
import type { AutomationRule } from './types'

function AutomacijeTab() {
  const [rules, setRules] = useState<AutomationRule[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [form, setForm] = useState({
    name: '', trigger: 'stage_change', condition: '', action: 'move_stage', actionData: '', isActive: true
  })

  useEffect(() => {
    let cancelled = false
    const load = async () => {
      const res = await fetch('/api/crm-automation-rules')
      if (cancelled) return
      setRules(await res.json())
      setLoading(false)
    }
    load()
    return () => { cancelled = true }
  }, [])

  const handleSubmit = async () => {
    if (editId) {
      await fetch(`/api/crm-automation-rules/${editId}`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form)
      })
    } else {
      await fetch('/api/crm-automation-rules', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...form, companyId: 'default' })
      })
    }
    setShowForm(false); setEditId(null)
    setForm({ name: '', trigger: 'stage_change', condition: '', action: 'move_stage', actionData: '', isActive: true })
    const res = await fetch('/api/crm-automation-rules'); setRules(await res.json())
    toast.success(editId ? 'Pravilo ažurirano' : 'Pravilo kreirano')
  }

  const handleToggle = async (id: string, isActive: boolean) => {
    await fetch(`/api/crm-automation-rules/${id}`, {
      method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ isActive })
    })
    setRules(prev => prev.map(r => r.id === id ? { ...r, isActive } : r))
    toast.success(isActive ? 'Pravilo aktivirano' : 'Pravilo deaktivirano')
  }

  const handleDelete = async (id: string) => {
    await fetch(`/api/crm-automation-rules/${id}`, { method: 'DELETE' })
    setRules(prev => prev.filter(r => r.id !== id))
    toast.success('Pravilo obrisano')
  }

  const getTriggerLabel = (t: string) => {
    switch (t) {
      case 'stage_change': return 'Promena faze'
      case 'deal_created': return 'Novi deal'
      case 'days_inactive': return 'Neaktivnost'
      case 'score_above': return 'Score iznad'
      default: return t
    }
  }

  const getActionLabel = (a: string) => {
    switch (a) {
      case 'move_stage': return 'Premesti fazu'
      case 'assign_to': return 'Dodeli'
      case 'send_email': return 'Pošalji email'
      case 'add_tag': return 'Dodaj tag'
      case 'set_score': return 'Postavi score'
      default: return a
    }
  }

  if (loading) return <div className="space-y-4">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-24" />)}</div>

  const activeCount = rules.filter(r => r.isActive).length

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-3 text-sm text-muted-foreground">
          <Settings2 className="h-4 w-4" />
          <span>{rules.length} pravila</span>
          <Badge variant="outline">{activeCount} aktivnih</Badge>
        </div>
        <Button size="sm" className="gap-1.5" onClick={() => { setShowForm(true); setEditId(null) }}>
          <Plus className="h-3.5 w-3.5" /> Novo pravilo
        </Button>
      </div>

      {/* Info banner */}
      <Card className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <CardContent className="p-0">
          <div className="flex items-start gap-3">
            <Zap className="h-5 w-5 text-blue-500 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-blue-800">Automatizacija CRM-a</p>
              <p className="text-xs text-blue-600 mt-1">Automatizujte rad sa CRM prilikama kroz pravila koja se pokreću automatski kada se ispune uslov. Pravila podržavaju promenu faze, dodeljivanje, slanje emailova i postavljanje score-a.</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {showForm && (
        <Card className="p-4 border-dashed">
          <CardHeader className="pb-3"><CardTitle className="text-sm font-semibold">{editId ? 'Uredi pravilo' : 'Novo pravilo'}</CardTitle></CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">Naziv pravila</Label>
                <Input className="mt-1 h-9" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="npr. Auto-premest u kvalifikaciju" />
              </div>
              <div>
                <Label className="text-xs">Trigger</Label>
                <Select value={form.trigger} onValueChange={v => setForm(p => ({ ...p, trigger: v }))}>
                  <SelectTrigger className="mt-1 h-9"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="stage_change">Promena faze</SelectItem>
                    <SelectItem value="deal_created">Novi deal kreiran</SelectItem>
                    <SelectItem value="days_inactive">Neaktivnost (dana)</SelectItem>
                    <SelectItem value="score_above">Score iznad praga</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs">Akcija</Label>
                <Select value={form.action} onValueChange={v => setForm(p => ({ ...p, action: v }))}>
                  <SelectTrigger className="mt-1 h-9"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="move_stage">Premesti fazu</SelectItem>
                    <SelectItem value="assign_to">Dodeli komši</SelectItem>
                    <SelectItem value="send_email">Pošalji email</SelectItem>
                    <SelectItem value="add_tag">Dodaj tag</SelectItem>
                    <SelectItem value="set_score">Postavi score</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs">Parametri akcije</Label>
                <Input className="mt-1 h-9" value={form.actionData} onChange={e => setForm(p => ({ ...p, actionData: e.target.value }))} placeholder='npr. {"to":"kvalifikacija"}' />
              </div>
            </div>
            <div className="flex gap-2 mt-3">
              <Button size="sm" onClick={handleSubmit}>{editId ? 'Sačuvaj' : 'Kreiraj'}</Button>
              <Button size="sm" variant="outline" onClick={() => setShowForm(false)}>Otkaži</Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-3">
        {rules.map(rule => (
          <Card key={rule.id} className={!rule.isActive ? 'opacity-60' : ''}>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`p-2 rounded-lg ${rule.isActive ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-500'}`}>
                    {rule.isActive ? <Play className="h-3.5 w-3.5" /> : <Pause className="h-3.5 w-3.5" />}
                  </div>
                  <CardTitle className="text-sm font-semibold">{rule.name}</CardTitle>
                </div>
                <div className="flex items-center gap-2">
                  <Switch checked={rule.isActive} onCheckedChange={v => handleToggle(rule.id, v)} />
                  <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-red-500" onClick={() => handleDelete(rule.id)}><Trash2 className="h-3 w-3" /></Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 text-xs mb-2">
                <Badge variant="outline">{getTriggerLabel(rule.trigger)}</Badge>
                <ArrowRight className="h-3 w-3 text-muted-foreground" />
                <Badge className="bg-blue-100 text-blue-700">{getActionLabel(rule.action)}</Badge>
              </div>
              {rule.actionData && (
                <div className="p-2 bg-muted/50 rounded text-xs font-mono break-all">{rule.actionData}</div>
              )}
              <div className="flex items-center gap-3 text-xs text-muted-foreground mt-2">
                <span>Pokrenuto: {rule.executedCount}x</span>
                {rule.lastExecutedAt && <span>Poslednje: {rule.lastExecutedAt.split('T')[0]}</span>}
              </div>
            </CardContent>
          </Card>
        ))}
        {rules.length === 0 && (
          <Card className="p-8 text-center">
            <Settings2 className="h-8 w-8 mx-auto text-muted-foreground/30 mb-3" />
            <p className="text-muted-foreground">Nema automatizacionih pravila</p>
            <p className="text-xs text-muted-foreground mt-1">Kreirajte pravilo da automatizujete CRM procese</p>
          </Card>
        )}
      </div>
    </div>
  )
}
