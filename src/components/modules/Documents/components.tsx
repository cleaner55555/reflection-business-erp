'use client'

import { AlertTriangle, ChevronRight, Clock, Edit3, File, FileText, Folder, List, Plus, RefreshCw, Search, Trash2, TrendingUp, X, CheckCircle2, Tag } from 'lucide-react'



// ========== AllTab ==========

export function AllTab({ filterStatus, filterType, filteredDocs, k, loading, openNewDoc, searchQuery, selectedFolder, setFilterStatus, setFilterType }: { filterStatus: any, filterType: any, filteredDocs: any, k: any, loading: any, openNewDoc: any, searchQuery: any, selectedFolder: any, setFilterStatus: any, setFilterType: any }) {
  return (
    <TabsContent value="all" className="space-y-4">
      {/* Filters */}
      <Card className="p-3">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Pretraži dokumente..." className="pl-9" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
          </div>
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-[140px]"><SelectValue placeholder="Tip" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Svi tipovi</SelectItem>
              {Object.entries(TYPE_LABELS).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-[140px]"><SelectValue placeholder="Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Svi statusi</SelectItem>
              {Object.entries(STATUS_LABELS).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm" onClick={() => {
            const dir = sortBy === 'date' && sortDir === 'desc' ? 'asc' : 'desc'
            setSortDir(dir as 'asc' | 'desc')
          }}>{sortDir === 'desc' ? <TrendingDown className="h-4 w-4 mr-1" /> : <TrendingUp className="h-4 w-4 mr-1" />} {sortDir === 'desc' ? 'Noviji' : 'Stariji'}</Button>
          <Button variant={viewMode === 'grid' ? 'default' : 'outline'} size="icon" onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}>
            {viewMode === 'grid' ? <List className="h-4 w-4" /> : <Grid3X3 className="h-4 w-4" />}
          </Button>
        </div>
      </Card>
    
      {/* Results count */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {filteredDocs.length} dokumenta
          {selectedFolder && <Badge variant="outline" className="ml-2 text-xs">{folders.find(f => f.id === selectedFolder)?.name}</Badge>}
        </p>
        {selectedFolder && (
          <Button variant="ghost" size="sm" onClick={() => setSelectedFolder(null)}>
            <X className="h-3 w-3 mr-1" /> Ukloni filter
          </Button>
        )}
      </div>
    
      {/* Document List/Grid */}
      {loading ? (
        <div className="space-y-3">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-16 w-full" />)}</div>
      ) : filteredDocs.length === 0 ? (
        <Card className="p-8 text-center">
          <FileText className="h-12 w-12 mx-auto mb-3 text-muted-foreground" />
          <p className="text-muted-foreground">Nema dokumenata</p>
          <Button className="mt-3" onClick={openNewDoc}><Plus className="h-4 w-4 mr-1" /> Dodaj prvi dokument</Button>
        </Card>
      ) : viewMode === 'list' ? (
        <Card>
          <div className="max-h-[600px] overflow-y-auto">
            <table className="w-full">
              <thead className="sticky top-0 bg-muted/50">
                <tr className="text-left text-xs text-muted-foreground border-b">
                  <th className="p-3">Naziv</th>
                  <th className="p-3 hidden md:table-cell">Tip</th>
                  <th className="p-3 hidden lg:table-cell">Kategorija</th>
                  <th className="p-3 hidden md:table-cell">Datum</th>
                  <th className="p-3 hidden lg:table-cell">Rok</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 w-[100px]">Akcije</th>
                </tr>
              </thead>
              <tbody>
                {filteredDocs.map((doc) => {
                  const FileIcon = getFileIcon(doc.fileName)
                  const days = daysUntilExpiry(doc.expiresAt)
                  return (
                    <tr key={doc.id} className="border-b last:border-0 hover:bg-muted/30 cursor-pointer transition-colors" onClick={() => { setSelectedDoc(doc); setDocDetailOpen(true) }}>
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <FileIcon className={`h-4 w-4 shrink-0 ${getFileTypeColor(doc.fileName)}`} />
                          <div className="min-w-0">
                            <p className="text-sm font-medium truncate max-w-[200px]">{doc.title}</p>
                            {doc.fileName && <p className="text-xs text-muted-foreground">{doc.fileName} · {formatFileSize(doc.fileSize || 0)}</p>}
                          </div>
                        </div>
                      </td>
                      <td className="p-3 hidden md:table-cell"><Badge variant="secondary" className="text-xs">{TYPE_LABELS[doc.type || ''] || doc.type || '-'}</Badge></td>
                      <td className="p-3 hidden lg:table-cell text-xs">{doc.category || '-'}</td>
                      <td className="p-3 hidden md:table-cell text-xs text-muted-foreground">{formatDate(doc.createdAt)}</td>
                      <td className="p-3 hidden lg:table-cell">
                        {doc.expiresAt ? (
                          <span className={`text-xs ${days !== null && days <= 7 ? 'text-red-500 font-medium' : days !== null && days <= 30 ? 'text-amber-500' : 'text-muted-foreground'}`}>
                            {formatDate(doc.expiresAt)} {days !== null && days <= 30 && `(${days}d)`}
                          </span>
                        ) : '-'}
                      </td>
                      <td className="p-3">
                        <Badge variant="outline" className={`text-xs ${STATUS_COLORS[doc.status] || ''}`}>{STATUS_LABELS[doc.status] || doc.status}</Badge>
                      </td>
                      <td className="p-3">
                        <div className="flex gap-1">
                          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={(e) => { e.stopPropagation(); openEditDoc(doc) }}><Edit3 className="h-3.5 w-3.5" /></Button>
                          <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={(e) => { e.stopPropagation(); setSelectedDoc(doc); setDeleteConfirmOpen(true) }}><Trash2 className="h-3.5 w-3.5" /></Button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredDocs.map((doc) => {
            const FileIcon = getFileIcon(doc.fileName)
            const days = daysUntilExpiry(doc.expiresAt)
            return (
              <Card key={doc.id} className="cursor-pointer hover:shadow-md transition-shadow group" onClick={() => { setSelectedDoc(doc); setDocDetailOpen(true) }}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-3 mb-3">
                    <div className={`h-10 w-10 rounded-lg bg-muted/50 flex items-center justify-center shrink-0 ${getFileTypeColor(doc.fileName)}`}>
                      <FileIcon className="h-5 w-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium truncate">{doc.title}</p>
                      <Badge variant="secondary" className="text-xs mt-1">{TYPE_LABELS[doc.type || ''] || doc.type || '-'}</Badge>
                    </div>
                  </div>
                  {doc.category && <p className="text-xs text-muted-foreground mb-1"><TagIcon className="h-3 w-3 inline mr-1" />{doc.category}</p>}
                  {doc.fileName && <p className="text-xs text-muted-foreground mb-1"><File className="h-3 w-3 inline mr-1" />{doc.fileName} · {formatFileSize(doc.fileSize || 0)}</p>}
                  <div className="flex items-center justify-between mt-2">
                    <Badge variant="outline" className={`text-xs ${STATUS_COLORS[doc.status] || ''}`}>{STATUS_LABELS[doc.status] || doc.status}</Badge>
                    <span className="text-xs text-muted-foreground">{formatDate(doc.createdAt)}</span>
                  </div>
                  {doc.expiresAt && days !== null && days <= 30 && (
                    <div className={`mt-2 text-xs px-2 py-1 rounded ${days <= 7 ? 'bg-red-50 text-red-600 dark:bg-red-900/20' : 'bg-amber-50 text-amber-600 dark:bg-amber-900/20'}`}>
                      <AlertTriangle className="h-3 w-3 inline mr-1" /> Ističe za {days} dana
                    </div>
                  )}
                  <div className="flex gap-1 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button size="icon" variant="ghost" className="h-7 w-7" onClick={(e) => { e.stopPropagation(); openEditDoc(doc) }}><Edit3 className="h-3.5 w-3.5" /></Button>
                    <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive" onClick={(e) => { e.stopPropagation(); setSelectedDoc(doc); setDeleteConfirmOpen(true) }}><Trash2 className="h-3.5 w-3.5" /></Button>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </TabsContent>
  )
}

// ========== FoldersTab ==========

export function FoldersTab({ folderDocs, folders }: { folderDocs: any, folders: any }) {
  return (
    <TabsContent value="folders" className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {folders.map(folder => {
          const folderDocs = docs.filter(d => d.category === folder.name || d.folder === folder.name)
          return (
            <Card key={folder.id} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => { setSelectedFolder(folder.id); setActiveTab('all') }}>
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="h-10 w-10 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: `${folder.color}20` }}>
                    <Folder className="h-5 w-5" style={{ color: folder.color }} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium">{folder.name}</p>
                    <p className="text-xs text-muted-foreground mt-1">{folderDocs.length} dokumenta</p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </TabsContent>
  )
}

// ========== OverviewTab ==========

export function OverviewTab({  }: {  }) {
  return (
    <TabsContent value="overview" className="space-y-4">
      {!stats ? (
        <div className="flex justify-center py-20"><RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" /></div>
      ) : (
        <>
          {/* KPIs */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Kpi label="Ukupno dokumenata" value={stats.total} icon={FileText} sub={`${stats.active} aktivnih`} color="text-blue-500" />
            <Kpi label="Nacrti" value={stats.drafts} icon={Edit3} color="text-yellow-500" />
            <Kpi label="Na potpisivanju" value={stats.needsSign} icon={FileUp} color="text-orange-500" />
            <Kpi label="Ukupna veličina" value={formatFileSize(stats.totalSize)} icon={HardDrive} color="text-purple-500" />
          </div>
    
          {/* Expiring Documents Alert */}
          {stats.expiring.length > 0 && (
            <Card className="border-amber-200 dark:border-amber-800">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2 text-amber-600">
                  <AlertTriangle className="h-4 w-4" /> Dokumenti koji ističu (30 dana)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {stats.expiring.map(d => (
                    <div key={d.id} className="flex items-center justify-between p-2 rounded hover:bg-amber-50 dark:hover:bg-amber-900/10 cursor-pointer" onClick={() => { setSelectedDoc(d); setDocDetailOpen(true) }}>
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-amber-500" />
                        <span className="text-sm">{d.title}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs text-amber-600">
                          <Clock className="h-3 w-3 mr-1" /> {d.daysLeft} dana
                        </Badge>
                        <span className="text-xs text-muted-foreground">{formatDate(d.expiresAt!)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
    
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Category Breakdown */}
            <Card>
              <CardHeader className="pb-3"><CardTitle className="text-sm">Po kategorijama</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {Object.entries(stats.categoryMap).sort(([, a], [, b]) => b - a).map(([cat, count]) => {
                    const max = Math.max(...Object.values(stats.categoryMap), 1)
                    return (
                      <div key={cat} className="flex items-center gap-3">
                        <span className="text-xs w-28 truncate">{cat}</span>
                        <div className="flex-1 bg-muted rounded-full h-3"><div className="bg-primary h-3 rounded-full transition-all" style={{ width: `${Math.round((count / max) * 100)}%` }} /></div>
                        <span className="text-xs font-mono w-6 text-right">{count}</span>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
    
            {/* Type Breakdown */}
            <Card>
              <CardHeader className="pb-3"><CardTitle className="text-sm">Po tipovima</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {Object.entries(stats.typeMap).sort(([, a], [, b]) => b - a).map(([type, count]) => (
                    <div key={type} className="flex items-center justify-between p-2 rounded hover:bg-muted/50">
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="text-xs">{TYPE_LABELS[type] || type}</Badge>
                      </div>
                      <span className="text-sm font-medium">{count}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
    
            {/* Status Breakdown */}
            <Card>
              <CardHeader className="pb-3"><CardTitle className="text-sm">Po statusima</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {Object.entries(STATUS_LABELS).map(([status, label]) => {
                    const count = docs.filter(d => d.status === status).length
                    if (count === 0) return null
                    return (
                      <div key={status} className="flex items-center gap-3">
                        <Badge variant="outline" className={`text-xs w-32 justify-center ${STATUS_COLORS[status] || ''}`}>{label}</Badge>
                        <div className="flex-1 bg-muted rounded-full h-3"><div className="bg-primary h-3 rounded-full" style={{ width: `${Math.round((count / Math.max(stats.total, 1)) * 100)}%` }} /></div>
                        <span className="text-xs font-mono w-6 text-right">{count}</span>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
    
            {/* Recent Documents */}
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm">Nedavno dodati</CardTitle>
                  <Button variant="ghost" size="sm" onClick={() => setActiveTab('all')}>Prikaži sve <ChevronRight className="h-4 w-4 ml-1" /></Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {stats.recent.map(doc => {
                    const FileIcon = getFileIcon(doc.fileName)
                    return (
                      <div key={doc.id} className="flex items-center justify-between p-2 rounded hover:bg-muted/50 cursor-pointer" onClick={() => { setSelectedDoc(doc); setDocDetailOpen(true) }}>
                        <div className="flex items-center gap-2">
                          <FileIcon className={`h-4 w-4 ${getFileTypeColor(doc.fileName)}`} />
                          <span className="text-sm truncate max-w-[200px]">{doc.title}</span>
                        </div>
                        <span className="text-xs text-muted-foreground">{formatDate(doc.createdAt)}</span>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
    
          {/* Activity by Month */}
          {Object.keys(stats.monthMap).length > 0 && (
            <Card>
              <CardHeader className="pb-3"><CardTitle className="text-sm">Aktivnost po mesecima</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {Object.entries(stats.monthMap).sort().slice(-6).map(([month, count]) => {
                    const max = Math.max(...Object.values(stats.monthMap) as number[], 1)
                    return (
                      <div key={month} className="flex items-center gap-3">
                        <span className="text-xs w-20 text-muted-foreground">{month}</span>
                        <div className="flex-1 bg-muted rounded-full h-4"><div className="bg-primary h-4 rounded-full" style={{ width: `${Math.round((count / max) * 100)}%` }} /></div>
                        <span className="text-xs font-mono w-6 text-right">{count as number}</span>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </TabsContent>
  )
}

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { TabsContent } from '@/components/ui/tabs'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Textarea } from '@/components/ui/textarea'


