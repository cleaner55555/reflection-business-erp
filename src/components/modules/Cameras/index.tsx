'use client'

import { useAppStore } from '@/lib/store'
import { useTranslation } from '@/lib/i18n'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Progress } from '@/components/ui/progress'
import { formatDate } from '@/lib/helpers'
import { toast } from 'sonner'
import {
import { useCameras } from './hooks'

export function Kamere() {
  const {activeTab, alerts, cameraDetailOpen, cameraDialogOpen, cameras, deleteConfirmOpen, editingCamera, filterRecStatus, filterRecType, filterStatus, filterType, filteredCameras, filteredRecordings, handleDeleteCamera, handleSaveCamera, loadData, openNewCamera, recordings, searchQuery, selectedCamera, setActiveTab, setCameraDetailOpen, setCameraDialogOpen, setDeleteConfirmOpen, setFilterRecStatus, setFilterRecType, setFilterStatus, setFilterType} = useCameras()
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Camera className="h-6 w-6 text-primary" /> Video nadzor
          </h1>
          <p className="text-sm text-muted-foreground">Kamere, snimci, postavke i praćenje aktivnosti</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button size="sm" onClick={openNewCamera}><Plus className="h-4 w-4 mr-1" /> Nova kamera</Button>
          <Button variant="outline" size="sm" onClick={loadData}><RefreshCw className="h-4 w-4 mr-1" /> Osveži</Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="flex-wrap h-auto gap-1">
          <TabsTrigger value="overview"><BarChart3 className="h-3.5 w-3.5 mr-1" /> Pregled</TabsTrigger>
          <TabsTrigger value="cameras"><Video className="h-3.5 w-3.5 mr-1" /> Kamere</TabsTrigger>
          <TabsTrigger value="recordings"><FileText className="h-3.5 w-3.5 mr-1" /> Snimci</TabsTrigger>
          <TabsTrigger value="settings"><Settings className="h-3.5 w-3.5 mr-1" /> Postavke</TabsTrigger>
        </TabsList>

        {/* ===== PREGLED ===== */}
        <OverviewTab alerts={alerts} recordings={recordings} />

        {/* ===== KAMERE ===== */}
        <CamerasTab filterStatus={filterStatus} filterType={filterType} filteredCameras={filteredCameras} searchQuery={searchQuery} setFilterStatus={setFilterStatus} setFilterType={setFilterType} />

        {/* ===== SNIMCI ===== */}
        <RecordingsTab filterRecStatus={filterRecStatus} filterRecType={filterRecType} filteredRecordings={filteredRecordings} setFilterRecStatus={setFilterRecStatus} setFilterRecType={setFilterRecType} />

        {/* ===== POSTAVKE ===== */}
        <SettingsTab cameras={cameras} />
      </Tabs>

      {/* Camera Dialog (New/Edit) */}
              <EditingCameraIzmenikamer cameraDialogOpen={cameraDialogOpen} editingCamera={editingCamera} handleSaveCamera={handleSaveCamera} setCameraDialogOpen={setCameraDialogOpen} />

      {/* Camera Detail Dialog */}
              <SelectedCameraname cameraDetailOpen={cameraDetailOpen} selectedCamera={selectedCamera} setCameraDetailOpen={setCameraDetailOpen} />

      {/* Delete Confirm Dialog */}
              <Brisanjekamere deleteConfirmOpen={deleteConfirmOpen} handleDeleteCamera={handleDeleteCamera} selectedCamera={selectedCamera} setDeleteConfirmOpen={setDeleteConfirmOpen} />
    </div>
  )
}
