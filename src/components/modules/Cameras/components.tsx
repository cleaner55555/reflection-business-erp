'use client'import { AlertTriangle, Circle, Download, Eye, FileText, Search, Settings, Trash2, Video, VideoOff, Volume2 } from 'lucide-react'



// ========== OverviewTab ==========

export function OverviewTab({ alerts, recordings }: { alerts: any, recordings: any }) {
  return (
    <TabsContent value="overview" className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KpiCard label="Kamere online" value={stats.online} icon={Video} sub={`${stats.recording} trenutno snima`} color="text-green-500" bg="bg-green-50 dark:bg-green-900/20" />
        <KpiCard label="Snimci danas" value={stats.recordingsToday} icon={FileText} sub={`${recordings.length} ukupno`} color="text-blue-500" bg="bg-blue-50 dark:bg-blue-900/20" />
        <KpiCard label="Zauzeće skladišta" value={`${stats.storagePercent}%`} icon={HardDrive} sub={`${formatFileSize(stats.totalStorage)} od ${formatFileSize(stats.maxStorage)}`} color="text-amber-500" bg="bg-amber-50 dark:bg-amber-900/20" />
        <KpiCard label="Alerti" value={stats.unackAlerts} icon={AlertTriangle} sub={`${stats.criticalAlerts} kritičnih`} color="text-red-500" bg="bg-red-50 dark:bg-red-900/20" />
      </div>
    
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
    
      {/* Camera Grid Preview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {cameras.slice(0, 4).map(cam => (
          <Card key={cam.id} className="overflow-hidden">
            <div className="relative h-32 bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center">
              <Video className="h-8 w-8 text-white/30" />
              <div className="absolute top-2 left-2 flex items-center gap-1">
                <div className={`w-2 h-2 rounded-full ${STATUS_CONFIG[cam.status].dotColor} ${cam.status === 'recording' ? 'animate-pulse' : ''}`} />
                <span className="text-[10px] text-white/80">{STATUS_CONFIG[cam.status].label}</span>
              </div>
              <div className="absolute bottom-2 right-2">
                <span className="text-[10px] text-white/60">{cam.resolution}</span>
              </div>
              {cam.status === 'recording' && (
                <div className="absolute top-2 right-2">
                  <Circle className="h-3 w-3 text-red-500 animate-pulse fill-red-500" />
                </div>
              )}
            </div>
            <CardContent className="p-3">
              <p className="text-sm font-medium truncate">{cam.name}</p>
              <p className="text-xs text-muted-foreground">{cam.location}</p>
              <div className="flex items-center justify-between mt-2">
                <div className="flex items-center gap-2">
                  {cam.nightVision && <Badge variant="outline" className="text-[9px] px-1 py-0">IR</Badge>}
                  {cam.audioEnabled && <Volume2 className="h-3 w-3 text-muted-foreground" />}
                </div>
                <Progress value={(cam.storageUsed / cam.totalStorage) * 100} className="w-12 h-1.5" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    
      {/* Recent Recordings */}
      <Card>
        <CardHeader className="pb-3"><CardTitle className="text-sm flex items-center gap-2"><FileText className="h-4 w-4" /> Poslednji snimci</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-2">
            {recordings.sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime()).slice(0, 5).map(rec => (
              <div key={rec.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className={`p-1.5 rounded ${RECORDING_STATUS_CONFIG[rec.status].color}`}>
                    {rec.status === 'recording' ? <Video className="h-3.5 w-3.5" /> : <FileText className="h-3.5 w-3.5" />}
                  </div>
                  <div>
                    <p className="text-sm font-medium">{rec.cameraName}</p>
                    <p className="text-xs text-muted-foreground">{formatRelativeTime(rec.startDate)} · {formatDuration(rec.duration)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className={`text-[10px] px-1.5 py-0 ${RECORDING_TYPE_CONFIG[rec.type].color}`}>{RECORDING_TYPE_CONFIG[rec.type].label}</Badge>
                  <span className="text-xs text-muted-foreground">{formatFileSize(rec.fileSize)}</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </TabsContent>
  )
}

// ========== CamerasTab ==========

export function CamerasTab({ filterStatus, filterType, filteredCameras, searchQuery, setFilterStatus, setFilterType }: { filterStatus: any, filterType: any, filteredCameras: any, searchQuery: any, setFilterStatus: any, setFilterType: any }) {
  return (
    <TabsContent value="cameras" className="space-y-4">
      <div className="flex items-center gap-2 flex-wrap">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Pretraži kamere..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-9" />
        </div>
        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger className="w-[140px]"><SelectValue placeholder="Tip" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Svi tipovi</SelectItem>
            <SelectItem value="indoor">Interna</SelectItem>
            <SelectItem value="outdoor">Spoljašnja</SelectItem>
            <SelectItem value="parking">Parking</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-[130px]"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Svi statusi</SelectItem>
            <SelectItem value="online">Online</SelectItem>
            <SelectItem value="recording">Snima</SelectItem>
            <SelectItem value="offline">Offline</SelectItem>
          </SelectContent>
        </Select>
      </div>
    
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredCameras.map(cam => (
          <Card key={cam.id} className="overflow-hidden">
            <div className="relative h-36 bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center">
              {cam.status === 'offline' ? (
                <VideoOff className="h-8 w-8 text-white/20" />
              ) : (
                <Video className="h-8 w-8 text-white/30" />
              )}
              <div className="absolute top-2 left-2 flex items-center gap-1.5">
                <div className={`w-2.5 h-2.5 rounded-full ${STATUS_CONFIG[cam.status].dotColor} ${cam.status === 'recording' ? 'animate-pulse' : ''}`} />
                <Badge className={`${STATUS_CONFIG[cam.status].color} text-[10px] px-1.5 py-0`}>{STATUS_CONFIG[cam.status].label}</Badge>
              </div>
              {cam.status === 'recording' && (
                <div className="absolute top-2 right-2 flex items-center gap-1 bg-red-600 text-white text-[10px] px-1.5 py-0.5 rounded">
                  <Circle className="h-2 w-2 fill-white animate-pulse" /> REC
                </div>
              )}
            </div>
            <CardContent className="p-3 space-y-2">
              <div>
                <p className="text-sm font-medium">{cam.name}</p>
                <p className="text-xs text-muted-foreground">{cam.location}</p>
              </div>
              <div className="grid grid-cols-2 gap-1 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Rezolucija</span>
                  <span>{cam.resolution}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">IP</span>
                  <span className="font-mono text-[10px]">{cam.ipAddress}</span>
                </div>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Skladište</span>
                <div className="flex items-center gap-1">
                  <Progress value={(cam.storageUsed / cam.totalStorage) * 100} className="w-16 h-1.5" />
                  <span>{Math.round((cam.storageUsed / cam.totalStorage) * 100)}%</span>
                </div>
              </div>
              <div className="flex items-center gap-1 pt-1">
                <Badge className={`text-[10px] px-1.5 py-0 ${CAMERA_TYPE_CONFIG[cam.type].color}`}>{CAMERA_TYPE_CONFIG[cam.type].label}</Badge>
                {cam.nightVision && <Badge variant="outline" className="text-[10px] px-1.5 py-0">IR</Badge>}
                {cam.audioEnabled && <Badge variant="outline" className="text-[10px] px-1.5 py-0 flex items-center gap-0.5"><Volume2 className="h-2.5 w-2.5" /> Audio</Badge>}
              </div>
              <div className="flex items-center gap-2 pt-1 border-t">
                <Button size="sm" variant="outline" className="h-7 text-xs flex-1" onClick={() => { setSelectedCamera(cam); setCameraDetailOpen(true) }}>
                  <Eye className="h-3 w-3 mr-1" /> Pregled
                </Button>
                <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => openEditCamera(cam)}>
                  Postavke
                </Button>
                <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-red-500 hover:text-red-700" onClick={() => { setSelectedCamera(cam); setDeleteConfirmOpen(true) }}>
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

// ========== RecordingsTab ==========

export function RecordingsTab({ filterRecStatus, filterRecType, filteredRecordings, setFilterRecStatus, setFilterRecType }: { filterRecStatus: any, filterRecType: any, filteredRecordings: any, setFilterRecStatus: any, setFilterRecType: any }) {
  return (
    <TabsContent value="recordings" className="space-y-4">
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-sm font-medium">Evidencija snimaka ({filteredRecordings.length})</span>
        <div className="flex items-center gap-1 ml-auto">
          <Select value={filterRecType} onValueChange={setFilterRecType}>
            <SelectTrigger className="w-[140px] h-8 text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Svi tipovi</SelectItem>
              <SelectItem value="motion">Pokret</SelectItem>
              <SelectItem value="manual">Ručno</SelectItem>
              <SelectItem value="scheduled">Planirano</SelectItem>
              <SelectItem value="continuous">Kontinualno</SelectItem>
            </SelectContent>
          </Select>
          <Select value={filterRecStatus} onValueChange={setFilterRecStatus}>
            <SelectTrigger className="w-[140px] h-8 text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Svi statusi</SelectItem>
              <SelectItem value="recording">Snimanje</SelectItem>
              <SelectItem value="completed">Završeno</SelectItem>
              <SelectItem value="archived">Arhivirano</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    
      <Card>
        <CardContent className="p-0">
          <div className="divide-y">
            {filteredRecordings.map(rec => (
              <div key={rec.id} className="flex items-center justify-between p-4 hover:bg-muted/50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${RECORDING_STATUS_CONFIG[rec.status].color}`}>
                    {rec.status === 'recording' ? <Video className="h-4 w-4" /> : <FileText className="h-4 w-4" />}
                  </div>
                  <div>
                    <p className="text-sm font-medium">{rec.cameraName}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatDate(rec.startDate)} · {formatTime(rec.startDate)} - {formatTime(rec.endDate)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right hidden md:block">
                    <p className="text-xs">{formatDuration(rec.duration)}</p>
                    <p className="text-[10px] text-muted-foreground">{rec.resolution}</p>
                  </div>
                  <Badge className={`text-[10px] px-1.5 py-0 ${RECORDING_TYPE_CONFIG[rec.type].color}`}>
                    {RECORDING_TYPE_CONFIG[rec.type].label}
                  </Badge>
                  <span className="text-xs text-muted-foreground hidden sm:block">{formatFileSize(rec.fileSize)}</span>
                  <Badge className={`text-[10px] px-1.5 py-0 ${RECORDING_STATUS_CONFIG[rec.status].color}`}>
                    {RECORDING_STATUS_CONFIG[rec.status].label}
                  </Badge>
                  {rec.status === 'completed' && (
                    <Button size="sm" variant="ghost" className="h-7 w-7 p-0" title="Preuzmi snimak">
                      <Download className="h-3.5 w-3.5" />
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

// ========== SettingsTab ==========

export function SettingsTab({ cameras }: { cameras: any }) {
  return (
    <TabsContent value="settings" className="space-y-4">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Storage Overview */}
        <Card>
          <CardHeader className="pb-3"><CardTitle className="text-sm flex items-center gap-2"><HardDrive className="h-4 w-4" /> Pregled skladišta</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Ukupno zauzeće</span>
                <span className="font-semibold">{formatFileSize(stats.totalStorage)} / {formatFileSize(stats.maxStorage)}</span>
              </div>
              <Progress value={stats.storagePercent} className="h-3" />
              <p className="text-xs text-muted-foreground mt-1">{stats.storagePercent}% iskorišćenog kapaciteta</p>
            </div>
            <div className="space-y-2 pt-2 border-t">
              <span className="text-xs text-muted-foreground font-medium">Po kamerama</span>
              {cameras.map(cam => (
                <div key={cam.id} className="flex items-center justify-between text-xs">
                  <span className="truncate max-w-[150px]">{cam.name}</span>
                  <div className="flex items-center gap-2">
                    <Progress value={(cam.storageUsed / cam.totalStorage) * 100} className="w-16 h-1.5" />
                    <span className="text-muted-foreground w-20 text-right">{formatFileSize(cam.storageUsed)} / {formatFileSize(cam.totalStorage)}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
    
        {/* Quick Settings */}
        <Card>
          <CardHeader className="pb-3"><CardTitle className="text-sm flex items-center gap-2"><Settings className="h-4 w-4" /> Globalne postavke</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-xs">Standardna rezolucija</Label>
              <Select defaultValue="1920x1080">
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="1280x720">720p (1280x720)</SelectItem>
                  <SelectItem value="1920x1080">1080p (1920x1080)</SelectItem>
                  <SelectItem value="2560x1440">1440p (2560x1440)</SelectItem>
                  <SelectItem value="3840x2160">4K (3840x2160)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs">Podrazumevano zadržavanje snimaka</Label>
              <Select defaultValue="30">
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="7">7 dana</SelectItem>
                  <SelectItem value="14">14 dana</SelectItem>
                  <SelectItem value="30">30 dana</SelectItem>
                  <SelectItem value="60">60 dana</SelectItem>
                  <SelectItem value="90">90 dana</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs">Podrazumevano osetljivost na pokret (%)</Label>
              <div className="flex items-center gap-2 mt-1">
                <Progress value={70} className="flex-1 h-2" />
                <span className="text-sm font-mono w-8 text-right">70%</span>
              </div>
            </div>
            <div className="pt-2 border-t space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Noćni vid (globalno)</span>
                <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 text-xs">Uključen</Badge>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span>Auto-brisanje starih snimaka</span>
                <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 text-xs">Uključen</Badge>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span>Kompresija video zapisa</span>
                <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 text-xs">H.265</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
    
        {/* Alerts Panel */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-3"><CardTitle className="text-sm flex items-center gap-2"><AlertTriangle className="h-4 w-4" /> Upozorenja ({stats.unackAlerts} nepotvrđenih)</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-2">
              {alerts.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).map(alert => {
                const typeCfg = ALERT_TYPE_CONFIG[alert.type] || ALERT_TYPE_CONFIG.motion_detected
                return (
                  <div key={alert.id} className={`flex items-start justify-between p-3 rounded-lg border ${!alert.acknowledged ? 'border-l-4 bg-muted/30' : 'opacity-50'}`} style={{ borderLeftColor: alert.severity === 'critical' ? '#ef4444' : alert.severity === 'warning' ? '#f59e0b' : '#3b82f6' }}>
                    <div className="flex items-start gap-3">
                      <div className={`mt-0.5 p-1.5 rounded ${sevCfg.color}`}>
                        <AlertTriangle className="h-3.5 w-3.5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">{alert.cameraName}</span>
                          <Badge className={`text-[10px] px-1.5 py-0 ${typeCfg.color}`}>{typeCfg.label}</Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">{alert.message}</p>
                        <p className="text-[10px] text-muted-foreground mt-1">{formatRelativeTime(alert.createdAt)}</p>
                      </div>
                    </div>
                    {!alert.acknowledged && (
                      <Button size="sm" variant="outline" className="h-6 text-[10px] flex-shrink-0" onClick={() => handleAcknowledgeAlert(alert.id)}>OK</Button>
                    )}
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </div>
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
import { TabsContent } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'

// ========== EditingCameraIzmenikamer ==========

export function EditingCameraIzmenikamer({ cameraDialogOpen, editingCamera, handleSaveCamera, setCameraDialogOpen }: { cameraDialogOpen: any, editingCamera: any, handleSaveCamera: any, setCameraDialogOpen: any }) {
  return (
    <Dialog open={cameraDialogOpen} onOpenChange={setCameraDialogOpen}>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>{editingCamera ? 'Izmeni kameru' : 'Nova kamera'}</DialogTitle>
                <DialogDescription>{editingCamera ? 'Ažurirajte postavke kamere' : 'Dodajte novu kameru u sistem'}</DialogDescription>
              </DialogHeader>
              <div className="space-y-3 max-h-[60vh] overflow-y-auto">
                <div>
                  <Label className="text-xs">Naziv kamere</Label>
                  <Input value={cameraForm.name} onChange={(e) => setCameraForm({ ...cameraForm, name: e.target.value })} placeholder="npr. Ulaz - glavna vrata" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs">Lokacija</Label>
                    <Input value={cameraForm.location} onChange={(e) => setCameraForm({ ...cameraForm, location: e.target.value })} placeholder="npr. Glavni ulaz" />
                  </div>
                  <div>
                    <Label className="text-xs">Tip</Label>
                    <Select value={cameraForm.type} onValueChange={(v) => setCameraForm({ ...cameraForm, type: v as 'indoor' | 'outdoor' | 'parking' })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="indoor">Interna</SelectItem>
                        <SelectItem value="outdoor">Spoljašnja</SelectItem>
                        <SelectItem value="parking">Parking</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs">IP adresa</Label>
                    <Input value={cameraForm.ipAddress} onChange={(e) => setCameraForm({ ...cameraForm, ipAddress: e.target.value })} placeholder="192.168.1.100" />
                  </div>
                  <div>
                    <Label className="text-xs">Port</Label>
                    <Input type="number" value={cameraForm.port} onChange={(e) => setCameraForm({ ...cameraForm, port: e.target.value })} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs">Rezolucija</Label>
                    <Select value={cameraForm.resolution} onValueChange={(v) => setCameraForm({ ...cameraForm, resolution: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1280x720">720p (1280x720)</SelectItem>
                        <SelectItem value="1920x1080">1080p (1920x1080)</SelectItem>
                        <SelectItem value="2560x1440">1440p (2560x1440)</SelectItem>
                        <SelectItem value="3840x2160">4K (3840x2160)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-xs">Režim snimanja</Label>
                    <Select value={cameraForm.recordingMode} onValueChange={(v) => setCameraForm({ ...cameraForm, recordingMode: v as 'continuous' | 'motion' | 'scheduled' })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="continuous">Kontinualno</SelectItem>
                        <SelectItem value="motion">Po pokretu</SelectItem>
                        <SelectItem value="scheduled">Planirano</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs">Osetljivost na pokret ({cameraForm.sensitivity}%)</Label>
                    <Input type="range" min="10" max="100" value={cameraForm.sensitivity} onChange={(e) => setCameraForm({ ...cameraForm, sensitivity: e.target.value })} className="cursor-pointer" />
                  </div>
                  <div>
                    <Label className="text-xs">Zadržavanje snimaka (dana)</Label>
                    <Input type="number" value={cameraForm.retentionDays} onChange={(e) => setCameraForm({ ...cameraForm, retentionDays: e.target.value })} min="1" max="365" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs">Raspored od</Label>
                    <Input type="time" value={cameraForm.scheduleStart} onChange={(e) => setCameraForm({ ...cameraForm, scheduleStart: e.target.value })} />
                  </div>
                  <div>
                    <Label className="text-xs">Raspored do</Label>
                    <Input type="time" value={cameraForm.scheduleEnd} onChange={(e) => setCameraForm({ ...cameraForm, scheduleEnd: e.target.value })} />
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <label className="flex items-center gap-2 text-sm cursor-pointer">
                    <input type="checkbox" checked={cameraForm.nightVision} onChange={(e) => setCameraForm({ ...cameraForm, nightVision: e.target.checked })} className="rounded" />
                    Noćni vid
                  </label>
                  <label className="flex items-center gap-2 text-sm cursor-pointer">
                    <input type="checkbox" checked={cameraForm.audioEnabled} onChange={(e) => setCameraForm({ ...cameraForm, audioEnabled: e.target.checked })} className="rounded" />
                    Audio
                  </label>
                </div>
                <div>
                  <Label className="text-xs">Napomene</Label>
                  <Textarea value={cameraForm.notes} onChange={(e) => setCameraForm({ ...cameraForm, notes: e.target.value })} placeholder="Opcionalne napomene..." rows={2} />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setCameraDialogOpen(false)}>Otkaži</Button>
                <Button onClick={handleSaveCamera}>{editingCamera ? 'Sačuvaj izmene' : 'Kreiraj kameru'}</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
  )
}


// ========== SelectedCameraname ==========

export function SelectedCameraname({ cameraDetailOpen, selectedCamera, setCameraDetailOpen }: { cameraDetailOpen: any, selectedCamera: any, setCameraDetailOpen: any }) {
  return (
    <Dialog open={cameraDetailOpen} onOpenChange={setCameraDetailOpen}>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>{selectedCamera?.name}</DialogTitle>
                <DialogDescription>Detalji kamere i status</DialogDescription>
              </DialogHeader>
              {selectedCamera && (
                <div className="space-y-4">
                  <div className="relative h-40 bg-gradient-to-br from-slate-800 to-slate-900 rounded-lg flex items-center justify-center">
                    {selectedCamera.status === 'offline' ? (
                      <VideoOff className="h-10 w-10 text-white/20" />
                    ) : (
                      <Video className="h-10 w-10 text-white/30" />
                    )}
                    <div className="absolute top-2 left-2 flex items-center gap-1.5">
                      <div className={`w-2.5 h-2.5 rounded-full ${STATUS_CONFIG[selectedCamera.status].dotColor} ${selectedCamera.status === 'recording' ? 'animate-pulse' : ''}`} />
                      <span className="text-xs text-white/80">{STATUS_CONFIG[selectedCamera.status].label}</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <span className="text-xs text-muted-foreground">Lokacija</span>
                      <p className="font-medium">{selectedCamera.location}</p>
                    </div>
                    <div>
                      <span className="text-xs text-muted-foreground">Tip</span>
                      <p className="font-medium">{CAMERA_TYPE_CONFIG[selectedCamera.type].label}</p>
                    </div>
                    <div>
                      <span className="text-xs text-muted-foreground">Rezolucija</span>
                      <p className="font-medium">{selectedCamera.resolution}</p>
                    </div>
                    <div>
                      <span className="text-xs text-muted-foreground">Režim snimanja</span>
                      <p className="font-medium">{RECORDING_TYPE_CONFIG[selectedCamera.recordingMode].label}</p>
                    </div>
                    <div>
                      <span className="text-xs text-muted-foreground">IP adresa</span>
                      <p className="font-mono">{selectedCamera.ipAddress}:{selectedCamera.port}</p>
                    </div>
                    <div>
                      <span className="text-xs text-muted-foreground">Protocol</span>
                      <p className="font-medium">{selectedCamera.protocol}</p>
                    </div>
                  </div>
                  <div className="border-t pt-3 space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Skladište</span>
                      <div className="flex items-center gap-2">
                        <Progress value={(selectedCamera.storageUsed / selectedCamera.totalStorage) * 100} className="w-20 h-2" />
                        <span>{formatFileSize(selectedCamera.storageUsed)} / {formatFileSize(selectedCamera.totalStorage)}</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Zadržavanje</span>
                      <span>{selectedCamera.retentionDays} dana</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Osetljivost</span>
                      <span>{selectedCamera.sensitivity}%</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Poslednji pokret</span>
                      <span>{selectedCamera.lastMotionAt ? formatRelativeTime(selectedCamera.lastMotionAt) : 'N/A'}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Poslednje snimanje</span>
                      <span>{selectedCamera.lastRecordingAt ? formatRelativeTime(selectedCamera.lastRecordingAt) : 'N/A'}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 pt-2 border-t text-xs">
                    <Badge variant="outline" className={selectedCamera.nightVision ? 'border-green-300 text-green-700 dark:text-green-400' : 'border-muted text-muted-foreground'}>
                      Noćni vid: {selectedCamera.nightVision ? 'Da' : 'Ne'}
                    </Badge>
                    <Badge variant="outline" className={selectedCamera.audioEnabled ? 'border-green-300 text-green-700 dark:text-green-400' : 'border-muted text-muted-foreground'}>
                      Audio: {selectedCamera.audioEnabled ? 'Da' : 'Ne'}
                    </Badge>
                  </div>
                  {selectedCamera.notes && (
                    <div className="border-t pt-3">
                      <span className="text-xs text-muted-foreground">Napomene</span>
                      <p className="text-sm mt-1">{selectedCamera.notes}</p>
                    </div>
                  )}
                </div>
              )}
              <DialogFooter>
                <Button variant="outline" onClick={() => setCameraDetailOpen(false)}>Zatvori</Button>
                <Button onClick={() => { setCameraDetailOpen(false); if (selectedCamera) openEditCamera(selectedCamera) }}>Uredi postavke</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
  )
}


// ========== Brisanjekamere ==========

export function Brisanjekamere({ deleteConfirmOpen, handleDeleteCamera, selectedCamera, setDeleteConfirmOpen }: { deleteConfirmOpen: any, handleDeleteCamera: any, selectedCamera: any, setDeleteConfirmOpen: any }) {
  return (
    <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
            <DialogContent className="max-w-sm">
              <DialogHeader>
                <DialogTitle>Brisanje kamere</DialogTitle>
                <DialogDescription>Da li ste sigurni da želite da obrišete kameru &quot;{selectedCamera?.name}&quot;? Svi snimci će biti zadržani.</DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button variant="outline" onClick={() => setDeleteConfirmOpen(false)}>Otkaži</Button>
                <Button variant="destructive" onClick={handleDeleteCamera}>Obriši</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
  )
}

