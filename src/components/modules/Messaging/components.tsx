'use client'import { AlertCircle, CheckCircle2, ChevronRight, Edit3, Eye, MessageSquare, MoreVertical, Plus, Search, Send, Smile, Star } from 'lucide-react'



// ========== OverviewTab ==========

export function OverviewTab({ autoReplies, campaigns, conversations, templates }: { autoReplies: any, campaigns: any, conversations: any, templates: any }) {
  return (
    <TabsContent value="overview" className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KpiCard label="Danas poruka" value={stats.todayMsgs} icon={MessageSquare} sub={`${stats.totalMsgs} ukupno`} color="text-green-500" bg="bg-green-50 dark:bg-green-900/20" />
        <KpiCard label="Dolazne" value={stats.inbound} icon={PhoneIncoming} sub={`${stats.outbound} odlaznih`} color="text-blue-500" bg="bg-blue-50 dark:bg-blue-900/20" />
        <KpiCard label="Nepročitane" value={stats.unread} icon={Bell} sub={`${stats.openConvs} otvorenih`} color="text-amber-500" bg="bg-amber-50 dark:bg-amber-900/20" />
        <KpiCard label="Kontakti" value={stats.totalContacts} icon={Users} sub={`${stats.pendingConvs} čeka dodelu`} color="text-purple-500" bg="bg-purple-50 dark:bg-purple-900/20" />
      </div>
    
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Unread conversations */}
        {stats.unread > 0 && (
          <Card className="border-amber-200 dark:border-amber-800 md:col-span-2">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2 text-amber-600"><AlertCircle className="h-4 w-4" /> Nepročitane poruke ({stats.unread})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {conversations.filter(c => c.unreadCount > 0).map(c => (
                  <div key={c.id} className="flex items-center gap-3 p-2 rounded hover:bg-amber-50 dark:hover:bg-amber-900/10 cursor-pointer" onClick={() => { setSelectedConv(c); setActiveTab('messages') }}>
                    <div className={`h-8 w-8 rounded-full flex items-center justify-center text-white text-xs font-medium ${getAvatarColor(c.contactName)}`}>{getInitials(c.contactName)}</div>
                    <div className="flex-1 min-w-0"><p className="text-sm font-medium">{c.contactName}</p><p className="text-xs text-muted-foreground truncate">{c.lastMessage}</p></div>
                    <Badge variant="outline" className="text-[10px] bg-amber-100 text-amber-700">{c.unreadCount}</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
    
        {/* Activity by hour */}
        <Card>
          <CardHeader className="pb-3"><CardTitle className="text-sm">Aktivnost po satima</CardTitle></CardHeader>
          <CardContent>
            <div className="flex items-end gap-1 h-32">
              {Array.from({ length: 24 }, (_, h) => {
                const count = stats.msgByHour[h] || 0
                const maxH = Math.max(...Object.values(stats.msgByHour), 1)
                return (
                  <div key={h} className="flex-1 flex flex-col items-center gap-1">
                    <div className={`w-full rounded-t-sm ${count > 0 ? 'bg-green-400' : 'bg-muted'} transition-all`} style={{ height: `${(count / maxH) * 100}%`, minHeight: count > 0 ? '4px' : '2px' }} />
                  </div>
                )
              })}
            </div>
            <div className="flex justify-between mt-1 text-[9px] text-muted-foreground"><span>00</span><span>06</span><span>12</span><span>18</span><span>23</span></div>
          </CardContent>
        </Card>
    
        {/* Stats breakdown */}
        <Card>
          <CardHeader className="pb-3"><CardTitle className="text-sm">Statistika poruka</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs"><span className="text-muted-foreground">Ukupno poruka</span><span className="font-medium">{stats.totalMsgs}</span></div>
              <div className="flex items-center justify-between text-xs"><span className="text-muted-foreground">Danas</span><span className="font-medium">{stats.todayMsgs}</span></div>
              <div className="flex items-center justify-between text-xs"><span className="text-green-600">Dolazne</span><span className="font-medium">{stats.inbound}</span></div>
              <div className="flex items-center justify-between text-xs"><span className="text-blue-600">Odlazne</span><span className="font-medium">{stats.outbound}</span></div>
              {stats.failed > 0 && <div className="flex items-center justify-between text-xs"><span className="text-red-600">Neuspele</span><span className="font-medium">{stats.failed}</span></div>}
            </div>
            <Separator />
            <div className="space-y-2">
              <p className="text-xs font-medium">Template-i</p>
              <div className="flex items-center gap-2 text-xs">
                <Badge variant="secondary" className="text-[10px]">{templates.filter(t => t.status === 'approved').length} odobrenih</Badge>
                <Badge variant="outline" className="text-[10px]">{templates.filter(t => t.status === 'pending').length} na čekanju</Badge>
              </div>
            </div>
            <Separator />
            <div className="space-y-2">
              <p className="text-xs font-medium">Chatbot</p>
              <div className="flex items-center gap-2 text-xs">
                <Badge variant="secondary" className="text-[10px]">{autoReplies.filter(a => a.enabled).length} aktivnih pravila</Badge>
                <span className="text-muted-foreground">{autoReplies.reduce((s, a) => s + a.matchCount, 0)} ukupno pokretanja</span>
              </div>
            </div>
            <Separator />
            <div className="space-y-2">
              <p className="text-xs font-medium">Kampanje</p>
              <div className="flex items-center gap-2 text-xs">
                <Badge variant="secondary" className="text-[10px]">{campaigns.filter(c => c.status === 'completed').length} završenih</Badge>
                <span className="text-muted-foreground">{campaigns.reduce((s, c) => s + c.readCount, 0)} pročitanih</span>
              </div>
            </div>
          </CardContent>
        </Card>
    
        {/* Tags distribution */}
        <Card>
          <CardHeader className="pb-3"><CardTitle className="text-sm">Distribucija tagova</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-2">
              {stats.allTags.map(tag => {
                const count = conversations.filter(c => c.tags.includes(tag)).length
                const maxTag = Math.max(...stats.allTags.map(t => conversations.filter(c => c.tags.includes(t)).length), 1)
                return (
                  <div key={tag} className="flex items-center gap-3">
                    <span className="text-xs w-20 truncate">#{tag}</span>
                    <div className="flex-1 bg-muted rounded-full h-3"><div className="bg-primary h-3 rounded-full" style={{ width: `${(count / maxTag) * 100}%` }} /></div>
                    <span className="text-xs font-mono w-6 text-right">{count}</span>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    
        {/* Activity by day */}
        <Card className="md:col-span-2">
          <CardHeader className="pb-3"><CardTitle className="text-sm">Aktivnost po danima u sedmici</CardTitle></CardHeader>
          <CardContent>
            <div className="flex items-end gap-2 h-20">
              {['Pon', 'Uto', 'Sre', 'Čet', 'Pet', 'Sub', 'Ned'].map(day => {
                const count = Object.entries(stats.msgByDay).find(([k]) => k.toLowerCase().startsWith(day.toLowerCase()))?.[1] || 0
                const maxD = Math.max(...Object.values(stats.msgByDay), 1)
                return (
                  <div key={day} className="flex-1 flex flex-col items-center gap-1">
                    <span className="text-[9px] text-muted-foreground">{count}</span>
                    <div className="w-full rounded-t-sm bg-green-400" style={{ height: `${(count / maxD) * 100}%`, minHeight: '4px' }} />
                    <span className="text-[9px] text-muted-foreground">{day}</span>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
    
        {/* Recent Contacts */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm">Kontakti</CardTitle>
            <Button variant="ghost" size="sm" onClick={() => setActiveTab('messages')}>Sve poruke <ChevronRight className="h-4 w-4 ml-1" /></Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {conversations.map(c => (
              <div key={c.id} className="flex items-center gap-3 p-2 rounded hover:bg-muted/50 cursor-pointer" onClick={() => { setSelectedConv(c); setActiveTab('messages') }}>
                <div className={`h-8 w-8 rounded-full flex items-center justify-center text-white text-[10px] font-medium shrink-0 ${getAvatarColor(c.contactName)}`}>{getInitials(c.contactName)}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-medium">{c.contactName}</span>
                    {c.isStarred && <Star className="h-3 w-3 text-amber-500 fill-amber-500" />}
                  </div>
                  <p className="text-[10px] text-muted-foreground">{c.contactPhone}</p>
                </div>
                <Badge variant="outline" className={`text-[9px] ${CONV_STATUS[c.status]?.color}`}>{CONV_STATUS[c.status]?.label}</Badge>
                <div className="text-right shrink-0">
                  <p className="text-[10px] text-muted-foreground">{formatDate(c.lastMessageTime)}</p>
                  <p className="text-[9px] text-muted-foreground">{c.messages.length} poruka</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    
      {/* Business Poruke Features */}
      <Card>
        <CardHeader className="pb-3"><CardTitle className="text-sm">Business Poruke mogućnosti</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {[
              { name: 'Automatske poruke', desc: 'Status narudžbe, potvrda plaćanja, podsjetnici', icon: Zap },
              { name: 'CRM integracija', desc: 'Automatsko kreiranje lead-ova iz poruka', icon: Users },
              { name: 'AI Chatbot', desc: 'Automatski odgovori van radnog vremena', icon: Bot },
              { name: 'Katalog poruke', desc: 'Slanje kataloga proizvoda direktno', icon: Package },
              { name: 'Template poruke', desc: 'Odobreni template-i za masovno slanje', icon: FileText },
              { name: 'Broadcast kampanje', desc: 'Masovno slanje marketinških poruka', icon: Send },
            ].map(f => (
              <div key={f.name} className="flex items-start gap-3 p-3 border rounded-lg">
                <div className="h-9 w-9 rounded-lg bg-green-50 dark:bg-green-900/20 flex items-center justify-center shrink-0"><f.icon className="h-4 w-4 text-green-600" /></div>
                <div><p className="text-xs font-medium">{f.name}</p><p className="text-[10px] text-muted-foreground">{f.desc}</p></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </TabsContent>
  )
}

// ========== MessagesTab ==========

export function MessagesTab({ convSearch, filterStatus, filterTag, filteredConvs, handleSendReply, isInbound, k, replyText, selectedConv, setFilterStatus, setFilterTag, t }: { convSearch: any, filterStatus: any, filterTag: any, filteredConvs: any, handleSendReply: any, isInbound: any, k: any, replyText: any, selectedConv: any, setFilterStatus: any, setFilterTag: any, t: any }) {
  return (
    <TabsContent value="messages" className="space-y-0">
      <div className="grid grid-cols-1 md:grid-cols-[320px_1fr] gap-0 border rounded-lg overflow-hidden h-[calc(100vh-300px)] min-h-[500px]">
        {/* Conversation list */}
        <div className="border-r bg-muted/20 flex flex-col">
          <div className="p-3 space-y-2 border-b">
            <div className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /><Input placeholder="Pretraži..." className="pl-9 h-8 text-xs" value={convSearch} onChange={(e) => setConvSearch(e.target.value)} /></div>
            <div className="flex gap-1">
              <Select value={filterStatus} onValueChange={setFilterStatus}><SelectTrigger className="h-7 text-[10px]"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">Svi</SelectItem>{Object.entries(CONV_STATUS).map(([k, v]) => <SelectItem key={k} value={k}>{v.label}</SelectItem>)}</SelectContent></Select>
              {stats.allTags.length > 0 && <Select value={filterTag} onValueChange={setFilterTag}><SelectTrigger className="h-7 text-[10px]"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">Svi tagovi</SelectItem>{stats.allTags.map(t => <SelectItem key={t} value={t}>#{t}</SelectItem>)}</SelectContent></Select>}
            </div>
          </div>
          <div className="flex-1 overflow-y-auto">
            {filteredConvs.map(c => (
              <div key={c.id} className={`flex items-start gap-3 p-3 border-b cursor-pointer hover:bg-muted/50 transition-colors ${selectedConv?.id === c.id ? 'bg-muted' : ''}`} onClick={() => setSelectedConv(c)}>
                <div className="relative shrink-0">
                  <div className={`h-10 w-10 rounded-full flex items-center justify-center text-white text-xs font-medium ${getAvatarColor(c.contactName)}`}>{getInitials(c.contactName)}</div>
                  {c.unreadCount > 0 && <div className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-red-500 text-white text-[9px] flex items-center justify-center">{c.unreadCount}</div>}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5"><span className="text-xs font-medium truncate">{c.contactName}</span>{c.isStarred && <Star className="h-3 w-3 text-amber-500 fill-amber-500" />}</div>
                    <span className="text-[10px] text-muted-foreground shrink-0">{formatDate(c.lastMessageTime)}</span>
                  </div>
                  <p className="text-[11px] text-muted-foreground truncate mt-0.5">{c.lastMessage}</p>
                  <div className="flex items-center gap-1 mt-1">
                    <Badge variant="outline" className={`text-[8px] px-1 py-0 ${CONV_STATUS[c.status]?.color}`}>{CONV_STATUS[c.status]?.label}</Badge>
                    {c.tags.slice(0, 2).map(tag => <Badge key={tag} variant="secondary" className="text-[8px] px-1 py-0">#{tag}</Badge>)}
                    {c.assignedTo && <span className="text-[9px] text-muted-foreground ml-auto">{c.assignedTo}</span>}
                  </div>
                </div>
              </div>
            ))}
            {filteredConvs.length === 0 && <div className="p-8 text-center"><MessageSquare className="h-8 w-8 mx-auto mb-2 text-muted-foreground" /><p className="text-xs text-muted-foreground">Nema razgovora</p></div>}
          </div>
        </div>
    
        {/* Chat area */}
        <div className="flex flex-col bg-background">
          {selectedConv ? (
            <>
              {/* Chat header */}
              <div className="flex items-center justify-between p-3 border-b">
                <div className="flex items-center gap-3">
                  <div className={`h-9 w-9 rounded-full flex items-center justify-center text-white text-xs font-medium ${getAvatarColor(selectedConv.contactName)}`}>{getInitials(selectedConv.contactName)}</div>
                  <div>
                    <p className="text-sm font-medium">{selectedConv.contactName}</p>
                    <p className="text-[10px] text-muted-foreground">{selectedConv.contactPhone}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleToggleStar(selectedConv.id)}>{selectedConv.isStarred ? <Star className="h-4 w-4 text-amber-500 fill-amber-500" /> : <Star className="h-4 w-4" />}</Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8"><PhoneCall className="h-4 w-4" /></Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8"><MoreVertical className="h-4 w-4" /></Button>
                </div>
              </div>
    
              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {selectedConv.messages.map(msg => {
                  const isInbound = msg.direction === 'inbound'
                  return (
                    <div key={msg.id} className={`flex ${isInbound ? 'justify-start' : 'justify-end'}`}>
                      <div className={`max-w-[75%] rounded-lg p-3 ${isInbound ? 'bg-muted' : 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800'}`}>
                        <p className="text-sm">{msg.content}</p>
                        <div className="flex items-center gap-1.5 mt-1 justify-end">
                          <span className="text-[10px] text-muted-foreground">{new Date(msg.timestamp).toLocaleTimeString('sr-RS', { hour: '2-digit', minute: '2-digit' })}</span>
                          {!isInbound && <span className="text-[10px] text-green-600">{STATUS_CONFIG[msg.status]?.icon}</span>}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
    
              {/* Reply input */}
              <div className="p-3 border-t">
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Input placeholder="Napišite poruku..." className="pr-20" value={replyText} onChange={(e) => setReplyText(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendReply() } }} />
                    <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1">
                      <Button variant="ghost" size="icon" className="h-6 w-6"><Paperclip className="h-3.5 w-3.5" /></Button>
                      <Button variant="ghost" size="icon" className="h-6 w-6"><Smile className="h-3.5 w-3.5" /></Button>
                    </div>
                  </div>
                  <Button size="icon" onClick={handleSendReply} disabled={!replyText.trim()} className="bg-green-600 hover:bg-green-700"><Send className="h-4 w-4" /></Button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center"><MessageCircleReply className="h-12 w-12 mx-auto mb-3 text-muted-foreground" /><p className="text-muted-foreground">Izaberite razgovor</p><p className="text-xs text-muted-foreground mt-1">ili počnite novu konverzaciju</p></div>
            </div>
          )}
        </div>
      </div>
    </TabsContent>
  )
}

// ========== TemplatesTab ==========

export function TemplatesTab({ catCfg, templates }: { catCfg: any, templates: any }) {
  return (
    <TabsContent value="templates" className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{templates.length} template-a</p>
        <Button size="sm" onClick={() => { setEditingTemplate(null); setTemplateForm({ name: '', category: 'utility', language: 'sr', body: '' }); setTemplateDialogOpen(true) }}><Plus className="h-4 w-4 mr-1" /> Novi template</Button>
      </div>
      <div className="space-y-3">
        {templates.map(tpl => {
          const catCfg = TEMPLATE_CATEGORIES.find(c => c.value === tpl.category)
          return (
            <Card key={tpl.id} className="hover:bg-muted/30 transition-colors">
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-sm font-medium">{tpl.name}</p>
                      <Badge variant="outline" className={`text-[10px] ${STATUS_CONFIG[tpl.status === 'approved' ? 'delivered' : tpl.status === 'pending' ? 'pending' : 'failed']?.color}`}>{tpl.status === 'approved' ? '✅ Odobren' : tpl.status === 'pending' ? '⏳ Na čekanju' : '❌ Odbijen'}</Badge>
                      <Badge variant="secondary" className={`text-[10px] ${catCfg?.color}`}>{catCfg?.label}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground bg-muted/30 rounded p-2 mt-1">{tpl.body}</p>
                    <div className="flex gap-3 mt-2 text-[10px] text-muted-foreground">
                      <span>🇷🇸 {tpl.language}</span>
                      <span>{tpl.variables} promenljivih</span>
                      <span>Korišćen {tpl.usedCount}x</span>
                      {tpl.lastUsedAt && <span>Zadnje: {formatDate(tpl.lastUsedAt)}</span>}
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" onClick={() => { setEditingTemplate(tpl); setTemplateForm({ name: tpl.name, category: tpl.category, language: tpl.language, body: tpl.body }); setTemplateDialogOpen(true) }}><Edit3 className="h-4 w-4" /></Button>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </TabsContent>
  )
}

// ========== ChatbotTab ==========

export function ChatbotTab({ autoReplies }: { autoReplies: any }) {
  return (
    <TabsContent value="chatbot" className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{autoReplies.filter(a => a.enabled).length} aktivnih pravila od {autoReplies.length}</p>
        <Button size="sm" onClick={() => { setEditingAutoReply(null); setAutoReplyForm({ name: '', description: '', trigger: 'keyword', keyword: '', response: '', delaySeconds: '0', enabled: true }); setAutoReplyDialogOpen(true) }}><Plus className="h-4 w-4 mr-1" /> Novo pravilo</Button>
      </div>
      <div className="space-y-3">
        {autoReplies.map(ar => (
          <Card key={ar.id} className={ar.enabled ? '' : 'opacity-60'}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-sm font-medium">{ar.name}</p>
                    <Badge variant="outline" className="text-[10px]">Trigger: {TRIGGER_LABELS[ar.trigger]}</Badge>
                    {ar.enabled ? <Badge variant="secondary" className="text-[9px] bg-green-100 text-green-700"><CheckCircle2 className="h-2.5 w-2.5 mr-0.5" /> Aktivno</Badge> : <Badge variant="secondary" className="text-[9px]">Neaktivno</Badge>}
                  </div>
                  <p className="text-xs text-muted-foreground">{ar.description}</p>
                  {ar.keyword && <p className="text-[10px] text-muted-foreground mt-1">Ključne reči: {ar.keyword.split(',').map(k => <Badge key={k} variant="secondary" className="text-[9px] mr-1">#{k.trim()}</Badge>)}</p>}
                  <p className="text-xs bg-muted/30 rounded p-2 mt-1">{ar.response}</p>
                  <p className="text-[10px] text-muted-foreground mt-1">Pokrenuto {ar.matchCount}x {ar.delaySeconds > 0 ? `· Kašnjenje: ${ar.delaySeconds}s` : ''}</p>
                </div>
                <Switch checked={ar.enabled} onCheckedChange={() => handleToggleAutoReply(ar.id)} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </TabsContent>
  )
}

// ========== CampaignsTab ==========

export function CampaignsTab({ campaigns, statusCfg }: { campaigns: any, statusCfg: any }) {
  return (
    <TabsContent value="campaigns" className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{campaigns.length} kampanji</p>
        <Button size="sm" onClick={() => setCampaignDialogOpen(true)}><Plus className="h-4 w-4 mr-1" /> Nova kampanja</Button>
      </div>
      <div className="space-y-3">
        {campaigns.map(cmp => {
          const statusCfg = CAMPAIGN_STATUS[cmp.status]
          return (
            <Card key={cmp.id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-sm font-medium">{cmp.name}</p>
                      <Badge variant="outline" className={`text-[10px] ${statusCfg?.color}`}>{statusCfg?.label}</Badge>
                    </div>
                    {cmp.scheduledAt && <p className="text-[10px] text-muted-foreground">Zakazano: {formatDate(cmp.scheduledAt)}</p>}
                    <div className="grid grid-cols-4 gap-3 mt-3">
                      <div className="text-center p-2 bg-muted/30 rounded"><p className="text-[10px] text-muted-foreground">Primaoca</p><p className="text-sm font-bold">{cmp.recipientCount}</p></div>
                      <div className="text-center p-2 bg-blue-50 dark:bg-blue-900/10 rounded"><p className="text-[10px] text-muted-foreground">Poslato</p><p className="text-sm font-bold">{cmp.sentCount}</p></div>
                      <div className="text-center p-2 bg-green-50 dark:bg-green-900/10 rounded"><p className="text-[10px] text-muted-foreground">Pročitano</p><p className="text-sm font-bold">{cmp.readCount}</p></div>
                      <div className="text-center p-2 bg-red-50 dark:bg-red-900/10 rounded"><p className="text-[10px] text-muted-foreground">Greške</p><p className="text-sm font-bold text-red-600">{cmp.failedCount}</p></div>
                    </div>
                    {cmp.recipientCount > 0 && <Progress value={(cmp.readCount / cmp.recipientCount) * 100} className="mt-2 h-2" />}
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </TabsContent>
  )
}

// ========== SettingsTab ==========

export function SettingsTab({  }: {  }) {
  return (
    <TabsContent value="settings" className="space-y-4">
      <Card>
        <CardHeader className="pb-3"><CardTitle className="text-sm">Business Poruke API</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2"><Label className="text-xs">Business Phone Number ID</Label><Input defaultValue="123456789012345" disabled /></div>
            <div className="space-y-2"><Label className="text-xs">Access Token</Label><div className="flex gap-2"><Input defaultValue="EAAxxxxxxxxxxxx" type="password" disabled /><Button variant="outline" size="sm"><Eye className="h-4 w-4" /></Button></div></div>
            <div className="space-y-2"><Label className="text-xs">Webhook Verify Token</Label><Input defaultValue="whatsapp_verify_token" disabled /></div>
            <div className="space-y-2"><Label className="text-xs">API Version</Label><Input defaultValue="v18.0" disabled /></div>
          </div>
          <Separator />
          <div className="space-y-3">
            <h3 className="text-sm font-medium">Webhook Events</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {['messages', 'message_status', 'messaging_postbacks'].map(evt => (
                <div key={evt} className="flex items-center gap-2 p-2 border rounded-lg"><Switch checked defaultChecked /><Label className="text-xs">{evt}</Label></div>
              ))}
            </div>
          </div>
          <Separator />
          <div className="space-y-2">
            <h3 className="text-sm font-medium">Radno vreme</h3>
            <div className="flex items-center gap-3 text-xs">
              <span className="text-muted-foreground">Pon-Pet:</span><span className="font-medium">09:00 - 17:00</span>
              <span className="text-muted-foreground ml-4">Sub:</span><span className="font-medium">10:00 - 14:00</span>
              <span className="text-muted-foreground ml-4">Ned:</span><span className="font-medium text-red-500">Zatvoreno</span>
            </div>
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

// ========== Novaporuka ==========

export function Novaporuka({ handleNewMessage, newMsgDialogOpen, newMsgPhone, newMsgText, setNewMsgDialogOpen }: { handleNewMessage: any, newMsgDialogOpen: any, newMsgPhone: any, newMsgText: any, setNewMsgDialogOpen: any }) {
  return (
    <Dialog open={newMsgDialogOpen} onOpenChange={setNewMsgDialogOpen}>
            <DialogContent className="max-w-lg">
              <DialogHeader><DialogTitle>Nova poruka</DialogTitle><DialogDescription>Pošaljite poruku novom ili postojećem kontaktu</DialogDescription></DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2"><Label className="text-xs">Broj primaoca *</Label><Input value={newMsgPhone} onChange={(e) => setNewMsgPhone(e.target.value)} placeholder="+3816XXXXXXXX" /></div>
                <div className="space-y-2"><Label className="text-xs">Poruka *</Label><Textarea value={newMsgText} onChange={(e) => setNewMsgText(e.target.value)} rows={4} placeholder="Vaša poruka..." /></div>
              </div>
              <DialogFooter className="gap-2"><Button variant="outline" onClick={() => setNewMsgDialogOpen(false)}>Otkaži</Button><Button onClick={handleNewMessage} disabled={!newMsgPhone.trim() || !newMsgText.trim()} className="bg-green-600 hover:bg-green-700"><Send className="h-4 w-4 mr-1" /> Pošalji</Button></DialogFooter>
            </DialogContent>
          </Dialog>
  )
}


// ========== EditingTemplateIzmenitem ==========

export function EditingTemplateIzmenitem({ editingTemplate, handleSaveTemplate, l, setTemplateDialogOpen, templateDialogOpen }: { editingTemplate: any, handleSaveTemplate: any, l: any, setTemplateDialogOpen: any, templateDialogOpen: any }) {
  return (
    <Dialog open={templateDialogOpen} onOpenChange={setTemplateDialogOpen}>
            <DialogContent className="max-w-lg">
              <DialogHeader><DialogTitle>{editingTemplate ? 'Izmeni template' : 'Novi template'}</DialogTitle><DialogDescription>Kreirajte template poruku sa promenljivim</DialogDescription></DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2"><Label className="text-xs">Naziv *</Label><Input value={templateForm.name} onChange={(e) => setTemplateForm({ ...templateForm, name: e.target.value })} placeholder="npr. Potvrda narudžbe" /></div>
                  <div className="space-y-2"><Label className="text-xs">Kategorija</Label><Select value={templateForm.category} onValueChange={(v) => setTemplateForm({ ...templateForm, category: v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{TEMPLATE_CATEGORIES.map(c => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}</SelectContent></Select></div>
                </div>
                <div className="space-y-2"><Label className="text-xs">Jezik</Label><Select value={templateForm.language} onValueChange={(v) => setTemplateForm({ ...templateForm, language: v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{TEMPLATE_LANGUAGES.map(l => <SelectItem key={l} value={l}>{l.toUpperCase()}</SelectItem>)}</SelectContent></Select></div>
                <div className="space-y-2"><Label className="text-xs">Sadržaj poruke * (koristite {'{{1}}'}, {'{{2}}'} za promenljive)</Label><Textarea value={templateForm.body} onChange={(e) => setTemplateForm({ ...templateForm, body: e.target.value })} rows={4} placeholder="Vaša poruka sa {{1}} i {{2}}..." /></div>
                <p className="text-[10px] text-muted-foreground">Promenljive: {(templateForm.body.match(/\{\{(\d+)\}\}/g) || []).length}</p>
              </div>
              <DialogFooter className="gap-2"><Button variant="outline" onClick={() => setTemplateDialogOpen(false)}>Otkaži</Button><Button onClick={handleSaveTemplate}>{editingTemplate ? 'Sačuvaj' : 'Kreiraj'}</Button></DialogFooter>
            </DialogContent>
          </Dialog>
  )
}


// ========== EditingAutoReplyIzmeniau ==========

export function EditingAutoReplyIzmeniau({ autoReplyDialogOpen, editingAutoReply, handleSaveAutoReply, k, setAutoReplyDialogOpen }: { autoReplyDialogOpen: any, editingAutoReply: any, handleSaveAutoReply: any, k: any, setAutoReplyDialogOpen: any }) {
  return (
    <Dialog open={autoReplyDialogOpen} onOpenChange={setAutoReplyDialogOpen}>
            <DialogContent className="max-w-lg">
              <DialogHeader><DialogTitle>{editingAutoReply ? 'Izmeni auto odgovor' : 'Novi auto odgovor'}</DialogTitle><DialogDescription>Definišite trigger i odgovor</DialogDescription></DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2"><Label className="text-xs">Naziv *</Label><Input value={autoReplyForm.name} onChange={(e) => setAutoReplyForm({ ...autoReplyForm, name: e.target.value })} /></div>
                <div className="space-y-2"><Label className="text-xs">Opis</Label><Input value={autoReplyForm.description} onChange={(e) => setAutoReplyForm({ ...autoReplyForm, description: e.target.value })} /></div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2"><Label className="text-xs">Trigger</Label><Select value={autoReplyForm.trigger} onValueChange={(v) => setAutoReplyForm({ ...autoReplyForm, trigger: v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{Object.entries(TRIGGER_LABELS).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}</SelectContent></Select></div>
                  <div className="space-y-2"><Label className="text-xs">Kašnjenje (s)</Label><Input type="number" value={autoReplyForm.delaySeconds} onChange={(e) => setAutoReplyForm({ ...autoReplyForm, delaySeconds: e.target.value })} /></div>
                </div>
                {autoReplyForm.trigger === 'keyword' && <div className="space-y-2"><Label className="text-xs">Ključne reči (zarezima)</Label><Input value={autoReplyForm.keyword} onChange={(e) => setAutoReplyForm({ ...autoReplyForm, keyword: e.target.value })} placeholder="cena,dostava,katalog" /></div>}
                <div className="space-y-2"><Label className="text-xs">Odgovor *</Label><Textarea value={autoReplyForm.response} onChange={(e) => setAutoReplyForm({ ...autoReplyForm, response: e.target.value })} rows={3} placeholder="Automatski odgovor..." /></div>
              </div>
              <DialogFooter className="gap-2"><Button variant="outline" onClick={() => setAutoReplyDialogOpen(false)}>Otkaži</Button><Button onClick={handleSaveAutoReply}>{editingAutoReply ? 'Sačuvaj' : 'Kreiraj'}</Button></DialogFooter>
            </DialogContent>
          </Dialog>
  )
}


// ========== Novakampanja ==========

export function Novakampanja({ campaignDialogOpen, setCampaignDialogOpen, templates }: { campaignDialogOpen: any, setCampaignDialogOpen: any, templates: any }) {
  return (
    <Dialog open={campaignDialogOpen} onOpenChange={setCampaignDialogOpen}>
            <DialogContent className="max-w-lg">
              <DialogHeader><DialogTitle>Nova kampanja</DialogTitle><DialogDescription>Kreirajte broadcast kampanju za masovno slanje poruka</DialogDescription></DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2"><Label className="text-xs">Naziv kampanje *</Label><Input placeholder="npr. Najama zimskog kataloga" /></div>
                <div className="space-y-2">
                  <Label className="text-xs">Template</Label>
                  <Select>
                    <SelectTrigger><SelectValue placeholder="Izaberite template" /></SelectTrigger>
                    <SelectContent>
                      {templates.filter(t => t.status === 'approved').map(t => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2"><Label className="text-xs">Datum slanja</Label><Input type="datetime-local" /></div>
                <div className="space-y-2">
                  <Label className="text-xs">Grupa primalaca</Label>
                  <Select>
                    <SelectTrigger><SelectValue placeholder="Izaberite grupu" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Svi kontakti</SelectItem>
                      <SelectItem value="leads">Lead-ovi</SelectItem>
                      <SelectItem value="customers">Postojeći klijenti</SelectItem>
                      <SelectItem value="vip">VIP klijenti</SelectItem>
                      <SelectItem value="inactive">Neaktivni kontakti (30+ dana)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Alert className="bg-amber-50 border-amber-200 dark:bg-amber-900/10 dark:border-amber-800">
                  <AlertCircle className="h-4 w-4 text-amber-600" />
                  <AlertDescription className="text-amber-700 dark:text-amber-400 text-xs">
                    Business Poruke dozvoljava broadcast samo za kontakte koji su vas prethodno kontaktirali. Maksimalno 10.000 primalaca po kampanji.
                  </AlertDescription>
                </Alert>
              </div>
              <DialogFooter className="gap-2">
                <Button variant="outline" onClick={() => setCampaignDialogOpen(false)}>Otkaži</Button>
                <Button onClick={() => { setCampaignDialogOpen(false); showToast('Kampanja kreirana') }}>Kreiraj kampanju</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
  )
}

