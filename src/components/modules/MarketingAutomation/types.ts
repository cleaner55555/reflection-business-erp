export interface MarketingWorkflow {
  id: string
  name: string
  trigger: string
  actions: string[]
  status: string
  executionCount: number
  lastExecuted?: string
  createdAt: string
}
