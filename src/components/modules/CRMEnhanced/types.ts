export interface AutomationRule {
  id: string; name: string; trigger: string; condition: string | null
  action: string; actionData: string | null; isActive: boolean
  executedCount: number; lastExecutedAt: string | null; createdAt: string
}
