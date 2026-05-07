// ============ AI Business Team Types ============

export type AgentId =
  | 'orchestrator'
  | 'sales'
  | 'finance'
  | 'warehouse'
  | 'marketing'
  | 'hr'
  | 'projects'
  | 'crm'
  | 'operations'

export interface AIAgent {
  id: AgentId
  name: string
  role: string
  description: string
  icon: string // Lucide icon name
  color: string // Tailwind color class for bg
  textColor: string // Tailwind color class for text
  borderColor: string // Tailwind color class for border
  specialties: string[]
  modules: string[] // Module IDs this agent controls
  quickActions: string[]
  greeting: string
  systemPrompt: string
}

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  data?: MessageData
  actionType?: string
  module?: string
  agentId?: AgentId
}

export interface MessageData {
  columns?: Array<{ key: string; label: string }>
  rows?: Array<Record<string, unknown>>
  chartData?: Array<Record<string, unknown>>
  chartType?: 'bar' | 'line' | 'pie' | 'area'
  chartConfig?: Record<string, { label: string; color: string }>
  summaryValue?: string | number
  summaryLabel?: string
  kpis?: Array<{ label: string; value: string; trend?: string }>
  module?: string
  actionLabel?: string
  actionType?: 'navigate' | 'created' | 'updated'
}

export interface TeamViewMode {
  type: 'hub' | 'chat'
  selectedAgent: AgentId | null
}
