import { FileText, Video, HelpCircle, FolderOpen } from 'lucide-react'

export const STATUS_BADGES: Record<string, string> = {
  aktivno: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  skript: 'bg-amber-50 text-amber-700 border-amber-200',
  arhiviran: 'bg-slate-100 text-slate-500 border-slate-200',
}

export const STATUS_LABELS: Record<string, string> = {
  aktivno: 'Aktivno',
  skript: 'Skript',
  arhiviran: 'Arhiviran',
}

export const LESSON_TYPE_ICONS: Record<string, React.ReactNode> = {
  tekst: <FileText className="h-3.5 w-3.5" />,
  video: <Video className="h-3.5 w-3.5" />,
  test: <HelpCircle className="h-3.5 w-3.5" />,
  dokument: <FolderOpen className="h-3.5 w-3.5" />,
}

export const LESSON_TYPE_LABELS: Record<string, string> = {
  tekst: 'Tekst',
  video: 'Video',
  test: 'Test',
  dokument: 'Dokument',
}

export const LESSON_TYPE_COLORS: Record<string, string> = {
  tekst: 'bg-slate-100 text-slate-600',
  video: 'bg-rose-50 text-rose-600',
  test: 'bg-violet-50 text-violet-600',
  dokument: 'bg-cyan-50 text-cyan-600',
}
