'use client'import { AlertCircle, CheckCircle2, Copy, Download, Edit3, Eye, Plus, Search, Send, Smartphone, Upload, UserPlus, Users, X } from 'lucide-react'



// ========== OverviewTab ==========

export function OverviewTab({ campaigns, keywords, templates }: { campaigns: any, keywords: any, templates: any }) {
  return (
    <TabsContent value="overview" className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KpiCard label="Kampanje" value={stats.totalCampaigns} icon={Megaphone} sub={`${campaigns.filter(c => c.status === 'sent' || c.status === 'delivered').length} završenih`} color="text-blue-500" bg="bg-blue-50 dark:bg-blue-900/20" />
        <KpiCard label="Poslato SMS" value={stats.totalSent} icon={Send} sub={`Dostava: ${stats.deliveryRate}%`} color="text-green-500" bg="bg-green-50 dark:bg-green-900/20" />
        <KpiCard label="Odgovori" value={stats.totalReplies} icon={MessageSquare} sub={`${stats.totalFailed} neuspelih`} color="text-amber-500" bg="bg-amber-50 dark:bg-amber-900/20" />
        <KpiCard label="Ukupan trošak" value={formatRSD(stats.totalCost)} icon={DollarSign} sub={`~${stats.totalSent * 3.5} RSD`} color="text-purple-500" bg="bg-purple-50 dark:bg-purple-900/20" />
      </div>
    
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="pb-3"><CardTitle className="text-sm">Po kategorijama</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-2">
              {Object.entries(stats.byCategory).sort(([, a], [, b]) => b - a).map(([cat, count]) => {
                const max = Math.max(...Object.values(stats.byCategory), 1)
                return (
                  <div key={cat} className="flex items-center gap-3">
                    <span className="text-xs w-28 truncate capitalize">{cat}</span>
                    <div className="flex-1 bg-muted rounded-full h-3"><div className="bg-primary h-3 rounded-full" style={{ width: `${(count / max) * 100}%` }} /></div>
                    <span className="text-xs font-mono w-6 text-right">{count}</span>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
    
        <Card>
          <CardHeader className="pb-3"><CardTitle className="text-sm">Po statusima</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-2">
              {Object.entries(STATUS_CONFIG).map(([status, cfg]) => {
                const count = stats.byStatus[status] || 0
                if (count === 0) return null
                return (
                  <div key={status} className="flex items-center gap-3">
                    <Badge variant="outline" className={`text-[10px] w-24 justify-center ${cfg.color}`}>{cfg.label}</Badge>
                    <div className="flex-1 bg-muted rounded-full h-3"><div className="bg-primary h-3 rounded-full" style={{ width: `${(count / Math.max(stats.totalCampaigns, 1)) * 100}%` }} /></div>
                    <span className="text-xs font-mono w-6 text-right">{count}</span>
                  </div>
                )
              })}
            </div>
            <Separator className="my-3" />
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div><span className="text-muted-foreground">Aktivni kontakti:</span> <span className="font-medium">{stats.activeContacts}</span></div>
              <div><span className="text-muted-foreground">Odjavljeni:</span> <span className="font-medium text-red-500">{stats.unsubscribed}</span></div>
              <div><span className="text-muted-foreground">Aktivnih ključnih reči:</span> <span className="font-medium">{keywords.filter(k => k.enabled).length}</span></div>
              <div><span className="text-muted-foreground">Template-a:</span> <span className="font-medium">{templates.length}</span></div>
            </div>
          </CardContent>
        </Card>
    
        <Card>
          <CardHeader className="pb-3"><CardTitle className="text-sm">Poslednje kampanje</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-2">
              {campaigns.slice(0, 5).map(c => (
                <div key={c.id} className="flex items-center gap-3 p-2 rounded hover:bg-muted/50 cursor-pointer" onClick={() => { setSelectedCampaign(c); setDetailOpen(true) }}>
                  <div className="flex-1 min-w-0"><p className="text-xs font-medium truncate">{c.name}</p><p className="text-[10px] text-muted-foreground">{c.recipientCount} primalaca</p></div>
                  <Badge variant="outline" className={`text-[9px] ${STATUS_CONFIG[c.status]?.color}`}>{STATUS_CONFIG[c.status]?.label}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
    
        <Card>
          <CardHeader className="pb-3"><CardTitle className="text-sm">Dnevna aktivnost</CardTitle></CardHeader>
          <CardContent>
            <div className="flex items-end gap-1 h-24">
              {Array.from({ length: 30 }, (_, i) => {
                const count = Math.floor(Math.random() * 200) + (i > 20 ? Math.floor(Math.random() * 300) : 0)
                const maxH = 500
                return (
                  <div key={i} className="flex-1 flex flex-col items-center">
                    <div className="w-full rounded-t-sm bg-primary/30 hover:bg-primary/50 transition-colors" style={{ height: `${(count / maxH) * 100}%`, minHeight: '2px' }} />
                  </div>
                )
              })}
            </div>
            <div className="flex justify-between mt-1 text-[9px] text-muted-foreground"><span>01 Jan</span><span>15 Jan</span><span>30 Jan</span></div>
          </CardContent>
        </Card>
    
        <Card>
          <CardHeader className="pb-3"><CardTitle className="text-sm flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-green-600" /> Usaglašenost</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="flex items-center gap-2 p-2 rounded-lg bg-green-50 dark:bg-green-900/10"><CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" /><span className="text-[10px]">STOP opcija</span></div>
              <div className="flex items-center gap-2 p-2 rounded-lg bg-green-50 dark:bg-green-900/10"><CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" /><span className="text-[10px]">Odjava kontakata</span></div>
              <div className="flex items-center gap-2 p-2 rounded-lg bg-green-50 dark:bg-green-900/10"><CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" /><span className="text-[10px]">Evidencija 1g</span></div>
              <div className="flex items-center gap-2 p-2 rounded-lg bg-amber-50 dark:bg-amber-900/10"><AlertCircle className="h-4 w-4 text-amber-500 shrink-0" /><span className="text-[10px]">DPA ugovor</span></div>
            </div>
          </CardContent>
        </Card>
    
        <Card>
          <CardHeader className="pb-3"><CardTitle className="text-sm">Sender ID-ovi</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-2">
              {[
                { id: 'REFLECTION', status: 'active', desc: 'Glavni sender za marketing poruke' },
                { id: 'OTP', status: 'active', desc: 'Sender za verifikacije i jednokratne šifre' },
                { id: '+38111123456', status: 'inactive', desc: 'Numerički sender' },
              ].map(sender => (
                <div key={sender.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-lg bg-muted flex items-center justify-center"><Smartphone className="h-4 w-4 text-muted-foreground" /></div>
                    <div><p className="text-xs font-medium font-mono">{sender.id}</p><p className="text-[10px] text-muted-foreground">{sender.desc}</p></div>
                  </div>
                  <Badge variant="outline" className={`text-[10px] ${sender.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>{sender.status === 'active' ? 'Aktivan' : 'Neaktivan'}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
    
        <Card>
          <CardHeader className="pb-3"><CardTitle className="text-sm">SMS provajderi</CardTitle></CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {[
                { name: 'Infobip', price: '3.2 RSD', coverage: 'Srbija, BiH, CG, MK', connected: true },
                { name: 'Twilio', price: '4.5 RSD', coverage: 'Global', connected: false },
                { name: 'Vonage', price: '4.0 RSD', coverage: 'Global', connected: false },
              ].map(p => (
                <div key={p.name} className="p-3 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs font-medium">{p.name}</p>
                    <Badge variant={p.connected ? 'default' : 'secondary'} className="text-[9px]">{p.connected ? 'Povezan' : 'Nije povezan'}</Badge>
                  </div>
                  <p className="text-[10px] text-muted-foreground">{p.price}/SMS</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
    
        <Card>
          <CardHeader className="pb-3"><CardTitle className="text-sm">SMS servisi i mogućnosti</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm">
              <div className="flex items-start gap-3"><CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" /><div><p className="font-medium text-xs">Bulk slanje</p><p className="text-[10px] text-muted-foreground">Pošaljite SMS do hiljadu primalaca odjednom</p></div></div>
              <div className="flex items-start gap-3"><CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" /><div><p className="font-medium text-xs">Personalizovane poruke</p><p className="text-[10px] text-muted-foreground">Koristite promenljive za dinamički sadržaj</p></div></div>
              <div className="flex items-start gap-3"><CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" /><div><p className="font-medium text-xs">Zakazano slanje</p><p className="text-[10px] text-muted-foreground">Planirajte slanje za optimalno vreme</p></div></div>
              <div className="flex items-start gap-3"><CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" /><div><p className="font-medium text-xs">Auto odgovori na ključne reči</p><p className="text-[10px] text-muted-foreground">INFO, STOP, START i druge ključne reči</p></div></div>
              <div className="flex items-start gap-3"><CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" /><div><p className="font-medium text-xs">Izveštaji i analitika</p><p className="text-[10px] text-muted-foreground">Praćenje isporuke, odgovora i troškova</p></div></div>
            </div>
          </CardContent>
        </Card>
      </div>
    </TabsContent>
  )
}

// ========== CampaignsTab ==========

export function CampaignsTab({ campaigns, filterCategory, filterStatus, filteredCampaigns, k, searchQuery, setFilterCategory, setFilterStatus }: { campaigns: any, filterCategory: any, filterStatus: any, filteredCampaigns: any, k: any, searchQuery: any, setFilterCategory: any, setFilterStatus: any }) {
  return (
    <TabsContent value="campaigns" className="space-y-4">
      <Card className="p-3">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /><Input placeholder="Pretraži kampanje..." className="pl-9" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} /></div>
          <Select value={filterStatus} onValueChange={setFilterStatus}><SelectTrigger className="w-[130px]"><SelectValue placeholder="Status" /></SelectTrigger><SelectContent><SelectItem value="all">Svi statusi</SelectItem>{Object.entries(STATUS_CONFIG).map(([k, v]) => <SelectItem key={k} value={k}>{v.label}</SelectItem>)}</SelectContent></Select>
          <Select value={filterCategory} onValueChange={setFilterCategory}><SelectTrigger className="w-[140px]"><SelectValue placeholder="Kategorija" /></SelectTrigger><SelectContent><SelectItem value="all">Sve kategorije</SelectItem>{TEMPLATE_CATEGORIES.map(c => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}</SelectContent></Select>
        </div>
      </Card>
    
      <p className="text-sm text-muted-foreground">{filteredCampaigns.length} kampanja · Ukupno {filteredCampaigns.reduce((s, c) => s + c.recipientCount, 0)} primalaca</p>
    
      {/* Campaign Analytics Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KpiCard label="Dostava" value={`${stats.deliveryRate}%`} icon={CheckCircle2} sub={`${stats.totalDelivered}/${stats.totalSent} isporučeno`} color="text-green-500" bg="bg-green-50 dark:bg-green-900/20" />
        <KpiCard label="Neuspele" value={stats.totalFailed} icon={AlertCircle} sub={`${stats.totalSent > 0 ? Math.round((stats.totalFailed / stats.totalSent) * 100) : 0}%`} color="text-red-500" bg="bg-red-50 dark:bg-red-900/20" />
        <KpiCard label="Odgovori" value={stats.totalReplies} icon={MessageSquare} sub={`${stats.totalSent > 0 ? Math.round((stats.totalReplies / stats.totalSent) * 100) : 0}% odgovora`} color="text-blue-500" bg="bg-blue-50 dark:bg-blue-900/20" />
        <KpiCard label="Trošak" value={formatRSD(stats.totalCost)} icon={DollarSign} sub={`Prosek: ${stats.totalSent > 0 ? formatRSD(stats.totalCost / stats.totalSent) : '0'} po SMS`} color="text-purple-500" bg="bg-purple-50 dark:bg-purple-900/20" />
      </div>
    
      {/* Delivery overview */}
      <Card>
        <CardHeader className="pb-3"><CardTitle className="text-sm">Pregled isporuke kampanja</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-2">
            {campaigns.filter(c => c.status === 'delivered' || c.status === 'sent').map(c => {
              const deliveryPct = c.recipientCount > 0 ? Math.round((c.deliveredCount / c.recipientCount) * 100) : 0
              const replyPct = c.sentCount > 0 ? Math.round((c.replyCount / c.sentCount) * 100) : 0
              return (
                <div key={c.id} className="flex items-center gap-3 p-2 rounded hover:bg-muted/30">
                  <span className="text-xs w-32 truncate font-medium">{c.name}</span>
                  <div className="flex-1 flex gap-1">
                    <div className="flex-1 bg-green-100 dark:bg-green-900/20 rounded-full h-3" style={{ width: `${deliveryPct}%` }}>
                      <div className="bg-green-500 h-3 rounded-full" style={{ width: '100%' }} />
                    </div>
                    <div className="flex-1 bg-blue-100 dark:bg-blue-900/20 rounded-full h-3" style={{ width: `${replyPct}%` }}>
                      <div className="bg-blue-500 h-3 rounded-full" style={{ width: '100%' }} />
                    </div>
                  </div>
                  <span className="text-[9px] text-muted-foreground w-20 text-right">{deliveryPct}% · {replyPct}%</span>
                </div>
              )
            })}
          </div>
          <div className="flex items-center gap-4 mt-3 text-[10px] text-muted-foreground">
            <div className="flex items-center gap-1"><div className="h-2 w-2 rounded-full bg-green-500" />Isporučeno</div>
            <div className="flex items-center gap-1"><div className="h-2 w-2 rounded-full bg-blue-500" />Odgovori</div>
          </div>
        </CardContent>
      </Card>
    
      {filteredCampaigns.length === 0 ? (
        <Card className="p-8 text-center"><Megaphone className="h-12 w-12 mx-auto mb-3 text-muted-foreground" /><p className="text-muted-foreground">Nema SMS kampanja</p><Button className="mt-3" onClick={() => setCampaignDialogOpen(true)}><Plus className="h-4 w-4 mr-1" /> Kreiraj kampanju</Button></Card>
      ) : (
        <>
          {/* Drafts */}
          {campaigns.filter(c => c.status === 'draft').length > 0 && (
            <Card>
              <CardHeader className="pb-3"><CardTitle className="text-sm">Nacrti ({campaigns.filter(c => c.status === 'draft').length})</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {campaigns.filter(c => c.status === 'draft').map(c => (
                    <div key={c.id} className="flex items-center justify-between p-3 border border-dashed rounded-lg">
                      <div><p className="text-xs font-medium">{c.name}</p><p className="text-[10px] text-muted-foreground">{c.content.length} znakova</p></div>
                      <div className="flex gap-1">
                        <Button variant="outline" size="sm" className="text-xs" onClick={() => { setSelectedCampaign(c); setDetailOpen(true) }}><Eye className="h-3.5 w-3.5 mr-1" /> Pregled</Button>
                        <Button size="sm" className="text-xs"><Send className="h-3.5 w-3.5 mr-1" /> Pošalji</Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
          {/* Scheduled */}
          {campaigns.filter(c => c.status === 'scheduled').length > 0 && (
            <Card>
              <CardHeader className="pb-3"><CardTitle className="text-sm">Zakazano ({campaigns.filter(c => c.status === 'scheduled').length})</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {campaigns.filter(c => c.status === 'scheduled').map(c => (
                    <div key={c.id} className="flex items-center justify-between p-3 border border-blue-200 bg-blue-50/50 rounded-lg">
                      <div><p className="text-xs font-medium">{c.name}</p><p className="text-[10px] text-muted-foreground">📅 {c.scheduledDate ? formatDate(c.scheduledDate) : '-'} · {c.recipientCount} primalaca</p></div>
                      <div className="flex gap-1">
                        <Button variant="outline" size="sm" className="text-xs" onClick={() => { setSelectedCampaign(c); setDetailOpen(true) }}><Eye className="h-3.5 w-3.5 mr-1" /> Pregled</Button>
                        <Button variant="outline" size="sm" className="text-xs text-red-600"><X className="h-3.5 w-3.5 mr-1" /> Otkaži</Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
          {/* Sent */}
          <div className="space-y-3">
          {filteredCampaigns.map(c => (
            <Card key={c.id} className="hover:bg-muted/30 transition-colors">
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-sm font-medium">{c.name}</p>
                      <Badge variant="outline" className={`text-[10px] ${STATUS_CONFIG[c.status]?.color}`}>{STATUS_CONFIG[c.status]?.label}</Badge>
                      <Badge variant="secondary" className="text-[9px]">{c.category}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground bg-muted/30 rounded p-2 line-clamp-2">{c.content}</p>
                    <div className="flex flex-wrap gap-3 mt-2 text-[10px] text-muted-foreground">
                      <span>📱 {c.sentCount}/{c.recipientCount} poslato</span>
                      <span>✅ {c.deliveredCount} isporučeno</span>
                      {c.failedCount > 0 && <span className="text-red-500">❌ {c.failedCount} grešaka</span>}
                      <span>💬 {c.replyCount} odgovora</span>
                      <span>💰 {formatRSD(c.totalCost)}</span>
                      <span>📅 {formatDate(c.createdAt)}</span>
                      {c.senderId && <span>📤 {c.senderId}</span>}
                    </div>
                    {c.recipientCount > 0 && <Progress value={(c.deliveredCount / c.recipientCount) * 100} className="mt-2 h-1.5" />}
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => { setSelectedCampaign(c); setDetailOpen(true) }}><Eye className="h-3.5 w-3.5" /></Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7"><Copy className="h-3.5 w-3.5" /></Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </>
      )}
    </TabsContent>
  )
}

// ========== TemplatesTab ==========

export function TemplatesTab({ templates }: { templates: any }) {
  return (
    <TabsContent value="templates" className="space-y-4">
      <div className="flex items-center justify-between"><p className="text-sm text-muted-foreground">{templates.length} template-a · {templates.filter(t => t.isDefault).length} podrazumevanih · Ukupno {templates.reduce((s, t) => s + t.usedCount, 0)} korišćenja</p><Button size="sm" onClick={() => setTemplateDialogOpen(true)}><Plus className="h-4 w-4 mr-1" /> Novi template</Button></div>
    
      {/* Template stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KpiCard label="Template-a" value={templates.length} icon={FileText} color="text-blue-500" bg="bg-blue-50 dark:bg-blue-900/20" />
        <KpiCard label="Podrazumevani" value={templates.filter(t => t.isDefault).length} icon={Star} color="text-amber-500" bg="bg-amber-50 dark:bg-amber-900/20" />
        <KpiCard label="Ukupno korišćeno" value={templates.reduce((s, t) => s + t.usedCount, 0)} icon={TrendingUp} color="text-green-500" bg="bg-green-50 dark:bg-green-900/20" />
        <KpiCard label="Kategorije" value={new Set(templates.map(t => t.category)).size} icon={LayoutGrid} color="text-purple-500" bg="bg-purple-50 dark:bg-purple-900/20" />
      </div>
    
      {/* Template usage */}
      <Card>
        <CardHeader className="pb-3"><CardTitle className="text-sm">Upotreba template-a</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-2">
            {templates.sort((a, b) => b.usedCount - a.usedCount).map(tpl => {
              const maxTpl = Math.max(...templates.map(t => t.usedCount), 1)
              return (
                <div key={tpl.id} className="flex items-center gap-3">
                  <span className="text-xs w-28 truncate">{tpl.name}</span>
                  <div className="flex-1 bg-muted rounded-full h-2.5"><div className={`h-2.5 rounded-full ${tpl.isDefault ? 'bg-amber-400' : 'bg-primary'}`} style={{ width: `${(tpl.usedCount / maxTpl) * 100}%` }} /></div>
                  <span className="text-[10px] font-mono w-12 text-right">{tpl.usedCount}x</span>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
      <div className="space-y-3">
        {templates.map(tpl => (
          <Card key={tpl.id} className="hover:bg-muted/30 transition-colors">
            <CardContent className="p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-sm font-medium">{tpl.name}</p>
                    <Badge variant="secondary" className="text-[10px]">{tpl.category}</Badge>
                    {tpl.isDefault && <Badge variant="outline" className="text-[9px] text-amber-600">Podrazumevani</Badge>}
                  </div>
                  <p className="text-xs text-muted-foreground bg-muted/30 rounded p-2">{tpl.body}</p>
                  {tpl.variables.length > 0 && <div className="flex gap-1 mt-2">{tpl.variables.map(v => <Badge key={v} variant="secondary" className="text-[9px]">{v}</Badge>)}</div>}
                  <p className="text-[10px] text-muted-foreground mt-1">Korišćen {tpl.usedCount}x · {tpl.body.length}/{SMS_MAX_CHARS} znakova</p>
                </div>
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => { setTemplateForm({ name: tpl.name, category: tpl.category, body: tpl.body }); setTemplateDialogOpen(true) }}><Edit3 className="h-3.5 w-3.5" /></Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </TabsContent>
  )
}

// ========== ContactsTab ==========

export function ContactsTab({ contacts }: { contacts: any }) {
  return (
    <TabsContent value="contacts" className="space-y-4">
      <div className="flex items-center justify-between"><p className="text-sm text-muted-foreground">{contacts.length} kontakata · {stats.activeContacts} aktivnih · {stats.unsubscribed} odjavljenih</p><div className="flex gap-2"><Button variant="outline" size="sm" onClick={() => showToast('Uvoz kontakata - CSV format podržan')}><Upload className="h-4 w-4 mr-1" /> Uvoz</Button><Button variant="outline" size="sm" onClick={() => showToast('Izvoz kontakata - CSV skinut')}><Download className="h-4 w-4 mr-1" /> Izvoz</Button><Button size="sm" onClick={() => setContactDialogOpen(true)}><Plus className="h-4 w-4 mr-1" /> Novi kontakt</Button></div></div>
    
      {/* Contact Stats */}
      <div className="grid grid-cols-3 gap-3">
        <Card className="p-3"><div className="flex items-center gap-2"><div className="h-7 w-7 rounded-full bg-green-100 flex items-center justify-center"><Users className="h-3.5 w-3.5 text-green-600" /></div><div><p className="text-lg font-bold">{stats.activeContacts}</p><p className="text-[10px] text-muted-foreground">Aktivnih</p></div></div></Card>
        <Card className="p-3"><div className="flex items-center gap-2"><div className="h-7 w-7 rounded-full bg-gray-100 flex items-center justify-center"><UserPlus className="h-3.5 w-3.5 text-gray-600" /></div><div><p className="text-lg font-bold">{contacts.filter(c => c.status === 'inactive').length}</p><p className="text-[10px] text-muted-foreground">Neaktivnih</p></div></div></Card>
        <Card className="p-3"><div className="flex items-center gap-2"><div className="h-7 w-7 rounded-full bg-red-100 flex items-center justify-center"><UserPlus className="h-3.5 w-3.5 text-red-600" /></div><div><p className="text-lg font-bold">{stats.unsubscribed}</p><p className="text-[10px] text-muted-foreground">Odjavljenih</p></div></div></Card>
      </div>
    
      {/* Contact Groups */}
      <Card>
        <CardHeader className="pb-3"><CardTitle className="text-sm">Grupe kontakata</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-2">
            {CONTACT_GROUPS.map(group => {
              const count = contacts.filter(c => c.groups.includes(group)).length
              return (
                <div key={group} className="flex items-center gap-2 p-2 border rounded-lg hover:bg-muted/30 cursor-pointer">
                  <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center"><Users className="h-3 w-3 text-primary" /></div>
                  <div><p className="text-[10px] font-medium">{group}</p><p className="text-[9px] text-muted-foreground">{count}</p></div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
      <Card>
        <div className="max-h-[500px] overflow-y-auto">
          <table className="w-full">
            <thead className="sticky top-0 bg-muted/50"><tr className="text-left text-xs text-muted-foreground border-b"><th className="p-3">Naziv</th><th className="p-3 hidden md:table-cell">Telefon</th><th className="p-3 hidden lg:table-cell">Grupa</th><th className="p-3">Status</th><th className="p-3 hidden md:table-cell">Poruke</th><th className="p-3 hidden lg:table-cell">Zadnja aktivnost</th></tr></thead>
            <tbody>
              {contacts.map(c => (
                <tr key={c.id} className="border-b last:border-0 hover:bg-muted/30">
                  <td className="p-3 text-xs font-medium">{c.name}</td>
                  <td className="p-3 text-xs font-mono hidden md:table-cell">{c.phone}</td>
                  <td className="p-3 hidden lg:table-cell"><div className="flex gap-1">{c.groups.map(g => <Badge key={g} variant="secondary" className="text-[9px]">{g}</Badge>)}</div></td>
                  <td className="p-3"><Badge variant="outline" className={`text-[10px] ${CONTACT_STATUS[c.status]?.color}`}>{CONTACT_STATUS[c.status]?.label}</Badge></td>
                  <td className="p-3 text-xs hidden md:table-cell">{c.totalSent}↑ {c.totalReceived}↓</td>
                  <td className="p-3 text-[10px] text-muted-foreground hidden lg:table-cell">{c.lastActivity ? formatDate(c.lastActivity) : '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </TabsContent>
  )
}

// ========== LogsTab ==========

export function LogsTab({ logs, searchQuery }: { logs: any, searchQuery: any }) {
  return (
    <TabsContent value="logs" className="space-y-4">
      <Card className="p-3">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /><Input placeholder="Pretraži log..." className="pl-9" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} /></div>
          <Select><SelectTrigger className="w-[130px]"><SelectValue placeholder="Smer" /></SelectTrigger><SelectContent><SelectItem value="all">Svi</SelectItem><SelectItem value="inbound">Dolazne</SelectItem><SelectItem value="outbound">Odlazne</SelectItem></SelectContent></Select>
          <Select><SelectTrigger className="w-[130px]"><SelectValue placeholder="Status" /></SelectTrigger><SelectContent><SelectItem value="all">Svi</SelectItem><SelectItem value="delivered">Isporučeno</SelectItem><SelectItem value="failed">Greška</SelectItem><SelectItem value="received">Primljeno</SelectItem></SelectContent></Select>
        </div>
      </Card>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KpiCard label="Ukupno" value={logs.length} icon={MessageSquare} color="text-blue-500" bg="bg-blue-50 dark:bg-blue-900/20" />
        <KpiCard label="Odlazne" value={logs.filter(l => l.direction === 'outbound').length} icon={Send} color="text-green-500" bg="bg-green-50 dark:bg-green-900/20" />
        <KpiCard label="Dolazne" value={logs.filter(l => l.direction === 'inbound').length} icon={MessageSquare} color="text-amber-500" bg="bg-amber-50 dark:bg-amber-900/20" />
        <KpiCard label="Neuspele" value={logs.filter(l => l.status === 'failed').length} icon={AlertCircle} color="text-red-500" bg="bg-red-50 dark:bg-red-900/20" />
      </div>
      <Card>
        <div className="max-h-[500px] overflow-y-auto">
          <div className="space-y-1">
            {logs.map(log => (
              <div key={log.id} className="flex items-start gap-3 p-3 border-b last:border-0 hover:bg-muted/30">
                <div className={`h-7 w-7 rounded-full flex items-center justify-center shrink-0 text-[10px] ${log.direction === 'inbound' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>{log.direction === 'inbound' ? '↓' : '↑'}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium">{log.contactName || log.phone}</span>
                    <span className="text-[10px] text-muted-foreground">{log.phone}</span>
                  </div>
                  <p className="text-xs mt-0.5">{log.content}</p>
                </div>
                <div className="text-right shrink-0">
                  <Badge variant="outline" className={`text-[9px] ${log.status === 'delivered' ? 'bg-green-100 text-green-700' : log.status === 'failed' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}`}>{log.status}</Badge>
                  <p className="text-[9px] text-muted-foreground mt-1">{formatDate(log.createdAt)}</p>
                  {log.cost > 0 && <p className="text-[9px] text-muted-foreground">{formatRSD(log.cost)}</p>}
                </div>
              </div>
            ))}
          </div>
        </div>
      </Card>
    </TabsContent>
  )
}

// ========== KeywordsTab ==========

export function KeywordsTab({ keywords }: { keywords: any }) {
  return (
    <TabsContent value="keywords" className="space-y-4">
      <div className="flex items-center justify-between"><p className="text-sm text-muted-foreground">{keywords.filter(k => k.enabled).length} aktivnih od {keywords.length}</p><Button size="sm" onClick={() => setKeywordDialogOpen(true)}><Plus className="h-4 w-4 mr-1" /> Nova ključna reč</Button></div>
    
      {/* Keyword Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KpiCard label="Ukupno pokretanja" value={keywords.reduce((s, k) => s + k.matchCount, 0)} icon={Zap} color="text-purple-500" bg="bg-purple-50 dark:bg-purple-900/20" />
        <KpiCard label="Auto odgovori" value={keywords.filter(k => k.autoReply && k.enabled).length} icon={Bot} color="text-green-500" bg="bg-green-50 dark:bg-green-900/20" />
        <KpiCard label="Prosleđenja" value={keywords.filter(k => k.forwardTo && k.enabled).length} icon={Mail} color="text-blue-500" bg="bg-blue-50 dark:bg-blue-900/20" />
        <KpiCard label="Najpopularnija" value={keywords.sort((a, b) => b.matchCount - a.matchCount)[0]?.keyword || '-'} icon={TrendingUp} color="text-amber-500" bg="bg-amber-50 dark:bg-amber-900/20" />
      </div>
    
      {/* Keyword distribution */}
      <Card>
        <CardHeader className="pb-3"><CardTitle className="text-sm">Distribucija ključnih reči</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-2">
            {keywords.sort((a, b) => b.matchCount - a.matchCount).map(kw => {
              const maxKw = Math.max(...keywords.map(k => k.matchCount), 1)
              return (
                <div key={kw.id} className="flex items-center gap-3">
                  <span className="text-xs font-mono font-bold w-16">{kw.keyword}</span>
                  <div className="flex-1 bg-muted rounded-full h-3"><div className={`h-3 rounded-full ${kw.enabled ? 'bg-primary' : 'bg-gray-400'}`} style={{ width: `${(kw.matchCount / maxKw) * 100}%` }} /></div>
                  <span className="text-xs font-mono w-8 text-right">{kw.matchCount}</span>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
      <div className="space-y-3">
        {keywords.map(kw => (
          <Card key={kw.id} className={kw.enabled ? '' : 'opacity-60'}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-sm font-bold font-mono">{kw.keyword}</p>
                    <Badge variant="secondary" className="text-[10px]">Pokrenuto {kw.matchCount}x</Badge>
                    {kw.autoReply && <Badge variant="outline" className="text-[9px] bg-blue-100 text-blue-700">Auto odgovor</Badge>}
                    {kw.forwardTo && <Badge variant="outline" className="text-[9px]">→ {kw.forwardTo}</Badge>}
                  </div>
                  {kw.response && <p className="text-xs text-muted-foreground bg-muted/30 rounded p-2 whitespace-pre-line">{kw.response}</p>}
                </div>
                <Switch checked={kw.enabled} onCheckedChange={() => handleToggleKeyword(kw.id)} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </TabsContent>
  )
}

// ========== SettingsTab ==========

export function SettingsTab({  }: {  }) {
  return (
    <TabsContent value="settings" className="space-y-4">
      <Card>
        <CardHeader className="pb-3"><CardTitle className="text-sm">SMS Gateway podešavanja</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2"><Label className="text-xs">Provider</Label><Select defaultValue="infobip"><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="infobip">Infobip</SelectItem><SelectItem value="twilio">Twilio</SelectItem><SelectItem value="vonage">Vonage</SelectItem><SelectItem value="mobilink">Mobilink</SelectItem></SelectContent></Select></div>
            <div className="space-y-2"><Label className="text-xs">API Key</Label><Input type="password" defaultValue="sk-sms-xxxxxxxxxxxx" /></div>
            <div className="space-y-2"><Label className="text-xs">Default Sender ID</Label><Input defaultValue="REFLECTION" /></div>
            <div className="space-y-2"><Label className="text-xs">Cena po SMS (RSD)</Label><Input defaultValue="3.50" disabled /></div>
          </div>
          <div className="flex items-center gap-2"><Switch defaultChecked /><Label className="text-xs">Test režim (ne šalje prave poruke)</Label></div>
        </CardContent>
      </Card>
    
      <Card>
        <CardHeader className="pb-3"><CardTitle className="text-sm">Zakonski okvir (Republika Srbija)</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
            <div className="p-3 bg-muted/30 rounded-lg text-center"><p className="text-muted-foreground">Max znakova (GSM7)</p><p className="text-lg font-bold">{SMS_MAX_CHARS}</p></div>
            <div className="p-3 bg-muted/30 rounded-lg text-center"><p className="text-muted-foreground">Max znakova (Unicode)</p><p className="text-lg font-bold">{SMS_UNICODE_MAX}</p></div>
            <div className="p-3 bg-muted/30 rounded-lg text-center"><p className="text-muted-foreground">Max primalaca</p><p className="text-lg font-bold">10.000</p></div>
            <div className="p-3 bg-muted/30 rounded-lg text-center"><p className="text-muted-foreground">Brzina</p><p className="text-lg font-bold">100/s</p></div>
          </div>
          <Separator />
          <div className="space-y-2 text-xs text-muted-foreground">
            <p>• Zakon o elektronskim komunikacijama (RS)</p>
            <p>• Svaka marketing poruka mora imati STOP opciju</p>
            <p>• Poštovanje radnog vremena za marketing kampanje (8-21h)</p>
            <p>• Evidencija o slanju i odjavi minimum 1 godina</p>
            <p>• Ne slati na brojeve na NDOS listi</p>
          </div>
        </CardContent>
      </Card>
    
      <Card>
        <CardHeader className="pb-3"><CardTitle className="text-sm">Webhook podešavanja</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {['message.received', 'message.delivered', 'message.failed', 'contact.unsubscribed', 'keyword.matched'].map(evt => (
              <div key={evt} className="flex items-center gap-2 p-2 border rounded-lg"><Switch defaultChecked /><Label className="text-xs">{evt}</Label></div>
            ))}
          </div>
          <div className="space-y-2"><Label className="text-xs">Webhook URL</Label><Input defaultValue="https://api.example.rs/sms/webhook" disabled /></div>
        </CardContent>
      </Card>
    
      <Card>
        <CardHeader className="pb-3"><CardTitle className="text-sm">Ograničenja i napomene</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-3 text-xs text-muted-foreground">
            <div className="flex items-start gap-2"><AlertCircle className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" /><div><p className="font-medium text-foreground">Mesečni limit</p><p className="mt-0.5">Proverite vaš mesečni limit sa provajderom. Prekoračenje limita zaustavlja slanje.</p></div></div>
            <div className="flex items-start gap-2"><AlertCircle className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" /><div><p className="font-medium text-foreground">Dugačke poruke</p><p className="mt-0.5">Poruke duže od {SMS_MAX_CHARS} znakova se dele na više SMS-a i naplaćuju duplo.</p></div></div>
            <div className="flex items-start gap-2"><AlertCircle className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" /><div><p className="font-medium text-foreground">Unicode karakteri</p><p className="mt-0.5">Ćirilična slova koriste Unicode encoding (max {SMS_UNICODE_MAX} znakova po SMS-u).</p></div></div>
            <div className="flex items-start gap-2"><CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" /><div><p className="font-medium text-foreground">Automatsko ponovno slanje</p><p className="mt-0.5">Neuspele poruke se automatski ponavljaju 3 puta u intervalima od 5 minuta.</p></div></div>
          </div>
        </CardContent>
      </Card>
    </TabsContent>
  )
}

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { Switch } from '@/components/ui/switch'
import { TabsContent } from '@/components/ui/tabs'

// ========== NovaSMSkampanja ==========

export function NovaSMSkampanja({ campaignDialogOpen, handleCreateCampaign, setCampaignDialogOpen }: { campaignDialogOpen: any, handleCreateCampaign: any, setCampaignDialogOpen: any }) {
  return (
    <Dialog open={campaignDialogOpen} onOpenChange={setCampaignDialogOpen}>
            <DialogContent className="max-w-lg"><DialogHeader><DialogTitle>Nova SMS kampanja</DialogTitle><DialogDescription>Kreirajte novu SMS kampanju</DialogDescription></DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2"><Label className="text-xs">Naziv kampanje *</Label><Input value={campaignForm.name} onChange={(e) => setCampaignForm({ ...campaignForm, name: e.target.value })} placeholder="npr. Zimska rasprodaja" /></div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2"><Label className="text-xs">Kategorija</Label><Select value={campaignForm.category} onValueChange={(v) => setCampaignForm({ ...campaignForm, category: v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{TEMPLATE_CATEGORIES.map(c => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}</SelectContent></Select></div>
                  <div className="space-y-2"><Label className="text-xs">Datum slanja</Label><Input type="datetime-local" value={campaignForm.scheduledDate} onChange={(e) => setCampaignForm({ ...campaignForm, scheduledDate: e.target.value })} /></div>
                </div>
                <div className="space-y-2"><Label className="text-xs">Sender ID</Label><Input value={campaignForm.senderId} onChange={(e) => setCampaignForm({ ...campaignForm, senderId: e.target.value })} maxLength={11} /></div>
                <div className="space-y-2">
                  <Label className="text-xs">Sadržaj poruke * (max {SMS_MAX_CHARS} znakova)</Label>
                  <Textarea value={campaignForm.content} onChange={(e) => setCampaignForm({ ...campaignForm, content: e.target.value })} rows={3} placeholder="Vaša poruka..." />
                  <div className="flex items-center justify-between text-[10px] text-muted-foreground"><span>{campaignForm.content.length} znakova</span><span>{Math.ceil(campaignForm.content.length / SMS_MAX_CHARS)} SMS-a · {formatRSD(Math.ceil(campaignForm.content.length / SMS_MAX_CHARS) * 3.5)}</span></div>
                  <Progress value={Math.min(100, (campaignForm.content.length / SMS_MAX_CHARS) * 100)} className="h-1.5" />
                </div>
                <Alert className="bg-amber-50 border-amber-200 dark:bg-amber-900/10 dark:border-amber-800"><AlertCircle className="h-4 w-4 text-amber-600" /><AlertDescription className="text-amber-700 dark:text-amber-400 text-xs">Podsetite se na STOP opciju za marketinške kampanje.</AlertDescription></Alert>
              </div>
              <DialogFooter className="gap-2"><Button variant="outline" onClick={() => setCampaignDialogOpen(false)}>Otkaži</Button><Button onClick={handleCreateCampaign} disabled={!campaignForm.name.trim() || !campaignForm.content.trim()}>Kreiraj kampanju</Button></DialogFooter>
            </DialogContent>
          </Dialog>
  )
}


// ========== NoviSMStemplate ==========

export function NoviSMStemplate({ handleCreateTemplate, setTemplateDialogOpen, templateDialogOpen }: { handleCreateTemplate: any, setTemplateDialogOpen: any, templateDialogOpen: any }) {
  return (
    <Dialog open={templateDialogOpen} onOpenChange={setTemplateDialogOpen}>
            <DialogContent className="max-w-lg"><DialogHeader><DialogTitle>Novi SMS template</DialogTitle></DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2"><Label className="text-xs">Naziv *</Label><Input value={templateForm.name} onChange={(e) => setTemplateForm({ ...templateForm, name: e.target.value })} /></div>
                  <div className="space-y-2"><Label className="text-xs">Kategorija</Label><Select value={templateForm.category} onValueChange={(v) => setTemplateForm({ ...templateForm, category: v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{TEMPLATE_CATEGORIES.map(c => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}</SelectContent></Select></div>
                </div>
                <div className="space-y-2"><Label className="text-xs">Sadržaj * (koristite {ime}, {broj} za promenljive)</Label><Textarea value={templateForm.body} onChange={(e) => setTemplateForm({ ...templateForm, body: e.target.value })} rows={3} /><p className="text-[10px] text-muted-foreground">{templateForm.body.length}/{SMS_MAX_CHARS} znakova · {(templateForm.body.match(/\{(\w+)\}/g) || []).length} promenljivih</p></div>
              </div>
              <DialogFooter className="gap-2"><Button variant="outline" onClick={() => setTemplateDialogOpen(false)}>Otkaži</Button><Button onClick={handleCreateTemplate}>Kreiraj template</Button></DialogFooter>
            </DialogContent>
          </Dialog>
  )
}


// ========== Novikontakt ==========

export function Novikontakt({ contactDialogOpen, g, handleCreateContact, setContactDialogOpen }: { contactDialogOpen: any, g: any, handleCreateContact: any, setContactDialogOpen: any }) {
  return (
    <Dialog open={contactDialogOpen} onOpenChange={setContactDialogOpen}>
            <DialogContent className="max-w-md"><DialogHeader><DialogTitle>Novi kontakt</DialogTitle></DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2"><Label className="text-xs">Naziv *</Label><Input value={contactForm.name} onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })} /></div>
                <div className="space-y-2"><Label className="text-xs">Telefon *</Label><Input value={contactForm.phone} onChange={(e) => setContactForm({ ...contactForm, phone: e.target.value })} placeholder="+3816XXXXXXXX" /></div>
                <div className="space-y-2"><Label className="text-xs">Grupa</Label><Select value={contactForm.groups} onValueChange={(v) => setContactForm({ ...contactForm, groups: v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{CONTACT_GROUPS.map(g => <SelectItem key={g} value={g}>{g}</SelectItem>)}</SelectContent></Select></div>
              </div>
              <DialogFooter className="gap-2"><Button variant="outline" onClick={() => setContactDialogOpen(false)}>Otkaži</Button><Button onClick={handleCreateContact}>Dodaj kontakt</Button></DialogFooter>
            </DialogContent>
          </Dialog>
  )
}


// ========== Novakljunare ==========

export function Novakljunare({ handleCreateKeyword, keywordDialogOpen, setKeywordDialogOpen }: { handleCreateKeyword: any, keywordDialogOpen: any, setKeywordDialogOpen: any }) {
  return (
    <Dialog open={keywordDialogOpen} onOpenChange={setKeywordDialogOpen}>
            <DialogContent className="max-w-md"><DialogHeader><DialogTitle>Nova ključna reč</DialogTitle></DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2"><Label className="text-xs">Ključna reč *</Label><Input value={keywordForm.keyword} onChange={(e) => setKeywordForm({ ...keywordForm, keyword: e.target.value })} placeholder="npr. INFO" /></div>
                <div className="space-y-2"><Label className="text-xs">Auto odgovor</Label><div className="flex items-center gap-2"><Switch checked={keywordForm.autoReply} onCheckedChange={(v) => setKeywordForm({ ...keywordForm, autoReply: v })} /><Label className="text-xs">{keywordForm.autoReply ? 'Aktivno' : 'Neaktivno'}</Label></div></div>
                {keywordForm.autoReply && <div className="space-y-2"><Label className="text-xs">Odgovor</Label><Textarea value={keywordForm.response} onChange={(e) => setKeywordForm({ ...keywordForm, response: e.target.value })} rows={3} /></div>}
                <div className="space-y-2"><Label className="text-xs">Prosledi na (opcionalno)</Label><Input value={keywordForm.forwardTo} onChange={(e) => setKeywordForm({ ...keywordForm, forwardTo: e.target.value })} placeholder="email@primer.rs" /></div>
              </div>
              <DialogFooter className="gap-2"><Button variant="outline" onClick={() => setKeywordDialogOpen(false)}>Otkaži</Button><Button onClick={handleCreateKeyword}>Kreiraj</Button></DialogFooter>
            </DialogContent>
          </Dialog>
  )
}


// ========== SelectedCampaignname ==========

export function SelectedCampaignname({ detailOpen, selectedCampaign, setDetailOpen }: { detailOpen: any, selectedCampaign: any, setDetailOpen: any }) {
  return (
    <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
            <DialogContent className="max-w-lg">
              {selectedCampaign && (<>
                <DialogHeader><DialogTitle>{selectedCampaign.name}</DialogTitle></DialogHeader>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div><span className="text-xs text-muted-foreground">Status</span><br /><Badge variant="outline" className={STATUS_CONFIG[selectedCampaign.status]?.color}>{STATUS_CONFIG[selectedCampaign.status]?.label}</Badge></div>
                    <div><span className="text-xs text-muted-foreground">Kategorija</span><br /><Badge variant="secondary">{selectedCampaign.category}</Badge></div>
                    <div><span className="text-xs text-muted-foreground">Kreirano</span><br /><span className="text-xs">{formatDate(selectedCampaign.createdAt)}</span></div>
                    <div><span className="text-xs text-muted-foreground">Sender ID</span><br /><span className="text-xs">{selectedCampaign.senderId || '-'}</span></div>
                  </div>
                  <div className="grid grid-cols-4 gap-2">
                    <div className="text-center p-2 bg-muted/30 rounded"><p className="text-[10px] text-muted-foreground">Primalaca</p><p className="text-sm font-bold">{selectedCampaign.recipientCount}</p></div>
                    <div className="text-center p-2 bg-green-50 dark:bg-green-900/10 rounded"><p className="text-[10px] text-muted-foreground">Isporučeno</p><p className="text-sm font-bold">{selectedCampaign.deliveredCount}</p></div>
                    <div className="text-center p-2 bg-red-50 dark:bg-red-900/10 rounded"><p className="text-[10px] text-muted-foreground">Greške</p><p className="text-sm font-bold text-red-600">{selectedCampaign.failedCount}</p></div>
                    <div className="text-center p-2 bg-amber-50 dark:bg-amber-900/10 rounded"><p className="text-[10px] text-muted-foreground">Odgovori</p><p className="text-sm font-bold">{selectedCampaign.replyCount}</p></div>
                  </div>
                  <Progress value={selectedCampaign.recipientCount > 0 ? (selectedCampaign.deliveredCount / selectedCampaign.recipientCount) * 100 : 0} className="h-2" />
                  <p className="text-[10px] text-muted-foreground text-center">Dostava: {selectedCampaign.recipientCount > 0 ? Math.round((selectedCampaign.deliveredCount / selectedCampaign.recipientCount) * 100) : 0}%</p>
                  <Separator />
                  <div><span className="text-xs text-muted-foreground">Sadržaj poruke</span><p className="text-sm mt-1 p-3 bg-muted/30 rounded">{selectedCampaign.content}</p></div>
                  <div className="flex items-center justify-between text-xs"><span className="text-muted-foreground">Trošak</span><span className="font-medium">{formatRSD(selectedCampaign.totalCost)}</span></div>
                </div>
              </>)}
            </DialogContent>
          </Dialog>
  )
}

