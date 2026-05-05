export interface Note {
  id: string
  title: string
  content: string
  categoryId: string
  tags: string[]
  priority: 'nizak' | 'srednji' | 'visok' | 'hitno'
  color: string
  isPinned: boolean
  isFavorite: boolean
  isArchived: boolean
  sharedWith: string[]
  templateId?: string
  createdAt: string
  updatedAt: string
}

export interface Category {
  id: string
  name: string
  color: string
  icon: string
  noteCount: number
}

export interface NoteTemplate {
  id: string
  name: string
  content: string
  categoryId: string
  isDefault: boolean
}

export interface DashboardData {
  totalNotes: number
  totalCategories: number
  pinnedNotes: number
  recentActivity: Array<{ action: string; note: string; time: string }

export interface NoteCardProps {
  note: Note
  getCategoryName: (catId: string) => string
  getCategoryColor: (catId: string) => string
  onEdit: (note: Note) => void
  onTogglePin: (note: Note) => void
  onToggleFavorite: (note: Note) => void
  onToggleArchive: (note: Note) => void
  onDelete: (id: string) => void
  priorityConfig: Record<string, { label: string; color: string; dotColor: string }

export interface NoteListProps {
  notes: Note[]
  getCategoryName: (catId: string) => string
  getCategoryColor: (catId: string) => string
  onEdit: (note: Note) => void
  onTogglePin: (note: Note) => void
  onToggleFavorite: (note: Note) => void
  onToggleArchive: (note: Note) => void
  onDelete: (id: string) => void
  priorityConfig: Record<string, { label: string; color: string; dotColor: string }
