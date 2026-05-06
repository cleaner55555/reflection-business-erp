'use client'import { AlertTriangle, Circle, Clock, Eye, Filter, Hexagon, Map, MapPin, Search, Trash2 } from 'lucide-react'



// ========== OverviewTab ==========

export function OverviewTab({ alerts, employees, geofences }: { alerts: any, employees: any, geofences: any }) {
  return (
    <TabsContent value="overview" className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KpiCard label="Praćeni zaposleni" value={stats.tracked} icon={Users} sub={`${stats.online} trenutno aktivnih`} color="text-blue-500" bg="bg-blue-50 dark:bg-blue-900/20" />
        <KpiCard label="Aktivni sada" value={stats.online} icon={Navigation} sub={`od ${stats.tracked} praćenih`} color="text-green-500" bg="bg-green-50 dark:bg-green-900/20" />
        <KpiCard label="Aktivna ograničenja" value={stats.activeGeofences} icon={Shield} sub={`od ${geofences.length} ukupno`} color="text-purple-500" bg="bg-purple-50 dark:bg-purple-900/20" />
        <KpiCard label="Alerti danas" value={stats.alertsToday} icon={AlertTriangle} sub={`${stats.unackAlerts} nepotvrđenih`} color="text-red-500" bg="bg-red-50 dark:bg-red-900/20" />
      </div>
    
      {/* Critical Alerts Banner */}
      {stats.criticalAlerts > 0 && (
        <div className="rounded-lg border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/10 p-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="h-5 w-5 text-red-500" />
            <span className="font-semibold text-red-700 dark:text-red-400">{stats.criticalAlerts} kritičnih upozorenja</span>
          </div>
          <div className="space-y-1">
            {alerts.filter(a => a.severity === 'critical' && !a.acknowledged).map(alert => (
              <div key={alert.id} className="flex items-center justify-between text-sm text-red-700 dark:text-red-300">
                <span>{alert.message}</span>
                <Button size="sm" variant="outline" className="h-6 text-xs ml-2" onClick={() => handleAcknowledgeAlert(alert.id)}>Potvrdi</Button>
              </div>
            ))}
          </div>
        </div>
      )}
    
      {/* Map Placeholder & Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Map className="h-4 w-4" /> Mapa lokacija
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-lg border-2 border-dashed border-muted-foreground/20 bg-muted/30 h-64 flex flex-col items-center justify-center gap-3">
              <MapPin className="h-10 w-10 text-muted-foreground/40" />
              <p className="text-sm text-muted-foreground">Integracija sa mapom (Google Maps / OpenStreetMap)</p>
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <span className="flex items-center gap-1"><Circle className="h-2 w-2 text-green-500" /> {stats.online} aktivnih</span>
                <span className="flex items-center gap-1"><Circle className="h-2 w-2 text-red-500" /> {stats.tracked - stats.online} offline</span>
                <span className="flex items-center gap-1"><Hexagon className="h-3 w-3 text-purple-500" /> {stats.activeGeofences} zona</span>
              </div>
            </div>
          </CardContent>
        </Card>
    
        <Card>
          <CardHeader className="pb-3"><CardTitle className="text-sm">Statistika</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-muted-foreground">Ukupna distanca danas</span>
                <span className="font-semibold">{stats.totalDistance.toFixed(1)} km</span>
              </div>
              <Progress value={Math.min((stats.totalDistance / 300) * 100, 100)} className="h-2" />
            </div>
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-muted-foreground">Niska baterija</span>
                <span className="font-semibold text-amber-600">{stats.lowBattery} uređaja</span>
              </div>
              <Progress value={stats.lowBattery > 0 ? Math.min((stats.lowBattery / employees.length) * 100 * 5, 100) : 0} className="h-2" />
            </div>
            <div className="space-y-2 pt-2 border-t">
              <span className="text-xs text-muted-foreground font-medium">Po departmanima</span>
              {stats.departments.map(dept => {
                const count = employees.filter(e => e.department === dept && e.isTracked).length
                const online = employees.filter(e => e.department === dept && e.isOnline && e.isTracked).length
                return (
                  <div key={dept} className="flex items-center justify-between text-xs">
                    <span>{dept}</span>
                    <span className="text-muted-foreground">{online}/{count} aktivnih</span>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    
      {/* Recent Locations */}
      <Card>
        <CardHeader className="pb-3"><CardTitle className="text-sm flex items-center gap-2"><Clock className="h-4 w-4" /> Poslednje lokacije</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-3">
            {employees.filter(e => e.isTracked && e.lastLocationName).sort((a, b) => {
              const ta = a.lastLocationAt ? new Date(a.lastLocationAt).getTime() : 0
              const tb = b.lastLocationAt ? new Date(b.lastLocationAt).getTime() : 0
              return tb - ta
            }).slice(0, 5).map(emp => (
              <div key={emp.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full ${emp.isOnline ? 'bg-green-500' : 'bg-gray-400'}`} />
                  <div>
                    <p className="text-sm font-medium">{emp.name}</p>
                    <p className="text-xs text-muted-foreground">{emp.lastLocationName} · {emp.department}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {emp.speed !== null && emp.speed > 0 && (
                    <Badge variant="outline" className="text-[10px] px-1.5 py-0">{emp.speed} km/h</Badge>
                  )}
                  {getBatteryIcon(emp.batteryLevel)}
                  <span className="text-xs text-muted-foreground">{emp.lastLocationAt ? formatRelativeTime(emp.lastLocationAt) : '-'}</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </TabsContent>
  )
}

// ========== EmployeesTab ==========

export function EmployeesTab({ d, filterDept, filterStatus, filteredEmployees, searchQuery, setFilterDept, setFilterStatus }: { d: any, filterDept: any, filterStatus: any, filteredEmployees: any, searchQuery: any, setFilterDept: any, setFilterStatus: any }) {
  return (
    <TabsContent value="employees" className="space-y-4">
      <div className="flex items-center gap-2 flex-wrap">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Pretraži zaposlene..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-9" />
        </div>
        <Select value={filterDept} onValueChange={setFilterDept}>
          <SelectTrigger className="w-[150px]"><SelectValue placeholder="Departman" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Svi departmani</SelectItem>
            {stats.departments.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-[140px]"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Svi statusi</SelectItem>
            <SelectItem value="tracked">Praćeni</SelectItem>
            <SelectItem value="untracked">Nepraćeni</SelectItem>
            <SelectItem value="online">Online</SelectItem>
            <SelectItem value="offline">Offline</SelectItem>
          </SelectContent>
        </Select>
      </div>
    
      <Card>
        <CardContent className="p-0">
          <div className="divide-y">
            {filteredEmployees.map(emp => (
              <div key={emp.id} className="flex items-center justify-between p-4 hover:bg-muted/50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${emp.isOnline && emp.isTracked ? 'bg-green-500' : emp.isTracked ? 'bg-gray-400' : 'bg-slate-300 dark:bg-slate-600'}`} />
                  <div>
                    <p className="text-sm font-medium">{emp.name}</p>
                    <p className="text-xs text-muted-foreground">{emp.position} · {emp.department}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  {emp.isTracked && emp.lastLocationName && (
                    <div className="text-right hidden md:block">
                      <p className="text-xs text-muted-foreground">Lokacija</p>
                      <p className="text-xs">{emp.lastLocationName}</p>
                    </div>
                  )}
                  {emp.isTracked && (
                    <div className="text-right hidden sm:block">
                      <p className="text-xs text-muted-foreground">Distanca</p>
                      <p className="text-xs">{emp.distanceToday} km</p>
                    </div>
                  )}
                  <div className="flex items-center gap-1">
                    {emp.isTracked && getBatteryIcon(emp.batteryLevel)}
                    {emp.isTracked && <span className="text-[10px] text-muted-foreground">{emp.batteryLevel}%</span>}
                  </div>
                  <Badge className={emp.isTracked ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'}>
                    {emp.isTracked ? 'Praćen' : 'Nepraćen'}
                  </Badge>
                  <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => handleToggleTracking(emp.id)}>
                    {emp.isTracked ? 'Pauziraj' : 'Pokreni'}
                  </Button>
                  {emp.isTracked && (
                    <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => { setSelectedEmployee(emp); setEmployeeDetailOpen(true) }}>
                      <Eye className="h-3.5 w-3.5" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </TabsContent>
  )
}

// ========== GeofencesTab ==========

export function GeofencesTab({ geofences }: { geofences: any }) {
  return (
    <TabsContent value="geofences" className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {geofences.map(gf => (
          <Card key={gf.id} className="relative">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: gf.color }} />
                  <CardTitle className="text-sm">{gf.name}</CardTitle>
                </div>
                <Badge className={gf.status === 'active' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'}>
                  {gf.status === 'active' ? 'Aktivno' : 'Neaktivno'}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Tip</span>
                <span className="flex items-center gap-1">
                  {gf.type === 'circle' ? <Circle className="h-3 w-3" /> : <Hexagon className="h-3 w-3" />}
                  {gf.type === 'circle' ? 'Krug' : 'Poligon'}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Koordinate</span>
                <span className="font-mono">{gf.latitude.toFixed(4)}, {gf.longitude.toFixed(4)}</span>
              </div>
              {gf.radius && (
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Radius</span>
                  <span>{gf.radius}m</span>
                </div>
              )}
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Dodeljeno</span>
                <span>{gf.assignedEmployees.length} zaposlenih</span>
              </div>
              {gf.scheduleStart && gf.scheduleEnd && (
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Raspored</span>
                  <span>{gf.scheduleStart} - {gf.scheduleEnd}</span>
                </div>
              )}
              <div className="flex items-center gap-2 pt-2 border-t">
                <Button size="sm" variant="outline" className="h-7 text-xs flex-1" onClick={() => openGeofenceDialog(gf)}>
                  Izmeni
                </Button>
                <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-red-500 hover:text-red-700" onClick={() => { setSelectedGeofence(gf); setDeleteConfirmOpen(true) }}>
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </TabsContent>
  )
}

// ========== ActivitiesTab ==========

export function ActivitiesTab({ alerts, filterEventType, filteredEvents, setFilterEventType }: { alerts: any, filterEventType: any, filteredEvents: any, setFilterEventType: any }) {
  return (
    <TabsContent value="activities" className="space-y-4">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Events Timeline */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-medium">Evidencija aktivnosti</span>
            <div className="flex items-center gap-1 ml-auto">
              <Filter className="h-3.5 w-3.5 text-muted-foreground" />
              <Select value={filterEventType} onValueChange={setFilterEventType}>
                <SelectTrigger className="w-[150px] h-8 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Svi tipovi</SelectItem>
                  <SelectItem value="check_in">Dolazak</SelectItem>
                  <SelectItem value="check_out">Odlazak</SelectItem>
                  <SelectItem value="geofence_enter">Ulazak u zonu</SelectItem>
                  <SelectItem value="geofence_exit">Izlazak iz zone</SelectItem>
                  <SelectItem value="speeding">Prebrza vožnja</SelectItem>
                  <SelectItem value="idle">Neaktivnost</SelectItem>
                  <SelectItem value="offline">Offline</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
    
          <Card>
            <CardContent className="p-0">
              <div className="divide-y">
                {filteredEvents.map(ev => {
                  const cfg = EVENT_TYPE_CONFIG[ev.eventType] || EVENT_TYPE_CONFIG.idle
                  const EventIcon = cfg.icon
                  return (
                    <div key={ev.id} className="flex items-start gap-3 p-4 hover:bg-muted/50 transition-colors">
                      <div className={`mt-0.5 p-1.5 rounded-lg ${cfg.color}`}>
                        <EventIcon className="h-3.5 w-3.5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm font-medium">{ev.employeeName}</span>
                          <Badge className={`text-[10px] px-1.5 py-0 ${cfg.color}`}>{cfg.label}</Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {ev.locationName || ev.address || `${ev.latitude.toFixed(4)}, ${ev.longitude.toFixed(4)}`}
                        </p>
                        {ev.notes && <p className="text-xs text-muted-foreground italic mt-0.5">{ev.notes}</p>}
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-xs font-medium">{formatTime(ev.timestamp)}</p>
                        <p className="text-[10px] text-muted-foreground">{formatRelativeTime(ev.timestamp)}</p>
                        <div className="flex items-center justify-end gap-1 mt-1">
                          {getBatteryIcon(ev.batteryLevel)}
                          <span className="text-[10px] text-muted-foreground">{ev.batteryLevel}%</span>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </div>
    
        {/* Alerts Panel */}
        <div className="space-y-4">
          <span className="text-sm font-medium flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-amber-500" /> Alerti ({alerts.filter(a => !a.acknowledged).length})
          </span>
          <div className="space-y-2">
            {alerts.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).map(alert => {
              const sevCfg = SEVERITY_CONFIG[alert.severity]
              return (
                <Card key={alert.id} className={`p-3 ${!alert.acknowledged ? 'border-l-4' : 'opacity-60'}`} style={{ borderLeftColor: alert.severity === 'critical' ? '#ef4444' : alert.severity === 'warning' ? '#f59e0b' : '#3b82f6' }}>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium">{alert.employeeName}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{alert.message}</p>
                      <p className="text-[10px] text-muted-foreground mt-1">{formatRelativeTime(alert.createdAt)}</p>
                    </div>
                    {!alert.acknowledged && (
                      <Button size="sm" variant="outline" className="h-6 text-[10px] flex-shrink-0" onClick={() => handleAcknowledgeAlert(alert.id)}>
                        OK
                      </Button>
                    )}
                  </div>
                </Card>
              )
            })}
          </div>
        </div>
      </div>
    </TabsContent>
  )
}

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Progress } from '@/components/ui/progress'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { TabsContent } from '@/components/ui/tabs'

// ========== SelectedGeofenceIzmenige ==========

export function SelectedGeofenceIzmenige({ geofenceDialogOpen, handleSaveGeofence, selectedGeofence, setGeofenceDialogOpen }: { geofenceDialogOpen: any, handleSaveGeofence: any, selectedGeofence: any, setGeofenceDialogOpen: any }) {
  return (
    <Dialog open={geofenceDialogOpen} onOpenChange={setGeofenceDialogOpen}>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>{selectedGeofence ? 'Izmeni geo-ograničenje' : 'Novo geo-ograničenje'}</DialogTitle>
                <DialogDescription>{selectedGeofence ? 'Ažurirajte podatke o geo-ograničenju' : 'Definišite novo geo-ograničenje za praćenje'}</DialogDescription>
              </DialogHeader>
              <div className="space-y-3">
                <div>
                  <Label className="text-xs">Naziv</Label>
                  <Input value={geofenceForm.name} onChange={(e) => setGeofenceForm({ ...geofenceForm, name: e.target.value })} placeholder="npr. Sedište firme" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs">Tip</Label>
                    <Select value={geofenceForm.type} onValueChange={(v) => setGeofenceForm({ ...geofenceForm, type: v as 'circle' | 'polygon' })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="circle">Krug</SelectItem>
                        <SelectItem value="polygon">Poligon</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-xs">Status</Label>
                    <Select value={geofenceForm.status} onValueChange={(v) => setGeofenceForm({ ...geofenceForm, status: v as 'active' | 'inactive' })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Aktivno</SelectItem>
                        <SelectItem value="inactive">Neaktivno</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs">Latituda</Label>
                    <Input type="number" step="0.0001" value={geofenceForm.latitude} onChange={(e) => setGeofenceForm({ ...geofenceForm, latitude: e.target.value })} placeholder="44.8176" />
                  </div>
                  <div>
                    <Label className="text-xs">Longituda</Label>
                    <Input type="number" step="0.0001" value={geofenceForm.longitude} onChange={(e) => setGeofenceForm({ ...geofenceForm, longitude: e.target.value })} placeholder="20.4633" />
                  </div>
                </div>
                {geofenceForm.type === 'circle' && (
                  <div>
                    <Label className="text-xs">Radius (metri)</Label>
                    <Input type="number" value={geofenceForm.radius} onChange={(e) => setGeofenceForm({ ...geofenceForm, radius: e.target.value })} placeholder="200" />
                  </div>
                )}
                <div>
                  <Label className="text-xs">Boja</Label>
                  <div className="flex items-center gap-2">
                    <Input type="color" value={geofenceForm.color} onChange={(e) => setGeofenceForm({ ...geofenceForm, color: e.target.value })} className="w-10 h-8 p-0.5 cursor-pointer" />
                    <Input value={geofenceForm.color} onChange={(e) => setGeofenceForm({ ...geofenceForm, color: e.target.value })} className="flex-1" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs">Vreme od</Label>
                    <Input type="time" value={geofenceForm.scheduleStart} onChange={(e) => setGeofenceForm({ ...geofenceForm, scheduleStart: e.target.value })} />
                  </div>
                  <div>
                    <Label className="text-xs">Vreme do</Label>
                    <Input type="time" value={geofenceForm.scheduleEnd} onChange={(e) => setGeofenceForm({ ...geofenceForm, scheduleEnd: e.target.value })} />
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2 text-xs cursor-pointer">
                    <input type="checkbox" checked={geofenceForm.notifyEnter} onChange={(e) => setGeofenceForm({ ...geofenceForm, notifyEnter: e.target.checked })} className="rounded" />
                    Notifikacija ulazak
                  </label>
                  <label className="flex items-center gap-2 text-xs cursor-pointer">
                    <input type="checkbox" checked={geofenceForm.notifyExit} onChange={(e) => setGeofenceForm({ ...geofenceForm, notifyExit: e.target.checked })} className="rounded" />
                    Notifikacija izlazak
                  </label>
                </div>
                <div>
                  <Label className="text-xs">Napomene</Label>
                  <Textarea value={geofenceForm.notes} onChange={(e) => setGeofenceForm({ ...geofenceForm, notes: e.target.value })} placeholder="Opcionalne napomene..." rows={2} />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setGeofenceDialogOpen(false)}>Otkaži</Button>
                <Button onClick={handleSaveGeofence}>{selectedGeofence ? 'Sačuvaj izmene' : 'Kreiraj'}</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
  )
}


// ========== SelectedEmployeename ==========

export function SelectedEmployeename({ employeeDetailOpen, selectedEmployee, setEmployeeDetailOpen }: { employeeDetailOpen: any, selectedEmployee: any, setEmployeeDetailOpen: any }) {
  return (
    <Dialog open={employeeDetailOpen} onOpenChange={setEmployeeDetailOpen}>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>{selectedEmployee?.name}</DialogTitle>
                <DialogDescription>Detalji praćenja zaposlenog</DialogDescription>
              </DialogHeader>
              {selectedEmployee && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <span className="text-xs text-muted-foreground">Pozicija</span>
                      <p className="font-medium">{selectedEmployee.position}</p>
                    </div>
                    <div>
                      <span className="text-xs text-muted-foreground">Departman</span>
                      <p className="font-medium">{selectedEmployee.department}</p>
                    </div>
                    <div>
                      <span className="text-xs text-muted-foreground">Telefon</span>
                      <p className="font-medium">{selectedEmployee.phone}</p>
                    </div>
                    <div>
                      <span className="text-xs text-muted-foreground">Status</span>
                      <div className="flex items-center gap-1 mt-0.5">
                        <div className={`w-2 h-2 rounded-full ${selectedEmployee.isOnline ? 'bg-green-500' : 'bg-gray-400'}`} />
                        <span className="font-medium">{selectedEmployee.isOnline ? 'Online' : 'Offline'}</span>
                      </div>
                    </div>
                  </div>
                  <div className="border-t pt-3 space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Poslednja lokacija</span>
                      <span className="font-medium">{selectedEmployee.lastLocationName || 'N/A'}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Koordinate</span>
                      {selectedEmployee.lastLatitude ? (
                        <span className="font-mono text-xs">{selectedEmployee.lastLatitude.toFixed(4)}, {selectedEmployee.lastLongitude?.toFixed(4)}</span>
                      ) : <span>N/A</span>}
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Vreme ažuriranja</span>
                      <span>{selectedEmployee.lastLocationAt ? formatTime(selectedEmployee.lastLocationAt) : 'N/A'}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Brzina</span>
                      <span>{selectedEmployee.speed !== null ? `${selectedEmployee.speed} km/h` : 'N/A'}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Distanca danas</span>
                      <span>{selectedEmployee.distanceToday} km</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Baterija</span>
                      <div className="flex items-center gap-2">
                        <Progress value={selectedEmployee.batteryLevel} className={`w-20 h-2 ${getBatteryColor(selectedEmployee.batteryLevel)}`} />
                        <span>{selectedEmployee.batteryLevel}%</span>
                      </div>
                    </div>
                  </div>
                  {selectedEmployee.notes && (
                    <div className="border-t pt-3">
                      <span className="text-xs text-muted-foreground">Napomene</span>
                      <p className="text-sm mt-1">{selectedEmployee.notes}</p>
                    </div>
                  )}
                </div>
              )}
              <DialogFooter>
                <Button variant="outline" onClick={() => setEmployeeDetailOpen(false)}>Zatvori</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
  )
}


// ========== Brisanjegeoogranienja ==========

export function Brisanjegeoogranienja({ deleteConfirmOpen, handleDeleteGeofence, selectedGeofence, setDeleteConfirmOpen }: { deleteConfirmOpen: any, handleDeleteGeofence: any, selectedGeofence: any, setDeleteConfirmOpen: any }) {
  return (
    <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
            <DialogContent className="max-w-sm">
              <DialogHeader>
                <DialogTitle>Brisanje geo-ograničenja</DialogTitle>
                <DialogDescription>Da li ste sigurni da želite da obrišete &quot;{selectedGeofence?.name}&quot;? Ova radnja je nepovratna.</DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button variant="outline" onClick={() => setDeleteConfirmOpen(false)}>Otkaži</Button>
                <Button variant="destructive" onClick={handleDeleteGeofence}>Obriši</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
  )
}

