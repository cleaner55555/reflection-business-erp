'use client'

import { Badge } from '@/components/ui/badge'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
'use client'

import { Archive, Edit3, Eye, Pin, PinOff, Star, Tag, Trash2 } from 'lucide-react'
import type { Note, Category, NoteTemplate, DashboardData, NoteCardProps, NoteListProps } from './types'

function NoteCard({ note, getCategoryName, getCategoryColor, onEdit, onTogglePin, onToggleFavorite, onToggleArchive, onDelete, priorityConfig }: NoteCardProps) {
  const priCfg = priorityConfig[note.priority] || priorityConfig.srednji
  const catColor = getCategoryColor(note.categoryId)

  return (
    <Card className="overflow-hidden transition-all hover:shadow-md" style={{ backgroundColor: note.color }}>
      <div className="h-1" style={{ backgroundColor: catColor }} />
      <CardHeader className="pb-2 pt-3">
        <div className="flex items-start justify-between">
          <CardTitle className="text-sm font-medium line-clamp-1 flex-1">{note.title}</CardTitle>
          <div className="flex items-center gap-1 ml-2">
            {note.isPinned && <Pin className="h-3.5 w-3.5 text-amber-500" />}
            <Badge variant="outline" className={`text-[10px] ${priCfg.color}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${priCfg.dotColor} mr-1`} />
              {priCfg.label}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-2 pb-3">
        <p className="text-xs text-muted-foreground line-clamp-3 whitespace-pre-line">{note.content}</p>
        <div className="flex flex-wrap gap-1">
          {note.tags.slice(0, 3).map((tag) => (
            <Badge key={tag} variant="secondary" className="text-[10px]">#{tag}</Badge>
          ))}
          {note.tags.length > 3 && <Badge variant="secondary" className="text-[10px]">+{note.tags.length - 3}</Badge>}
        </div>
        <Separator />
        <div className="flex items-center justify-between">
          <span className="text-[10px] text-muted-foreground">{getCategoryName(note.categoryId)}</span>
          <div className="flex gap-0.5">
            <button className="p-1 rounded hover:bg-black/5" onClick={() => onToggleFavorite(note)}>
              <Star className={`h-3.5 w-3.5 ${note.isFavorite ? 'text-amber-500 fill-amber-500' : 'text-gray-400'}`} />
            </button>
            <button className="p-1 rounded hover:bg-black/5" onClick={() => onTogglePin(note)}>
              {note.isPinned ? <PinOff className="h-3.5 w-3.5 text-gray-500" /> : <Pin className="h-3.5 w-3.5 text-gray-400" />}
            </button>
            <button className="p-1 rounded hover:bg-black/5" onClick={() => onEdit(note)}>
              <Eye className="h-3.5 w-3.5 text-gray-400" />
            </button>
            <button className="p-1 rounded hover:bg-black/5" onClick={() => onToggleArchive(note)}>
              <Archive className="h-3.5 w-3.5 text-gray-400" />
            </button>
            <button className="p-1 rounded hover:bg-red-50" onClick={() => onDelete(note.id)}>
              <Trash2 className="h-3.5 w-3.5 text-red-400" />
            </button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function NoteList({ notes, getCategoryName, getCategoryColor, onEdit, onTogglePin, onToggleFavorite, onToggleArchive, onDelete, priorityConfig }: NoteListProps) {
  return (
    <div className="rounded-lg border overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-muted/50">
          <tr className="text-left text-xs text-muted-foreground">
            <th className="p-3">Naslov</th>
            <th className="p-3 hidden md:table-cell">Kategorija</th>
            <th className="p-3 hidden md:table-cell">Prioritet</th>
            <th className="p-3 hidden lg:table-cell">Tagovi</th>
            <th className="p-3">Akcije</th>
          </tr>
        </thead>
        <tbody>
          {notes.map((note) => {
            const priCfg = priorityConfig[note.priority] || priorityConfig.srednji
            return (
              <tr key={note.id} className="border-t hover:bg-muted/30">
                <td className="p-3">
                  <div className="flex items-center gap-2">
                    {note.isPinned && <Pin className="h-3 w-3 text-amber-500 shrink-0" />}
                    <div>
                      <p className="font-medium text-sm line-clamp-1">{note.title}</p>
                      <p className="text-xs text-muted-foreground md:hidden">{getCategoryName(note.categoryId)}</p>
                    </div>
                  </div>
                </td>
                <td className="p-3 hidden md:table-cell">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: getCategoryColor(note.categoryId) }} />
                    <span className="text-xs">{getCategoryName(note.categoryId)}</span>
                  </div>
                </td>
                <td className="p-3 hidden md:table-cell">
                  <Badge variant="outline" className={`text-[10px] ${priCfg.color}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${priCfg.dotColor} mr-1`} />
                    {priCfg.label}
                  </Badge>
                </td>
                <td className="p-3 hidden lg:table-cell">
                  <div className="flex flex-wrap gap-1">
                    {note.tags.slice(0, 2).map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-[10px]">#{tag}</Badge>
                    ))}
                    {note.tags.length > 2 && <span className="text-[10px] text-muted-foreground">+{note.tags.length - 2}</span>}
                  </div>
                </td>
                <td className="p-3">
                  <div className="flex gap-1">
                    <button className="p-1 rounded hover:bg-black/5" onClick={() => onToggleFavorite(note)}>
                      <Star className={`h-3.5 w-3.5 ${note.isFavorite ? 'text-amber-500 fill-amber-500' : 'text-gray-400'}`} />
                    </button>
                    <button className="p-1 rounded hover:bg-black/5" onClick={() => onEdit(note)}>
                      <Edit3 className="h-3.5 w-3.5 text-gray-400" />
                    </button>
                    <button className="p-1 rounded hover:bg-red-50" onClick={() => onDelete(note.id)}>
                      <Trash2 className="h-3.5 w-3.5 text-red-400" />
                    </button>
                  </div>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
