'use client'
import { FolderPlus, Plus, RefreshCw, FileText, FolderOpen, BarChart3, CheckCircle2 } from 'lucide-react'

import { useAppStore } from '@/lib/store'
import { useTranslation } from '@/lib/i18n'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Progress } from '@/components/ui/progress'
import { Skeleton } from '@/components/ui/skeleton'
import { formatDate } from '@/lib/helpers'
import { toast } from 'sonner'

import { AllTab, FoldersTab, OverviewTab, EditingDocIzmenidokument, DialogBlock1, DialogBlock2, DialogBlock3 } from './components'

import { useDocuments } from './hooks'

export function Dokumenta() {
  const {activeTab, c, deleteConfirmOpen, docDetailOpen, docDialogOpen, docs, editingDoc, filterStatus, filterType, filteredDocs, folderDialogOpen, folderDocs, folders, handleCreateFolder, handleDeleteDoc, handleSubmitDoc, k, loading, openNewDoc, searchQuery, selectedDoc, selectedFolder, setActiveTab, setDeleteConfirmOpen, setDocDetailOpen, setDocDialogOpen, setFilterStatus, setFilterType, setFolderDialogOpen, submitting, toastMsg} = useDocuments()
  return (
    <div className="space-y-6">
      {/* Toast */}
      {toastMsg && (
        <div className="fixed top-4 right-4 z-50 animate-in fade-in slide-in-from-right">
          <Alert className="bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800"><AlertDescription>{toastMsg}</AlertDescription></Alert>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dokumenta</h1>
          <p className="text-sm text-muted-foreground">Upravljanje dokumentima, ugovorima i fasciklama</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button size="sm" onClick={() => setFolderDialogOpen(true)}><FolderPlus className="h-4 w-4 mr-1" /> Fascikla</Button>
          <Button size="sm" onClick={openNewDoc}><Plus className="h-4 w-4 mr-1" /> Novi dokument</Button>
          <Button variant="outline" size="sm" onClick={() => { loadDocs() }}><RefreshCw className="h-4 w-4 mr-1" /> Osveži</Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="all"><FileText className="h-4 w-4 mr-1 hidden sm:inline" /> Sva dokumenta</TabsTrigger>
          <TabsTrigger value="folders"><FolderOpen className="h-4 w-4 mr-1 hidden sm:inline" /> Fascikle</TabsTrigger>
          <TabsTrigger value="overview"><BarChart3 className="h-4 w-4 mr-1 hidden sm:inline" /> Pregled</TabsTrigger>
        </TabsList>

        {/* ===== ALL DOCUMENTS ===== */}
        <AllTab filterStatus={filterStatus} filterType={filterType} filteredDocs={filteredDocs} k={k} loading={loading} openNewDoc={openNewDoc} searchQuery={searchQuery} selectedFolder={selectedFolder} setFilterStatus={setFilterStatus} setFilterType={setFilterType} />

        {/* ===== FOLDERS TAB ===== */}
        <FoldersTab folderDocs={folderDocs} folders={folders} />

        {/* ===== OVERVIEW TAB ===== */}
        <OverviewTab  />
      </Tabs>

      {/* ===== DIALOGS ===== */}

      {/* New/Edit Document */}
              <EditingDocIzmenidokument c={c} docDialogOpen={docDialogOpen} editingDoc={editingDoc} folders={folders} handleSubmitDoc={handleSubmitDoc} k={k} setDocDialogOpen={setDocDialogOpen} submitting={submitting} />

      {/* Document Detail */}
              <DialogBlock1 docDetailOpen={docDetailOpen} selectedDoc={selectedDoc} setDocDetailOpen={setDocDetailOpen} />

      {/* Delete Confirmation */}
              <DialogBlock2 deleteConfirmOpen={deleteConfirmOpen} handleDeleteDoc={handleDeleteDoc} selectedDoc={selectedDoc} setDeleteConfirmOpen={setDeleteConfirmOpen} />

      {/* New Folder */}
              <DialogBlock3 folderDialogOpen={folderDialogOpen} handleCreateFolder={handleCreateFolder} setFolderDialogOpen={setFolderDialogOpen} />

      {/* Info */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
            <div className="flex items-start gap-2"><CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" /><div><p className="font-medium">Fascikle</p><p className="text-muted-foreground">Organizujte u kategorije</p></div></div>
            <div className="flex items-start gap-2"><CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" /><div><p className="font-medium">Tagovi</p><p className="text-muted-foreground">Oznake za lakše pretraživanje</p></div></div>
            <div className="flex items-start gap-2"><CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" /><div><p className="font-medium">Rokovi</p><p className="text-muted-foreground">Praćenje isteka dokumenata</p></div></div>
            <div className="flex items-start gap-2"><CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" /><div><p className="font-medium">Pretraga</p><p className="text-muted-foreground">Pretraži po nazivu, tipu, tagu</p></div></div>
          </div>
        </CardContent>
      </Card>

      {/* Storage Statistics */}
      <Card>
        <CardHeader className="pb-3"><CardTitle className="text-sm">Statistika skladišta</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-red-500">{docs.filter(d => d.fileName?.endsWith('.pdf')).length}</p>
              <p className="text-[11px] text-muted-foreground">PDF dokumenti</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-green-500">{docs.filter(d => d.fileName?.match(/\.(xls|xlsx|csv)/)).length}</p>
              <p className="text-[11px] text-muted-foreground">Tabele (Excel/CSV)</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-purple-500">{docs.filter(d => d.fileName?.match(/\.(jpg|jpeg|png|gif)/)).length}</p>
              <p className="text-[11px] text-muted-foreground">Slike i grafika</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-amber-500">{docs.filter(d => !d.fileName).length}</p>
              <p className="text-[11px] text-muted-foreground">Bez datoteke</p>
            </div>
          </div>
          <Separator className="my-4" />
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Ukupno:</span>
              <span className="font-medium">{formatFileSize(docs.reduce((sum, d) => sum + (d.fileSize || 0), 0))}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Prosečna veličina:</span>
              <span className="font-medium">{formatFileSize(Math.round(docs.reduce((s, d) => s + (d.fileSize || 0), 0) / Math.max(docs.length, 1)))}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Tagovano:</span>
              <span className="font-medium">{docs.filter(d => d.tags?.trim()).length} / {docs.length}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Document Type Guide */}
      <Card>
        <CardHeader className="pb-3"><CardTitle className="text-sm">Vodič kroz tipove dokumenata</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {[
              { type: 'faktura', icon: '🧾', desc: 'Računi i fakture za kupce/dobavljače', color: 'bg-green-50 dark:bg-green-900/10' },
              { type: 'ugovor', icon: '📝', desc: 'Poslovni ugovori i sporazumi', color: 'bg-blue-50 dark:bg-blue-900/10' },
              { type: 'ponuda', icon: '📋', desc: 'Komerčalne ponude i predračuni', color: 'bg-amber-50 dark:bg-amber-900/10' },
              { type: 'izvestaj', icon: '📊', desc: 'Poslovni izveštaji i analize', color: 'bg-purple-50 dark:bg-purple-900/10' },
              { type: 'predracun', icon: '💰', desc: 'Predračuni za proveru kupca', color: 'bg-teal-50 dark:bg-teal-900/10' },
              { type: 'otpremnica', icon: '🚚', desc: 'Otpremnice i transportni dokumenti', color: 'bg-orange-50 dark:bg-orange-900/10' },
              { type: 'rešenje', icon: '⚖️', desc: 'Službena rešenja i odluke', color: 'bg-red-50 dark:bg-red-900/10' },
              { type: 'zahtev', icon: '📨', desc: 'Zahtevi, molbe, podnesci', color: 'bg-cyan-50 dark:bg-cyan-900/10' },
            ].map(item => (
              <div key={item.type} className={`flex items-center gap-3 p-3 rounded-lg ${item.color}`}>
                <span className="text-xl">{item.icon}</span>
                <div>
                  <p className="text-sm font-medium">{TYPE_LABELS[item.type]}</p>
                  <p className="text-[11px] text-muted-foreground">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
