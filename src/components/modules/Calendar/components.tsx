'use client'import { AlertTriangle, Calendar, CalendarDays, ChevronLeft, ChevronRight, Circle, Clock, Edit3, MapPin, Plus, Search, Timer, Trash2 , Bell} from 'lucide-react'



// ========== MonthTab ==========

export function MonthTab({ dayEvents, days, filterType, isSelected, loading, nextMonth, prevMonth, setFilterType }: { dayEvents: any, days: any, filterType: any, isSelected: any, loading: any, nextMonth: any, prevMonth: any, setFilterType: any }) {
  return (
    <TabsContent value="month" className="space-y-4">
      {/* Navigation */}
      <Card className="p-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="outline" size="icon" className="h-8 w-8" onClick={prevMonth}><ChevronLeft className="h-4 w-4" /></Button>
            <h3 className="text-lg font-semibold min-w-[200px] text-center">{MONTHS_SR[month]} {year}</h3>
            <Button variant="outline" size="icon" className="h-8 w-8" onClick={nextMonth}><ChevronRight className="h-4 w-4" /></Button>
          </div>
          <div className="flex gap-2">
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-[130px] h-8 text-xs"><SelectValue placeholder="Tip" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Svi tipovi</SelectItem>
                {EVENT_TYPES.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>
      </Card>
    
      {/* Calendar Grid */}
      {loading ? <Skeleton className="h-[600px] w-full" /> : (
        <Card>
          <div className="grid grid-cols-7 gap-px bg-border rounded-lg overflow-hidden">
            {DAYS_SR.map((d, i) => (
              <div key={d} className={`bg-muted p-2 text-center text-xs font-medium ${i >= 5 ? 'text-amber-600' : ''}`}>{d}</div>
            ))}
            {days.map((day, idx) => {
              if (day === null) return <div key={`e-${idx}`} className="bg-background min-h-[100px] p-1" />
              const dayEvents = getEventsForDay(day)
              const isSelected = selectedDay?.getDate() === day && selectedDay?.getMonth() === month && selectedDay?.getFullYear() === year
              return (
                <div key={day} className={`bg-background min-h-[100px] p-1 cursor-pointer hover:bg-muted/30 transition-colors ${isToday(day) ? 'ring-2 ring-primary/30 bg-primary/5' : ''} ${isSelected ? 'ring-2 ring-blue-400' : ''}`}
                  onClick={() => setSelectedDay(new Date(year, month, day))}>
                  <div className="flex items-center justify-between mb-0.5">
                    <span className={`text-xs font-medium ${isToday(day) ? 'bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center' : 'text-muted-foreground'}`}>{day}</span>
                    {dayEvents.length > 0 && <span className="text-[9px] text-muted-foreground">{dayEvents.length}</span>}
                  </div>
                  <div className="space-y-0.5">
                    {dayEvents.slice(0, 3).map(ev => {
                      const typeInfo = EVENT_TYPES.find(t => t.value === ev.type)
                      const Icon = typeInfo?.icon || Calendar
                      return (
                        <button key={ev.id} className={`w-full text-left text-[10px] px-1 py-0.5 rounded border truncate flex items-center gap-0.5 ${COLORS[ev.color] || COLORS.primary}`}
                          onClick={(e) => { e.stopPropagation(); setSelectedEvent(ev); setEventDetailOpen(true) }}>
                          <Icon className="h-2.5 w-2.5 shrink-0" /><span className="truncate">{ev.title}</span>
                        </button>
                      )
                    })}
                    {dayEvents.length > 3 && (
                      <button className="w-full text-left text-[10px] px-1 py-0.5 text-muted-foreground hover:bg-muted/50 rounded" onClick={(e) => { e.stopPropagation(); setSelectedDay(new Date(year, month, day)); setActiveTab('list') }}>
                        +{dayEvents.length - 3} više...
                      </button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </Card>
      )}
    </TabsContent>
  )
}

// ========== WeekTab ==========

export function WeekTab({ dayEvents, getWeekDays, goToday, isTodayDate, nextWeek, prevWeek }: { dayEvents: any, getWeekDays: any, goToday: any, isTodayDate: any, nextWeek: any, prevWeek: any }) {
  return (
    <TabsContent value="week" className="space-y-4">
      <Card className="p-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="outline" size="icon" className="h-8 w-8" onClick={prevWeek}><ChevronLeft className="h-4 w-4" /></Button>
            <h3 className="text-sm font-semibold">
              {getWeekDays[0].toLocaleDateString('sr-RS', { day: 'numeric', month: 'short' })} — {getWeekDays[6].toLocaleDateString('sr-RS', { day: 'numeric', month: 'short', year: 'numeric' })}
            </h3>
            <Button variant="outline" size="icon" className="h-8 w-8" onClick={nextWeek}><ChevronRight className="h-4 w-4" /></Button>
          </div>
          <Button variant="ghost" size="sm" onClick={goToday}>Danas</Button>
        </div>
      </Card>
    
      <Card>
        <div className="divide-y">
          {getWeekDays.map((date, i) => {
            const dayEvents = getEventsForWeekDay(date)
            const isTodayDate = date.toDateString() === new Date().toDateString()
            return (
              <div key={i} className={`p-3 ${isTodayDate ? 'bg-primary/5' : ''}`}>
                <div className="flex items-center gap-3 mb-2">
                  <div className={`w-12 h-12 rounded-lg flex flex-col items-center justify-center ${isTodayDate ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                    <span className="text-[10px] uppercase">{DAYS_SR[i]}</span>
                    <span className="text-lg font-bold leading-tight">{date.getDate()}</span>
                  </div>
                  <div className="flex-1">
                    <span className="text-xs text-muted-foreground">{date.toLocaleDateString('sr-RS', { month: 'long', year: 'numeric' })}</span>
                  </div>
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openNewEvent(date)}><Plus className="h-3.5 w-3.5" /></Button>
                </div>
                {dayEvents.length === 0 ? (
                  <p className="text-xs text-muted-foreground text-center py-2">Nema događaja</p>
                ) : (
                  <div className="space-y-1">
                    {dayEvents.map(ev => (
                      <button key={ev.id} className={`w-full text-left p-2 rounded border flex items-center gap-2 hover:shadow-sm transition-shadow ${COLORS[ev.color] || COLORS.primary}`}
                        onClick={() => { setSelectedEvent(ev); setEventDetailOpen(true) }}>
                        <Circle className={`h-2 w-2 fill-current ${COLOR_DOTS[ev.color] || 'bg-primary'}`} />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium truncate">{ev.title}</p>
                          <p className="text-[10px] opacity-70">{ev.allDay ? 'Ceo dan' : `${formatTime(ev.startTime)}${ev.endTime ? ` — ${formatTime(ev.endTime)}` : ''}${ev.location ? ` · ${ev.location}` : ''}`}</p>
                        </div>
                        {ev.type && <Badge variant="outline" className="text-[9px] shrink-0">{EVENT_TYPES.find(t => t.value === ev.type)?.label || ev.type}</Badge>}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </Card>
    </TabsContent>
  )
}

// ========== ListTab ==========

export function ListTab({ c, filterColor, filterType, filteredEvents, loading, past, searchQuery, setFilterColor, setFilterType, upcoming }: { c: any, filterColor: any, filterType: any, filteredEvents: any, loading: any, past: any, searchQuery: any, setFilterColor: any, setFilterType: any, upcoming: any }) {
  return (
    <TabsContent value="list" className="space-y-4">
      <Card className="p-3">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Pretraži događaje..." className="pl-9" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
          </div>
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-[130px]"><SelectValue placeholder="Tip" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Svi tipovi</SelectItem>
              {EVENT_TYPES.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={filterColor} onValueChange={setFilterColor}>
            <SelectTrigger className="w-[120px]"><SelectValue placeholder="Boja" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Sve boje</SelectItem>
              {Object.keys(COLORS).map(c => <SelectItem key={c} value={c}>{c === 'primary' ? 'Plava' : c.charAt(0).toUpperCase() + c.slice(1)}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </Card>
    
      <p className="text-sm text-muted-foreground">{filteredEvents.length} događaja</p>
    
      {loading ? <Skeleton className="h-[400px] w-full" /> : filteredEvents.length === 0 ? (
        <Card className="p-8 text-center">
          <CalendarDays className="h-12 w-12 mx-auto mb-3 text-muted-foreground" />
          <p className="text-muted-foreground">Nema događaja</p>
          <Button className="mt-3" onClick={() => openNewEvent()}><Plus className="h-4 w-4 mr-1" /> Dodaj događaj</Button>
        </Card>
      ) : (
        <div className="space-y-2">
          {filteredEvents.map(ev => {
            const typeInfo = EVENT_TYPES.find(t => t.value === ev.type)
            const Icon = typeInfo?.icon || Calendar
            const past = isEventPast(ev.endTime, ev.startTime)
            const upcoming = isEventUpcoming(ev.startTime)
            return (
              <Card key={ev.id} className={`p-3 cursor-pointer hover:shadow-md transition-shadow ${past ? 'opacity-50' : ''} ${upcoming ? 'border-amber-300' : ''}`}
                onClick={() => { setSelectedEvent(ev); setEventDetailOpen(true) }}>
                <div className="flex items-center gap-3">
                  <div className={`h-10 w-10 rounded-lg flex items-center justify-center shrink-0 ${COLORS[ev.color] || COLORS.primary}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium truncate">{ev.title}</p>
                      {upcoming && <Badge variant="outline" className="text-[9px] text-amber-600 bg-amber-50">Uskoro</Badge>}
                      {past && <Badge variant="outline" className="text-[9px] text-gray-400">Prošao</Badge>}
                      {ev.priority === 'urgent' && <Badge variant="outline" className="text-[9px] text-red-600 bg-red-50"><AlertTriangle className="h-2.5 w-2.5 mr-0.5" />Hitno</Badge>}
                    </div>
                    <div className="flex items-center gap-3 text-[11px] text-muted-foreground mt-0.5">
                      <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{formatDateShort(ev.startTime)}</span>
                      {!ev.allDay && <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{formatTime(ev.startTime)}{ev.endTime ? ` — ${formatTime(ev.endTime)}` : ''}</span>}
                      {getEventDuration(ev.startTime, ev.endTime) && <span className="flex items-center gap-1"><Timer className="h-3 w-3" />{getEventDuration(ev.startTime, ev.endTime)}</span>}
                      {ev.location && <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{ev.location}</span>}
                    </div>
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100">
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={(e) => { e.stopPropagation(); openEditEvent(ev) }}><Edit3 className="h-3.5 w-3.5" /></Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={(e) => { e.stopPropagation(); setSelectedEvent(ev); setDeleteConfirmOpen(true) }}><Trash2 className="h-3.5 w-3.5" /></Button>
                  </div>
                </div>
              </Card>
            )
          })}
        </div>
      )}
    </TabsContent>
  )
}

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { TabsContent } from '@/components/ui/tabs'

// ========== EditingEventIzmenidogaa ==========

export function EditingEventIzmenidogaa({ editingEvent, eventDialogOpen, handleSubmitEvent, k, setEventDialogOpen, submitting }: { editingEvent: any, eventDialogOpen: any, handleSubmitEvent: any, k: any, setEventDialogOpen: any, submitting: any }) {
  return (
    <Dialog open={eventDialogOpen} onOpenChange={setEventDialogOpen}>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>{editingEvent ? 'Izmeni događaj' : 'Novi događaj'}</DialogTitle>
                <DialogDescription>{editingEvent ? 'Izmenite podatke o događaju' : 'Kreirajte novi događaj'}</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2"><Label className="text-xs">Naslov *</Label><Input value={eventForm.title} onChange={(e) => setEventForm({ ...eventForm, title: e.target.value })} placeholder="Unesite naslov..." /></div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2"><Label className="text-xs">Tip</Label>
                    <Select value={eventForm.type} onValueChange={(v) => setEventForm({ ...eventForm, type: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>{EVENT_TYPES.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2"><Label className="text-xs">Boja</Label>
                    <Select value={eventForm.color} onValueChange={(v) => setEventForm({ ...eventForm, color: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>{Object.entries(COLOR_DOTS).map(([k, v]) => <SelectItem key={k} value={k}><div className="flex items-center gap-2"><div className={`h-3 w-3 rounded-full ${v}`} />{k === 'primary' ? 'Plava' : k.charAt(0).toUpperCase() + k.slice(1)}</div></SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2"><Label className="text-xs">Početak *</Label><Input type="datetime-local" value={eventForm.startTime} onChange={(e) => setEventForm({ ...eventForm, startTime: e.target.value })} /></div>
                  <div className="space-y-2"><Label className="text-xs">Kraj</Label><Input type="datetime-local" value={eventForm.endTime} onChange={(e) => setEventForm({ ...eventForm, endTime: e.target.value })} /></div>
                </div>
                <label className="flex items-center gap-2 text-sm cursor-pointer"><input type="checkbox" checked={eventForm.allDay} onChange={(e) => setEventForm({ ...eventForm, allDay: e.target.checked })} className="rounded" /> Ceo dan</label>
                <div className="space-y-2"><Label className="text-xs">Lokacija</Label><Input value={eventForm.location} onChange={(e) => setEventForm({ ...eventForm, location: e.target.value })} placeholder="Adresa ili link..." /></div>
                <div className="space-y-2"><Label className="text-xs">Učesnici (zarezom odvojeni)</Label><Input value={eventForm.attendees} onChange={(e) => setEventForm({ ...eventForm, attendees: e.target.value })} placeholder="Marko, Jelena, Nikola" /></div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2"><Label className="text-xs">Podsetnik</Label>
                    <Select value={eventForm.reminder} onValueChange={(v) => setEventForm({ ...eventForm, reminder: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>{REMINDER_OPTIONS.map(r => <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2"><Label className="text-xs">Ponavljanje</Label>
                    <Select value={eventForm.recurrence} onValueChange={(v) => setEventForm({ ...eventForm, recurrence: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>{RECURRENCE_OPTIONS.map(r => <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2"><Label className="text-xs">Prioritet</Label>
                    <Select value={eventForm.priority} onValueChange={(v) => setEventForm({ ...eventForm, priority: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>{PRIORITY_OPTIONS.map(p => <SelectItem key={p.value} value={p.value}><span className={p.color}>{p.label}</span></SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2"><Label className="text-xs">Opis</Label><Textarea value={eventForm.description} onChange={(e) => setEventForm({ ...eventForm, description: e.target.value })} placeholder="Dodatne napomene..." rows={2} /></div>
              </div>
              <DialogFooter className="gap-2">
                <Button variant="outline" onClick={() => setEventDialogOpen(false)}>Otkaži</Button>
                <Button onClick={handleSubmitEvent} disabled={submitting || !eventForm.title.trim()}>{submitting ? 'Čuvanje...' : editingEvent ? 'Ažuriraj' : 'Kreiraj'}</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
  )
}


// ========== DialogBlock1 ==========

export function DialogBlock1({ eventDetailOpen, selectedEvent, setEventDetailOpen }: { eventDetailOpen: any, selectedEvent: any, setEventDetailOpen: any }) {
  return (
    <Dialog open={eventDetailOpen} onOpenChange={setEventDetailOpen}>
            <DialogContent className="max-w-md">
              {selectedEvent && (
                <>
                  <DialogHeader><DialogTitle className="flex items-center gap-2"><CalendarDays className="h-5 w-5" /> {selectedEvent.title}</DialogTitle></DialogHeader>
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div><span className="text-xs text-muted-foreground">Tip:</span><br /><Badge variant="secondary" className="text-[10px] mt-1">{EVENT_TYPES.find(t => t.value === selectedEvent.type)?.label || selectedEvent.type}</Badge></div>
                      <div><span className="text-xs text-muted-foreground">Prioritet:</span><br /><span className={`text-xs mt-1 ${PRIORITY_OPTIONS.find(p => p.value === selectedEvent.priority)?.color || ''}`}>{PRIORITY_OPTIONS.find(p => p.value === selectedEvent.priority)?.label || '-'}</span></div>
                      <div><span className="text-xs text-muted-foreground">Datum:</span><br /><span className="text-xs">{formatDateFull(selectedEvent.startTime)}</span></div>
                      <div><span className="text-xs text-muted-foreground">Vreme:</span><br /><span className="text-xs">{selectedEvent.allDay ? 'Ceo dan' : `${formatTime(selectedEvent.startTime)}${selectedEvent.endTime ? ` — ${formatTime(selectedEvent.endTime)}` : ''}`}</span></div>
                      {getEventDuration(selectedEvent.startTime, selectedEvent.endTime) && <div><span className="text-xs text-muted-foreground">Trajanje:</span><br /><span className="text-xs">{getEventDuration(selectedEvent.startTime, selectedEvent.endTime)}</span></div>}
                      {selectedEvent.location && <div className="col-span-2"><span className="text-xs text-muted-foreground">Lokacija:</span><br /><span className="text-xs">{selectedEvent.location}</span></div>}
                      {selectedEvent.attendees && <div className="col-span-2"><span className="text-xs text-muted-foreground">Učesnici:</span><br /><div className="flex gap-1 flex-wrap mt-1">{selectedEvent.attendees.split(',').map((a, i) => <Badge key={i} variant="outline" className="text-[10px]">{a.trim()}</Badge>)}</div></div>}
                      {selectedEvent.recurrence && selectedEvent.recurrence !== 'none' && <div><span className="text-xs text-muted-foreground">Ponavljanje:</span><br /><Badge variant="outline" className="text-[10px] mt-1"><Repeat className="h-2.5 w-2.5 mr-0.5" />{RECURRENCE_OPTIONS.find(r => r.value === selectedEvent.recurrence)?.label}</Badge></div>}
                      {selectedEvent.reminder && selectedEvent.reminder !== 'none' && <div><span className="text-xs text-muted-foreground">Podsetnik:</span><br /><Badge variant="outline" className="text-[10px] mt-1"><Bell className="h-2.5 w-2.5 mr-0.5" />{REMINDER_OPTIONS.find(r => r.value === selectedEvent.reminder)?.label}</Badge></div>}
                    </div>
                    {selectedEvent.description && <div><span className="text-xs text-muted-foreground">Opis:</span><p className="text-sm mt-1 bg-muted/30 rounded p-2">{selectedEvent.description}</p></div>}
                    <Separator />
                    <div className="flex gap-2">
                      <Button size="sm" onClick={() => { openEditEvent(selectedEvent); setEventDetailOpen(false) }}><Edit3 className="h-3.5 w-3.5 mr-1" /> Izmeni</Button>
                      <Button size="sm" variant="outline" className="text-destructive" onClick={() => { setDeleteConfirmOpen(true); setEventDetailOpen(false) }}><Trash2 className="h-3.5 w-3.5 mr-1" /> Obriši</Button>
                    </div>
                  </div>
                </>
              )}
            </DialogContent>
          </Dialog>
  )
}


// ========== DialogBlock2 ==========

export function DialogBlock2({ deleteConfirmOpen, handleDeleteEvent, selectedEvent, setDeleteConfirmOpen }: { deleteConfirmOpen: any, handleDeleteEvent: any, selectedEvent: any, setDeleteConfirmOpen: any }) {
  return (
    <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
            <DialogContent className="max-w-sm">
              <DialogHeader><DialogTitle className="text-destructive flex items-center gap-2"><AlertTriangle className="h-5 w-5" /> Potvrda brisanja</DialogTitle><DialogDescription>Obrisati događaj &quot;{selectedEvent?.title}&quot;?</DialogDescription></DialogHeader>
              <DialogFooter className="gap-2">
                <Button variant="outline" onClick={() => setDeleteConfirmOpen(false)}>Otkaži</Button>
                <Button variant="destructive" onClick={handleDeleteEvent}>Obriši</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
  )
}

// ========== OverviewTabContent ==========

export function OverviewTabContent({ info, todayEvents, type, upcomingEvents }: { info: any, todayEvents: any, type: any, upcomingEvents: any }) {
  return (
    <TabsContent value="overview" className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Kpi label="Danas" value={stats.today} icon={Sun} color="text-amber-500" />
        <Kpi label="Događaja ukupno" value={stats.total} icon={CalendarDays} color="text-blue-500" />
        <Kpi label="Sastanaka" value={stats.meetings} icon={Users} color="text-green-500" />
        <Kpi label="Rokova" value={stats.deadlines} icon={Timer} color="text-red-500" />
      </div>
    
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Kpi label="Uskoro" value={stats.upcoming} icon={Clock} color="text-purple-500" />
        <Kpi label="Zadataka" value={stats.tasks} icon={CheckCircle2} color="text-teal-500" />
        <Kpi label="Sa podsetnikom" value={stats.withReminder} icon={Bell} color="text-orange-500" />
        <Kpi label="Ponavljajućih" value={stats.recurring} icon={Repeat} color="text-pink-500" />
      </div>
    
      {/* Today's Events */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2"><Sun className="h-4 w-4 text-amber-500" /> Današnji događaji</CardTitle>
            <Badge>{todayEvents.length}</Badge>
          </div>
        </CardHeader>
        <CardContent>
          {todayEvents.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">Nema događaja za danas</p>
          ) : (
            <div className="space-y-2">
              {todayEvents.map(ev => (
                <div key={ev.id} className="flex items-center gap-3 p-2 rounded hover:bg-muted/50 cursor-pointer" onClick={() => { setSelectedEvent(ev); setEventDetailOpen(true) }}>
                  <Circle className={`h-2.5 w-2.5 fill-current ${COLOR_DOTS[ev.color] || 'bg-primary'}`} />
                  <div className="flex-1">
                    <p className="text-sm font-medium">{ev.title}</p>
                    <p className="text-[11px] text-muted-foreground">{ev.allDay ? 'Ceo dan' : formatTime(ev.startTime)}{ev.location ? ` · ${ev.location}` : ''}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    
      {/* Upcoming Events */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2"><Clock className="h-4 w-4 text-purple-500" /> Nadolazeći događaji</CardTitle>
            <Button variant="ghost" size="sm" onClick={() => setActiveTab('list')}>Svi <ChevronRight className="h-4 w-4 ml-1" /></Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 max-h-80 overflow-y-auto">
            {upcomingEvents.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">Nema nadolazećih događaja</p>
            ) : upcomingEvents.map(ev => (
              <div key={ev.id} className="flex items-center gap-3 p-2 rounded hover:bg-muted/50 cursor-pointer" onClick={() => { setSelectedEvent(ev); setEventDetailOpen(true) }}>
                <div className={`h-8 w-8 rounded flex items-center justify-center ${COLORS[ev.color] || COLORS.primary}`}>
                  <span className="text-[10px] font-bold">{new Date(ev.startTime).getDate()}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{ev.title}</p>
                  <p className="text-[11px] text-muted-foreground">{formatDateFull(ev.startTime)} · {ev.allDay ? 'Ceo dan' : formatTime(ev.startTime)}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* By Type */}
        <Card>
          <CardHeader className="pb-3"><CardTitle className="text-sm">Po tipovima</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-2">
              {Object.entries(stats.byType).sort(([, a], [, b]) => b - a).map(([type, count]) => {
                const info = EVENT_TYPES.find(t => t.value === type)
                const max = Math.max(...Object.values(stats.byType), 1)
                const TypeIcon = info ? info.icon : Calendar
                return (
                  <div key={type} className="flex items-center gap-3">
                    <div className="w-20 flex items-center gap-1.5"><TypeIcon className="h-3 w-3 text-muted-foreground" /><span className="text-xs truncate">{info ? info.label : type}</span></div>
                    <div className="flex-1 bg-muted rounded-full h-3"><div className="bg-primary h-3 rounded-full" style={{ width: `${Math.round((count / max) * 100)}%` }} /></div>
                    <span className="text-xs font-mono w-6 text-right">{count}</span>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
    
        {/* Event Types Reference */}
        <Card>
          <CardHeader className="pb-3"><CardTitle className="text-sm">Tipovi događaja</CardTitle></CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-2">
              {EVENT_TYPES.map(t => (
                <div key={t.value} className="flex items-center gap-2 p-2 rounded hover:bg-muted/50">
                  <t.icon className="h-4 w-4 text-muted-foreground" />
                  <span className="text-xs">{t.label}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </TabsContent>
  )
}


// ========== CalendarInfoSection ==========

export function CalendarInfoSection({  }: {  }) {
  return (
    {/* Info */}
    <Card>
      <CardContent className="p-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
          <div className="flex items-start gap-2"><CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" /><div><p className="font-medium">3 prikaza</p><p className="text-muted-foreground">Mesec, nedelja, lista</p></div></div>
          <div className="flex items-start gap-2"><CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" /><div><p className="font-medium">9 tipova</p><p className="text-muted-foreground">Sastanci, ročevi, zadaci...</p></div></div>
          <div className="flex items-start gap-2"><CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" /><div><p className="font-medium">Podsetnici</p><p className="text-muted-foreground">5 min do 1 nedelja</p></div></div>
          <div className="flex items-start gap-2"><CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" /><div><p className="font-medium">Ponavljanja</p><p className="text-muted-foreground">Dnevno, nedeljno, mesečno</p></div></div>
        </div>
      </CardContent>
    </Card>
    
    {/* Keyboard Shortcuts */}
    <Card>
      <CardHeader className="pb-3"><CardTitle className="text-sm">Prečice na tastaturi</CardTitle></CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2 text-xs">
          <div className="flex items-center justify-between p-2 rounded bg-muted/30"><span className="text-muted-foreground">Novi događaj</span><kbd className="bg-background border rounded px-1.5 py-0.5 text-[10px] font-mono">N</kbd></div>
          <div className="flex items-center justify-between p-2 rounded bg-muted/30"><span className="text-muted-foreground">Sledeći mesec</span><kbd className="bg-background border rounded px-1.5 py-0.5 text-[10px] font-mono">→</kbd></div>
          <div className="flex items-center justify-between p-2 rounded bg-muted/30"><span className="text-muted-foreground">Prethodni mesec</span><kbd className="bg-background border rounded px-1.5 py-0.5 text-[10px] font-mono">←</kbd></div>
          <div className="flex items-center justify-between p-2 rounded bg-muted/30"><span className="text-muted-foreground">Danas</span><kbd className="bg-background border rounded px-1.5 py-0.5 text-[10px] font-mono">T</kbd></div>
        </div>
      </CardContent>
    </Card>
    
    {/* Serbian Holidays Reference */}
    <Card>
      <CardHeader className="pb-3"><CardTitle className="text-sm">Srpski praznici i važni datumi</CardTitle></CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
          {[
            { date: '01-01', name: 'Nova Godina', type: 'Državni praznik' },
            { date: '01-07', name: 'Božić (pravoslavni)', type: 'Verski praznik' },
            { date: '02-15', name: 'Dan državnosti Srbije', type: 'Državni praznik' },
            { date: '03-08', name: 'Dan žena', type: 'Međunarodni' },
            { date: '05-01', name: 'Praznik rada', type: 'Državni praznik' },
            { date: '05-09', name: 'Dan pobede', type: 'Državni praznik' },
            { date: '06-28', name: 'Vidovdan', type: 'Verski praznik' },
            { date: '11-11', name: 'Dan primirja', type: 'Međunarodni' },
          ].map(h => (
            <div key={h.date} className="flex items-center justify-between p-2 rounded hover:bg-muted/50">
              <div className="flex items-center gap-2">
                <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="text-xs font-medium">{h.name}</span>
              </div>
              <Badge variant="outline" className="text-[9px]">{h.date}</Badge>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
    
    {/* Quick Stats */}
    <Card>
      <CardHeader className="pb-3"><CardTitle className="text-sm">Brza statistika</CardTitle></CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Prosečno događaja po mesecu:</span>
            <span className="font-medium">{stats.total > 0 ? Math.round(stats.total / Math.max(Object.keys(events.reduce((acc, e) => {
              const m = e.startTime?.split('-')?.[1] || '01'
              acc[m] = (acc[m] || 0) + 1
              return acc
            }, {} as Record<string, number>)).length, 1)) : 0}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Najzastupljeniji tip:</span>
            <span className="font-medium">{(() => {
              const max = Object.entries(stats.byType).sort(([, a], [, b]) => b - a)[0]
              return max ? `${EVENT_TYPES.find(t => t.value === max[0])?.label || max[0]} (${max[1]})` : '-'
            })()}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Najčešća boja:</span>
            <span className="font-medium">{(() => {
              const max = Object.entries(stats.byColor).sort(([, a], [, b]) => b - a)[0]
              return max ? max[0] : '-'
            })()}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Dogаđaji sa podsetnikom:</span>
            <span className="font-medium">{stats.total > 0 ? `${Math.round(stats.withReminder / stats.total * 100)}%` : '0%'}</span>
          </div>
        </div>
      </CardContent>
    </Card>
    
    {/* Tips & Tricks */}
    <Card>
      <CardHeader className="pb-3"><CardTitle className="text-sm">Saveti za efikasan kalendar</CardTitle></CardHeader>
      <CardContent>
        <div className="space-y-3 text-xs">
          <div className="flex items-start gap-2"><CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" /><div><p className="font-medium">Koristite tipove događaja</p><p className="text-muted-foreground">Sastanci, ročevi, zadaci, podsetnici - svaki tip ima svoju boju i ikonu</p></div></div>
          <div className="flex items-start gap-2"><CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" /><div><p className="font-medium">Postavite podsetnike</p><p className="text-muted-foreground">5 min, 15 min, 1 sat ili 1 dan pre - ne propustite nijedan sastanak</p></div></div>
          <div className="flex items-start gap-2"><CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" /><div><p className="font-medium">Dodajte lokaciju</p><p className="text-muted-foreground">Beležite mesto sastanka za lakše planiranje terenskog rada</p></div></div>
          <div className="flex items-start gap-2"><CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" /><div><p className="font-medium">Navedite učesnike</p><p className="text-muted-foreground">Zapamtite ko je na sastanku - samo unesite imena, zarezom odvojena</p></div></div>
          <div className="flex items-start gap-2"><CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" /><div><p className="font-medium">Koristite prioritet</p><p className="text-muted-foreground">Označite hitne događaje - videće se u listi sa narandžastim badge-om</p></div></div>
          <div className="flex items-start gap-2"><CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" /><div><p className="font-medium">Ponavljanje</p><p className="text-muted-foreground">Dnevni, nedeljni ili mesečni događaji se automatski ponavljaju</p></div></div>
          <div className="flex items-start gap-2"><CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" /><div><p className="font-medium">Boje za organizaciju</p><p className="text-muted-foreground">8 boja za vizuelno razlikovanje - sastanci plavi, ročevi crveni, zadaci zeleni</p></div></div>
        </div>
      </CardContent>
    </Card>
    
    {/* Calendar Views Comparison */}
    <Card>
      <CardHeader className="pb-3"><CardTitle className="text-sm">Prikazi kalendara</CardTitle></CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="p-3 rounded-lg border hover:border-primary/50 transition-colors cursor-pointer" onClick={() => setActiveTab('month')}>
            <div className="flex items-center gap-2 mb-2"><LayoutGrid className="h-4 w-4 text-primary" /><span className="text-sm font-medium">Mesečni prikaz</span></div>
            <p className="text-[11px] text-muted-foreground">Pregled celog meseca sa svim događajima. Kliknite na dan za detalje, kliknite na događaj za uređivanje.</p>
          </div>
          <div className="p-3 rounded-lg border hover:border-primary/50 transition-colors cursor-pointer" onClick={() => setActiveTab('week')}>
            <div className="flex items-center gap-2 mb-2"><Grid3X3 className="h-4 w-4 text-primary" /><span className="text-sm font-medium">Nedeljni prikaz</span></div>
            <p className="text-[11px] text-muted-foreground">Pregled aktuelne nedelje sa detaljnim prikazom svakog dana. Idealno za planiranje sedmice.</p>
          </div>
          <div className="p-3 rounded-lg border hover:border-primary/50 transition-colors cursor-pointer" onClick={() => setActiveTab('list')}>
            <div className="flex items-center gap-2 mb-2"><List className="h-4 w-4 text-primary" /><span className="text-sm font-medium">Lista događaja</span></div>
            <p className="text-[11px] text-muted-foreground">Kronološki prikaz svih događaja sa pretragom i filtriranjem. Brzo pronalaženje i uređivanje.</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

