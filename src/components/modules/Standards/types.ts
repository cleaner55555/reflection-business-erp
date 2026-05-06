export interface Finding {
  id: string
  type: 'major' | 'minor' | 'observation'
  description: string
  status: 'open' | 'in_progress' | 'closed'
  deadline: string
}

export interface Standard {
  id: string
  code: string
  name: string
  category: 'iso' | 'ce' | 'haccp' | 'gmp' | 'ohsas' | 'other'
  status: 'active' | 'expiring' | 'expired' | 'in_progress' | 'draft'
  version: string
  issuingBody: string
  scope: string
  validFrom: string
  validUntil: string
  auditor: string
  lastAudit: string | null
  nextAudit: string | null
  compliance: number
  findings: Finding[]
  notes: string
}
