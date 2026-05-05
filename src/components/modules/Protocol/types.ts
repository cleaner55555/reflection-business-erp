export interface ProtocolEntry {
  id: string
  number: string
  date: string
  direction: string
  sender?: string
  recipient?: string
  subject: string
  description?: string
  documentType?: string
  dueDate?: string
  responsible?: string
  status: string
  priority: string
  notes?: string
  createdAt: string
}

export type FormData = Omit<ProtocolEntry, 'id' | 'number' | 'date' | 'createdAt'>

// ─── Constants ───────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<string, { label: string;
