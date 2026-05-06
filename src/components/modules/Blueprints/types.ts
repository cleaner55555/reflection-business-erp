export interface Blueprint {
  id: string
  name: string
  code: string
  project: string
  category: 'architectural' | 'structural' | 'mechanical' | 'electrical' | 'plumbing' | 'geodetic' | 'interior'
  status: 'draft' | 'review' | 'approved' | 'revision' | 'final' | 'archived'
  version: string
  author: string
  client: string
  scale: string
  sheetSize: string
  fileSize: number
  fileFormat: string
  createdDate: string
  updatedDate: string | null
  approvedBy: string | null
  approvedDate: string | null
  notes: string
  revisions: { version: string; date: string; author: string; description: string }[]
}
