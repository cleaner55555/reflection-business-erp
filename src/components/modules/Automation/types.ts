export interface AutomationRule {
  id: string
  name: string
  description: string
  trigger: string
  action: string
  status: 'active' | 'paused' | 'error' | 'draft'
  lastRun: string | null
  nextRun: string | null
  runCount: number
  successCount: number
  errorCount: number
  createdAt: string
  updatedAt: string
}

export interface AutomationLog {
  id: string
  ruleId: string
  ruleName: string
  status: 'success' | 'error' | 'warning'
  message: string
  duration: number
  timestamp: string
}
