// ─── File Utilities ───────────────────────────────────────────────────────────

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B'
  const units = ['B', 'KB', 'MB', 'GB']
  const k = 1024
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  const size = bytes / Math.pow(k, i)
  return `${size.toFixed(i === 0 ? 0 : 1)} ${units[i]}`
}

export function getFileTypeCategory(mimeType: string): 'image' | 'document' | 'spreadsheet' | 'archive' | 'video' | 'other' {
  if (mimeType.startsWith('image/')) return 'image'
  if (mimeType.startsWith('video/')) return 'video'
  if (mimeType === 'application/pdf') return 'document'
  if (['application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'].includes(mimeType)) return 'document'
  if (['application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'text/csv'].includes(mimeType)) return 'spreadsheet'
  if (['application/zip', 'application/x-rar-compressed', 'application/x-7z-compressed', 'application/gzip'].includes(mimeType)) return 'archive'
  return 'other'
}

export function getFileTypeIcon(category: string): string {
  const icons: Record<string, string> = {
    image: 'Image',
    document: 'FileText',
    spreadsheet: 'Table2',
    archive: 'Archive',
    video: 'Video',
    other: 'File',
  }
  return icons[category] || 'File'
}

export const ALLOWED_MIME_TYPES = new Set([
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'text/csv',
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'image/svg+xml',
  'application/zip',
  'application/gzip',
  'video/mp4',
])

export const MAX_FILE_SIZE = 50 * 1024 * 1024 // 50MB

export function sanitizeFileName(name: string): string {
  // Remove path traversal
  const sanitized = name.replace(/[/\\]/g, '_')
  // Remove null bytes
  return sanitized.replace(/\0/g, '').substring(0, 255)
}

export function getExtension(mimeType: string): string {
  const map: Record<string, string> = {
    'application/pdf': '.pdf',
    'application/msword': '.doc',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': '.docx',
    'application/vnd.ms-excel': '.xls',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': '.xlsx',
    'text/csv': '.csv',
    'image/jpeg': '.jpg',
    'image/png': '.png',
    'image/gif': '.gif',
    'image/webp': '.webp',
    'image/svg+xml': '.svg',
    'application/zip': '.zip',
    'application/gzip': '.gz',
    'video/mp4': '.mp4',
  }
  return map[mimeType] || ''
}
