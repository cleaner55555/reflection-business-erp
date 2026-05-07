export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  data?: MessageData
  actionType?: string
  module?: string

}
export interface MessageData {
  columns?: Array<{ key: string; label: string }>

}
export interface APIResponse {
  reply?: string
  actionType?: string
  module?: string
  data?: MessageData
  error?: string
}
